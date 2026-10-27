"use client";

import React, { useRef } from "react";
import { AthleteProfile, Program } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Share2, Award, Calendar, CheckCircle2 } from "lucide-react";

interface ClientReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: AthleteProfile;
  program?: Program;
}

export function ClientReportModal({ open, onOpenChange, athlete, program }: ClientReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportDateStr, setReportDateStr] = React.useState("October 27, 2026");

  React.useEffect(() => {
    setReportDateStr(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="no-print">
        <div className="flex items-center gap-2">
          <Badge variant="brand">Official Report</Badge>
          <span className="text-xs text-muted-foreground">Export Engine</span>
        </div>
        <DialogTitle className="mt-1">Athlete Performance & Progress Report</DialogTitle>
        <DialogDescription>
          Comprehensive executive progress summary formatted for client review and printing.
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="max-h-[75vh] overflow-y-auto">
        {/* Printable Formal Report Body */}
        <div ref={reportRef} className="p-6 bg-card border border-border rounded-xl space-y-6 text-foreground print:border-none print:p-0">
          {/* Header & Branding */}
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  CP
                </div>
                <span className="font-bold text-lg tracking-tight">CoachPRO</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">High Performance Athletic Systems</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="font-mono text-xs">CONFIDENTIAL REPORT</Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Generated: {reportDateStr}
              </div>
            </div>
          </div>

          {/* Athlete & Assignment Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-secondary/50 border border-border text-xs">
            <div>
              <span className="text-muted-foreground uppercase tracking-wider block font-medium">Athlete</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{athlete.name}</span>
              <span className="text-muted-foreground">{athlete.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-wider block font-medium">Head Coach</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{athlete.assignedCoachName}</span>
              <span className="text-muted-foreground">Apex Performance</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-wider block font-medium">Active Block</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{athlete.assignedProgramTitle}</span>
              <span className="text-muted-foreground">Period: 4 Weeks</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-wider block font-medium">Compliance Rate</span>
              <span className="font-bold text-success text-sm mt-0.5 block">{athlete.adherencePercentage}% Target</span>
              <span className="text-muted-foreground">{athlete.totalWorkoutsCompleted} Sessions Done</span>
            </div>
          </div>

          {/* Key Achievements & Personal Records */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand" /> Verified Peak Performances this Period
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-xs text-muted-foreground block">Barbell Back Squat</span>
                <span className="text-lg font-bold text-brand tabular-nums block mt-0.5">142.5 kg × 5 reps</span>
                <span className="text-[11px] text-muted-foreground">Est. 1RM: 166.2 kg (+12.5kg Δ)</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-xs text-muted-foreground block">Barbell Bench Press</span>
                <span className="text-lg font-bold text-brand tabular-nums block mt-0.5">105.0 kg × 6 reps</span>
                <span className="text-[11px] text-muted-foreground">Est. 1RM: 125.9 kg (+5.0kg Δ)</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-xs text-muted-foreground block">Conventional Deadlift</span>
                <span className="text-lg font-bold text-brand tabular-nums block mt-0.5">185.0 kg × 3 reps</span>
                <span className="text-[11px] text-muted-foreground">Est. 1RM: 203.4 kg (+7.5kg Δ)</span>
              </div>
            </div>
          </div>

          {/* Head Coach Evaluation */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Coach Assessment & Periodization Outlook
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              “Alex demonstrated exceptional technical consistency throughout this undulating volume block.
              Bar trajectory on both squat and bench press remained stable under heavy submaximal loads.
              Adherence at 94% puts the athlete in an optimal position to transition directly into the
              peaking block next month. Recovery markers indicate readiness for continued progressive overload.”
            </p>
            <div className="pt-2 text-[11px] text-muted-foreground flex justify-between items-center">
              <span>Evaluated by: {athlete.assignedCoachName}</span>
              <span className="font-mono">Signature: Certified CSCS Verified</span>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogFooter className="no-print">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-1.5 min-h-[44px]">
              <Printer className="w-4 h-4" /> Print / PDF
            </Button>
            <Button variant="brand" onClick={handlePrint} className="gap-1.5 min-h-[44px]">
              <Download className="w-4 h-4" /> Save PDF Report
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
