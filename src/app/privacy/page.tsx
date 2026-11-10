import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: `Как ${site.name} обрабатывает данные, отправленные через форму на сайте.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="relative z-10 section-pad">
      <Container className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          / Юридическое
        </p>
        <h1 className="mt-6 font-display text-4xl italic tracking-tight sm:text-5xl">
          Политика конфиденциальности
        </h1>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Форма на этом сайте собирает имя, контакт (email или Telegram), тип
            сцены, бюджет и сообщение. Данные нужны только чтобы ответить на
            запрос. Скрытое поле-honeypot используется против спама и не
            обрабатывается, если заполнено. Правообладатель данных — {site.name}.
          </p>
          <p>
            Заявки не продаются третьим лицам. Сообщения хранятся столько,
            сколько нужно для переписки по проекту. Чтобы удалить данные,
            напишите на {site.email}.
          </p>
          <p>
            Сайт может сохранять технические логи (IP, время запроса) для защиты
            от злоупотреблений формой. Аналитические пиксели и рекламные куки не
            используются.
          </p>
        </div>
        <Link
          href="/"
          className="mt-12 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-[0.2em] text-accent-2"
        >
          На главную
        </Link>
      </Container>
    </main>
  );
}
