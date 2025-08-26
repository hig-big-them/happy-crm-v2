const fs = require('fs');
const path = require('path');

function formatMigrationForDashboard() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250125_enable_rls_security.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('='.repeat(80));
    console.log('SUPABASE RLS SECURITY MIGRATION');
    console.log('Copy the following SQL to the Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log('');
    console.log(migrationSQL);
    console.log('');
    console.log('='.repeat(80));
    console.log('Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run" to execute the migration');
    console.log('='.repeat(80));
    
    // Also save to a separate file for easy copying
    const outputPath = path.join(__dirname, '..', 'migration-for-dashboard.sql');
    fs.writeFileSync(outputPath, migrationSQL);
    console.log(`Migration also saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error formatting migration:', error.message);
    process.exit(1);
  }
}

formatMigrationForDashboard();