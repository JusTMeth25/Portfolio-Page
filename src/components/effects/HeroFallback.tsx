/**
 * Composizione SVG originale usata su schermi piccoli, quando WebGL non è
 * disponibile, quando il contesto viene perso o mentre la scena 3D si carica.
 * Stessa idea della scena: un vinile inclinato, con solchi e orbite.
 */
export function HeroFallback() {
  const grooves = [148, 134, 120, 106, 92, 78, 64]

  return (
    <svg
      className="hero-fallback"
      viewBox="0 0 520 480"
      role="img"
      aria-label="Illustrazione di un disco in vinile inclinato, circondato da due orbite"
      focusable="false"
    >
      <defs>
        <radialGradient id="hf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.26" />
          <stop offset="60%" stopColor="#2196f3" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#2196f3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hf-disc" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#18242d" />
          <stop offset="55%" stopColor="#0a1116" />
          <stop offset="100%" stopColor="#060b0f" />
        </linearGradient>
        <linearGradient id="hf-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="45%" stopColor="#f3f2ed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="250" r="200" fill="url(#hf-glow)" />

      {/* Orbite */}
      <ellipse
        cx="260"
        cy="250"
        rx="212"
        ry="86"
        fill="none"
        stroke="#22d3ee"
        strokeOpacity="0.4"
      />
      <ellipse
        cx="260"
        cy="250"
        rx="168"
        ry="150"
        fill="none"
        stroke="#2196f3"
        strokeOpacity="0.26"
        transform="rotate(-20 260 250)"
      />
      <circle cx="472" cy="250" r="5" fill="#22d3ee" />
      <circle cx="150" cy="140" r="4" fill="#2196f3" />

      {/* Spessore del disco */}
      <ellipse cx="260" cy="264" rx="176" ry="66" fill="#05090c" />

      {/* Corpo del disco */}
      <ellipse cx="260" cy="256" rx="176" ry="66" fill="url(#hf-disc)" />
      <ellipse
        cx="260"
        cy="256"
        rx="176"
        ry="66"
        fill="none"
        stroke="url(#hf-rim)"
        strokeWidth="2"
      />

      {/* Solchi */}
      <g fill="none" stroke="#8fa6b6">
        {grooves.map((rx, index) => (
          <ellipse
            key={rx}
            cx="260"
            cy="256"
            rx={rx}
            ry={rx * 0.375}
            strokeOpacity={index % 2 === 0 ? 0.16 : 0.08}
          />
        ))}
      </g>
      <ellipse
        cx="260"
        cy="256"
        rx="120"
        ry="45"
        fill="none"
        stroke="#22d3ee"
        strokeOpacity="0.3"
      />

      {/* Etichetta e perno */}
      <ellipse cx="260" cy="256" rx="46" ry="17" fill="#22d3ee" fillOpacity="0.92" />
      <ellipse cx="260" cy="256" rx="5" ry="2" fill="#06222a" />
    </svg>
  )
}
