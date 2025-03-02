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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: parents } = await supabase.from('parents').select('id');
  
  return (parents || []).map((parent) => ({
    id: parent.id,
  }));
}

interface Attendance {
  id: string;
  sessionId: string;
  attended: boolean;
  notes: string;
  session: {
    id: string;
    title: string;
    date: string;
    programId: string;
    programName: string;
  };
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
  attendanceRate?: number;
}

export default async function ParentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch parent details
  const { data: parentData, error: parentError } = await supabase
    .from("parents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (parentError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/parents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{parentError.message || "Failed to fetch parent details"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/parents">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!parentData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/parents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Parent Not Found</h1>
        </div>
        <p>The requested parent could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/parents">Go Back</Link>
        </Button>
      </div>
    );
  }

  // Fetch attendance with session details
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .select(`
      id,
      sessionId,
      attended,
      notes,
      session:sessions(id, title, date, programId, programName)
    `)
    .eq("parentId", params.id)
    .order("session(date)", { ascending: false });

  if (attendanceError) {
    console.error("Error fetching attendance:", attendanceError);
  }

  // Calculate attendance rate
  const attendanceRate = attendanceData 
    ? (attendanceData.filter(a => a.attended).length / attendanceData.length) * 100 
    : 0;

  const parent: Parent = {
    ...parentData,
    attendance: attendanceData || [],
    attendanceRate: attendanceData && attendanceData.length > 0 ? attendanceRate : 0
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/parents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{parent.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Parent Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parent.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-muted-foreground">{parent.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {parent.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-muted-foreground">{parent.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {parent.address && (
                  <>
                    <Separator />
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-muted-foreground">{parent.address}</p>
                      </div>
                    </div>
                  </>
                )}
                
                {parent.childrenInfo && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Children Information</h3>
                      <p className="text-muted-foreground">{parent.childrenInfo}</p>
                    </div>
                  </>
                )}
                
                {parent.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Notes</h3>
                      <p className="text-muted-foreground">{parent.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/dashboard/parents?edit=${parent.id}`}>
                  <Button className="w-full">Edit Parent</Button>
                </Link>
                <Link href={`/dashboard/sessions?parentId=${parent.id}`}>
                  <Button variant="outline" className="w-full">
                    View Sessions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {parent.attendance && parent.attendance.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {parent.attendance.filter(a => a.attended).length} of {parent.attendance.length} sessions attended
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Attendance Rate</span>
                      <span>{Math.round(parent.attendanceRate || 0)}%</span>
                    </div>
                    <Progress value={parent.attendanceRate || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {parent.attendance && parent.attendance.length > 0 && (
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  Sessions this parent has attended
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parent.attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.session.title}
                        </TableCell>
                        <TableCell>
                          {record.session.programName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {formatDate(record.session.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.attended ? (
                            <Badge className="bg-green-500">Attended</Badge>
                          ) : (
                            <Badge variant="outline">Absent</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/sessions/${record.session.id}`}>
                            <Button variant="outline" size="sm">View Session</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 