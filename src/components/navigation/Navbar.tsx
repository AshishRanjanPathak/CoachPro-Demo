"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { LogOut, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ activeTab: _activeTab, onTabChange: _onTabChange }: NavbarProps = {}) {
  const { currentUser, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("coachpro_theme") !== "light";
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("coachpro_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("coachpro_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md transition-colors safe-area-pt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity matching Bonobo Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-xs shrink-0">
            <img
              src="/icon.png"
              alt="BONOBO Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-foreground text-lg tracking-wider uppercase font-mono" translate="no">BONOBO</span>
              <Badge variant="brand" className="text-[10px] px-1.5 py-0 uppercase tracking-widest font-mono">
                CoachPRO
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {currentUser.organizationName}
            </p>
          </div>
        </div>

        {/* Authenticated Workspace Security Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border text-xs">
          <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true"></span>
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
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-full min-h-[44px] min-w-[44px]"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" aria-hidden="true" /> : <Moon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          </Button>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-foreground leading-none">{currentUser.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{currentUser.role.replace("_", " ")}</div>
          </div>
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
            alt={currentUser.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover border border-border ring-1 ring-border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign out of CoachPRO"
            className="text-muted-foreground hover:text-destructive h-9 px-2.5 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
