"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

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
        const issueCategories = issues?.reduce(
          (acc: Record<string, number>, issue) => {
            const category = issue.category || "Uncategorized";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {}
        );

        setIssueData(
          Object.entries(issueCategories || {}).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // Process session data by month
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const sessionsByMonthData = months.map((month) => {
          const count =
            sessions?.filter((session) => {
              if (!session.date) return false;
              const sessionMonth = new Date(session.date).toLocaleString(
                "default",
                { month: "short" }
              );
              return sessionMonth === month;
            }).length || 0;
          return { name: month, count };
        });

        setSessionsByMonth(sessionsByMonthData);

        // Set upcoming sessions (future dates only)
        const now = new Date();
        const upcoming =
          sessions
            ?.filter((session) => {
              if (!session.date) return false;
              return new Date(session.date) > now;
            })
            .slice(0, 5) || [];

        setUpcomingSessions(upcoming);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const CHART_COLORS = ["#FF9F29", "#2D5BFF", "#4CAF50", "#E91E63", "#9C27B0"];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-1">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground font-medium">
              Loading dashboard data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor your program activities and track engagement metrics.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="premium-shadow hover:shadow-premium-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <span>Issues</span>
              </CardTitle>
              <CardDescription>Active policy campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{issueCount}</div>
              <div className="mt-4">
                <Link
                  href="/dashboard/issues"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View all issues
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-shadow hover:shadow-premium-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent/20">
                  <Layers className="h-4 w-4 text-accent" />
                </div>
                <span>Initiatives</span>
              </CardTitle>
              <CardDescription>Active initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{programCount}</div>
              <div className="mt-4">
                <Link
                  href="/dashboard/programs"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View all initiatives
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-shadow hover:shadow-premium-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span>Sessions</span>
              </CardTitle>
              <CardDescription>Total scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessionCount}</div>
              <div className="mt-4">
                <Link
                  href="/dashboard/sessions"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View all sessions
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-shadow hover:shadow-premium-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span>People</span>
              </CardTitle>
              <CardDescription>Registered participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{parentCount}</div>
              <div className="mt-4">
                <Link
                  href="/dashboard/parents"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View all people
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="premium-shadow border-border/60">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="text-lg font-medium">
                Issues by Category
              </CardTitle>
              <CardDescription>
                Distribution of issues across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
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
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {issueData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No issue categories found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="premium-shadow border-border/60">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="text-lg font-medium">
                Sessions by Month
              </CardTitle>
              <CardDescription>
                Number of sessions scheduled per month
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Sessions"
                      fill="#FF9F29"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="premium-shadow border-border/60">
          <CardHeader className="bg-secondary/30 pb-4">
            <CardTitle className="text-lg font-medium">
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your next 5 scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {upcomingSessions.length > 0 ? (
              <div className="divide-y divide-border/40">
                {upcomingSessions.map((session) => {
                  const sessionDate = new Date(session.date);
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);

                  const isToday =
                    sessionDate.toDateString() === today.toDateString();
                  const isTomorrow =
                    sessionDate.toDateString() === tomorrow.toDateString();

                  let badgeText = "";
                  let badgeVariant: "default" | "outline" = "outline";

                  if (isToday) {
                    badgeText = "Today";
                    badgeVariant = "default";
                  } else if (isTomorrow) {
                    badgeText = "Tomorrow";
                    badgeVariant = "outline";
                  }

                  return (
                    <div key={session.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                          <Link
                            href={`/dashboard/sessions/${session.id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors"
                          >
                            {session.title}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {session.programName || "No program"}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1 inline-block" />
                            {sessionDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            {badgeText && (
                              <Badge
                                variant={badgeVariant}
                                className="rounded-full px-2.5 py-0.5 text-xs"
                              >
                                {badgeText}
                              </Badge>
                            )}
                            <span className="text-sm">
                              {sessionDate.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year:
                                  sessionDate.getFullYear() !==
                                  today.getFullYear()
                                    ? "numeric"
                                    : undefined,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-secondary p-4 mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">
                  No upcoming sessions
                </h3>
                <p className="text-muted-foreground">
                  Schedule your next session to see it here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
