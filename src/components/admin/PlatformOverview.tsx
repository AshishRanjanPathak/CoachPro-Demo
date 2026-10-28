"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Activity, Building2, Users2, Database, Key } from "lucide-react";

export function PlatformOverview() {
  const { state } = useAuth();

  return (
    <div className="space-y-6">
      {/* SaaS Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Platform MRR
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            $48,350
          </div>
          <div className="text-xs text-success mt-0.5 font-medium tabular-nums">
            +14.2% MoM Expansion
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Active Tenants
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            42 Orgs
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium tabular-nums">
            100% SLA uptime
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Athletes
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            1,248
          </div>
          <div className="text-xs text-brand mt-0.5 font-medium tabular-nums">
            94% 30d Retention
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Workout Sets Persisted
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            428,910
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
            Postgres Sharded
          </div>
        </Card>
      </div>

      {/* Platform Audit Trail */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Security & Compliance</Badge>
          </div>
          <CardTitle className="mt-1">Real-Time Platform Audit Log</CardTitle>
          <CardDescription>
            Immutable event stream tracking data mutations, authentication changes, and workout commits
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium text-foreground text-xs">
                    {log.actorName}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.target}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.status === "success" ? "success" : "warning"} className="text-[10px] py-0 uppercase">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
