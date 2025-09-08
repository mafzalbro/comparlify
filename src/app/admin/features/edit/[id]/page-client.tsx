
'use client';

import { type Feature, type FeatureCategory } from '@prisma/client';
import { FeatureForm } from '../../_components/feature-form';

interface EditFeaturePageClientProps {
  feature: Feature;
  categories: FeatureCategory[];
}

export function EditFeaturePageClient({ feature, categories }: EditFeaturePageClientProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Feature</h1>
      <FeatureForm feature={feature} categories={categories} />
    </div>
  );
}
