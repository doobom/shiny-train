const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf-8');

const target = "export async function seedDatabase() {";
const replacement = `import fs from 'fs';
import path from 'path';
import pool from './postgres_pool.js';

export async function seedDatabase() {
  console.log('Initializing database schema...');
  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'src/server/schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Failed to create schema:', err);
  }
`;

code = code.replace(target, replacement);

fs.writeFileSync('src/server/seed.ts', code);
