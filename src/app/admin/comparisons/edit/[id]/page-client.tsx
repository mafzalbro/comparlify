'use client';

import { type Comparison, type Platform } from '@prisma/client';
import { ComparisonForm } from '../../_components/comparison-form';

interface EditComparisonPageClientProps {
  comparison: Comparison;
  platforms: Platform[];
}

export function EditComparisonPageClient({ comparison, platforms }: EditComparisonPageClientProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Comparison</h1>
      <ComparisonForm comparison={comparison} platforms={platforms} />
    </div>
  );
}
