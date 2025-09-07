import { FileText } from 'lucide-react';
import { CourseOutlinerForm } from '@/components/course-outliner-form';

export default function CourseOutlinerPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Course Outliner</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate a structured, comprehensive outline for your next course in minutes.
          </p>
        </div>
        <CourseOutlinerForm />
      </div>
    </div>
  );
}
