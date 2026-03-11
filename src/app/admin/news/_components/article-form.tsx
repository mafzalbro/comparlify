"use client";

import { useActionState, useState } from "react";
import { createNewsArticle, updateNewsArticle } from "@/app/actions/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type NewsArticle, type Platform } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { AiFillButton } from "../../blog/_components/ai-fill-button";
import { AiImageButton } from "../../blog/_components/ai-image-button";
import dynamic from "next/dynamic";
const Editor = dynamic(
  () => import("@/components/ui/editor").then((mod) => mod.Editor),
  { ssr: false },
);
import { ImagePickerInput } from "../../_components/image-picker-input";

interface ArticleFormProps {
  article?: (NewsArticle & { platforms?: Platform[] }) | null;
  platforms: Platform[];
}

export function ArticleForm({ article, platforms }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!article;
  const formAction = isEditing
    ? updateNewsArticle.bind(null, article.id)
    : createNewsArticle;
  const [state, action] = useActionState(formAction, { error: null });

  const [content, setContent] = useState(article?.content ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>(
    article?.platforms?.map((p) => p.id) ?? [],
  );

  const togglePlatform = (id: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="content" value={content} />
      <input
        type="hidden"
        name="platformIds"
        value={JSON.stringify(selectedPlatformIds)}
      />
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
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {typeof state.error !== "string" && state.error?.title && (
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
                  id="slug"
                  name="slug"
                  value={slug}
                  required
                  type="hidden"
                />
              )}
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  The slug cannot be changed for existing articles to preserve
                  URL integrity.
                </p>
              )}
              {typeof state.error !== "string" && state.error?.slug && (
                <p className="text-destructive text-sm">
                  {state.error.slug[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <AiFillButton
                  fieldType="News Article Content"
                  topic={title}
                  onContentReceived={(newContent) => {
                    setContent("");
                    setTimeout(() => setContent(newContent), 0);
                  }}
                />
              </div>
              <Editor
                key={content}
                initialContent={content}
                onChange={setContent}
              />
              {typeof state.error !== "string" && state.error?.content && (
                <p className="text-destructive text-sm">
                  {state.error.content[0]}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <ImagePickerInput
              label="Image URL"
              name="image"
              defaultValue={article?.image}
            />
            <div className="space-y-2">
              <Label htmlFor="dataAiHint">AI Prompt for Image</Label>
              <Input
                id="dataAiHint"
                name="dataAiHint"
                defaultValue={article?.dataAiHint ?? ""}
                placeholder="e.g., 'technology announcement'"
              />
              <AiImageButton
                prompt={article?.dataAiHint || article?.title || ""}
                onImageReceived={(imageUrl) => {
                  const imageInput = document.querySelector(
                    'input[name="image"]',
                  ) as HTMLInputElement;
                  if (imageInput) {
                    imageInput.value = imageUrl;
                    imageInput.dispatchEvent(
                      new Event("input", { bubbles: true }),
                    );
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                name="published"
                defaultChecked={article?.published ?? false}
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="pt-6 border-t border-border">
              <Label className="text-base font-bold mb-4 block">
                Related Platforms
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`platform-${platform.id}`}
                      checked={selectedPlatformIds.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor={`platform-${platform.id}`}
                      className="cursor-pointer flex-1"
                    >
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
