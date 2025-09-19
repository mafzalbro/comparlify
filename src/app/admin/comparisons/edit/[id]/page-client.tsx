
'use client';

import { type Comparison, type Platform, type Fact, type Faq, type ComparisonCategory } from '@prisma/client';
import { ComparisonForm } from '../../_components/comparison-form';

type ComparisonWithRelations = Comparison & {
  facts: Fact[];
  faqs: Faq[];
}

interface EditComparisonPageClientProps {
  comparison: ComparisonWithRelations;
  platforms: Platform[];
  categories: ComparisonCategory[];
}

export function EditComparisonPageClient({ comparison, platforms, categories }: EditComparisonPageClientProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Comparison</h1>
      <ComparisonForm comparison={comparison} platforms={platforms} categories={categories} />
    </div>
  );
}
