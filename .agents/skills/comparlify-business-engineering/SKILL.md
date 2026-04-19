---
name: comparlify-business-engineering
description: Hardened logic and UI patterns for building "Market King" grade creator tools. Use when modifying the ROI calculator, Stack Architect, or any financial/comparison module.
metadata:
  author: Antigravity
  version: "1.0.0"
---

# Creator Business Tools & Calculations

This skill defines the logical standards for the Comparlify toolkit. Our goal is to provide professional business tools that solve real problems.

## 💎 Professional Tool Logic

Every tool on Comparlify must answer one of these three questions for a creator:

1. **"How do I save money?"** (ROI Engine, Stack Optimizer)
2. **"How do I save time?"** (Migration Estimator, AI Hub)
3. **"How do I grow faster?"** (Pricing Predictor, Ad Simulator)

## 🏗️ UI & UX Patterns

1. **The Glassmorphic Terminal**: All engineering tools must use the `Card` component with `backdrop-blur-3xl` and `bg-card/40`.
2. **Live Data Badging**: Any price or feature data must be accompanied by the `ShieldCheck` icon and a "Live Verified" timestamp.
3. **Interactive Sliders**: Avoid static inputs. Use `Slider` components from `@/components/ui/slider` to allow users to "feel" the data moving.

## 🧮 Standardized Formulas

- **True Monthly Cost**: `(Revenue * Transaction Fee %) + Monthly Subscription Fee`.
- **Yearly Savings**: `(TotalCostA - TotalCostB) * 12`.
- **Break-Even Point**: `AdBudget / (CoursePrice * ConvRate)`.

## 🔗 Monetization Protocol

- **Affiliate Wrapper**: NEVER link directly to a platform. Always use the `/api/out/[platformId]` route to ensure click tracking and analytics.
- **The "Winning" Hook**: Always highlight the "Winner" of a calculation in `text-primary` with a clear "Switch and Save" CTA.

## 👑 The Comparlify Mission

Comparlify is the **Business Guidance Layer** for the creator economy. We don't just "review" platforms; we provide clear data for business decisions.

### Core Mission

- **Abolish Bias**: Replace generic "affiliate fluff" with verified, mathematical data.
- **Kill Tech Fatigue**: Automate the most painful decisions (Stacks, Migrations, Churn).
- **Protect Profit**: Identify hidden fees and pricing traps before they bite.

## 🛰️ Module Architecture & Connections

1.  **Trust Engine (Core)**:
    - **Logic**: `Prisma` + `Verification Engine`.
    - **Flow**: Updates `Platform` metadata (Fees, Tiers) based on verified scrapers.
    - **Downstream**: Feeds the ROI Calculator and Comparison Hero.
2.  **Monetization Hub**:
    - **Logic**: `/api/out/[platformId]` + `AffiliateClick` model.
    - **Connection**: Every "Visit Site" button on comparison pages or tool outputs MUST transit this module.
3.  **Business Tools**:
    - **Logic**: React Client-side math + Genkit context.
    - **Connection**: Injected directly into `compare/[slug]/page.tsx` to provide immediate "Switch & Save" value.
4.  **Community Board (Social Moat)**:
    - **Logic**: `ForumTopic` + `ForumPost`.
    - **Connection**: Allows users to "Verify" their tech stacks, linking back to `Platform` entities.
5.  **Admin Nexus**:
    - **Logic**: Full CRUD orchestration for Platforms, Tools, and Ads.

## 🏛️ Advanced Feature Development

These tools are the long-term goal of the project. Any development effort on these must follow a high-impact strategy:

### 1. The "Automatic Migration Tool"

- **Goal**: Physically move data (Videos, Users, Lessons) between Kajabi, Teachable, and Circle.
- **Strategy**: Build a **Universal Schema Mapper**. Map diverse API responses into a unified "LMS" format before pushing to the target platform.
- **Moat**: This is the ultimate friction-killer. Users switch when they don't have to copy-paste.

### 2. Retention Prediction & Recovery

- **Goal**: Integrate with Stripe/LMS Webhooks to predict "Engagement Death Spirals."
- **Strategy**: Use high-velocity telemetry (last login, email open rate) to output an **Engagement Score**.
- **Moat**: Generates AI-written recovery sequences sent in the creator's voice _before_ the student cancels.

### 3. True-Profit Attribution Dashboard

- **Goal**: Provide first-party tracking from Ad Click to Course Purchase across messy domains.
- **Strategy**: Build a light-weight tracking script that maintains "Identity" across the "Stack" (LeadPages -> ConvertKit -> Teachable).

## 📂 Project Intelligence

- **Technical Briefs**: Check `docs/competitors/` for deep-dive technical data on Kajabi, Teachable, etc.
- **Strategy Ref**: Consult `docs/updates_v2/01-market-strategy.md`.
- **Domain**: `comparlify.com`
