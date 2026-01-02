import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export const dbRun = async (text: string, params?: any[]): Promise<void> => {
  await query(text, params);
};

export const dbGet = async (text: string, params?: any[]): Promise<any> => {
  const result = await query(text, params);
  return result.rows[0];
};

export const dbAll = async (text: string, params?: any[]): Promise<any[]> => {
  const result = await query(text, params);
  return result.rows;
};

export async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS warranties (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        model VARCHAR(255),
        serial_number VARCHAR(255),
        purchase_date DATE NOT NULL,
        warranty_duration INTEGER DEFAULT 36,
        expiry_date DATE NOT NULL,
        category VARCHAR(100),
        store VARCHAR(255),
        price NUMERIC(10, 2),
        receipt_image TEXT,
        product_image TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL PRIMARY KEY,
        warranty_id INTEGER NOT NULL,
        from_user_id INTEGER NOT NULL,
        to_user_email VARCHAR(255) NOT NULL,
        to_user_id INTEGER,
        transfer_code VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (warranty_id) REFERENCES warranties(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        warranty_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (warranty_id) REFERENCES warranties(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error;
  }
}

export { pool };
