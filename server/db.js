import mysql from 'mysql2/promise';
import {
  getDbConfig,
  setDbPool,
  updateDbStatus,
  isDbConnected,
  getDbPool,
  getDbStatus,
  testDbConnection
} from './db/dbConfig.js';
import { initDatabaseSchema } from './db/dbSchema.js';
import { migrateDiskSamplesToDb } from './db/dbSampleRepository.js';
import { migrateApiKeysToDb } from './db/dbApiKeys.js';

// Re-exports
export {
  getDbConfig,
  isDbConnected,
  getDbPool,
  getDbStatus,
  testDbConnection
} from './db/dbConfig.js';
export { normalizeKurdishTextForComparison } from './db/dbTextNormalizer.js';
export {
  syncApiKeysToDb,
  getDbApiKeys,
  deleteDbApiKey,
  migrateApiKeysToDb
} from './db/dbApiKeys.js';
export {
  parseDbRowToSample,
  getAllDbSamples,
  getDbSample,
  saveDbSample,
  updateDbSampleMetadata,
  deleteDbSample,
  deleteDbSamples,
  getNextDbSampleId,
  findDbSampleByNormalizedText,
  migrateDiskSamplesToDb
} from './db/dbSampleRepository.js';

/**
 * Initializes the MySQL database, creates tables, and migrates existing files.
 */
export async function initDatabase() {
  const cfg = getDbConfig();
  updateDbStatus({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    configured: true
  });

  try {
    const adminConn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      connectTimeout: 5000
    });

    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci`
    );
    await adminConn.end();

    const pool = mysql.createPool({
      ...cfg,
      database: cfg.database
    });
    setDbPool(pool);

    await initDatabaseSchema(pool);
    updateDbStatus({ connected: true, error: null });

    await migrateDiskSamplesToDb();
    await migrateApiKeysToDb();

    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM samples');
    const sampleCount = countRows[0]?.count || 0;
    updateDbStatus({ sampleCount });

    console.log(`[MySQL] Database '${cfg.database}' initialized successfully. Samples count: ${sampleCount}`);
    return true;
  } catch (err) {
    updateDbStatus({ connected: false, error: err.message });
    console.warn(`[MySQL] Warning: Could not connect to MySQL database: ${err.message}`);
    console.warn(`[MySQL] Falling back to file-based JSON storage. To connect MySQL, configure DB_PASSWORD in .env`);
    return false;
  }
}
