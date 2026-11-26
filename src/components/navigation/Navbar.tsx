"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ activeTab: _activeTab, onTabChange: _onTabChange }: NavbarProps = {}) {
  const { currentUser, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("coachpro_theme") !== "light";
      } catch {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("coachpro_theme", "dark");
      } catch {
        // Ignore storage write restrictions
      }
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#101010");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      try {
        localStorage.setItem("coachpro_theme", "light");
      } catch {
        // Ignore storage write restrictions
      }
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#FAFAFA");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card transition-colors duration-150 safe-area-pt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand identity matching Bonobo Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center shrink-0">
            <img
              src="/icon.png"
              alt="BONOBO Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="font-black text-foreground text-base tracking-wider uppercase font-mono" translate="no">BONOBO</span>
          </div>
        </div>

        {/* Theme Toggle, User Info & Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg min-h-[40px] min-w-[40px]"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" aria-hidden="true" /> : <Moon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          </Button>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-foreground leading-none">{currentUser.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{currentUser.role.replace("_", " ")}</div>
          </div>
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
            alt={currentUser.name}
            width={34}
            height={34}
            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign out of CoachPRO"
            className="text-muted-foreground hover:text-destructive h-9 px-2 min-h-[40px]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
