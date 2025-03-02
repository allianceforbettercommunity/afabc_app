// This script creates tables in Supabase using direct HTTP requests
// Run with: node create-tables-http.js

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials not found in .env.local file');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set in your .env.local file');
  process.exit(1);
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

if (!projectRef) {
  console.error('Error: Could not extract project reference from Supabase URL');
  process.exit(1);
}

// Read the SQL script
const sqlScript = fs.readFileSync(path.join(__dirname, 'supabase-setup.sql'), 'utf8');

// Function to make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function executeSqlScript() {
  console.log('Executing SQL script to create tables in Supabase...');
  
  try {
    // Split the script into individual statements
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`\nExecuting statement ${i + 1} of ${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');
      
      const options = {
        hostname: `${projectRef}.supabase.co`,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      };
      
      const data = JSON.stringify({
        sql_query: statement
      });
      
      try {
        await makeRequest(options, data);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      }
    }
    
    console.log('\nSQL script execution completed. Please check the Supabase dashboard to verify the tables were created.');
    
  } catch (error) {
    console.error('❌ Error executing SQL script:', error.message);
    process.exit(1);
  }
}

executeSqlScript(); 