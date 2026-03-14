import { FileText } from 'lucide-react';
import { CourseOutlinerForm } from '@/components/course-outliner-form';

export default function CourseOutlinerPage() {
  return (
    <div>
      <div className="flex items-start gap-4 mb-12">
        <div className="p-3 bg-primary/20 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Course Outliner</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Generate a structured, comprehensive outline for your next course in minutes.
          </p>
        </div>
      </div>
      <CourseOutlinerForm />
    </div>
  );
}
