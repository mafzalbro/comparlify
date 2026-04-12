"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  AnimatePresence,
  useInView,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart,
  BrainCircuit,
  Scaling,
  Zap,
  Sparkles,
  LayoutPanelLeft,
} from "lucide-react";
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
    "module.compare.enabled": string;
    "module.tools.enabled": string;
    "module.blog.enabled": string;
  };
}

export function WhyChooseUs({ content }: WhyChooseUsProps) {
  const allFeatures = [
    {
      id: "comparisons",
      title:
        content["homepage.whyus.comparisons.title"] || "Battleground Analytics",
      Icon: BarChart,
      description:
        content["homepage.whyus.comparisons.description"] ||
        "Deep-dive side-by-side comparisons of the world's leading platforms.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
      dataAiHint: "data chart graph analytics",
      href: "/compare",
      enabled: content["module.compare.enabled"] !== "false",
      accent: "from-blue-600/30 to-cyan-500/10",
    },
    {
      id: "ai-tools",
      title: content["homepage.whyus.aitools.title"] || "Neural Assets",
      Icon: BrainCircuit,
      description:
        content["homepage.whyus.aitools.description"] ||
        "Harness generative AI to build your content strategy in seconds.",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
      dataAiHint: "abstract technology AI brain circuit",
      href: "/tools",
      enabled: content["module.tools.enabled"] !== "false",
      accent: "from-purple-600/30 to-pink-500/10",
    },
    {
      id: "strategies",
      title:
        content["homepage.whyus.strategies.title"] || "Scalability Protocols",
      Icon: Scaling,
      description:
        content["homepage.whyus.strategies.description"] ||
        "Proven growth frameworks for the modern digital entrepreneur.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
      dataAiHint: "business growth chart upward trend",
      href: "/blog",
      enabled: content["module.blog.enabled"] !== "false",
      accent: "from-orange-600/30 to-amber-500/10",
    },
  ];

  const features = allFeatures.filter(
    (f) => f.enabled && f.title && f.description,
  );
  const [activeFeature, setActiveFeature] = useState(
    features.length > 0 ? features[0].id : "",
  );
  const targetRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (isMobile || features.length === 0) return;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const numFeatures = features.length;
      const start = 0.15;
      const end = 0.85;
      const range = end - start;
      const step = range / numFeatures;

      let index = Math.floor((latest - start) / step);
      index = Math.max(0, Math.min(numFeatures - 1, index));

      if (features[index]) {
        setActiveFeature(features[index].id);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, isMobile, features]);

  // Mobile Auto-cycle
  useEffect(() => {
    if (!isMobile || features.length === 0) return;
    const interval = setInterval(() => {
      setActiveFeature((prevId) => {
        const currentIndex = features.findIndex((f) => f.id === prevId);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex].id;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isMobile, features]);

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  if (features.length === 0) return null;

  return (
    <section
      ref={targetRef}
      className={cn(
        "relative w-full flex flex-col justify-start",
        !isMobile ? "min-h-[400vh]" : "bg-background py-24",
      )}
    >
      {/* Main Content Area */}
      <div
        className={cn(
          "relative z-10",
          !isMobile
            ? "sticky -top-12 min-h-screen flex flex-col items-center justify-center overflow-visible"
            : "",
        )}
      >
        {/* Background Orbs & Effects */}
        {!isMobile && (
          <div className="absolute -z-10 top-20 h-screen w-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-transparent"></div>
            <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[60px_60px]"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/0 to-transparent"></div>

            <motion.div
              className="absolute top-1/4 -left-20 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[140px]"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"
              animate={{
                x: [0, -80, 0],
                y: [0, -60, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        )}
        <div className="container px-4 md:px-8 max-w-7xl">
          {/* Header Area */}
          <div
            className={cn(
              "mb-8 lg:mb-12 space-y-2 text-center w-full relative z-30",
              !isMobile ? "mt-0" : "",
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
            >
              <Zap className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Elite Ecosystem
              </span>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              The <span className="text-primary italic">Intelligence</span>{" "}
              Stack
            </motion.h2>
          </div>

          <div
            className={cn(
              "grid gap-10 lg:gap-16 items-center",
              !isMobile ? "grid-cols-2" : "grid-cols-1 mt-8",
            )}
          >
            {/* LEFT SIDE: CONTROL PANEL */}
            <div className="flex flex-col gap-3 md:gap-4 relative items-center lg:items-start">
              {/* Mobile Tabs Wrapper */}
              {isMobile && (
                <div className="flex gap-4 overflow-x-auto pb-6 w-full no-scrollbar px-2">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={cn(
                        "shrink-0 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 border flex gap-3 items-center whitespace-nowrap",
                        activeFeature === feature.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20"
                          : "bg-card border-border text-muted-foreground",
                      )}
                    >
                      <feature.Icon className="h-4 w-4" />
                      {feature.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}

              {/* Desktop Feature Selectors */}
              {!isMobile && (
                <div className="flex flex-col gap-3 w-full relative">
                  {features.map((feature, idx) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <button
                        onClick={() => setActiveFeature(feature.id)}
                        className={cn(
                          "w-full text-left p-4 md:p-5 rounded-3xl transition-all duration-200 relative group overflow-hidden border",
                          activeFeature === feature.id
                            ? "bg-card/40 backdrop-blur-2xl shadow-xl border-primary/30 z-20"
                            : "hover:bg-card/30 backdrop-blur-sm border-transparent opacity-40 hover:opacity-100 grayscale hover:grayscale-0",
                        )}
                      >
                        {/* Interactive Background Gradient */}
                        <div
                          className={cn(
                            "absolute inset-0 bg-linear-to-r transition-opacity duration-200 -z-10",
                            feature.accent,
                            activeFeature === feature.id
                              ? "opacity-10"
                              : "opacity-0",
                          )}
                        ></div>

                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-lg transition-all duration-200 shadow-inner",
                              activeFeature === feature.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 rotate-3"
                                : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                            )}
                          >
                            <feature.Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h3
                              className={cn(
                                "text-lg font-black tracking-tight transition-all duration-200",
                                activeFeature === feature.id
                                  ? "text-foreground translate-x-2"
                                  : "text-muted-foreground",
                              )}
                            >
                              {feature.title}
                            </h3>
                            <p
                              className={cn(
                                "text-xs leading-relaxed transition-all duration-200 max-w-sm",
                                activeFeature === feature.id
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/60",
                              )}
                            >
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}

                  <div className="absolute -right-12 top-0 bottom-0 w-[2px] bg-border/20">
                    <motion.div
                      className="w-full bg-primary shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                      style={{
                        height: useTransform(
                          smoothScrollProgress,
                          [0.15, 0.85],
                          ["0%", "100%"],
                        ),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: THE VISUAL ENGINE */}
            <div className="relative aspect-square lg:aspect-4/5 w-full max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.9, rotateY: -20, x: 50 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotateY: 20, x: -50 }}
                  transition={{
                    duration: 0.25,
                    type: "spring",
                    damping: 30,
                    stiffness: 200,
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ perspective: 1500 }}
                >
                  <div
                    className={cn(
                      "relative w-full h-full rounded-4xl overflow-hidden border border-white/10 shadow-xl flex flex-col group p-1",
                      "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-30 before:transition-opacity group-hover:before:opacity-50",
                      activeFeatureData?.accent,
                    )}
                  >
                    {/* Inner Content Case */}
                    <div className="relative h-full w-full rounded-3xl overflow-hidden bg-background/95 backdrop-blur-3xl flex flex-col">
                      {/* Visual Header */}
                      <div className="h-2/3 w-full relative group-hover:h-[60%] transition-all duration-300 overflow-hidden">
                        <ManagedImage
                          src={activeFeatureData?.image || ""}
                          alt={activeFeatureData?.title || ""}
                          data-ai-hint={activeFeatureData?.dataAiHint}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                        {/* Dynamic Scan line */}
                        <motion.div
                          className="absolute inset-x-0 h-[2px] bg-primary/60 blur-xs z-30"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"></div>
                      </div>

                      {/* Info Panel */}
                      <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                              <Sparkles className="h-2 w-2 text-primary animate-sparkle" />
                              <span className="text-[7.5px] font-black uppercase tracking-[0.3em] text-primary">
                                Live Neural Processing
                              </span>
                            </div>
                            <div className="flex -space-x-1">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-3.5 h-3.5 rounded-full bg-border border-2 border-background animate-pulse"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                ></div>
                              ))}
                            </div>
                          </div>

                          <h4 className="text-xl lg:text-2xl font-black tracking-tight leading-none">
                            {activeFeatureData?.title}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed text-xs max-w-md">
                            {activeFeatureData?.description} Unlock
                            industrial-grade insights designed for rapid
                            execution and tactical advantage.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-border/10">
                          <Button
                            asChild
                            size="default"
                            className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all group/btn"
                          >
                            <Link href={activeFeatureData?.href || "#"}>
                              Initialize Stack{" "}
                              <ArrowRight className="ml-2.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
