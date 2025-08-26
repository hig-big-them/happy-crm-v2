const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.kvjblasewcrztzcfrkgq',
  password: process.env.SUPABASE_DB_PASSWORD || 'your_db_password_here',
  ssl: {
    rejectUnauthorized: false
  }
});

async function pushMigration() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250125_enable_rls_security.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    console.log('Migration file:', migrationPath);
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`);
        try {
          await client.query(statement);
          console.log('✓ Statement executed successfully');
        } catch (error) {
          console.error('✗ Error executing statement:', error.message);
          console.error('Statement:', statement);
          // Continue with next statement
        }
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Error pushing migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

pushMigration();