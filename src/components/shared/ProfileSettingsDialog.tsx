"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { resolveActiveAthlete } from "@/lib/store";
import {
  loadCompanionState,
  saveCompanionState,
  CompanionMode,
} from "@/lib/companion";
import { resetDismissedRemindersForToday } from "@/lib/athleteReminders";
import {
  CURATED_AVATAR_PRESETS,
  AccountPreferences,
  changePasswordProtected,
  createInitialsAvatarDataUrl,
  evaluatePasswordStrength,
  getCredentialMeta,
  getPasswordLockoutSeconds,
  loadAccountPreferences,
  resizeProfileImageToDataUrl,
  saveAccountPreferences,
} from "@/lib/accountSecurity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  User as UserIcon,
} from "lucide-react";

export type ProfileSettingsTab = "profile" | "security" | "preferences";

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ProfileSettingsTab;
}

export function ProfileSettingsDialog({
  open,
  onOpenChange,
  initialTab = "profile",
}: ProfileSettingsDialogProps) {
  const {
    state,
    currentUser,
    currentRole,
    updateUserProfile,
    updateAthleteProfile,
    recordSecurityAudit,
  } = useAuth();

  const athlete = currentRole === "athlete" ? resolveActiveAthlete(state, currentUser.id) : undefined;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<ProfileSettingsTab>(initialTab);

  // Profile tab state
  const [draftName, setDraftName] = useState(currentUser.name);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(currentUser.avatarUrl || "");
  const [draftBio, setDraftBio] = useState("");
  const [draftGoal, setDraftGoal] = useState(athlete?.trainingGoal || "");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // Security / Protected Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [signOutOtherSessions, setSignOutOtherSessions] = useState(true);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [pwUpdatedAt, setPwUpdatedAt] = useState<string | null>(null);
  const [sessionResetNotice, setSessionResetNotice] = useState(false);

  // Shared & role preferences state
  const [prefs, setPrefs] = useState<AccountPreferences>(() => loadAccountPreferences(currentUser.id));
  const [companionMode, setCompanionMode] = useState<CompanionMode>("gamified");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [remindersResetDone, setRemindersResetDone] = useState(false);

  // Re-sync cleanly whenever modal opens or active user changes
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setDraftName(currentUser.name);
    setDraftAvatarUrl(currentUser.avatarUrl || createInitialsAvatarDataUrl(currentUser.name));
    setDraftGoal(athlete?.trainingGoal || "");
    const loadedPrefs = loadAccountPreferences(currentUser.id);
    setPrefs(loadedPrefs);
    setDraftBio(loadedPrefs.bioNote || "");
    setPhotoError(null);
    setProfileSaved(false);
    setPwError(null);
    setPwSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSessionResetNotice(false);
    setRemindersResetDone(false);

    const meta = getCredentialMeta(currentUser.id);
    setPwUpdatedAt(meta.updatedAt);
    setLockSeconds(getPasswordLockoutSeconds(currentUser.id));

    setCompanionMode(loadCompanionState().mode);
    setIsDarkTheme(localStorage.getItem("coachpro_theme") !== "light");
  }, [open, initialTab, currentUser.id, currentUser.name, currentUser.avatarUrl, athlete?.trainingGoal]);

  // Countdown timer when temporarily locked after repeated incorrect attempts
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const t = setInterval(() => {
      setLockSeconds(getPasswordLockoutSeconds(currentUser.id));
    }, 1000);
    return () => clearInterval(t);
  }, [lockSeconds, currentUser.id]);

  const strength = evaluatePasswordStrength(newPassword);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const processedDataUrl = await resizeProfileImageToDataUrl(file);
      setDraftAvatarUrl(processedDataUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Could not process image.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draftName.trim();
    if (!cleanName) return;

    updateUserProfile(currentUser.id, {
      name: cleanName,
      avatarUrl: draftAvatarUrl || createInitialsAvatarDataUrl(cleanName),
    });

    if (currentRole === "athlete" && athlete && draftGoal.trim()) {
      updateAthleteProfile(athlete.id, { trainingGoal: draftGoal.trim() });
    }

    const updatedPrefs = saveAccountPreferences(currentUser.id, {
      ...prefs,
      bioNote: draftBio.trim(),
    });
    setPrefs(updatedPrefs);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    setPwSubmitting(true);

    try {
      const res = await changePasswordProtected({
        userId: currentUser.id,
        currentPassword,
        newPassword,
        confirmPassword,
        signOutOtherSessions,
      });

      if (!res.success) {
        setPwError(res.error || "Unable to update password.");
        if (res.lockedSecondsRemaining) {
          setLockSeconds(res.lockedSecondsRemaining);
        }
        return;
      }

      setPwUpdatedAt(res.updatedAt || new Date().toISOString());
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSuccess(
        signOutOtherSessions
          ? "Password updated securely and other sessions signed out."
          : "Password updated securely. Use your new password on next sign-in."
      );
      recordSecurityAudit(
        "Updated account password cleanly",
        `Account ${currentUser.email}`
      );
    } finally {
      setPwSubmitting(false);
    }
  };

  const updatePref = <K extends keyof AccountPreferences>(key: K, value: AccountPreferences[K]) => {
    const next = saveAccountPreferences(currentUser.id, { ...prefs, [key]: value });
    setPrefs(next);
  };

  const handleToggleTheme = (dark: boolean) => {
    setIsDarkTheme(dark);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("coachpro_theme", dark ? "dark" : "light");
      } catch {
        // Ignore storage error
      }
      window.dispatchEvent(new CustomEvent("coachpro_theme_changed", { detail: { isDark: dark } }));
    }
  };

  const handleToggleCompanionMode = (gamified: boolean) => {
    const mode: CompanionMode = gamified ? "gamified" : "pro_minimalist";
    setCompanionMode(mode);
    const current = loadCompanionState();
    saveCompanionState({ ...current, mode });
  };

  const handleExportActivity = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        organizationName: currentUser.organizationName,
      },
      preferences: prefs,
      recentAuditEvents: (state.auditLogs || []).slice(0, 15),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bonobo-account-${currentUser.role}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const securityLogs = (state.auditLogs || [])
    .filter(
      (log) =>
        log.actorName.includes(currentUser.name) ||
        log.action.toLowerCase().includes("password") ||
        log.action.toLowerCase().includes("session") ||
        log.action.toLowerCase().includes("profile")
    )
    .slice(0, 4);

  const roleBadgeLabel =
    currentRole === "platform_admin"
      ? "Platform Admin"
      : currentRole === "org_admin"
      ? "Org Admin"
      : currentRole === "coach"
      ? "Strength Coach"
      : "Athlete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand" aria-hidden="true" />
              <span>Account &amp; Security Settings</span>
            </DialogTitle>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {roleBadgeLabel}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage your profile photo, protected password credentials, and {roleBadgeLabel.toLowerCase()} workspace preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ProfileSettingsTab)} className="mt-2">
          <TabsList className="grid grid-cols-3 w-full h-9">
            <TabsTrigger value="profile" className="text-xs gap-1.5 cursor-pointer">
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5 cursor-pointer">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs gap-1.5 cursor-pointer">
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-h-[65dvh] overflow-y-auto overscroll-contain pr-1 mt-3">
            {/* TAB 1: PROFILE & PHOTO */}
            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar Upload + Preview */}
                <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={draftAvatarUrl || createInitialsAvatarDataUrl(draftName || currentUser.name)}
                        alt={draftName || currentUser.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-border bg-secondary"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Upload new profile picture"
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card shadow-xs hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs font-semibold"
                        >
                          Upload Photo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDraftAvatarUrl(createInitialsAvatarDataUrl(draftName || currentUser.name))}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Use Initials
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Auto-cropped to 256×256px (PNG, JPG, WebP).
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photoError && (
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{photoError}</span>
                    </p>
                  )}

                  {/* Quick Avatar Presets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Quick Studio Avatars
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                      {CURATED_AVATAR_PRESETS.map((preset) => {
                        const isSelected = draftAvatarUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setDraftAvatarUrl(preset.url)}
                            title={preset.label}
                            className={`relative w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 transition-transform active:scale-95 cursor-pointer ${
                              isSelected ? "border-brand ring-2 ring-brand/30" : "border-border opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Identity Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                      Display Name
                    </label>
                    <Input
                      id="profile-name"
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      required
                      className="h-10 text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="profile-email" className="text-xs font-semibold text-foreground">
                      Account Email
                    </label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={currentUser.email}
                      readOnly
                      className="h-10 text-sm bg-secondary/40 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Role-aware profile highlight */}
                {currentRole === "athlete" && athlete && (
                  <div className="space-y-1.5">
                    <label htmlFor="athlete-goal" className="text-xs font-semibold text-foreground">
                      Training Goal
                    </label>
                    <Input
                      id="athlete-goal"
                      type="text"
                      value={draftGoal}
                      onChange={(e) => setDraftGoal(e.target.value)}
                      placeholder="e.g. Build squat strength & stay consistent"
                      className="h-10 text-sm bg-background"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="profile-bio" className="text-xs font-semibold text-foreground">
                    {currentRole === "coach"
                      ? "Coaching Specialty / Hours"
                      : currentRole.includes("admin")
                      ? "Admin Team & Scope"
                      : "Status Note"}
                  </label>
                  <Input
                    id="profile-bio"
                    type="text"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    placeholder={
                      currentRole === "coach"
                        ? "e.g. Powerlifting & Hypertrophy • Replies 7am–7pm"
                        : currentRole.includes("admin")
                        ? `${currentUser.organizationName} • Full Organization Oversight`
                        : "e.g. Training 4x/week — morning sessions"
                    }
                    className="h-10 text-sm bg-background"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    Organization: <strong className="text-foreground">{currentUser.organizationName}</strong>
                  </span>
                  <Button type="submit" size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                    {profileSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 2: PROTECTED PASSWORD & SECURITY */}
            <TabsContent value="security" className="space-y-4">
              <form
                onSubmit={handleChangePassword}
                className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand" aria-hidden="true" />
                    <h4 className="text-xs font-bold text-foreground">Protected Password Change</h4>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    Salted SHA-256
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cur-pw" className="text-xs font-semibold text-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="cur-pw"
                      type={showCurrentPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPwError(null);
                      }}
                      placeholder="Verify your current password…"
                      className="h-10 pr-10 text-sm bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="new-pw" className="text-xs font-semibold text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-pw"
                      type={showNewPw ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPwError(null);
                      }}
                      placeholder="At least 8 chars with numbers/symbols…"
                      className="h-10 pr-10 text-sm bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      aria-label={showNewPw ? "Hide new password" : "Show new password"}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Live Password Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 rounded-full transition-colors ${
                              strength.score >= step
                                ? strength.score >= 4
                                  ? "bg-success"
                                  : strength.score >= 3
                                  ? "bg-brand"
                                  : strength.score === 2
                                  ? "bg-warning"
                                  : "bg-destructive"
                                : "bg-secondary"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="font-semibold text-muted-foreground">
                          Strength: <strong className="text-foreground">{strength.label}</strong>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={strength.hasMinLength ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasMinLength ? "✓" : "○"} 8+ chars
                          </span>
                          <span className={strength.hasMixedCase ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasMixedCase ? "✓" : "○"} A/a
                          </span>
                          <span className={strength.hasNumber ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasNumber ? "✓" : "○"} 0-9
                          </span>
                          <span className={strength.hasSymbol ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasSymbol ? "✓" : "○"} Symbol
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="conf-pw" className="text-xs font-semibold text-foreground">
                    Confirm New Password
                  </label>
                  <Input
                    id="conf-pw"
                    type={showNewPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPwError(null);
                    }}
                    placeholder="Re-enter new password…"
                    className="h-10 text-sm bg-background"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-foreground block">
                      Sign out other devices after change
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Recommended when rotating credentials
                    </span>
                  </div>
                  <Switch
                    checked={signOutOtherSessions}
                    onCheckedChange={setSignOutOtherSessions}
                    aria-label="Sign out other devices after password change"
                  />
                </div>

                {pwError && (
                  <div role="alert" className="p-2.5 rounded-lg bg-destructive/15 border border-destructive/25 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pwError}</span>
                  </div>
                )}

                {pwSuccess && (
                  <div role="status" className="p-2.5 rounded-lg bg-success/15 border border-success/25 text-success text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pwSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {pwUpdatedAt
                      ? `Updated ${new Date(pwUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Default demo password active"}
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={pwSubmitting || lockSeconds > 0}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    {lockSeconds > 0 ? `Locked (${lockSeconds}s)` : "Update Password"}
                  </Button>
                </div>
              </form>

              {/* 2FA & Active Session Management */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">Two-Factor Protection (2FA)</p>
                      <p className="text-[11px] text-muted-foreground">
                        Add an extra verification step for sensitive logins
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      updatePref("twoFactorEnabled", checked);
                      recordSecurityAudit(
                        checked ? "Enabled Two-Factor Protection (2FA)" : "Disabled Two-Factor Protection (2FA)",
                        `Account ${currentUser.email}`
                      );
                    }}
                    aria-label="Toggle Two-Factor Protection"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Current Session</p>
                    <p className="text-[11px] text-muted-foreground">
                      This browser • Signed in as {currentUser.role.replace("_", " ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      recordSecurityAudit("Revoked other active sessions", currentUser.email);
                      setSessionResetNotice(true);
                      setTimeout(() => setSessionResetNotice(false), 2500);
                    }}
                    className="h-8 text-[11px]"
                  >
                    {sessionResetNotice ? "Sessions Cleared ✓" : "Revoke Other Sessions"}
                  </Button>
                </div>

                {securityLogs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Recent Account Activity
                      </span>
                      {securityLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground truncate pr-2">{log.action}</span>
                          <span className="text-muted-foreground font-mono text-[10px] shrink-0">
                            {log.timestamp.slice(0, 16).replace("T", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: WORKSPACE & ROLE PREFERENCES */}
            <TabsContent value="preferences" className="space-y-3.5">
              {/* Shared Theme & Weight Units */}
              <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Display &amp; Units</h4>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDarkTheme ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-warning" />}
                    <div>
                      <p className="text-xs font-semibold text-foreground">Appearance</p>
                      <p className="text-[11px] text-muted-foreground">Minimal #101010 dark or bright daylight</p>
                    </div>
                  </div>
                  <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleTheme(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                        isDarkTheme ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTheme(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                        !isDarkTheme ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Preferred Weight Unit</p>
                    <p className="text-[11px] text-muted-foreground">Shown across workouts and strength charts</p>
                  </div>
                  <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                    {(["kg", "lbs"] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => updatePref("weightUnit", unit)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase cursor-pointer ${
                          prefs.weightUnit === unit
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shared Notification Toggles */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-foreground">Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">In-App Workout &amp; Chat Alerts</p>
                    <p className="text-[11px] text-muted-foreground">Remind you about unlogged sessions &amp; coach replies</p>
                  </div>
                  <Switch
                    checked={prefs.pushNotifications}
                    onCheckedChange={(v) => updatePref("pushNotifications", v)}
                    aria-label="Toggle in-app notifications"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Weekly Progress Summary Email</p>
                    <p className="text-[11px] text-muted-foreground">Receive a clean recap every Sunday</p>
                  </div>
                  <Switch
                    checked={prefs.emailNotifications}
                    onCheckedChange={(v) => updatePref("emailNotifications", v)}
                    aria-label="Toggle email summaries"
                  />
                </div>
              </div>

              {/* Role-Specific Controls: Athlete vs Coach vs Admin */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  <h4 className="text-xs font-bold text-foreground">{roleBadgeLabel} Controls</h4>
                </div>

                {currentRole === "athlete" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Bonobo Evolution Companion</p>
                        <p className="text-[11px] text-muted-foreground">Toggle between 2D Companion &amp; Pro View</p>
                      </div>
                      <Switch
                        checked={companionMode === "gamified"}
                        onCheckedChange={handleToggleCompanionMode}
                        aria-label="Toggle Bonobo companion display"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Share Soreness Notes with Coach</p>
                        <p className="text-[11px] text-muted-foreground">Let Coach Sarah see daily check-in notes</p>
                      </div>
                      <Switch
                        checked={prefs.shareRecoveryWithCoach}
                        onCheckedChange={(v) => updatePref("shareRecoveryWithCoach", v)}
                        aria-label="Share recovery notes with coach"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Today&apos;s Reminders</p>
                        <p className="text-[11px] text-muted-foreground">Restore hidden workout logging banners</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resetDismissedRemindersForToday();
                          setRemindersResetDone(true);
                          setTimeout(() => setRemindersResetDone(false), 2000);
                        }}
                        className="h-8 text-[11px]"
                      >
                        {remindersResetDone ? "Restored ✓" : "Reset Reminders"}
                      </Button>
                    </div>
                  </>
                )}

                {currentRole === "coach" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Attention Queue Readiness Cutoff</p>
                        <p className="text-[11px] text-muted-foreground">Flag athletes at or below this readiness score</p>
                      </div>
                      <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                        {([5, 6] as const).map((cutoff) => (
                          <button
                            key={cutoff}
                            type="button"
                            onClick={() => updatePref("triageThreshold", cutoff)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold cursor-pointer ${
                              prefs.triageThreshold === cutoff
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            &le; {cutoff}/10
                          </button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Pain Report Sound Alert</p>
                        <p className="text-[11px] text-muted-foreground">Chime when an athlete flags pain in check-in</p>
                      </div>
                      <Switch
                        checked={prefs.coachSoundAlerts}
                        onCheckedChange={(v) => updatePref("coachSoundAlerts", v)}
                        aria-label="Toggle coach pain alert sounds"
                      />
                    </div>
                  </>
                )}

                {(currentRole === "org_admin" || currentRole === "platform_admin") && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Enforce Strong Team Passwords</p>
                        <p className="text-[11px] text-muted-foreground">Require 8+ chars and symbols for all seats</p>
                      </div>
                      <Switch
                        checked={prefs.adminStrictPasswordPolicy}
                        onCheckedChange={(v) => updatePref("adminStrictPasswordPolicy", v)}
                        aria-label="Enforce strong team passwords"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Idle Session Timeout</p>
                        <p className="text-[11px] text-muted-foreground">Auto-lock inactive admin sessions</p>
                      </div>
                      <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                        {([30, 60, 240] as const).map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => updatePref("adminSessionTimeoutMins", mins)}
                            className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold cursor-pointer ${
                              prefs.adminSessionTimeoutMins === mins
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Export Account Snapshot</p>
                        <p className="text-[11px] text-muted-foreground">Download profile &amp; recent audit log JSON</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExportActivity}
                        className="h-8 text-[11px] gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Export JSON</span>
                      </Button>
                    </div>
                  </>
                )}

                {currentRole !== "org_admin" && currentRole !== "platform_admin" && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Export My Account Data</p>
                        <p className="text-[11px] text-muted-foreground">Download a JSON copy of your profile &amp; prefs</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExportActivity}
                        className="h-8 text-[11px] gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
