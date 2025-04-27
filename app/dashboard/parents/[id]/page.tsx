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
}

export default async function PersonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch person details
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
          <p className="text-red-800">{parentError.message || "Failed to fetch person details"}</p>
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
          <h1 className="text-3xl font-bold">Person Not Found</h1>
        </div>
        <p>The requested person could not be found.</p>
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

  const parent: Parent = {
    ...parentData,
    attendance: attendanceData || []
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
              <CardTitle>Person Details</CardTitle>
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
                      <h3 className="font-medium">Information</h3>
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/dashboard/parents/${parent.id}/edit`}>
                  <Button className="w-full">Edit Person</Button>
                </Link>
                <Link href={`/dashboard/sessions?parentId=${parent.id}`}>
                  <Button variant="outline" className="w-full">
                    View Sessions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Attendance</CardTitle>
              <CardDescription>
                {parent.attendance?.length || 0} sessions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Sessions the person has attended or been invited to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parent.attendance && parent.attendance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Attended</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parent.attendance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.session.date)}</TableCell>
                        <TableCell>
                          <Link 
                            href={`/dashboard/sessions/${item.sessionId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {item.session.title}
                          </Link>
                        </TableCell>
                        <TableCell>{item.session.programName}</TableCell>
                        <TableCell>
                          {item.attended ? (
                            <Badge className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No attendance records found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 