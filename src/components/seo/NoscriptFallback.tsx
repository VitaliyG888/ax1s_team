import { site } from "@/data/site";
import { manifesto } from "@/data/manifest";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { reasons } from "@/data/reasons";

export function NoscriptFallback() {
  return (
    <noscript>
      <div className="relative z-20 border-t border-hairline bg-background px-5 py-16 text-foreground">
        <p className="font-mono text-xs uppercase tracking-[0.22em]">{site.name}</p>
        <h2 className="mt-4 font-display text-3xl italic">Форма врёт. Бренд остаётся.</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{site.description}</p>
        <p className="mt-6 text-sm">
          <a href="#contact">Написать AX1S_TEAM</a> — нажмите, чтобы открыть форму связи.
        </p>
        <h3 className="mt-10 font-display text-2xl italic">
          Почему AX1S_TEAM для иммерсивного 3D-сайта
        </h3>
        <ul className="mt-4 space-y-3">
          {reasons.map((reason) => (
            <li key={reason.id}>
              <strong>{reason.title}</strong> — {reason.body}
            </li>
          ))}
        </ul>
        <h3 className="mt-10 font-display text-2xl italic">{manifesto.heading}</h3>
        {manifesto.paragraphs.map((p) => (
          <p key={p.slice(0, 20)} className="mt-3 max-w-xl text-sm text-muted">
            {p}
          </p>
        ))}
        <h3 className="mt-10 font-display text-2xl italic">Кейсы</h3>
        <ul className="mt-4 space-y-4">
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.title}</strong> — {project.result} {project.metric}
            </li>
          ))}
        </ul>
        <h3 className="mt-10 font-display text-2xl italic">Практики</h3>
        <ul className="mt-4 space-y-3">
          {services.map((service) => (
            <li key={service.id}>
              <strong>{service.title}</strong> — {service.outcome}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm">
          Связь: {site.email} / {site.telegramHandle}
        </p>
      </div>
    </noscript>
  );
}
