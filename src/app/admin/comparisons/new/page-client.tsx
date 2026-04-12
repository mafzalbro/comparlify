
'use client';

import { type Platform, type ComparisonCategory } from '@prisma/client';
import { ComparisonForm } from '../_components/comparison-form';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export function NewComparisonPageClient({ platforms, categories }: { platforms: Platform[], categories: ComparisonCategory[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comparison</h1>
         <Button asChild variant="ghost">
            <Link href="/admin/comparisons"><ArrowLeft className="mr-2 h-4 w-4" />Back to Comparisons</Link>
          </Button>
      </div>
      <ComparisonForm platforms={platforms} categories={categories} />
    </div>
  );
}
