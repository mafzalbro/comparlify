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
  await prisma.forumPost.deleteMany();
  await prisma.forumTopic.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.emailRecipient.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.platformFeature.deleteMany();
  await prisma.fact.deleteMany();
  await prisma.faq.deleteMany();
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
      newsletter: true,
    },
    {
      name: "Bob Builder",
      email: "maf415415@gmail.com",
      role: Role.USER,
      onboarded: false,
      newsletter: true,
    },
    {
      name: "Charlie User",
      email: "ma4156250@gmail.com",
      role: Role.USER,
      onboarded: false,
      newsletter: false,
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
    // Globals
    { key: 'global.siteName', group: 'Globals', value: 'Comparlify' },
    
    // Homepage
    { key: 'homepage.hero.supertitle', group: 'Homepage', value: 'The Ultimate Co-pilot for Course Creators' },
    { key: 'homepage.hero.title', group: 'Homepage', value: 'Build, Market & Sell\nSmarter, Not Harder' },
    { key: 'homepage.hero.subtitle', group: 'Homepage', value: 'Comparlify provides the tools, comparisons, and insights you need to turn your expertise into a thriving online business.' },
    { key: 'homepage.cta.primary', group: 'Homepage', value: 'Explore AI Tools' },
    { key: 'homepage.cta.secondary', group: 'Homepage', value: 'Compare Platforms' },
    { key: 'homepage.whyus.title', group: 'Homepage', value: 'Your All-In-One Creator Hub' },
    { key: 'homepage.whyus.subtitle', group: 'Homepage', value: 'Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.' },
    { key: 'homepage.whyus.comparisons.title', group: 'Homepage', value: 'Unbiased Comparisons' },
    { key: 'homepage.whyus.comparisons.description', group: 'Homepage', value: 'Get in-depth, data-driven comparisons of the top platforms. We dig into the details so you can choose with absolute confidence.' },
    { key: 'homepage.whyus.aitools.title', group: 'Homepage', value: 'Powerful AI Tools' },
    { key: 'homepage.whyus.aitools.description', group: 'Homepage', value: 'From generating catchy titles to outlining entire courses, our suite of AI tools is designed to save you time and spark your creativity.' },
    { key: 'homepage.whyus.strategies.title', group: 'Homepage', value: 'Growth Strategies' },
    { key: 'homepage.whyus.strategies.description', group: 'Homepage', value: 'Access our regularly updated blog for expert tips, marketing strategies, and insights to help you scale your course business effectively.' },
    { key: 'homepage.tools.title', group: 'Homepage', value: 'Supercharge Your Workflow' },
    { key: 'homepage.tools.subtitle', group: 'Homepage', value: 'Our suite of AI-powered tools is designed to handle the tedious tasks, so you can focus on creating.' },
    { key: 'homepage.blog.title', group: 'Homepage', value: 'Creator Insights' },
    { key: 'homepage.blog.subtitle', group: 'Homepage', value: 'The latest strategies, tips, and news from our blog.' },
    { key: 'homepage.testimonials.title', group: 'Homepage', value: 'Loved by Creators Worldwide' },
    { key: 'homepage.testimonials.subtitle', group: 'Homepage', value: "Don't just take our word for it. Here's what creators are saying about Comparlify." },
    { key: 'homepage.finalCta.title', group: 'Homepage', value: 'Ready to Elevate Your Course Business?' },
    { key: 'homepage.finalCta.subtitle', group: 'Homepage', value: 'Join thousands of successful creators. Access all our tools and resources for free.' },
    { key: 'homepage.finalCta.button', group: 'Homepage', value: 'Sign Up for Free' },

    // Header & Footer
    { key: 'header.navLinks', group: 'Header', type: 'TEXTAREA', value: JSON.stringify([ { "href": "/", "label": "Home" }, { "href": "/compare", "label": "Comparisons" }, { "href": "/blog", "label": "Blog" }, { "href": "/news", "label": "News" }, { "href": "/community", "label": "Community" }, { "href": "/tools", "label": "Tools" }, { "href": "/about", "label": "About" }, { "href": "/contact", "label": "Contact" } ], null, 2) },
    { key: 'footer.tagline', group: 'Footer', value: 'Helping course creators thrive with better tools and insights.' },
    { key: 'footer.newsletter.title', group: 'Footer', value: 'Stay Updated' },
    { key: 'footer.newsletter.subtitle', group: 'Footer', value: 'Get the latest tips and tool updates straight to your inbox.' },

    // About Page
    { key: 'about.hero.title', group: 'About Page', value: "We're Here to Help Creators Thrive" },
    { key: 'about.hero.subtitle', group: 'About Page', value: 'Discover the story, mission, and people behind Comparlify.' },
    { key: 'about.story.content', group: 'About Page', type: 'MARKDOWN', value: `## Our Story\n\nComparlify was born from a simple observation: the world of online course creation is both exciting and overwhelming. With countless platforms, tools, and strategies available, creators often find themselves lost in a sea of options, spending more time on research than on what they do best—creating amazing content.\n\nWe decided to change that. Our mission is to be the trusted guide for every course creator. We provide unbiased, in-depth comparisons, innovative AI-powered tools, and actionable insights to help you make informed decisions, save time, and accelerate your growth.\n\n> "We believe that every creator, regardless of their technical skill or budget, deserves a clear path to success."` },
    { key: 'about.values.title', group: 'About Page', value: 'Our Core Values' },
    { key: 'about.values.subtitle', group: 'About Page', value: 'These principles guide everything we do.' },
    { key: 'about.values.clarity.title', group: 'About Page', value: 'Clarity' },
    { key: 'about.values.clarity.description', group: 'About Page', value: 'We cut through the noise, providing clear, unbiased information to help you make confident decisions.' },
    { key: 'about.values.community.title', group: 'About Page', value: 'Community' },
    { key: 'about.values.community.description', group: 'About Page', value: "We believe in the power of creators helping creators. We're building a space for support and growth." },
    { key: 'about.values.empowerment.title', group: 'About Page', value: 'Empowerment' },
    { key: 'about.values.empowerment.description', group: 'About Page', value: 'Our goal is to give you the tools and insights you need to turn your passion into a thriving business.' },
    { key: 'about.team.title', group: 'About Page', value: 'Meet the Creators' },
    { key: 'about.team.subtitle', group: 'About Page', value: "We're a small, passionate team dedicated to your success." },
    { key: 'about.team.members', group: 'About Page', type: 'TEXTAREA', value: JSON.stringify([ { name: "Alex Doe", role: "Co-Founder & Lead Strategist", avatar: "https://picsum.photos/seed/alex/100/100", dataAiHint: "man professional portrait" }, { name: "Jamie Smith", role: "Co-Founder & Head of Product", avatar: "https://picsum.photos/seed/jamie/100/100", dataAiHint: "woman smiling portrait" } ], null, 2) },
    { key: 'about.cta.title', group: 'About Page', value: 'Ready to Join Us?' },
    { key: 'about.cta.subtitle', group: 'About Page', value: 'Become part of a community of forward-thinking creators. Explore our tools and insights today.' },
    { key: 'about.cta.button', group: 'About Page', value: 'Get Started for Free' },
    
    // Contact Page
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
    
    // Privacy Page
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
    
    // Blog Page Content
    { key: 'blog.hero.title', group: 'Blog Page', value: 'Creator Insights' },
    { key: 'blog.hero.subtitle', group: 'Blog Page', value: 'Actionable advice, deep dives, and growth strategies for the modern course creator.' },
    { key: 'blog.empty.title', group: 'Blog Page', value: 'No Posts Found' },
    { key: 'blog.empty.subtitle', group: 'Blog Page', value: 'Try adjusting your search or filters. Or check back soon!' },
    { key: 'blog.post.backLink', group: 'Blog Page', value: 'Back to Blog' },
    { key: 'blog.post.relatedTitle', group: 'Blog Page', value: 'Related Posts' },
    { key: 'blog.post.preview.title', group: 'Blog Page', value: 'Preview Mode' },
    { key: 'blog.post.preview.subtitle', group: 'Blog Page', value: 'This is a draft post and is not visible to the public.' },
    { key: 'blog.post.preview.exitButton', group: 'Blog Page', value: 'Exit Preview' },
    
    // Comparison Page Content
    { key: 'compare.hero.title', group: 'Comparison Page', value: 'Course Platform Face-Off' },
    { key: 'compare.hero.subtitle', group: 'Comparison Page', value: "We've put the top platforms head-to-head. Get unbiased, in-depth analysis to make the right choice." },
    { key: 'compare.empty.title', group: 'Comparison Page', value: 'No Comparisons Found' },
    { key: 'compare.empty.subtitle', group: 'Comparison Page', value: 'Try adjusting your search or filters. Or check back soon!' },
    { key: 'compare.detail.backLink', group: 'Comparison Page', value: 'Back to All Comparisons' },
    { key: 'compare.detail.glance.title', group: 'Comparison Page', value: 'At a Glance' },
    { key: 'compare.detail.ratings.title', group: 'Comparison Page', value: 'Ratings Breakdown' },
    { key: 'compare.detail.ratings.chartTitle', group: 'Comparison Page', value: 'Side-by-Side Ratings' },
    { key: 'compare.detail.features.title', group: 'Comparison Page', value: 'Feature Comparison' },
    { key: 'compare.detail.faq.title', group: 'Comparison Page', value: 'Frequently Asked Questions' },

    // Admin Settings
    { key: 'settings.email.fromName', group: 'Email Settings', value: 'Comparlify' },
    { key: 'settings.email.fromEmail', group: 'Email Settings', value: 'noreply@comparlify.com' },
    { key: 'settings.code.head', group: 'Code Injection', type: 'TEXTAREA', value: '' },

    // Legal Pages
    {
      key: 'legal.terms-of-service',
      group: 'Legal Pages',
      type: 'MARKDOWN',
      value: `
# Terms of Service

**Last Updated:** ${new Date().toLocaleDateString()}

Welcome to Comparlify! These terms and conditions outline the rules and regulations for the use of Comparlify's Website, located at comparlify.com.

By accessing this website we assume you accept these terms and conditions. Do not continue to use Comparlify if you do not agree to take all of the terms and conditions stated on this page.

... (full terms content) ...
`
    },
    {
      key: 'legal.sponsor-policy',
      group: 'Legal Pages',
      type: 'MARKDOWN',
      value: `
# Sponsor & Affiliate Policy

**Last Updated:** ${new Date().toLocaleDateString()}

At Comparlify, our mission is to provide clear, unbiased, and valuable information to course creators. To support our work and keep our content free, we may partner with companies through sponsorships or affiliate links. This policy outlines our commitment to transparency.

## Our Principles

1.  **Editorial Independence:** Our content is created independently. Sponsors do not influence our reviews, comparisons, or opinions.
2.  **Transparency:** We will always clearly disclose sponsored content or affiliate relationships.
3.  **Relevance:** We only partner with companies whose products or services we believe are genuinely valuable to our audience.

... (full policy content) ...
`
    },

  ];
  await prisma.siteContent.createMany({ data: siteContent });
  console.log("Seeded site content.");

  // --- 12. Seed News ---
  await prisma.newsArticle.create({
    data: {
      title: "Comparlify Launches New AI-Powered Tool Suite",
      slug: "comparlify-launches-ai-tools",
      content: "We're excited to announce a major update to our platform. Our new suite of AI-powered tools is designed to help course creators streamline their workflow and produce higher-quality content faster than ever before. From generating course outlines to scripting video lessons, these tools are your new creative co-pilot.",
      image: "https://picsum.photos/400/250?random=10",
      dataAiHint: "technology launch announcement",
      published: true,
      authorId: adminUser.id,
    }
  });
  console.log("Seeded news articles.");

  // --- 13. Seed Community ---
  const generalCategory = await prisma.forumCategory.create({
    data: { name: "General Discussion", slug: "general-discussion", description: "Talk about anything related to course creation."}
  });

  const introductionsTopic = await prisma.forumTopic.create({
    data: {
      title: "Welcome! Introduce Yourself",
      content: "Welcome to the community! Take a moment to introduce yourself and tell us what you're working on.",
      authorId: adminUser.id,
      categoryId: generalCategory.id,
      status: 'APPROVED',
    }
  });

  await prisma.forumPost.create({
    data: {
      content: "Hey everyone! I'm Bob, and I'm building a course on woodworking for beginners. Excited to learn from you all!",
      authorId: bobUser.id,
      topicId: introductionsTopic.id,
      status: 'APPROVED',
    }
  });

  await prisma.forumPost.create({
    data: {
      content: "Welcome, Bob! Glad to have you here.",
      authorId: adminUser.id,
      topicId: introductionsTopic.id,
      status: 'APPROVED',
    }
  });

  console.log("Seeded community forums.");


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

    
