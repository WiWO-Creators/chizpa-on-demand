import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  humanCode: text("human_code").notNull(),
  serviceId: text("service_id").notNull(),
  projectIdea: text("project_idea").notNull(),
  customerEmail: text("customer_email").notNull(),
  briefJson: text("brief_json").notNull(),
  scopeSnapshotJson: text("scope_snapshot_json").notNull(),
  chizpaScore: integer("chizpa_score").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  briefStatus: text("brief_status").notNull().default("submitted"),
  workStatus: text("work_status").notNull().default("blocked"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  slaStartedAt: text("sla_started_at"),
  dueAt: text("due_at"),
  deliveredAt: text("delivered_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("orders_human_code_unique").on(table.humanCode),
  uniqueIndex("orders_stripe_session_unique").on(table.stripeSessionId),
  index("orders_customer_email_idx").on(table.customerEmail),
  index("orders_work_status_idx").on(table.workStatus),
  index("orders_due_at_idx").on(table.dueAt),
]);

export const orderEvents = sqliteTable("order_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("order_events_order_idx").on(table.orderId, table.createdAt)]);

export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  objectId: text("object_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("stripe_events_semantic_unique").on(table.eventType, table.objectId)]);

export const outboxEvents = sqliteTable("outbox_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id),
  type: text("type").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("outbox_pending_idx").on(table.status, table.createdAt)]);

export const orderFiles = sqliteTable("order_files", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  objectKey: text("object_key").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: text("status").notNull().default("scan_pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("order_files_object_key_unique").on(table.objectKey),
  index("order_files_order_idx").on(table.orderId),
]);
