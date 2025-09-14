import { MessageSquareQuote } from 'lucide-react';
import { CourseDescriptionWriterForm } from '@/components/course-description-writer-form';

export default function CourseDescriptionWriterPage() {
  return (
    <div>
      <div className="flex items-start gap-4 mb-12">
        <div className="p-3 bg-primary/20 rounded-lg">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Course Description Writer</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Generate compelling sales descriptions for your course page.
          </p>
        </div>
      </div>
      <CourseDescriptionWriterForm />
    </div>
  );
}
