/**
 * MySQL connection settings from DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
 * Shared by the app (lib/db/index.js) and the scripts in /scripts.
 */
export function getDbConfig({ withDatabase = true } = {}) {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  const missing = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`${missing.join(', ')} not configured. Copy .env.example to .env.local and fill it in.`);
  }
  // DB_NAME is used as an identifier in schema.sql, so allow only safe characters.
  if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
    throw new Error('DB_NAME may only contain letters, numbers and underscores.');
  }
  return {
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD || '',
    ...(withDatabase && { database: DB_NAME }),
    charset: 'utf8mb4',
  };
}
