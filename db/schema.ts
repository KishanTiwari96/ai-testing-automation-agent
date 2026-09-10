import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits: integer("credits").default(1000).notNull(),
});

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  repoId: integer("repo_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  private: integer("private").notNull(),
  htmlUrl: text("html_url").notNull(),
  description: text("description"),
  language: text("language"),
  defaultBranch: text("default_branch"),
  owner: text("owner").notNull(),
  baseUrl: text("base_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("UI").notNull(), // UI, Auth, Navigation, Form, E2E, API
  targetUrl: text("target_url"),
  steps: text("steps"), // JSON stringified array of step strings
  script: text("script").notNull(), // Playwright code
  status: text("status").default("pending").notNull(), // pending, passed, failed, running
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  testCaseId: integer("test_case_id").references(() => testCases.id, { onDelete: 'cascade' }).notNull(),
  status: text("status").notNull(), // passed, failed, running
  duration: integer("duration"), // in ms
  logs: text("logs"), // JSON stringified array of log entries
  screenshotUrl: text("screenshot_url"),
  browserbaseSessionId: text("browserbase_session_id"),
  liveUrl: text("live_url"),
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type TestCase = typeof testCases.$inferSelect;
export type NewTestCase = typeof testCases.$inferInsert;
export type TestRun = typeof testRuns.$inferSelect;
export type NewTestRun = typeof testRuns.$inferInsert;
