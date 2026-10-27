"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Layers } from "lucide-react";

export function ExerciseLibraryView() {
  const { state } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");

  const filteredExercises = state.exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
                          ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === "all" || ex.primaryMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search exercises by name, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-xs"
          />
        </div>

        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          className="text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-medium h-11"
        >
          <option value="all">All Muscle Groups</option>
          <option value="chest">Chest</option>
          <option value="back">Back</option>
          <option value="quadriceps">Quadriceps</option>
          <option value="hamstrings">Hamstrings</option>
          <option value="shoulders">Shoulders</option>
          <option value="arms">Arms</option>
        </select>
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((ex) => (
          <Card key={ex.id} className="p-4 border-border shadow-xs hover:border-brand/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-foreground text-sm">{ex.name}</h4>
                <Badge variant="outline" className="text-xs capitalize font-mono">
                  {ex.category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <Badge variant="secondary" className="capitalize">
                  Primary: {ex.primaryMuscle}
                </Badge>
                <Badge variant="outline">
                  Pattern: {ex.movementPattern}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {ex.instructions}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Equipment: {ex.equipment}</span>
              <span className="capitalize">{ex.trackingMethod.replace("_", " ")}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
