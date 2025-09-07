'use client';

import { PlatformForm } from '../_components/platform-form';
import type { Feature, FeatureCategory } from '@prisma/client';
import { useState, useEffect } from 'react';

export default function NewPlatformPage() {
    const [features, setFeatures] = useState<(Feature & { category: FeatureCategory })[]>([]);
    const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([]);

    useEffect(() => {
        // In a real application, you would fetch this data from an API.
        // e.g. fetch('/api/features').then(res => res.json()).then(setFeatures);
        // e.g. fetch('/api/feature-categories').then(res => res.json()).then(setFeatureCategories);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Create New Platform</h1>
            <PlatformForm features={features} featureCategories={featureCategories} />
        </div>
    );
}
