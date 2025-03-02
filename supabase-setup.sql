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
-- Note: You'll need to replace the politician_id and issue_id with actual UUIDs from your database
-- This is just a template - you'll need to update with actual IDs after running the above inserts
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