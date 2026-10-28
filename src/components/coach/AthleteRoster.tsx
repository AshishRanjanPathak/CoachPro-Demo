"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AthleteProfileView } from "@/components/coach/AthleteProfileView";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Flame,
  LayoutList,
  LayoutGrid,
  Zap,
  Activity,
  MessageSquare,
  Sliders,
  CheckSquare,
  Square
} from "lucide-react";

export function AthleteRoster() {
  const { state } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [squadFilter, setSquadFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "cns" | "adherence" | "name">("priority");
  const [viewMode, setViewMode] = useState<"compact" | "cards">("compact");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfile | null>(null);

  // Macro Health Metrics across entire roster (scale proof)
  const totalCount = state.athletes.length;
  const urgentCount = state.athletes.filter(a => a.status === "needs_attention" || a.injuryStatus?.hasInjury).length;
  const optimalCount = totalCount - urgentCount;
  const optimalPct = Math.round((optimalCount / totalCount) * 100);
  const urgentPct = Math.round((urgentCount / totalCount) * 100);

  // Distinct squads
  const squads = useMemo(() => {
    const set = new Set<string>();
    state.athletes.forEach(a => { if (a.squad) set.add(a.squad); });
    return Array.from(set);
  }, [state.athletes]);

  // Filtering & Sorting
  const filteredAthletes = useMemo(() => {
    let list = state.athletes.filter((ath) => {
      const q = search.toLowerCase();
      const matchesSearch =
        ath.name.toLowerCase().includes(q) ||
        ath.email.toLowerCase().includes(q) ||
        ath.trainingGoal.toLowerCase().includes(q) ||
        (ath.squad && ath.squad.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || ath.status === statusFilter;
      const matchesSquad = squadFilter === "all" || ath.squad === squadFilter;
      return matchesSearch && matchesStatus && matchesSquad;
    });

    list.sort((a, b) => {
      if (sortBy === "priority") return a.priorityRank - b.priorityRank;
      if (sortBy === "cns") return a.readinessScore - b.readinessScore;
      if (sortBy === "adherence") return a.adherencePercentage - b.adherencePercentage;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [state.athletes, search, statusFilter, squadFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredAthletes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedAthletes = filteredAthletes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk actions handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedAthletes.map(a => a.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBatchDeload = () => {
    setBulkNotice(`Dispatched -10% volume deload protocol to ${selectedIds.length} selected athletes.`);
    setTimeout(() => setBulkNotice(null), 3500);
    setSelectedIds([]);
  };

  const handleBatchBroadcast = () => {
    setBulkNotice(`Dispatched targeted recovery broadcast message to ${selectedIds.length} selected athletes.`);
    setTimeout(() => setBulkNotice(null), 3500);
    setSelectedIds([]);
  };

  if (selectedAthlete) {
    const currentAth = state.athletes.find(a => a.id === selectedAthlete.id) || selectedAthlete;
    return <AthleteProfileView athlete={currentAth} onBack={() => setSelectedAthlete(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Macro Roster Pulse Bar (High-Level Overview at Scale) */}
      <div className="bg-card rounded-xl p-4 sm:p-5 border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" aria-hidden="true" />
              <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                Roster Status Distribution
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time autonomic readiness across all {totalCount} assigned athletes
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-success">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Optimal: {optimalCount} ({optimalPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-destructive font-semibold">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
              Needs Attention: {urgentCount} ({urgentPct}%)
            </span>
          </div>
        </div>

        {/* Visual Ratio Bar */}
        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-success h-full transition-[width] duration-300"
            style={{ width: `${optimalPct}%` }}
            title={`Optimal: ${optimalCount}`}
          ></div>
          <div
            className="bg-destructive h-full transition-[width] duration-300"
            style={{ width: `${urgentPct}%` }}
            title={`Needs Attention: ${urgentCount}`}
          ></div>
        </div>
      </div>

      {/* 2. Squad / Cohort Selection Strip */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Squad selector">
          <button
            type="button"
            role="tab"
            aria-selected={squadFilter === "all"}
            onClick={() => { setSquadFilter("all"); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shrink-0 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[36px] ${
              squadFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All Squads ({totalCount})
          </button>
          {squads.map((sq) => {
            const count = state.athletes.filter(a => a.squad === sq).length;
            const isSelected = squadFilter === sq;
            return (
              <button
                key={sq}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => { setSquadFilter(sq); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shrink-0 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[36px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {sq} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Status Triage Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              name="athleteSearch"
              autoComplete="off"
              aria-label="Search athletes by name, email, or goal"
              placeholder="Search athletes by name, email, or goal…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-11 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-lg border border-border overflow-x-auto" role="group" aria-label="Status filter">
            {[
              { id: "all", label: `All (${totalCount})` },
              { id: "active", label: `Active (${optimalCount})` },
              { id: "needs_attention", label: `Needs Review (${urgentCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={statusFilter === f.id}
                onClick={() => { setStatusFilter(f.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[36px] ${
                  statusFilter === f.id
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. View Density & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <Sliders className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-muted-foreground font-mono">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort athletes list"
            className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold h-9 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none cursor-pointer"
          >
            <option value="priority">Clinical Priority (Urgent First)</option>
            <option value="cns">Readiness CNS (Lowest First)</option>
            <option value="adherence">Compliance Adherence (Lowest First)</option>
            <option value="name">Athlete Name (A–Z)</option>
          </select>
        </div>

        {/* Density Toggle (Compact Table vs Cards) */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border self-start sm:self-auto" role="tablist" aria-label="View density toggle">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "compact"}
            onClick={() => setViewMode("compact")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[32px] ${
              viewMode === "compact"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Compact Table</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "cards"}
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[32px] ${
              viewMode === "cards"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* 4. Roster Athletes Display */}
      {viewMode === "compact" ? (
        /* High-Density Compact Table View */
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-secondary/60 text-muted-foreground font-mono uppercase text-[10px] tracking-wider border-b border-border">
                  <th className="py-2.5 px-3 w-8 text-center">
                    <button
                      type="button"
                      aria-label="Select all athletes on this page"
                      onClick={handleSelectAllOnPage}
                      className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center"
                    >
                      {paginatedAthletes.every(a => selectedIds.includes(a.id)) ? (
                        <CheckSquare className="w-4 h-4 text-brand" aria-hidden="true" />
                      ) : (
                        <Square className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Squad</th>
                  <th className="py-2.5 px-3">Readiness CNS</th>
                  <th className="py-2.5 px-3">Sleep</th>
                  <th className="py-2.5 px-3">Adherence</th>
                  <th className="py-2.5 px-3">Clinical Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {paginatedAthletes.map((athlete) => {
                  const isSelected = selectedIds.includes(athlete.id);
                  const isAttention = athlete.status === "needs_attention";

                  return (
                    <tr
                      key={athlete.id}
                      onClick={() => setSelectedAthlete(athlete)}
                      className={`hover:bg-secondary/40 transition-colors cursor-pointer ${
                        isSelected ? "bg-brand/10" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-center" onClick={(e) => handleToggleSelect(athlete.id, e)}>
                        <button
                          type="button"
                          aria-label={`Select ${athlete.name}`}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand" aria-hidden="true" />
                          ) : (
                            <Square className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={athlete.avatarUrl}
                            alt=""
                            width={28}
                            height={28}
                            loading="lazy"
                            className="w-7 h-7 rounded-full object-cover border border-border"
                          />
                          <div>
                            <span className="font-semibold text-foreground block">{athlete.name}</span>
                            <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">{athlete.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-muted-foreground text-[11px]">
                        {athlete.squad || "General Cohort"}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          athlete.readinessScore <= 5
                            ? "bg-destructive/15 text-destructive border border-destructive/20"
                            : athlete.readinessScore <= 7
                            ? "bg-warning/15 text-warning border border-warning/20"
                            : "bg-success/15 text-success border border-success/20"
                        }`}>
                          <Zap className="w-3 h-3" aria-hidden="true" /> {athlete.readinessScore}&nbsp;/&nbsp;10
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-muted-foreground">
                        {athlete.sleepHours || 7.5}h
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs tabular-nums font-semibold w-8">
                            {athlete.adherencePercentage}%
                          </span>
                          <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${athlete.adherencePercentage >= 85 ? "bg-success" : "bg-warning"}`}
                              style={{ width: `${athlete.adherencePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        {isAttention ? (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-mono">
                            {athlete.injuryStatus?.injuryLocation || "Attention"}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] py-0 px-1.5 font-mono">
                            Optimal
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="text-xs text-brand hover:underline font-semibold flex items-center justify-end gap-0.5">
                          Inspect <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Comfortable Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paginatedAthletes.map((athlete) => {
            const isAttention = athlete.status === "needs_attention";

            return (
              <div
                key={athlete.id}
                onClick={() => setSelectedAthlete(athlete)}
                className="p-4 rounded-xl border border-border bg-card hover:border-brand/50 transition-colors cursor-pointer shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={athlete.avatarUrl}
                      alt=""
                      width={44}
                      height={44}
                      loading="lazy"
                      className="w-11 h-11 rounded-full object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-foreground text-sm">{athlete.name}</h4>
                        <Badge variant={isAttention ? "destructive" : "success"} className="text-[10px] py-0">
                          {isAttention ? "Review" : "Optimal"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground block">{athlete.squad || "General Cohort"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand tabular-nums">
                    {athlete.readinessScore}&nbsp;/&nbsp;10 CNS
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2 font-mono tabular-nums">
                  <span>Adherence: <strong className="text-foreground">{athlete.adherencePercentage}%</strong></span>
                  <span>Streak: <strong className="text-warning">{athlete.currentStreakDays}d</strong></span>
                  <span>PRs: <strong className="text-brand">{athlete.recentPrCount}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredAthletes.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-foreground">No athletes match your filters</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms, squad selection, or triage status filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSearch(""); setStatusFilter("all"); setSquadFilter("all"); setPage(1); }}
            className="text-xs min-h-[36px]"
          >
            Reset All Filters
          </Button>
        </div>
      )}

      {/* 5. Pagination Bar */}
      {filteredAthletes.length > 0 && (
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div className="text-muted-foreground font-mono tabular-nums">
            Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAthletes.length)}</strong> of <strong className="text-foreground">{filteredAthletes.length}</strong> athletes
            {filteredAthletes.length < totalCount && (
              <span className="text-muted-foreground/80 ml-1">({totalCount}&nbsp;total)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground font-mono mr-1">Per page:</span>
              {[8, 16, 24].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setPageSize(size); setPage(1); }}
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors min-h-[32px] cursor-pointer ${
                    pageSize === size
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 border-l border-border pl-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <span className="px-2 font-mono text-xs text-foreground font-bold tabular-nums">
                {currentPage}&nbsp;/&nbsp;{totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Next page"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bulk Action Notification Toast */}
      {bulkNotice && (
        <div role="status" aria-live="polite" className="p-3 rounded-xl bg-brand/15 border border-brand/20 text-brand text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-brand" aria-hidden="true" />
          <span>{bulkNotice}</span>
        </div>
      )}

      {/* 7. Floating Bulk Action Toolbar (When 1+ Athletes Selected) */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-card/95 backdrop-blur-md border border-brand/40 shadow-xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand text-brand-foreground font-mono text-xs font-bold flex items-center justify-center tabular-nums">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {selectedIds.length === 1 ? "1 athlete selected" : `${selectedIds.length} athletes selected`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBatchDeload}
              className="text-xs gap-1.5 min-h-[38px] flex-1 sm:flex-initial"
            >
              <Zap className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
              <span>Batch Deload (-10%)</span>
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleBatchBroadcast}
              className="text-xs gap-1.5 min-h-[38px] flex-1 sm:flex-initial"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Broadcast Message</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted-foreground hover:text-foreground min-h-[38px]"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
