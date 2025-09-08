'use client';

import { type Comparison, type Platform, type Fact, type FAQ } from '@prisma/client';
import { ComparisonForm } from '../../_components/comparison-form';

type ComparisonWithRelations = Comparison & {
  facts: Fact[];
  faqs: FAQ[];
}

interface EditComparisonPageClientProps {
  comparison: ComparisonWithRelations;
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
