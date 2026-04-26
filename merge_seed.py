import os

with open('base_seed.ts', 'r') as f:
    lines = f.readlines()

# 1. Add imports
# Check if they exist first to avoid duplicates
has_url = any('import { fileURLToPath }' in l for l in lines)
has_platforms = any('import { allPlatforms }' in l for l in lines)

new_lines = []
if not has_url:
    new_lines.append('import { fileURLToPath } from "url";\n')

for line in lines:
    new_lines.append(line)
    if 'import prisma from "@/lib/prisma";' in line and not has_platforms:
        new_lines.append('import { allPlatforms } from "../src/compare/platforms";\n')

# 2. Inject platform seeding block
# Find the end of user seeding
user_seed_line = -1
for i, line in enumerate(new_lines):
    if 'console.log(`Seeded ${usersData.length} users.`);' in line:
        user_seed_line = i
        break

if user_seed_line != -1:
    platform_block = """
  // --- 2.1 Seed High-Fidelity Platforms (36 Entities) ---
  console.log("📍 Seeding 36 high-fidelity platforms...");
  for (const data of allPlatforms) {
    const platform = await prisma.platform.create({
      data: {
        name: data.name,
        website: data.website,
        logoUrl: data.logoUrl,
        description: data.description,
        rating: data.rating,
        easeOfUse: data.easeOfUse,
        featuresRating: data.featuresRating,
        support: data.support,
        pros: data.pros,
        cons: data.cons,
        affiliateLink: data.affiliateLink,
        dealDescription: data.dealDescription,
        videoHostingIncluded: data.videoHostingIncluded,
        lastVerifiedAt: new Date(data.lastVerifiedAt),
        tiers: {
          create: data.tiers.map(t => ({
            name: t.name,
            monthlyPrice: t.monthlyPrice,
            annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
            transactionFeePercent: t.transactionFeePercent,
            isPopular: t.isPopular || false,
            features: t.features,
          }))
        }
      }
    });

    for (const feat of data.features) {
      const category = await prisma.featureCategory.upsert({
        where: { name: feat.categoryName },
        update: {},
        create: { name: feat.categoryName },
      });

      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id }
      });

      if (!existingFeature) {
        existingFeature = await prisma.feature.create({
          data: { name: feat.featureName, categoryId: category.id }
        });
      }

      await prisma.platformFeature.create({
        data: {
          platformId: platform.id,
          featureId: existingFeature.id,
          hasFeature: feat.hasFeature,
          details: feat.details
        }
      });
    }
  }
"""
    new_lines.insert(user_seed_line + 1, platform_block)

# 3. Inject curated comparisons
# Find the comparisons seeding loop or end
comp_marker = -1
for i, line in enumerate(new_lines):
    if 'console.log(`   ✓ Seeded ${comparisonsToCreate.length} comparisons.`);' in line:
        comp_marker = i
        break

if comp_marker != -1:
    long_comparison = """
  // Curated Strategic Comparison
  const platforms_lookup = await prisma.platform.findMany();
  const get_plat = (name) => platforms_lookup.find(p => p.name === name);
  const pA_tp = get_plat("Teachable");
  const pB_tp = get_plat("Patreon");

  if (pA_tp && pB_tp) {
    await prisma.comparison.create({
      data: {
        title: "Teachable vs Patreon: The Definitive Creator Strategy Guide",
        slug: "teachable-vs-patreon",
        summary: "Direct Courses vs. Membership Communities. Which model scales your sovereignty?",
        platformAId: pA_tp.id,
        platformBId: pB_tp.id,
        categoryId: compCategoryMap.get("Flagship Showdowns"),
        introduction: "Choosing between Teachable and Patreon is more than just a software decision; it is a choice between two fundamentally different business architectures. In 2026, the successful creator must decide whether they are building a school or a movement.",
        conclusion: "Use Teachable if you have a structured curriculum and want to sell high-ticket transformational assets. Use Patreon if you are a creative building a long-term membership community where the product is the recurring relationship.",
        published: true,
        content: `## The Strategic Divergence: Assets vs. Access\\n\\n### The Teachable Philosophy: Institutional Scaling\\nTeachable is built for the "Expert Economy." It views content as a structured asset that should be packaged, certified, and sold as a transformational journey. It is ideal for the teacher who wants to build an academy. The infrastructure is designed to handle high-intent students who are investing in their future career or personal growth. Features like lesson locking, course completion certificates, and advanced quiz logic ensure a pedagogical rigor that justifica premium pricing.\\n\\n### The Patreon Philosophy: Relationship Velocity\\nPatreon is built for the "Fan Economy." It views content as a fuel for membership. It is optimized for creators who have a consistent creative output and want to monetize their most loyal 1% through recurring support. On Patreon, the value isn't just in the 'lesson'; it's in the 'proximity.' Supporters pay for early access, behind-the-scenes insights, and the feeling of being part of an inner circle. The technical friction is near-zero, focusing on a continuous stream of engagement rather than a static curriculum.\\n\\n### Scenario Analysis: Choosing Your Path\\n\\n**1. The Career Transitioner (The Aspiring Teacher)**\\nIf you are leaving a corporate job to teach coding or marketing, Teachable provides the professional infrastructure to justify a $997 price point. Patreon’s low-barrier entry ($5-$20) might devalue your high-end intellectual property.\\n\\n**2. The Expanding Artist (The Scaler)**\\nIf you already have a massive audience on YouTube or TikTok and want to provide "behind the scenes" access and exclusive perks, Patreon is the frictionless choice. It handles the psychology of "supporting the creator" better than any LMS.\\n\\n**3. The Failed Businessman (The Restructuring)**\\nIf you tried to build a complex SaaS and failed, moving to a Teachable-based academy allows you to monetize your "Lessons Learned" with zero technical overhead, focusing entirely on curriculum over code.`,
        facts: {
          create: [
            { title: "Primary Model", platformAValue: "Academy/LMS", platformBValue: "Membership/Fan-Club" },
            { title: "Pricing Philosophy", platformAValue: "High-Ticket/Asset-Based", platformBValue: "Micro-Payments/Recurring" }
          ]
        }
      }
    });
  }
"""
    new_lines.insert(comp_marker, long_comparison)

# 4. Final adjustments
# Update siteContent loop and require check if they exist
for i, line in enumerate(new_lines):
    if 'await prisma.siteContent.createMany({ data: siteContent });' in line:
        new_lines[i] = '  for (const content of siteContent) { await prisma.siteContent.upsert({ where: { key: content.key }, update: content as any, create: content as any }); }\n'
    if 'if (require.main === module) {' in line:
        new_lines[i] = 'if (process.argv[1] === fileURLToPath(import.meta.url)) {\n'

with open('prisma/seed.ts', 'w') as f:
    f.writelines(new_lines)
