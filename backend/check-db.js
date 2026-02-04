/**
 * Database Check Script
 * Verify database state and admin user
 */

const { pool } = require('./src/config/database');
const bcrypt = require('bcrypt');

async function checkDatabase() {
  try {
    console.log('Checking database state...\n');

    // Check admin user
    const adminResult = await pool.query(
      'SELECT id, email, role, status, created_at FROM users WHERE email = $1',
      ['admin@expirytracker.com']
    );

    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user NOT FOUND');
      console.log('Creating admin user...');

      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const createResult = await pool.query(
        'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
        ['admin@expirytracker.com', hashedPassword, 'admin', 'active']
      );

      console.log('✓ Admin user created:', createResult.rows[0]);
    } else {
      console.log('✓ Admin user exists:', adminResult.rows[0]);

      // Test password verification
      const passwordResult = await pool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        ['admin@expirytracker.com']
      );

      const isValid = await bcrypt.compare('Admin123!', passwordResult.rows[0].password_hash);
      console.log('✓ Password verification:', isValid ? 'VALID' : 'INVALID');

      if (!isValid) {
        console.log('\nResetting admin password...');
        const hashedPassword = await bcrypt.hash('Admin123!', 12);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [hashedPassword, 'admin@expirytracker.com']
        );
        console.log('✓ Admin password reset');
      }
    }

    // Check tables
    console.log('\n--- Database Tables ---');
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    tablesResult.rows.forEach(row => console.log('  ✓', row.table_name));

    // Check user count
    const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('\n--- User Statistics ---');
    console.log('  Total users:', userCountResult.rows[0].count);

    // Check food items count
    const itemsCountResult = await pool.query('SELECT COUNT(*) as count FROM food_items');
    console.log('  Total food items:', itemsCountResult.rows[0].count);

    console.log('\n✅ Database check complete');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
