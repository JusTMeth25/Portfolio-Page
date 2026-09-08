import { About } from './components/About'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
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
      <Navbar />
      <main id="main">
        <Hero />
        <ProjectsSection />
        <About />
        <Timeline />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
