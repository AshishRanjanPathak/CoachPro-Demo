"use client";

import React from "react";
import { Dumbbell, Check, AlertCircle, History } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function CoachActivityFeed() {
  const { tx } = useLanguage();
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column: Adherence & Volume Progress (1 Col) */}
      <div className="flex flex-col space-y-4">
        {/* Weekly Adherence Progress Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 space-y-3 border border-border shadow-xs">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Weekly Adherence", "Adherencia Semanal")}
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-foreground">82%</span>
              <span className="text-xs text-muted-foreground font-medium tabular-nums">23&nbsp;/&nbsp;28</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-brand h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: "82%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volume Tonnage Progress Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 space-y-3 border border-border shadow-xs">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Volume Tonnage", "Volumen Total")}
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-success">
                48,250 <span className="text-xs font-normal text-muted-foreground">kg</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium tabular-nums">87.7%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-success h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: "87.7%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Roster Status Pill Summary */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col space-y-2.5 border border-border shadow-xs">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Microcycle Adherence Index", "Índice de Adherencia del Ciclo")}
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Alex Chen</span>
            <span className="text-success font-mono font-semibold">100% (4/4 {tx("sessions", "sesiones")})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Jordan Taylor</span>
            <span className="text-warning font-mono font-semibold">75% (3/4 {tx("sessions", "sesiones")})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Maya Patel</span>
            <span className="text-destructive font-mono font-semibold">66% ({tx("Deload Pending", "Descarga Pendiente")})</span>
          </div>
        </div>
      </div>

      {/* Right Column: Live Training Activity Stream (2 Cols) */}
      <div className="lg:col-span-2 bg-card rounded-xl p-4 sm:p-5 flex flex-col space-y-4 border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight text-balance">
              {tx("Live Training Activity Feed", "Actividad de Entrenamiento en Vivo")}
            </h2>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
            {tx("3 updates logged today", "3 registros hoy")}
          </span>
        </div>

        {/* Activity Items Timeline */}
        <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
          {/* Feed Item 1: Alex PR */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success text-success-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Alex Chen</span>
                  <span className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[10px] font-mono font-bold tracking-wide">
                    ★ {tx("NEW PERSONAL RECORD", "NUEVO RÉCORD PERSONAL")}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{tx("14:22 Today", "Hoy 14:22")}</span>
              </div>
              <p className="text-xs text-foreground">
                {tx("Logged", "Registró")} <strong className="text-brand">{tx("Barbell Back Squat", "Sentadilla con Barra")}: 142.5&nbsp;kg × 5&nbsp;reps</strong> @ RPE 8.5
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-muted-foreground pt-1">
                <span>{tx("Estimated 1RM:", "1RM Estimado:")} <strong className="text-success">166.0&nbsp;kg</strong> (+4.2%)</span>
                <span>•</span>
                <span>{tx("Top Set:", "Serie Máxima:")} <strong>142.5&nbsp;kg × 5</strong></span>
                <span>•</span>
                <span>{tx("Session: Day 1 Lower", "Sesión: Día 1 Tren Inferior")}</span>
              </div>
            </div>
          </div>

          {/* Feed Item 2: Alex Completed Workout */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Alex Chen</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono">
                    {tx("Workout Completed", "Entreno Completado")}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{tx("13:40 Today", "Hoy 13:40")}</span>
              </div>
              <p className="text-xs text-foreground">
                {tx("Completed", "Completó")} <strong>{tx("Day 1: Lower Body Strength", "Día 1: Fuerza Tren Inferior")}</strong> (58 mins, 14,200&nbsp;kg {tx("session volume", "volumen")})
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-muted-foreground pt-1">
                <span>{tx("Duration: 55 mins", "Duración: 55 mins")}</span>
                <span>•</span>
                <span>{tx("Session RPE:", "RPE de Sesión:")} 8.0</span>
              </div>
            </div>
          </div>

          {/* Feed Item 3: Maya Patel Flagged Check-In */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Maya Patel</span>
                  <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive text-[10px] font-mono font-bold">
                    {tx("FLAGGED CHECK-IN", "CHECK-IN CON ALERTA")}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{tx("08:15 Today", "Hoy 08:15")}</span>
              </div>
              <p className="text-xs text-foreground">
                {tx("Submitted Morning Check-In:", "Check-in Matutino:")} <strong className="text-destructive">5.5 hrs {tx("sleep", "sueño")}</strong>, {tx("Readiness", "Preparación")} 4/10, {tx("Soreness", "Agujetas")} 4/5. {tx("Reported knee pain during warm-up squats.", "Reportó molestia en rodilla al calentar.")}
              </p>
              <div className="text-[11px] font-mono text-destructive pt-1 font-medium">
                {tx("Automatic alert escalated to Sarah Jenkins", "Alerta automática enviada a Sarah Jenkins")}
              </div>
            </div>
          </div>

          {/* Feed Item 4: Jordan Taylor Log */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-foreground flex items-center justify-center shrink-0 z-10 shadow-xs border border-border" aria-hidden="true">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Jordan Taylor</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono">
                    {tx("Heavy Pull Log", "Registro Tirón Pesado")}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{tx("Yesterday 18:30", "Ayer 18:30")}</span>
              </div>
              <p className="text-xs text-foreground">
                {tx("Logged", "Registró")} <strong>{tx("Conventional Deadlift", "Peso Muerto Convencional")}: 180.0&nbsp;kg × 3&nbsp;reps</strong> @ RPE 8.0
              </p>
              <div className="text-[11px] font-mono text-muted-foreground pt-1">
                {tx("Post-session lumbar tightness reported", "Reportó tensión lumbar post-entreno")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
