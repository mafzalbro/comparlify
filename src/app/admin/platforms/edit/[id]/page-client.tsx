'use client';

import { PlatformForm } from '../../_components/platform-form';
import type { Platform, Feature, PlatformFeature, FeatureCategory } from '@prisma/client';

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

interface EditPlatformPageClientProps {
    platform: PlatformWithFeatures;
    features: (Feature & { category: FeatureCategory })[];
    featureCategories: FeatureCategory[];
}

export function EditPlatformPageClient({ platform, features, featureCategories }: EditPlatformPageClientProps) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Platform</h1>
            <PlatformForm platform={platform} features={features} featureCategories={featureCategories} />
        </div>
    );
}
