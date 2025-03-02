import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions based on your data model
export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

export type Program = {
  id: string;
  title: string;
  description: string;
  issueId: string;
  issueName: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  title: string;
  programId: string;
  programName: string;
  date: string;
  location: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Parent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Attendance = {
  id: string;
  sessionId: string;
  parentId: string;
  attended: boolean;
  notes: string;
  createdAt: string;
}; 