"use client";

import { useActionState, useRef, useState } from "react";
import { createComparison, updateComparison } from "@/app/actions/comparisons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Comparison,
  type Platform,
  type Fact,
  type Faq,
  type ComparisonCategory,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { Trash2, PlusCircle, Zap, Scale } from "lucide-react";
import { AiFillButton } from "../../blog/_components/ai-fill-button";
import dynamic from "next/dynamic";
const Editor = dynamic(
  () => import("@/components/ui/editor").then((mod) => mod.Editor),
  { ssr: false },
);

type ComparisonWithRelations = Comparison & {
  facts: Fact[];
  faqs: Faq[];
};

interface ComparisonFormProps {
  comparison?: ComparisonWithRelations | null;
  platforms: Platform[];
  categories: ComparisonCategory[];
}

export function ComparisonForm({
  comparison,
  platforms,
  categories,
}: ComparisonFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(comparison?.title ?? "");
  const [slug, setSlug] = useState(comparison?.slug ?? "");
  const [summary, setSummary] = useState(comparison?.summary ?? "");
  const [introduction, setIntroduction] = useState(
    comparison?.introduction ?? "",
  );
  const [conclusion, setConclusion] = useState(comparison?.conclusion ?? "");
  const [platformAId, setPlatformAId] = useState(comparison?.platformAId ?? "");
  const [platformBId, setPlatformBId] = useState(comparison?.platformBId ?? "");

  const isEditing = !!comparison;
  const formAction = isEditing
    ? updateComparison.bind(null, comparison.id)
    : createComparison;
  const [state, action] = useActionState(formAction, { error: null });

  const [facts, setFacts] = useState<Partial<Fact>[]>(
    comparison?.facts || [
      { title: "", platformAValue: "", platformBValue: "" },
    ],
  );
  const [faqs, setFaqs] = useState<Partial<Faq>[]>(
    comparison?.faqs || [{ question: "", answer: "" }],
  );

  const addFact = () =>
    setFacts([...facts, { title: "", platformAValue: "", platformBValue: "" }]);
  const removeFact = (index: number) =>
    setFacts(facts.filter((_, i) => i !== index));

  const handleFactChange = (
    index: number,
    field: keyof Fact,
    value: string,
  ) => {
    const newFacts = [...facts];
    newFacts[index] = { ...newFacts[index], [field]: value };
    setFacts(newFacts);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index: number) =>
    setFaqs(faqs.filter((_, i) => i !== index));

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
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {typeof state.error !== "string" && state?.error?.title && (
                  <p className="text-destructive text-sm">
                    {state.error.title[0]}
                  </p>
                )}
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
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={isEditing}
                />
                {isEditing && (
                  <Input
                    type="hidden"
                    id="slug"
                    name="slug"
                    value={slug}
                    required
                  />
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    The slug cannot be changed for existing comparisons to
                    preserve URL integrity.
                  </p>
                )}
                {typeof state.error !== "string" && state?.error?.slug && (
                  <p className="text-destructive text-sm">
                    {state.error.slug[0]}
                  </p>
                )}
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
                <Textarea
                  id="summary"
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  required
                />
                {typeof state.error !== "string" && state?.error?.summary && (
                  <p className="text-destructive text-sm">
                    {state.error.summary[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="introduction">Introduction (Markdown)</Label>
                  <AiFillButton
                    fieldType="Comparison Introduction"
                    topic={title}
                    context={summary}
                    onContentReceived={(content) => {
                      setIntroduction(content);
                    }}
                  />
                </div>
                <Editor
                  initialContent={introduction}
                  onChange={setIntroduction}
                />
                {typeof state.error !== "string" &&
                  state?.error?.introduction && (
                    <p className="text-destructive text-sm">
                      {state.error.introduction[0]}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="conclusion">Conclusion (Markdown)</Label>
                  <AiFillButton
                    fieldType="Comparison Conclusion"
                    topic={title}
                    context={summary}
                    onContentReceived={(content) => {
                      setConclusion(content);
                    }}
                  />
                </div>
                <Editor initialContent={conclusion} onChange={setConclusion} />
                {typeof state.error !== "string" &&
                  state?.error?.conclusion && (
                    <p className="text-destructive text-sm">
                      {state.error.conclusion[0]}
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facts</CardTitle>
              <CardDescription>
                "At a Glance" items for the comparison table.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {facts.map((fact, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 border rounded-md"
                >
                  <input
                    type="hidden"
                    name={`facts[${index}][id]`}
                    defaultValue={fact.id ?? ""}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`fact-title-${index}`} className="text-xs">
                      Title
                    </Label>
                    <Input
                      id={`fact-title-${index}`}
                      name={`facts[${index}][title]`}
                      defaultValue={fact.title ?? ""}
                      placeholder="e.g., Best For"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`fact-valA-${index}`} className="text-xs">
                      Platform A Value
                    </Label>
                    <Input
                      id={`fact-valA-${index}`}
                      name={`facts[${index}][platformAValue]`}
                      defaultValue={fact.platformAValue ?? ""}
                      placeholder="e.g., Beginners"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`fact-valB-${index}`} className="text-xs">
                      Platform B Value
                    </Label>
                    <Input
                      id={`fact-valB-${index}`}
                      name={`facts[${index}][platformBValue]`}
                      defaultValue={fact.platformBValue ?? ""}
                      placeholder="e.g., Experts"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeFact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFact}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Fact
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>
                Frequently Asked Questions section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="space-y-2 p-3 border rounded-md relative"
                >
                  <input
                    type="hidden"
                    name={`faqs[${index}][id]`}
                    defaultValue={faq.id ?? ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 text-destructive h-7 w-7"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="space-y-1">
                    <Label htmlFor={`faq-q-${index}`}>Question</Label>
                    <Input
                      id={`faq-q-${index}`}
                      name={`faqs[${index}][question]`}
                      defaultValue={faq.question ?? ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                    <Textarea
                      id={`faq-a-${index}`}
                      name={`faqs[${index}][answer]`}
                      defaultValue={faq.answer ?? ""}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
              >
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
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  name="categoryId"
                  defaultValue={comparison?.categoryId ?? undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {typeof state.error !== "string" &&
                  state?.error?.categoryId && (
                    <p className="text-destructive text-sm">
                      {state.error.categoryId[0]}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformAId">Platform A</Label>
                <Select
                  name="platformAId"
                  value={platformAId}
                  onValueChange={setPlatformAId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform A" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="platformAId" value={platformAId} />
                {typeof state.error !== "string" &&
                  state?.error?.platformAId && (
                    <p className="text-destructive text-sm">
                      {state.error.platformAId[0]}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformBId">Platform B</Label>
                <Select
                  name="platformBId"
                  value={platformBId}
                  onValueChange={setPlatformBId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform B" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="platformBId" value={platformBId} />
                {typeof state.error !== "string" &&
                  state?.error?.platformBId && (
                    <p className="text-destructive text-sm">
                      {state.error.platformBId[0]}
                    </p>
                  )}
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="published"
                  name="published"
                  defaultChecked={comparison?.published ?? false}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </CardContent>
          </Card>

          {/* Platform Intelligence Sidebar (Pro Move) */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Platform Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[platformAId, platformBId].map((pid, idx) => {
                  const p = platforms.find((pl) => pl.id === pid);
                  if (!p)
                    return (
                      <div
                        key={idx}
                        className="h-20 bg-muted/20 rounded-xl border border-dashed border-muted flex items-center justify-center text-[10px] text-muted-foreground font-black uppercase"
                      >
                        Platform {idx === 0 ? "A" : "B"}
                      </div>
                    );
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-background rounded-xl border border-border/50 shadow-sm space-y-3"
                    >
                      <div className="relative h-8 w-full">
                        <img
                          src={p.logoUrl}
                          alt={p.name}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-primary text-[10px] font-black italic">
                          {p.rating || "N/A"} ★
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                  <PlusCircle className="h-3 w-3" /> Direct Edit Buffer
                </Label>
                <Textarea
                  placeholder="Type here to directly send text to Introduction..."
                  className="text-xs min-h-[100px] bg-background border-primary/10 italic"
                  onChange={(e) => setIntroduction(e.target.value)}
                  value={introduction}
                />
                <p className="text-[9px] text-muted-foreground leading-tight italic">
                  Pro Tip: This field is synced with the rich text editor for
                  rapid drafting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
