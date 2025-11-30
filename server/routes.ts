import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import {
  signupSchema,
  loginSchema,
  registerClientSchema,
  contactFormSchema,
  TENDER_CATEGORIES
} from "@shared/schema";
import { generateToken, requireAuth, requireAdmin, type AuthenticatedRequest } from "./middleware/auth";
import { categorizeTender, categorizeMultipleTenders } from "./services/aiCategorizer";
import { sendToN8nRegisterWebhook, sendToN8nContactWebhook } from "./services/webhooks";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== AUTH ROUTES ====================

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "client",
      });

      res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Please login with Google" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ==================== CLIENT ROUTES ====================

  // Register client (creates user + client profile)
  app.post("/api/clients/register", async (req, res) => {
    try {
      const data = registerClientSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create user with default password (they'll need to set it via login/signup flow)
      const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      const user = await storage.createUser({
        email: data.email,
        password: tempPassword,
        name: data.name,
        role: "client",
      });

      // Create client profile
      const client = await storage.createClient({
        userId: user.id,
        companyName: data.companyName,
        phone: data.phone,
        categoryInterested: data.categoryInterested,
      });

      // Send to n8n webhook
      await sendToN8nRegisterWebhook({
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        categoryInterested: data.categoryInterested,
      });

      res.status(201).json({
        message: "Registration successful. Check your email for next steps.",
        clientId: client.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Client registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Get current client profile
  app.get("/api/clients/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const client = await storage.getClientByUserId(req.user!.id);
      // Return null if no client profile (user signed up but didn't complete registration)
      res.json(client || null);
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update client preferences
  app.patch("/api/clients/preferences", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { categoryInterested } = req.body;

      if (!categoryInterested || !TENDER_CATEGORIES.includes(categoryInterested)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const client = await storage.getClientByUserId(req.user!.id);
      if (!client) {
        return res.status(404).json({ error: "Client profile not found" });
      }

      const updated = await storage.updateClientCategory(client.id, categoryInterested);
      res.json(updated);
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // ==================== TENDER ROUTES ====================

  // Get today's tenders
  app.get("/api/tenders/today", async (req, res) => {
    try {
      const tenders = await storage.getTodaysTenders();
      res.json(tenders);
    } catch (error) {
      console.error("Get tenders error:", error);
      res.status(500).json({ error: "Failed to fetch tenders" });
    }
  });

  // Add manual tender (admin only)
  app.post("/api/tenders/manual", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { portalName, bidNumber, title, department, stateLocation, itemCategory, estimatedValue, bidEndDate, sourceUrl } = req.body;

      if (!portalName || !bidNumber || !title) {
        return res.status(400).json({ error: "Portal, bid number, and title are required" });
      }

      // AI categorize the tender
      const aiCategory = await categorizeTender(title, department, itemCategory);

      const tender = await storage.createTender({
        portalName,
        bidNumber,
        title,
        department: department || null,
        stateLocation: stateLocation || null,
        itemCategory: itemCategory || null,
        estimatedValue: estimatedValue || null,
        bidEndDate: bidEndDate ? new Date(bidEndDate) : null,
        sourceUrl: sourceUrl || null,
        aiCategory,
        quantity: null,
        bidType: null,
        bidStartDate: null,
        deliveryLocation: null,
        emdAmount: null,
        minAnnualTurnover: null,
      });

      res.status(201).json(tender);
    } catch (error) {
      console.error("Add tender error:", error);
      res.status(500).json({ error: "Failed to add tender" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Get all clients
  app.get("/api/admin/clients", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Get all tenders
  app.get("/api/admin/tenders", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tenders = await storage.getAllTenders();
      res.json(tenders);
    } catch (error) {
      console.error("Get tenders error:", error);
      res.status(500).json({ error: "Failed to fetch tenders" });
    }
  });

  // Re-run categorization for uncategorized tenders
  app.post("/api/admin/rerun-today", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const uncategorized = await storage.getTendersWithoutCategory();

      if (uncategorized.length === 0) {
        return res.json({ message: "No uncategorized tenders found", processed: 0 });
      }

      const categorizations = await categorizeMultipleTenders(
        uncategorized.map(t => ({
          id: t.id,
          title: t.title,
          department: t.department,
          itemCategory: t.itemCategory,
        }))
      );

      for (const [tenderId, category] of categorizations) {
        await storage.updateTenderCategory(tenderId, category);
      }

      res.json({
        message: "Categorization complete",
        processed: categorizations.size,
      });
    } catch (error) {
      console.error("Rerun categorization error:", error);
      res.status(500).json({ error: "Failed to rerun categorization" });
    }
  });

  // Send alerts (placeholder - would integrate with email service)
  app.post("/api/admin/send-alerts", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const clients = await storage.getAllClients();
      const tenders = await storage.getTodaysTenders();

      let alertsSent = 0;

      for (const client of clients) {
        if (!client.user?.email) continue;

        const matchingTenders = tenders.filter(
          t => t.aiCategory === client.categoryInterested
        );

        if (matchingTenders.length > 0) {
          // Log email (actual sending would require email service integration)
          for (const tender of matchingTenders) {
            await storage.createEmailLog({
              clientId: client.id,
              tenderId: tender.id,
            });
          }
          alertsSent++;
          console.log(`Would send ${matchingTenders.length} tenders to ${client.user.email}`);
        }
      }

      res.json({
        message: "Alert job completed",
        clientsNotified: alertsSent,
        totalClients: clients.length,
      });
    } catch (error) {
      console.error("Send alerts error:", error);
      res.status(500).json({ error: "Failed to send alerts" });
    }
  });

  // ==================== CONTACT ROUTES ====================

  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactFormSchema.parse(req.body);

      // Save to database
      await storage.createContactSubmission({
        name: data.name,
        email: data.email,
        message: data.message,
      });

      // Send to n8n webhook
      await sendToN8nContactWebhook(data);

      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ==================== AI CATEGORIZATION ENDPOINT ====================

  app.post("/api/categorize", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, department, itemCategory } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const category = await categorizeTender(title, department, itemCategory);
      res.json({ category });
    } catch (error) {
      console.error("Categorization error:", error);
      res.status(500).json({ error: "Failed to categorize" });
    }
  });

  return httpServer;
}
