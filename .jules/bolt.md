## 2025-05-14 - Optimized unconstrained platform fetching

**Learning:** `prisma.platform.findMany()` with deep relations was being used as a filter mechanism in JavaScript, fetching the entire database contents (including heavy nested features, posts, and forum topics) just to find a single match by slug. This created a significant performance bottleneck (O(N) database load) that would worsen as the platform count grew.

**Action:** Implement a two-stage fetch: first a lightweight query to get only IDs and names for matching, followed by a targeted `findUnique` for the required platform. Cache the name lookup across the request.
