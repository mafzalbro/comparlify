
'use client';

import { useState, useTransition } from 'react';
import type { Session } from 'next-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { markUserAsOnboarded } from '@/app/actions/user';
import { BarChart, BrainCircuit, BookText, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

interface WelcomeOnboardingProps {
  user: Session['user'];
}

const features = [
    {
        Icon: BrainCircuit,
        title: "Explore AI Tools",
        description: "Generate titles, outlines, scripts, and more with our powerful suite of AI assistants."
    },
    {
        Icon: BarChart,
        title: "Compare Platforms",
        description: "Get unbiased, side-by-side comparisons of the top course creation platforms."
    },
    {
        Icon: BookText,
        title: "Read the Blog",
        description: "Find expert tips and growth strategies to scale your online course business."
    }
]

export function WelcomeOnboarding({ user }: WelcomeOnboardingProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { update } = useSession();

  const handleClose = () => {
    // Prevent re-triggering if already in progress
    if (isPending) return;

    startTransition(async () => {
      try {
        await markUserAsOnboarded();
        await update(); // Force a session refetch
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to mark user as onboarded:", error);
        toast({
            title: "Error",
            description: "Could not save onboarding status. You might see this again.",
            variant: "destructive"
        })
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        // This logic makes the dialog persistent. It can only be closed by clicking the button.
        if (!open && !isPending) {
            setIsOpen(true);
        }
    }}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">
            Welcome to Comparlify, {user.name?.split(' ')[0]}!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            We're thrilled to have you here. Here's a quick look at what you can do.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            {features.map((feature, index) => (
                 <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg mt-1">
                        <feature.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
        <DialogFooter>
          <Button onClick={handleClose} disabled={isPending} className="w-full group">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    Let's Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
