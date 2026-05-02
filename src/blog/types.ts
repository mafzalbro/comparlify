export interface PostFactData {
  title: string;
  value: string;
}

export interface PostFaqData {
  question: string;
  answer: string;
}

export interface BlogPostData {
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  dataAiHint?: string;
  published?: boolean;
  categoryName: string;
  authorEmail: string; // To link to an existing user

  // Meta SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  // High-fidelity Author Info
  authorRole?: string;
  authorBio?: string;
  authorCredentials?: string;

  // Engagement Materials
  keyTakeaways?: string[]; // Array of strings for easy management
  checklist?: { item: string; description?: string }[];
  facts?: PostFactData[];
  faqs?: PostFaqData[];

  // Platform linking
  platformNames?: string[]; // Array of platform names to link
}
