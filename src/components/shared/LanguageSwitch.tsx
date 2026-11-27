"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import { Globe } from "lucide-react";

interface LanguageSwitchProps {
  compact?: boolean;
  className?: string;
}

/**
 * Accessible EN / ES Switch built on top of shadcn's Switch primitive.
 * Clicking EN, ES, or toggling the switch switches the entire app language cleanly.
 */
export function LanguageSwitch({ compact = false, className = "" }: LanguageSwitchProps) {
  const { locale, isEs, setLocale, tx } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 ${
        compact ? "px-2 py-1" : "px-3 py-1.5"
      } ${className}`}
      role="group"
      aria-label={tx("Language switcher", "Selector de idioma")}
    >
      {!compact && <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />}

      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={!isEs}
        className={`text-[11px] font-mono font-bold tracking-wide transition-colors cursor-pointer ${
          !isEs ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>

      <Switch
        size="sm"
        checked={isEs}
        onCheckedChange={(checked) => setLocale(checked ? "es" : "en")}
        aria-label={
          locale === "en"
            ? "Switch language to Español"
            : "Cambiar idioma a English"
        }
      />

      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={isEs}
        className={`text-[11px] font-mono font-bold tracking-wide transition-colors cursor-pointer ${
          isEs ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ES
      </button>
    </div>
  );
}
