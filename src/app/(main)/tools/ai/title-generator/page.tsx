import { Lightbulb } from 'lucide-react';
import { TitleGeneratorForm } from '@/components/title-generator-form';

export default function TitleGeneratorPage() {
  return (
    <div>
      <div className="flex items-start gap-4 mb-12">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Title Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Craft the perfect title for your course. Let our AI do the hard work!
          </p>
        </div>
      </div>
      <TitleGeneratorForm />
    </div>
  );
}
