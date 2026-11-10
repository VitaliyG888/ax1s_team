"use client";

import { useLenis } from "@/lib/lenis";
import { cn } from "@/lib/cn";
import {
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function MagneticLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const { scrollTo } = useLenis();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    registerGsap();
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "expo.out" });

    const onMove = (event: globalThis.MouseEvent) => {
      const box = el.getBoundingClientRect();
      xTo((event.clientX - box.left - box.width / 2) * 0.28);
      yTo((event.clientY - box.top - box.height / 2) * 0.28);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      scrollTo(href);
    }
    onNavigate?.();
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      className={cn("will-change-transform cursor-pointer", className)}
    >
      {children}
    </a>
  );
}
