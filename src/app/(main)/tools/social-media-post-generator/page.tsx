import { Share2 } from 'lucide-react';
import { SocialMediaPostGeneratorForm } from '@/components/social-media-post-generator-form';

export default function SocialMediaPostGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Share2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Social Media Post Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate engaging posts to promote your course on social media.
          </p>
        </div>
        <SocialMediaPostGeneratorForm />
      </div>
    </div>
  );
}
