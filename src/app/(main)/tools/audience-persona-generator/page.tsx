import { Users } from 'lucide-react';
import { AudiencePersonaGeneratorForm } from '@/components/audience-persona-generator-form';

export default function AudiencePersonaGeneratorPage() {
  return (
    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[calc(100vh-20rem)] items-start">
        <div className="lg:sticky top-24">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Audience Persona Generator</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Understand your ideal student by creating a detailed audience persona.
                </p>
              </div>
          </div>
        </div>
        <AudiencePersonaGeneratorForm />
    </div>
  );
}
