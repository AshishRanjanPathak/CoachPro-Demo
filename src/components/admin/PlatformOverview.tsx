"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";

export function PlatformOverview() {
  const { state } = useAuth();
  const { tx } = useLanguage();

  return (
    <div className="space-y-6">
      {/* SaaS Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {tx("Platform MRR", "MRR Plataforma")}
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            $48,350
          </div>
          <div className="text-xs text-success mt-0.5 font-medium tabular-nums">
            {tx("+14.2% MoM Expansion", "+14.2% mensual")}
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {tx("Active Tenants", "Organizaciones")}
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            42 Orgs
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium tabular-nums">
            {tx("100% SLA uptime", "100% disponibilidad")}
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {tx("Total Athletes", "Atletas Totales")}
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            1,248
          </div>
          <div className="text-xs text-brand mt-0.5 font-medium tabular-nums">
            {tx("94% 30d Retention", "94% retención 30d")}
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {tx("Workout Sets Persisted", "Series Registradas")}
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            428,910
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
            {tx("Synced Live", "Sincronización Activa")}
          </div>
        </Card>
      </div>

      {/* Platform Audit Trail */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tx("Security & Compliance", "Seguridad y Control")}</Badge>
          </div>
          <CardTitle className="mt-1">{tx("Real-Time Platform Audit Log", "Registro de Auditoría en Vivo")}</CardTitle>
          <CardDescription>
            {tx(
              "Immutable event stream tracking data mutations, authentication changes, and workout commits",
              "Historial de cambios de cuenta, accesos y registros de entrenamiento"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tx("Timestamp", "Fecha")}</TableHead>
                <TableHead>{tx("Actor", "Usuario")}</TableHead>
                <TableHead>{tx("Action", "Acción")}</TableHead>
                <TableHead>{tx("Target Entity", "Objetivo")}</TableHead>
                <TableHead>{tx("Status", "Estado")}</TableHead>
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
                    <Badge
                      variant="outline"
                      className={
                        log.status === "success"
                          ? "text-[10px] py-0 uppercase border-success/30 bg-success/10 text-success"
                          : "text-[10px] py-0 uppercase border-warning/30 bg-warning/10 text-warning"
                      }
                    >
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
