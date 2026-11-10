import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { Manifest } from "@/components/sections/Manifest";
import { Work } from "@/components/sections/Work";
import { Practices } from "@/components/sections/Practices";
import { Process } from "@/components/sections/Process";
import { Studio } from "@/components/sections/Studio";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { NoscriptFallback } from "@/components/seo/NoscriptFallback";
import { WorldCanvas } from "@/components/three/WorldCanvas";

export default function Home() {
  return (
    <>
      <JsonLd />
      <WorldCanvas />
      <Header />
      <main id="main" className="relative z-10">
        <Hero />
        <Marquee />
        <Manifest />
        <Work />
        <Practices />
        <Process />
        <Studio />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <NoscriptFallback />
    </>
  );
}
