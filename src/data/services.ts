export type Service = {
  id: string;
  index: string;
  title: string;
  outcome: string;
  body: string;
  stack: string[];
};

export const services: Service[] = [
  {
    id: "immersive",
    index: "01",
    title: "Иммерсивный сайт",
    outcome: "Сессия, которую не закрывают на первом экране",
    body: "Одна среда, камера, сценарий. Типографика живёт в DOM, 3D несёт бренд. Результат — время, глубина, запоминаемость. Не «анимация ради анимации».",
    stack: ["Next.js", "R3F", "GSAP", "Lenis"],
  },
  {
    id: "relic",
    index: "02",
    title: "Объект бренда",
    outcome: "Идентичность, которую нельзя свести к PNG",
    body: "WebGL-форма с характером: morph, drag, свет. Её можно собрать, расплавить, инвертировать. Она остаётся узнаваемой в любом состоянии.",
    stack: ["Three.js", "GLSL", "Draco", "Meshopt"],
  },
  {
    id: "campaign",
    index: "03",
    title: "Кампания с механикой",
    outcome: "Вовлечение, которое измеряется",
    body: "Запуск, где жест пользователя меняет смысл кадра. Частицы, сборка, progressive disclosure. Метрика заранее, не «посмотрим после».",
    stack: ["WebGL", "ScrollTrigger", "аналитика"],
  },
  {
    id: "index",
    index: "04",
    title: "Прод, который индексируется",
    outcome: "Canvas не съедает поиск",
    body: "Семантический дубль, schema.org, LCP и INP в бюджете. 3D подгружается после первого пейнта. Слабые устройства получают спокойный кадр, не пустоту.",
    stack: ["SSR/SSG", "JSON-LD", "Core Web Vitals"],
  },
];
