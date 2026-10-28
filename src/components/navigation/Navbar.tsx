"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { LogOut, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { currentRole, currentUser, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("coachpro_theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("coachpro_theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("coachpro_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("coachpro_theme", "dark");
      setIsDark(true);
    }
  };

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

        {/* Authenticated Workspace Security Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border text-xs">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="font-mono text-[11px] text-muted-foreground uppercase">Authenticated Space:</span>
          <span className="font-semibold text-foreground capitalize">{currentUser.role.replace("_", " ")}</span>
        </div>

        {/* Theme Toggle, User Info & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-full"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </Button>

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
