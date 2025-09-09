
'use client';

import { useActionState, useState } from 'react';
import { createFeature, updateFeature } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Feature, type FeatureCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/submit-button';

interface FeatureFormProps {
  feature?: Feature | null;
  categories: FeatureCategory[];
}

export function FeatureForm({ feature, categories }: FeatureFormProps) {
  const router = useRouter();
  const isEditing = !!feature;
  const formAction = isEditing ? updateFeature.bind(null, feature.id) : createFeature;
  const [state, action] = useActionState(formAction, { error: null });
  const [name, setName] = useState(feature?.name ?? '');

  return (
    <form action={action}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Feature Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Feature Name</Label>
            <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required />
            {state?.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={feature?.categoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {state?.error?.categoryId && <p className="text-destructive text-sm">{state.error.categoryId[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
