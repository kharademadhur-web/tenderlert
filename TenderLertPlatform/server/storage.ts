// Database Storage - javascript_database blueprint
import { 
  users, clients, tenders, emailLogs, contactSubmissions,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Tender, type InsertTender,
  type EmailLog, type InsertEmailLog,
  type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  getAllClients(): Promise<(Client & { user: User | null })[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClientCategory(clientId: number, category: string): Promise<Client | undefined>;
  
  // Tenders
  getTender(id: number): Promise<Tender | undefined>;
  getAllTenders(): Promise<Tender[]>;
  getTodaysTenders(): Promise<Tender[]>;
  getTendersByCategory(category: string): Promise<Tender[]>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTenderCategory(tenderId: number, category: string): Promise<Tender | undefined>;
  getTendersWithoutCategory(): Promise<Tender[]>;
  
  // Email Logs
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  
  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client || undefined;
  }

  async getAllClients(): Promise<(Client & { user: User | null })[]> {
    const result = await db
      .select()
      .from(clients)
      .leftJoin(users, eq(clients.userId, users.id));
    
    return result.map(row => ({
      ...row.clients,
      user: row.users
    }));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClientCategory(clientId: number, category: string): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({ categoryInterested: category })
      .where(eq(clients.id, clientId))
      .returning();
    return client || undefined;
  }

  // Tenders
  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender || undefined;
  }

  async getAllTenders(): Promise<Tender[]> {
    return db.select().from(tenders).orderBy(sql`${tenders.createdAt} DESC`);
  }

  async getTodaysTenders(): Promise<Tender[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return db
      .select()
      .from(tenders)
      .where(gte(tenders.bidEndDate, today))
      .orderBy(sql`${tenders.bidEndDate} ASC`);
  }

  async getTendersByCategory(category: string): Promise<Tender[]> {
    return db.select().from(tenders).where(eq(tenders.aiCategory, category));
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const [tender] = await db.insert(tenders).values(insertTender).returning();
    return tender;
  }

  async updateTenderCategory(tenderId: number, category: string): Promise<Tender | undefined> {
    const [tender] = await db
      .update(tenders)
      .set({ aiCategory: category })
      .where(eq(tenders.id, tenderId))
      .returning();
    return tender || undefined;
  }

  async getTendersWithoutCategory(): Promise<Tender[]> {
    return db.select().from(tenders).where(sql`${tenders.aiCategory} IS NULL`);
  }

  // Email Logs
  async createEmailLog(insertLog: InsertEmailLog): Promise<EmailLog> {
    const [log] = await db.insert(emailLogs).values(insertLog).returning();
    return log;
  }

  // Contact Submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contact] = await db.insert(contactSubmissions).values(submission).returning();
    return contact;
  }
}

export const storage = new DatabaseStorage();
