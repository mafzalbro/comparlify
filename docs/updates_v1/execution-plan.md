# 🛠️ Actionable Execution: The First 30 Days (Updated)

To move from "Site" to "Managed Product," here is the architectural plan for the engineer to execute.

## **Week 1: Foundations of Trust & Architecture**

- **Refactor Scoring Engine**: Move score calculations completely out of `[slug]/page.tsx` into a central `lib/scoring.ts`. Fix the JS order-of-operations bug affecting scores.
- **Atomic Refactoring**: Break down the massive `[slug]/page.tsx` (713 lines) and `page.tsx` (721 lines) into small, modular, testable components (`<ComparisonHero>`, `<FeatureMatrix>`, etc.).
- **Fix Form Parsers**: Replace the regex-based `parseDynamicArray` in `app/actions/*.ts` with `zod-form-data` or `next-safe-action` for robust server-side validation.

## **Week 2: The "Daily Machine" (Admin & Automation)**

- **Platform Sync**: Implement a basic Scrape-and-Sync workflow. When creating a platform or comparison, the AI fetches the platform URL to populate default Facts and Features.
- **Comparison Templates**: A "Standard LMS" template to avoid re-typing "Video Hosting," "Quizzes," etc.
- **Relational Content Schema**: Update `schema.prisma` linking `NewsArticle` and `Post` to `Platform`. Run prisma migrate.

## **Week 3: The "Full Proof" Polish & Integration**

- **Contextual Intelligence**: Dynamically show relevant News and Articles on Comparison pages using the new Prisma relations.
- **Visual Verification**: Add an "Expert-Verified" badge with a date stamp derived from `Comparison.updatedAt`.
- **Monetization Engine**: Replace direct out-links with an `/api/out/[platform]` route that records the click in the DB and redirects to the affiliate URL.

## **Week 4: The "Growth" Launch**

- **Premium Lead Gen**: Ensure the "Acquire Intelligence" / Newsletter form actually syncs users to `EmailRecipient` or external tools. Generate "Deep PDF" exports of comparisons for leads.
- **Social Distribution**: Build a simple button in Admin: "Generate Twitter Thread for this Comparison."
- **Broken Link Checker**: A simple automation script to ensure all "Visit Site" buttons still work.

---

## 🛑 The "Unprofessional things" to Remove immediately

1. **Unused / Dummy Code & Math Errors**: The broken score calculation logic in the view layer.
2. **Regex Form Parsers**: `parseDynamicArray` is too brittle for production.
3. **Monolithic JSX**: Stop writing 700+ line files.
4. **Data Silos**: Stop creating disconnected tables. All entities (News, Blog, Comparison) must relate back to the `Platform` entity.

### 🧐 Solution Architect's Closing Note:

You cannot scale to daily uploads with regex form-parsers and 700-line god components. Build the automated engine, connect your data graph in Prisma, and let the AI do the heavy lifting of data entry.
