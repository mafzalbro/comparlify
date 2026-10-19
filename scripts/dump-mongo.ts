import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function dumpData() {
  console.log("Fetching live data from MongoDB Atlas...");
  const siteContents = await prisma.siteContent.findMany();
  const advertisements = await prisma.advertisement.findMany();
  const users = await prisma.user.findMany();
  const comparisons = await prisma.comparison.findMany({
    include: {
      platformA: true,
      platformB: true,
      facts: true,
      faqs: true,
      category: true,
    }
  });
  const platforms = await prisma.platform.findMany();
  const features = await prisma.feature.findMany();

  console.log(`Fetched successfully:
- SiteContent: ${siteContents.length}
- Advertisements: ${advertisements.length}
- Users: ${users.length}
- Comparisons: ${comparisons.length}
- Platforms: ${platforms.length}
- Features: ${features.length}`);

  const outDir = path.join(process.cwd(), "src", "data", "live-backup");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, "site-content.json"), JSON.stringify(siteContents, null, 2));
  fs.writeFileSync(path.join(outDir, "advertisements.json"), JSON.stringify(advertisements, null, 2));
  fs.writeFileSync(path.join(outDir, "users.json"), JSON.stringify(users, null, 2));
  fs.writeFileSync(path.join(outDir, "platforms.json"), JSON.stringify(platforms, null, 2));
  fs.writeFileSync(path.join(outDir, "comparisons.json"), JSON.stringify(comparisons, null, 2));
  fs.writeFileSync(path.join(outDir, "features.json"), JSON.stringify(features, null, 2));

  console.log("✅ Successfully saved live MongoDB dump to src/data/live-backup/!");
  await prisma.$disconnect();
}

dumpData();
