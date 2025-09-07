import { ListChecks } from 'lucide-react';
import { FaqGeneratorForm } from '@/components/faq-generator-form';

export default function FaqGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <ListChecks className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI FAQ Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Automatically generate a list of frequently asked questions from your content.
          </p>
        </div>
        <FaqGeneratorForm />
      </div>
    </div>
  );
}
