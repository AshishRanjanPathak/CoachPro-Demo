"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/domains/auth/AuthContext";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { LoginPage } from "@/components/auth/LoginPage";
import { AthleteHomeDashboard } from "@/components/athlete/AthleteHomeDashboard";
import { TrainingWorkspaceView } from "@/components/athlete/TrainingWorkspaceView";
import { AthleteProgressView } from "@/components/athlete/AthleteProgressView";
import { RecoveryInjuryCard } from "@/components/athlete/RecoveryInjuryCard";
import { AthleteRoster } from "@/components/coach/AthleteRoster";
import { AthleteProfileView } from "@/components/coach/AthleteProfileView";
import { PrioritizedAttentionQueue } from "@/components/coach/PrioritizedAttentionQueue";
import { CoachDashboard } from "@/components/coach/CoachDashboard";
import { CoachProgressionCurve } from "@/components/coach/stitch/CoachProgressionCurve";
import { ProgramBuilder } from "@/components/coach/ProgramBuilder";
import { ExerciseLibraryView } from "@/components/coach/ExerciseLibraryView";
import { MessagingView } from "@/components/shared/MessagingView";
import { OrgOverview } from "@/components/admin/OrgOverview";
import { PlatformOverview } from "@/components/admin/PlatformOverview";
import { BonoboAssistantSheet } from "@/components/companion/BonoboAssistantSheet";
import { AthleteProfile } from "@/types";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useLanguage } from "@/lib/i18n";
import {
  Home as HomeIcon,
  Dumbbell,
  TrendingUp,
  HeartPulse,
  Users,
  BookOpen,
  Layers,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  Activity,
  Sparkles
} from "lucide-react";

function AppContent() {
  const { currentRole, isAuthenticated } = useAuth();
  const { tx } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentRole === "coach") return "dashboard";
    if (currentRole === "org_admin" || currentRole === "platform_admin") return "overview";
    return "home";
  });
  const [targetedAthlete, setTargetedAthlete] = useState<AthleteProfile | null>(null);
  const [targetedRecipientId, setTargetedRecipientId] = useState<string | undefined>(undefined);

  // Tabs configured strictly per role
  const getTabsForRole = () => {
    switch (currentRole) {
      case "athlete":
        return [
          { id: "home", label: tx("Today", "Hoy"), icon: <HomeIcon className="w-4 h-4" /> },
          { id: "training", label: tx("Workout", "Entreno"), icon: <Dumbbell className="w-4 h-4" /> },
          { id: "recovery", label: tx("Recovery", "Recuperación"), icon: <HeartPulse className="w-4 h-4" /> },
          {
            id: "bonobo",
            label: tx("Bonobo AI", "Bonobo IA"),
            icon: (
              <img
                src="/icon.png"
                alt="Bonobo"
                className="w-4 h-4 rounded-sm object-cover"
              />
            )
          },
          { id: "progress", label: tx("Progress", "Progreso"), icon: <TrendingUp className="w-4 h-4" /> },
          { id: "messages", label: tx("Coach Chat", "Chat Coach"), icon: <MessageSquare className="w-4 h-4" /> }
        ];
      case "coach":
        return [
          { id: "dashboard", label: tx("Coach Hub", "Panel Coach"), icon: <Activity className="w-4 h-4 text-brand" /> },
          { id: "queue", label: tx("Attention Queue", "Avisos Prioritarios"), icon: <AlertTriangle className="w-4 h-4 text-destructive" /> },
          { id: "roster", label: tx("Athlete Roster", "Plantilla"), icon: <Users className="w-4 h-4" /> },
          { id: "telemetry", label: tx("Strength", "Fuerza"), icon: <TrendingUp className="w-4 h-4" /> },
          { id: "builder", label: tx("Program Builder", "Programas"), icon: <Layers className="w-4 h-4" /> },
          { id: "exercises", label: tx("Exercise Library", "Ejercicios"), icon: <BookOpen className="w-4 h-4" /> },
          { id: "messages", label: tx("Athlete Messages", "Mensajes"), icon: <MessageSquare className="w-4 h-4" /> }
        ];
      case "org_admin":
        return [
          { id: "overview", label: tx("Team Seats & Billing", "Equipo y Facturación"), icon: <Users className="w-4 h-4" /> }
        ];
      case "platform_admin":
        return [
          { id: "overview", label: tx("SaaS Metrics & Audit", "Métricas y Auditoría"), icon: <ShieldCheck className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  // Adjust active tab during render when role changes (React 19 pattern)
  const [prevRole, setPrevRole] = useState(currentRole);
  if (prevRole !== currentRole) {
    setPrevRole(currentRole);
    if (currentRole === "athlete") setActiveTab("home");
    else if (currentRole === "coach") setActiveTab("dashboard");
    else setActiveTab("overview");
  }

  // When not authenticated, show login page by default
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24 sm:pb-8">
      {/* Top Main Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Desktop Sub-navigation Header */}
      <div className="border-b border-border bg-card hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-6 h-12 items-center" role="tablist" aria-label="Role Navigation Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={tab.label}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTargetedAthlete(null);
                  }}
                  className={`inline-flex items-center gap-2 h-full text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
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
        <ErrorBoundary name="MainTabContent">
          {/* ATHLETE INDEPENDENT INTERFACE */}
          {currentRole === "athlete" && (
            <>
              {(activeTab === "home" || activeTab === "today") && (
                <AthleteHomeDashboard
                  onGoToTraining={() => setActiveTab("training")}
                  onOpenMessages={() => setActiveTab("messages")}
                />
              )}
              {activeTab === "training" && <TrainingWorkspaceView />}
              {activeTab === "recovery" && <RecoveryInjuryCard />}
              {activeTab === "bonobo" && (
                <div className="max-w-2xl mx-auto py-2">
                  <BonoboAssistantSheet />
                </div>
              )}
              {activeTab === "progress" && <AthleteProgressView />}
              {activeTab === "messages" && <MessagingView initialRecipientId="usr-coach-1" />}
            </>
          )}

          {/* COACH INDEPENDENT INTERFACE */}
          {currentRole === "coach" && (
            <>
              {activeTab === "dashboard" && (
                <CoachDashboard
                  onSelectAthlete={(ath) => {
                    setTargetedAthlete(ath);
                    setActiveTab("queue");
                  }}
                  onOpenMessages={(athId) => {
                    setTargetedRecipientId(athId);
                    setActiveTab("messages");
                  }}
                  onNavigateToBuilder={() => setActiveTab("builder")}
                  onOpenQueue={() => setActiveTab("queue")}
                />
              )}
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
              {activeTab === "telemetry" && <CoachProgressionCurve />}
              {activeTab === "builder" && <ProgramBuilder />}
              {activeTab === "exercises" && <ExerciseLibraryView />}
              {activeTab === "messages" && <MessagingView initialRecipientId={targetedRecipientId} />}
            </>
          )}

          {/* ORG ADMIN INTERFACE */}
          {currentRole === "org_admin" && (
            <>
              {activeTab === "overview" && <OrgOverview />}
            </>
          )}

          {/* PLATFORM ADMIN INTERFACE */}
          {currentRole === "platform_admin" && (
            <>
              {activeTab === "overview" && <PlatformOverview />}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Accessible Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setTargetedAthlete(null);
        }}
      />
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
