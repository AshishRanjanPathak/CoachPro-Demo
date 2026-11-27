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
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/shared/LanguageSwitch";
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
  Globe,
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
  const { tx, isEs } = useLanguage();

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

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const t = setInterval(() => {
      setLockSeconds(getPasswordLockoutSeconds(currentUser.id));
    }, 1000);
    return () => clearInterval(t);
  }, [lockSeconds, currentUser.id]);

  const strength = evaluatePasswordStrength(newPassword);
  const strengthLabelLocalized =
    strength.label === "Strong"
      ? tx("Strong", "Fuerte")
      : strength.label === "Good"
      ? tx("Good", "Buena")
      : strength.label === "Fair"
      ? tx("Fair", "Regular")
      : tx("Too weak", "Muy débil");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const processedDataUrl = await resizeProfileImageToDataUrl(file);
      setDraftAvatarUrl(processedDataUrl);
    } catch (err) {
      setPhotoError(
        err instanceof Error
          ? err.message
          : tx("Could not process image.", "No se pudo procesar la imagen.")
      );
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
        let translatedErr = res.error || tx("Unable to update password.", "No se pudo actualizar la contraseña.");
        if (isEs && res.error) {
          if (res.error.includes("Please enter your current")) translatedErr = "Ingresa tu contraseña actual.";
          else if (res.error.includes("Current password is incorrect")) translatedErr = "La contraseña actual es incorrecta.";
          else if (res.error.includes("Too many incorrect")) translatedErr = "Demasiados intentos incorrectos. Espera unos segundos.";
          else if (res.error.includes("at least 8")) translatedErr = "Mínimo 8 caracteres incluyendo letras y número o símbolo.";
          else if (res.error.includes("must be different")) translatedErr = "La nueva contraseña debe ser distinta de la actual.";
          else if (res.error.includes("do not match")) translatedErr = "La nueva contraseña y la confirmación no coinciden.";
        }
        setPwError(translatedErr);
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
          ? tx("Password updated securely and other sessions signed out.", "Contraseña actualizada y demás sesiones cerradas.")
          : tx("Password updated securely. Use your new password on next sign-in.", "Contraseña actualizada. Úsala en tu próximo inicio de sesión.")
      );
      recordSecurityAudit(
        tx("Updated account password cleanly", "Actualizó su contraseña de forma segura"),
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
        log.action.toLowerCase().includes("contraseña") ||
        log.action.toLowerCase().includes("session") ||
        log.action.toLowerCase().includes("profile")
    )
    .slice(0, 4);

  const roleBadgeLabel =
    currentRole === "platform_admin"
      ? tx("Platform Admin", "Admin Plataforma")
      : currentRole === "org_admin"
      ? tx("Org Admin", "Admin Org")
      : currentRole === "coach"
      ? tx("Strength Coach", "Coach de Fuerza")
      : tx("Athlete", "Atleta");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand" aria-hidden="true" />
              <span>{tx("Account & Security Settings", "Configuración y Seguridad")}</span>
            </DialogTitle>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {roleBadgeLabel}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {tx(
              `Manage your profile photo, protected password credentials, and ${roleBadgeLabel.toLowerCase()} workspace preferences.`,
              `Gestiona tu foto de perfil, contraseña protegida y preferencias de ${roleBadgeLabel.toLowerCase()}.`
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ProfileSettingsTab)} className="mt-2">
          <TabsList className="grid grid-cols-3 w-full h-9">
            <TabsTrigger value="profile" className="text-xs gap-1.5 cursor-pointer">
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tx("Profile", "Perfil")}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5 cursor-pointer">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tx("Security", "Seguridad")}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs gap-1.5 cursor-pointer">
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tx("Preferences", "Preferencias")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-h-[65dvh] overflow-y-auto overscroll-contain pr-1 mt-3">
            {/* TAB 1: PROFILE & PHOTO */}
            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
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
                        aria-label={tx("Upload new profile picture", "Subir nueva foto de perfil")}
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
                          {tx("Upload Photo", "Subir Foto")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDraftAvatarUrl(createInitialsAvatarDataUrl(draftName || currentUser.name))}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {tx("Use Initials", "Usar Iniciales")}
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {tx("Auto-cropped to 256×256px (PNG, JPG, WebP).", "Recorte automático a 256×256px (PNG, JPG, WebP).")}
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

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {tx("Quick Studio Avatars", "Avatares Rápidos")}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                      {tx("Display Name", "Nombre Visible")}
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
                      {tx("Account Email", "Correo de Cuenta")}
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

                {currentRole === "athlete" && athlete && (
                  <div className="space-y-1.5">
                    <label htmlFor="athlete-goal" className="text-xs font-semibold text-foreground">
                      {tx("Training Goal", "Objetivo de Entreno")}
                    </label>
                    <Input
                      id="athlete-goal"
                      type="text"
                      value={draftGoal}
                      onChange={(e) => setDraftGoal(e.target.value)}
                      placeholder={tx("e.g. Build squat strength & stay consistent", "Ej. Mejorar sentadilla y mantener constancia")}
                      className="h-10 text-sm bg-background"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="profile-bio" className="text-xs font-semibold text-foreground">
                    {currentRole === "coach"
                      ? tx("Coaching Specialty / Hours", "Especialidad / Horario")
                      : currentRole.includes("admin")
                      ? tx("Admin Team & Scope", "Equipo y Alcance Admin")
                      : tx("Status Note", "Estado Actual")}
                  </label>
                  <Input
                    id="profile-bio"
                    type="text"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    placeholder={
                      currentRole === "coach"
                        ? tx("e.g. Powerlifting & Hypertrophy • Replies 7am–7pm", "Ej. Fuerza e Hipertrofia • Respondo 7am–7pm")
                        : currentRole.includes("admin")
                        ? `${currentUser.organizationName} • ${tx("Full Oversight", "Control Total")}`
                        : tx("e.g. Training 4x/week — morning sessions", "Ej. Entrenando 4 días/semana por la mañana")
                    }
                    className="h-10 text-sm bg-background"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    {tx("Organization:", "Organización:")} <strong className="text-foreground">{currentUser.organizationName}</strong>
                  </span>
                  <Button type="submit" size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                    {profileSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{tx("Saved", "Guardado")}</span>
                      </>
                    ) : (
                      <span>{tx("Save Profile", "Guardar Perfil")}</span>
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
                    <h4 className="text-xs font-bold text-foreground">
                      {tx("Protected Password Change", "Cambio de Contraseña Protegido")}
                    </h4>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {tx("Salted SHA-256", "SHA-256 con Sal")}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cur-pw" className="text-xs font-semibold text-foreground">
                    {tx("Current Password", "Contraseña Actual")}
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
                      placeholder={tx("Verify your current password…", "Verifica tu contraseña actual…")}
                      className="h-10 pr-10 text-sm bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      aria-label={showCurrentPw ? tx("Hide current password", "Ocultar contraseña") : tx("Show current password", "Mostrar contraseña")}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="new-pw" className="text-xs font-semibold text-foreground">
                    {tx("New Password", "Nueva Contraseña")}
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
                      placeholder={tx("At least 8 chars with numbers/symbols…", "Mínimo 8 caracteres con números/símbolos…")}
                      className="h-10 pr-10 text-sm bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      aria-label={showNewPw ? tx("Hide new password", "Ocultar nueva contraseña") : tx("Show new password", "Mostrar nueva contraseña")}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

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
                          {tx("Strength:", "Seguridad:")} <strong className="text-foreground">{strengthLabelLocalized}</strong>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={strength.hasMinLength ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasMinLength ? "✓" : "○"} 8+ {tx("chars", "caract.")}
                          </span>
                          <span className={strength.hasMixedCase ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasMixedCase ? "✓" : "○"} A/a
                          </span>
                          <span className={strength.hasNumber ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasNumber ? "✓" : "○"} 0-9
                          </span>
                          <span className={strength.hasSymbol ? "text-success font-semibold" : "text-muted-foreground"}>
                            {strength.hasSymbol ? "✓" : "○"} {tx("Symbol", "Símbolo")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="conf-pw" className="text-xs font-semibold text-foreground">
                    {tx("Confirm New Password", "Confirmar Nueva Contraseña")}
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
                    placeholder={tx("Re-enter new password…", "Repite la nueva contraseña…")}
                    className="h-10 text-sm bg-background"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-foreground block">
                      {tx("Sign out other devices after change", "Cerrar sesión en otros dispositivos")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {tx("Recommended when rotating credentials", "Recomendado al actualizar credenciales")}
                    </span>
                  </div>
                  <Switch
                    checked={signOutOtherSessions}
                    onCheckedChange={setSignOutOtherSessions}
                    aria-label={tx("Sign out other devices after password change", "Cerrar otras sesiones tras cambio")}
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
                      ? `${tx("Updated", "Actualizada")} ${new Date(pwUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : tx("Default demo password active", "Contraseña demo por defecto activa")}
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={pwSubmitting || lockSeconds > 0}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    {lockSeconds > 0
                      ? tx(`Locked (${lockSeconds}s)`, `Bloqueado (${lockSeconds}s)`)
                      : tx("Update Password", "Actualizar Contraseña")}
                  </Button>
                </div>
              </form>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {tx("Two-Factor Protection (2FA)", "Verificación en Dos Pasos (2FA)")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {tx("Add an extra verification step for sensitive logins", "Añade una capa extra para inicios de sesión")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      updatePref("twoFactorEnabled", checked);
                      recordSecurityAudit(
                        checked
                          ? tx("Enabled Two-Factor Protection (2FA)", "Activó Verificación en Dos Pasos (2FA)")
                          : tx("Disabled Two-Factor Protection (2FA)", "Desactivó Verificación en Dos Pasos (2FA)"),
                        `Account ${currentUser.email}`
                      );
                    }}
                    aria-label={tx("Toggle Two-Factor Protection", "Activar o desactivar 2FA")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("Current Session", "Sesión Actual")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx("This browser • Signed in as", "Este navegador • Conectado como")} {roleBadgeLabel}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      recordSecurityAudit(
                        tx("Revoked other active sessions", "Cerró otras sesiones activas"),
                        currentUser.email
                      );
                      setSessionResetNotice(true);
                      setTimeout(() => setSessionResetNotice(false), 2500);
                    }}
                    className="h-8 text-[11px]"
                  >
                    {sessionResetNotice
                      ? tx("Sessions Cleared ✓", "Sesiones Cerradas ✓")
                      : tx("Revoke Other Sessions", "Cerrar Otras Sesiones")}
                  </Button>
                </div>

                {securityLogs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {tx("Recent Account Activity", "Actividad Reciente")}
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
              <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-3">
                <h4 className="text-xs font-bold text-foreground">{tx("Display, Language & Units", "Idioma, Apariencia y Unidades")}</h4>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{tx("App Language", "Idioma de la App")}</p>
                      <p className="text-[11px] text-muted-foreground">{tx("English (EN) or Español (ES)", "Inglés (EN) o Español (ES)")}</p>
                    </div>
                  </div>
                  <LanguageSwitch compact />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDarkTheme ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-warning" />}
                    <div>
                      <p className="text-xs font-semibold text-foreground">{tx("Appearance", "Apariencia")}</p>
                      <p className="text-[11px] text-muted-foreground">{tx("Minimal #101010 dark or bright daylight", "Oscuro #101010 o modo claro")}</p>
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
                      {tx("Dark", "Oscuro")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTheme(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                        !isDarkTheme ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tx("Light", "Claro")}
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("Preferred Weight Unit", "Unidad de Peso")}</p>
                    <p className="text-[11px] text-muted-foreground">{tx("Shown across workouts and strength charts", "Usada en entrenos y gráficas de fuerza")}</p>
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

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-foreground">{tx("Notifications", "Notificaciones")}</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("In-App Workout & Chat Alerts", "Avisos de Entreno y Chat")}</p>
                    <p className="text-[11px] text-muted-foreground">{tx("Remind you about unlogged sessions & coach replies", "Recuerda sesiones pendientes y mensajes")}</p>
                  </div>
                  <Switch
                    checked={prefs.pushNotifications}
                    onCheckedChange={(v) => updatePref("pushNotifications", v)}
                    aria-label={tx("Toggle in-app notifications", "Activar avisos en app")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("Weekly Progress Summary Email", "Resumen Semanal por Correo")}</p>
                    <p className="text-[11px] text-muted-foreground">{tx("Receive a clean recap every Sunday", "Recibe un resumen cada domingo")}</p>
                  </div>
                  <Switch
                    checked={prefs.emailNotifications}
                    onCheckedChange={(v) => updatePref("emailNotifications", v)}
                    aria-label={tx("Toggle email summaries", "Activar resúmenes por correo")}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  <h4 className="text-xs font-bold text-foreground">{tx(`${roleBadgeLabel} Controls`, `Opciones de ${roleBadgeLabel}`)}</h4>
                </div>

                {currentRole === "athlete" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Bonobo Evolution Companion", "Compañero Bonobo")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Toggle between 2D Companion & Pro View", "Cambia entre Vista Compañero y Vista Pro")}</p>
                      </div>
                      <Switch
                        checked={companionMode === "gamified"}
                        onCheckedChange={handleToggleCompanionMode}
                        aria-label={tx("Toggle Bonobo companion display", "Activar compañero Bonobo")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Share Soreness Notes with Coach", "Compartir Notas de Molestias")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Let Coach Sarah see daily check-in notes", "Permite que Sarah vea tus notas diarias")}</p>
                      </div>
                      <Switch
                        checked={prefs.shareRecoveryWithCoach}
                        onCheckedChange={(v) => updatePref("shareRecoveryWithCoach", v)}
                        aria-label={tx("Share recovery notes with coach", "Compartir notas con coach")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Today's Reminders", "Recordatorios de Hoy")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Restore hidden workout logging banners", "Restaura avisos de entreno ocultos")}</p>
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
                        {remindersResetDone ? tx("Restored ✓", "Restaurados ✓") : tx("Reset Reminders", "Restaurar")}
                      </Button>
                    </div>
                  </>
                )}

                {currentRole === "coach" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Attention Queue Readiness Cutoff", "Umbral de Avisos Prioritarios")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Flag athletes at or below this readiness score", "Marca atletas igual o debajo de esta energía")}</p>
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
                        <p className="text-xs font-semibold text-foreground">{tx("Pain Report Sound Alert", "Alerta Sonora por Dolor")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Chime when an athlete flags pain in check-in", "Suena cuando un atleta reporta molestias")}</p>
                      </div>
                      <Switch
                        checked={prefs.coachSoundAlerts}
                        onCheckedChange={(v) => updatePref("coachSoundAlerts", v)}
                        aria-label={tx("Toggle coach pain alert sounds", "Activar sonido de alertas")}
                      />
                    </div>
                  </>
                )}

                {(currentRole === "org_admin" || currentRole === "platform_admin") && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Enforce Strong Team Passwords", "Exigir Contraseñas Seguras")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Require 8+ chars and symbols for all seats", "Exige 8+ caracteres y símbolos al equipo")}</p>
                      </div>
                      <Switch
                        checked={prefs.adminStrictPasswordPolicy}
                        onCheckedChange={(v) => updatePref("adminStrictPasswordPolicy", v)}
                        aria-label={tx("Enforce strong team passwords", "Exigir contraseñas seguras")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tx("Idle Session Timeout", "Cierre por Inactividad")}</p>
                        <p className="text-[11px] text-muted-foreground">{tx("Auto-lock inactive admin sessions", "Bloquea sesiones admin sin actividad")}</p>
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
                  </>
                )}

                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("Export My Account Data", "Exportar Mis Datos")}</p>
                    <p className="text-[11px] text-muted-foreground">{tx("Download a JSON copy of your profile & prefs", "Descarga copia JSON de tu perfil y ajustes")}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportActivity}
                    className="h-8 text-[11px] gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tx("Export", "Exportar")}</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
