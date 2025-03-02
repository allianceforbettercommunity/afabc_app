# Political Advocacy Dashboard

A dashboard for managing family support programs, tracking issues, programs, sessions, and parent attendance.

## Features

- Dashboard with key metrics and visualizations
- Issue management
- Program tracking
- Session scheduling
- Parent attendance tracking

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Set up your database tables and sample data:
   
   **Option 1: Using the SQL script**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of the `supabase-reset.sql` file from this project
   - Paste it into the SQL Editor and run the script
   - This will reset any existing tables and create all necessary tables with sample data

   **Option 2: Using the seeding script**
   - Get your Supabase URL and anon key from the Supabase dashboard (Settings > API)
   - Update the `.env.local` file in the root of your project with your Supabase credentials
   - Run the seeding script:
   ```bash
   npm run seed-supabase
   ```
   - This script will automatically extract data from the mock data files and populate your Supabase tables

3. Get your Supabase URL and anon key from the Supabase dashboard (Settings > API)
4. Update the `.env.local` file in the root of your project with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Verifying Supabase Connection

To verify that your Supabase connection is working correctly:

```bash
npm run verify-supabase
```

This will check your connection to Supabase and verify that the required tables exist.

### Running the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Database Schema

### Issues Table

```sql
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
```

### Programs Table

```sql
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
```

### Sessions Table

```sql
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
```

### Parents Table

```sql
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
```

### Attendance Table

```sql
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sessionId" UUID REFERENCES sessions(id),
  "parentId" UUID REFERENCES parents(id),
  "attended" BOOLEAN DEFAULT FALSE,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Technologies Used

- Next.js
- React
- Tailwind CSS
- Supabase
- Recharts
- shadcn/ui 