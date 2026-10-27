"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AthleteProfileView } from "@/components/coach/AthleteProfileView";
import { Search, ChevronRight, AlertCircle, CheckCircle2, User, Trophy, Flame } from "lucide-react";

export function AthleteRoster() {
  const { state } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfile | null>(null);

  const filteredAthletes = state.athletes.filter((ath) => {
    const matchesSearch = ath.name.toLowerCase().includes(search.toLowerCase()) ||
                          ath.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ath.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedAthlete) {
    // Keep reference updated from state
    const currentAth = state.athletes.find(a => a.id === selectedAthlete.id) || selectedAthlete;
    return <AthleteProfileView athlete={currentAth} onBack={() => setSelectedAthlete(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search athletes by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-lg border border-border">
          {["all", "active", "needs_attention"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === filter
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="space-y-3">
        {filteredAthletes.map((athlete) => {
          const isAttention = athlete.status === "needs_attention";

          return (
            <div
              key={athlete.id}
              onClick={() => setSelectedAthlete(athlete)}
              className="p-4 sm:p-5 rounded-lg border border-border bg-card hover:border-brand/50 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={athlete.avatarUrl}
                  alt={athlete.name}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors">
                      {athlete.name}
                    </h3>
                    <Badge variant={athlete.status === "active" ? "success" : athlete.status === "needs_attention" ? "warning" : "secondary"}>
                      {athlete.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{athlete.assignedProgramTitle}</p>
                </div>
              </div>

              {/* Stats & Status indicators */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-muted-foreground uppercase font-medium">Compliance</div>
                  <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">
                    {athlete.adherencePercentage}%
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-muted-foreground uppercase font-medium">Streak</div>
                  <div className="text-sm font-bold text-warning tabular-nums mt-0.5 flex items-center sm:justify-end gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> {athlete.currentStreakDays}d
                  </div>
                </div>

                <div className="text-left sm:text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground uppercase font-medium">Recent PRs</div>
                  <div className="text-sm font-bold text-brand tabular-nums mt-0.5 flex items-center justify-end gap-1">
                    <Trophy className="w-3.5 h-3.5" /> {athlete.recentPrCount}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
