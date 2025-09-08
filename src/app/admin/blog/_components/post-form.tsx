'use client';

import { useActionState, useRef, useState } from 'react';
import { createPost, updatePost } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Post } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from './ai-fill-button';

interface PostFormProps {
  post?: Post | null;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(post?.title ?? '');
  const [description, setDescription] = useState(post?.description ?? '');
  const isEditing = !!post;
  const formAction = isEditing ? updatePost.bind(null, post.id) : createPost;
  const [state, action] = useActionState(formAction, { error: null });

  return (
    <form action={action} ref={formRef}>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="title">Title</Label>
                        <AiFillButton
                            fieldType="Blog Post Title"
                            topic={description || title}
                            onContentReceived={(content) => {
                                setTitle(content);
                                formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus();
                            }}
                        />
                    </div>
                    <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    {state?.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="slug">Slug</Label>
                         <AiFillButton
                            fieldType="URL Slug"
                            topic={title}
                            onContentReceived={(content) => {
                                formRef.current!.querySelector<HTMLInputElement>('input[name="slug"]')!.value = content;
                                formRef.current?.querySelector<HTMLInputElement>('input[name="slug"]')?.focus();
                            }}
                        />
                    </div>
                    <Input id="slug" name="slug" defaultValue={post?.slug} required />
                     {state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="description">Description</Label>
                        <AiFillButton
                            fieldType="Blog Post Description"
                            topic={title}
                            context={description}
                             onContentReceived={(content) => {
                                setDescription(content);
                                formRef.current?.querySelector<HTMLTextAreaElement>('textarea[name="description"]')?.focus();
                            }}
                        />
                    </div>
                    <Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
                     {state?.error?.description && <p className="text-destructive text-sm">{state.error.description[0]}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="content">Content (Markdown supported)</Label>
                        <AiFillButton
                            fieldType="Blog Post Content"
                            topic={title}
                            context={description}
                            onContentReceived={(content) => {
                                formRef.current!.querySelector<HTMLTextAreaElement>('textarea[name="content"]')!.value = content;
                                formRef.current?.querySelector<HTMLTextAreaElement>('textarea[name="content"]')?.focus();
                            }}
                        />
                    </div>
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
                    <Input id="dataAiHint" name="dataAiHint" defaultValue={post?.dataAiHint ?? ''} placeholder="e.g. 'creative workspace'" />
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
