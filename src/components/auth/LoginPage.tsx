"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { UserRole } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity, Building2, Shield, Lock, ArrowRight, CheckCircle2, Sparkles, KeyRound } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("coach");
  const [email, setEmail] = useState("sarah@apexperformance.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Pre-configured persona identities
  const personas: {
    role: UserRole;
    title: string;
    description: string;
    email: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      role: "coach",
      title: "Coach / CSCS",
      description: "Manage athlete rosters, periodized programs, and individual progress curves.",
      email: "sarah@apexperformance.com",
      icon: <Activity className="w-5 h-5 text-brand" />,
      badge: "Primary Experience"
    },
    {
      role: "athlete",
      title: "Athlete",
      description: "Streamlined set-by-set logging, workout adherence, and personal records.",
      email: "alex.chen@example.com",
      icon: <Dumbbell className="w-5 h-5 text-brand" />,
      badge: "Mobile Web First"
    },
    {
      role: "org_admin",
      title: "Organization Admin",
      description: "Manage facility seats, coach assignments, subscriptions, and invoicing.",
      email: "marcus@apexperformance.com",
      icon: <Building2 className="w-5 h-5 text-brand" />,
      badge: "Facility Tenant"
    },
    {
      role: "platform_admin",
      title: "Platform Admin",
      description: "SaaS infrastructure telemetry, real-time audit logs, and global tenant controls.",
      email: "elena@coachpro.io",
      icon: <Shield className="w-5 h-5 text-brand" />,
      badge: "SaaS Operations"
    }
  ];

  const handleRoleSelect = (role: UserRole, personaEmail: string) => {
    setSelectedRole(role);
    setEmail(personaEmail);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole, email);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
            CP
          </div>
          <div>
            <span className="font-bold text-foreground text-lg tracking-tight">CoachPRO</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">High Performance Athletic Systems</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            SECURE PORTAL
          </Badge>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8">
        <div className="text-center space-y-2 mb-8">
          <Badge variant="brand" className="text-xs uppercase tracking-wider font-semibold">
            Role-Aware Sign In
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Sign In to your CoachPRO Workspace
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Select your authenticated role below to enter the tailored high-performance workspace.
          </p>
        </div>

        {/* Role Selection Grid (As specified in Section 7.2 of PDF) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {personas.map((p) => {
            const isSelected = selectedRole === p.role;
            return (
              <div
                key={p.role}
                onClick={() => handleRoleSelect(p.role, p.email)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "border-brand bg-card shadow-sm ring-1 ring-brand/20"
                    : "border-border bg-card/60 hover:border-brand/40 hover:bg-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-secondary">{p.icon}</div>
                    <Badge variant={isSelected ? "brand" : "outline"} className="text-[10px] py-0">
                      {p.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-mono truncate">{p.email}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand shrink-0 ml-1" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Credentials Card */}
        <Card className="max-w-md mx-auto border-border shadow-md bg-card">
          <form onSubmit={handleSignIn}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-base font-semibold">Enter Workspace Credentials</CardTitle>
              <CardDescription className="text-xs">
                Signing in as <span className="font-semibold text-foreground capitalize">{selectedRole.replace("_", " ")}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-medium text-xs h-11"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(true)}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="font-mono text-xs h-11"
                />
              </div>

              {showForgotNotice && (
                <div className="p-3 rounded-lg bg-secondary text-xs text-muted-foreground border border-border">
                  Password reset token dispatched to <span className="font-semibold text-foreground">{email}</span>. Check inbox or proceed with demo login.
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-brand"
                  />
                  <span>Keep session authenticated for 30 days</span>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                disabled={isLoading}
                className="w-full font-semibold min-h-[44px] gap-2 shadow-xs"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Enter {personas.find(p => p.role === selectedRole)?.title} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-[11px] text-muted-foreground">
                Protected by multi-tenant organization isolation policy & strict RBAC.
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Footer Credentials Info */}
      <div className="max-w-6xl w-full mx-auto text-center border-t border-border pt-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 CoachPRO Platforms Inc. All rights reserved.</span>
        <div className="flex items-center gap-4 text-xs">
          <span>Privacy & GDPR</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>SOC-2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
}
