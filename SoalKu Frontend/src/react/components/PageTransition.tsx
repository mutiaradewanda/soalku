import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: (displayLocation: ReturnType<typeof useLocation>) => React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState<"fadeIn" | "fadeOut">("fadeIn");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage("fadeOut");

      // Fallback timer to guarantee transition proceeds even without animationend event
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setStage("fadeIn");
      }, 160);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location, displayLocation]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only respond to animations on the wrapper container itself
    if (e.target !== e.currentTarget) return;

    if (stage === "fadeOut") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setDisplayLocation(location);
      setStage("fadeIn");
    }
  };

  return (
    <div
      key={displayLocation.pathname}
      className={`min-h-screen ${stage === "fadeIn" ? "animate-page-enter" : "animate-page-exit"}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children(displayLocation)}
    </div>
  );
};
