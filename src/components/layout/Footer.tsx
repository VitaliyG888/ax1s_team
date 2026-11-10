import { nav, site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function Footer() {
  const year = 2026;

  return (
    <footer className="relative z-10 border-t border-hairline py-12">
      <Container className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="logo-morph font-mono text-[11px] uppercase tracking-[0.28em] text-foreground">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Авторский юнит иммерсивных сайтов. 3D несёт бренд. Текст остаётся в DOM.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Футер">
          {nav.map((item) => (
            <MagneticLink
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </MagneticLink>
          ))}
          <a
            href="/privacy"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            Конфиденциальность
          </a>
        </nav>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          © {year} {site.name}
        </p>
      </Container>
    </footer>
  );
}
