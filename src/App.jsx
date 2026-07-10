import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import FactsStrip from "./components/FactsStrip.jsx";
import Work from "./components/Work.jsx";
import Assistant from "./components/Assistant.jsx";
import Darkroom from "./components/Darkroom.jsx";
import Studio from "./components/Studio.jsx";
import Badge from "./components/Badge.jsx";
import ContactTV from "./components/ContactTV.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <FactsStrip />
        <Work />
        <Assistant />
        <Darkroom />
        <Studio />
        <Badge />
        <ContactTV />
      </main>
      <Footer />
    </>
  );
}
