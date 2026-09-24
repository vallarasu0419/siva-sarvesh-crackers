/**
 * Creates the database, tables and seed data by running database/schema.sql.
 * Usage: npm run db:setup   (reads DB_HOST / DB_USER / DB_PASSWORD / DB_NAME from .env.local)
 * The DB_USER account needs CREATE privileges for the first run.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { getDbConfig } from '../lib/db/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let config;
try {
  // Connect without a default database so CREATE DATABASE works.
  config = getDbConfig({ withDatabase: false });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const dbName = process.env.DB_NAME;
// schema.sql is written for `siva_sarvesh_crackers`; create DB_NAME instead.
const sql = readFileSync(path.join(root, 'database/schema.sql'), 'utf8')
  .replace(/\bsiva_sarvesh_crackers\b/g, dbName);

const connection = await mysql.createConnection({ ...config, multipleStatements: true });

try {
  await connection.query(sql);
  const [[{ products }]] = await connection.query(`SELECT COUNT(*) AS products FROM \`${dbName}\`.products`);
  console.log(`Database ready. ${products} products loaded.`);
  console.log('Next: create an admin with `npm run seed:admin`.');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
