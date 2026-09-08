import { About } from './components/About'
import { Contact } from './components/Contact'
import { AmbientGrooves } from './components/effects/AmbientGrooves'
import { Intro } from './components/effects/Intro'
import { PointerRing } from './components/effects/PointerRing'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Interests } from './components/Interests'
import { Navbar } from './components/Navbar'
import { ProjectsSection } from './components/ProjectsSection'
import { Skills } from './components/Skills'
import { Timeline } from './components/Timeline'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Salta al contenuto
      </a>
      <AmbientGrooves />
      <PointerRing />
      <Intro />
      <Navbar />
      <main id="main">
        <Hero />
        <ProjectsSection />
        <About />
        <Timeline />
        <Skills />
        <Interests />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
