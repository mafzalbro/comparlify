'use client';

import { useActionState } from 'react';
import { createPlatform, updatePlatform } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Platform, type Feature, type PlatformFeature, type FeatureCategory } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubmitButton } from '@/components/submit-button';


type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

interface PlatformFormProps {
  platform?: PlatformWithFeatures | null;
  features: (Feature & { category: FeatureCategory })[];
  featureCategories: FeatureCategory[];
}

export function PlatformForm({ platform, features, featureCategories }: PlatformFormProps) {
  const router = useRouter();
  const isEditing = !!platform;
  const formAction = isEditing ? updatePlatform.bind(null, platform.id) : createPlatform;
  const [state, action] = useActionState(formAction, { error: null });

  const platformFeatureMap = new Map(platform?.features.map(pf => [pf.featureId, pf]));

  return (
    <form action={action}>
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
                            <Input id="name" name="name" defaultValue={platform?.name} required />
                            {typeof state.error !== 'string' && state?.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input id="website" name="website" defaultValue={platform?.website} required />
                            {typeof state.error !== 'string' && state?.error?.website && <p className="text-destructive text-sm">{state.error.website[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" name="logoUrl" defaultValue={platform?.logoUrl} required />
                        {typeof state.error !== 'string' && state?.error?.logoUrl && <p className="text-destructive text-sm">{state.error.logoUrl[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={platform?.description} rows={5} required />
                        {typeof state.error !== 'string' && state?.error?.description && <p className="text-destructive text-sm">{state.error.description[0]}</p>}
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
                        <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={platform?.rating ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="easeOfUse">Ease of Use (0-5)</Label>
                        <Input id="easeOfUse" name="easeOfUse" type="number" step="0.1" min="0" max="5" defaultValue={platform?.easeOfUse ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="featuresRating">Features Rating (0-5)</Label>
                        <Input id="featuresRating" name="featuresRating" type="number" step="0.1" min="0" max="5" defaultValue={platform?.featuresRating ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="support">Support Rating (0-5)</Label>
                        <Input id="support" name="support" type="number" step="0.1" min="0" max="5" defaultValue={platform?.support ?? 0} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

       <Card className="mt-8">
            <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Select the features this platform has and add any relevant details.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue={featureCategories[0]?.id ?? ''} className="w-full">
                    <TabsList>
                        {featureCategories.map(cat => (
                             <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {featureCategories.map(cat => (
                        <TabsContent key={cat.id} value={cat.id}>
                            <div className="space-y-6 pt-4">
                                {features.filter(f => f.categoryId === cat.id).map(feature => {
                                    const platformFeature = platformFeatureMap.get(feature.id);
                                    return (
                                        <div key={feature.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t pt-6">
                                            <div className="md:col-span-1 flex items-center gap-3">
                                                <Checkbox 
                                                    id={`feature-check-${feature.id}`}
                                                    name={`features[${feature.id}].hasFeature`}
                                                    defaultChecked={platformFeature?.hasFeature ?? false}
                                                />
                                                <Label htmlFor={`feature-check-${feature.id}`} className="font-semibold">{feature.name}</Label>
                                            </div>
                                             <div className="md:col-span-2">
                                                <Label htmlFor={`feature-details-${feature.id}`} className="text-xs text-muted-foreground">Details</Label>
                                                <Input 
                                                    id={`feature-details-${feature.id}`}
                                                    name={`features[${feature.id}].details`}
                                                    defaultValue={platformFeature?.details ?? ''}
                                                    placeholder="e.g., Basic quiz functionality"
                                                />
                                             </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
       </Card>

        <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <SubmitButton isEditing={isEditing} />
        </div>
    </form>
  );
}
