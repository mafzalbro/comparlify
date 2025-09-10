
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BarChart, BrainCircuit, Scaling } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { ManagedImage } from './managed-image';
import { useIsMobile } from '@/hooks/use-mobile';


const features = [
    {
        id: 'comparisons',
        title: 'Unbiased Comparisons',
        Icon: BarChart,
        description: 'Get in-depth, data-driven comparisons of the top platforms. We dig into the details so you can choose with absolute confidence.',
        image: 'https://picsum.photos/seed/comp/800/600',
        dataAiHint: 'data chart graph',
        href: '/compare'
    },
    {
        id: 'ai-tools',
        title: 'Powerful AI Tools',
        Icon: BrainCircuit,
        description: 'From generating catchy titles to outlining entire courses, our suite of AI tools is designed to save you time and spark your creativity.',
        image: 'https://picsum.photos/seed/aitool/800/600',
        dataAiHint: 'abstract technology circuit',
        href: '/tools'
    },
    {
        id: 'strategies',
        title: 'Growth Strategies',
        Icon: Scaling,
        description: 'Access our regularly updated blog for expert tips, marketing strategies, and insights to help you scale your course business effectively.',
        image: 'https://picsum.photos/seed/growth/800/600',
        dataAiHint: 'business growth chart',
        href: '/blog'
    }
];


function FeatureCard({ feature, setActiveFeature }: { feature: (typeof features)[0], setActiveFeature: (id: string) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });
  
    useEffect(() => {
      if (isInView) {
        setActiveFeature(feature.id);
      }
    }, [isInView, feature.id, setActiveFeature]);
  
    return (
      <div ref={ref} className="h-screen w-full">
         <div
            className={cn(
                "flex flex-col gap-4 text-left p-6 rounded-xl transition-all duration-300 h-80"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-full transition-colors",
                    'bg-primary/20 text-primary'
                    )}>
                    <feature.Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

export function WhyChooseUs() {
    const [activeFeature, setActiveFeature] = useState(features[0].id);
    const isMobile = useIsMobile();
    
    // Effect for MOBILE auto-cycle animation
    useEffect(() => {
        if (!isMobile) return;

        const interval = setInterval(() => {
            setActiveFeature(prevId => {
                const currentIndex = features.findIndex(f => f.id === prevId);
                const nextIndex = (currentIndex + 1) % features.length;
                return features[nextIndex].id;
            });
        }, 5000); // Change feature every 5 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [isMobile]);


    const activeFeatureData = features.find(f => f.id === activeFeature);

    // RENDER FOR DESKTOP
    if (!isMobile) {
        return (
            <section className="relative py-16 md:py-24 bg-secondary/30 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
                
                <div className="container px-4 md:px-6 text-center mb-16">
                    <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                        Your All-In-One Creator Hub
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.
                    </p>
                </div>

                <div className="container grid lg:grid-cols-2 gap-12 items-start">
                    <div className="w-full flex flex-col gap-8">
                        {features.map((feature) => (
                           <FeatureCard key={feature.id} feature={feature} setActiveFeature={setActiveFeature} />
                        ))}
                    </div>

                    <div className="lg:sticky top-24 self-start h-[600px]">
                       <AnimatePresence mode="wait">
                         {activeFeatureData && (
                            <motion.div
                                key={activeFeatureData.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className="w-full h-full"
                            >
                               <div className="w-full h-full rounded-2xl shadow-2xl border overflow-hidden">
                                     <ManagedImage
                                        src={activeFeatureData.image}
                                        alt={activeFeatureData.title}
                                        data-ai-hint={activeFeatureData.dataAiHint}
                                        fill
                                        className="object-cover"
                                    />
                               </div>
                            </motion.div>
                         )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        );
    }
    
    // RENDER FOR MOBILE
    return (
        <section className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
             <div className="container px-4 md:px-6 py-12 relative">
                <div className="mx-auto max-w-3xl text-center mb-12">
                    <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                        Your All-In-One Creator Hub
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 items-center">
                    {/* Progress bars that fill based on interval */}
                    <div className="flex gap-2 w-full">
                        {features.map(feature => (
                             <div key={`${feature.id}-progress`} className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
                                {activeFeature === feature.id && (
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-primary"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 5, ease: 'linear' }}
                                        onAnimationComplete={() => {
                                            // This ensures the loop continues.
                                            // The state update in useEffect will trigger a re-render and restart the animation.
                                        }}
                                    />
                                )}
                             </div>
                        ))}
                    </div>

                    {/* Animated Content */}
                    <div className="relative min-h-[32rem] rounded-xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeFeatureData?.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className="absolute inset-0"
                            >
                                {activeFeatureData && (
                                     <div className="w-full h-full rounded-2xl shadow-2xl p-8 flex flex-col justify-end bg-gradient-to-br from-primary/10 via-background to-secondary/20 border overflow-hidden">
                                        <div className="absolute -inset-16 opacity-10 dark:opacity-20">
                                            <div className="absolute right-[-6rem] top-[8rem] h-64 w-64 bg-primary/20 rounded-full blur-3xl"></div>
                                            <div className="absolute left-[-4rem] bottom-[6rem] h-64 w-64 bg-secondary rounded-full blur-3xl"></div>
                                        </div>
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border bg-black/20 backdrop-blur-sm">
                                            <ManagedImage
                                                src={activeFeatureData.image}
                                                alt={activeFeatureData.title}
                                                data-ai-hint={activeFeatureData.dataAiHint}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <h3 className="font-headline text-3xl font-bold text-foreground">{activeFeatureData.title}</h3>
                                        <p className="text-muted-foreground my-3">{activeFeatureData.description}</p>
                                        <Button asChild className="group mt-4 self-start">
                                            <Link href={activeFeatureData.href}>
                                                Learn More <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
             </div>
        </section>
    )
}
