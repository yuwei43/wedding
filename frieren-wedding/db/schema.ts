import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const rsvps = sqliteTable('rsvps', {
  id: text('id').primaryKey(), credentialHash: text('credential_hash').notNull().unique(),
  name: text('name').notNull(), phone: text('phone').notNull(), guests: integer('guests').notNull(),
  needsStay: integer('needs_stay').notNull().default(0), stayGuests: integer('stay_guests').notNull().default(0),
  checkIn: text('check_in'), checkOut: text('check_out'), notes: text('notes').notNull().default(''),
  status: text('status').notNull().default('none'), consentAt: text('consent_at').notNull(),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, table => [index('idx_rsvps_stay_date').on(table.needsStay, table.checkIn)]);
export const rateLimits = sqliteTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull() }, table => [index('idx_rate_expiry').on(table.expiresAt)]);
