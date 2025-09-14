import { BookOpen } from 'lucide-react';
import { LessonSummarizerForm } from '@/components/lesson-summarizer-form';

export default function LessonSummarizerPage() {
  return (
    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[calc(100vh-20rem)] items-start">
        <div className="lg:sticky top-24">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Lesson Summarizer</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Generate concise summaries and key takeaways for any lesson content.
                </p>
              </div>
          </div>
        </div>
        <LessonSummarizerForm />
    </div>
  );
}
