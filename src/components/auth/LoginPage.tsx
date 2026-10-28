"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { UserRole } from "@/types";
import {
  Dumbbell,
  Activity,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"athlete" | "coach" | "admin">("coach");
  const [email, setEmail] = useState("sarah@apexperformance.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const roleMeta = {
    athlete: {
      actualRole: "athlete" as UserRole,
      title: "Athlete",
      copy: "Access your workouts, submit daily recovery, and track your progress.",
      btnText: "Sign in to Athlete Space",
      defaultEmail: "alex.chen@example.com",
      icon: <Dumbbell className="w-4 h-4" />
    },
    coach: {
      actualRole: "coach" as UserRole,
      title: "Coach",
      copy: "Manage your athletes, attention queue, programs, and performance reports.",
      btnText: "Sign in to Coach Console",
      defaultEmail: "sarah@apexperformance.com",
      icon: <Activity className="w-4 h-4" />
    },
    admin: {
      actualRole: "platform_admin" as UserRole,
      title: "Admin",
      copy: "Manage your organization, team seats, billing, and SaaS infrastructure.",
      btnText: "Sign in to Platform Admin",
      defaultEmail: "elena@coachpro.io",
      icon: <Shield className="w-4 h-4" />
    }
  };

  const currentInfo = roleMeta[selectedRole];

  const handleRoleSelect = (roleKey: "athlete" | "coach" | "admin") => {
    setSelectedRole(roleKey);
    setErrorMsg(null);
    setEmail(roleMeta[roleKey].defaultEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      login(currentInfo.actualRole, email);
    }, 450);
  };

  const handleGoogleAuth = () => {
    setInfoNotice("Connecting to Google Workspace Single Sign-On...");
    setTimeout(() => {
      login(currentInfo.actualRole, email);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-brand/20">
      <div className="w-full max-w-md mx-auto flex flex-col gap-5 py-2">
        {/* Top Brand Header matching Stitch */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-lg font-semibold tracking-tight text-foreground">Coach</span>
              <span className="text-lg font-bold text-brand ml-0.5">PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase">Platform v3.4</span>
          </div>
        </header>

        {/* Editorial Hero Framing with Gradient Overlay */}
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] shadow-xs border border-border bg-card">
          <img
            alt="Athletic coach and performer training with dumbbell in fitness studio"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC39imyrZkBFlpeFJcAuajRxNQm3xM-AYPtmuPhOrS3L1yqeAbhqdCXJcO1a-kTkBjUuRaxQGE-WGGFY2-5d_dDQlxs1mECUCFJupDXwX2CF3FOY50DaMs2psC_R2tQkNrTZuObllzflUerL4Xw__Lqf3O3K-yc9GdY4RQvaEwkEw53E5eMlkfeF7_fbgh3I5xJHJ2FVtOxTCjCOPC9DClSo2KclqloV126PQDQRXcq"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-4">
            <span className="text-[10px] font-mono tracking-widest text-brand uppercase font-semibold">
              High-Performance Ecosystem
            </span>
            <p className="text-sm text-foreground font-semibold mt-0.5 leading-snug">
              Precision biomechanics &amp; athlete periodization
            </p>
          </div>
        </div>

        {/* Headline & Supporting Copy */}
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Train with purpose. Progress with confidence.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your training, your coach, your progress — all in one place.
          </p>
        </div>

        {/* Role Segmented Selector */}
        <div className="flex flex-col gap-2.5">
          <div
            role="radiogroup"
            aria-label="Portal access role"
            className="p-1 rounded-xl bg-secondary/80 border border-border grid grid-cols-3 gap-1 shadow-xs"
          >
            {(["athlete", "coach", "admin"] as const).map((rKey) => {
              const meta = roleMeta[rKey];
              const isChecked = selectedRole === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  onClick={() => handleRoleSelect(rKey)}
                  className={`transition-all duration-150 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold cursor-pointer min-h-[38px] ${
                    isChecked
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                  }`}
                >
                  <span className={isChecked ? "text-brand" : "text-muted-foreground"}>{meta.icon}</span>
                  <span>{meta.title}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Contextual Notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border/60 text-muted-foreground text-left text-xs">
            <span className="text-brand shrink-0">{currentInfo.icon}</span>
            <span className="text-[12px] leading-relaxed">{currentInfo.copy}</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-foreground" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 bg-background rounded-lg text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setInfoNotice("Password reset link sent to registered email.")}
                  className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-3.5 pr-11 bg-background rounded-lg text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Feedback Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Info Notice Banner */}
            {infoNotice && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-brand/15 border border-brand/20 text-brand text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoNotice}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs hover:opacity-90 active:scale-[0.99] cursor-pointer mt-1 min-h-[44px]"
            >
              <span>{isLoading ? "Authenticating..." : currentInfo.btnText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow bg-border h-[1px]"></div>
            <span className="flex-shrink mx-3 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
              or continue with
            </span>
            <div className="flex-grow bg-border h-[1px]"></div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full h-11 rounded-lg bg-background hover:bg-secondary/70 border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer min-h-[44px]"
          >
            <svg height="18" viewBox="0 0 24 24" width="18">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google Workspace</span>
          </button>

          {/* Access Request Prompt */}
          <div className="pt-1 text-center">
            <p className="text-xs text-muted-foreground">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setInfoNotice("Enterprise access request form dispatched to admissions.")}
                className="font-semibold text-brand hover:underline ml-1 cursor-pointer"
              >
                Request access
              </button>
            </p>
          </div>
        </div>

        {/* Security & Legal Footer */}
        <footer className="flex flex-col items-center gap-2.5 pt-1 pb-4 text-center">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Lock className="w-3.5 h-3.5 text-brand" />
            <span className="text-[11px]">Secure access to your coaching workspace</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <a href="#help" className="hover:text-foreground transition-colors">
              Help &amp; Documentation
            </a>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <a href="#privacy" className="hover:text-foreground transition-colors">
              Privacy Protocol
            </a>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <a href="#terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
