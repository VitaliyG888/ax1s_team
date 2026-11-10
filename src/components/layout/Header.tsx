"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/data/site";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { cn } from "@/lib/cn";

function subscribeScroll(onStoreChange: () => void): () => void {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollSnapshot(): boolean {
  return window.scrollY > 24;
}

function getScrollServerSnapshot(): boolean {
  return false;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrollSnapshot,
    getScrollServerSnapshot,
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-background/88 backdrop-blur-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-5 sm:h-[4.5rem] sm:px-8 lg:px-12">
        <MagneticLink
          href="#top"
          className="logo-morph font-mono text-xs uppercase tracking-[0.32em] text-foreground"
        >
          {site.name}
          <span className="sr-only"> — наверх</span>
        </MagneticLink>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Основная">
          {nav.map((item) => (
            <MagneticLink
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-foreground"
            >
              {item.label}
            </MagneticLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span className="live-dot size-1.5 rounded-full bg-accent" aria-hidden="true" />
            {site.availabilityShort}
          </span>
          <MagneticLink
            href="#contact"
            className="border-b border-accent-2 pb-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-opacity duration-200 hover:opacity-70"
          >
            Написать AX1S_TEAM
          </MagneticLink>
        </div>

        <button
          type="button"
          className="inline-flex size-11 cursor-pointer items-center justify-center text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-hairline bg-background md:hidden"
      >
        <nav className="flex flex-col px-5 py-6" aria-label="Мобильная">
          {nav.map((item) => (
            <MagneticLink
              key={item.href}
              href={item.href}
              onNavigate={() => setOpen(false)}
              className="border-b border-hairline py-4 font-display text-3xl italic tracking-tight"
            >
              {item.label}
            </MagneticLink>
          ))}
          <MagneticLink
            href="#contact"
            onNavigate={() => setOpen(false)}
            className="pt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-2"
          >
            Написать AX1S_TEAM
          </MagneticLink>
        </nav>
      </div>
    </header>
  );
}
