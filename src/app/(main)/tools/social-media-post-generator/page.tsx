import { Share2 } from 'lucide-react';
import { SocialMediaPostGeneratorForm } from '@/components/social-media-post-generator-form';

export default function SocialMediaPostGeneratorPage() {
  return (
    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[calc(100vh-20rem)] items-start">
        <div className="lg:sticky top-24">
           <div className="flex items-start gap-4">
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
        </div>
        <SocialMediaPostGeneratorForm />
    </div>
  );
}
