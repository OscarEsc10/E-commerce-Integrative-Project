/**
 * Database connection setup for PostgreSQL using pg Pool.
 * - Reads connection string from config.js
 * - Exports a pool instance for queries
 * - Provides a testConnection function to verify connectivity
 */
import pg from 'pg';
import  { DB_URL }  from './config.js';

const { Pool } = pg;

// Create a new connection pool using the provided URL
export const pool = new Pool({ connectionString: DB_URL
 });

/**
 * Test the database connection by running a simple query.
 * Prints success or error message to the console.
 */
export async function testConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Successful connection to the database');
  } catch (error) {
    console.error('❌ Error connecting to the database:', error.message);
  }
}

// Run connection test on module load
testConnection()