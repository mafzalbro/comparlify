
import { MessageSquarePlus } from 'lucide-react';
import { IceBreakerForm } from '@/components/ice-breaker-form';


export default function IceBreakerGeneratorPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg">
          <MessageSquarePlus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Ice Breaker Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create engaging ice breaker questions for your community or live sessions.
          </p>
        </div>
      </div>
      <IceBreakerForm />
    </div>
  );
}
