'use client';

import { useFormStatus } from 'react-dom';
import { createComparison, updateComparison } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Comparison, type Platform } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActionState } from 'react';


interface ComparisonFormProps {
  comparison?: Comparison | null;
  platforms: Platform[];
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
        isEditing ? 'Save Changes' : 'Create Comparison'
      )}
    </Button>
  );
}

export function ComparisonForm({ comparison, platforms }: ComparisonFormProps) {
  const router = useRouter();
  const isEditing = !!comparison;
  const formAction = isEditing ? updateComparison.bind(null, comparison.id) : createComparison;
  const [state, action] = useActionState(formAction, { error: null });

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          {/* Form Content */}
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={comparison?.title} required />
              {state?.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={comparison?.slug} required />
              {state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" defaultValue={comparison?.summary} rows={4} required />
              {state?.error?.summary && <p className="text-destructive text-sm">{state.error.summary[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction (Markdown)</Label>
              <Textarea id="introduction" name="introduction" defaultValue={comparison?.introduction} rows={10} required />
              {state?.error?.introduction && <p className="text-destructive text-sm">{state.error.introduction[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusion">Conclusion (Markdown)</Label>
              <Textarea id="conclusion" name="conclusion" defaultValue={comparison?.conclusion} rows={10} required />
              {state?.error?.conclusion && <p className="text-destructive text-sm">{state.error.conclusion[0]}</p>}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformAId">Platform A</Label>
              <Select name="platformAId" defaultValue={comparison?.platformAId}>
                <SelectTrigger><SelectValue placeholder="Select Platform A" /></SelectTrigger>
                <SelectContent>
                  {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {state?.error?.platformAId && <p className="text-destructive text-sm">{state.error.platformAId[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformBId">Platform B</Label>
              <Select name="platformBId" defaultValue={comparison?.platformBId}>
                <SelectTrigger><SelectValue placeholder="Select Platform B" /></SelectTrigger>
                <SelectContent>
                  {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {state?.error?.platformBId && <p className="text-destructive text-sm">{state.error.platformBId[0]}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Switch id="published" name="published" defaultChecked={comparison?.published ?? false} />
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
