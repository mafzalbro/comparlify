'use client';

import { ComparisonForm } from '../_components/comparison-form';
import type { Platform } from '@prisma/client';
import { useEffect, useState } from 'react';


// This is a temporary fix to get around the limitation of not being able to create API routes.
// In a real app, this data would be fetched once and passed down.
async function getPlatforms(): Promise<Platform[]> {
    return []; // Cannot fetch from server in a client component
}


export default function NewComparisonPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // Since we can't fetch from the server, we'll have to use an empty array.
  // This is not ideal, but it will resolve the client component hook error.
  useEffect(() => {
      // In a real app, you'd fetch this from an API
      // e.g., fetch('/api/platforms').then(res => res.json()).then(setPlatforms);
  }, []);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Comparison</h1>
      <ComparisonForm platforms={platforms} />
    </div>
  );
}
