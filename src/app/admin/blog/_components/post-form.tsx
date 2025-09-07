'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPost, updatePost } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Post } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostFormProps {
  post?: Post | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? 'Saving...' : 'Creating...'}
        </>
      ) : (
        isEditing ? 'Save Changes' : 'Create Post'
      )}
    </Button>
  );
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post;
  const formAction = isEditing ? updatePost.bind(null, post.id) : createPost;
  const [state, action] = useFormState(formAction, { error: null });

  return (
    <form action={action}>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={post?.title} required />
                    {state?.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={post?.slug} required />
                     {state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={post?.description} rows={4} required />
                     {state?.error?.description && <p className="text-destructive text-sm">{state.error.description[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">Content (Markdown supported)</Label>
                    <Textarea id="content" name="content" defaultValue={post?.content} rows={15} required />
                     {state?.error?.content && <p className="text-destructive text-sm">{state.error.content[0]}</p>}
                </div>
            </div>
            <div className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" name="image" defaultValue={post?.image} required />
                     {state?.error?.image && <p className="text-destructive text-sm">{state.error.image[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dataAiHint">AI Hint for Image Search</Label>
                    <Input id="dataAiHint" name="dataAiHint" defaultValue={post?.dataAiHint} placeholder="e.g. 'creative workspace'" />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="published" name="published" defaultChecked={post?.published ?? false} />
                    <Label htmlFor="published">Published</Label>
                </div>
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