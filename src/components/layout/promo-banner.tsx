'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface PromoBannerProps {
  settings?: {
    enabled?: boolean;
    text?: string;
    linkText?: string;
    linkHref?: string;
  };
}

export function PromoBanner({ settings }: PromoBannerProps) {
    const [dismissed, setDismissed] = useLocalStorage('promoBannerDismissed', false);

    if (!settings) {
        return null;
    }

    const isEnabled = settings.enabled === true;
    const text = settings.text;
    const linkText = settings.linkText;
    const linkHref = settings.linkHref;

    if (!isEnabled || !text || dismissed) {
        return null;
    }

    return (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-primary/90 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 text-white">
             <div
                className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
                aria-hidden="true"
            >
                <div
                className="aspect-577/310 w-144.25 bg-linear-to-r from-primary to-amber-400 opacity-30"
                style={{
                    clipPath:
                    'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
                }}
                />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm leading-6">
                {text}
                </p>
                {linkText && linkHref && (
                    <Link
                        href={linkHref}
                        className="flex-none rounded-full bg-background px-3.5 py-1 text-sm font-semibold text-primary shadow-sm hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                       {linkText} <span aria-hidden="true">&rarr;</span>
                    </Link>
                )}
            </div>
            <div className="flex flex-1 justify-end">
                 <button
                    type="button"
                    className="-m-3 p-3 focus-visible:-outline-offset-4 text-white/80 hover:text-white"
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
