
'use client';

import { useActionState, useRef, useState } from 'react';
import { createComparison, updateComparison } from '@/app/actions/comparisons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Comparison, type Platform, type Fact, type Faq } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/submit-button';
import { Trash2, PlusCircle } from 'lucide-react';
import { AiFillButton } from '../../blog/_components/ai-fill-button';
import { Editor } from '@/components/ui/editor';


type ComparisonWithRelations = Comparison & {
  facts: Fact[];
  faqs: Faq[];
}

interface ComparisonFormProps {
  comparison?: ComparisonWithRelations | null;
  platforms: Platform[];
}

export function ComparisonForm({ comparison, platforms }: ComparisonFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(comparison?.title ?? '');
  const [slug, setSlug] = useState(comparison?.slug ?? '');
  const [summary, setSummary] = useState(comparison?.summary ?? '');
  const [introduction, setIntroduction] = useState(comparison?.introduction ?? '');
  const [conclusion, setConclusion] = useState(comparison?.conclusion ?? '');

  const isEditing = !!comparison;
  const formAction = isEditing ? updateComparison.bind(null, comparison.id) : createComparison;
  const [state, action] = useActionState(formAction, { error: null });

  const [facts, setFacts] = useState<Partial<Fact>[]>(comparison?.facts || [{ title: '', platformAValue: '', platformBValue: '' }]);
  const [faqs, setFaqs] = useState<Partial<Faq>[]>(comparison?.faqs || [{ question: '', answer: '' }]);

  const addFact = () => setFacts([...facts, { title: '', platformAValue: '', platformBValue: '' }]);
  const removeFact = (index: number) => setFacts(facts.filter((_, i) => i !== index));
  
  const handleFactChange = (index: number, field: keyof Fact, value: string) => {
    const newFacts = [...facts];
    newFacts[index] = { ...newFacts[index], [field]: value };
    setFacts(newFacts);
  };
  
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleFaqChange = (index: number, field: keyof Faq, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  return (
    <form action={action}>
      <input type="hidden" name="introduction" value={introduction} />
      <input type="hidden" name="conclusion" value={conclusion} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="title">Title</Label>
                    <AiFillButton
                        fieldType="Comparison Title"
                        topic={summary || title}
                        onContentReceived={setTitle}
                    />
                </div>
                <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} required />
                {typeof state.error !== 'string' && state?.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
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
                <Input id="slug" name="slug" value={slug} onChange={e => setSlug(e.target.value)} required disabled={isEditing} />
                {isEditing && <p className="text-xs text-muted-foreground">The slug cannot be changed for existing comparisons to preserve URL integrity.</p>}
                {typeof state.error !== 'string' && state?.error?.slug && <p className="text-destructive text-sm">{state.error.slug[0]}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="summary">Summary</Label>
                    <AiFillButton
                        fieldType="Comparison Summary"
                        topic={title}
                        onContentReceived={setSummary}
                    />
                </div>
                <Textarea id="summary" name="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={4} required />
                {typeof state.error !== 'string' && state?.error?.summary && <p className="text-destructive text-sm">{state.error.summary[0]}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="introduction">Introduction (Markdown)</Label>
                    <AiFillButton
                        fieldType="Comparison Introduction"
                        topic={title}
                        context={summary}
                        onContentReceived={(content) => {
                            setIntroduction('');
                            setTimeout(() => setIntroduction(content), 0);
                        }}
                    />
                </div>
                <Editor key={`intro-${introduction}`} initialContent={introduction} onChange={setIntroduction} />
                {typeof state.error !== 'string' && state?.error?.introduction && <p className="text-destructive text-sm">{state.error.introduction[0]}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="conclusion">Conclusion (Markdown)</Label>
                    <AiFillButton
                        fieldType="Comparison Conclusion"
                        topic={title}
                        context={summary}
                        onContentReceived={(content) => {
                            setConclusion('');
                            setTimeout(() => setConclusion(content), 0);
                        }}
                    />
                </div>
                <Editor key={`conclusion-${conclusion}`} initialContent={conclusion} onChange={setConclusion} />
                {typeof state.error !== 'string' && state?.error?.conclusion && <p className="text-destructive text-sm">{state.error.conclusion[0]}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facts</CardTitle>
              <CardDescription>"At a Glance" items for the comparison table.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {facts.map((fact, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 border rounded-md">
                   <input type="hidden" name={`facts[${index}][id]`} value={fact.id ?? ''} />
                   <div className="space-y-1">
                        <Label htmlFor={`fact-title-${index}`} className="text-xs">Title</Label>
                        <Input id={`fact-title-${index}`} name={`facts[${index}][title]`} value={fact.title ?? ''} onChange={(e) => handleFactChange(index, 'title', e.target.value)} placeholder="e.g., Best For"/>
                   </div>
                   <div className="space-y-1">
                        <Label htmlFor={`fact-valA-${index}`} className="text-xs">Platform A Value</Label>
                        <Input id={`fact-valA-${index}`} name={`facts[${index}][platformAValue]`} value={fact.platformAValue ?? ''} onChange={(e) => handleFactChange(index, 'platformAValue', e.target.value)} placeholder="e.g., Beginners"/>
                   </div>
                   <div className="space-y-1">
                        <Label htmlFor={`fact-valB-${index}`} className="text-xs">Platform B Value</Label>
                        <Input id={`fact-valB-${index}`} name={`facts[${index}][platformBValue]`} value={fact.platformBValue ?? ''} onChange={(e) => handleFactChange(index, 'platformBValue', e.target.value)} placeholder="e.g., Experts"/>
                   </div>
                   <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeFact(index)}>
                       <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFact}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Fact
              </Button>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Frequently Asked Questions section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md relative">
                  <input type="hidden" name={`faqs[${index}][id]`} value={faq.id ?? ''} />
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive h-7 w-7" onClick={() => removeFaq(index)}>
                       <Trash2 className="h-4 w-4" />
                   </Button>
                  <div className="space-y-1">
                    <Label htmlFor={`faq-q-${index}`}>Question</Label>
                    <Input id={`faq-q-${index}`} name={`faqs[${index}][question]`} value={faq.question ?? ''} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                    <Textarea id={`faq-a-${index}`} name={`faqs[${index}][answer]`} value={faq.answer ?? ''} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} rows={3}/>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformAId">Platform A</Label>
                <Select name="platformAId" defaultValue={comparison?.platformAId}>
                  <SelectTrigger><SelectValue placeholder="Select Platform A" /></SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {typeof state.error !== 'string' && state?.error?.platformAId && <p className="text-destructive text-sm">{state.error.platformAId[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformBId">Platform B</Label>
                <Select name="platformBId" defaultValue={comparison?.platformBId}>
                  <SelectTrigger><SelectValue placeholder="Select Platform B" /></SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {typeof state.error !== 'string' && state?.error?.platformBId && <p className="text-destructive text-sm">{state.error.platformBId[0]}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="published" name="published" defaultChecked={comparison?.published ?? false} />
                <Label htmlFor="published">Published</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
