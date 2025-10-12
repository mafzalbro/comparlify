
'use client';

import { useActionState, useState } from 'react';
import { createLegalDocument, updateLegalDocument } from '@/app/actions/legal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type LegalDocument } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from '../../blog/_components/ai-fill-button';
import { Editor } from '@/components/ui/editor';

interface LegalDocumentFormProps {
    document?: LegalDocument | null;
}

export function LegalDocumentForm({ document }: LegalDocumentFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(document?.title ?? '');
    const [slug, setSlug] = useState(document?.slug ?? '');
    const [content, setContent] = useState(document?.content ?? '');

    const isEditing = !!document;
    const formAction = isEditing ? updateLegalDocument.bind(null, document.id) : createLegalDocument;
    const [state, action] = useActionState(formAction, { error: null });

    return (
        <form action={action}>
            <input type="hidden" name="content" value={content} />
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Document Title</Label>
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
                                />
                            </div>
                            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                            {typeof state.error !== 'string' && state.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Editor key={content} initialContent={content} onChange={setContent} />
                            {typeof state.error !== 'string' && state.error?.content && <p className="text-destructive text-sm">{state.error.content[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Switch id="published" name="published" defaultChecked={document?.published ?? false} />
                            <Label htmlFor="published">Published</Label>
                        </div>
                         <p className="text-xs text-muted-foreground">
                                Published documents will be available at `/legal/[slug]`.
                            </p>
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
