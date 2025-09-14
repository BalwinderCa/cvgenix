"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

export interface StickyCTAProps {
  href?: string;
  label?: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({
  href = "/resume-builder",
  label = "Get Started",
}) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);
  const y = useTransform(scrollY, [0, 100], [20, 0]);

  // Only visible on small screens
  return (
    <motion.div 
      style={{ opacity, y }}
      className="md:hidden fixed inset-x-0 bottom-3 z-40 px-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-md rounded-full border border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 shadow-lg ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 p-2 pl-4">
          <div className="text-sm text-foreground/80 line-clamp-1">Build your resume in minutes</div>
          <Button asChild size="sm" className="rounded-md px-4 font-semibold bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl">
            <Link href={href} aria-label={label}>{label}</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyCTA;