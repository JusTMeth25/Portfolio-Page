import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { startAtTop } from './lib/scrollRestoration'
import './styles/global.css'

// Prima del render: così il browser non fa in tempo a rimettere lo scroll
// dov'era e non si vede alcun salto.
startAtTop()

const container = document.getElementById('root')

if (!container) {
  throw new Error('Elemento #root non trovato in index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
