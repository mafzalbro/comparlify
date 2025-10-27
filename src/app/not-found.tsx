
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="relative flex flex-1 flex-col items-center justify-center text-center px-8 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="relative flex flex-col items-center justify-center">
                <h1 className="text-[10rem] sm:text-[12rem] font-black font-headline leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary/70 to-primary">
                    404
                </h1>
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground -mt-12">
                    Page Not Found
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-md">
                    Looks like you've ventured off the map. The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="mt-8 flex gap-4 flex-wrap items-center justify-center">
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
        </div>
    );
}