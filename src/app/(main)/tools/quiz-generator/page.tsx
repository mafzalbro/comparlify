import { HelpCircle } from 'lucide-react';
import { QuizGeneratorForm } from '@/components/quiz-generator-form';

export default function QuizGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Quiz Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create multiple-choice quizzes from your lesson content automatically.
          </p>
        </div>
        <QuizGeneratorForm />
      </div>
    </div>
  );
}
