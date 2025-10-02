import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client, schema });

/**
 * Kör en callback med user context satt för RLS-policies
 * Säkerställer att endast användarens egna data är tillgänglig
 */
export async function withUserContext<T>(
  userId: number,
  callback: (db: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_user_id = ${userId}`);
    return callback(tx);
  });
}
