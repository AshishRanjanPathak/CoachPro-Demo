"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Users, CreditCard, Shield, Download, CheckCircle2 } from "lucide-react";

export function OrgOverview() {
  const { state, currentUser } = useAuth();
  const [orgName, setOrgName] = useState(currentUser.organizationName);
  const [saved, setSaved] = useState(false);

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
                Organization
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
                Active Roster Size
              </div>
              <div className="text-lg font-bold text-foreground tabular-nums mt-0.5">
                {state.athletes.length} Athletes / 2 Coaches
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
                Subscription Plan
              </div>
              <div className="text-lg font-bold text-brand mt-0.5">
                Pro Tier ($199/mo)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle>Team Roster & Seat Allocation</CardTitle>
          <CardDescription>
            Authorized coaches and athletes within the Apex High Performance tenant boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
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
                    <Badge variant="success" className="text-xs py-0">Active Seat</Badge>
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
          <CardTitle>Invoicing & Billing History</CardTitle>
          <CardDescription>
            Official tax invoices and payment receipts for this coaching organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
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
                    <Badge variant="success" className="text-xs py-0 uppercase">Paid</Badge>
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
