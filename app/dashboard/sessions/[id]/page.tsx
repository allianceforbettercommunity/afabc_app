"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Import SessionDetail component with dynamic import to avoid build issues
const SessionDetail = dynamic(() => import("../../../components/session-detail"), {
  loading: () => <div className="p-8 text-center">Loading session details...</div>,
  ssr: false
});

export default function SessionPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  
  if (!sessionId) {
    return <div className="p-8">Session ID not found</div>;
  }
  
  return <SessionDetail sessionId={sessionId} />;
} 