"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/domains/auth/AuthContext";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { LoginPage } from "@/components/auth/LoginPage";
import { TodayWorkoutCard } from "@/components/athlete/TodayWorkoutCard";
import { AthleteProgressView } from "@/components/athlete/AthleteProgressView";
import { RecoveryInjuryCard } from "@/components/athlete/RecoveryInjuryCard";
import { AthleteRoster } from "@/components/coach/AthleteRoster";
import { AthleteProfileView } from "@/components/coach/AthleteProfileView";
import { PrioritizedAttentionQueue } from "@/components/coach/PrioritizedAttentionQueue";
import { ProgramBuilder } from "@/components/coach/ProgramBuilder";
import { ExerciseLibraryView } from "@/components/coach/ExerciseLibraryView";
import { MessagingView } from "@/components/shared/MessagingView";
import { OrgOverview } from "@/components/admin/OrgOverview";
import { PlatformOverview } from "@/components/admin/PlatformOverview";
import { PricingView } from "@/components/public/PricingView";
import { AthleteProfile } from "@/types";
import {
  Dumbbell,
  TrendingUp,
  HeartPulse,
  Users,
  BookOpen,
  Layers,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle
} from "lucide-react";

function AppContent() {
  const { currentRole, isAuthenticated, state } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("today");
  const [targetedAthlete, setTargetedAthlete] = useState<AthleteProfile | null>(null);
  const [targetedRecipientId, setTargetedRecipientId] = useState<string | undefined>(undefined);

  // Tabs configured strictly per role
  const getTabsForRole = () => {
    switch (currentRole) {
      case "athlete":
        return [
          { id: "today", label: "Today's Training", icon: <Dumbbell className="w-4 h-4" /> },
          { id: "recovery", label: "Recovery & Injury Report", icon: <HeartPulse className="w-4 h-4" /> },
          { id: "progress", label: "Progress & PRs", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "messages", label: "Coach Messages", icon: <MessageSquare className="w-4 h-4" /> },
          { id: "pricing", label: "Plans & Pricing", icon: <CreditCard className="w-4 h-4" /> }
        ];
      case "coach":
        return [
          { id: "queue", label: "Attention Queue", icon: <AlertTriangle className="w-4 h-4 text-destructive" /> },
          { id: "roster", label: "Athlete Roster", icon: <Users className="w-4 h-4" /> },
          { id: "builder", label: "Program Builder", icon: <Layers className="w-4 h-4" /> },
          { id: "exercises", label: "Exercise Library", icon: <BookOpen className="w-4 h-4" /> },
          { id: "messages", label: "Athlete Messages", icon: <MessageSquare className="w-4 h-4" /> },
          { id: "pricing", label: "Plans & Pricing", icon: <CreditCard className="w-4 h-4" /> }
        ];
      case "org_admin":
        return [
          { id: "overview", label: "Team Seats & Billing", icon: <Users className="w-4 h-4" /> },
          { id: "pricing", label: "Plans & Pricing", icon: <CreditCard className="w-4 h-4" /> }
        ];
      case "platform_admin":
        return [
          { id: "overview", label: "SaaS Telemetry & Audit", icon: <ShieldCheck className="w-4 h-4" /> },
          { id: "pricing", label: "Plans & Pricing", icon: <CreditCard className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  // Reset active tab to primary on role switch
  React.useEffect(() => {
    const validIds = tabs.map(t => t.id);
    if (!validIds.includes(activeTab)) {
      if (currentRole === "athlete") setActiveTab("today");
      else if (currentRole === "coach") setActiveTab("queue");
      else setActiveTab(validIds[0] || "overview");
    }
  }, [currentRole, tabs, activeTab]);

  // When not authenticated, show login page by default
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 sm:pb-8">
      {/* Top Main Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Desktop Sub-navigation Header */}
      <div className="border-b border-border bg-card hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-6 h-12 items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTargetedAthlete(null);
                  }}
                  className={`inline-flex items-center gap-2 h-full text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  aria-selected={isActive}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* ATHLETE INDEPENDENT INTERFACE */}
        {currentRole === "athlete" && (
          <>
            {activeTab === "today" && <TodayWorkoutCard />}
            {activeTab === "recovery" && <RecoveryInjuryCard />}
            {activeTab === "progress" && <AthleteProgressView />}
            {activeTab === "messages" && <MessagingView initialRecipientId="usr-coach-1" />}
            {activeTab === "pricing" && <PricingView />}
          </>
        )}

        {/* COACH INDEPENDENT INTERFACE */}
        {currentRole === "coach" && (
          <>
            {activeTab === "queue" && (
              targetedAthlete ? (
                <AthleteProfileView
                  athlete={targetedAthlete}
                  onBack={() => setTargetedAthlete(null)}
                />
              ) : (
                <PrioritizedAttentionQueue
                  onSelectAthlete={(ath) => setTargetedAthlete(ath)}
                  onOpenMessages={(athId) => {
                    setTargetedRecipientId(athId);
                    setActiveTab("messages");
                  }}
                />
              )
            )}
            {activeTab === "roster" && <AthleteRoster />}
            {activeTab === "builder" && <ProgramBuilder />}
            {activeTab === "exercises" && <ExerciseLibraryView />}
            {activeTab === "messages" && <MessagingView initialRecipientId={targetedRecipientId} />}
            {activeTab === "pricing" && <PricingView />}
          </>
        )}

        {/* ORG ADMIN INTERFACE */}
        {currentRole === "org_admin" && (
          <>
            {activeTab === "overview" && <OrgOverview />}
            {activeTab === "pricing" && <PricingView />}
          </>
        )}

        {/* PLATFORM ADMIN INTERFACE */}
        {currentRole === "platform_admin" && (
          <>
            {activeTab === "overview" && <PlatformOverview />}
            {activeTab === "pricing" && <PricingView />}
          </>
        )}
      </main>

      {/* Accessible Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
