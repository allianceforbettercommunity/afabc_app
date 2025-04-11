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

      toast.success("Parent added successfully!");
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
      toast.error(err.message || "Failed to add parent");
      console.error("Error adding parent:", err);
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
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Parents Directory</h1>
          <p className="text-muted-foreground">Manage parent contacts and track their program participation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
              <DialogDescription>
                Add a new parent to track attendance and participation in programs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newParent.name}
                    onChange={handleInputChange}
                    className="focus-visible:ring-primary"
                    placeholder="Parent's full name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newParent.email}
                      onChange={handleInputChange}
                      className="focus-visible:ring-primary"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newParent.phone}
                      onChange={handleInputChange}
                      className="focus-visible:ring-primary"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newParent.address}
                    onChange={handleInputChange}
                    className="focus-visible:ring-primary"
                    placeholder="Home address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="childrenInfo">Children Information</Label>
                  <Textarea
                    id="childrenInfo"
                    name="childrenInfo"
                    value={newParent.childrenInfo}
                    onChange={handleInputChange}
                    rows={2}
                    className="focus-visible:ring-primary min-h-[80px]"
                    placeholder="Names and ages of children"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newParent.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="focus-visible:ring-primary min-h-[80px]"
                    placeholder="Additional information (optional)"
                  />
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
                      Adding...
                    </>
                  ) : (
                    "Add Parent"
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
            <span>Search Parents</span>
            <Badge variant="outline" className="font-normal text-xs">
              {filteredParents.length} of {parents.length} parents
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

      {filteredParents.length === 0 ? (
        <Card className="premium-shadow border-border/60 p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No parents found</h3>
            {filteredParents.length === 0 && parents.length > 0 ? (
              <p className="text-muted-foreground max-w-md mb-4">Your current search doesn&apos;t match any parents. Try using different search terms.</p>
            ) : (
              <p className="text-muted-foreground max-w-md mb-4">You haven&apos;t added any parents yet. Add your first parent to start tracking participation.</p>
            )}
            <Button 
              onClick={() => {
                if (filteredParents.length === 0 && parents.length > 0) {
                  setSearchQuery("");
                } else {
                  setIsDialogOpen(true);
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              {filteredParents.length === 0 && parents.length > 0 ? (
                <>Clear Search</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Parent
                </>
              )}
            </Button>
          </div>
        </Card>
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
                          <h3 className="text-sm font-medium">Children</h3>
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
    </div>
  );
} 