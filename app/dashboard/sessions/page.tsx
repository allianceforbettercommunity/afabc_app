"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Users, ChevronUp, ChevronDown, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

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

type SortField = 'date' | 'title' | 'programName' | 'attendanceCount';
type SortOrder = 'asc' | 'desc';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "past" | "upcoming">("all");
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 items per page for sessions

  const supabase = createClient();
  const router = useRouter();

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filterSessions = (session: Session) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.description && session.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (session.location && session.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (session.programName && session.programName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Program filter
    const matchesProgram = programFilter === "all" || session.programId === programFilter;
    
    // Date filter
    const today = new Date();
    const sessionDate = new Date(session.date);
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "past" && sessionDate < today) ||
      (dateFilter === "upcoming" && sessionDate >= today);
    
    return matchesSearch && matchesProgram && matchesDate;
  };

  const filteredSessions = sessions.filter(filterSessions);

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Handle sorting along with pagination
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'date':
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'programName':
        return multiplier * (a.programName || '').localeCompare(b.programName || '');
      case 'attendanceCount':
        return multiplier * ((a.attendanceCount || 0) - (b.attendanceCount || 0));
      default:
        return 0;
    }
  });
  
  const currentSessions = sortedSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);

  // Handle page navigation
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    router.push(`/dashboard/sessions/${session.id}`);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Sessions</h1>
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

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sessions..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={dateFilter} onValueChange={(value: "all" | "past" | "upcoming") => setDateFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">
            Showing {currentSessions.length} of {filteredSessions.length} sessions
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchQuery("");
              setProgramFilter("all");
              setDateFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                  <div className="flex items-center">
                    Title
                    <SortIcon field="title" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('programName')}>
                  <div className="flex items-center">
                    Program
                    <SortIcon field="programName" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center">
                    Date
                    <SortIcon field="date" />
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('attendanceCount')}>
                  <div className="flex items-center">
                    Attendance
                    <SortIcon field="attendanceCount" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No sessions found. Adjust filters or create a new session.
                  </TableCell>
                </TableRow>
              ) : (
                currentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/programs?id=${session.programId}`} className="hover:underline">
                        {session.programName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatDate(session.date)} at {formatTime(session.date)}
                    </TableCell>
                    <TableCell>{session.location || "No location"}</TableCell>
                    <TableCell>{session.attendanceCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(session)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? "bg-primary hover:bg-primary/90" : "border-primary/30 hover:bg-primary/10 hover:text-primary"}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 