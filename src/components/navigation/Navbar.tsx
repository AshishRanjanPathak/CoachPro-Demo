"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { UserRole } from "@/types";
import { Dumbbell, Shield, Users, Building, Activity, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { currentRole, setRole, currentUser, logout } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: "athlete", label: "Athlete", icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { role: "coach", label: "Coach", icon: <Activity className="w-3.5 h-3.5" /> },
    { role: "org_admin", label: "Org Admin", icon: <Building className="w-3.5 h-3.5" /> },
    { role: "platform_admin", label: "Platform Admin", icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity matching DESIGN.md */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
            CP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-lg tracking-tight">CoachPRO</span>
              <Badge variant="brand" className="text-[10px] px-1.5 py-0 uppercase tracking-widest font-mono">
                SaaS
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {currentUser.organizationName}
            </p>
          </div>
        </div>

        {/* Role Switcher Pill Bar (Immediate Interactive Testing for All 4 PDF Personas) */}
        <div className="flex items-center bg-secondary p-1 rounded-lg border border-border">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 hidden md:block">
            Role:
          </div>
          <div className="flex items-center gap-1">
            {roles.map((r) => {
              const isActive = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setRole(r.role);
                    // Reset active view tab on role switch to primary view
                    if (r.role === "athlete") onTabChange("today");
                    else if (r.role === "coach") onTabChange("roster");
                    else if (r.role === "org_admin") onTabChange("overview");
                    else if (r.role === "platform_admin") onTabChange("overview");
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all min-h-[36px] ${
                    isActive
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                  aria-pressed={isActive}
                >
                  {r.icon}
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-foreground leading-none">{currentUser.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{currentUser.role.replace("_", " ")}</div>
          </div>
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-border ring-1 ring-border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign out"
            className="text-muted-foreground hover:text-destructive h-9 px-2 min-h-[36px]"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
