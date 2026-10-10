import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Linkedin, FileDown, Mail, Code2, ExternalLink } from "lucide-react";
import photo from "@/assets/caio.jpg.asset.json";
import { scrollState } from "@/lib/scroll";
import RocketFallback from "@/components/RocketFallback";

const RocketScene = lazy(() => import("@/components/RocketScene"));

const GITHUB = "https://github.com/iwankiwdossantoscaio-cloud";
const LINKEDIN = "https://www.linkedin.com/in/caio-iwankiw-dos-santos-0b40b439a";
const EMAIL = "mailto:seu-email@exemplo.com"; // placeholder
const CV = "#"; // placeholder PDF

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caio Iwankiw dos Santos — Engenharia de Software" },
      { name: "description", content: "Portfólio de Caio Iwankiw dos Santos, estudante de Engenharia de Software em Curitiba e região." },
      { property: "og:title", content: "Caio Iwankiw dos Santos — Portfólio" },
      { property: "og:description", content: "Trajetória, formação, projetos e tecnologias de um estudante de Engenharia de Software." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WORDS: Record<string, string> = {
  inicio: "CAIO", ignicao: "IGNIÇÃO", formacao: "FORMAÇÃO", projetos: "PROJETOS",
  experiencia: "EXPERIÊNCIA", tecnologias: "STACK", hoje: "HOJE",
};

const PROJECTS: { name: string; desc: string; tech: string[]; code?: string; demo?: string }[] = [
  { name: "ReputAí", desc: "Plataforma de avaliação de empresas, com RLS e reforço de segurança.", tech: ["React", "TypeScript", "Vite", "Supabase", "Tailwind", "shadcn/ui"] },
  { name: "MatchCV", desc: "Matchmaking candidato–vaga com currículo ATS e dados locais no navegador.", tech: ["JavaScript", "LocalStorage"] },
  { name: "Nexus", desc: "Assistente em HTML com notas, tags e chat com IA.", tech: ["HTML", "CSS", "JavaScript", "IA"] },
  { name: "Chat com IA", desc: "Chat com IA com login e agenda.", tech: ["Java", "Spring Boot"] },
];

const TECH = ["C", "JavaScript", "TypeScript", "Python", "SQL", "HTML", "CSS", "React", "Java / Spring Boot", "Git / GitHub", "Excel avançado"];

function Btn({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const ext = href.startsWith("http");
  return (
    <a
      href={href}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
        primary ? "bg-primary text-primary-foreground" : "glass-card text-foreground"
      }`}
    >
      {children}
    </a>
  );
}

function Label({ n, children }: { n: string; children: React.ReactNode }) {
  return <p className="reveal font-mono text-xs uppercase tracking-[0.25em] text-accent">{n} · {children}</p>;
}

function Index() {
  const [mode, setMode] = useState<"pending" | "3d" | "2d">("pending");
  const [word, setWord] = useState("CAIO");
  const [alt, setAlt] = useState(0);
  const [prog, setProg] = useState(0);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    let gl = false;
    try { gl = !!document.createElement("canvas").getContext("webgl2"); } catch { gl = false; }
    const t = setTimeout(() => setMode(reduced || weak || !gl ? "2d" : "3d"), 300);

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      start: 0, end: "max", scrub: true,
      onUpdate: (s) => {
        scrollState.progress = s.progress;
        setAlt(Math.round(Math.max(0, (s.progress - 0.1) / 0.9) * 10000));
        setProg(s.progress);
        if (wordRef.current) wordRef.current.style.transform = `translateX(${-s.progress * 20}%)`;
      },
    });

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), i * 80));
          const w = WORDS[(e.target as HTMLElement).id];
          if (w) setWord(w);
        }
      }),
      { threshold: 0.25 },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => { clearTimeout(t); st.kill(); io.disconnect(); };
  }, []);

  return (
    <>
      {/* sky */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-30 bg-sky transition-opacity" style={{ opacity: Math.min(prog * 1.3, 1) * 0.8 }} />
      {/* giant word */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 flex items-center overflow-hidden">
        <div ref={wordRef} className="ghost-word pl-[5vw] text-[28vw] md:text-[22vw]">{word}</div>
      </div>
      {/* rocket */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {mode === "3d" && <Suspense fallback={null}><RocketScene /></Suspense>}
        {mode === "2d" && <RocketFallback />}
      </div>

      {/* altimeter */}
      <div className="fixed right-4 top-4 z-20 font-mono text-[11px] tracking-widest text-muted-foreground md:right-8 md:top-8">
        <div>ALT {alt.toLocaleString("pt-BR")} m</div>
        <div className="mt-1 h-px w-28 bg-border"><div className="h-px bg-accent" style={{ width: `${prog * 100}%` }} /></div>
      </div>

      <main className="relative mx-auto max-w-6xl px-5 md:px-10">
        {/* HERO */}
        <section id="inicio" className="flex min-h-svh flex-col justify-center gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">T-0 · Plataforma de lançamento</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">Caio Iwankiw<br />dos Santos</h1>
            <p className="mt-5 text-lg text-muted-foreground">Estudante de Engenharia de Software · Curitiba e região</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={GITHUB} primary><Github size={18} />GitHub</Btn>
              <Btn href={LINKEDIN}><Linkedin size={18} />LinkedIn</Btn>
              <Btn href={CV}><FileDown size={18} />Baixar currículo</Btn>
              <Btn href="#hoje"><Mail size={18} />Contato</Btn>
            </div>
            <a href="#formacao" className="mt-6 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4">Pular animação ↓</a>
          </div>
          <img src={photo.url} alt="Foto de Caio Iwankiw dos Santos sentado em um sofá cinza" className="aspect-[3/4] w-48 rounded-2xl object-cover shadow-2xl md:w-72" />
        </section>

        <section id="ignicao" className="flex min-h-svh items-center py-24">
          <div className="max-w-lg">
            <Label n="01">Ignição</Label>
            <h2 className="reveal mt-4 font-display text-4xl font-black md:text-6xl">14 anos, por curiosidade.</h2>
            <p className="reveal glass-card mt-6 p-6 text-lg">Comecei a programar criando um jogo sobre feudalismo na Roblox para um trabalho da escola.</p>
          </div>
        </section>

        <section id="formacao" className="flex min-h-svh items-center py-24">
          <div className="ml-auto max-w-xl">
            <Label n="02">Decolagem</Label>
            <h2 className="reveal mt-4 font-display text-4xl font-black md:text-6xl">Formação</h2>
            <ul className="mt-6 space-y-3">
              {[
                ["Engenharia de Software", "UniSENAI PR · cursando"],
                ["Ensino médio", "Colégio Adventista · concluído em 2025"],
                ["CS50", "Harvard / edX"],
                ["Construa seu primeiro App com IA · Excel Avançado", "Santander Open Academy"],
                ["Administração", "Microlins · 2018–2020"],
              ].map(([a, b]) => (
                <li key={a} className="reveal glass-card p-4"><p className="font-semibold">{a}</p><p className="text-sm text-muted-foreground">{b}</p></li>
              ))}
            </ul>
            <p className="reveal mt-4 text-sm text-muted-foreground">Base em matemática discreta, complexidade de algoritmos, lógica de programação e engenharia de requisitos.</p>
          </div>
        </section>

        <section id="projetos" className="min-h-svh py-24">
          <Label n="03">Propulsão</Label>
          <h2 className="reveal mt-4 font-display text-4xl font-black md:text-6xl">Projetos</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PROJECTS.map((p) => (
              <article key={p.name} className="reveal glass-card flex flex-col p-6">
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <p className="mt-2 text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tech.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 font-mono text-xs">{t}</span>)}
                </div>
                {(p.code || p.demo) && (
                  <div className="mt-5 flex gap-3">
                    {p.code && <Btn href={p.code}><Code2 size={16} />Código</Btn>}
                    {p.demo && <Btn href={p.demo}><ExternalLink size={16} />Demo</Btn>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="experiencia" className="flex min-h-[80svh] items-center py-24">
          <div className="max-w-lg">
            <Label n="04">Experiência</Label>
            <div className="reveal glass-card mt-6 p-6">
              <h3 className="font-display text-2xl font-bold">Jovem Aprendiz · Administrativo</h3>
              <p className="text-sm text-muted-foreground">Jacomar</p>
              <p className="mt-3">Lançamento de notas fiscais e DANFEs em planilhas Excel.</p>
            </div>
          </div>
        </section>

        <section id="tecnologias" className="flex min-h-[80svh] items-center py-24">
          <div className="ml-auto max-w-xl">
            <Label n="05">Tecnologias</Label>
            <div className="mt-6 flex flex-wrap gap-2">
              {TECH.map((t) => <span key={t} className="reveal glass-card px-4 py-2 font-mono text-sm">{t}</span>)}
            </div>
          </div>
        </section>

        <section id="hoje" className="flex min-h-svh items-end pb-24 pt-[45svh]">
          <div className="max-w-2xl">
            <Label n="06">Hoje · Órbita</Label>
            <h2 className="reveal mt-4 font-display text-4xl font-black leading-tight md:text-6xl">Cursando Engenharia de Software e buscando oportunidade em desenvolvimento.</h2>
            <p className="reveal mt-4 text-lg text-muted-foreground">Estágio ou Jovem Aprendiz.</p>
            <div className="reveal mt-8 flex flex-wrap gap-3">
              <Btn href={GITHUB} primary><Github size={18} />GitHub</Btn>
              <Btn href={LINKEDIN}><Linkedin size={18} />LinkedIn</Btn>
              <Btn href={EMAIL}><Mail size={18} />E-mail (placeholder)</Btn>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 text-center font-mono text-xs text-muted-foreground">© Caio Iwankiw dos Santos</footer>
    </>
  );
}
