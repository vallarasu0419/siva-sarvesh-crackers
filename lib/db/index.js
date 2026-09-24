import mysql from 'mysql2/promise';
import { getDbConfig } from './config.js';

/**
 * Shared MySQL / MariaDB connection pool.
 * Stored on globalThis so Next.js hot reload does not open new pools.
 * All queries use placeholders (?), never string concatenation.
 */
function createPool() {
  const pool = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    timezone: '+05:30',
  });
  // Store and read all timestamps in Indian Standard Time.
  pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+05:30'");
  });
  return pool;
}

export function getPool() {
  if (!globalThis.__sscPool) {
    globalThis.__sscPool = createPool();
  }
  return globalThis.__sscPool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/**
 * Runs `work(connection)` inside a transaction.
 * Commits on success, rolls back on any error, always releases the connection.
 */
export async function withTransaction(work) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
