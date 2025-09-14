import { MessageSquarePlus } from 'lucide-react';
// import { IceBreakerForm } from '@/components/ice-breaker-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


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
