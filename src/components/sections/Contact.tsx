"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { site } from "@/data/site";
import {
  budgets,
  taskTypes,
  validateContact,
  type ContactPayload,
  type FieldErrors,
} from "@/lib/contact";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/cn";

const empty: ContactPayload = {
  name: "",
  contact: "",
  task: "",
  budget: "",
  message: "",
  website: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const ref = useReveal<HTMLElement>();
  const [form, setForm] = useState<ContactPayload>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const set =
    (key: keyof ContactPayload) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validateContact(form);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      const field = event.currentTarget.querySelector<HTMLElement>(
        `[name="${first}"]`,
      );
      field?.focus();
      return;
    }

    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        error?: string;
      };

      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }

      if (!res.ok || !data.ok) {
        setStatus("error");
        setServerError(data.error || "Не удалось отправить. Напишите напрямую.");
        return;
      }

      setStatus("success");
      setForm(empty);
    } catch {
      setStatus("error");
      setServerError("Сеть недоступна. Напишите в Telegram или на почту.");
    }
  };

  return (
    <section id="contact" ref={ref} className="section-pad border-t border-hairline">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <SectionIndex index="07" label="Связь" />
            </div>
            <h2
              data-reveal
              className="mt-6 font-display text-4xl italic tracking-tight sm:text-6xl"
            >
              Партитура, не бриф.
            </h2>
            <p data-reveal className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Жест, который должен остаться. Метрика, без которой сцена не считается. Срок, который вы готовы защищать. Отвечает {site.name}.
            </p>
            <ul className="mt-10 space-y-4" data-reveal>
              <li>
                <a
                  href={site.telegram}
                  className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground"
                >
                  Telegram
                  <span className="text-muted">{site.telegramHandle}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-accent-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground"
                >
                  Email
                  <span className="text-muted">{site.email}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-accent-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
              <li>
                <a
                  href={site.github}
                  className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground"
                >
                  GitHub
                  <span className="text-muted">{site.githubHandle}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-accent-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7" data-reveal>
            {status === "success" ? (
              <div
                className="dream-card p-8 sm:p-10"
                role="status"
                aria-live="polite"
              >
                <Check className="text-accent" size={28} strokeWidth={1.5} />
                <h3 className="mt-6 font-display text-3xl italic tracking-tight">
                  Заявка ушла.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Ответим в течение рабочего дня. Если сцена горит — Telegram.
                </p>
                <button
                  type="button"
                  className="mt-8 min-h-11 cursor-pointer font-mono text-xs uppercase tracking-[0.2em] text-accent-2"
                  onClick={() => setStatus("idle")}
                >
                  Отправить ещё
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="name" label="Имя" error={errors.name} required>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={set("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={inputClass(Boolean(errors.name))}
                    />
                  </Field>
                  <Field
                    id="contact"
                    label="Email или Telegram"
                    error={errors.contact}
                    required
                  >
                    <input
                      id="contact"
                      name="contact"
                      autoComplete="email"
                      inputMode="email"
                      value={form.contact}
                      onChange={set("contact")}
                      aria-invalid={Boolean(errors.contact)}
                      aria-describedby={
                        errors.contact ? "contact-error" : undefined
                      }
                      className={inputClass(Boolean(errors.contact))}
                    />
                  </Field>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="task" label="Тип сцены" error={errors.task} required>
                    <select
                      id="task"
                      name="task"
                      value={form.task}
                      onChange={set("task")}
                      aria-invalid={Boolean(errors.task)}
                      aria-describedby={errors.task ? "task-error" : undefined}
                      className={inputClass(Boolean(errors.task))}
                    >
                      <option value="">Выберите</option>
                      {taskTypes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="budget" label="Бюджет" error={errors.budget} required>
                    <select
                      id="budget"
                      name="budget"
                      value={form.budget}
                      onChange={set("budget")}
                      aria-invalid={Boolean(errors.budget)}
                      aria-describedby={
                        errors.budget ? "budget-error" : undefined
                      }
                      className={inputClass(Boolean(errors.budget))}
                    >
                      <option value="">Выберите</option>
                      {budgets.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field
                  id="message"
                  label="Жест и метрика"
                  error={errors.message}
                  required
                >
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    className={cn(inputClass(Boolean(errors.message)), "resize-y")}
                  />
                </Field>
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set("website")}
                  />
                </div>
                {status === "error" ? (
                  <p className="text-sm text-danger" role="alert">
                    {serverError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center border border-accent-2 bg-accent-2 px-8 font-mono text-xs uppercase tracking-[0.22em] text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "submitting" ? "Отправка…" : "Отправить"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
      >
        {label}
        {required ? (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(invalid: boolean): string {
  return cn(
    "min-h-12 w-full border bg-transparent px-4 font-sans text-sm text-foreground outline-none transition-colors",
    "placeholder:text-muted",
    invalid
      ? "border-danger"
      : "border-hairline focus:border-accent-3 focus:ring-1 focus:ring-accent-3/30",
  );
}
