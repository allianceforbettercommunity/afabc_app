"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { createClient } from "@/lib/supabase/client";

interface Issue {
  id: string;
  title: string;
  category: string;
}

interface Program {
  id: string;
  title: string;
  issueId: string;
  issueName: string;
  status: string;
}

interface Session {
  id: string;
  title: string;
  programId: string;
  programName: string;
  date: string;
  location: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface Attendance {
  id: string;
  sessionId: string;
  parentId: string;
  attended: boolean;
}

export default function DashboardPage() {
  const [issueCount, setIssueCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [issueData, setIssueData] = useState<any[]>([]);
  const [sessionsByMonth, setSessionsByMonth] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from Supabase
        const { data: issues, error: issuesError } = await supabase
          .from("issues")
          .select("*");
        
        if (issuesError) throw issuesError;
        
        const { data: programs, error: programsError } = await supabase
          .from("programs")
          .select("*");
        
        if (programsError) throw programsError;
        
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .order("date", { ascending: true });
        
        if (sessionsError) throw sessionsError;
        
        const { data: parents, error: parentsError } = await supabase
          .from("parents")
          .select("*");
        
        if (parentsError) throw parentsError;
        
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance")
          .select("*");
        
        if (attendanceError) throw attendanceError;
        
        // Set counts
        setIssueCount(issues?.length || 0);
        setProgramCount(programs?.length || 0);
        setSessionCount(sessions?.length || 0);
        setParentCount(parents?.length || 0);
        
        // Process issue data for pie chart
        const issueCategories = issues?.reduce((acc: Record<string, number>, issue) => {
          const category = issue.category || "Uncategorized";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        setIssueData(
          Object.entries(issueCategories || {}).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // Process session data by month
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const sessionsByMonthData = months.map(month => {
          const count = sessions?.filter(session => {
            if (!session.date) return false;
            const sessionMonth = new Date(session.date).toLocaleString('default', { month: 'short' });
            return sessionMonth === month;
          }).length || 0;
          return { name: month, count };
        });

        setSessionsByMonth(sessionsByMonthData);
        
        // Set upcoming sessions (future dates only)
        const now = new Date();
        const upcoming = sessions?.filter(session => {
          if (!session.date) return false;
          return new Date(session.date) > now;
        }).slice(0, 5) || [];
        
        setUpcomingSessions(upcoming);
        
        // Calculate attendance rate
        if (attendance && attendance.length > 0) {
          const attendedCount = attendance.filter(a => a.attended).length;
          const rate = Math.round((attendedCount / attendance.length) * 100);
          setAttendanceRate(rate);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader title="Dashboard" />
        <div className="flex items-center justify-center flex-1">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Dashboard" />
      
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issueCount}</div>
              <p className="text-xs text-muted-foreground">
                Active policy campaigns and issues
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programCount}</div>
              <p className="text-xs text-muted-foreground">
                Programs addressing issues
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionCount}</div>
              <p className="text-xs text-muted-foreground">
                Total sessions scheduled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered parents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {issueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {issueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No issue data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Sessions by Month</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Program: {session.programName} • {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          {session.location || "No location"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No upcoming sessions</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-5xl font-bold mb-2">{attendanceRate}%</div>
                <p className="text-muted-foreground">Overall attendance rate</p>
                
                <div className="w-full mt-6 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {attendanceRate >= 80 ? (
                      "Excellent attendance rate! Keep up the good work."
                    ) : attendanceRate >= 60 ? (
                      "Good attendance rate. Consider strategies to improve engagement."
                    ) : (
                      "Attendance needs improvement. Review your engagement strategies."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}