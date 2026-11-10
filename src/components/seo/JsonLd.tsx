import { site } from "@/data/site";
import { faq } from "@/data/faq";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { reasons } from "@/data/reasons";

export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: "ru-RU",
        publisher: { "@id": `${site.url}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.legalName,
        legalName: site.legalName,
        url: site.url,
        description: site.description,
        email: site.email,
        sameAs: [site.telegram, site.github],
        copyrightHolder: { "@id": `${site.url}/#org` },
        founder: { "@id": `${site.url}/#person` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#service`,
        name: site.legalName,
        url: site.url,
        description: site.description,
        email: site.email,
        areaServed: "Worldwide",
        serviceType: services.map((item) => item.title),
        parentOrganization: { "@id": `${site.url}/#org` },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        url: site.url,
        jobTitle: "Creative developer / WebGL director",
        worksFor: { "@id": `${site.url}/#org` },
        description: site.description,
        email: site.email,
        sameAs: [site.telegram, site.github],
        knowsAbout: [
          "WebGL",
          "React Three Fiber",
          "immersive websites",
          "creative development",
          "Three.js",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}/#page`,
        url: site.url,
        name: site.title,
        description: site.description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#org` },
        copyrightHolder: { "@id": `${site.url}/#org` },
      },
      {
        "@type": "ItemList",
        "@id": `${site.url}/#reasons`,
        name: "Почему AX1S_TEAM для иммерсивного 3D-сайта",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: reasons.length,
        itemListElement: reasons.map((reason, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: reason.title,
          description: reason.body,
        })),
      },
      ...projects.map((project) => ({
        "@type": "CreativeWork",
        "@id": `${site.url}/#work-${project.id}`,
        name: project.title,
        dateCreated: project.year,
        description: `${project.task} ${project.result} ${project.metric}`,
        author: { "@id": `${site.url}/#org` },
        creator: { "@id": `${site.url}/#org` },
        copyrightHolder: { "@id": `${site.url}/#org` },
        image: `${site.url}${project.image}`,
        keywords: project.stack.join(", "),
      })),
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
