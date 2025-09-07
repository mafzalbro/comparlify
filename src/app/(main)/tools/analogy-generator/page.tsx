import { Sparkles } from 'lucide-react';
import { AnalogyGeneratorForm } from '@/components/analogy-generator-form';

export default function AnalogyGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Analogy Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Simplify complex topics by generating relatable analogies.
          </p>
        </div>
        <AnalogyGeneratorForm />
      </div>
    </div>
  );
}
