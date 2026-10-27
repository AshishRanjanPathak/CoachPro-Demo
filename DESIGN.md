---
version: alpha
name: CoachPRO
description: |
  Design system for CoachPRO — a production-grade, mobile-web-first fitness coaching SaaS.
  Inspired by Apple's restraint and the clarity of high-performance developer/productivity tools.

# ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

colors:
  primary: "#111827"             # Deep slate-black for headers and primary text
  on-primary: "#FFFFFF"
  primary-surface: "#FFFFFF"     # Clean white card and main content surfaces
  background: "#F8FAFC"          # Slate 50 neutral canvas
  secondary-surface: "#F1F5F9"   # Slate 100 for quiet controls and pill selectors
  secondary-text: "#64748B"      # Slate 500 for supporting labels and metadata
  border: "#E2E8F0"              # Slate 200 delicate structure borders
  brand: "#6477B8"               # Slate blue brand accent for primary CTAs and focus
  on-brand: "#FFFFFF"
  dark-accent: "#34446F"         # Deep navy accent for active states and highlights
  success: "#10B981"             # Emerald for completed sets and records
  on-success: "#FFFFFF"
  warning: "#F59E0B"             # Amber for attention required
  destructive: "#EF4444"         # Rose for errors or dropped workouts
  on-destructive: "#FFFFFF"

typography:
  display:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
  body-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-caps:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-metric:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 28px
    fontWeight: 700
    lineHeight: 32px
    fontVariantNumeric: tabular-nums

rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 10px
  xl: 14px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 0 16px
  button-secondary:
    backgroundColor: "{colors.secondary-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 0 16px
  input-field:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 0 12px
  card-container:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

## Overview

CoachPRO evokes the quiet confidence of high-end athletic hardware and precision engineering software.
The visual identity prioritizes immediate legibility for athletes on mobile between sets, while granting coaches
powerful multi-client analytical clarity without noisy decorative clutter.

## Colors

Rooted in a restrained, neutral-first palette:
- **Primary Text (#111827):** Deep ink ensuring WCAG AAA legibility against white and slate surfaces.
- **Background (#F8FAFC):** A calming slate canvas providing subtle contrast for content cards.
- **Brand Accent (#6477B8):** A balanced slate-blue guiding action without sensory fatigue.
- **Status Accents:** Emerald (#10B981) for completed milestones and PRs; Rose (#EF4444) for missed targets.

## Typography

Inter serves as the primary typeface with tabular numeric variants enabled for weights, reps, and timestamps.
Headlines use tight negative tracking for architectural authority; body copy preserves high legibility.

## Layout

- Mobile: 44x44px minimal interactive touch targets, accessible thumb-zone bottom navigation bar, full vertical stacking.
- Desktop: Persistent navigational sidebar, responsive multi-column metric comparisons, and data tables.

## Components

Built on accessible shadcn/ui primitives with custom domain enhancements:
- `ExercisePrescription`: Clear prescribed vs performed targets.
- `WorkoutLogger`: Focused question-based logging sheet with quick stepper controls.
- `ExerciseProgressChart`: Responsive SVG charts displaying 1RM, volume, and rep trends over time.
- `ClientProgressReport`: Clean, printable executive summary for athlete progress review.
- `AthleteRoster`: Filterable client list with status flags and immediate coaching actions.

## Do's and Don'ts

- Do respect 44x44px minimum touch targets on all interactive controls.
- Do use tabular-nums on all weight, repetition, and timer displays.
- Do provide clear error and empty states for every list and chart.
- Don't use neon gradients, glassmorphism blur traps, or excessive drop shadows.
- Don't require athletes to type lengthy questionnaires between active workout sets.
