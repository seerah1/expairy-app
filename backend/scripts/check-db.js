#!/usr/bin/env node
/**
 * Check database status and existing tables
 */

require('dotenv').config();
const { pool } = require('../src/config/database');

async function checkDatabase() {
  try {
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Database Status:\n');
    console.log('Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  (none - migrations need to be run)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }

    // Get table counts
    if (tablesResult.rows.length > 0) {
      console.log('\nTable counts:');
      for (const row of tablesResult.rows) {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
        console.log(`  ${row.table_name}: ${countResult.rows[0].count} rows`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabase();
