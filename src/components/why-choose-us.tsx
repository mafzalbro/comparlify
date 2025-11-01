"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarChart, BrainCircuit, Scaling } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ManagedImage } from "./managed-image";
import { useIsMobile } from "@/hooks/use-mobile";

interface WhyChooseUsProps {
  content: {
    "homepage.whyus.title": string;
    "homepage.whyus.subtitle": string;
    "homepage.whyus.comparisons.title": string;
    "homepage.whyus.comparisons.description": string;
    "homepage.whyus.aitools.title": string;
    "homepage.whyus.aitools.description": string;
    "homepage.whyus.strategies.title": string;
    "homepage.whyus.strategies.description": string;
  };
}

export function WhyChooseUs({ content }: WhyChooseUsProps) {
  const features = [
    {
      id: "comparisons",
      title: content["homepage.whyus.comparisons.title"] || "",
      Icon: BarChart,
      description: content["homepage.whyus.comparisons.description"] || "",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      dataAiHint: "data chart graph analytics",
      href: "/compare",
    },
    {
      id: "ai-tools",
      title: content["homepage.whyus.aitools.title"] || "",
      Icon: BrainCircuit,
      description: content["homepage.whyus.aitools.description"] || "",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      dataAiHint: "abstract technology AI brain circuit",
      href: "/tools",
    },
    {
      id: "strategies",
      title: content["homepage.whyus.strategies.title"] || "",
      Icon: Scaling,
      description: content["homepage.whyus.strategies.description"] || "",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      dataAiHint: "business growth chart upward trend",
      href: "/blog",
    },
  ].filter((f) => f.title && f.description); // Filter out empty features before content loads

  const [activeFeature, setActiveFeature] = useState(
    features.length > 0 ? features[0].id : ""
  );
  const targetRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const headerInView = useInView(headerRef);
  const cardsInView = useInView(cardsRef);

  const { scrollYProgress, scrollY } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Effect for DESKTOP scroll-based animation
  useEffect(() => {
    if (isMobile || features.length === 0) return;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const numFeatures = features.length;

      const featureIndex = Math.min(
        numFeatures - 1,
        Math.floor((latest - 0.12) * numFeatures)
      );
      if (features[featureIndex]) {
        setActiveFeature(features[featureIndex].id);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, isMobile, features]);

  // Effect for MOBILE auto-cycle animation
  useEffect(() => {
    if (!isMobile || features.length === 0) return;

    if (!activeFeature && features.length > 0) {
      setActiveFeature(features[0].id);
    }

    const interval = setInterval(() => {
      setActiveFeature((prevId) => {
        const currentIndex = features.findIndex((f) => f.id === prevId);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex].id;
      });
    }, 5000); // Change feature every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [isMobile, features, activeFeature]);

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  // RENDER FOR DESKTOP
  if (!isMobile) {
    return (
      <section
        ref={targetRef}
        className="relative py-20 md:py-32 bg-gradient-to-br from-secondary/20 via-background to-secondary/30 min-h-[300vh]"
      >
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark [mask-image:linear-gradient(0deg,transparent,black)]"></div>

        {/* Header Section - Not Sticky */}
        <div className="container px-6 md:px-8 py-16">
          <div ref={headerRef} className="mx-auto max-w-4xl text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="font-headline text-5xl font-bold md:text-6xl bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
                {content["homepage.whyus.title"]}
              </h2>
              <motion.p
                className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                {content["homepage.whyus.subtitle"]}
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Sticky Cards Section */}
        <div className="sticky top-8 bg-yellow-50 dark:bg-gray-800 min-h-screen flex flex-col justify-center">
          <div className="container px-6 md:px-8">
            <div
              ref={cardsRef}
              className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto"
            >
              <motion.div
                className="flex flex-col gap-6"
                initial={{ opacity: 0, x: -50 }}
                animate={
                  cardsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
                }
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {features.map((feature, index) => (
                  <motion.button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={
                      cardsInView
                        ? {
                            opacity: 1,
                            x: 0,
                            scale: 1,
                          }
                        : {
                            opacity: 0,
                            x: -30,
                            scale: 0.95,
                          }
                    }
                    transition={{
                      duration: 0.6,
                      delay: cardsInView ? index * 0.15 : 0,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "text-left p-6 rounded-2xl transition-all duration-500 group hover:scale-[1.02] transform",
                      activeFeature === feature.id
                        ? "bg-card shadow-2xl border-2 border-primary/20 shadow-primary/10"
                        : "hover:bg-card/60 hover:shadow-xl border border-transparent"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-5">
                      <motion.div
                        className={cn(
                          "p-4 rounded-2xl transition-all duration-300",
                          activeFeature === feature.id
                            ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.Icon className="h-7 w-7" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-headline text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
              <motion.div
                className="relative h-[28rem] lg:h-[36rem] rounded-3xl"
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={
                  cardsInView
                    ? { opacity: 1, x: 0, scale: 1 }
                    : { opacity: 0, x: 50, scale: 0.9 }
                }
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeatureData?.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20, rotateY: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20, rotateY: 10 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{ transformPerspective: 1000 }}
                  >
                    {activeFeatureData && (
                      <div className="w-full h-full rounded-3xl shadow-2xl flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-2 border-primary/10 overflow-hidden backdrop-blur-sm">
                        <div className="absolute -inset-20 opacity-20 dark:opacity-30">
                          <motion.div
                            className="absolute right-[-8rem] top-[6rem] h-80 w-80 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.2, 0.3, 0.2],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          ></motion.div>
                          <motion.div
                            className="absolute left-[-6rem] bottom-[4rem] h-80 w-80 bg-gradient-to-br from-secondary/30 to-primary/20 rounded-full blur-3xl"
                            animate={{
                              scale: [1.2, 1, 1.2],
                              opacity: [0.3, 0.2, 0.3],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 2,
                            }}
                          ></motion.div>
                        </div>
                        <motion.div
                          className="relative w-full aspect-video overflow-hidden shadow-2xl border-white/10 bg-gradient-to-br from-black/10 to-black/20 backdrop-blur-sm"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ManagedImage
                            src={activeFeatureData.image}
                            alt={activeFeatureData.title}
                            data-ai-hint={activeFeatureData.dataAiHint}
                            fill
                            className="object-cover transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </motion.div>
                        <div className="relative z-10 p-8">
                          <motion.h3
                            className="font-headline text-3xl font-bold text-foreground mb-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {activeFeatureData.title}
                          </motion.h3>
                          <motion.p
                            className="text-muted-foreground mb-6 leading-relaxed text-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {activeFeatureData.description}
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Button
                              asChild
                              className="group mt-2 self-start bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
                            >
                              <Link href={activeFeatureData.href}>
                                Learn More{" "}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                              </Link>
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // RENDER FOR MOBILE
  return (
    <section className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark [mask-image:linear-gradient(0deg,transparent,black)]"></div>
      <div className="container px-4 md:px-6 py-12 relative">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
            {content["homepage.whyus.title"]}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content["homepage.whyus.subtitle"]}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 items-center">
          {/* Progress bars that fill based on interval */}
          <div className="flex gap-2 w-full">
            {features.map((feature) => (
              <div
                key={`${feature.id}-progress`}
                className="relative w-full h-1 bg-muted rounded-full overflow-hidden"
              >
                {activeFeature === feature.id && (
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
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
                transition={{ duration: 0.5, ease: "easeInOut" }}
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
                    <h3 className="font-headline text-3xl font-bold text-foreground">
                      {activeFeatureData.title}
                    </h3>
                    <p className="text-muted-foreground my-3">
                      {activeFeatureData.description}
                    </p>
                    <Button asChild className="group mt-4 self-start">
                      <Link href={activeFeatureData.href}>
                        Learn More{" "}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
  );
}
