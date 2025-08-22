#!/usr/bin/env node

/**
 * User Status Check Script
 * Checks user status in both auth and profiles tables
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserStatus(email) {
  try {
    console.log('🔍 Checking user status...');
    console.log(`   Email: ${email}`);
    console.log('');
    
    // Check auth users
    console.log('1️⃣ Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === email);
    
    if (authUser) {
      console.log('✅ Found in auth.users:');
      console.log(`   ID: ${authUser.id}`);
      console.log(`   Email: ${authUser.email}`);
      console.log(`   Confirmed: ${authUser.email_confirmed_at ? '✅' : '❌'}`);
      console.log(`   Created: ${authUser.created_at}`);
      console.log(`   App Metadata:`, authUser.app_metadata);
      console.log(`   User Metadata:`, authUser.user_metadata);
    } else {
      console.log('❌ Not found in auth.users');
    }
    
    console.log('');
    
    // Check user_profiles table
    console.log('2️⃣ Checking user_profiles table...');
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Error checking user_profiles:', profileError);
    } else if (userProfile) {
      console.log('✅ Found in user_profiles:');
      console.log(`   ID: ${userProfile.id}`);
      console.log(`   Email: ${userProfile.email}`);
      console.log(`   Full Name: ${userProfile.full_name}`);
      console.log(`   Role: ${userProfile.role}`);
      console.log(`   Agency ID: ${userProfile.agency_id}`);
      console.log(`   Created: ${userProfile.created_at}`);
    } else {
      console.log('❌ Not found in user_profiles');
    }
    
    console.log('');
    
    // Sync check
    if (authUser && !userProfile) {
      console.log('⚠️  SYNC ISSUE: User exists in auth but not in profiles!');
      console.log('🔧 This user needs profile creation.');
      return { needsProfileSync: true, authUser };
    } else if (!authUser && userProfile) {
      console.log('⚠️  SYNC ISSUE: Profile exists but no auth user!');
      console.log('🔧 This profile is orphaned.');
      return { orphanedProfile: true, userProfile };
    } else if (authUser && userProfile) {
      console.log('✅ User is properly synced between auth and profiles.');
      return { synced: true, authUser, userProfile };
    } else {
      console.log('❌ User does not exist in either table.');
      return { notFound: true };
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

async function createMissingProfile(authUser, role = 'super_admin') {
  try {
    console.log('🔧 Creating missing profile...');
    
    const profileData = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert(profileData);
    
    if (insertError) {
      console.error('❌ Profile creation failed:', insertError);
      return false;
    }
    
    console.log('✅ Profile created successfully!');
    return true;
  } catch (error) {
    console.error('💥 Error creating profile:', error);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node scripts/check-user-status.js <email> [--fix]');
    console.log('Example: node scripts/check-user-status.js user@example.com --fix');
    process.exit(1);
  }
  
  const [email, fixFlag] = args;
  const shouldFix = fixFlag === '--fix';
  
  console.log('🚀 Starting user status check...');
  console.log('🔍 Environment check:');
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
  console.log('');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables. Please check .env.local file.');
    process.exit(1);
  }
  
  const result = await checkUserStatus(email);
  
  if (result?.needsProfileSync && shouldFix) {
    console.log('🔧 Attempting to fix sync issue...');
    const success = await createMissingProfile(result.authUser);
    if (success) {
      console.log('✅ Sync issue fixed! Re-checking...');
      console.log('');
      await checkUserStatus(email);
    }
  }
  
  if (result?.needsProfileSync && !shouldFix) {
    console.log('💡 To fix this sync issue, run:');
    console.log(`   node scripts/check-user-status.js "${email}" --fix`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { checkUserStatus, createMissingProfile };