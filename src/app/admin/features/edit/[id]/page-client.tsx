
'use client';

import { type Feature, type FeatureCategory } from '@prisma/client';
import { FeatureForm } from '../../_components/feature-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditFeaturePageClientProps {
  feature: Feature;
  categories: FeatureCategory[];
}

export function EditFeaturePageClient({ feature, categories }: EditFeaturePageClientProps) {
  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Feature</h1>
        <Button asChild variant="ghost">
            <Link href="/admin/features"><ArrowLeft className="mr-2 h-4 w-4" />Back to Features</Link>
        </Button>
      </div>
      <FeatureForm feature={feature} categories={categories} />
    </div>
  );
}
