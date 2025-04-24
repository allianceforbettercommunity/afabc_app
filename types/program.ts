export interface Issue {
  id: string;
  title: string;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  location: string;
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
  issue?: Issue;
  sessions?: Session[];
}

export type SortField = 'title' | 'issueName' | 'status' | 'startDate' | 'sessionCount';
export type SortOrder = 'asc' | 'desc'; 