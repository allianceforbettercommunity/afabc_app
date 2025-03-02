import { createClient } from './supabase/client';

// Types
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
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
}

export interface Session {
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
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  parentId: string;
  attended: boolean;
  notes: string;
  createdAt: string;
}

// Issues
export async function getIssues(): Promise<Issue[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
  
  return data || [];
}

export async function getIssueById(id: string): Promise<Issue | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching issue:', error);
    return null;
  }
  
  return data;
}

export async function createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Issue | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .insert([issue])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating issue:', error);
    return null;
  }
  
  return data;
}

export async function updateIssue(id: string, issue: Partial<Issue>): Promise<Issue | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .update(issue)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating issue:', error);
    return null;
  }
  
  return data;
}

export async function deleteIssue(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting issue:', error);
    return false;
  }
  
  return true;
}

// Programs
export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
  
  return data || [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching program:', error);
    return null;
  }
  
  return data;
}

export async function createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programs')
    .insert([program])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating program:', error);
    return null;
  }
  
  return data;
}

export async function updateProgram(id: string, program: Partial<Program>): Promise<Program | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programs')
    .update(program)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating program:', error);
    return null;
  }
  
  return data;
}

export async function deleteProgram(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting program:', error);
    return false;
  }
  
  return true;
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  
  return data || [];
}

export async function getSessionById(id: string): Promise<Session | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return data;
}

export async function createSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating session:', error);
    return null;
  }
  
  return data;
}

export async function updateSession(id: string, session: Partial<Session>): Promise<Session | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .update(session)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating session:', error);
    return null;
  }
  
  return data;
}

export async function deleteSession(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting session:', error);
    return false;
  }
  
  return true;
}

// Parents
export async function getParents(): Promise<Parent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching parents:', error);
    return [];
  }
  
  return data || [];
}

export async function getParentById(id: string): Promise<Parent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching parent:', error);
    return null;
  }
  
  return data;
}

export async function createParent(parent: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Parent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parents')
    .insert([parent])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating parent:', error);
    return null;
  }
  
  return data;
}

export async function updateParent(id: string, parent: Partial<Parent>): Promise<Parent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parents')
    .update(parent)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating parent:', error);
    return null;
  }
  
  return data;
}

export async function deleteParent(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting parent:', error);
    return false;
  }
  
  return true;
}

// Attendance
export async function getAttendance(sessionId?: string, parentId?: string): Promise<Attendance[]> {
  const supabase = createClient();
  let query = supabase.from('attendance').select('*');
  
  if (sessionId) {
    query = query.eq('sessionId', sessionId);
  }
  
  if (parentId) {
    query = query.eq('parentId', parentId);
  }
  
  const { data, error } = await query.order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
  
  return data || [];
}

export async function createAttendance(attendance: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .insert([attendance])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating attendance:', error);
    return null;
  }
  
  return data;
}

export async function updateAttendance(id: string, attendance: Partial<Attendance>): Promise<Attendance | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .update(attendance)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating attendance:', error);
    return null;
  }
  
  return data;
}

export async function deleteAttendance(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting attendance:', error);
    return false;
  }
  
  return true;
} 