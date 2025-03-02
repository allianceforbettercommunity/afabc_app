"use client";

import { useAuth } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Users,
  Calendar,
  Layers,
  School,
  UserCircle,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <h2 className="mb-4 px-7 text-lg font-semibold tracking-tight">
              Dashboard
            </h2>
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
                  "hover:text-primary",
                  "justify-start"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </Link>
              <Link
                href="/dashboard/issues"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
                  "hover:text-primary",
                  "justify-start"
                )}
              >
                <FileText className="h-4 w-4" />
                Issues
              </Link>
              <Link
                href="/dashboard/programs"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
                  "hover:text-primary",
                  "justify-start"
                )}
              >
                <Layers className="h-4 w-4" />
                Programs
              </Link>
              <Link
                href="/dashboard/sessions"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
                  "hover:text-primary",
                  "justify-start"
                )}
              >
                <Calendar className="h-4 w-4" />
                Sessions
              </Link>
              <Link
                href="/dashboard/parents"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
                  "hover:text-primary",
                  "justify-start"
                )}
              >
                <UserCircle className="h-4 w-4" />
                Parents
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}