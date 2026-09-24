import styles from './FireworksArt.module.css';

/** One burst: rays radiating from a centre, in brand colours. */
function Burst({ cx, cy, r, rays, color, delay, dot }) {
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = (i / rays) * Math.PI * 2;
    const inner = r * 0.28;
    return {
      x1: cx + Math.cos(angle) * inner,
      y1: cy + Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * r,
      y2: cy + Math.sin(angle) * r,
      tipX: cx + Math.cos(angle) * (r + 7),
      tipY: cy + Math.sin(angle) * (r + 7),
    };
  });
  return (
    <g className={styles.burst} style={{ animationDelay: `${delay}s`, transformOrigin: `${cx}px ${cy}px` }}>
      {lines.map((l, i) => (
        <g key={i}>
          <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx={l.tipX} cy={l.tipY} r="2.6" fill={dot} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r * 0.12} fill={dot} />
    </g>
  );
}

/** Decorative night-sky fireworks for the home hero. Plays once; respects reduced motion. */
export default function FireworksArt() {
  return (
    <svg className={styles.art} viewBox="0 0 520 440" role="img" aria-label="Fireworks bursting over the night sky">
      <Burst cx={300} cy={150} r={110} rays={28} color="#f5a300" dot="#ffe29a" delay={0} />
      <Burst cx={130} cy={110} r={70} rays={20} color="#ff4f8b" dot="#ffd0e0" delay={0.35} />
      <Burst cx={420} cy={300} r={62} rays={18} color="#5ee0c1" dot="#d7fff4" delay={0.6} />
      <Burst cx={170} cy={300} r={46} rays={14} color="#c8102e" dot="#ffb3b3" delay={0.85} />
      <path d="M300 440 C 300 360, 296 300, 300 262" stroke="rgba(245,163,0,0.5)" strokeWidth="2" strokeDasharray="4 7" fill="none" />
      <path d="M170 440 C 168 400, 172 370, 170 346" stroke="rgba(200,16,46,0.45)" strokeWidth="2" strokeDasharray="4 7" fill="none" />
    </svg>
  );
}
