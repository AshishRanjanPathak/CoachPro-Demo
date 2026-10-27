# CoachPRO — Enterprise Fitness Coaching SaaS

> Production-grade, mobile-web-first strength & conditioning coaching platform built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Recharts.

---

## 🚀 Key Features

### 1. Multi-Role Architecture & RBAC
- **Athlete**: Interactive workout execution, conversational step-by-step set logging, daily autonomic recovery/injury status check-ins, personal record (PR) tracking, and coach messaging.
- **Coach**: Clinical **Prioritized Attention Queue** (flagging injured and high-fatigue athletes first), 1-click prescription/program adjustments, individual Recharts progress analytics, program builder, and athlete roster.
- **Gym / Org Admin**: Roster seat allocations, coach management, and paid invoice history.
- **Platform Admin**: Global SaaS telemetry (MRR, tenant activity, churn) and immutable security audit logging stream.

### 2. Conversational Set Logger (Athlete Experience)
- Focused 5-step guided modal for logging workout sets:
  1. **Exercise Selection**: Choose target movement with prescription preview.
  2. **Load & Duration**: Weight (kg) with precision `±2.5kg` / `±10kg` steppers or minutes for cardio.
  3. **Repetitions**: Rep target with `±1` steppers.
  4. **RPE Rating**: Effort rating (6 to 10) with automatic 1RM calculation.
  5. **PR Celebration**: Automatic personal record detection with canvas confetti celebration.

### 3. Clinical Triage & Attention Queue (Coach Experience)
- **Priority 1 (Red / Injured)**: Athletes with active injuries (e.g., patellar tendon strain) appear at top of queue with direct "Adjust Program" deload modal.
- **Priority 2 (Amber / Fatigue)**: Athletes with high fatigue / low readiness scores.
- **Priority 3 (Green / On Track)**: Compliant athletes progressing normally.

### 4. Interactive Progress Analytics (Section 12 Spec)
- Interactive Recharts visual suite:
  - Exercise explorer (Squat, Bench, Deadlift, Overhead Press)
  - Estimated 1RM Progression curves with gradient fills and tooltips
  - Session tonnage bar charts
  - Time horizon filters: 1 Month, 3 Months, 6 Months, All-Time

---

## 🛠 Tech Stack

- **Framework**: Next.js 16.4.3 (Turbopack, App Router)
- **UI Library**: React 19.3.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Apple / Linear design tokens)
- **Visuals & Charts**: Recharts 3.10.1
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 💻 Getting Started

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or yarn

### Installation

```bash
# Navigate to application folder
cd coachpro-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running Unit Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run start
```
