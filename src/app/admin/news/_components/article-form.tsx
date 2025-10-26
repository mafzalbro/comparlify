
'use client';

import { useActionState, useState } from 'react';
import { createNewsArticle, updateNewsArticle } from '@/app/actions/news';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type NewsArticle, type Image as PrismaImage } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from '../../blog/_components/ai-fill-button';
import { AiImageButton } from '../../blog/_components/ai-image-button';
import { Editor } from '@/components/ui/editor';
import { ImagePickerInput } from '../../_components/image-picker-input';

interface ArticleFormProps {
    article?: NewsArticle | null;
    images: PrismaImage[];
}

export function ArticleForm({ article, images }: ArticleFormProps) {
    const router = useRouter();
    const [content, setContent] = useState(article?.content ?? '');
    const [image, setImage] = useState(article?.image ?? '');
    const [dataAiHint, setDataAiHint] = useState(article?.dataAiHint ?? '');
    const [title, setTitle] = useState(article?.title ?? '');
    const [slug, setSlug] = useState(article?.slug ?? '');

    const isEditing = !!article;
    const formAction = isEditing ? updateNewsArticle.bind(null, article.id) : createNewsArticle;
    const [state, action] = useActionState(formAction, { error: null });

    return (
        <form action={action}>
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="image" value={image} />
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="title">Title</Label>
                                <AiFillButton
                                    fieldType="News Article Title"
                                    topic={content || title}
                                    onContentReceived={setTitle}
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
                                    onContentReceived={setSlug}
                                    disabled={isEditing}
                                />
                            </div>
                            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isEditing} />
                            {isEditing && <Input id="slug" name="slug" value={slug} required type="hidden" />}
                             {isEditing && <p className="text-xs text-muted-foreground">The slug cannot be changed for existing articles to preserve URL integrity.</p>}
                            {typeof state.error !== 'string' && state.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content">Content</Label>
                                <AiFillButton
                                    fieldType="News Article Content"
                                    topic={title}
                                    onContentReceived={(content) => {
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
                        <ImagePickerInput 
                            label="Image URL"
                            value={image}
                            onValueChange={setImage}
                            images={images}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="dataAiHint">AI Prompt for Image</Label>
                            <Input id="dataAiHint" name="dataAiHint" value={dataAiHint} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g., 'technology announcement'" />
                            <AiImageButton
                                prompt={dataAiHint || title}
                                onImageReceived={setImage}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="published" name="published" defaultChecked={article?.published ?? false} />
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
