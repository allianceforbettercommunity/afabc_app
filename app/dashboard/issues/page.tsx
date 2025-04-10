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
import { Loader2, Search, Filter, Plus, FileEdit, Tag, Clock, AlertTriangle, CheckCircle, XCircle, AlertCircle, Calendar, ArrowUpRight, Folders } from "lucide-react";
import { useRouter } from "next/navigation";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  programs?: Program[];
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
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    category: "",
    status: "Active",
    priority: "Medium",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page (2 rows of 3 cards)

  const supabase = createClient();
  const router = useRouter();

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch programs for each issue
      const issuesWithPrograms = await Promise.all(
        data.map(async (issue) => {
          const { data: programs, error: programsError } = await supabase
            .from("programs")
            .select("*")
            .eq("issueId", issue.id);

          if (programsError) {
            console.error("Error fetching programs:", programsError);
            return { ...issue, programs: [] };
          }

          return { ...issue, programs: programs || [] };
        })
      );

      setIssues(issuesWithPrograms);
    } catch (err: any) {
      setError(err.message || "Failed to fetch issues");
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("issues")
        .insert([newIssue])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Issue created successfully!");
      setNewIssue({
        title: "",
        description: "",
        category: "",
        status: "Active",
        priority: "Medium",
      });
      setIsDialogOpen(false);
      fetchIssues();
    } catch (err: any) {
      toast.error(err.message || "Failed to create issue");
      console.error("Error creating issue:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive text-destructive-foreground";
      case "Medium":
        return "bg-amber-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      case "Medium":
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
      case "Low":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-primary/90 text-primary-foreground";
      case "Pending":
        return "bg-amber-500 text-white";
      case "Completed":
        return "bg-green-500 text-white";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      case "Pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "Completed":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      case "Inactive":
        return <XCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (issue: Issue) => {
    router.push(`/dashboard/issues/${issue.id}`);
  };

  const filterIssues = (issue: Issue) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.category && issue.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    
    // Category filter
    const matchesCategory = 
      categoryFilter === "all" || 
      (issue.category && issue.category === categoryFilter);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  };

  const filteredIssues = issues.filter(filterIssues);

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIssues = filteredIssues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  // Handle page navigation
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique categories for filter
  const uniqueCategories = Array.from(
    new Set(issues.filter(i => i.category).map(i => i.category))
  ).sort();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Card className="border-destructive/30 bg-destructive/5 shadow-premium-sm max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={fetchIssues} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Policy Issues</h1>
          <p className="text-muted-foreground">Manage and track policy campaigns and advocacy issues</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>
                Add a new policy issue or campaign to track in your advocacy work.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newIssue.title}
                    onChange={handleInputChange}
                    className="focus-visible:ring-primary"
                    placeholder="Issue title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newIssue.description}
                    onChange={handleInputChange}
                    className="focus-visible:ring-primary min-h-[100px]"
                    placeholder="Describe the issue or policy campaign"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={newIssue.category}
                    onChange={handleInputChange}
                    className="focus-visible:ring-primary"
                    placeholder="e.g., Education, Healthcare, Environment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newIssue.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="focus-visible:ring-primary">
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
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value) =>
                        handleSelectChange("priority", value)
                      }
                    >
                      <SelectTrigger className="focus-visible:ring-primary">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Issue"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="premium-shadow border-border/60 mb-8">
        <CardHeader className="bg-secondary/30 pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Filter Issues</span>
            <Badge variant="outline" className="font-normal text-xs">
              {filteredIssues.length} of {issues.length} issues
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search issues..."
                  className="w-full pl-9 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="focus-visible:ring-primary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="focus-visible:ring-primary">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uniqueCategories.length > 0 && (
              <div className="w-full md:w-64">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="focus-visible:ring-primary">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center"
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredIssues.length === 0 ? (
        <Card className="premium-shadow border-border/60 p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <FileEdit className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No issues found</h3>
            {filteredIssues.length === 0 && issues.length > 0 ? (
              <p className="text-muted-foreground max-w-md mb-4">Your current filter settings don&apos;t match any issues. Try adjusting your filters.</p>
            ) : (
              <p className="text-muted-foreground max-w-md mb-4">You haven&apos;t created any policy issues yet. Add your first issue to start tracking your advocacy work.</p>
            )}
            <Button 
              onClick={() => {
                if (filteredIssues.length === 0 && issues.length > 0) {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                } else {
                  setIsDialogOpen(true);
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              {filteredIssues.length === 0 && issues.length > 0 ? (
                <>Clear Filters</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Issue
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentIssues.map((issue) => (
              <Card 
                key={issue.id} 
                className="premium-shadow hover:shadow-premium-md transition-all border-border/60 hover:border-primary/20 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                    <Badge className={`rounded-full px-2.5 py-0.5 flex items-center ${getPriorityColor(issue.priority)}`}>
                      {getPriorityIcon(issue.priority)}
                      {issue.priority}
                    </Badge>
                  </div>
                  <CardDescription className="flex flex-wrap gap-2 mt-3">
                    <Badge 
                      className={`rounded-full px-2.5 py-0.5 flex items-center ${getStatusColor(issue.status)}`}
                    >
                      {getStatusIcon(issue.status)}
                      {issue.status}
                    </Badge>
                    {issue.category && (
                      <Badge 
                        variant="outline" 
                        className="rounded-full px-2.5 py-0.5 flex items-center border-primary/20"
                      >
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        {issue.category}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {issue.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{issue.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mb-3">No description provided</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(issue.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Folders className="h-3.5 w-3.5 mr-1" />
                      {issue.programs?.length || 0} program{issue.programs?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:bg-primary/10 hover:text-primary" 
                    onClick={() => handleViewDetails(issue)}
                  >
                    <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
      )}
    </div>
  );
}