import { useState } from 'react'

import { LanguageProvider } from './i18n/LanguageProvider'
import { useI18n } from './i18n/useI18n'
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

function Site() {
  const { profile } = useI18n()
  // Finché l'intro è di scena, gli effetti pesanti restano fermi: un solo
  // carico alla volta, nessuno scatto al primo fotogramma.
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      <a className="skip-link" href="#main">
        {profile.ui.skipToContent}
      </a>
      <AmbientGrooves active={introDone} />
      <PointerRing />
      <Intro onFinish={() => setIntroDone(true)} />
      <Navbar />
      <main id="main">
        <Hero ready={introDone} />
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

export default function App() {
  return (
    <LanguageProvider>
      <Site />
    </LanguageProvider>
  )
}
