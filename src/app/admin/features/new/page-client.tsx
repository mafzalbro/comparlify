
'use client';

import { FeatureForm } from '../_components/feature-form';
import type { FeatureCategory } from '@prisma/client';

export function NewFeaturePageClient({ categories }: { categories: FeatureCategory[] }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Feature</h1>
      <FeatureForm categories={categories} />
    </div>
  );
}
