
'use client';

import { PlatformForm } from '../_components/platform-form';
import type { Feature, FeatureCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

interface NewPlatformPageClientProps {
    features: (Feature & { category: FeatureCategory })[];
    featureCategories: FeatureCategory[];
}

export function NewPlatformPageClient({ features, featureCategories }: NewPlatformPageClientProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Platform</h1>
         <Button asChild variant="ghost">
            <Link href="/admin/platforms"><ArrowLeft className="mr-2 h-4 w-4" />Back to Platforms</Link>
        </Button>
      </div>
      <PlatformForm features={features} featureCategories={featureCategories} />
    </div>
  );
}
