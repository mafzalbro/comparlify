
'use client';

import { FeatureForm } from '../_components/feature-form';
import type { FeatureCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export function NewFeaturePageClient({ categories }: { categories: FeatureCategory[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Feature</h1>
        <Button asChild variant="ghost">
            <Link href="/admin/features"><ArrowLeft className="mr-2 h-4 w-4" />Back to Features</Link>
        </Button>
      </div>
      <FeatureForm categories={categories} />
    </div>
  );
}
