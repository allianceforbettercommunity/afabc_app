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
import { Loader2 } from "lucide-react";

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

  const supabase = createClient();

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
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
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

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading issues...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <Button onClick={fetchIssues} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Issues</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Issue</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>
                Add a new issue to track in your advocacy work.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newIssue.title}
                    onChange={handleInputChange}
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
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value) =>
                        handleSelectChange("priority", value)
                      }
                    >
                      <SelectTrigger>
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
                <Button type="submit" disabled={isSubmitting}>
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

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              Issue details and related programs
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Category</h3>
                  <p>{selectedIssue.category || "Uncategorized"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Status</h3>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Priority</h3>
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedIssue.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Related Programs</h3>
                {selectedIssue.programs && selectedIssue.programs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedIssue.programs.map((program) => (
                      <div key={program.id} className="border rounded p-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{program.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {program.status} • {program.startDate && `Starts: ${new Date(program.startDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Link href={`/dashboard/programs?id=${program.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No programs associated with this issue</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p>Created: {new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p>Last Updated: {new Date(selectedIssue.updatedAt).toLocaleDateString()}</p>
                </div>
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
        {issues.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No issues found. Create your first issue to get started.</p>
          </div>
        ) : (
          issues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{issue.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {issue.category || "Uncategorized"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {issue.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  {issue.programs?.length || 0} programs
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(issue)}>
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