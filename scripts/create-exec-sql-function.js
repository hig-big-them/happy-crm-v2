const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // Use the SQL editor endpoint directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });

    if (!response.ok) {
      // If exec_sql doesn't exist, we need to create it via a different method
      console.log('exec_sql function does not exist, trying alternative approach...');
      
      // Try using the SQL query directly via PostgREST
      const { error } = await supabase.rpc('query', { 
        query: createFunctionSQL 
      });
      
      if (error) {
        console.error('Error creating function:', error);
        console.log('Please create the exec_sql function manually in the Supabase SQL editor:');
        console.log(createFunctionSQL);
        return false;
      }
    }
    
    console.log('✓ exec_sql function created successfully');
    return true;
  } catch (error) {
    console.error('Error creating exec_sql function:', error.message);
    console.log('Please create the exec_sql function manually in the Supabase SQL editor:');
    console.log(`
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `);
    return false;
  }
}

createExecSqlFunction();