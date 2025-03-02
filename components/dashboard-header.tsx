"use client";

import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardHeader({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between p-4 border-b lg:py-6">
      <h1 className="text-xl font-bold lg:text-2xl">{title}</h1>
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
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
          size="sm"
          className="flex items-center gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}