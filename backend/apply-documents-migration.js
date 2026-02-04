/**
 * Apply Documents Table Migration
 * Updates documents table schema to match Phase 6 requirements
 */

const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/database');

async function applyMigration() {
  console.log('📦 Applying documents table migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '007_update_documents_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration SQL...');
    await query(migrationSQL);

    console.log('✅ Migration applied successfully\n');

    // Verify columns exist
    console.log('Verifying table structure...');
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'documents'
      ORDER BY ordinal_position
    `);

    console.log('\nDocuments table columns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
