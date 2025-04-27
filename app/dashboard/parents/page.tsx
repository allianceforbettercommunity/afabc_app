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
import { Loader2, Mail, Phone, Users, Search, Filter, Plus, User, Calendar, MapPin, AlertTriangle, XCircle, ArrowUpRight, NotebookPen, BookUser } from "lucide-react";
import { useRouter } from "next/navigation";

interface Attendance {
  sessionId: string;
  sessionTitle: string;
  date: string;
  attended: boolean;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  attendance?: Attendance[];
  attendanceCount?: {
    total: number;
    attended: number;
  };
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newParent, setNewParent] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    childrenInfo: "",
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page (2 rows of 3 cards)

  const supabase = createClient();
  const router = useRouter();

  const fetchParents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("parents")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      // Fetch attendance for each parent
      const parentsWithAttendance = await Promise.all(
        data.map(async (parent) => {
          // Get attendance data
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("*, sessions(id, title, date)")
            .eq("parentId", parent.id);

          if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            return { 
              ...parent, 
              attendance: [],
              attendanceCount: { total: 0, attended: 0 }
            };
          }

          // Format attendance data
          const attendance = attendanceData.map((item: any) => ({
            sessionId: item.sessionId,
            sessionTitle: item.sessions.title,
            date: item.sessions.date,
            attended: item.attended
          }));

          // Calculate attendance stats
          const attendanceCount = {
            total: attendance.length,
            attended: attendance.filter(a => a.attended).length
          };

          return { 
            ...parent, 
            attendance,
            attendanceCount
          };
        })
      );

      setParents(parentsWithAttendance);
    } catch (err: any) {
      setError(err.message || "Failed to fetch parents");
      console.error("Error fetching parents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const filterParents = (parent: Parent) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (parent.email && parent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (parent.phone && parent.phone.includes(searchQuery)) ||
      (parent.childrenInfo && parent.childrenInfo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  };

  const filteredParents = parents.filter(filterParents);

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParents = filteredParents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);

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
    setNewParent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("parents")
        .insert([newParent])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Person added successfully!");
      setNewParent({
        name: "",
        email: "",
        phone: "",
        address: "",
        childrenInfo: "",
        notes: "",
      });
      setIsDialogOpen(false);
      fetchParents();
    } catch (err: any) {
      toast.error(err.message || "Failed to add person");
      console.error("Error adding person:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (parent: Parent) => {
    router.push(`/dashboard/parents/${parent.id}`);
  };

  const getAttendanceRateColor = (parent: Parent) => {
    const total = parent.attendanceCount?.total || 0;
    const attended = parent.attendanceCount?.attended || 0;
    
    if (total === 0) return "";
    
    const rate = (attended / total) * 100;
    
    if (rate >= 80) return "text-green-600 bg-green-100";
    if (rate >= 50) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading parents...</p>
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
              Error Loading Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => fetchParents()} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">People</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
              <DialogDescription>
                Add a new person to track their participation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newParent.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newParent.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newParent.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newParent.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="childrenInfo">Information</Label>
                  <Textarea
                    id="childrenInfo"
                    name="childrenInfo"
                    value={newParent.childrenInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional information"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newParent.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Person"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search people..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentParents.length} of {filteredParents.length} people
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSearchQuery("")}
          >
            Clear Filter
          </Button>
        </div>
      </div>

      <Card className="premium-shadow border-border/60 mb-8">
        <CardHeader className="bg-secondary/30 pb-4">
          <CardTitle className="premium-gradient-text flex items-center gap-2">
            <Users className="h-5 w-5" />
            People Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-9 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {searchQuery && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("");
                }}
                className="border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center"
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Clear Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading people...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1 text-destructive">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchParents} className="bg-primary hover:bg-primary/90">
            Try Again
          </Button>
        </div>
      ) : currentParents.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No People Found</h3>
          <p className="text-muted-foreground mb-4">
            {parents.length === 0
              ? "Get started by adding your first person!"
              : "No people match your search criteria. Try a different search term."}
          </p>
          {parents.length === 0 && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentParents.map((parent) => (
              <Card 
                key={parent.id} 
                className="premium-shadow hover:shadow-premium-md transition-all border-border/60 hover:border-primary/20 overflow-hidden flex flex-col h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <span className="line-clamp-1">{parent.name}</span>
                    </CardTitle>
                    {(parent.attendanceCount?.total || 0) > 0 && (
                      <Badge 
                        variant="outline" 
                        className={`rounded-full px-2 py-0.5 text-xs ${getAttendanceRateColor(parent)}`}
                      >
                        {parent.attendanceCount?.attended || 0}/{parent.attendanceCount?.total || 0} sessions
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    {parent.email && (
                      <CardDescription className="flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <a 
                          href={`mailto:${parent.email}`} 
                          className="text-xs hover:text-primary hover:underline truncate"
                        >
                          {parent.email}
                        </a>
                      </CardDescription>
                    )}
                    {parent.phone && (
                      <CardDescription className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <a 
                          href={`tel:${parent.phone}`} 
                          className="text-xs hover:text-primary hover:underline"
                        >
                          {parent.phone}
                        </a>
                      </CardDescription>
                    )}
                    {parent.address && (
                      <CardDescription className="flex items-start">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground mt-0.5" />
                        <span className="text-xs line-clamp-1">{parent.address}</span>
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        <h3 className="text-sm font-medium">Session Attendance</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {parent.attendanceCount?.total ? 
                          `${Math.round((parent.attendanceCount.attended / parent.attendanceCount.total) * 100)}% attendance` : 
                          'No sessions'
                        }
                      </span>
                    </div>
                    
                    {parent.childrenInfo && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookUser className="h-4 w-4 text-primary/70" />
                          <h3 className="text-sm font-medium">Information</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{parent.childrenInfo}</p>
                      </div>
                    )}
                    
                    {parent.notes && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <NotebookPen className="h-4 w-4 text-primary/70" />
                          <h3 className="text-sm font-medium">Notes</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{parent.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:bg-primary/10 hover:text-primary" 
                    onClick={() => handleViewDetails(parent)}
                  >
                    <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                    View Full Profile
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

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedParent?.name}</DialogTitle>
            <DialogDescription>
              Person details and attendance history
            </DialogDescription>
          </DialogHeader>
          {/* ... rest of dialog content ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
} 