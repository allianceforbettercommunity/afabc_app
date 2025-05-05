"use client";

import { useAuth } from "@/lib/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  FileText,
  Users,
  Calendar,
  Layers,
  School,
  UserCircle,
  LogOut,
  Mail,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { exportAllData } from "@/lib/export-utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportAllData();
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

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
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
        <aside className="fixed top-0 z-30 h-screen w-full shrink-0 overflow-y-auto bg-sidebar md:sticky shadow-premium-md">
          <div className="flex flex-col h-full">
            <div className="flex justify-center items-center py-4 border-b border-sidebar-hover/30 bg-gradient-to-b from-sidebar-hover/10 to-transparent">
              <div className="relative w-48 h-36 px-2">
                <Image 
                  src="/logo.png" 
                  alt="ABC Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <nav className="flex flex-col flex-1 py-4 px-3 h-full">
              <div>
                <div className="mb-3 px-3 py-1">
                  <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-widest">
                    Main
                  </h2>
                </div>
                <div className="grid gap-1 items-start px-1 text-sm font-medium">
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden",
                      pathname === "/dashboard" ? "bg-sidebar-active text-sidebar-foreground font-medium shadow-inner" : "hover:translate-x-1"
                    )}
                  >
                    {pathname === "/dashboard" && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sidebar-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <BarChart3 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/dashboard/issues"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden",
                      pathname?.startsWith("/dashboard/issues") ? "bg-sidebar-active text-sidebar-foreground font-medium shadow-inner" : "hover:translate-x-1"
                    )}
                  >
                    {pathname?.startsWith("/dashboard/issues") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sidebar-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <FileText className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>Issues</span>
                  </Link>
                  <Link
                    href="/dashboard/programs"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden",
                      pathname?.startsWith("/dashboard/programs") ? "bg-sidebar-active text-sidebar-foreground font-medium shadow-inner" : "hover:translate-x-1"
                    )}
                  >
                    {pathname?.startsWith("/dashboard/programs") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sidebar-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <Layers className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>Initiatives</span>
                  </Link>
                  <Link
                    href="/dashboard/sessions"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden",
                      pathname?.startsWith("/dashboard/sessions") ? "bg-sidebar-active text-sidebar-foreground font-medium shadow-inner" : "hover:translate-x-1"
                    )}
                  >
                    {pathname?.startsWith("/dashboard/sessions") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sidebar-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <Calendar className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>Sessions</span>
                  </Link>
                  <Link
                    href="/dashboard/parents"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden",
                      pathname?.startsWith("/dashboard/parents") ? "bg-sidebar-active text-sidebar-foreground font-medium shadow-inner" : "hover:translate-x-1"
                    )}
                  >
                    {pathname?.startsWith("/dashboard/parents") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sidebar-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <UserCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>People</span>
                  </Link>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-hover group relative overflow-hidden text-left",
                      "hover:translate-x-1 active:scale-95"
                    )}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>{isExporting ? "Exporting..." : "Export Data"}</span>
                  </button>
                </div>
              </div>
              
              {user && (
                <div className="mt-auto pt-5 px-2">
                  <div className="border-t border-sidebar-hover/30 pt-5 bg-gradient-to-b from-transparent to-sidebar-hover/10 rounded-b-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-hover/20 backdrop-blur-sm">
                        <div className="h-8 w-8 rounded-full bg-sidebar-active flex items-center justify-center text-sidebar-foreground font-medium text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">{user.email}</p>
                          <p className="text-[11px] text-sidebar-foreground/70 font-medium">Admin Account</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sidebar-foreground/90 hover:bg-sidebar-hover/80 transition-all duration-200 w-full hover:translate-x-1 active:scale-95"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden bg-background p-4 md:p-6 lg:p-8">
          <div className="container mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}