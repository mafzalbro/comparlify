'use client';

import { ComparisonForm } from '../../_components/comparison-form';
import type { Comparison, Platform } from '@prisma/client';
import { useEffect, useState } from 'react';

// This is not the ideal pattern, but it's a way to solve the hook error
// without being able to create new API routes.
// The page needs to be a client component because it renders a form that uses client hooks.

export default function EditComparisonPage({ params }: { params: { id: string } }) {
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [platforms, setPlatforms] = useState<Platform[]>([]);

    useEffect(() => {
        // In a real app, this data would be fetched from API routes.
        // For example:
        // fetch(`/api/comparisons/${params.id}`).then(res => res.json()).then(setComparison);
        // fetch(`/api/platforms`).then(res => res.json()).then(setPlatforms);
    }, [params.id]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Comparison</h1>
            <ComparisonForm comparison={comparison} platforms={platforms} />
        </div>
    );
}
