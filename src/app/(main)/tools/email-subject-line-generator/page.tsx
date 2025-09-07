import { Mail } from 'lucide-react';
import { EmailSubjectLineGeneratorForm } from '@/components/email-subject-line-generator-form';

export default function EmailSubjectLineGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Email Subject Line Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create high-converting email subject lines for your marketing campaigns.
          </p>
        </div>
        <EmailSubjectLineGeneratorForm />
      </div>
    </div>
  );
}
