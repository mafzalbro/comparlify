"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPlatform, updatePlatform } from "@/app/actions/platforms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Platform,
  type Feature,
  type PlatformFeature,
  type FeatureCategory,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitButton } from "@/components/submit-button";
import { AiLogoButton } from "./ai-logo-button";
import { AiFillButton } from "../../blog/_components/ai-fill-button";
import { ImagePickerInput } from "../../_components/image-picker-input";
import dynamic from "next/dynamic";
const Editor = dynamic(
  () => import("@/components/ui/editor").then((mod) => mod.Editor),
  { ssr: false },
);

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

interface PlatformFormProps {
  platform?: PlatformWithFeatures | null;
  features: (Feature & { category: FeatureCategory })[];
  featureCategories: FeatureCategory[];
}

export function PlatformForm({
  platform,
  features,
  featureCategories,
}: PlatformFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEditing = !!platform;
  const formAction = isEditing
    ? updatePlatform.bind(null, platform.id)
    : createPlatform;
  const [state, action] = useActionState(formAction, { error: null });

  useEffect(() => {
    if (state?.error) {
      if (typeof state.error === "string") {
        toast({
          title: "Error",
          description: state.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Validation Error",
          description: "Please check the form for mistakes.",
          variant: "destructive",
        });
      }
    }
  }, [state?.error, toast]);

  const [name, setName] = useState(platform?.name ?? "");
  const [description, setDescription] = useState(platform?.description ?? "");

  const platformFeatureMap = new Map(
    platform?.features.map((pf) => [pf.featureId, pf]),
  );

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    () => {
      if (!platform) return {};
      return platform.features.reduce(
        (acc, feat) => {
          acc[feat.featureId] = feat.hasFeature;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
  );

  const [featureDetails, setFeatureDetails] = useState<Record<string, string>>(
    () => {
      if (!platform) return {};
      return platform.features.reduce(
        (acc, feat) => {
          acc[feat.featureId] = feat.details ?? "";
          return acc;
        },
        {} as Record<string, string>,
      );
    },
  );

  const activeTab =
    searchParams.get("features") ||
    (featureCategories.length > 0 ? featureCategories[0].id : "");

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?features=${value}`, { scroll: false });
  };

  return (
    <form action={action}>
      <input type="hidden" name="description" value={description} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {typeof state.error !== "string" && state?.error?.name && (
                    <p className="text-destructive text-sm">
                      {state.error.name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={platform?.website}
                    required
                  />
                  {typeof state.error !== "string" && state?.error?.website && (
                    <p className="text-destructive text-sm">
                      {state.error.website[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <ImagePickerInput
                  label="Logo URL"
                  name="logoUrl"
                  defaultValue={platform?.logoUrl}
                />
                {typeof state.error !== "string" && state?.error?.logoUrl && (
                  <p className="text-destructive text-sm">
                    {state.error.logoUrl[0]}
                  </p>
                )}
                <AiLogoButton
                  platformName={name}
                  onLogoReceived={(url) => {
                    const logoInput = document.querySelector(
                      'input[name="logoUrl"]',
                    ) as HTMLInputElement;
                    if (logoInput) {
                      logoInput.value = url;
                      logoInput.dispatchEvent(
                        new Event("input", { bubbles: true }),
                      );
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <AiFillButton
                    fieldType="Platform Description"
                    topic={name}
                    onContentReceived={setDescription}
                  />
                </div>
                <Editor
                  initialContent={description}
                  onChange={setDescription}
                />
                {typeof state.error !== "string" &&
                  state?.error?.description && (
                    <p className="text-destructive text-sm">
                      {state.error.description[0]}
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Overall Rating (0-5)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={platform?.rating?.toString()}
                  placeholder="e.g. 4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="easeOfUse">Ease of Use (0-5)</Label>
                <Input
                  id="easeOfUse"
                  name="easeOfUse"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={platform?.easeOfUse?.toString()}
                  placeholder="e.g. 4.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuresRating">Features Rating (0-5)</Label>
                <Input
                  id="featuresRating"
                  name="featuresRating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={platform?.featuresRating?.toString()}
                  placeholder="e.g. 4.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support">Support Rating (0-5)</Label>
                <Input
                  id="support"
                  name="support"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={platform?.support?.toString()}
                  placeholder="e.g. 5.0"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Select the features this platform has and add any relevant details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList>
              {featureCategories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {featureCategories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="space-y-6 pt-4">
                  {features
                    .filter((f) => f.categoryId === cat.id)
                    .map((feature) => {
                      const initialChecked =
                        platformFeatureMap.get(feature.id)?.hasFeature ?? false;
                      return (
                        <div
                          key={feature.id}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t pt-6"
                        >
                          <div className="md:col-span-1 flex items-center gap-3">
                            {/* This hidden input ensures that a value for the feature is always submitted */}
                            <input
                              type="hidden"
                              name={`features[${feature.id}].hasFeature`}
                              value="off"
                            />
                            <Checkbox
                              id={`feature-check-${feature.id}`}
                              name={`features[${feature.id}].hasFeature`}
                              defaultChecked={initialChecked}
                            />
                            <Label
                              htmlFor={`feature-check-${feature.id}`}
                              className="font-semibold"
                            >
                              {feature.name}
                            </Label>
                          </div>
                          <div className="md:col-span-2">
                            <Label
                              htmlFor={`feature-details-${feature.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Details
                            </Label>
                            <Input
                              id={`feature-details-${feature.id}`}
                              name={`features[${feature.id}].details`}
                              defaultValue={
                                platformFeatureMap.get(feature.id)?.details ??
                                ""
                              }
                              placeholder="e.g., Basic quiz functionality"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
