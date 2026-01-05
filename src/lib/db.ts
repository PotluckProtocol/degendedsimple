import { Pool } from 'pg';

// Fallback for types if @types/pg is not picked up
// @ts-ignore
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

/**
 * Initialize database tables
 */
export async function initDb() {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS market_events (
      id SERIAL PRIMARY KEY,
      market_id INTEGER NOT NULL,
      user_address TEXT NOT NULL,
      event_type TEXT NOT NULL, -- 'purchase', 'win', 'refund'
      amount NUMERIC NOT NULL,
      is_option_a BOOLEAN,
      tx_hash TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_address ON market_events(user_address);
    CREATE INDEX IF NOT EXISTS idx_market_id ON market_events(market_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tx_event ON market_events(tx_hash, event_type, user_address);
  `;

  try {
    await query(createTablesQuery);
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

export default pool;

