"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { 
  Dumbbell, 
  TrendingUp, 
  HeartPulse, 
  Users, 
  BookOpen, 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard,
  AlertTriangle,
  Activity
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { currentRole } = useAuth();

  let navItems: { id: string; label: string; icon: React.ReactNode }[] = [];

  if (currentRole === "athlete") {
    navItems = [
      { id: "today", label: "Workout", icon: <Dumbbell className="w-5 h-5" /> },
      { id: "recovery", label: "Recovery", icon: <HeartPulse className="w-5 h-5" /> },
      { id: "progress", label: "Progress", icon: <TrendingUp className="w-5 h-5" /> },
      { id: "messages", label: "Coach Chat", icon: <MessageSquare className="w-5 h-5" /> },
    ];
  } else if (currentRole === "coach") {
    navItems = [
      { id: "dashboard", label: "Hub", icon: <Activity className="w-5 h-5 text-brand" /> },
      { id: "queue", label: "Triage", icon: <AlertTriangle className="w-5 h-5 text-destructive" /> },
      { id: "roster", label: "Roster", icon: <Users className="w-5 h-5" /> },
      { id: "builder", label: "Programs", icon: <Layers className="w-5 h-5" /> },
      { id: "messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    ];
  } else if (currentRole === "org_admin") {
    navItems = [
      { id: "overview", label: "Team", icon: <Users className="w-5 h-5" /> },
      { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
    ];
  } else if (currentRole === "platform_admin") {
    navItems = [
      { id: "overview", label: "Metrics", icon: <ShieldCheck className="w-5 h-5" /> },
      { id: "audit", label: "Audit", icon: <TrendingUp className="w-5 h-5" /> },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border sm:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors py-1 ${
                isActive ? "text-brand font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[11px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
