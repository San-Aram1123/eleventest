/**
 * Creates required database tables and applies non-destructive schema migrations.
 * @param {import('mysql2/promise').Pool} pool
 */
export async function initDatabaseSchema(pool) {
  // 1. Create samples table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS samples (
      id VARCHAR(64) PRIMARY KEY,
      text TEXT NOT NULL,
      dialect VARCHAR(64) DEFAULT 'sorani',
      emotion VARCHAR(64) DEFAULT 'neutral',
      emotion_tag JSON DEFAULT NULL,
      voice_id VARCHAR(128) DEFAULT NULL,
      voice_name VARCHAR(255) DEFAULT NULL,
      model_id VARCHAR(128) DEFAULT NULL,
      method VARCHAR(64) DEFAULT 'elevenlabs_api',
      rating INT DEFAULT NULL,
      rating_clarity INT DEFAULT NULL,
      rating_naturalness INT DEFAULT NULL,
      rating_emotion INT DEFAULT NULL,
      rating_dialect INT DEFAULT NULL,
      rating_notes TEXT DEFAULT NULL,
      wav_filename VARCHAR(255) NOT NULL,
      audio_size INT DEFAULT 0,
      duration_seconds FLOAT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      metadata_extra JSON DEFAULT NULL,
      INDEX idx_created_at (created_at),
      INDEX idx_dialect (dialect),
      INDEX idx_emotion (emotion),
      INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Safe non-destructive column additions if table already existed
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN dialect VARCHAR(64) DEFAULT 'sorani'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN family_id VARCHAR(128) DEFAULT NULL");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN emotion_intensity FLOAT DEFAULT 0.0");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN speaker_name VARCHAR(255) DEFAULT NULL");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN language VARCHAR(32) DEFAULT 'ckb'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN gender VARCHAR(16) DEFAULT NULL");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD COLUMN voice_gender VARCHAR(16) DEFAULT NULL");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE samples ADD INDEX idx_family_id (family_id)");
  } catch (e) {}

  // 2. Create api_keys table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      provider VARCHAR(64) DEFAULT 'elevenlabs',
      api_key VARCHAR(255) UNIQUE NOT NULL,
      label VARCHAR(255) DEFAULT NULL,
      status VARCHAR(64) DEFAULT 'ready',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_provider (provider)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await pool.query("ALTER TABLE api_keys ADD COLUMN provider VARCHAR(64) DEFAULT 'elevenlabs'");
  } catch (e) {}

  // 3. Create pending_queue table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_queue (
      id VARCHAR(64) PRIMARY KEY,
      text TEXT NOT NULL,
      emotion VARCHAR(64) DEFAULT 'neutral',
      status VARCHAR(32) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}
