"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Users } from "lucide-react";

interface Program {
  id: string;
  title: string;
}

interface Parent {
  id: string;
  name: string;
  attended: boolean;
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
  parents?: Parent[];
  attendanceCount?: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    programId: "",
    date: "",
    location: "",
    description: "",
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const supabase = createClient();

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("id, title")
        .order("title");

      if (error) {
        throw error;
      }

      setPrograms(data || []);
    } catch (err: any) {
      console.error("Error fetching programs:", err);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      // Fetch attendance for each session
      const sessionsWithAttendance = await Promise.all(
        data.map(async (session) => {
          // Get attendance count
          const { count, error: countError } = await supabase
            .from("attendance")
            .select("*", { count: "exact", head: true })
            .eq("sessionId", session.id);

          if (countError) {
            console.error("Error fetching attendance count:", countError);
            return { ...session, attendanceCount: 0 };
          }

          // Get parents who attended
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("parentId, attended, parents(id, name)")
            .eq("sessionId", session.id);

          if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            return { ...session, attendanceCount: count || 0, parents: [] };
          }

          const parents = attendanceData.map((item: any) => ({
            id: item.parents.id,
            name: item.parents.name,
            attended: item.attended
          }));

          return { 
            ...session, 
            attendanceCount: count || 0,
            parents
          };
        })
      );

      setSessions(sessionsWithAttendance);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSessions();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSession((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewSession((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the program name for the selected program
      const selectedProgram = programs.find(program => program.id === newSession.programId);
      const programName = selectedProgram ? selectedProgram.title : "";

      const sessionData = {
        ...newSession,
        programName
      };

      const { data, error } = await supabase
        .from("sessions")
        .insert([sessionData])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Session created successfully!");
      setNewSession({
        title: "",
        programId: "",
        date: "",
        location: "",
        description: "",
        notes: "",
      });
      setIsDialogOpen(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message || "Failed to create session");
      console.error("Error creating session:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isPastSession = (dateString: string) => {
    if (!dateString) return false;
    const sessionDate = new Date(dateString);
    const today = new Date();
    return sessionDate < today;
  };

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <Button onClick={fetchSessions} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Schedule a new session for a program.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newSession.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="programId">Program</Label>
                  <Select
                    value={newSession.programId}
                    onValueChange={(value) =>
                      handleSelectChange("programId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={newSession.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={newSession.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newSession.description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newSession.notes}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Session"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedSession?.title}</DialogTitle>
            <DialogDescription>
              Session details and attendance information
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Date</h3>
                  <p>{formatDate(selectedSession.date)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Time</h3>
                  <p>{formatTime(selectedSession.date)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm">Location</h3>
                <p>{selectedSession.location || "No location specified"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm">Program</h3>
                <p>
                  {selectedSession.programName ? (
                    <Link href={`/dashboard/programs?id=${selectedSession.programId}`} className="hover:underline text-blue-600">
                      {selectedSession.programName}
                    </Link>
                  ) : (
                    "No program associated"
                  )}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm">Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.notes || "No notes provided"}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Attendance ({selectedSession.attendanceCount || 0} parents)</h3>
                {selectedSession.parents && selectedSession.parents.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parent
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedSession.parents.map((parent) => (
                          <tr key={parent.id}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <Link href={`/dashboard/parents?id=${parent.id}`} className="hover:underline text-blue-600">
                                {parent.name}
                              </Link>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {parent.attended ? (
                                <Badge className="bg-green-500">Attended</Badge>
                              ) : (
                                <Badge variant="outline">Absent</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No attendance records</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No sessions found. Create your first session to get started.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{session.title}</CardTitle>
                  {isPastSession(session.date) ? (
                    <Badge variant="outline">Past</Badge>
                  ) : (
                    <Badge className="bg-green-500">Upcoming</Badge>
                  )}
                </div>
                <CardDescription>
                  {session.programName && (
                    <Link href={`/dashboard/programs?id=${session.programId}`} className="hover:underline">
                      {session.programName}
                    </Link>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(session.date)} at {formatTime(session.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.location || "No location specified"}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {session.attendanceCount || 0} attendees
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(session)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 