import { GraduationCap } from 'lucide-react';
import { LearningObjectivesGeneratorForm } from '@/components/learning-objectives-generator-form';

export default function LearningObjectivesGeneratorPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <GraduationCap className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Learning Objectives Generator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Define clear, measurable learning goals for your students.
          </p>
        </div>
        <LearningObjectivesGeneratorForm />
      </div>
    </div>
  );
}
