"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

const StarShape = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("w-full h-full", className)}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

interface StarProps {
  initialX: number;
  initialY: number;
  depth: number;
  size: number;
  rotationSpeed: number;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  smoothProgress: MotionValue<number>;
}

const Star = ({
  initialX,
  initialY,
  depth,
  size,
  rotationSpeed,
  smoothMouseX,
  smoothMouseY,
  smoothProgress,
}: StarProps) => {
  // We use percentage units to keep it responsive.
  const attractX = useTransform(smoothMouseX, (val) => {
    const targetX = val * 100;
    const dist = targetX - initialX;
    return dist * 4;
  });

  const attractY = useTransform(smoothMouseY, (val) => {
    const targetY = val * 100;
    const dist = targetY - initialY;
    return dist * 2;
  });

  // BOMBARDING & PULSING EFFECT:
  // 0 (Hero): Normal positions
  // 0.5 (Mid): Zoomed In (Bombarding)
  // 1 (Footer): Retreat back to normal
  const starZ = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [depth, depth + 1400, depth],
  );

  // High visibility at start and end
  const starOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [1, 0.7, 0, 0.7, 1],
  );

  // RESOLUTION FIX: Start at 0.1 scale (of a 60px star) and zoom to 1.2
  // This forces the browser to rasterize the SVG at high resolution.
  const starScale = useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.3, 0.2]);

  return (
    <motion.div
      className="absolute text-primary/60 dark:text-primary/40"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: size,
        height: size,
        x: attractX,
        y: attractY,
        z: starZ,
        opacity: starOpacity,
        scale: starScale,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        animate={{
          opacity: [0.2, 0.8, 0.2],
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 360],
        }}
        transition={{
          duration: rotationSpeed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-full h-full drop-shadow-[0_0_1px_rgba(234,179,8,1)] dark:drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]"
      >
        <StarShape />
      </motion.div>
    </motion.div>
  );
};

export function GeometricBackground() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  // Mouse Tracking
  const mouseX = useMotionValue(0.5); // 0 to 1
  const mouseY = useMotionValue(0.5); // 0 to 1

  // Smooth springs for high-end motion
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
  });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Global Scene Transformations (Scroll Driven)
  const rotateX = useTransform(smoothProgress, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothProgress, [0, 1], [-15, 15]);
  const translateZ = useTransform(smoothProgress, [0, 1], [0, 300]);
  const sceneY = useTransform(smoothProgress, [0, 1], ["0%", "-10%"]);

  // Generate star data
  const stars = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100, // 0-100%
      initialY: Math.random() * 100, // 0-100%
      depth: Math.random() * -400 - 200,
      size: 60, // Large base size for high-res rasterization
      rotationSpeed: 10 + Math.random() * 15,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background select-none"
      aria-hidden="true"
      style={{ perspective: "1500px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          z: translateZ,
          y: sceneY,
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0 flex items-center justify-center h-[120vh]"
      >
        <div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Galactic Grid */}
          <div
            className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"
            style={{ transform: "translateZ(-300px) scale(3)" }}
          />

          {/* DYNAMIC STAR GALAXY WITH REAL COLLECTION */}
          <div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {stars.map((star) => (
              <Star
                key={star.id}
                {...star}
                smoothMouseX={smoothMouseX}
                smoothMouseY={smoothMouseY}
                smoothProgress={smoothProgress}
              />
            ))}
          </div>

          {/* Galaxy Center Glow (Stationary) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10" />
        </div>
      </motion.div>
    </div>
  );
}
