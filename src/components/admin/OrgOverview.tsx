"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, Users, CreditCard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function OrgOverview() {
  const { state, currentUser } = useAuth();
  const { tx } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {tx("Organization", "Organización")}
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {currentUser.organizationName}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10 text-success">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {tx("Active Roster Size", "Tamaño del Equipo")}
              </div>
              <div className="text-lg font-bold text-foreground tabular-nums mt-0.5">
                {state.athletes.length} {tx("Athletes / 2 Coaches", "Atletas / 2 Coaches")}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {tx("Subscription Plan", "Plan Activo")}
              </div>
              <div className="text-lg font-bold text-brand mt-0.5">
                {tx("Pro Tier ($199/mo)", "Plan Pro ($199/mes)")}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle>{tx("Team Roster & Seat Allocation", "Equipo y Licencias")}</CardTitle>
          <CardDescription>
            {tx(
              "Authorized coaches and athletes within the Apex High Performance tenant boundary",
              "Entrenadores y atletas autorizados en esta organización"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tx("Member", "Miembro")}</TableHead>
                <TableHead>{tx("Role", "Rol")}</TableHead>
                <TableHead>{tx("Email", "Correo")}</TableHead>
                <TableHead>{tx("Status", "Estado")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      width={28}
                      height={28}
                      loading="lazy"
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell className="capitalize text-xs font-mono">
                    {user.role.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs py-0 border-success/30 bg-success/10 text-success">{tx("Active Seat", "Activo")}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle>{tx("Invoicing & Billing History", "Historial de Facturación")}</CardTitle>
          <CardDescription>
            {tx("Official tax invoices and payment receipts for this coaching organization", "Facturas oficiales y recibos de pago de la organización")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tx("Invoice #", "Factura #")}</TableHead>
                <TableHead>{tx("Billing Date", "Fecha")}</TableHead>
                <TableHead>{tx("Plan", "Plan")}</TableHead>
                <TableHead>{tx("Amount", "Importe")}</TableHead>
                <TableHead>{tx("Status", "Estado")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium text-foreground">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{inv.date}</TableCell>
                  <TableCell className="text-xs text-foreground">{inv.planName}</TableCell>
                  <TableCell className="font-bold tabular-nums text-foreground">${inv.amount.toFixed(2)} USD</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs py-0 uppercase border-success/30 bg-success/10 text-success">Paid</Badge>
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
