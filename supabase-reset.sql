-- Reset Database: Drop existing tables if they exist
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS politicians;

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
 'Ice cream social'),
 
('Parent-Teacher Collaboration', 
 (SELECT id FROM programs WHERE title = 'Ready to Learn'), 'Ready to Learn',
 '2023-10-15T18:30:00.000Z', 'Elementary School Library', 
 'Workshop on how parents can support learning at home.', 
 'Handouts provided'),
 
('Preventive Health Screenings', 
 (SELECT id FROM programs WHERE title = 'Healthy Families'), 'Healthy Families',
 '2023-11-05T09:00:00.000Z', 'Community Health Center', 
 'Free health screenings and consultations for families.', 
 'No appointment necessary'),
 
('Cultural Exchange Potluck', 
 (SELECT id FROM programs WHERE title = 'New Neighbors'), 'New Neighbors',
 '2023-09-30T17:00:00.000Z', 'Community Center Hall', 
 'Share food and traditions from different cultures.', 
 'Bring a dish to share'),
 
('Interview Skills Practice', 
 (SELECT id FROM programs WHERE title = 'Career Pathways'), 'Career Pathways',
 '2023-12-05T14:00:00.000Z', 'Job Resource Center', 
 'Practice interviews with feedback from HR professionals.', 
 'Professional attire recommended'),
 
('Youth Leadership Workshop', 
 (SELECT id FROM programs WHERE title = 'Youth Mentors'), 'Youth Mentors',
 '2023-10-25T16:00:00.000Z', 'Youth Center', 
 'Building leadership skills for youth participants.', 
 'Interactive activities');

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
 FALSE, 'Called to cancel - sick child'),
 
((SELECT id FROM sessions WHERE title = 'Parent-Teacher Collaboration'), 
 (SELECT id FROM parents WHERE name = 'Maria Garcia'), 
 TRUE, 'Very engaged in discussion'),
 
((SELECT id FROM sessions WHERE title = 'Parent-Teacher Collaboration'), 
 (SELECT id FROM parents WHERE name = 'Aisha Johnson'), 
 TRUE, 'Brought questions about homework'),
 
((SELECT id FROM sessions WHERE title = 'Preventive Health Screenings'), 
 (SELECT id FROM parents WHERE name = 'David Chen'), 
 TRUE, 'Scheduled follow-up appointment'),
 
((SELECT id FROM sessions WHERE title = 'Cultural Exchange Potluck'), 
 (SELECT id FROM parents WHERE name = 'Maria Garcia'), 
 TRUE, 'Brought traditional dishes'),
 
((SELECT id FROM sessions WHERE title = 'Cultural Exchange Potluck'), 
 (SELECT id FROM parents WHERE name = 'Sarah Patel'), 
 TRUE, 'Shared family recipes'),
 
((SELECT id FROM sessions WHERE title = 'Interview Skills Practice'), 
 (SELECT id FROM parents WHERE name = 'James Wilson'), 
 FALSE, 'No-show, no notification'),
 
((SELECT id FROM sessions WHERE title = 'Youth Leadership Workshop'), 
 (SELECT id FROM parents WHERE name = 'Aisha Johnson'), 
 TRUE, 'Children very engaged in activities');

-- Add future sessions for upcoming events section
INSERT INTO sessions (title, "programId", "programName", date, location, description, notes) VALUES
('Summer Reading Program Kickoff', 
 (SELECT id FROM programs WHERE title = 'Ready to Learn'), 'Ready to Learn',
 '2024-06-15T10:00:00.000Z', 'Public Library', 
 'Launch of the summer reading program with activities and book giveaways.', 
 'Open to all program participants'),
 
('Family Fitness Day', 
 (SELECT id FROM programs WHERE title = 'Healthy Families'), 'Healthy Families',
 '2024-05-01T09:00:00.000Z', 'Community Park', 
 'Outdoor activities promoting physical fitness for the whole family.', 
 'Wear comfortable clothes and bring water'),
 
('Community Resource Fair', 
 (SELECT id FROM programs WHERE title = 'New Neighbors'), 'New Neighbors',
 '2024-04-20T11:00:00.000Z', 'Community Center', 
 'Connect with local resources and services for families.', 
 'Translators available'),
 
('Job Fair', 
 (SELECT id FROM programs WHERE title = 'Career Pathways'), 'Career Pathways',
 '2024-04-15T13:00:00.000Z', 'Convention Center', 
 'Meet with local employers with current job openings.', 
 'Bring multiple copies of your resume'),
 
('End of Year Celebration', 
 (SELECT id FROM programs WHERE title = 'Youth Mentors'), 'Youth Mentors',
 '2024-06-10T17:00:00.000Z', 'Youth Center', 
 'Celebration of achievements and graduation ceremony.', 
 'Families welcome'); 