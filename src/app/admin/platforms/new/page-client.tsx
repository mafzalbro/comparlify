'use client';

import { PlatformForm } from '../_components/platform-form';
import type { Feature, FeatureCategory } from '@prisma/client';

interface NewPlatformPageClientProps {
    features: (Feature & { category: FeatureCategory })[];
    featureCategories: FeatureCategory[];
}

export function NewPlatformPageClient({ features, featureCategories }: NewPlatformPageClientProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Platform</h1>
      <PlatformForm features={features} featureCategories={featureCategories} />
    </div>
  );
}
