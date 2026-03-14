import { Share2 } from 'lucide-react';
import { SocialMediaPostGeneratorForm } from '@/components/social-media-post-generator-form';

export default function SocialMediaPostGeneratorPage() {
  return (
    <div>
      <div className="flex items-start gap-4 mb-12">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Share2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Social Media Post Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Generate engaging posts to promote your course on social media.
          </p>
        </div>
      </div>
      <SocialMediaPostGeneratorForm />
    </div>
  );
}
