
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { subscribeAction } from '@/app/actions/subscriptions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Github, Twitter, Linkedin, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        'Subscribe'
      )}
    </Button>
  );
}

interface FooterContent {
    'footer.tagline'?: string;
    'footer.newsletter.title'?: string;
    'footer.newsletter.subtitle'?: string;
}

interface FooterProps {
    content: FooterContent;
}

export default function Footer({ content }: FooterProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(subscribeAction, {
    message: null,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
    }
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);


  return (
    <footer className="bg-secondary/50 border-t border-border/40">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground">
              {content['footer.tagline']}
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 gap-8">
            <div>
              <h3 className="font-headline text-lg font-semibold mb-4">Navigate</h3>
              <ul className="space-y-2">
                <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-primary">Comparisons</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/tools" className="text-sm text-muted-foreground hover:text-primary">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="space-y-4 md:col-span-1">
            <h3 className="font-headline text-lg font-semibold">{content['footer.newsletter.title']}</h3>
            <p className="text-sm text-muted-foreground">{content['footer.newsletter.subtitle']}</p>
            <form ref={formRef} action={formAction} className="flex gap-2">
              <Input name="email" type="email" placeholder="Enter your email" className="bg-background" required />
              <SubmitButton />
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Comparlify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
