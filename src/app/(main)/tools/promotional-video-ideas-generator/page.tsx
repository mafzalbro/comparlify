import { Clapperboard } from 'lucide-react';
// import { PromoVideoIdeasForm } from '@/components/promo-video-ideas-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PromotionalVideoIdeasGeneratorPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Clapperboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Promo Video Ideas Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Brainstorm creative concepts for short promotional videos (Reels, Shorts, etc.).
          </p>
        </div>
      </div>
       <Card>
          <CardHeader>
              <CardTitle>Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">This tool is currently under development. Check back soon!</p>
          </CardContent>
      </Card>
    </div>
  );
}
