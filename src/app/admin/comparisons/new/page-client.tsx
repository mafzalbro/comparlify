
'use client';

import { type Platform, type ComparisonCategory } from '@prisma/client';
import { ComparisonForm } from '../_components/comparison-form';

export function NewComparisonPageClient({ platforms, categories }: { platforms: Platform[], categories: ComparisonCategory[] }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Comparison</h1>
      <ComparisonForm platforms={platforms} categories={categories} />
    </div>
  );
}
