#!/usr/bin/env node

/**
 * User Creation Script
 * Creates a new user with specified email, password and role
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser(email, password, role = 'super_admin', fullName = null) {
  try {
    console.log('🔧 Creating user with Supabase Admin API...');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser.email);
      return { success: false, error: 'User already exists' };
    }
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split('@')[0]
      },
      app_metadata: {
        role: role
      }
    });
    
    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      return { success: false, error: authError.message };
    }
    
    if (!authData.user) {
      console.error('❌ No user data returned');
      return { success: false, error: 'No user data returned' };
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // Create user profile
    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: fullName || email.split('@')[0],
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      
      // Try to cleanup auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return { success: false, error: profileError.message };
    }
    
    console.log('✅ User profile created successfully');
    
    return {
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        role: role
      }
    };
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/create-user.js <email> <password> [role] [fullName]');
    console.log('Example: node scripts/create-user.js user@example.com mypassword super_admin "John Doe"');
    process.exit(1);
  }
  
  const [email, password, role = 'super_admin', fullName] = args;
  
  console.log('🚀 Starting user creation process...');
  console.log('🔍 Environment check:');
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
  console.log('');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables. Please check .env.local file.');
    process.exit(1);
  }
  
  const result = await createUser(email, password, role, fullName);
  
  if (result.success) {
    console.log('');
    console.log('🎉 User created successfully!');
    console.log('📧 Login details:');
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${result.user.role}`);
    console.log('');
    console.log('🔗 You can now login at: http://localhost:3000/login');
    process.exit(0);
  } else {
    console.log('');
    console.error('❌ User creation failed:', result.error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createUser };
