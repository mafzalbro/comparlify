import "dotenv/config";
import { syncComparisonData } from "../src/compare/sync";


async function main() {
  try {
    await syncComparisonData();
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
