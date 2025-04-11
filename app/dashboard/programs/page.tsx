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
import { Loader2, ChevronUp, ChevronDown, Pencil, Search, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

type SortField = 'title' | 'issueName' | 'status' | 'startDate' | 'sessionCount';
type SortOrder = 'asc' | 'desc';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState("");
  const [issueFilter, setIssueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issueId: "",
    status: "Active",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page (2 rows of 3 cards)

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

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

    // Check for edit parameter in URL
    const editId = searchParams.get('edit');
    if (editId) {
      const programToEdit = programs.find(p => p.id === editId);
      if (programToEdit) {
        handleEditProgram(programToEdit);
      }
    }
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || "",
      issueId: program.issueId,
      status: program.status,
      startDate: program.startDate || "",
      endDate: program.endDate || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      description: "",
      issueId: "",
      status: "Active",
      startDate: "",
      endDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedIssue = issues.find(issue => issue.id === formData.issueId);
      const issueName = selectedIssue ? selectedIssue.title : "";

      const programData = {
        ...formData,
        issueName
      };

      let result;
      if (editingProgram) {
        // Update existing program
        result = await supabase
          .from("programs")
          .update(programData)
          .eq('id', editingProgram.id)
          .select();
        
        if (result.error) throw result.error;
        toast.success("Program updated successfully!");
      } else {
        // Create new program
        result = await supabase
          .from("programs")
          .insert([programData])
          .select();
        
        if (result.error) throw result.error;
        toast.success("Program created successfully!");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchPrograms();
      
      // Remove edit parameter from URL if it exists
      if (searchParams.has('edit')) {
        router.push('/dashboard/programs');
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${editingProgram ? 'update' : 'create'} program`);
      console.error(`Error ${editingProgram ? 'updating' : 'creating'} program:`, err);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filterPrograms = (program: Program) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (program.issueName && program.issueName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Issue filter
    const matchesIssue = issueFilter === "all" || program.issueId === issueFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "all" || program.status === statusFilter;
    
    return matchesSearch && matchesIssue && matchesStatus;
  };

  const filteredPrograms = programs.filter(filterPrograms);

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'issueName': {
        const aName = a.issue?.title || '';
        const bName = b.issue?.title || '';
        return multiplier * aName.localeCompare(bName);
      }
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'startDate':
        return multiplier * (new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
      case 'sessionCount':
        return multiplier * ((a.sessions?.length || 0) - (b.sessions?.length || 0));
      default:
        return 0;
    }
  });
  const currentPrograms = sortedPrograms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPrograms.length / itemsPerPage);

  // Handle page navigation
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Programs</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>Add New Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProgram ? 'Edit Program' : 'Create New Program'}</DialogTitle>
              <DialogDescription>
                {editingProgram ? 'Update program details.' : 'Add a new program to help address an issue.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issueId">Related Issue</Label>
                  <Select
                    value={formData.issueId}
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
                    value={formData.status}
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
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingProgram ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingProgram ? 'Update Program' : 'Create Program'
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
                placeholder="Search programs..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={issueFilter} onValueChange={setIssueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by issue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                {issues.map((issue) => (
                  <SelectItem key={issue.id} value={issue.id}>
                    {issue.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">
            Showing {currentPrograms.length} of {filteredPrograms.length} programs
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchQuery("");
              setIssueFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                  <div className="flex items-center">
                    Title
                    <SortIcon field="title" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('issueName')}>
                  <div className="flex items-center">
                    Related Issue
                    <SortIcon field="issueName" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
                  <div className="flex items-center">
                    Start Date
                    <SortIcon field="startDate" />
                  </div>
                </TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('sessionCount')}>
                  <div className="flex items-center">
                    Sessions
                    <SortIcon field="sessionCount" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No programs found. Adjust filters or create a new program.
                  </TableCell>
                </TableRow>
              ) : (
                currentPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.title}</TableCell>
                    <TableCell>
                      {program.issue?.title && (
                        <Link href={`/dashboard/issues?id=${program.issueId}`} className="hover:underline">
                          {program.issue.title}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(program.startDate)}</TableCell>
                    <TableCell>{formatDate(program.endDate)}</TableCell>
                    <TableCell>{program.sessions?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProgram(program)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(program)}>
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
