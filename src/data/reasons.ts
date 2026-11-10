export type Reason = {
  id: string;
  index: string;
  title: string;
  body: string;
};

export const reasons: Reason[] = [
  {
    id: "relic",
    index: "01",
    title: "WebGL несёт бренд",
    body: "Иммерсивный 3D-сайт AX1S_TEAM строится вокруг объекта идентичности, а не вокруг декоративного фона. Форма запоминается жестом.",
  },
  {
    id: "index",
    index: "02",
    title: "Поиск видит текст",
    body: "Canvas не заменяет контент. Заголовки, кейсы и schema.org живут в DOM до загрузки Three.js — индексация иммерсивного сайта сохраняется.",
  },
  {
    id: "score",
    index: "03",
    title: "Одна камера, одна смета",
    body: "Creative development без эстафеты отделов: сцена, шейдер и копирайт пишутся одним юнитом. Метрика фиксируется до релиза, не после вау.",
  },
];
