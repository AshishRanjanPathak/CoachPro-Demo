"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { resolveActiveSessionContext } from "@/lib/store";
import { loadCompanionState } from "@/lib/companion";
import {
  getAthleteReminders,
  loadDismissedReminderIds,
  dismissReminderForToday,
  resetDismissedRemindersForToday,
  canUseBrowserNotifications,
  requestPostWorkoutNotificationPermission,
  sendBrowserWorkoutReminder,
  AthleteReminderId,
} from "@/lib/athleteReminders";
import {
  LogOut,
  Sun,
  Moon,
  Bell,
  BellRing,
  Check,
  X,
  Sparkles,
  Camera,
  Lock,
  Sliders,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProfileSettingsDialog,
  ProfileSettingsTab,
} from "@/components/shared/ProfileSettingsDialog";
import {
  createInitialsAvatarDataUrl,
  loadAccountPreferences,
} from "@/lib/accountSecurity";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/shared/LanguageSwitch";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ activeTab: _activeTab, onTabChange }: NavbarProps = {}) {
  const { currentUser, currentRole, state, logout } = useAuth();
  const { locale, tx } = useLanguage();
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

  const [bellOpen, setBellOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<ProfileSettingsTab>("profile");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<AthleteReminderId[]>([]);
  const [bananaCount, setBananaCount] = useState<number>(2);
  const [notifPermission, setNotifPermission] = useState<string>("unsupported");
  const bellRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDismissedIds(loadDismissedReminderIds());
    setBananaCount(loadCompanionState().bananaInventory || 0);
    setNotifPermission(canUseBrowserNotifications() ? Notification.permission : "unsupported");
    setTwoFactorEnabled(loadAccountPreferences(currentUser.id).twoFactorEnabled);
  }, [currentUser.id]);

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

  // Listen for companion, theme, prefs & reminder dismissal sync events
  useEffect(() => {
    const handleDismissSync = (e: Event) => {
      const custom = e as CustomEvent<AthleteReminderId[]>;
      if (Array.isArray(custom.detail)) setDismissedIds(custom.detail);
    };
    const handleCompanionSync = () => {
      setBananaCount(loadCompanionState().bananaInventory || 0);
    };
    const handleThemeSync = (e: Event) => {
      const custom = e as CustomEvent<{ isDark: boolean }>;
      if (typeof custom.detail?.isDark === "boolean") {
        setIsDark(custom.detail.isDark);
      }
    };
    const handlePrefsSync = (e: Event) => {
      const custom = e as CustomEvent<{ userId: string; prefs: { twoFactorEnabled: boolean } }>;
      if (custom.detail?.userId === currentUser.id) {
        setTwoFactorEnabled(Boolean(custom.detail.prefs.twoFactorEnabled));
      }
    };
    window.addEventListener("coachpro_reminders_updated", handleDismissSync);
    window.addEventListener("coachpro_bonobo_updated", handleCompanionSync);
    window.addEventListener("coachpro_theme_changed", handleThemeSync);
    window.addEventListener("coachpro_prefs_updated", handlePrefsSync);
    return () => {
      window.removeEventListener("coachpro_reminders_updated", handleDismissSync);
      window.removeEventListener("coachpro_bonobo_updated", handleCompanionSync);
      window.removeEventListener("coachpro_theme_changed", handleThemeSync);
      window.removeEventListener("coachpro_prefs_updated", handlePrefsSync);
    };
  }, [currentUser.id]);

  // Close notification or profile popovers on outside click or Escape
  useEffect(() => {
    if (!bellOpen && !profileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBellOpen(false);
        setProfileMenuOpen(false);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (bellOpen && bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (profileMenuOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [bellOpen, profileMenuOpen]);

  const openProfileSettings = (initialTab: ProfileSettingsTab) => {
    setSettingsTab(initialTab);
    setProfileMenuOpen(false);
    setSettingsOpen(true);
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Compute live athlete post-workout & check-in notifications
  const { session, plannedSets } = resolveActiveSessionContext(state);
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = (state.checkIns || []).some(
    (c) => (c.athleteId === currentUser.id || c.athleteId === "usr-athlete-1") && c.date?.slice(0, 10) === todayStr
  );

  const allReminders =
    currentRole === "athlete"
      ? getAthleteReminders({
          completedSets: session.sets.length,
          plannedSets,
          sessionStatus: session.status,
          hasCheckedInToday,
          bananaInventory: bananaCount,
          locale,
        })
      : [];

  const visibleReminders = allReminders.filter((r) => !dismissedIds.includes(r.id));

  const handleEnableBrowserNotif = async () => {
    const res = await requestPostWorkoutNotificationPermission();
    setNotifPermission(res);
    if (res === "granted") {
      sendBrowserWorkoutReminder(
        tx("Bonobo Reminders Active", "Recordatorios de Bonobo Activos"),
        visibleReminders[0]?.message ||
          tx(
            "We'll remind you to log your sets right after your workout!",
            "¡Te recordaremos registrar tus series justo después de entrenar!"
          )
      );
    }
  };

  const roleDisplayName =
    currentRole === "platform_admin"
      ? tx("Platform Admin", "Admin Plataforma")
      : currentRole === "org_admin"
      ? tx("Org Admin", "Admin Org")
      : currentRole === "coach"
      ? tx("Coach", "Entrenador")
      : tx("Athlete", "Atleta");

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

        {/* Language Switch, Reminders Bell, Theme Toggle, Profile Menu & Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitch compact className="hidden sm:inline-flex" />

          {currentRole === "athlete" && (
            <div className="relative" ref={bellRef}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setBellOpen(prev => !prev);
                }}
                title={tx("Workout Reminders", "Recordatorios de Entreno")}
                aria-label={tx(
                  `Workout reminders (${visibleReminders.length} pending)`,
                  `Recordatorios de entreno (${visibleReminders.length} pendientes)`
                )}
                aria-expanded={bellOpen}
                className="relative text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg min-h-[40px] min-w-[40px]"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {visibleReminders.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {visibleReminders.length}
                  </span>
                )}
              </Button>

              {bellOpen && (
                <div
                  role="dialog"
                  aria-label={tx("Workout logging notifications", "Notificaciones de entrenamiento")}
                  className="fixed sm:absolute right-3 left-3 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-88 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/30">
                    <div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <BellRing className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
                        <span>{tx("Post-Workout Reminders", "Recordatorios Post-Entreno")}</span>
                      </h4>
                    </div>

                    {notifPermission !== "unsupported" && (
                      <button
                        type="button"
                        onClick={handleEnableBrowserNotif}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                          notifPermission === "granted"
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {notifPermission === "granted"
                          ? tx("Browser Pings On ✓", "Avisos Activos ✓")
                          : tx("Enable Pings", "Activar Avisos")}
                      </button>
                    )}
                  </div>

                  <div className="p-3 space-y-2 max-h-[65dvh] overflow-y-auto overscroll-contain">
                    {visibleReminders.length === 0 ? (
                      <div className="py-5 px-3 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                          {tx("All logged for today!", "¡Todo registrado hoy!")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {tx(
                            "Your sets and check-in are safe. Bonobo approves.",
                            "Tus series y chequeo están a salvo. Bonobo lo aprueba."
                          )}
                        </p>
                        {dismissedIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDismissedIds(resetDismissedRemindersForToday())}
                            className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                          >
                            {tx("Show hidden reminders", "Mostrar avisos ocultos")}
                          </button>
                        )}
                      </div>
                    ) : (
                      visibleReminders.map((rem) => (
                        <div
                          key={rem.id}
                          className={`p-3 rounded-xl border space-y-2 ${
                            rem.tone === "warning"
                              ? "border-warning/35 bg-warning/5"
                              : rem.tone === "success"
                              ? "border-success/30 bg-success/5"
                              : "border-border bg-secondary/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-foreground leading-snug">
                              {rem.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => setDismissedIds(dismissReminderForToday(rem.id))}
                              aria-label={tx(`Dismiss ${rem.title}`, `Ocultar ${rem.title}`)}
                              className="p-1 -m-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {rem.message}
                          </p>
                          <div className="flex items-center justify-between pt-0.5">
                            <Button
                              type="button"
                              size="sm"
                              variant={rem.tone === "warning" ? "default" : "outline"}
                              onClick={() => {
                                onTabChange?.(rem.targetTab);
                                setBellOpen(false);
                              }}
                              className="h-8 px-3 text-[11px] font-semibold rounded-lg gap-1"
                            >
                              <Sparkles className="w-3 h-3" aria-hidden="true" />
                              <span>{rem.actionLabel}</span>
                            </Button>
                            <button
                              type="button"
                              onClick={() => setDismissedIds(dismissReminderForToday(rem.id))}
                              className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {tx("Remind later", "Luego")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={isDark ? tx("Switch to Light Mode", "Cambiar a Modo Claro") : tx("Switch to Dark Mode", "Cambiar a Modo Oscuro")}
            aria-label={isDark ? tx("Switch to light mode", "Cambiar a modo claro") : tx("Switch to dark mode", "Cambiar a modo oscuro")}
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-lg min-h-[40px] min-w-[40px]"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" aria-hidden="true" /> : <Moon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          </Button>

          {/* Clickable Profile Avatar & Name -> Account Settings & Protected Security Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setBellOpen(false);
                setProfileMenuOpen((prev) => !prev);
              }}
              aria-label={tx("Open profile and account settings", "Abrir configuración de perfil y cuenta")}
              aria-expanded={profileMenuOpen}
              title={tx("Profile & Security Settings", "Perfil y Seguridad")}
              className="flex items-center gap-2 rounded-full sm:rounded-xl pl-0.5 pr-1 sm:pl-2 sm:pr-1.5 py-1 border border-transparent hover:border-border hover:bg-secondary/70 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-foreground leading-none flex items-center justify-end gap-1">
                  <span>{currentUser.name}</span>
                  {twoFactorEnabled && (
                    <ShieldCheck className="w-3 h-3 text-success shrink-0" aria-hidden="true" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  {roleDisplayName}
                </div>
              </div>
              <img
                src={currentUser.avatarUrl || createInitialsAvatarDataUrl(currentUser.name)}
                alt={currentUser.name}
                width={34}
                height={34}
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
              />
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" aria-hidden="true" />
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                aria-label={tx("Profile settings menu", "Menú de configuración")}
                className="fixed sm:absolute right-3 left-3 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-72 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
              >
                <div className="p-3.5 border-b border-border bg-secondary/30 flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || createInitialsAvatarDataUrl(currentUser.name)}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border">
                        {roleDisplayName}
                      </span>
                      {twoFactorEnabled && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25">
                          2FA On
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {tx("Language", "Idioma")}
                  </span>
                  <LanguageSwitch compact />
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openProfileSettings("profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span>{tx("Profile & Picture", "Perfil y Foto")}</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openProfileSettings("security")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span>{tx("Change Password & Security", "Contraseña y Seguridad")}</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openProfileSettings("preferences")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span>{tx("Workspace Preferences", "Preferencias")}</span>
                  </button>
                </div>

                <div className="p-1.5 border-t border-border">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>{tx("Sign Out", "Cerrar Sesión")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title={tx("Sign Out", "Cerrar Sesión")}
            aria-label={tx("Sign out of BONOBO", "Cerrar sesión en BONOBO")}
            className="text-muted-foreground hover:text-destructive h-9 px-2 min-h-[40px]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Unified Profile Picture, Protected Security & Preferences Modal (All Roles) */}
      <ProfileSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        initialTab={settingsTab}
      />
    </header>
  );
}
