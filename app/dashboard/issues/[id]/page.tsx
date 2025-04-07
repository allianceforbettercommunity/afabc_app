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
import { ArrowLeft, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: issues } = await supabase.from('issues').select('id');
  
  return (issues || []).map((issue) => ({
    id: issue.id,
  }));
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

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch issue details
  const { data: issueData, error: issueError } = await supabase
    .from("issues")
    .select("*")
    .eq("id", params.id)
    .single();

  if (issueError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/issues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{issueError.message || "Failed to fetch issue details"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/issues">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!issueData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/issues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Issue Not Found</h1>
        </div>
        <p>The requested issue could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/issues">Go Back</Link>
        </Button>
      </div>
    );
  }

  // Fetch related programs
  const { data: programsData, error: programsError } = await supabase
    .from("programs")
    .select("*")
    .eq("issueId", params.id)
    .order("startDate", { ascending: false });

  if (programsError) {
    console.error("Error fetching related programs:", programsError);
  }

  const issue: Issue = {
    ...issueData,
    programs: programsData || []
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/issues">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{issue.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority} Priority
                </Badge>
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
                {issue.category && (
                  <Badge variant="outline">{issue.category}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">
                    {issue.description || "No description provided"}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Created</h3>
                    <p className="text-muted-foreground">
                      {formatDate(issue.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Updated</h3>
                    <p className="text-muted-foreground">
                      {formatDate(issue.updatedAt)}
                    </p>
                  </div>
                </div>
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
                <Link href={`/dashboard/issues/${issue.id}/edit`}>
                  <Button className="w-full">Edit Issue</Button>
                </Link>
                <Link href={`/dashboard/programs?issueId=${issue.id}`}>
                  <Button variant="outline" className="w-full">
                    Add Related Program
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {issue.programs && issue.programs.length > 0 && (
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Related Programs</CardTitle>
                <CardDescription>
                  Programs associated with this issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {issue.programs.map((program) => (
                    <Card key={program.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{program.title}</CardTitle>
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(program.startDate)}
                          </div>
                          <Link href={`/dashboard/programs/${program.id}`}>
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