# Supabase Setup Guide

This guide will help you set up your Supabase database for the Political Advocacy Dashboard application.

## Issue Diagnosis

We've identified that the tables required for this application (`issues`, `politicians`, and `meetings`) do not exist in your Supabase database. This is confirmed by the verification script which shows:

```
❌ Issues table error: relation "public.issues" does not exist
❌ Politicians table error: relation "public.politicians" does not exist
❌ Meetings table error: relation "public.meetings" does not exist
```

## Solution: Manual Setup via SQL Editor

The most reliable way to set up your Supabase database is to use the SQL Editor in the Supabase dashboard.

### Step 1: Access the SQL Editor

1. Log in to your Supabase account at [https://supabase.com](https://supabase.com)
2. Select your project (or create a new one if you haven't already)
3. In the left sidebar, click on "SQL Editor"
4. Click "New query" to create a new SQL query

### Step 2: Create Tables and Insert Data

Copy and paste the following SQL script into the SQL Editor:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Issues Table
CREATE TABLE issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT,
  priority TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Politicians Table
CREATE TABLE politicians (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  party TEXT,
  state TEXT,
  district TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  notes TEXT,
  "lastContact" TIMESTAMP WITH TIME ZONE
);

-- Create Meetings Table
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  "politicianId" UUID REFERENCES politicians(id),
  "politicianName" TEXT,
  "issueId" UUID REFERENCES issues(id),
  "issueName" TEXT,
  notes TEXT,
  outcome TEXT,
  "followUpDate" TIMESTAMP WITH TIME ZONE,
  "followUpCompleted" BOOLEAN DEFAULT FALSE
);

-- Insert sample data for Issues
INSERT INTO issues (title, description, category, status, priority) VALUES
('Climate Change Policy', 'Advocating for stronger climate change policies and regulations.', 'Environment', 'Active', 'High'),
('Healthcare Reform', 'Working on comprehensive healthcare reform to improve access and affordability.', 'Healthcare', 'Active', 'High'),
('Education Funding', 'Advocating for increased education funding and resources for public schools.', 'Education', 'Active', 'Medium'),
('Affordable Housing', 'Working to increase affordable housing options and reduce homelessness.', 'Housing', 'Active', 'Medium'),
('Criminal Justice Reform', 'Advocating for reforms to the criminal justice system to address inequities.', 'Justice', 'Active', 'High'),
('Voting Rights Protection', 'Working to protect and expand voting rights and access to the ballot.', 'Democracy', 'Active', 'High'),
('Immigration Reform', 'Advocating for comprehensive immigration reform and protections for immigrants.', 'Immigration', 'Active', 'Medium'),
('Economic Inequality', 'Working to address economic inequality and promote economic justice.', 'Economy', 'Active', 'Medium'),
('Gun Violence Prevention', 'Advocating for policies to reduce gun violence and promote public safety.', 'Public Safety', 'Active', 'High'),
('LGBTQ+ Rights', 'Working to protect and expand rights for LGBTQ+ individuals.', 'Civil Rights', 'Active', 'Medium'),
('Renewable Energy', 'Advocating for increased investment in renewable energy sources.', 'Environment', 'Active', 'Medium'),
('Mental Health Services', 'Working to improve access to mental health services and reduce stigma.', 'Healthcare', 'Active', 'Medium');

-- Insert sample data for Politicians
INSERT INTO politicians (name, position, party, state, district, "contactEmail", "contactPhone", notes, "lastContact") VALUES
('Jane Smith', 'Senator', 'Democratic', 'California', '', 'jane.smith@senate.gov', '202-555-0101', 'Strong supporter of environmental policies.', '2023-06-15T00:00:00.000Z'),
('John Doe', 'Representative', 'Republican', 'Texas', '5', 'john.doe@house.gov', '202-555-0102', 'Interested in healthcare reform from a market perspective.', '2023-05-20T00:00:00.000Z'),
('Maria Rodriguez', 'Senator', 'Democratic', 'New York', '', 'maria.rodriguez@senate.gov', '202-555-0103', 'Champion for education funding and reform.', '2023-07-05T00:00:00.000Z'),
('Robert Johnson', 'Representative', 'Democratic', 'Illinois', '7', 'robert.johnson@house.gov', '202-555-0104', 'Advocate for affordable housing initiatives.', '2023-06-28T00:00:00.000Z'),
('Sarah Williams', 'Senator', 'Republican', 'Ohio', '', 'sarah.williams@senate.gov', '202-555-0105', 'Interested in criminal justice reform from a conservative perspective.', '2023-04-15T00:00:00.000Z'),
('Michael Brown', 'Representative', 'Democratic', 'Washington', '9', 'michael.brown@house.gov', '202-555-0106', 'Strong advocate for voting rights and election security.', '2023-07-10T00:00:00.000Z'),
('Lisa Chen', 'Senator', 'Democratic', 'Hawaii', '', 'lisa.chen@senate.gov', '202-555-0107', 'Supportive of comprehensive immigration reform.', '2023-06-05T00:00:00.000Z'),
('David Wilson', 'Representative', 'Republican', 'Florida', '12', 'david.wilson@house.gov', '202-555-0108', 'Focused on economic growth and job creation.', '2023-05-25T00:00:00.000Z');

-- Insert sample data for Meetings (after politicians and issues are inserted)
INSERT INTO meetings (title, date, type, "politicianId", "politicianName", "issueId", "issueName", notes, outcome, "followUpDate", "followUpCompleted")
VALUES
('Climate Policy Discussion', '2023-06-15T14:00:00.000Z', 'In-person', 
 (SELECT id FROM politicians WHERE name = 'Jane Smith'), 'Jane Smith',
 (SELECT id FROM issues WHERE title = 'Climate Change Policy'), 'Climate Change Policy',
 'Discussed potential new climate legislation. Senator Smith expressed interest in co-sponsoring.', 'Positive', '2023-07-01T00:00:00.000Z', true),
 
('Healthcare Reform Call', '2023-05-20T10:30:00.000Z', 'Virtual',
 (SELECT id FROM politicians WHERE name = 'John Doe'), 'John Doe',
 (SELECT id FROM issues WHERE title = 'Healthcare Reform'), 'Healthcare Reform',
 'Discussed market-based approaches to healthcare reform. Representative Doe was receptive but had concerns about costs.', 'Neutral', '2023-06-15T00:00:00.000Z', true),
 
('Education Funding Meeting', '2023-07-05T13:00:00.000Z', 'In-person',
 (SELECT id FROM politicians WHERE name = 'Maria Rodriguez'), 'Maria Rodriguez',
 (SELECT id FROM issues WHERE title = 'Education Funding'), 'Education Funding',
 'Senator Rodriguez committed to supporting increased education funding in the next budget cycle.', 'Positive', '2023-07-20T00:00:00.000Z', false),
 
('Housing Policy Briefing', '2023-06-28T11:00:00.000Z', 'In-person',
 (SELECT id FROM politicians WHERE name = 'Robert Johnson'), 'Robert Johnson',
 (SELECT id FROM issues WHERE title = 'Affordable Housing'), 'Affordable Housing',
 'Provided briefing on affordable housing crisis. Representative Johnson requested additional data on his district.', 'Positive', '2023-07-15T00:00:00.000Z', false),
 
('Criminal Justice Reform Discussion', '2023-04-15T15:30:00.000Z', 'Virtual',
 (SELECT id FROM politicians WHERE name = 'Sarah Williams'), 'Sarah Williams',
 (SELECT id FROM issues WHERE title = 'Criminal Justice Reform'), 'Criminal Justice Reform',
 'Senator Williams expressed interest in bipartisan approaches to criminal justice reform.', 'Neutral', '2023-05-01T00:00:00.000Z', true);
```

### Step 3: Run the SQL Script

1. Click the "Run" button to execute the SQL script
2. You should see a success message for each statement
3. If you encounter any errors, make sure you're running the statements in the correct order (tables must be created before inserting data)

### Step 4: Verify the Tables

After running the script, you can verify that the tables were created and populated:

1. In the Supabase dashboard, go to "Table Editor" in the left sidebar
2. You should see three tables: `issues`, `politicians`, and `meetings`
3. Click on each table to view the data

## Verify Your Setup

After setting up the tables in Supabase, you can verify your setup by running:

```bash
npm run verify-supabase
```

This should now show that the tables exist and contain data.

## Troubleshooting

### Issue: Tables Not Created

If you're still having issues creating the tables, try these steps:

1. Make sure you have the necessary permissions in your Supabase project
2. Check if there are any existing tables with the same names
3. Try running each SQL statement separately in the SQL Editor

### Issue: Application Not Connecting to Supabase

If your application is not connecting to Supabase:

1. Verify your Supabase URL and anon key in the `.env.local` file
2. Make sure your Supabase project is active
3. Check the network tab in your browser's developer tools for any API errors

## Next Steps

Once your Supabase setup is complete:

1. Run your application with `npm run dev`
2. Verify that the dashboard, issues, politicians, and meetings pages are displaying data from Supabase
3. Test creating, updating, and deleting records to ensure full functionality 