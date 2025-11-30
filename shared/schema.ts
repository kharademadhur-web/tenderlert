import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication (clients and admins)
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  password: text("password"), // Nullable for OAuth
  name: text("name").notNull(),
  role: text("role").notNull().default("client"), // 'client' or 'admin'
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients table - extended profile for registered clients
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  companyName: text("company_name").notNull(),
  phone: text("phone").notNull(),
  categoryInterested: text("category_interested").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenders table - stores all tender information
export const tenders = pgTable("tenders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  portalName: text("portal_name").notNull(), // GeM, eProcure, MahaTenders
  bidNumber: text("bid_number").notNull(),
  title: text("title").notNull(),
  quantity: text("quantity"),
  department: text("department"),
  stateLocation: text("state_location"),
  itemCategory: text("item_category"),
  bidType: text("bid_type"),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  bidStartDate: timestamp("bid_start_date"),
  bidEndDate: timestamp("bid_end_date"),
  deliveryLocation: text("delivery_location"),
  emdAmount: decimal("emd_amount", { precision: 15, scale: 2 }),
  minAnnualTurnover: decimal("min_annual_turnover", { precision: 15, scale: 2 }),
  sourceUrl: text("source_url"),
  aiCategory: text("ai_category"), // AI-classified category
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email logs table - tracks sent emails
export const emailLogs = pgTable("email_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id").references(() => clients.id),
  tenderId: integer("tender_id").references(() => tenders.id),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Contact submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  emailLogs: many(emailLogs),
}));

export const tendersRelations = relations(tenders, ({ many }) => ({
  emailLogs: many(emailLogs),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  client: one(clients, {
    fields: [emailLogs.clientId],
    references: [clients.id],
  }),
  tender: one(tenders, {
    fields: [emailLogs.tenderId],
    references: [tenders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  createdAt: true,
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  createdAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  sentAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  createdAt: true,
});

// Extended schemas for validation
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyName: z.string().min(2, "Company name is required"),
  categoryInterested: z.string().min(1, "Please select a category"),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Category constants
export const TENDER_CATEGORIES = [
  "Construction / Civil",
  "IT / Software / Networking",
  "Medical / Healthcare",
  "Electrical / Electronics",
  "Machinery / Industrial",
  "Transport / Automotive",
  "Security / Defence",
  "Housekeeping / Manpower",
  "Agriculture / Rural Development",
  "Miscellaneous",
] as const;

export const PORTALS = ["GeM", "eProcure", "MahaTenders"] as const;
