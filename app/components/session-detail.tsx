'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, ClockIcon, MapPin, Users, CheckCircle, Info, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AttendanceManager from "./attendance-manager";

interface Program {
  id: string;
  title: string;
  status: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Attendance {
  id: string;
  parentId: string;
  attended: boolean;
  notes: string;
  parent: Parent;
}

interface Session {
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
  program?: Program;
  attendance?: Attendance[];
}

interface SessionDetailProps {
  sessionId: string;
}

export default function SessionDetail({ sessionId }: SessionDetailProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddParentDialog, setShowAddParentDialog] = useState(false);
  const supabase = createClient();

  const fetchSessionDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Session not found");

      // Fetch related program
      let programData = null;
      if (sessionData.programId) {
        const { data, error } = await supabase
          .from("programs")
          .select("id, title, status")
          .eq("id", sessionData.programId)
          .single();
        
        if (!error) {
          programData = data;
        }
      }

      // Fetch attendance with parent details
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select(`
          id,
          parentId,
          attended,
          notes,
          parent:parents(id, name, email, phone)
        `)
        .eq("sessionId", sessionId);

      if (attendanceError) throw attendanceError;

      setSession({
        ...sessionData,
        program: programData || undefined,
        attendance: attendanceData || []
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch session details");
      console.error("Error fetching session details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isPastSession = (dateString: string) => {
    if (!dateString) return false;
    const sessionDate = new Date(dateString);
    const today = new Date();
    return sessionDate < today;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/dashboard/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Link>
          </Button>
        </div>
        <Card className="border-destructive/30 bg-destructive/5 shadow-premium-sm">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Info className="h-5 w-5" />
              Error Loading Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">{error || "Session not found"}</p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/dashboard/sessions">Return to Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate attendance stats
  const totalAttendees = session.attendance?.length || 0;
  const presentCount = session.attendance?.filter(a => a.attended).length || 0;
  const attendanceRate = totalAttendees > 0 ? (presentCount / totalAttendees) * 100 : 0;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/dashboard/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{session.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isPastSession(session.date) ? (
                <Badge variant="outline" className="rounded-full px-3 py-0.5 bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Completed
                </Badge>
              ) : (
                <Badge className="rounded-full px-3 py-0.5 bg-accent text-accent-foreground">
                  Upcoming
                </Badge>
              )}
              {session.program && (
                <Badge className="rounded-full px-3 py-0.5 bg-primary text-primary-foreground">
                  {session.program.title}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="premium-shadow overflow-hidden border-border/60">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="premium-gradient-text">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-medium text-foreground">Date & Time</h3>
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-foreground font-semibold">{formatDate(session.date)}</p>
                    <p className="text-muted-foreground">{formatTime(session.date)}</p>
                  </div>
                </div>
                
                {session.location && (
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-foreground">Location</h3>
                    </div>
                    <p className="ml-8 text-foreground">{session.location}</p>
                  </div>
                )}
              </div>
                
                {session.description && (
                  <div className="mt-6 p-4 rounded-lg border border-border/40">
                    <h3 className="font-medium text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{session.description}</p>
                  </div>
                )}
                
                {session.notes && (
                  <div className="mt-6 p-4 rounded-lg border border-border/40 bg-secondary/20">
                    <h3 className="font-medium text-foreground mb-2">Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{session.notes}</p>
                  </div>
                )}
            </CardContent>
          </Card>

          <AttendanceManager 
            sessionId={sessionId} 
            existingAttendance={session.attendance || []} 
            onUpdate={fetchSessionDetails} 
          />
        </div>

        <div className="space-y-6">
          <Card className="premium-shadow border-border/60">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="text-lg premium-gradient-text">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-sm font-medium">{attendanceRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center rounded-lg bg-secondary/30 border border-border/40">
                    <p className="text-2xl font-bold text-primary">{presentCount}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-secondary/30 border border-border/40">
                    <p className="text-2xl font-bold text-primary">{totalAttendees}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowAddParentDialog(true)}
                  className="w-full flex items-center justify-center gap-2"
                  variant="default"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Attendee
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {session.program && (
            <Card className="premium-shadow border-border/60">
              <CardHeader className="bg-secondary/30 pb-4">
                <CardTitle className="text-lg premium-gradient-text">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                    <p className="font-medium">{session.program.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge className="mt-1" variant={session.program.status === "active" ? "default" : "outline"}>
                      {session.program.status}
                    </Badge>
                  </div>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    <Link href={`/dashboard/programs/${session.program.id}`}>
                      View Program
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 