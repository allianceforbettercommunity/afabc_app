// This script seeds your Supabase database with sample data from mock-data.ts
// Run with: node seed-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

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

// Extract mock data from the mock-data.ts file
function extractMockData() {
  try {
    const mockDataPath = path.join(__dirname, 'lib', 'mock-data.ts');
    const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
    
    // Extract issues data
    const issuesMatch = mockDataContent.match(/export const mockIssues = \[([\s\S]*?)\];/);
    const issuesData = issuesMatch ? eval(`[${issuesMatch[1]}]`) : [];
    
    // Extract politicians data
    const politiciansMatch = mockDataContent.match(/export const mockPoliticians = \[([\s\S]*?)\];/);
    const politiciansData = politiciansMatch ? eval(`[${politiciansMatch[1]}]`) : [];
    
    // Extract meetings data
    const meetingsMatch = mockDataContent.match(/export const mockMeetings = \[([\s\S]*?)\];/);
    const meetingsData = meetingsMatch ? eval(`[${meetingsMatch[1]}]`) : [];
    
    return {
      issues: issuesData,
      politicians: politiciansData,
      meetings: meetingsData
    };
  } catch (error) {
    console.error('Error extracting mock data:', error);
    return { issues: [], politicians: [], meetings: [] };
  }
}

// Alternative approach: Use the SQL script directly
async function executeSqlScript() {
  console.log('Using SQL script to set up database...');
  
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'supabase-setup.sql'), 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`Executing statement ${i + 1} of ${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.log('Statement:', statement.substring(0, 100) + '...');
      }
    }
    
    console.log('✅ SQL script execution completed');
    
  } catch (error) {
    console.error('❌ Error executing SQL script:', error.message);
  }
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Extract mock data
    const { issues, politicians, meetings } = extractMockData();
    
    if (issues.length === 0 && politicians.length === 0 && meetings.length === 0) {
      console.error('No mock data found to seed the database');
      process.exit(1);
    }
    
    console.log(`Found ${issues.length} issues, ${politicians.length} politicians, and ${meetings.length} meetings in mock data`);
    
    // First, check if tables exist
    console.log('\nChecking if tables exist...');
    
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      console.log('Attempting to create tables using SQL script...');
      await executeSqlScript();
      return;
    }
    
    const tables = tablesData.map(t => t.table_name);
    const hasIssuesTable = tables.includes('issues');
    const hasPoliticiansTable = tables.includes('politicians');
    const hasMeetingsTable = tables.includes('meetings');
    
    if (!hasIssuesTable || !hasPoliticiansTable || !hasMeetingsTable) {
      console.log('Some tables are missing. Creating tables using SQL script...');
      await executeSqlScript();
      return;
    }
    
    // Clear existing data (optional - comment out if you don't want to clear data)
    console.log('\nClearing existing data...');
    
    try {
      await supabase.from('meetings').delete().not('id', 'is', null);
      console.log('✅ Cleared meetings table');
    } catch (error) {
      console.error('❌ Error clearing meetings table:', error.message);
    }
    
    try {
      await supabase.from('issues').delete().not('id', 'is', null);
      console.log('✅ Cleared issues table');
    } catch (error) {
      console.error('❌ Error clearing issues table:', error.message);
    }
    
    try {
      await supabase.from('politicians').delete().not('id', 'is', null);
      console.log('✅ Cleared politicians table');
    } catch (error) {
      console.error('❌ Error clearing politicians table:', error.message);
    }
    
    // Seed issues
    console.log('\nSeeding issues...');
    
    // Prepare issues data (remove id field as it will be generated by Supabase)
    const issuesForInsert = issues.map(({ id, ...rest }) => rest);
    
    const { data: issuesData, error: issuesError } = await supabase
      .from('issues')
      .insert(issuesForInsert)
      .select();
    
    if (issuesError) {
      console.error('❌ Error seeding issues:', issuesError.message);
      return;
    } else {
      console.log(`✅ Successfully seeded ${issuesData.length} issues`);
    }
    
    // Seed politicians
    console.log('\nSeeding politicians...');
    
    // Prepare politicians data (remove id field)
    const politiciansForInsert = politicians.map(({ id, ...rest }) => rest);
    
    const { data: politiciansData, error: politiciansError } = await supabase
      .from('politicians')
      .insert(politiciansForInsert)
      .select();
    
    if (politiciansError) {
      console.error('❌ Error seeding politicians:', politiciansError.message);
      return;
    } else {
      console.log(`✅ Successfully seeded ${politiciansData.length} politicians`);
    }
    
    // Create a mapping of old IDs to new IDs
    const issueIdMap = {};
    const politicianIdMap = {};
    
    if (issuesData) {
      issues.forEach((oldIssue, index) => {
        if (index < issuesData.length) {
          issueIdMap[oldIssue.id] = issuesData[index].id;
        }
      });
    }
    
    if (politiciansData) {
      politicians.forEach((oldPolitician, index) => {
        if (index < politiciansData.length) {
          politicianIdMap[oldPolitician.id] = politiciansData[index].id;
        }
      });
    }
    
    // Seed meetings
    console.log('\nSeeding meetings...');
    
    // Prepare meetings data (update IDs and remove id field)
    const meetingsForInsert = meetings.map(({ id, ...meeting }) => ({
      ...meeting,
      politicianId: politicianIdMap[meeting.politicianId] || null,
      issueId: issueIdMap[meeting.issueId] || null
    }));
    
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .insert(meetingsForInsert)
      .select();
    
    if (meetingsError) {
      console.error('❌ Error seeding meetings:', meetingsError.message);
    } else {
      console.log(`✅ Successfully seeded ${meetingsData.length} meetings`);
    }
    
    console.log('\nDatabase seeding complete!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase(); 