import { MessageSquareQuote } from 'lucide-react';
import { CourseDescriptionWriterForm } from '@/components/course-description-writer-form';

export default function CourseDescriptionWriterPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <MessageSquareQuote className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Course Description Writer</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate compelling sales descriptions for your course page.
          </p>
        </div>
        <CourseDescriptionWriterForm />
      </div>
    </div>
  );
}
