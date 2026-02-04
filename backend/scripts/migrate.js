#!/usr/bin/env node
/**
 * Database migration script
 * Runs all SQL migration files in order
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

const migrations = [
  '001_create_users_table.sql',
  '002_create_food_items_table.sql',
  '003_create_documents_table.sql',
  '004_create_notifications_table.sql',
  '005_create_views_and_functions.sql',
  '006_seed_admin_user.sql',
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');

    // Run each migration
    for (const migration of migrations) {
      const filePath = path.join(MIGRATIONS_DIR, migration);

      if (!fs.existsSync(filePath)) {
        console.error(`✗ Migration file not found: ${migration}`);
        process.exit(1);
      }

      console.log(`Running: ${migration}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        console.log(`✓ ${migration} completed\n`);
      } catch (error) {
        console.error(`✗ Error in ${migration}:`, error.message);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   - users table created');
    console.log('   - food_items table created');
    console.log('   - documents table created');
    console.log('   - notifications table created');
    console.log('   - Views and functions created');
    console.log('   - Admin user seeded (email: admin@expirytracker.com, password: Admin123!)');
    console.log('\n⚠️  Remember to change the admin password in production!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
