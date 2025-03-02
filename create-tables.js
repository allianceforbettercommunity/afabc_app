// This script creates tables in Supabase using the REST API
// Run with: node create-tables.js

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

async function createTables() {
  console.log('Creating tables in Supabase...');
  
  try {
    // Create issues table
    console.log('\nCreating issues table...');
    const { error: issuesError } = await supabase.rpc('create_issues_table');
    
    if (issuesError) {
      console.error('❌ Error creating issues table:', issuesError.message);
      console.log('Attempting to create issues table using REST API...');
      
      // Try using REST API to create the table
      const { error: restError } = await supabase.from('rest').rpc('create_table', {
        table_name: 'issues',
        columns: [
          { name: 'id', type: 'uuid', primary: true, default_value: 'uuid_generate_v4()' },
          { name: 'title', type: 'text', nullable: false },
          { name: 'description', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'priority', type: 'text' },
          { name: 'createdAt', type: 'timestamp with time zone', default_value: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default_value: 'now()' }
        ]
      });
      
      if (restError) {
        console.error('❌ Error creating issues table using REST API:', restError.message);
      } else {
        console.log('✅ Issues table created successfully using REST API');
      }
    } else {
      console.log('✅ Issues table created successfully');
    }
    
    // Create politicians table
    console.log('\nCreating politicians table...');
    const { error: politiciansError } = await supabase.rpc('create_politicians_table');
    
    if (politiciansError) {
      console.error('❌ Error creating politicians table:', politiciansError.message);
      console.log('Attempting to create politicians table using REST API...');
      
      // Try using REST API to create the table
      const { error: restError } = await supabase.from('rest').rpc('create_table', {
        table_name: 'politicians',
        columns: [
          { name: 'id', type: 'uuid', primary: true, default_value: 'uuid_generate_v4()' },
          { name: 'name', type: 'text', nullable: false },
          { name: 'position', type: 'text' },
          { name: 'party', type: 'text' },
          { name: 'state', type: 'text' },
          { name: 'district', type: 'text' },
          { name: 'contactEmail', type: 'text' },
          { name: 'contactPhone', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'lastContact', type: 'timestamp with time zone' }
        ]
      });
      
      if (restError) {
        console.error('❌ Error creating politicians table using REST API:', restError.message);
      } else {
        console.log('✅ Politicians table created successfully using REST API');
      }
    } else {
      console.log('✅ Politicians table created successfully');
    }
    
    // Create meetings table
    console.log('\nCreating meetings table...');
    const { error: meetingsError } = await supabase.rpc('create_meetings_table');
    
    if (meetingsError) {
      console.error('❌ Error creating meetings table:', meetingsError.message);
      console.log('Attempting to create meetings table using REST API...');
      
      // Try using REST API to create the table
      const { error: restError } = await supabase.from('rest').rpc('create_table', {
        table_name: 'meetings',
        columns: [
          { name: 'id', type: 'uuid', primary: true, default_value: 'uuid_generate_v4()' },
          { name: 'title', type: 'text', nullable: false },
          { name: 'date', type: 'timestamp with time zone' },
          { name: 'type', type: 'text' },
          { name: 'politicianId', type: 'uuid', references: 'politicians(id)' },
          { name: 'politicianName', type: 'text' },
          { name: 'issueId', type: 'uuid', references: 'issues(id)' },
          { name: 'issueName', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'outcome', type: 'text' },
          { name: 'followUpDate', type: 'timestamp with time zone' },
          { name: 'followUpCompleted', type: 'boolean', default_value: 'false' }
        ]
      });
      
      if (restError) {
        console.error('❌ Error creating meetings table using REST API:', restError.message);
      } else {
        console.log('✅ Meetings table created successfully using REST API');
      }
    } else {
      console.log('✅ Meetings table created successfully');
    }
    
    console.log('\nTable creation process completed. Please check the Supabase dashboard to verify the tables were created.');
    console.log('\nIf the tables were not created, please use the SQL Editor in the Supabase dashboard to run the SQL script in supabase-setup.sql.');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createTables(); 