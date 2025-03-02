// This script verifies your Supabase connection and checks if tables exist
// Run with: node verify-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials not found in .env.local file');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set in your .env.local file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
  console.log('Verifying Supabase connection...');
  
  try {
    // Test connection by getting the current user (should be null for anon)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Connection to Supabase successful!');
    
    // Check if tables exist
    console.log('\nChecking if tables exist...');
    
    // Check issues table
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('count', { count: 'exact' });
    
    if (issuesError) {
      console.error('❌ Issues table error:', issuesError.message);
    } else {
      console.log(`✅ Issues table exists with ${issues[0].count} records`);
    }
    
    // Check programs table
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('count', { count: 'exact' });
    
    if (programsError) {
      console.error('❌ Programs table error:', programsError.message);
    } else {
      console.log(`✅ Programs table exists with ${programs[0].count} records`);
    }
    
    // Check sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('count', { count: 'exact' });
    
    if (sessionsError) {
      console.error('❌ Sessions table error:', sessionsError.message);
    } else {
      console.log(`✅ Sessions table exists with ${sessions[0].count} records`);
    }
    
    // Check parents table
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('count', { count: 'exact' });
    
    if (parentsError) {
      console.error('❌ Parents table error:', parentsError.message);
    } else {
      console.log(`✅ Parents table exists with ${parents[0].count} records`);
    }
    
    // Check attendance table
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('count', { count: 'exact' });
    
    if (attendanceError) {
      console.error('❌ Attendance table error:', attendanceError.message);
    } else {
      console.log(`✅ Attendance table exists with ${attendance[0].count} records`);
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    process.exit(1);
  }
}

verifyConnection(); 