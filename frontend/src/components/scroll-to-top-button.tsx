"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

export interface ScrollToTopButtonProps {
  showAfter?: number; // px
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ showAfter = 600 }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={[
        "fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3",
        "hover:shadow-xl hover:bg-primary hover:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      ].join(" ")}
    >
      <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};

export default ScrollToTopButton;