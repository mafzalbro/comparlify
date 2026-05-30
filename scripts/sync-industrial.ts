import prisma from "../src/lib/prisma";
import { syncBlogData } from "../src/data/blog/sync";

async function main() {
  console.log("🚀 Starting industrial sync...");
  await syncBlogData();
  console.log("✅ Sync complete.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
