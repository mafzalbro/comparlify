
'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { createPost, updatePost } from '@/app/actions/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Post, type PostCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from './ai-fill-button';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { AiImageButton } from './ai-image-button';
import { Editor } from '@/components/ui/editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PostFormProps {
    post?: Post | null;
    categories: PostCategory[];
}

export function PostForm({ post, categories }: PostFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [title, setTitle] = useState(post?.title ?? '');
    const [slug, setSlug] = useState(post?.slug ?? '');
    const [description, setDescription] = useState(post?.description ?? '');
    const [content, setContent] = useState(post?.content ?? '');
    const [image, setImage] = useState(post?.image ?? '');
    const [dataAiHint, setDataAiHint] = useState(post?.dataAiHint ?? '');

    const isEditing = !!post;
    const formAction = isEditing ? updatePost.bind(null, post.id) : createPost;
    const [state, action] = useActionState(formAction, { error: null });

    const MAX_DESC_LENGTH = 191;

    return (
        <form action={action} ref={formRef}>
            <input type="hidden" name="content" value={content} />
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
                                    }}
                                />
                            </div>
                            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            {typeof state.error !== 'string' && state.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="slug">Slug</Label>
                                <AiFillButton
                                    fieldType="URL Slug"
                                    topic={title}
                                    onContentReceived={(content) => {
                                        setSlug(content);
                                    }}
                                    disabled={isEditing}
                                />
                            </div>
                            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isEditing} />
                            {isEditing && <p className="text-xs text-muted-foreground">The slug cannot be changed for existing posts to preserve URL integrity.</p>}
                            {typeof state.error !== 'string' && state.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
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
                                    }}
                                />
                            </div>
                            <Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required maxLength={MAX_DESC_LENGTH} />
                            <p className="text-xs text-muted-foreground text-right">{description.length} / {MAX_DESC_LENGTH}</p>
                            {typeof state.error !== 'string' && state.error?.description && <p className="text-destructive text-sm">{state.error.description[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content">Content</Label>
                                <AiFillButton
                                    fieldType="Blog Post Content"
                                    topic={title}
                                    context={description}
                                    onContentReceived={(content) => {
                                        // We need a key change to force re-render of editor
                                        setContent('');
                                        setTimeout(() => setContent(content), 0);
                                    }}
                                />
                            </div>
                            <Editor key={content} initialContent={content} onChange={setContent} />
                            {typeof state.error !== 'string' && state.error?.content && <p className="text-destructive text-sm">{state.error.content[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select name="categoryId" defaultValue={post?.categoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {typeof state.error !== 'string' && state?.error?.categoryId && <p className="text-destructive text-sm">{state.error.categoryId[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input id="image" name="image" value={image} onChange={e => setImage(e.target.value)} required />
                            {typeof state.error !== 'string' && state.error?.image && <p className="text-destructive text-sm">{state.error.image[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataAiHint">AI Prompt for Image</Label>
                            <Input id="dataAiHint" name="dataAiHint" value={dataAiHint} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. 'creative workspace'" />
                            <AiImageButton
                                prompt={dataAiHint || title}
                                onImageReceived={(imageUrl) => {
                                    setImage(imageUrl);
                                }}
                            />
                        </div>
                        {image && (
                            <div className="space-y-2">
                                <Label>Image Preview</Label>
                                <div className="aspect-video relative rounded-md overflow-hidden border">
                                    <img src={image} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <Switch id="published" name="published" defaultChecked={post?.published ?? false} />
                            <Label htmlFor="published">Published</Label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    {isEditing && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/blog/${post.slug}?preview=true`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> Preview
                            </Link>
                        </Button>
                    )}
                    <div className="flex justify-end gap-4 w-full">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <SubmitButton isEditing={isEditing} />
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}
