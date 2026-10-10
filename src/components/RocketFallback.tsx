import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll";

export default function RocketFallback() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = scrollState.progress;
      if (ref.current) {
        const y = (1 - Math.min(p / 0.85, 1)) * 60;
        ref.current.style.transform = `translate(-50%, ${y}vh)`;
        const f = ref.current.querySelector<SVGGElement>("#flame");
        if (f) f.style.opacity = p > 0.1 && p < 0.95 ? "1" : "0";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 100 220" aria-hidden className="absolute left-1/2 top-[8vh] h-[34vh] w-auto">
      <g id="flame" style={{ transition: "opacity .4s" }}>
        <path d="M38 170 Q50 220 62 170 Z" fill="#ff7a1a" />
        <path d="M44 170 Q50 200 56 170 Z" fill="#ffd23f" />
      </g>
      <path d="M50 10 C70 40 72 90 68 170 H32 C28 90 30 40 50 10 Z" fill="#fff" stroke="#0a0a0a" strokeWidth="2" />
      <path d="M50 10 C60 25 64 38 65 50 H35 C36 38 40 25 50 10 Z" fill="#e2342b" />
      <circle cx="50" cy="85" r="10" fill="#3b82f6" stroke="#0a0a0a" strokeWidth="2" />
      <path d="M32 130 L14 170 H32 Z M68 130 L86 170 H68 Z" fill="#e2342b" stroke="#0a0a0a" strokeWidth="2" />
    </svg>
  );
}
