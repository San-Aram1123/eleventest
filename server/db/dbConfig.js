import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let dbStatus = {
  configured: false,
  connected: false,
  error: null,
  database: process.env.DB_NAME || 'kurdish_tts_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  sampleCount: 0
};

/**
 * Returns database config from environment variables.
 */
export function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kurdish_tts_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    charset: 'utf8mb4',
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    maxIdle: 10,
    idleTimeout: 60000
  };
}

/**
 * Checks if MySQL database is active and connected.
 */
export function isDbConnected() {
  return dbStatus.connected && pool !== null;
}

/**
 * Returns active database connection pool.
 */
export function getDbPool() {
  return pool;
}

/**
 * Sets or updates the active connection pool.
 */
export function setDbPool(newPool) {
  pool = newPool;
}

/**
 * Returns current database connection and health status.
 */
export function getDbStatus() {
  return { ...dbStatus };
}

/**
 * Updates properties on the dbStatus object.
 */
export function updateDbStatus(patch) {
  Object.assign(dbStatus, patch);
}

/**
 * Tests a custom or current connection configuration.
 */
export async function testDbConnection(config = null) {
  const cfg = config || getDbConfig();
  const testConn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    connectTimeout: 5000
  });
  await testConn.query('SELECT 1');
  await testConn.end();
  return true;
}
