
"use server";
import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Start seeding...");

  // --- 1. Clean up existing data ---
  console.log("Cleaning up existing data...");

  // First, break the navigation links
  await prisma.$executeRaw`UPDATE Post SET previousId = NULL, nextId = NULL`;

  // Then delete in correct order
  await prisma.siteContent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany(); // Delete bookmarks before posts
  await prisma.post.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.platformFeature.deleteMany();
  await prisma.fact.deleteMany(); // Delete facts before comparisons
  await prisma.faq.deleteMany(); // Delete FAQs before comparisons
  await prisma.bookmark.deleteMany(); // Delete any remaining bookmarks
  await prisma.feature.deleteMany();
  await prisma.featureCategory.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.user.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.comparisonCategory.deleteMany();

  console.log("Cleaned up existing data.");


  // --- 2. Seed Users ---
  const usersData = [
    {
      name: "Afzal Creator",
      email: "mafzalbro@gmail.com",
      role: Role.ADMIN,
      onboarded: true,
    },
    {
      name: "Bob Builder",
      email: "maf415415@gmail.com",
      role: Role.USER,
      onboarded: false,
    },
    {
      name: "Charlie User",
      email: "ma4156250@gmail.com",
      role: Role.USER,
      onboarded: false,
    }
  ];
  await prisma.user.createMany({ data: usersData });
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'mafzalbro@gmail.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'maf415415@gmail.com' } });
  const charlieUser = await prisma.user.findUnique({ where: { email: 'ma4156250@gmail.com' } });

  if (!adminUser || !bobUser || !charlieUser) {
    throw new Error("Failed to seed users correctly.");
  }
  
  console.log(`Seeded ${usersData.length} users.`);


  // --- 3. Seed Features and Categories ---
  const categoriesData = [
    { name: "Core Course Features", features: ["Course Builder", "Video Hosting", "Quizzes & Surveys", "Assignments", "Certificates of Completion", "Content Dripping"] },
    { name: "Site & Marketing", features: ["Website Builder", "Custom Domain", "Blogging", "Affiliate Marketing", "Email Marketing", "Sales & Coupons"] },
    { name: "Student Experience", features: ["Community Forum", "Mobile App Access", "Live Classes / Webinars", "Student Dashboard"] },
    { name: "Business & Analytics", features: ["Payment Gateways", "Advanced Analytics", "API Access", "App Integrations"] },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.featureCategory.create({
      data: { name: cat.name }
    });
    await prisma.feature.createMany({
      data: cat.features.map(name => ({ name, categoryId: category.id }))
    });
  }
  console.log("Seeded feature categories and features.");

  // --- 4. Seed Platforms ---
  const allFeatures = await prisma.feature.findMany();
  const featureMap = new Map(allFeatures.map(f => [f.name, f.id]));

  const platformsData: Omit<Prisma.PlatformCreateInput, 'createdAt' | 'updatedAt'>[] = [
    {
        name: "Teachable",
        website: "https://teachable.com",
        logoUrl: "/logos/teachable.svg",
        description: "A popular platform that focuses on ease of use for creators just starting out. Great for simple course structures.",
        rating: 4.2, easeOfUse: 4.8, featuresRating: 4.0, support: 4.1
    },
    {
        name: "Thinkific",
        website: "https://www.thinkific.com",
        logoUrl: "/logos/thinkific.svg",
        description: "A powerful and flexible platform that offers more customization options and advanced features for growing businesses.",
        rating: 4.6, easeOfUse: 4.5, featuresRating: 4.7, support: 4.6
    },
    {
        name: "Kajabi",
        website: "https://kajabi.com",
        logoUrl: "/logos/kajabi.svg",
        description: "An all-in-one platform that includes email marketing, website building, and sales funnels in addition to course hosting.",
        rating: 4.8, easeOfUse: 4.3, featuresRating: 4.9, support: 4.7
    },
    {
        name: "Podia",
        website: "https://www.podia.com",
        logoUrl: "/logos/podia.svg",
        description: "A creator-friendly platform for courses, digital downloads, and memberships with a focus on simplicity and affordability.",
        rating: 4.5, easeOfUse: 4.9, featuresRating: 4.2, support: 4.5
    }
  ];
  
  await prisma.platform.createMany({ data: platformsData });
  const createdPlatforms = await prisma.platform.findMany();
  console.log(`Seeded ${createdPlatforms.length} platforms.`);

  // --- 5. Seed Platform Features ---
  const platformFeatureData = {
    "Teachable": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": false, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": true, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": false, "Mobile App Access": {hasFeature: true, details: "iOS only"}, "Live Classes / Webinars": false, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": {hasFeature: true, details: "On Pro plan+"}, "App Integrations": true },
    "Thinkific": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": true, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": false, "Affiliate Marketing": true, "Email Marketing": false, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": true, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": true, "App Integrations": true },
    "Kajabi": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": true, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": true, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": true, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": true, "App Integrations": true },
    "Podia": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": {hasFeature: true, details: "Simple quizzes"}, "Assignments": false, "Certificates of Completion": false, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": false, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": false, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": false, "API Access": false, "App Integrations": false }
  };

  for (const platform of createdPlatforms) {
    const features = platformFeatureData[platform.name as keyof typeof platformFeatureData];
    for (const [featureName, value] of Object.entries(features)) {
      const featureId = featureMap.get(featureName);
      if (featureId) {
        const hasFeature = typeof value === 'boolean' ? value : value.hasFeature;
        const details = typeof value === 'object' && value.details ? value.details : null;
        await prisma.platformFeature.create({
          data: { platformId: platform.id, featureId, hasFeature, details }
        });
      }
    }
  }
  console.log("Seeded platform features.");

  // --- 6. Seed Blog Post Categories ---
  await prisma.postCategory.createMany({
    data: [
      { name: "Platform Guides", slug: "platform-guides" },
      { name: "Course Creation", slug: "course-creation" },
      { name: "Marketing", slug: "marketing" },
      { name: "Tech Trends", slug: "tech-trends" },
    ]
  });
  const postCategories = await prisma.postCategory.findMany();
  console.log("Seeded post categories.");
  const postCategoryMap = new Map(postCategories.map(c => [c.name, c.id]));


  // --- 7. Seed Blog Posts ---
  const postsData: (Omit<Prisma.PostCreateInput, "author" | "category"> & {categoryName: string})[] = [
      { slug: "choosing-the-right-platform", title: "10 Things to Consider When Choosing a Course Platform", description: "From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.", content: "Full content about choosing platforms...", image: "https://picsum.photos/400/250?random=1", dataAiHint: "decision making choices", published: true, authorId: adminUser.id, categoryName: "Platform Guides" },
      { slug: "engaging-course-content", title: "5 Secrets to Creating Wildly Engaging Course Content", description: "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.", content: "Full content about engaging content...", image: "https://picsum.photos/400/250?random=2", dataAiHint: "creative content creation", published: true, authorId: adminUser.id, categoryName: "Course Creation" },
      { slug: "marketing-your-online-course", title: "The Ultimate Guide to Marketing Your Online Course in 2024", description: "Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.", content: "Full content about marketing courses...", image: "https://picsum.photos/400/250?random=3", dataAiHint: "digital marketing strategy", published: true, authorId: adminUser.id, categoryName: "Marketing" },
      { slug: "ai-in-education", title: "How AI is Revolutionizing the E-Learning Industry", description: "Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.", content: "Full content about AI in education...", image: "https://picsum.photos/400/250?random=4", dataAiHint: "artificial intelligence education", published: false, authorId: adminUser.id, categoryName: "Tech Trends" },
  ];
  
  let previousPostId: string | null = null;
  for (let i = 0; i < postsData.length; i++) {
    const { categoryName, ...rest } = postsData[i];
    const categoryId = postCategoryMap.get(categoryName);
    if (!categoryId) {
      console.warn(`Category '${categoryName}' not found for post '${postsData[i].title}'. Skipping post.`);
      continue;
    }
    const post = await prisma.post.create({
        data: {
            ...rest,
            categoryId,
            previousId: previousPostId,
        }
    });
    if (previousPostId) {
        await prisma.post.update({
            where: { id: previousPostId },
            data: { nextId: post.id }
        });
    }
    previousPostId = post.id;
  }
  console.log("Seeded blog posts with navigation links.");

  const allPosts = await prisma.post.findMany();
  const post1 = allPosts.find(p => p.slug === 'choosing-the-right-platform')!;
  const post2 = allPosts.find(p => p.slug === 'engaging-course-content')!;

  // --- 8. Seed Comments ---
  await prisma.comment.createMany({
    data: [
        { content: "This was incredibly helpful! I was stuck between Teachable and Thinkific, and this breakdown made the choice clear.", postId: post1.id, authorId: charlieUser.id, status: 'APPROVED' },
        { content: "Great article. What are your thoughts on Kajabi's price point for new creators? Seems a bit steep.", postId: post1.id, authorId: bobUser.id, status: 'PENDING' },
        { content: "These are fantastic ideas for engagement. I'm definitely going to try adding more interactive quizzes.", postId: post2.id, authorId: charlieUser.id, status: 'APPROVED' },
        { content: "I don't agree with point #3.", postId: post2.id, authorId: bobUser.id, status: 'REJECTED' },
    ]
  });
  console.log("Seeded comments.");


  // --- 9. Seed Comparison Categories ---
  await prisma.comparisonCategory.createMany({
    data: [
      { name: "Flagship Showdowns", slug: "flagship-showdowns" },
      { name: "All-in-One vs. Standalone", slug: "all-in-one-vs-standalone" },
    ]
  });
  const compCategories = await prisma.comparisonCategory.findMany();
  console.log("Seeded comparison categories.");
  const compCategoryMap = new Map(compCategories.map(c => [c.name, c.id]));


  // --- 10. Seed Comparisons ---
  const platformTeachable = createdPlatforms.find(p => p.name === "Teachable")!;
  const platformThinkific = createdPlatforms.find(p => p.name === "Thinkific")!;

  await prisma.comparison.create({
    data: {
        title: "Teachable vs. Thinkific: The Ultimate 2024 Showdown",
        slug: "teachable-vs-thinkific",
        summary: "We dive deep into the features, pricing, and user experience of Teachable and Thinkific to help you decide which is the best fit for your course creation journey.",
        platformAId: platformTeachable.id,
        platformBId: platformThinkific.id,
        categoryId: compCategoryMap.get("Flagship Showdowns"),
        introduction: "### Introduction\nChoosing between Teachable and Thinkific is a common dilemma for course creators. Both are industry leaders, but they cater to slightly different needs. This comparison will break down the key differences.",
        conclusion: "### Conclusion\nFor beginners who prioritize simplicity, Teachable is a fantastic starting point. For those needing more customization and advanced features, Thinkific offers a more robust platform to grow into.",
        published: true,
        facts: {
            create: [
                { title: "Best For", platformAValue: "Beginners", platformBValue: "Entrepreneurs" },
                { title: "Free Plan", platformAValue: "Yes, limited", platformBValue: "Yes, limited" },
                { title: "Transaction Fees (on free plan)", platformAValue: "10% + $1", platformBValue: "0%" }
            ]
        },
        faqs: {
            create: [
                { question: "Which platform has better marketing tools?", answer: "Kajabi is generally considered to have the most comprehensive, all-in-one marketing suite." },
                { question: "Can I use my own domain with both?", answer: "Yes, both Teachable and Thinkific support custom domains on their paid plans." }
            ]
        }
    }
  });
  console.log("Seeded comparisons.");

  // --- 11. Seed Site Content ---
  const siteContent = [
    { key: 'homepage.hero.supertitle', group: 'Homepage', value: 'The Ultimate Co-pilot for Course Creators' },
    { key: 'homepage.hero.title', group: 'Homepage', value: 'Build, Market & Sell\nSmarter, Not Harder' },
    { key: 'homepage.hero.subtitle', group: 'Homepage', value: 'Comparlify provides the tools, comparisons, and insights you need to turn your expertise into a thriving online business.' },
    { key: 'homepage.cta.primary', group: 'Homepage', value: 'Explore AI Tools' },
    { key: 'homepage.cta.secondary', group: 'Homepage', value: 'Compare Platforms' },
    { key: 'footer.tagline', group: 'Footer', value: 'Helping course creators thrive with better tools and insights.' },
    { key: 'footer.newsletter.title', group: 'Footer', value: 'Stay Updated' },
    { key: 'footer.newsletter.subtitle', group: 'Footer', value: 'Get the latest tips and tool updates straight to your inbox.' },
    { key: 'about.hero.title', group: 'About Page', value: "We're Here to Help Creators Thrive" },
    { key: 'about.hero.subtitle', group: 'About Page', value: 'Discover the story, mission, and people behind Comparlify.' },
    { key: 'about.story.content', group: 'About Page', type: 'MARKDOWN', value: `## Our Story\n\nComparlify was born from a simple observation: the world of online course creation is both exciting and overwhelming. With countless platforms, tools, and strategies available, creators often find themselves lost in a sea of options, spending more time on research than on what they do best—creating amazing content.\n\nWe decided to change that. Our mission is to be the trusted guide for every course creator. We provide unbiased, in-depth comparisons, innovative AI-powered tools, and actionable insights to help you make informed decisions, save time, and accelerate your growth.\n\n> "We believe that every creator, regardless of their technical skill or budget, deserves a clear path to success."` },
    { key: 'contact.hero.title', group: 'Contact Page', value: 'Get in Touch' },
    { key: 'contact.hero.subtitle', group: 'Contact Page', value: "We'd love to hear from you! Whether you have a question, feedback, or a partnership proposal, feel free to reach out." },
    { key: 'contact.email.title', group: 'Contact Page', value: 'Email' },
    { key: 'contact.email.description', group: 'Contact Page', value: 'Send us an email for general inquiries.' },
    { key: 'contact.email.value', group: 'Contact Page', value: 'hello@comparlify.com' },
    { key: 'contact.phone.title', group: 'Contact Page', value: 'Phone' },
    { key: 'contact.phone.description', group: 'Contact Page', value: 'Give us a call during business hours.' },
    { key: 'contact.phone.value', group: 'Contact Page', value: '+1 (234) 567-890' },
    { key: 'contact.office.title', group: 'Contact Page', value: 'Office' },
    { key: 'contact.office.description', group: 'Contact Page', value: '123 Creator Lane, Suite 100\nInnovation City, 12345' },
    { key: 'privacy.policy', group: 'Privacy Page', type: 'MARKDOWN', value: `
Your privacy is important to us. It is Comparlify's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.

## 1. Information We Collect
We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

### Log Data
When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.

### Personal Information
We may ask for personal information, such as your: Name, Email, Social media profiles, Date of birth, Phone/mobile number.

## 2. How We Use Your Information
We may use the information we collect for various purposes, including to:
<ul>
  <li>Provide, operate, and maintain our website</li>
  <li>Improve, personalize, and expand our website</li>
  <li>Understand and analyze how you use our website</li>
  <li>Develop new products, services, features, and functionality</li>
  <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
  <li>Send you emails</li>
  <li>Find and prevent fraud</li>
</ul>

## 3. Security of Your Personal Information
We retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

## 4. Links to Other Sites
Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.

## 5. Changes to Our Privacy Policy
We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.

## 6. Contact Us
If you have any questions about our privacy policy, please contact us at <a href="mailto:privacy@comparlify.com">privacy@comparlify.com</a>.
`},
  ];
  await prisma.siteContent.createMany({ data: siteContent });
  console.log("Seeded site content.");

  console.log("Seeding finished.");
}


export const seed = async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// If this file is run directly, execute the seed function.
if (require.main === module) {
  seed();
}
