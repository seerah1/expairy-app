#!/usr/bin/env node
/**
 * Database connection test script
 */

require('dotenv').config();
const { pool } = require('../src/config/database');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');

    console.log('✅ Database connection successful!\n');
    console.log('📊 Database Info:');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    console.log('\n✓ Ready to run migrations!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that DATABASE_URL is set in backend/.env');
    console.error('   2. Verify your Neon database is active');
    console.error('   3. Ensure the connection string includes ?sslmode=require');
    console.error('   4. Check your internet connection');

    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
