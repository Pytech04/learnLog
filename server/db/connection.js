import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnlog',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
});

/**
 * Initialize the database: create DB, tables, and seed data.
 * Uses a separate connection (without database selected) to run CREATE DATABASE.
 */
export async function initializeDatabase() {
  const initConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = await readFile(schemaPath, 'utf-8');
    await initConnection.query(schema);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    await initConnection.end();
  }
}

export default pool;
