import { BookOpen } from 'lucide-react';
import { LessonSummarizerForm } from '@/components/lesson-summarizer-form';

export default function LessonSummarizerPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Lesson Summarizer</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate concise summaries and key takeaways for any lesson content.
          </p>
        </div>
        <LessonSummarizerForm />
      </div>
    </div>
  );
}
