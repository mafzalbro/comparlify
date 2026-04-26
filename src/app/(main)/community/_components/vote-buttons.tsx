
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { voteTopic, votePost } from "@/app/actions/community";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  id: string;
  initialVotes: number;
  userVote: number;
  type: "topic" | "post";
  className?: string;
}

export function VoteButtons({ id, initialVotes, userVote, type, className }: VoteButtonsProps) {
  const [currentVote, setCurrentVote] = useState(userVote);
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: number) => {
    if (isVoting) return;

    const newValue = currentVote === value ? 0 : value;
    const voteDiff = newValue - currentVote;

    // Optimistic update
    setCurrentVote(newValue);
    setVotes(prev => prev + voteDiff);
    setIsVoting(true);

    try {
      if (type === "topic") {
        await voteTopic(id, newValue);
      } else {
        await votePost(id, newValue);
      }
    } catch (error) {
      // Revert optimistic update
      setCurrentVote(userVote);
      setVotes(initialVotes);
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on community posts.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500",
          currentVote === 1 && "bg-emerald-500/10 text-emerald-500"
        )}
        onClick={() => handleVote(1)}
      >
        <ArrowBigUp className={cn("h-6 w-6", currentVote === 1 && "fill-current")} />
      </Button>

      <span className={cn(
        "text-sm font-black italic",
        currentVote === 1 && "text-emerald-500",
        currentVote === -1 && "text-rose-500"
      )}>
        {votes}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full hover:bg-rose-500/10 hover:text-rose-500",
          currentVote === -1 && "bg-rose-500/10 text-rose-500"
        )}
        onClick={() => handleVote(-1)}
      >
        <ArrowBigDown className={cn("h-6 w-6", currentVote === -1 && "fill-current")} />
      </Button>
    </div>
  );
}
