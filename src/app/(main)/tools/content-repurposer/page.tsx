
import { Recycle } from 'lucide-react';
import { ContentRepurposerForm } from '@/components/content-repurposer-form';

export default function ContentRepurposerPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Recycle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Content Repurposer</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Get ideas for turning your existing content into multiple new formats.
          </p>
        </div>
      </div>
      <ContentRepurposerForm />
    </div>
  );
}
