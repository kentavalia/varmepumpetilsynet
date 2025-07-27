import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  date,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // bcrypt hashed
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("customer"), // customer, installer, admin
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer service requests (no login required)
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  postalCode: varchar("postal_code").notNull(),
  city: varchar("city").notNull(),
  county: varchar("county").notNull(),
  municipality: varchar("municipality").notNull(),
  heatPumpBrand: varchar("heat_pump_brand"),
  heatPumpModel: varchar("heat_pump_model"),
  serviceType: varchar("service_type"),
  description: text("description"),
  preferredContactTime: varchar("preferred_contact_time"),
  status: varchar("status").default("open"), // open, contacted, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer-specific information (for logged-in users if needed later)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  postalCode: varchar("postal_code").notNull(),
  city: varchar("city").notNull(),
  county: varchar("county").notNull(),
  municipality: varchar("municipality").notNull(),
  subscriptionActive: boolean("subscription_active").default(true), // Free for all
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Heat pump information
export const heatPumps = pgTable("heat_pumps", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  model: varchar("model").notNull(),
  brand: varchar("brand").notNull(),
  lastServiceDate: date("last_service_date"),
  nextServiceDue: date("next_service_due"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Installer/company information
export const installers = pgTable("installers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name").notNull(),
  orgNumber: varchar("org_number").notNull(),
  contactPerson: varchar("contact_person").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address"),
  postalCode: varchar("postal_code"),
  city: varchar("city"),
  county: varchar("county"),
  municipality: varchar("municipality"),
  website: text("website"),
  certified: boolean("certified").default(false),
  approved: boolean("approved").default(false),
  active: boolean("active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalServices: integer("total_services").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service areas for installers
export const serviceAreas = pgTable("service_areas", {
  id: serial("id").primaryKey(),
  installerId: integer("installer_id").references(() => installers.id).notNull(),
  county: varchar("county").notNull(),
  municipality: varchar("municipality").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service request - installer interactions
export const serviceRequestContacts = pgTable("service_request_contacts", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id).notNull(),
  installerId: integer("installer_id").references(() => installers.id).notNull(),
  contactedAt: timestamp("contacted_at").defaultNow(),
  status: varchar("status").notNull().default("interested"), // interested, contacted, quoted, accepted, completed
  notes: text("notes"),
  quoteAmount: decimal("quote_amount", { precision: 10, scale: 2 }),
});

// Customer-installer interactions (for logged-in customers)
export const customerInstallerContacts = pgTable("customer_installer_contacts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  installerId: integer("installer_id").references(() => installers.id).notNull(),
  contactedAt: timestamp("contacted_at").defaultNow(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, completed
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
  installer: one(installers, {
    fields: [users.id],
    references: [installers.userId],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ many }) => ({
  installerContacts: many(serviceRequestContacts),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  heatPumps: many(heatPumps),
  contacts: many(customerInstallerContacts),
}));

export const heatPumpsRelations = relations(heatPumps, ({ one }) => ({
  customer: one(customers, {
    fields: [heatPumps.customerId],
    references: [customers.id],
  }),
}));

export const installersRelations = relations(installers, ({ one, many }) => ({
  user: one(users, {
    fields: [installers.userId],
    references: [users.id],
  }),
  serviceAreas: many(serviceAreas),
  contacts: many(customerInstallerContacts),
  serviceRequestContacts: many(serviceRequestContacts),
}));

export const serviceAreasRelations = relations(serviceAreas, ({ one }) => ({
  installer: one(installers, {
    fields: [serviceAreas.installerId],
    references: [installers.id],
  }),
}));

export const serviceRequestContactsRelations = relations(
  serviceRequestContacts,
  ({ one }) => ({
    serviceRequest: one(serviceRequests, {
      fields: [serviceRequestContacts.serviceRequestId],
      references: [serviceRequests.id],
    }),
    installer: one(installers, {
      fields: [serviceRequestContacts.installerId],
      references: [installers.id],
    }),
  }),
);

export const customerInstallerContactsRelations = relations(
  customerInstallerContacts,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerInstallerContacts.customerId],
      references: [customers.id],
    }),
    installer: one(installers, {
      fields: [customerInstallerContacts.installerId],
      references: [installers.id],
    }),
  }),
);

// Zod schemas
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeatPumpSchema = createInsertSchema(heatPumps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstallerSchema = createInsertSchema(installers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceAreaSchema = createInsertSchema(serviceAreas).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(customerInstallerContacts).omit({
  id: true,
  contactedAt: true,
});

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type HeatPump = typeof heatPumps.$inferSelect;
export type InsertHeatPump = z.infer<typeof insertHeatPumpSchema>;
export type Installer = typeof installers.$inferSelect;
export type InsertInstaller = z.infer<typeof insertInstallerSchema>;
export type ServiceArea = typeof serviceAreas.$inferSelect;
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;
export type ServiceRequestContact = typeof serviceRequestContacts.$inferSelect;
export type CustomerInstallerContact = typeof customerInstallerContacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Postal codes table
export const postalCodes = pgTable("postal_codes", {
  id: serial("id").primaryKey(),
  postalCode: text("postal_code").notNull().unique(),
  postPlace: text("post_place").notNull(),
  municipality: text("municipality").notNull(),
  county: text("county").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostalCodeSchema = createInsertSchema(postalCodes).omit({
  id: true,
  createdAt: true,
});

export type PostalCode = typeof postalCodes.$inferSelect;
export type InsertPostalCode = z.infer<typeof insertPostalCodeSchema>;
