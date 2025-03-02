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
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: sessions } = await supabase.from('sessions').select('id');
  
  return (sessions || []).map((session) => ({
    id: session.id,
  }));
}

interface Program {
  id: string;
  title: string;
  status: string;
}

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
  attendance?: Attendance[];
  attendanceRate?: number;
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch session details
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (sessionError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{sessionError.message || "Failed to fetch session details"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/sessions">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Session Not Found</h1>
        </div>
        <p>The requested session could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/sessions">Go Back</Link>
        </Button>
      </div>
    );
  }

  // Fetch related program
  let programData = null;
  if (sessionData.programId) {
    const { data, error } = await supabase
      .from("programs")
      .select("id, title, status")
      .eq("id", sessionData.programId)
      .single();
    
    if (!error) {
      programData = data;
    } else {
      console.error("Error fetching related program:", error);
    }
  }

  // Fetch attendance with parent details
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .select(`
      id,
      parentId,
      attended,
      notes,
      parent:parents(id, name, email, phone)
    `)
    .eq("sessionId", params.id);

  if (attendanceError) {
    console.error("Error fetching attendance:", attendanceError);
  }

  // Calculate attendance rate
  const attendanceRate = attendanceData 
    ? (attendanceData.filter(a => a.attended).length / attendanceData.length) * 100 
    : 0;

  const session: Session = {
    ...sessionData,
    program: programData || undefined,
    attendance: attendanceData || [],
    attendanceRate: attendanceData && attendanceData.length > 0 ? attendanceRate : 0
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isPastSession = (dateString: string) => {
    if (!dateString) return false;
    const sessionDate = new Date(dateString);
    const today = new Date();
    return sessionDate < today;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/sessions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{session.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {isPastSession(session.date) ? (
                  <Badge variant="outline">Completed</Badge>
                ) : (
                  <Badge>Upcoming</Badge>
                )}
                {session.program && (
                  <Badge className="bg-blue-500">
                    Program: {session.program.title}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p className="text-muted-foreground">{formatDate(session.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Time</h3>
                      <p className="text-muted-foreground">{formatTime(session.date)}</p>
                    </div>
                  </div>
                </div>
                
                {session.location && (
                  <>
                    <Separator />
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-muted-foreground">{session.location}</p>
                      </div>
                    </div>
                  </>
                )}
                
                {session.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">{session.description}</p>
                    </div>
                  </>
                )}
                
                {session.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Notes</h3>
                      <p className="text-muted-foreground">{session.notes}</p>
                    </div>
                  </>
                )}
                
                {session.program && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Program</h3>
                      <div className="mt-2">
                        <Link href={`/dashboard/programs/${session.program.id}`}>
                          <Button variant="outline" size="sm">
                            {session.program.title}
                          </Button>
                        </Link>
                      </div>
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
                <Link href={`/dashboard/sessions?edit=${session.id}`}>
                  <Button className="w-full">Edit Session</Button>
                </Link>
                <Link href={`/dashboard/sessions?id=${session.id}&attendance=true`}>
                  <Button variant="outline" className="w-full">
                    Manage Attendance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {session.attendance && session.attendance.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {session.attendance.filter(a => a.attended).length} of {session.attendance.length} parents attended
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Attendance Rate</span>
                      <span>{Math.round(session.attendanceRate || 0)}%</span>
                    </div>
                    <Progress value={session.attendanceRate || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {session.attendance && session.attendance.length > 0 && (
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>
                  Parents who attended this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.parent.name}
                        </TableCell>
                        <TableCell>
                          {record.parent.email && (
                            <a href={`mailto:${record.parent.email}`} className="text-blue-600 hover:underline">
                              {record.parent.email}
                            </a>
                          )}
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
                          <Link href={`/dashboard/parents/${record.parent.id}`}>
                            <Button variant="outline" size="sm">View Parent</Button>
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