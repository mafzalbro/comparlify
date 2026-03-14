import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting industry-level data seeding...");

  // 1. Clear existing data to avoid duplicates (optional, since we just reset)
  
  // 2. Define High-Fidelity Platforms
  const platforms = [
    {
      name: "Kajabi",
      website: "https://kajabi.com",
      logoUrl: "https://images.comparlify.com/logos/kajabi.png",
      description: "The industry standard for premium all-in-one course platforms, offering everything from hosting to advanced marketing automation.",
      affiliateLink: "https://kajabi.com/?utm_source=comparlify",
      dealDescription: "30-Day Free Trial (Exclusive Extended Trial)",
      pros: ["Powerful automation", "Native email marketing", "Premium mobile app"],
      cons: ["High price point", "Transaction fees on lower tiers", "Learning curve"],
      tiers: [
        { name: "Basic", monthlyPrice: 149, annualPriceMonthlyEquivalent: 119, transactionFeePercent: 0 },
        { name: "Growth", monthlyPrice: 199, annualPriceMonthlyEquivalent: 159, transactionFeePercent: 0, isPopular: true },
        { name: "Pro", monthlyPrice: 399, annualPriceMonthlyEquivalent: 319, transactionFeePercent: 0 },
      ],
    },
    {
      name: "Skool",
      website: "https://skool.com",
      logoUrl: "https://images.comparlify.com/logos/skool.png",
      description: "Community-first platform focused on engagement, gamification, and simple course delivery.",
      affiliateLink: "https://skool.com/?utm_source=comparlify",
      dealDescription: "Start Your 14-Day Free Trial",
      pros: ["Exceptional engagement", "Built-in gamification", "Simple pricing"],
      cons: ["Minimal marketing tools", "No native checkout for complex products", "Limited course styles"],
      tiers: [
        { name: "All-In-One", monthlyPrice: 99, annualPriceMonthlyEquivalent: 99, transactionFeePercent: 0, isPopular: true },
      ],
    },
    {
      name: "Thinkific",
      website: "https://thinkific.com",
      logoUrl: "https://images.comparlify.com/logos/thinkific.png",
      description: "Reliable and scalable platform for creators who want full control over their brand and content.",
      affiliateLink: "https://thinkific.com/?utm_source=comparlify",
      dealDescription: "Get 1 Month Free on Pro Plan",
      pros: ["Great free tier", "Customizable themes", "No transaction fees on paid plans"],
      cons: ["App store can get expensive", "Course player feels slightly dated", "Marketing tools are limited"],
      tiers: [
        { name: "Free", monthlyPrice: 0, annualPriceMonthlyEquivalent: 0, transactionFeePercent: 10 },
        { name: "Basic", monthlyPrice: 49, annualPriceMonthlyEquivalent: 36, transactionFeePercent: 0 },
        { name: "Pro", monthlyPrice: 99, annualPriceMonthlyEquivalent: 74, transactionFeePercent: 0, isPopular: true },
        { name: "Premier", monthlyPrice: 499, annualPriceMonthlyEquivalent: 399, transactionFeePercent: 0 },
      ],
    },
    {
      name: "Teachable",
      website: "https://teachable.com",
      logoUrl: "https://images.comparlify.com/logos/teachable.png",
      description: "User-friendly platform perfect for those who want a simple setup and integrated payment processing.",
      affiliateLink: "https://teachable.com/?utm_source=comparlify",
      dealDescription: "15% Off Your First Year",
      pros: ["Zero transaction fees on Pro+", "Great mobile app", "Automated tax handling"],
      cons: ["Basic plan has 5% transaction fees", "Member limits on lower plans", "Customer support can be slow"],
      tiers: [
        { name: "Free", monthlyPrice: 0, annualPriceMonthlyEquivalent: 0, transactionFeePercent: 10 },
        { name: "Basic", monthlyPrice: 59, annualPriceMonthlyEquivalent: 39, transactionFeePercent: 5 },
        { name: "Pro", monthlyPrice: 159, annualPriceMonthlyEquivalent: 119, transactionFeePercent: 0, isPopular: true },
        { name: "Business", monthlyPrice: 665, annualPriceMonthlyEquivalent: 499, transactionFeePercent: 0 },
      ],
    }
  ];

  for (const p of platforms) {
    const { tiers, ...platformData } = p;
    
    // Upsert platform
    const platform = await prisma.platform.upsert({
      where: { name: p.name },
      update: {
        ...platformData,
        pros: platformData.pros,
        cons: platformData.cons,
      },
      create: {
        ...platformData,
        pros: platformData.pros,
        cons: platformData.cons,
      },
    });

    console.log(`✅ Synced Platform: ${platform.name}`);

    // Create tiers
    for (const tier of tiers) {
      await prisma.pricingTier.create({
        data: {
          ...tier,
          platformId: platform.id,
        }
      });
      console.log(`   - Created Tier: ${tier.name}`);
    }
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
