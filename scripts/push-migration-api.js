const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

async function pushMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250125_enable_rls_security.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration via Supabase REST API...');
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
          await executeSQL(statement);
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
  }
}

pushMigration();