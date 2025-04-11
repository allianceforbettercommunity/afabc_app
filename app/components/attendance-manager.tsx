"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Search, CheckCircle, Edit, X, Mail, Phone } from "lucide-react";

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

interface AttendanceManagerProps {
  sessionId: string;
  existingAttendance?: Attendance[];
  onUpdate?: () => void;
  onAttendanceChange?: () => void;
}

interface NewParent {
  name: string;
  email: string;
  phone: string;
}

export default function AttendanceManager({ 
  sessionId, 
  existingAttendance = [], 
  onUpdate, 
  onAttendanceChange 
}: AttendanceManagerProps) {
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Parent[]>([]);
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  const [newParent, setNewParent] = useState<NewParent>({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
  const [attendanceNote, setAttendanceNote] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState(false);
  
  const supabase = createClient();

  const handleCallback = () => {
    if (onUpdate) onUpdate();
    if (onAttendanceChange) onAttendanceChange();
  };

  const searchParents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const { data, error } = await supabase
      .from("parents")
      .select("id, name, email, phone")
      .ilike("name", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Error searching parents:", error);
      return;
    }

    // Filter out parents who are already in attendance
    const parentIds = existingAttendance.map(a => a.parentId);
    const filteredResults = data?.filter(parent => !parentIds.includes(parent.id)) || [];
    
    setSearchResults(filteredResults);
  };

  const addParentToSession = async (parentId: string) => {
    const { error } = await supabase
      .from("attendance")
      .insert({ sessionId, parentId, attended: true });

    if (error) {
      console.error("Error adding parent to session:", error);
      toast.error("Failed to add parent to session");
    } else {
      toast.success("Parent added to session");
      handleCallback();
      setIsAttendanceDialogOpen(false);
    }
  };

  const updateAttendance = async (attendanceId: string, updates: { attended?: boolean, notes?: string }) => {
    const { error } = await supabase
      .from("attendance")
      .update(updates)
      .eq("id", attendanceId);

    if (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
      return false;
    } else {
      toast.success("Attendance updated");
      handleCallback();
      return true;
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create new parent
      const { data: parentData, error: parentError } = await supabase
        .from("parents")
        .insert([newParent])
        .select()
        .single();

      if (parentError) throw parentError;

      // Add parent to session
      await addParentToSession(parentData.id);

      // Reset form and state
      setNewParent({ name: "", email: "", phone: "" });
      setIsCreatingParent(false);
      setSearchQuery("");
      setSearchResults([]);

      toast.success("New parent created and added to session");
      setIsAttendanceDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating parent:", error);
      toast.error(error.message || "Failed to create parent");
    }
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendanceId(attendance.id);
    setAttendanceNote(attendance.notes || "");
    setAttendanceStatus(attendance.attended);
    setIsEditingAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (!editingAttendanceId) return;
    
    const success = await updateAttendance(editingAttendanceId, {
      attended: attendanceStatus,
      notes: attendanceNote
    });
    
    if (success) {
      setIsEditingAttendance(false);
      setEditingAttendanceId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParent(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Card className="premium-shadow overflow-hidden border-border/60">
        <CardHeader className="bg-secondary/30 pb-4">
          <CardTitle className="premium-gradient-text flex items-center justify-between">
            <span>Attendance List</span>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full px-4 bg-primary hover:bg-primary/90"
              onClick={() => setIsAttendanceDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Attendee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {existingAttendance.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="font-medium">{record.parent.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {record.parent.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {record.parent.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.attended ? (
                          <Badge className="bg-accent text-accent-foreground rounded-full px-2 py-0.5">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full px-2 py-0.5">
                            <X className="h-3 w-3 mr-1" />
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {record.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full hover:bg-secondary/80 hover:text-primary"
                          onClick={() => handleEditAttendance(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No attendees yet</h3>
              <p className="text-muted-foreground mb-4">Add parents to track attendance for this session</p>
              <Button 
                onClick={() => setIsAttendanceDialogOpen(true)}
                variant="default"
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Attendee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Attendance</DialogTitle>
            <DialogDescription>Search for existing parents or create a new one.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isCreatingParent ? (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search parents by name"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchParents(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setIsCreatingParent(true)} variant="default" className="bg-primary hover:bg-primary/90">
                    New Parent
                  </Button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((parent) => (
                      <div key={parent.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                        <div>
                          <div className="font-medium">{parent.name}</div>
                          <div className="text-sm text-muted-foreground">{parent.email}</div>
                        </div>
                        <Button 
                          size="sm" 
                          className="rounded-full bg-primary hover:bg-primary/90" 
                          variant="default"
                          onClick={() => addParentToSession(parent.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No parents found with that name
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Search for parents by name
                    </div>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleCreateParent} className="space-y-4">
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
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={newParent.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingParent(false)} className="border-primary/30 hover:bg-primary/10 hover:text-primary">
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="bg-primary hover:bg-primary/90">
                    Create & Add
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingAttendance} onOpenChange={setIsEditingAttendance}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update attendance status and notes</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="attendance-status">Attendance Status</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  id="attendance-status" 
                  checked={attendanceStatus}
                  onCheckedChange={setAttendanceStatus}
                />
                <span className="text-sm font-medium">
                  {attendanceStatus ? "Present" : "Absent"}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendance-notes">Notes</Label>
              <Textarea
                id="attendance-notes"
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
                rows={3}
                placeholder="Add notes about attendance (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingAttendance(false)} className="border-primary/30 hover:bg-primary/10 hover:text-primary">
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance} variant="default" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 