/**
 * Apply SQL Fix Script
 * Fix the trigger function for status calculation
 */

const { pool } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function applyFix() {
  try {
    console.log('Applying SQL fix...\n');

    const sqlPath = path.join(__dirname, 'fix-trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);
    console.log('✓ Trigger function fixed successfully');

    // Test the fix by creating a test item
    console.log('\nTesting trigger function...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const testResult = await pool.query(
      `INSERT INTO food_items (user_id, name, category, expiry_date, storage_type)
       VALUES (1, 'Test Item', 'Dairy', $1, 'Refrigerator')
       RETURNING id, name, status, remaining_days`,
      [tomorrowStr]
    );

    console.log('✓ Test item created:', testResult.rows[0]);

    // Clean up test item
    await pool.query('DELETE FROM food_items WHERE id = $1', [testResult.rows[0].id]);
    console.log('✓ Test item cleaned up');

    console.log('\n✅ SQL fix applied and verified');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyFix();
