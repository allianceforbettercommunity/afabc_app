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
import { Loader2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Issue {
  id: string;
  title: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface Program {
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

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    issueId: "",
    status: "Active",
    startDate: "",
    endDate: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("id, title")
        .order("title");

      if (error) {
        throw error;
      }

      setIssues(data || []);
    } catch (err: any) {
      console.error("Error fetching issues:", err);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch sessions for each program
      const programsWithSessions = await Promise.all(
        data.map(async (program) => {
          const { data: sessions, error: sessionsError } = await supabase
            .from("sessions")
            .select("id, title, date, location")
            .eq("programId", program.id)
            .order("date");

          if (sessionsError) {
            console.error("Error fetching sessions:", sessionsError);
            return { ...program, sessions: [] };
          }

          // Fetch issue details
          const { data: issue, error: issueError } = await supabase
            .from("issues")
            .select("id, title")
            .eq("id", program.issueId)
            .single();

          if (issueError) {
            console.error("Error fetching issue:", issueError);
            return { ...program, sessions: sessions || [], issue: null };
          }

          return { 
            ...program, 
            sessions: sessions || [],
            issue: issue || null
          };
        })
      );

      setPrograms(programsWithSessions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch programs");
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchPrograms();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProgram((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProgram((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the issue name for the selected issue
      const selectedIssue = issues.find(issue => issue.id === newProgram.issueId);
      const issueName = selectedIssue ? selectedIssue.title : "";

      const programData = {
        ...newProgram,
        issueName
      };

      const { data, error } = await supabase
        .from("programs")
        .insert([programData])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Program created successfully!");
      setNewProgram({
        title: "",
        description: "",
        issueId: "",
        status: "Active",
        startDate: "",
        endDate: "",
      });
      setIsDialogOpen(false);
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.message || "Failed to create program");
      console.error("Error creating program:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Pending":
        return "bg-yellow-500";
      case "Completed":
        return "bg-blue-500";
      case "Inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewDetails = (program: Program) => {
    setSelectedProgram(program);
    setIsDetailsDialogOpen(true);
    router.push(`/dashboard/programs/${program.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading programs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <Button onClick={fetchPrograms} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Programs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogDescription>
                Add a new program to help address an issue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newProgram.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProgram.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issueId">Related Issue</Label>
                  <Select
                    value={newProgram.issueId}
                    onValueChange={(value) =>
                      handleSelectChange("issueId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {issues.map((issue) => (
                        <SelectItem key={issue.id} value={issue.id}>
                          {issue.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProgram.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={newProgram.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={newProgram.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    "Create Program"
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
            <DialogTitle>{selectedProgram?.title}</DialogTitle>
            <DialogDescription>
              Program details and related sessions
            </DialogDescription>
          </DialogHeader>

          {selectedProgram && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Status</h3>
                  <Badge className={getStatusColor(selectedProgram.status)}>
                    {selectedProgram.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Related Issue</h3>
                  <p>{selectedProgram.issueName || "None"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProgram.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Start Date</h3>
                  <p>{formatDate(selectedProgram.startDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">End Date</h3>
                  <p>{formatDate(selectedProgram.endDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Sessions</h3>
                {selectedProgram.sessions && selectedProgram.sessions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProgram.sessions.map((session) => (
                      <div key={session.id} className="border rounded p-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(session.date)} {session.location && `• ${session.location}`}
                          </p>
                        </div>
                        <Link href={`/dashboard/sessions?id=${session.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions scheduled</p>
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
        {programs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No programs found. Create your first program to get started.</p>
          </div>
        ) : (
          programs.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <Badge className={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                </div>
                <CardDescription>
                  {program.issue?.title && (
                    <Link href={`/dashboard/issues?id=${program.issueId}`} className="hover:underline">
                      {program.issue.title}
                    </Link>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {program.description || "No description provided"}
                </p>
                <div className="flex justify-between mt-4 text-sm">
                  <div>
                    <p className="font-medium">Start: {formatDate(program.startDate)}</p>
                  </div>
                  <div>
                    <p className="font-medium">End: {formatDate(program.endDate)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  {program.sessions?.length || 0} sessions
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(program)}>
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
