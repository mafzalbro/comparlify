import { Lightbulb } from 'lucide-react';
import { TitleGeneratorForm } from '@/components/title-generator-form';

export default function TitleGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Lightbulb className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Title Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Craft the perfect title for your course. Let our AI do the hard work!
          </p>
        </div>
        <TitleGeneratorForm />
      </div>
    </div>
  );
}
