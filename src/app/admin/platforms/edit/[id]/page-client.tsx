
'use client';

import { PlatformForm } from '../../_components/platform-form';
import type { Platform, Feature, PlatformFeature, FeatureCategory, Image } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

interface EditPlatformPageClientProps {
    platform: PlatformWithFeatures;
    features: (Feature & { category: FeatureCategory })[];
    featureCategories: FeatureCategory[];
    images: Image[];
}

export function EditPlatformPageClient({ platform, features, featureCategories, images }: EditPlatformPageClientProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit Platform</h1>
                <Button asChild variant="ghost">
                    <Link href="/admin/platforms"><ArrowLeft className="mr-2 h-4 w-4" />Back to Platforms</Link>
                </Button>
            </div>
            <PlatformForm platform={platform} features={features} featureCategories={featureCategories} images={images} />
        </div>
    );
}
