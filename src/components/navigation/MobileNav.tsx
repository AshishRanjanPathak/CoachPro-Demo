"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { useKeyboardViewport } from "@/hooks/useKeyboardViewport";
import { 
  Home,
  Dumbbell, 
  TrendingUp, 
  HeartPulse, 
  Users, 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard,
  AlertTriangle,
  Activity,
  Sparkles
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { currentRole, state, currentUser } = useAuth();
  const { isKeyboardVisible } = useKeyboardViewport();

  // Subtle 2026 mobile haptic feedback emulation
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe fallback if permission denied or unsupported
      }
    }
  };

  const triageCount = state.athletes?.filter(
    (a) => a.status === "needs_attention" || a.injuryStatus?.hasInjury
  ).length || 0;

  const unreadMessages = state.messages?.filter(
    (m) => !m.isRead && m.recipientId === currentUser.id
  ).length || 0;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }

  let navItems: NavItem[] = [];

  if (currentRole === "athlete") {
    navItems = [
      { id: "home", label: "Today", icon: <Home className="w-5 h-5" /> },
      { id: "training", label: "Workout", icon: <Dumbbell className="w-5 h-5" /> },
      { id: "recovery", label: "Recovery", icon: <HeartPulse className="w-5 h-5" /> },
      {
        id: "bonobo",
        label: "Bonobo AI",
        icon: (
          <img
            src="/icon.png"
            alt="Bonobo"
            className="w-5 h-5 rounded-md object-cover border border-white/10 shadow-xs"
          />
        )
      },
      { id: "messages", label: "Chat", icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessages },
    ];
  } else if (currentRole === "coach") {
    navItems = [
      { id: "dashboard", label: "Hub", icon: <Activity className="w-5 h-5" /> },
      { id: "queue", label: "Triage", icon: <AlertTriangle className="w-5 h-5" />, badge: triageCount },
      { id: "roster", label: "Roster", icon: <Users className="w-5 h-5" /> },
      { id: "builder", label: "Programs", icon: <Layers className="w-5 h-5" /> },
      { id: "messages", label: "Chat", icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessages },
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
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:hidden shadow-lg safe-area-pb transition-transform duration-200 ${
        isKeyboardVisible ? "translate-y-full pointer-events-none" : "translate-y-0"
      }`}
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-15 px-1.5" role="tablist">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${item.label} tab`}
              onClick={() => {
                triggerHaptic();
                onTabChange(item.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 cursor-pointer transition-all duration-150 active:scale-95 touch-manipulation ${
                isActive 
                  ? "text-brand font-semibold" 
                  : "text-muted-foreground hover:text-foreground active:text-foreground"
              }`}
            >
              {/* Active Tab Spring Highlight Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-brand shadow-xs shadow-brand/50" />
              )}

              {/* Icon with relative badge positioning */}
              <div className="relative flex items-center justify-center">
                {item.icon}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-mono tracking-tight leading-none ${
                isActive ? "font-bold text-foreground" : "font-normal"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
