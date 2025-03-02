# Supabase Setup Instructions

Follow these steps to set up your Supabase database tables and populate them with sample data.

## Step 1: Access the SQL Editor

1. Log in to your Supabase account at [https://supabase.com](https://supabase.com)
2. Select your project
3. In the left sidebar, click on "SQL Editor"
4. Click "New query" to create a new SQL query

## Step 2: Create Tables and Insert Data

Copy and paste the following SQL script into the SQL Editor:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Issues Table (broad issues)
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

-- Create Programs Table (attached to issues)
CREATE TABLE programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "issueId" UUID REFERENCES issues(id),
  "issueName" TEXT,
  status TEXT,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Parents Table
CREATE TABLE parents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  "childrenInfo" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sessions Table (attached to programs)
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  "programId" UUID REFERENCES programs(id),
  "programName" TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Attendance Table (junction table for parents and sessions)
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sessionId" UUID REFERENCES sessions(id),
  "parentId" UUID REFERENCES parents(id),
  "attended" BOOLEAN DEFAULT FALSE,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for Issues
INSERT INTO issues (title, description, category, status, priority) VALUES
('Early Childhood Education', 'Improving access to quality early childhood education for all families.', 'Education', 'Active', 'High'),
('Family Health Support', 'Providing health resources and education to families in need.', 'Healthcare', 'Active', 'High'),
('Community Integration', 'Helping immigrant families integrate into the community.', 'Community', 'Active', 'Medium'),
('Parental Employment', 'Supporting parents in finding and maintaining employment.', 'Economic', 'Active', 'Medium'),
('Youth Development', 'Programs focused on positive youth development and mentoring.', 'Youth', 'Active', 'High');

-- Insert sample data for Parents
INSERT INTO parents (name, email, phone, address, "childrenInfo", notes) VALUES
('Maria Garcia', 'maria.garcia@example.com', '555-123-4567', '123 Main St, Anytown, CA 94501', 'Two children: Alex (7), Sofia (5)', 'Spanish speaker, prefers evening meetings'),
('James Wilson', 'james.wilson@example.com', '555-234-5678', '456 Oak Ave, Anytown, CA 94502', 'One child: Emma (4)', 'Available weekends only'),
('Aisha Johnson', 'aisha.j@example.com', '555-345-6789', '789 Elm St, Anytown, CA 94503', 'Three children: Jamal (8), Leila (6), Omar (3)', 'Interested in education programs'),
('David Chen', 'david.chen@example.com', '555-456-7890', '101 Pine St, Anytown, CA 94504', 'Two children: Lily (5), Michael (7)', 'Works evening shifts'),
('Sarah Patel', 'sarah.p@example.com', '555-567-8901', '202 Cedar Rd, Anytown, CA 94505', 'One child: Arjun (6)', 'Volunteer at community center');

-- Insert sample data for Programs
INSERT INTO programs (title, description, "issueId", "issueName", status, "startDate", "endDate") VALUES
('Ready to Learn', 'Preschool readiness program for children ages 3-5', 
 (SELECT id FROM issues WHERE title = 'Early Childhood Education'), 'Early Childhood Education',
 'Active', '2023-09-01T00:00:00.000Z', '2024-06-30T00:00:00.000Z'),
 
('Healthy Families', 'Workshops on family nutrition and preventive healthcare', 
 (SELECT id FROM issues WHERE title = 'Family Health Support'), 'Family Health Support',
 'Active', '2023-10-15T00:00:00.000Z', '2024-05-15T00:00:00.000Z'),
 
('New Neighbors', 'Support program for recently immigrated families', 
 (SELECT id FROM issues WHERE title = 'Community Integration'), 'Community Integration',
 'Active', '2023-08-01T00:00:00.000Z', '2024-07-31T00:00:00.000Z'),
 
('Career Pathways', 'Job training and employment resources for parents', 
 (SELECT id FROM issues WHERE title = 'Parental Employment'), 'Parental Employment',
 'Active', '2023-11-01T00:00:00.000Z', '2024-04-30T00:00:00.000Z'),
 
('Youth Mentors', 'After-school mentoring program for youth ages 10-16', 
 (SELECT id FROM issues WHERE title = 'Youth Development'), 'Youth Development',
 'Active', '2023-09-15T00:00:00.000Z', '2024-06-15T00:00:00.000Z');

-- Insert sample data for Sessions
INSERT INTO sessions (title, "programId", "programName", date, location, description, notes) VALUES
('Ready to Learn: Orientation', 
 (SELECT id FROM programs WHERE title = 'Ready to Learn'), 'Ready to Learn',
 '2023-09-05T18:00:00.000Z', 'Community Center Room A', 
 'Introduction to the Ready to Learn program and meet the teachers.', 
 'Childcare provided'),
 
('Healthy Eating on a Budget', 
 (SELECT id FROM programs WHERE title = 'Healthy Families'), 'Healthy Families',
 '2023-10-20T17:30:00.000Z', 'Community Kitchen', 
 'Workshop on nutritious meal planning with limited resources.', 
 'Food samples provided'),
 
('English Conversation Circle', 
 (SELECT id FROM programs WHERE title = 'New Neighbors'), 'New Neighbors',
 '2023-08-10T10:00:00.000Z', 'Library Meeting Room', 
 'Casual English conversation practice for all levels.', 
 'Meets weekly'),
 
('Resume Building Workshop', 
 (SELECT id FROM programs WHERE title = 'Career Pathways'), 'Career Pathways',
 '2023-11-10T14:00:00.000Z', 'Job Resource Center', 
 'Learn how to create an effective resume for job applications.', 
 'Bring work history information'),
 
('Meet Your Mentor Day', 
 (SELECT id FROM programs WHERE title = 'Youth Mentors'), 'Youth Mentors',
 '2023-09-20T16:00:00.000Z', 'Youth Center', 
 'Youth and parents meet with assigned mentors for the first time.', 
 'Ice cream social');

-- Insert sample data for Attendance
INSERT INTO attendance ("sessionId", "parentId", "attended", notes) VALUES
((SELECT id FROM sessions WHERE title = 'Ready to Learn: Orientation'), 
 (SELECT id FROM parents WHERE name = 'Maria Garcia'), 
 TRUE, 'Arrived on time, asked many questions'),
 
((SELECT id FROM sessions WHERE title = 'Ready to Learn: Orientation'), 
 (SELECT id FROM parents WHERE name = 'David Chen'), 
 TRUE, 'Brought both children'),
 
((SELECT id FROM sessions WHERE title = 'Healthy Eating on a Budget'), 
 (SELECT id FROM parents WHERE name = 'Aisha Johnson'), 
 TRUE, 'Shared some family recipes'),
 
((SELECT id FROM sessions WHERE title = 'English Conversation Circle'), 
 (SELECT id FROM parents WHERE name = 'Maria Garcia'), 
 TRUE, 'Making good progress'),
 
((SELECT id FROM sessions WHERE title = 'Resume Building Workshop'), 
 (SELECT id FROM parents WHERE name = 'Sarah Patel'), 
 TRUE, 'Already had a draft resume'),
 
((SELECT id FROM sessions WHERE title = 'Meet Your Mentor Day'), 
 (SELECT id FROM parents WHERE name = 'James Wilson'), 
 FALSE, 'Called to cancel - sick child');
```

## Step 3: Run the SQL Script

1. Click the "Run" button to execute the SQL script
2. You should see a success message for each statement
3. If you encounter any errors, make sure you're running the statements in the correct order (tables must be created before inserting data)

## Step 4: Verify the Tables

After running the script, you can verify that the tables were created and populated:

1. In the Supabase dashboard, go to "Table Editor" in the left sidebar
2. You should see five tables: `issues`, `programs`, `sessions`, `parents`, and `attendance`
3. Click on each table to view the data

## Step 5: Update Your Application

Make sure your application is configured to use your Supabase credentials:

1. Update your `.env.local` file with your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. Run your application:

```bash
npm run dev
```

3. Verify that your application is now using the Supabase data by checking the dashboard and other pages. 