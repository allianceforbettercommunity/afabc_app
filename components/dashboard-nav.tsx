"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Issues",
    href: "/dashboard/issues",
    icon: FileText,
  },
  {
    title: "Politicians",
    href: "/dashboard/politicians",
    icon: Users,
  },
  {
    title: "Meetings",
    href: "/dashboard/meetings",
    icon: Calendar,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-bold text-xl">ABC Policy Tracker</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background pt-16">
          <nav className="grid gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-lg rounded-md hover:bg-accent",
                  pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-3 py-2 text-lg justify-start"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-screen flex-col border-r bg-muted/40 w-64">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ABC Policy Tracker</span>
          </Link>
        </div>
        <nav className="grid gap-2 px-4 py-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-full bg-primary h-8 w-8 flex items-center justify-center text-primary-foreground">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}