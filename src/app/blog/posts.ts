export type BlogPost = {
    slug: string;
    title: string;
    description: string;
    image: string;
    dataAiHint: string;
    author: string;
    date: string;
    readTime: number;
};

export const blogPosts: BlogPost[] = [
    {
      slug: 'choosing-the-right-platform',
      title: '10 Things to Consider When Choosing a Course Platform',
      description:
        'From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.',
      image: 'https://picsum.photos/400/250?random=1',
      dataAiHint: 'decision making choices',
      author: 'Jane Doe',
      date: 'October 26, 2023',
      readTime: 8,
    },
    {
      slug: 'engaging-course-content',
      title: '5 Secrets to Creating Wildly Engaging Course Content',
      description:
        "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.",
      image: 'https://picsum.photos/400/250?random=2',
      dataAiHint: 'creative content creation',
      author: 'John Smith',
      date: 'October 22, 2023',
      readTime: 6,
    },
    {
      slug: 'marketing-your-online-course',
      title: 'The Ultimate Guide to Marketing Your Online Course in 2024',
      description:
        'Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.',
      image: 'https://picsum.photos/400/250?random=3',
      dataAiHint: 'digital marketing strategy',
      author: 'Emily White',
      date: 'October 18, 2023',
      readTime: 12,
    },
      {
      slug: 'ai-in-education',
      title: 'How AI is Revolutionizing the E-Learning Industry',
      description:
        'Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.',
      image: 'https://picsum.photos/400/250?random=4',
      dataAiHint: 'artificial intelligence education',
      author: 'Chris Green',
      date: 'October 15, 2023',
      readTime: 9,
    },
    {
      slug: 'building-a-community',
      title: 'Beyond the Course: Building a Thriving Student Community',
      description:
        'A strong community increases student retention and word-of-mouth marketing. Here’s how to build one from scratch.',
      image: 'https://picsum.photos/400/250?random=5',
      dataAiHint: 'online community students',
      author: 'Maria Garcia',
      date: 'October 11, 2023',
      readTime: 7,
    },
      {
      slug: 'pricing-strategies',
      title: 'Pricing Your Course: Strategies for Maximum Profit and Impact',
      description:
        'Are you under-valuing your content? We break down different pricing models to help you find the sweet spot.',
      image: 'https://picsum.photos/400/250?random=6',
      dataAiHint: 'pricing strategy chart',
      author: 'David Lee',
      date: 'October 07, 2023',
      readTime: 10,
    },
  ];
  