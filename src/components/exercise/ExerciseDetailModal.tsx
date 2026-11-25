"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionVisualizer } from "@/components/exercise/MotionVisualizer";
import { getExerciseDetail, REPDB_ATTRIBUTION } from "@/lib/exercises";
import { ExerciseDetailItem } from "@/types";
import { Plus, Dumbbell, ExternalLink, ShieldCheck, Sparkles, Check, Info } from "lucide-react";

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  exerciseName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogExercise?: (exerciseId: string) => void;
  onAddToProgram?: (exerciseId: string, exerciseName: string) => void;
}

export function ExerciseDetailModal({
  exerciseId,
  exerciseName,
  open,
  onOpenChange,
  onLogExercise,
  onAddToProgram
}: ExerciseDetailModalProps) {
  const [detail, setDetail] = useState<ExerciseDetailItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "de" | "es">("en");

  useEffect(() => {
    if (!open || !exerciseId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    getExerciseDetail(exerciseId, exerciseName).then((res) => {
      setDetail(res);
      setLoading(false);
    });
  }, [open, exerciseId, exerciseName]);

  if (!open || !exerciseId) return null;

  const currentName =
    language === "de" && detail?.nameDe
      ? detail.nameDe
      : language === "es" && detail?.nameEs
      ? detail.nameEs
      : detail?.name || "Exercise Details";

  const currentDescription =
    language === "de" && detail?.descriptionDe
      ? detail.descriptionDe
      : language === "es" && detail?.descriptionEs
      ? detail.descriptionEs
      : detail?.description || "";

  const currentInstructions =
    language === "de" && detail?.instructionsDe?.length
      ? detail.instructionsDe
      : language === "es" && detail?.instructionsEs?.length
      ? detail.instructionsEs
      : detail?.instructions || [];

  const currentTips =
    language === "de" && detail?.tipsDe?.length
      ? detail.tipsDe
      : language === "es" && detail?.tipsEs?.length
      ? detail.tipsEs
      : detail?.tips || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize text-xs font-semibold">
                {detail?.category || "Exercise"}
              </Badge>
              {detail?.difficulty && (
                <Badge variant="outline" className="capitalize text-xs">
                  {detail.difficulty}
                </Badge>
              )}
              {detail?.trackingMethod && (
                <Badge variant="secondary" className="capitalize text-xs">
                  {detail.trackingMethod.replace("_", " ")}
                </Badge>
              )}
            </div>

            {/* Language selector toggle */}
            {(detail?.nameDe || detail?.nameEs) && (
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-secondary/50 text-[11px]" role="radiogroup" aria-label="Exercise Language">
                {(["en", "de", "es"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded uppercase font-bold transition-colors cursor-pointer min-h-[28px] ${
                      language === lang
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogTitle className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground text-left">
            {currentName}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left">
            Equipment: <strong className="text-foreground">{detail?.equipment || "None"}</strong> • Primary target: <strong className="text-foreground capitalize">{detail?.primaryMuscle || "Full Body"}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading exercise documentation and illustrations...
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Layer 3: Two-Pose Demonstration Motion Visualizer */}
              <div className="max-w-sm mx-auto">
                <MotionVisualizer
                  exerciseName={detail.name}
                  images={detail.images}
                />
              </div>

              {/* Description Paragraph */}
              {currentDescription && (
                <div className="p-3.5 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground leading-relaxed">
                  {currentDescription}
                </div>
              )}

              {/* Target Muscles */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Target Muscle Groups:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs capitalize font-semibold px-2.5 py-1">
                    Primary: {detail.primaryMuscle}
                  </Badge>
                  {detail.secondaryMuscles?.map((muscle, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs capitalize px-2.5 py-1">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              {currentInstructions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Step-by-Step Instructions:
                  </span>
                  <ol className="space-y-2 text-xs sm:text-sm text-foreground list-decimal list-outside pl-4">
                    {currentInstructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed pl-1 text-pretty">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Coach & Safety Tips */}
              {currentTips.length > 0 && (
                <div className="space-y-2 p-3.5 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Coach &amp; Technique Tips:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-outside pl-4">
                    {currentTips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed pl-1 text-pretty">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* RepDB Attribution & License Banner */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                  <span>
                    Exercise data &amp; 512px illustrations by{" "}
                    <a
                      href={REPDB_ATTRIBUTION.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      RepDB (repdb.co) <ExternalLink className="w-3 h-3" />
                    </a>
                    {" "}under {REPDB_ATTRIBUTION.license}.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Exercise details not found.
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none bg-transparent border-t border-border pt-3 px-0 pb-0 sm:justify-between flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs min-h-[44px]"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onAddToProgram && detail && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onAddToProgram(detail.id, detail.name);
                  onOpenChange(false);
                }}
                className="text-xs min-h-[44px] px-3.5 font-medium rounded-xl"
              >
                Add to Program
              </Button>
            )}

            {onLogExercise && detail && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  onLogExercise(detail.id);
                  onOpenChange(false);
                }}
                className="font-bold text-xs min-h-[44px] px-4 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Log Exercise</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
