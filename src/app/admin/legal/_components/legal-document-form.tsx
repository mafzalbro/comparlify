
'use client';

import { useActionState, useState } from 'react';
import { createLegalDocumentAction, updateLegalDocumentAction } from '@/app/actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SiteContent } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from '../../blog/_components/ai-fill-button';
import { Editor } from '@/components/ui/editor';

interface LegalDocumentFormProps {
    document?: SiteContent | null;
}

export function LegalDocumentForm({ document }: LegalDocumentFormProps) {
    const router = useRouter();
    const isEditing = !!document;
    
    const initialSlug = isEditing ? document.key.replace('legal.', '') : '';
    
    const [content, setContent] = useState(document?.value ?? '');
    const [slug, setSlug] = useState(initialSlug);

    const formAction = isEditing ? updateLegalDocumentAction.bind(null, document.id) : createLegalDocumentAction;
    const [state, action] = useActionState(formAction, { error: null });
    
    const [title, setTitle] = useState(
      initialSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    return (
        <form action={action}>
            <input type="hidden" name="value" value={content} />
            <Card>
                <CardContent className="p-6 grid grid-cols-1 gap-8">
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="title">Document Title</Label>
                            <Input 
                                id="title" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Terms of Service"
                                required 
                            />
                            {typeof state.error !== 'string' && state.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="key">URL Slug (Key)</Label>
                                <AiFillButton
                                    fieldType="URL Slug"
                                    topic={title}
                                    onContentReceived={setSlug}
                                    disabled={isEditing}
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">/legal/</span>
                                <Input id="key" name="key" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isEditing} className="rounded-l-none" />
                            </div>
                            {isEditing && <input type="hidden" name="key" value={slug} />}
                            {isEditing && <p className="text-xs text-muted-foreground">The slug cannot be changed for existing documents to preserve URL integrity.</p>}
                            {typeof state.error !== 'string' && state.error?.key && <p className="text-destructive text-sm">{state.error.key[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content (Markdown)</Label>
                            <Editor key={content} initialContent={content} onChange={setContent} />
                            {typeof state.error !== 'string' && state.error?.value && <p className="text-destructive text-sm">{state.error.value[0]}</p>}
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
