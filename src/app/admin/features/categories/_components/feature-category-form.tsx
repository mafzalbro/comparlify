
'use client';

import { useActionState, useState } from 'react';
import { createFeatureCategory, updateFeatureCategory } from '@/app/actions/features';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type FeatureCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import Link from "next/link";

interface FeatureCategoryFormProps {
  category?: FeatureCategory | null;
}

export function FeatureCategoryForm({ category }: FeatureCategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;
  const formAction = isEditing ? updateFeatureCategory.bind(null, category.id) : createFeatureCategory;
  const [state, action] = useActionState(formAction, { error: null });
  const [name, setName] = useState(category?.name ?? '');

  return (
    <form action={action}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit' : 'Create'} Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required />
            {typeof state.error !== 'string' && state?.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button asChild type="button" variant="outline">
            <Link href="/admin/features/categories">Cancel</Link>
          </Button>
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
