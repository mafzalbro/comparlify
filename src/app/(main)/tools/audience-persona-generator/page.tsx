import { Users } from 'lucide-react';
import { AudiencePersonaGeneratorForm } from '@/components/audience-persona-generator-form';

export default function AudiencePersonaGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Users className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Audience Persona Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Understand your ideal student by creating a detailed audience persona.
          </p>
        </div>
        <AudiencePersonaGeneratorForm />
      </div>
    </div>
  );
}
