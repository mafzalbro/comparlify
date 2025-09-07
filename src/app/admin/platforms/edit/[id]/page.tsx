'use client';

import { PlatformForm } from '../../_components/platform-form';
import type { Platform, Feature, PlatformFeature, FeatureCategory } from '@prisma/client';
import { useState, useEffect } from 'react';

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

export default function EditPlatformPage({ params }: { params: { id: string } }) {
    const [platform, setPlatform] = useState<PlatformWithFeatures | null>(null);
    const [features, setFeatures] = useState<(Feature & { category: FeatureCategory })[]>([]);
    const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([]);

    useEffect(() => {
        // In a real app, this data would be fetched from API routes.
        // For example:
        // fetch(`/api/platforms/${params.id}`).then(res => res.json()).then(setPlatform);
        // fetch(`/api/features`).then(res => res.json()).then(setFeatures);
        // fetch(`/api/feature-categories`).then(res => res.json()).then(setFeatureCategories);
    }, [params.id]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Platform</h1>
            {platform ? (
                 <PlatformForm
                    platform={platform}
                    features={features}
                    featureCategories={featureCategories}
                />
            ) : (
                // You can add a proper loading skeleton here
                <p>Loading...</p>
            )}
        </div>
    );
}
