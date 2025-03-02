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
import { toast } from "sonner";
import { Loader2, Mail, Phone, Users } from "lucide-react";
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getAttendanceRate = (parent: Parent) => {
    if (!parent.attendanceCount || parent.attendanceCount.total === 0) return 0;
    return Math.round((parent.attendanceCount.attended / parent.attendanceCount.total) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewDetails = (parent: Parent) => {
    router.push(`/dashboard/parents/${parent.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading parents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <Button onClick={fetchParents} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parents</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Parent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
              <DialogDescription>
                Add a new parent to track attendance and participation.
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
                <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="childrenInfo">Children Information</Label>
                  <Textarea
                    id="childrenInfo"
                    name="childrenInfo"
                    value={newParent.childrenInfo}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Names and ages of children"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newParent.notes}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No parents found. Add your first parent to get started.</p>
          </div>
        ) : (
          parents.map((parent) => (
            <Card key={parent.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{parent.name}</CardTitle>
                <CardDescription>
                  {parent.attendanceCount && parent.attendanceCount.total > 0 && (
                    <span className={getAttendanceColor(getAttendanceRate(parent))}>
                      {getAttendanceRate(parent)}% attendance rate
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {parent.email && (
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{parent.email}</span>
                  </div>
                )}
                {parent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parent.phone}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  {typeof parent.attendanceCount === 'object' 
                    ? `${parent.attendanceCount.attended || 0}/${parent.attendanceCount.total || 0} sessions` 
                    : `${parent.attendanceCount || 0} sessions`}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(parent)}>
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