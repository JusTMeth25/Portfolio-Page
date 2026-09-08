/**
 * Composizione SVG originale usata quando WebGL non è disponibile,
 * quando il contesto viene perso o mentre la scena 3D si carica.
 * Riprende la stessa idea: piani intersecati, nodi e orbite.
 */
export function HeroFallback() {
  return (
    <svg
      className="hero-fallback"
      viewBox="0 0 520 480"
      role="img"
      aria-label="Illustrazione astratta di tre strati software collegati fra loro"
      focusable="false"
    >
      <defs>
        <linearGradient id="hf-plane-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="hf-plane-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2196f3" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#2196f3" stopOpacity="0.03" />
        </linearGradient>
        <radialGradient id="hf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="260" cy="240" r="190" fill="url(#hf-glow)" />

      <ellipse
        cx="260"
        cy="240"
        rx="196"
        ry="74"
        fill="none"
        stroke="#22d3ee"
        strokeOpacity="0.35"
      />
      <ellipse
        cx="260"
        cy="240"
        rx="150"
        ry="120"
        fill="none"
        stroke="#2196f3"
        strokeOpacity="0.28"
        transform="rotate(-18 260 240)"
      />

      <g strokeWidth="1.4">
        <polygon
          points="260,86 428,164 260,242 92,164"
          fill="url(#hf-plane-a)"
          stroke="#22d3ee"
          strokeOpacity="0.75"
        />
        <polygon
          points="260,164 452,252 260,340 68,252"
          fill="url(#hf-plane-b)"
          stroke="#22d3ee"
          strokeOpacity="0.6"
        />
        <polygon
          points="260,262 428,340 260,418 92,340"
          fill="url(#hf-plane-a)"
          stroke="#22d3ee"
          strokeOpacity="0.5"
        />
      </g>

      <g stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1">
        <line x1="260" y1="164" x2="260" y2="340" />
        <line x1="176" y1="205" x2="344" y2="299" />
        <line x1="344" y1="205" x2="176" y2="299" />
      </g>

      <g fill="#22d3ee">
        <circle cx="260" cy="164" r="4.5" />
        <circle cx="260" cy="252" r="5" />
        <circle cx="260" cy="340" r="4.5" />
        <circle cx="176" cy="205" r="3" />
        <circle cx="344" cy="299" r="3" />
      </g>
      <g fill="#2196f3">
        <circle cx="344" cy="205" r="3" />
        <circle cx="176" cy="299" r="3" />
        <circle cx="452" cy="252" r="3.5" />
        <circle cx="68" cy="252" r="3.5" />
      </g>
    </svg>
  )
}
