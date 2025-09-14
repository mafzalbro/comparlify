
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateSocialMediaPostAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from './use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Post...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Post
        </>
      )}
    </Button>
  );
}

export function SocialMediaPostGeneratorForm() {
  const initialState = { post: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generateSocialMediaPostAction, initialState);
  const [postTopic, setPostTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.post) {
      navigator.clipboard.writeText(state.post);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard.',
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <AIGenerationLoader show={isSubmitting} />
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Post Details</CardTitle>
            <CardDescription>
              Provide your topic and select a platform. The AI will generate a tailored social media post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="postTopic">Topic</Label>
                <Textarea
                  id="postTopic"
                  name="postTopic"
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  placeholder="e.g., 'The importance of A/B testing for landing pages' or 'Announcing a 50% discount on my course for Black Friday'"
                  rows={4}
                  required
                />
                {typeof state.error === 'object' && state.error?.postTopic && (
                  <p className="text-sm text-destructive">{state.error.postTopic[0]}</p>
                )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Platform</Label>
                <RadioGroup name="platform" value={platform} onValueChange={setPlatform} className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Twitter" id="p-twitter" />
                        <Label htmlFor="p-twitter">Twitter / X</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="LinkedIn" id="p-linkedin" />
                        <Label htmlFor="p-linkedin">LinkedIn</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Facebook" id="p-facebook" />
                        <Label htmlFor="p-facebook">Facebook</Label>
                    </div>
                </RadioGroup>
                 {typeof state.error === 'object' && state.error?.platform && (
                  <p className="text-sm text-destructive">{state.error.platform[0]}</p>
                )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.post && !isSubmitting && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle className="font-bold">Generated Post</CardTitle>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <form action={formAction}>
                        <input type="hidden" name="postTopic" value={postTopic} />
                        <input type="hidden" name="platform" value={platform} />
                        <Button variant="ghost" size="icon" title="Regenerate">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardHeader>
            <CardContent>
                <MarkdownContent content={state.post} />
            </CardContent>
        </Card>
      )}

      {typeof state.error === 'string' && !isSubmitting && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
