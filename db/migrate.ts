import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env file:", e);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing in environment variables");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log("Starting Neon database schema migration...");

  try {
    // 1. Ensure users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        credits INTEGER DEFAULT 1000 NOT NULL
      );
    `;
    console.log("✓ users table ready");

    // 2. Ensure repositories table
    await sql`
      CREATE TABLE IF NOT EXISTS repositories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        repo_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        private INTEGER NOT NULL,
        html_url TEXT NOT NULL,
        description TEXT,
        language TEXT,
        default_branch TEXT,
        owner TEXT NOT NULL,
        base_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Ensure all columns exist on repositories if already created
    await sql`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS language TEXT;`;
    await sql`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS default_branch TEXT;`;
    await sql`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS base_url TEXT;`;
    await sql`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW() NOT NULL;`;
    console.log("✓ repositories table & columns ready");

    // 3. Ensure test_cases table
    await sql`
      CREATE TABLE IF NOT EXISTS test_cases (
        id SERIAL PRIMARY KEY,
        repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'UI' NOT NULL,
        target_url TEXT,
        steps TEXT,
        script TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ test_cases table ready");

    // 4. Ensure test_runs table
    await sql`
      CREATE TABLE IF NOT EXISTS test_runs (
        id SERIAL PRIMARY KEY,
        repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        test_case_id INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        duration INTEGER,
        logs TEXT,
        screenshot_url TEXT,
        browserbase_session_id TEXT,
        live_url TEXT,
        error_message TEXT,
        executed_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ test_runs table ready");

    console.log("Database schema successfully synchronized!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
