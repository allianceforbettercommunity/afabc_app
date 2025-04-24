import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Just render a static placeholder to avoid any potential errors
export default function SessionPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/sessions">
            Back to Sessions
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Session ID</h3>
              <p>{id}</p>
            </div>
            <div>
              <p>This is a placeholder for the session details.</p>
              <p>The actual implementation has been temporarily disabled.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 