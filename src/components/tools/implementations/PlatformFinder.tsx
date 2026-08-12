"use client";

import React, { useState, useEffect } from "react";
import { MatchWizard } from "@/components/tools/match-wizard";
import { MatchResults } from "@/components/tools/match-results";
import { createProjectWithProfile, getPlatformMatches, getMatchFeatures } from "@/app/actions/projects";
import { useToast } from "@/hooks/use-toast";

export function PlatformFinder() {
  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getMatchFeatures().then(setAvailableFeatures);
  }, []);

  const handleRunAlgorithm = async (formData: any) => {
    setIsCalculating(true);
    try {
      const response = await createProjectWithProfile({}, formData);

      if (response.error || !response.data?.projectId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: typeof response.error === 'string' ? response.error : "Failed to create project workspace.",
        });
        return;
      }

      const matchData = await getPlatformMatches(response.data.projectId);
      await new Promise(r => setTimeout(r, 800));
      setResults(matchData);

      toast({
        title: "Match Found",
        description: `Analyzed ${matchData.length} platforms against your requirements.`,
      });
    } catch (error) {
      console.error("Match error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "The matching algorithm encountered an error.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  if (results.length > 0) {
    return <MatchResults results={results} />;
  }

  return (
    <MatchWizard
      availableFeatures={availableFeatures}
      onComplete={handleRunAlgorithm}
      isLoading={isCalculating}
    />
  );
}
