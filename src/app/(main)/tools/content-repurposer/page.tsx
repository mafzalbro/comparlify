import { Recycle } from 'lucide-react';
// This is a placeholder for the real form component
// import { ContentRepurposerForm } from '@/components/content-repurposer-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      {/* <ContentRepurposerForm /> */}
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
