import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import ThePit from "@/components/ThePit";
import TheTeam from "@/components/TheTeam";
import IdeasLab from "@/components/IdeasLab";
import Newsletters from "@/components/Newsletters";
import FreeTools from "@/components/FreeTools";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative">
        <Hero />
        <About />
        <Projects />
        <ThePit />
        <TheTeam />
        <IdeasLab />
        <Newsletters />
        <FreeTools />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
