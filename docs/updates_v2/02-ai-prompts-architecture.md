# 🧠 AI Architecture v1.1: Backend Data Intelligence

> **Goal:** Pivot Genkit from "Front-End Text Generation" (which is now a commodity) to "Back-End Data Intelligence." We use AI to power our Advanced Business Tools and maintain our "Live Truth" verified pricing moat.

## 1. The Strategy: AI as a Librarian, Not an Author

We are commenting out the user-facing generation pipelines (Ghostwriter, Course Outliner). Instead, Genkit runs in the background. It reads the internet, structures the data, and feeds our ROI Calculators and Comparison Tables.

---

## 2. Pipeline 1: The "Live Truth" Verifier (CRITICAL)

**Goal:** Ensure every price and feature on Comparlify is 100% accurate, automatically. This builds immense trust over text-based competitors like SellCoursesOnline.

#### Step 1: The Weekly Price Scraper

- **Trigger:** CRON job targeting Kajabi/Teachable pricing URLs.
- **Prompt (Genkit Context Injection):**
  ```text
  Analyze this raw HTML/text scraped from Teachable's current pricing page: "{{{scraped_text}}}"
  Extract the following data points into structured JSON:
  1. Monthly price for Basic, Pro, and Pro+ plans list.
  2. Transaction fee percentage for the free plan.
  3. Transaction fee percentage for the Basic plan.
  4. Does the Basic plan include video hosting? (boolean)
  ```

#### Step 2: The Reconciliation Engine

- **System Action:** Compare Genkit's JSON output against Prisma's `Platform` database table.
- **If Match:** Update the `lastVerifiedAt` timestamp to `now()`. Display the green "Verified" shield on the UI.
- **If Mismatch:** Alert the admin dashboard or automatically update the database (depending on confidence threshold).

---

## 3. Pipeline 2: Reddit / Trustpilot Sentiment Aggregator

**Goal:** Provide unbiased, TL;DR pros and cons that cannot be faked, directly countering the biased reviews of "Practitioner" competitors.

#### Step 1: Ingesting the Noise

- **Trigger:** Admin clicks "Refresh Sentiment" for a platform (e.g., Thinkific). System scrapes the top 50 recent Reddit comments or Trustpilot reviews for that platform.

#### Step 2: The "Brutal Honesty" Summarizer

- **Prompt (Genkit):**

  ```text
  You are an unbiased software analyst. Read the following 50 user reviews of the course platform "Thinkific":
  "{{{scraped_reviews_array}}}"

  Synthesize this feedback. Ignore generic praise. Find the bleeding edge pain points.
  Output a JSON object containing:
  {
    "top_3_complaints": ["str", "str", "str"],
    "top_3_praises": ["str", "str", "str"],
    "hidden_gotcha": "What is the one major hidden cost or missing feature users consistently complain about?",
    "ideal_user_profile": "Based on this feedback, who should ACTUALLY use this tool?"
  }
  ```

- **UI Output:** We display this heavily formatted data directly on the Comparison Page under a "Real User Sentiment (AI Aggregated)" section.

---

## 4. Pipeline 3: The Tech Stack Matrix Builder

**Goal:** Power the "Tech Stack Architect" tool by instantly knowing which tools integrate with which.

#### The Ecosystem Prompt

- **Trigger:** When a new platform is added to the database.
- **Prompt (Genkit):**

  ```text
  Research the software platform "{{{platform_name}}}".
  Determine its native integrations for the following categories:
  1. Email Marketing (e.g., ConvertKit, Mailchimp)
  2. Payment Gateways (e.g., Stripe, PayPal)
  3. Community (e.g., Circle, Discourse)

  Output a structured JSON array of supported integration names. Do NOT include Zapier-only integrations, only native API or direct app connections.
  ```

- **System Action:** Populates the integration junction tables in Prisma, enabling the Tech Stack Architect tool to instantly flag errors (e.g., "Kajabi has built-in email; you don't need to pay for ActiveCampaign").
