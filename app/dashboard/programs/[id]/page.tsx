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
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// This allows for dynamic data fetching even though generateStaticParams is present
export const dynamic = 'force-dynamic';
// This disables static generation for this route
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: programs } = await supabase.from('programs').select('id');
  
  return (programs || []).map((program) => ({
    id: program.id,
  }));
}

interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  notes: string;
  attendanceCount?: number;
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

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch program details
  const { data: programData, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (programError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/programs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{programError.message || "Failed to fetch program details"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/programs">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/programs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Program Not Found</h1>
        </div>
        <p>The requested program could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/programs">Go Back</Link>
        </Button>
      </div>
    );
  }

  // Fetch related issue
  let issueData = null;
  if (programData.issueId) {
    const { data, error } = await supabase
      .from("issues")
      .select("id, title, category, status")
      .eq("id", programData.issueId)
      .single();
    
    if (!error) {
      issueData = data;
    } else {
      console.error("Error fetching related issue:", error);
    }
  }

  // Fetch related sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("sessions")
    .select(`
      id, 
      title, 
      date, 
      location, 
      description, 
      notes,
      (
        SELECT COUNT(*) 
        FROM attendance 
        WHERE attendance."sessionId" = sessions.id
      ) AS "attendanceCount"
    `)
    .eq("programId", params.id)
    .order("date", { ascending: true })
    .limit(100); // Explicitly set a high limit

  if (sessionsError) {
    console.error("Error fetching related sessions:", sessionsError);
  }

  // Log the results for debugging
  console.log(`Fetched ${sessionsData?.length || 0} sessions for program ${params.id}`);
  
  // Also try fetching by program name for backward compatibility
  let additionalSessions: any[] = [];
  
  // If we didn't find any sessions with programId, try to find sessions with matching programName
  if ((sessionsData?.length || 0) === 0 && programData?.title) {
    try {
      // Try using RPC function first
      const { data: relatedSessions, error: rpcError } = await supabase
        .rpc('find_related_sessions', { 
          program_id: params.id, 
          program_title: programData.title 
        });
        
      if (!rpcError && relatedSessions && relatedSessions.length > 0) {
        console.log(`Found ${relatedSessions.length} related sessions using RPC`);
        additionalSessions = relatedSessions;
      } else {
        // Fallback to direct query if RPC fails or returns empty
        const { data: sessionsByName, error: sessionsByNameError } = await supabase
          .from("sessions")
          .select(`
            id, 
            title, 
            date, 
            location, 
            description, 
            notes,
            programName,
            (
              SELECT COUNT(*) 
              FROM attendance 
              WHERE attendance."sessionId" = sessions.id
            ) AS "attendanceCount"
          `)
          .is("programId", null) // Only get sessions without a programId set
          .or(`title.ilike.%${programData.title}%,description.ilike.%${programData.title}%`)
          .order("date", { ascending: true })
          .limit(100);
        
        if (sessionsByNameError) {
          console.error("Error fetching sessions without programId:", sessionsByNameError);
        } else if (sessionsByName && sessionsByName.length > 0) {
          console.log(`Found ${sessionsByName.length} sessions by search terms`);
          additionalSessions = sessionsByName;
        }
      }
    } catch (error) {
      console.error("Error finding related sessions:", error);
    }
  }

  // Just to verify the merged data in server logs
  const allSessions = [...(sessionsData || []), ...additionalSessions];
  console.log(`Total sessions to display: ${allSessions.length}`);

  const program: Program = {
    ...programData,
    issue: issueData || undefined,
    sessions: allSessions
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
          <Link href="/dashboard/programs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{program.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusColor(program.status)}>
                  {program.status}
                </Badge>
                {program.issue && (
                  <Badge variant="outline">
                    Issue: {program.issue.title}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">
                    {program.description || "No description provided"}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Start Date</h3>
                    <p className="text-muted-foreground">
                      {formatDate(program.startDate)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">End Date</h3>
                    <p className="text-muted-foreground">
                      {formatDate(program.endDate)}
                    </p>
                  </div>
                </div>
                
                {program.issue && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Related Issue</h3>
                      <div className="mt-2">
                        <Link href={`/dashboard/issues/${program.issue.id}`}>
                          <Button variant="outline" size="sm">
                            {program.issue.title}
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
                <Link href={`/dashboard/programs?edit=${program.id}`}>
                  <Button className="w-full">Edit Program</Button>
                </Link>
                <Link href={`/dashboard/sessions?programId=${program.id}`}>
                  <Button variant="outline" className="w-full">
                    Add Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {program.sessions && program.sessions.length > 0 && (
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>
                  Sessions scheduled for this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {program.sessions.map((session) => (
                    <Card key={session.id} className={isPastSession(session.date) ? "border-muted" : "border-primary"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(session.date)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {session.location && (
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {session.location}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-sm text-muted-foreground">
                            {session.attendanceCount || 0} attendees
                          </div>
                          <Link href={`/dashboard/sessions/${session.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 