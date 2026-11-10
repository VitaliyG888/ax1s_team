export type Project = {
  id: string;
  index: string;
  title: string;
  year: string;
  task: string;
  mechanic: string;
  result: string;
  metric: string;
  stack: string[];
  image: string;
  imageAlt: string;
  essence: string;
};

export const projects: Project[] = [
  {
    id: "melt-atelier",
    index: "01",
    title: "Melt Atelier",
    year: "2026",
    task: "Дому одежды нужен был не каталог, а ритуал примерки в браузере: ткань должна была вести себя как память, а не как jpeg.",
    mechanic:
      "Текучесть формы. Модель платья морфирует в следующий силуэт по скроллу — эластичный переход вместо слайдера.",
    result:
      "Покупатель остаётся внутри одной сцены. Артикул читается как состояние материи, не как карточка.",
    metric: "+41% времени на карточке",
    stack: ["Next.js", "R3F", "GSAP", "Shopify Hydrogen"],
    image: "/cases/melt-atelier.svg",
    imageAlt:
      "AX1S_TEAM, кейс Melt Atelier: тающая 3D-форма платья на тёмном поле, WebGL-морфинг силуэта",
    essence: "Dali / текучесть",
  },
  {
    id: "horizon-lie",
    index: "02",
    title: "Horizon Lie",
    year: "2026",
    task: "Архитектурному бюро не хватало масштаба: рендеры выглядели как открытки, участок — как макет из коробки.",
    mechanic:
      "Подмена масштаба. Камера при скролле выворачивает здание из сувенира в ландшафт; горизонт врёт намеренно.",
    result:
      "Глубина каталога выросла: посетитель дочитывает участок, потому что не понимает, где кончается модель.",
    metric: "2.3× глубина просмотра",
    stack: ["Three.js", "Lenis", "WebGL2", "CMS"],
    image: "/cases/horizon-lie.svg",
    imageAlt:
      "AX1S_TEAM, кейс Horizon Lie: ложный горизонт и смена масштаба архитектурного объёма",
    essence: "Magritte / масштаб",
  },
  {
    id: "lost-rider",
    index: "03",
    title: "Lost Rider",
    year: "2025",
    task: "Музыкальному лейблу нужна была идентичность, которую нельзя украсть одним PNG. Логотип должен был уметь распадаться.",
    mechanic:
      "Фрагментация. 3D-марка разлетается в осколки и собирается жестом; каждый релиз — новая сборка той же кости.",
    result:
      "Узнаваемость в слепом тесте выросла. Слушатель помнит не цвет, а поведение знака.",
    metric: "+28% recall марки",
    stack: ["R3F", "GLSL", "Web Audio", "Next.js"],
    image: "/cases/lost-rider.svg",
    imageAlt:
      "AX1S_TEAM, кейс Lost Rider: фрагментированная 3D-марка лейбла в момент сборки",
    essence: "Magritte / осколки",
  },
  {
    id: "night-shade",
    index: "04",
    title: "Night Shade",
    year: "2025",
    task: "Lookbook модного дома читался днём и умирал ночью: свет был иллюстрацией, а не персонажем.",
    mechanic:
      "Двойственность света. Drag реликвии инвертирует ключ; hover меняет сущность кадра — день становится обвинением.",
    result:
      "Заявки с lookbook перестали быть случайными. Свет запомнил жест пользователя.",
    metric: "+18% заявок с lookbook",
    stack: ["R3F", "shaders", "GSAP ScrollTrigger"],
    image: "/cases/night-shade.svg",
    imageAlt:
      "AX1S_TEAM, кейс Night Shade: инвертированный свет lookbook, драматическая 3D-сцена",
    essence: "Dali / тень",
  },
];
