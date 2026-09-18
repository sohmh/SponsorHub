import {
  boolean,
  date,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  displayId: varchar("displayId", { length: 32 }).notNull().unique(),
  companyName: varchar("companyName", { length: 160 }).notNull(),
  website: varchar("website", { length: 255 }),
  sponsorType: varchar("sponsorType", { length: 64 }),
  industry: varchar("industry", { length: 96 }),
  cityRegion: varchar("cityRegion", { length: 120 }),
  primaryEvent: varchar("primaryEvent", { length: 160 }),
  potentialFit: text("potentialFit"),
  priority: mysqlEnum("priority", ["High", "Medium", "Low"]).default("Medium").notNull(),
  pipelineStatus: mysqlEnum("pipelineStatus", ["Lead", "Contacted", "Meeting", "Proposal", "Confirmed", "Not a fit"]).default("Lead").notNull(),
  ownerId: int("ownerId"),
  lastContactDate: date("lastContactDate"),
  nextFollowupDate: date("nextFollowupDate"),
  daysUntilFollowup: int("daysUntilFollowup"),
  bestContactMethod: varchar("bestContactMethod", { length: 64 }),
  estimatedValue: decimal("estimatedValue", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 8 }).default("INR").notNull(),
  likelySupportType: varchar("likelySupportType", { length: 64 }),
  whatTheyCouldOffer: text("whatTheyCouldOffer"),
  currentResponse: text("currentResponse"),
  proposalSent: boolean("proposalSent").default(false).notNull(),
  meetingDate: date("meetingDate"),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  sponsorId: int("sponsorId").notNull(),
  companyName: varchar("companyName", { length: 160 }),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  roleDepartment: varchar("roleDepartment", { length: 120 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  linkedinUrl: varchar("linkedinUrl", { length: 255 }),
  preferredContactMethod: varchar("preferredContactMethod", { length: 64 }),
  referralSource: varchar("referralSource", { length: 160 }),
  isDecisionMaker: boolean("isDecisionMaker").default(false).notNull(),
  contactStatus: varchar("contactStatus", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contactLog = mysqlTable("contactLog", {
  id: int("id").autoincrement().primaryKey(),
  sponsorId: int("sponsorId").notNull(),
  companyName: varchar("companyName", { length: 160 }),
  contactName: varchar("contactName", { length: 160 }),
  logDate: date("logDate").notNull(),
  contactMethod: varchar("contactMethod", { length: 64 }),
  teamMember: int("teamMember"),
  interactionSummary: text("interactionSummary"),
  responseResult: varchar("responseResult", { length: 160 }),
  followupRequired: boolean("followupRequired").default(false).notNull(),
  nextFollowupDate: date("nextFollowupDate"),
  followupAction: text("followupAction"),
  followupCompleted: boolean("followupCompleted").default(false).notNull(),
  attachmentUrl: varchar("attachmentUrl", { length: 512 }),
  loggedBy: int("loggedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const offersAgreements = mysqlTable("offersAgreements", {
  id: int("id").autoincrement().primaryKey(),
  sponsorId: int("sponsorId").notNull(),
  companyName: varchar("companyName", { length: 160 }),
  eventInitiative: varchar("eventInitiative", { length: 160 }),
  offerType: varchar("offerType", { length: 64 }),
  offerDescription: text("offerDescription"),
  cashValue: decimal("cashValue", { precision: 12, scale: 2 }).default("0"),
  inKindValue: decimal("inKindValue", { precision: 12, scale: 2 }).default("0"),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }).default("0"),
  offerDate: date("offerDate"),
  decisionStatus: varchar("decisionStatus", { length: 64 }),
  agreementStatus: varchar("agreementStatus", { length: 64 }),
  agreementLink: varchar("agreementLink", { length: 512 }),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }),
  invoiceDate: date("invoiceDate"),
  paymentStatus: varchar("paymentStatus", { length: 64 }),
  amountReceived: decimal("amountReceived", { precision: 12, scale: 2 }).default("0"),
  paymentDate: date("paymentDate"),
  deliverablesPromised: text("deliverablesPromised"),
  clubDeliverables: text("clubDeliverables"),
  activationDeadline: date("activationDeadline"),
  ownerId: int("ownerId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type ContactLog = typeof contactLog.$inferSelect;
export type InsertContactLog = typeof contactLog.$inferInsert;
export type OfferAgreement = typeof offersAgreements.$inferSelect;
export type InsertOfferAgreement = typeof offersAgreements.$inferInsert;
