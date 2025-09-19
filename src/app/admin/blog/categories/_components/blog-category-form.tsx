
'use client';

import { useActionState, useState } from 'react';
import { createBlogCategory, updateBlogCategory } from '@/app/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type PostCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from '../../../blog/_components/ai-fill-button';

interface BlogCategoryFormProps {
  category?: PostCategory | null;
}

export function BlogCategoryForm({ category }: BlogCategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;
  const formAction = isEditing ? updateBlogCategory.bind(null, category.id) : createBlogCategory;
  const [state, action] = useActionState(formAction, { error: null });

  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');


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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <AiFillButton
                    fieldType="URL Slug"
                    topic={name}
                    onContentReceived={setSlug}
                />
            </div>
            <Input id="slug" name="slug" value={slug} onChange={e => setSlug(e.target.value)} required />
            {typeof state.error !== 'string' && state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
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
