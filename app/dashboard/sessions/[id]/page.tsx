import { createClient } from "@/lib/supabase/client";
import SessionDetail from "../../../components/session-detail";

// This allows for dynamic data fetching even though generateStaticParams is present
export const dynamic = 'force-dynamic';
// This disables static generation for this route
export const dynamicParams = true;

// Remove generateStaticParams since we're using dynamic routes
// export async function generateStaticParams() {
//   const supabase = createClient();
//   const { data: sessions } = await supabase.from('sessions').select('id');
//   
//   return (sessions || []).map((session) => ({
//     id: session.id,
//   }));
// }

export default function SessionPage({ params }: { params: { id: string } }) {
  return <SessionDetail sessionId={params.id} />;
} 