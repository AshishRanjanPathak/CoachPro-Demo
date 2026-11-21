"use client";

import React, { useState, useMemo } from "react";
import { filterExercises, ALL_MUSCLE_GROUPS, ALL_CATEGORIES, REPDB_ATTRIBUTION } from "@/lib/exercises";
import { ExerciseIndexItem } from "@/types";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Eye,
  Plus,
  Play,
  X,
  RotateCcw
} from "lucide-react";

export function ExerciseLibraryView() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Selected exercise for details modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Quick logger integration
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [logTargetExId, setLogTargetExId] = useState<string | undefined>(undefined);

  // Paginated and filtered results
  const result = useMemo(() => {
    return filterExercises({
      query: search,
      muscle,
      category,
      difficulty,
      page,
      limit: pageSize
    });
  }, [search, muscle, category, difficulty, page]);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleMuscleChange = (val: string) => {
    setMuscle(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  const handleDifficultyChange = (val: string) => {
    setDifficulty(val);
    setPage(1);
  };

  const handleOpenDetail = (id: string) => {
    setSelectedExerciseId(id);
    setDetailOpen(true);
  };

  const handleLogExerciseFromLibrary = (id: string) => {
    setLogTargetExId(id);
    setLoggerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Exercise Library & Demonstrations
            </h2>
            <Badge variant="brand" className="text-xs font-mono font-bold px-2 py-0.5">
              {result.total} Movements
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Comprehensive catalog with two-pose illustrations, target biomechanics, and adaptive logging parameters.
          </p>
        </div>

        {/* RepDB attribution badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 border border-border px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            Powered by{" "}
            <a
              href={REPDB_ATTRIBUTION.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand font-semibold hover:underline"
            >
              RepDB
            </a>{" "}
            (708 verified exercises)
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          className="flex flex-col sm:flex-row gap-2.5 items-stretch"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search 700+ exercises by English, German, or Spanish name, equipment, or muscle..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-9 h-12 text-sm bg-secondary/40 border-border rounded-xl"
              aria-label="Search exercises"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="brand"
            className="h-12 px-6 gap-2 font-bold rounded-xl cursor-pointer shrink-0 shadow-xs"
            aria-label="Execute exercise search"
          >
            <Search className="w-4 h-4" />
            <span>Search Movements</span>
          </Button>

          {(search || muscle !== "all" || category !== "all" || difficulty !== "all") && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setMuscle("all");
                setCategory("all");
                setDifficulty("all");
                setPage(1);
              }}
              className="h-12 px-4 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl cursor-pointer shrink-0 border-border"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Muscle Group Filter */}
          <select
            value={muscle}
            onChange={(e) => handleMuscleChange(e.target.value)}
            className="text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2 text-foreground font-medium h-11 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Filter by target muscle group"
          >
            {ALL_MUSCLE_GROUPS.map((mg) => (
              <option key={mg.id} value={mg.id}>
                {mg.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2 text-foreground font-medium h-11 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Filter by equipment category"
          >
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2 text-foreground font-medium h-11 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.items.map((ex) => (
          <Card
            key={ex.id}
            className="p-4 border-border bg-card shadow-xs hover:border-brand/50 transition-all rounded-2xl flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Static Start Thumbnail by default (Layer 3: Image Assets) */}
              <div
                onClick={() => handleOpenDetail(ex.id)}
                className="relative aspect-video w-full rounded-xl bg-secondary/40 border border-border overflow-hidden flex items-center justify-center p-2 cursor-pointer group-hover:border-brand/40 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenDetail(ex.id);
                  }
                }}
                aria-label={`View details and demonstration for ${ex.name}`}
              >
                {ex.thumbUrl ? (
                  <img
                    src={ex.thumbUrl}
                    alt={`${ex.name} starting illustration`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <Dumbbell className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
                )}

                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-card/90 backdrop-blur-xs">
                    {ex.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <h4
                  onClick={() => handleOpenDetail(ex.id)}
                  className="font-bold text-foreground text-sm sm:text-base leading-snug cursor-pointer hover:text-brand transition-colors text-pretty"
                >
                  {ex.name}
                </h4>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge variant="brand" className="text-[11px] capitalize px-2 py-0 font-medium">
                    {ex.primaryMuscle}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] capitalize px-2 py-0">
                    {ex.category}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] px-2 py-0 font-mono text-muted-foreground">
                    {ex.equipment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-border flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDetail(ex.id)}
                className="text-xs h-9 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer min-h-[40px] flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Details & Poses</span>
              </Button>

              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => handleLogExerciseFromLibrary(ex.id)}
                className="text-xs font-semibold h-9 px-3 rounded-xl cursor-pointer min-h-[40px] shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Log Set</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {result.items.length === 0 && (
        <div className="py-16 text-center text-muted-foreground space-y-2 bg-card rounded-2xl border border-border">
          <p className="text-sm font-semibold">No exercises match the selected filters.</p>
          <p className="text-xs">Try clearing the search query or changing muscle group filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {result.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">
            Showing page {result.page} of {result.totalPages} ({result.total} total movements)
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-10 px-3.5 rounded-xl cursor-pointer min-h-[44px] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </Button>

            <span className="text-xs font-bold text-foreground px-2 tabular-nums">
              {result.page} / {result.totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={result.page >= result.totalPages}
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              className="text-xs h-10 px-3.5 rounded-xl cursor-pointer min-h-[44px] flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Licensing Attribution Footer */}
      <footer className="p-4 rounded-2xl bg-secondary/30 border border-border text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            {REPDB_ATTRIBUTION.text}{" "}
            <a
              href={REPDB_ATTRIBUTION.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Dataset Repository <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground/70">
          License: {REPDB_ATTRIBUTION.license}
        </span>
      </footer>

      {/* Layer 2 & 3: Exercise Detail & Demonstration Modal */}
      <ExerciseDetailModal
        exerciseId={selectedExerciseId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onLogExercise={(exId) => {
          setLogTargetExId(exId);
          setLoggerOpen(true);
        }}
      />

      {/* Adaptive Quick Workout Logger Modal */}
      <WorkoutLoggerModal
        open={loggerOpen}
        onOpenChange={setLoggerOpen}
        initialExerciseId={logTargetExId}
        initialMode="quick_set"
      />
    </div>
  );
}
