"use client";
import { useState, useEffect, useRef, RefObject } from "react";

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: "150px 0px" }
): [RefObject<T>, boolean] {
  const containerRef = useRef<T>(null);
  const [isInView, setIsInView] = useState<boolean>(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [options.rootMargin, options.threshold]);

  return [containerRef, isInView];
}
