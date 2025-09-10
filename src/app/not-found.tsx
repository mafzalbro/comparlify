
import { Button } from '@/components/ui/button';
import { Compass, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4">
        <div className="bg-primary/20 p-4 rounded-full mb-6">
            <Compass className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
            404 - Page Not Found
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
            Oops! It looks like you've taken a wrong turn. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
                <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Go Back Home
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                 <Link href="/contact">Contact Support</Link>
            </Button>
        </div>
    </div>
  );
}
