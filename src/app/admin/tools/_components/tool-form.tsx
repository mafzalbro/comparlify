
'use client';

import { useActionState, useState } from 'react';
import { createTool, updateTool } from '@/app/actions/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Tool, ToolCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/submit-button';
import { AiFillButton } from '../../blog/_components/ai-fill-button';
import { Switch } from '@/components/ui/switch';
import { availableIcons } from '@/app/(main)/tools/tools';

interface ToolFormProps {
  tool?: Tool | null;
}

export function ToolForm({ tool }: ToolFormProps) {
  const router = useRouter();
  const isEditing = !!tool;
  const formAction = isEditing ? updateTool.bind(null, tool.id) : createTool;
  const [state, action] = useActionState(formAction, { error: null });

  const [title, setTitle] = useState(tool?.title ?? '');
  const [slug, setSlug] = useState(tool?.slug ?? '');

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Tool' : 'Create New Tool'}</CardTitle>
          <CardDescription>Configure the details and prompt for the AI tool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tool Title</Label>
            <Input id="title" name="title" defaultValue={tool?.title ?? ''} onChange={(e) => setTitle(e.target.value)} required />
            {typeof state.error !== 'string' && state?.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              <AiFillButton fieldType="URL Slug" topic={title} onContentReceived={setSlug} />
            </div>
            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            {typeof state.error !== 'string' && state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={tool?.description ?? ''} rows={2} required />
            {typeof state.error !== 'string' && state?.error?.description && <p className="text-destructive text-sm">{state.error.description[0]}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={tool?.category}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {Object.values(ToolCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="Icon">Icon</Label>
              <Select name="Icon" defaultValue={tool?.Icon}>
                <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                <SelectContent>
                  {availableIcons.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="inputTopicLabel">Input Topic Label</Label>
              <Input id="inputTopicLabel" name="inputTopicLabel" defaultValue={tool?.inputTopicLabel ?? ''} placeholder="e.g., Course Description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputContextLabel">Input Context Label</Label>
              <Input id="inputContextLabel" name="inputContextLabel" defaultValue={tool?.inputContextLabel ?? ''} placeholder="e.g., Existing Outline (optional)" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Prompt Template</Label>
            <Textarea id="prompt" name="prompt" defaultValue={tool?.prompt ?? ''} rows={8} required placeholder="You are an expert... Use {{{topic}}} and {{{context}}} for inputs." />
             <p className="text-xs text-muted-foreground">Use Handlebars syntax. Use `{{{topic}}}` for the main input and `{{{context}}}` for the optional context field.</p>
            {typeof state.error !== 'string' && state?.error?.prompt && <p className="text-destructive text-sm">{state.error.prompt[0]}</p>}
          </div>
           <div className="flex items-center space-x-2">
              <Switch id="enabled" name="enabled" defaultChecked={tool?.enabled ?? true} />
              <Label htmlFor="enabled">Enabled</Label>
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
