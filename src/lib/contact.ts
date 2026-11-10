export const taskTypes = [
  { value: "immersive", label: "Иммерсивный сайт" },
  { value: "relic", label: "3D-объект бренда" },
  { value: "campaign", label: "Кампания / механика" },
  { value: "index", label: "Прод и индексация" },
  { value: "other", label: "Другое" },
] as const;

export const budgets = [
  { value: "under-12k", label: "до $12 000" },
  { value: "12-28k", label: "$12 000–28 000" },
  { value: "28-60k", label: "$28 000–60 000" },
  { value: "60k-plus", label: "$60 000+" },
  { value: "discuss", label: "Обсудим" },
] as const;

export type ContactPayload = {
  name: string;
  contact: string;
  task: string;
  budget: string;
  message: string;
  website?: string;
};

export type FieldErrors = Partial<Record<keyof ContactPayload, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telegramRe = /^@?[a-zA-Z0-9_]{4,32}$/;

export function validateContact(input: ContactPayload): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const contact = input.contact.trim();
  const message = input.message.trim();

  if (name.length < 2) errors.name = "Укажите имя — минимум 2 символа.";
  if (name.length > 80) errors.name = "Имя слишком длинное.";

  if (!contact) {
    errors.contact = "Укажите email или Telegram.";
  } else if (!emailRe.test(contact) && !telegramRe.test(contact)) {
    errors.contact = "Похоже на неверный email или Telegram.";
  }

  const taskOk = taskTypes.some((item) => item.value === input.task);
  if (!taskOk) errors.task = "Выберите тип задачи.";

  const budgetOk = budgets.some((item) => item.value === input.budget);
  if (!budgetOk) errors.budget = "Выберите диапазон бюджета.";

  if (message.length < 12) {
    errors.message = "Опишите жест и метрику — минимум 12 символов.";
  }
  if (message.length > 4000) errors.message = "Сообщение слишком длинное.";

  return errors;
}
