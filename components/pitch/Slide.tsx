"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface SlideProps {
  children: ReactNode;
  className?: string;
  direction?: number;
}

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
};

export default function Slide({ children, className = "", direction = 0 }: SlideProps) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 overflow-hidden bg-white ${className}`}
    >
      {children}
    </motion.div>
  );
}
