"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateSocialMediaPostAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SocialMediaPostGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("twitter");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Social Media Post Generator"
        description="Generate engaging social media posts tailored to specific platforms, complete with hashtags and calls-to-action."
        action={generateSocialMediaPostAction}
        submitLabel="Generate Post"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Platform
            </Label>
            <Select name="platform" value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="rounded-2xl bg-white/5 border-white/10 h-12">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">X / Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Topic or Message
            </Label>
            <Textarea
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are you posting about?..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
