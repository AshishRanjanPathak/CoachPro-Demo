"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function PricingView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Starter Coach",
      description: "For independent coaches managing up to 10 athletes with precision.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Up to 10 active athletes",
        "Full exercise library & custom builder",
        "Question-based mobile set logger",
        "Basic adherence and volume tracking",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro Performance",
      description: "For high-performance coaches and private training facilities.",
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        "Up to 50 active athletes",
        "Advanced 1RM & velocity analytics",
        "Executive PDF client report generator",
        "Private coach notes & injury flags",
        "Custom organization branding",
        "Priority 24/7 CSCS support"
      ],
      cta: "Current Plan",
      popular: true
    },
    {
      name: "Enterprise Facility",
      description: "For university athletic departments and multi-facility gym networks.",
      monthlyPrice: 499,
      annualPrice: 399,
      features: [
        "Unlimited athlete seats & coaches",
        "Multi-tenant permissions & team isolation",
        "PostgreSQL audit trail & compliance export",
        "Custom API & wearable data ingest",
        "Dedicated account technical lead"
      ],
      cta: "Contact Enterprise Sales",
      popular: false
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Plans &amp; Pricing
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Simple plans for independent coaches and training facilities.
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center bg-secondary p-1 rounded-lg border border-border mt-3">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] min-h-[36px] ${
              billingCycle === "monthly" ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] min-h-[36px] flex items-center gap-1.5 ${
              billingCycle === "annual" ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
          >
            <span>Annual Billing</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-success/30 bg-success/10 text-success">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

          return (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between overflow-visible transition-colors duration-150 ${
                plan.popular
                  ? "ring-foreground relative bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="font-semibold text-xs py-0.5 px-3 uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-xs mt-1.5 leading-relaxed">
                  {plan.description}
                </CardDescription>

                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums">
                    ${price}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/ month</span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-success font-medium mt-0.5">Billed annually (${price * 12}/yr)</p>
                )}
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3 flex-1 border-t border-border mt-2">
                <ul className="space-y-2.5 text-xs text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 pt-0 bg-transparent border-t-0 mx-0 mb-0">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full font-semibold min-h-[44px]"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
