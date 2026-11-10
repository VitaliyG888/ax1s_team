export type Metric = {
  id: string;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  note: string;
};

export const metrics: Metric[] = [
  {
    id: "scenes",
    value: 24,
    suffix: "",
    label: "сред с одной камерой",
    note: "Не набор виджетов. Сценарий от порога до заявки.",
  },
  {
    id: "lcp",
    value: 2,
    prefix: "<",
    suffix: " с",
    label: "бюджет LCP на проде",
    note: "3D приходит после первого пейнта. Текст уже на месте.",
  },
  {
    id: "recall",
    value: 31,
    suffix: "%",
    prefix: "+",
    label: "средний прирост recall марки",
    note: "Там, где объект можно сдвинуть, а не только посмотреть.",
  },
  {
    id: "wait",
    value: 14,
    suffix: " нед.",
    label: "от партитуры до релиза",
    note: "Иммерсив не собирается за спринт. Срок честный.",
  },
];
