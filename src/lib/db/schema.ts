import {integer, pgEnum, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core'

// role - either system (chat GPT) or user
export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user', 'assistant'])

// storing chats 
export const chats = pgTable('chats',{
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userID: varchar('user_id', {length:256}).notNull(),
    fileKey: text('file_key').notNull(), //maps resource to s3 bucket 
})

export type DrizzleChat = typeof chats.$inferSelect;

//storing messages
export const messages = pgTable('messages',{
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(() => chats.id), // foreign key
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    role: userSystemEnum('role').notNull()
})

// Table for strip subscription 
export const userSubscriptions = pgTable("user_subscriptions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
      .notNull()
      .unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 256,
    }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 256 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_ended_at"),
  });


