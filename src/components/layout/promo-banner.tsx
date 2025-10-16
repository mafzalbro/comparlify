
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromoBannerProps {
    content: Record<string, string>;
}

export function PromoBanner({ content }: PromoBannerProps) {
    const isEnabled = content['global.banner.enabled'] === 'true';
    const text = content['global.banner.text'];
    const linkText = content['global.banner.link.text'];
    const linkHref = content['global.banner.link.href'];

    if (!isEnabled || !text) {
        return null;
    }

    return (
        <div className="bg-primary text-primary-foreground">
            <div className="container flex items-center justify-center gap-x-6 py-2 px-6 sm:px-3.5">
                <p className="text-sm leading-6">
                    {text}
                </p>
                {linkText && linkHref && (
                    <Link
                        href={linkHref}
                        className="flex-none rounded-full bg-secondary/20 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        {linkText} <span aria-hidden="true">&rarr;</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
