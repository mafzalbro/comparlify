
import { ClipboardList } from 'lucide-react';
import { CoursePrerequisitesForm } from '@/components/course-prerequisites-form';

export default function CoursePrerequisitesGeneratorPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">AI Prerequisite Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Outline the required skills and tools students need before starting your course.
          </p>
        </div>
      </div>
      <CoursePrerequisitesForm />
    </div>
  );
}
