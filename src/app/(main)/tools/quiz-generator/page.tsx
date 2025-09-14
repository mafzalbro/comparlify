import { HelpCircle } from 'lucide-react';
import { QuizGeneratorForm } from '@/components/quiz-generator-form';

export default function QuizGeneratorPage() {
  return (
    <div>
      <div className="flex items-start gap-4 mb-12">
        <div className="p-3 bg-primary/20 rounded-lg">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Quiz Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create multiple-choice quizzes from your lesson content automatically.
          </p>
        </div>
      </div>
      <QuizGeneratorForm />
    </div>
  );
}
