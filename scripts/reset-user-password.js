#!/usr/bin/env node

/**
 * Password Reset Script
 * Updates password and role for existing user
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetUserPassword(email, newPassword, newRole = null) {
  try {
    console.log('🔧 Finding user by email...');
    console.log(`   Email: ${email}`);
    
    // Find user in profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Error finding user profile:', profileError);
      return { success: false, error: profileError.message };
    }
    
    if (!userProfile) {
      console.log('❌ User not found in profiles table');
      return { success: false, error: 'User not found' };
    }
    
    console.log('✅ User found:');
    console.log(`   ID: ${userProfile.id}`);
    console.log(`   Email: ${userProfile.email}`);
    console.log(`   Current Role: ${userProfile.role}`);
    console.log(`   Full Name: ${userProfile.full_name}`);
    
    // Update password
    console.log('🔒 Updating password...');
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userProfile.id,
      {
        password: newPassword,
        email_confirm: true,
        app_metadata: newRole ? { role: newRole } : undefined
      }
    );
    
    if (authError) {
      console.error('❌ Password update failed:', authError);
      return { success: false, error: authError.message };
    }
    
    console.log('✅ Password updated successfully');
    
    // Update role in profile if requested
    if (newRole && newRole !== userProfile.role) {
      console.log(`🎭 Updating role from '${userProfile.role}' to '${newRole}'...`);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);
      
      if (updateError) {
        console.error('❌ Role update failed:', updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log('✅ Role updated successfully');
    }
    
    return {
      success: true,
      user: {
        id: userProfile.id,
        email: email,
        role: newRole || userProfile.role,
        fullName: userProfile.full_name
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
    console.log('Usage: node scripts/reset-user-password.js <email> <newPassword> [newRole]');
    console.log('Example: node scripts/reset-user-password.js user@example.com newpassword super_admin');
    process.exit(1);
  }
  
  const [email, newPassword, newRole] = args;
  
  console.log('🚀 Starting password reset process...');
  console.log('🔍 Environment check:');
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
  console.log('');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables. Please check .env.local file.');
    process.exit(1);
  }
  
  const result = await resetUserPassword(email, newPassword, newRole);
  
  if (result.success) {
    console.log('');
    console.log('🎉 Password reset successful!');
    console.log('📧 Updated login details:');
    console.log(`   Email: ${result.user.email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Full Name: ${result.user.fullName}`);
    console.log('');
    console.log('🔗 You can now login at: http://localhost:3000/login');
    process.exit(0);
  } else {
    console.log('');
    console.error('❌ Password reset failed:', result.error);
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

module.exports = { resetUserPassword };
