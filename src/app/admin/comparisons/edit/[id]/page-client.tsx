
'use client';

import { type Comparison, type Platform, type Fact, type Faq, type ComparisonCategory } from '@prisma/client';
import { ComparisonForm } from '../../_components/comparison-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Comparison</h1>
        <Button asChild variant="ghost">
            <Link href="/admin/comparisons"><ArrowLeft className="mr-2 h-4 w-4" />Back to Comparisons</Link>
        </Button>
      </div>
      <ComparisonForm comparison={comparison} platforms={platforms} categories={categories} />
    </div>
  );
}
