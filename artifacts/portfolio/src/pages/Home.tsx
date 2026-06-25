import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";
import { HeroScene } from "../components/canvas/HeroScene";
import { Navbar } from "../components/layout/Navbar";
import { useLanguage } from "../lib/i18n";
import { FileText, Github, Linkedin, Mail, ExternalLink, ChevronRight, MapPin, Download } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SKILL_ICONS = [
  <FileText size={24} />,
  <Github size={24} />,
  <ExternalLink size={24} />,
  <Linkedin size={24} />,
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    // Force dark mode context explicitly
    document.documentElement.classList.add('dark');

    // Scope every GSAP animation/ScrollTrigger to this component for clean teardown
    const ctx = gsap.context(() => {
      // Global section reveals
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.fromTo(section,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 80%" }
          }
        );
      });

      // Section titles slide in
      gsap.utils.toArray<HTMLElement>('.section-title').forEach((title) => {
        gsap.fromTo(title,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: title, start: "top 85%" }
          }
        );
      });

      // PIN: hero headline stays fixed and fades out as the first viewport scrolls away
      const heroContent = document.querySelector<HTMLElement>('.hero-content');
      if (heroContent) {
        gsap.to(heroContent, {
          y: -60, opacity: 0, ease: "none",
          scrollTrigger: {
            trigger: "#inicio",
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: heroContent,
            pinSpacing: false,
          }
        });
      }

      // PARALLAX layers: elements drift at their own speed while scrolling
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const distance = parseFloat(el.dataset.parallax || "60");
        gsap.fromTo(el,
          { y: -distance },
          {
            y: distance, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
          }
        );
      });

      // STAGGERED cinematic entrances for grouped items
      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        gsap.fromTo(items,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.09,
            scrollTrigger: { trigger: group, start: "top 82%" }
          }
        );
      });

      // ANIMATED COUNTERS (Anime.js) fire once when scrolled into view
      document.querySelectorAll<HTMLElement>('.counter').forEach((el) => {
        const target = parseFloat(el.dataset.count || "0");
        const suffix = el.dataset.suffix || "";
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            const obj = { v: 0 };
            animate(obj, {
              v: target,
              duration: 1800,
              ease: "out(3)",
              onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
            });
          },
        });
      });
    }, containerRef);

    // TYPING EFFECT (Anime.js) on the hero subtitle
    const typed = document.getElementById('hero-typed');
    if (typed) {
      const full = typed.textContent || "";
      typed.textContent = "";
      const obj = { n: 0 };
      animate(obj, {
        n: full.length,
        duration: 1500,
        delay: 350,
        ease: "linear",
        onUpdate: () => { typed.textContent = full.slice(0, Math.round(obj.n)); },
      });
    }

    // RIPPLE micro-interaction (Anime.js) on primary buttons
    const onRipple = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLElement>('.btn-ripple');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement('span');
      circle.className = 'ripple';
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(circle);
      animate(circle, {
        scale: [0, 1],
        opacity: [0.5, 0],
        duration: 600,
        ease: "outExpo",
        onComplete: () => circle.remove(),
      });
    };
    document.addEventListener('click', onRipple);

    // Cleanup — scoped revert avoids killing unrelated ScrollTriggers
    return () => {
      ctx.revert();
      document.removeEventListener('click', onRipple);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen selection:bg-primary/30 selection:text-primary">
      <div className="bg-noise" />
      <Navbar />

      {/* 1. HERO SECTION */}
      <section id="inicio" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        {/* Overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background z-0" />
        
        <div className="hero-content container relative z-10 px-6 md:px-12 flex flex-col items-start justify-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-wide">
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-none mb-6">
            MOHAMED<br/>
            <span className="text-gradient">AL HOWAIDI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mb-10 border-l-2 border-primary pl-4">
            <span id="hero-typed" key={lang}>{t.hero.typed}</span><span className="caret" aria-hidden="true">|</span><br/>
            <span className="text-sm md:text-base opacity-80 mt-2 block">
              {t.hero.tagline}
            </span>
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <a href="#contacto" className="btn-ripple px-8 py-4 bg-primary text-primary-foreground font-bold rounded-sm hover:scale-105 transition-transform shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              {t.hero.contact}
            </a>
            <a href={`${import.meta.env.BASE_URL}cv-mohamed-al-howaidi.pdf`} download className="btn-ripple flex items-center gap-2 px-8 py-4 border border-primary/50 text-primary font-bold rounded-sm hover:bg-primary/10 transition-colors">
              <Download className="w-5 h-5" />
              {t.hero.downloadCv}
            </a>
            <a href="https://github.com/muya03" target="_blank" rel="noreferrer" className="p-4 border border-border rounded-sm hover:bg-white/5 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/mohamedalhowaidi/" target="_blank" rel="noreferrer" className="p-4 border border-border rounded-sm hover:bg-white/5 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10 animate-bounce">
          <span className="text-xs tracking-[0.2em] uppercase">{t.scroll}</span>
          <div className="w-px h-8 bg-gradient-to-b from-foreground to-transparent" />
        </div>
      </section>

      {/* 2. SOBRE MÍ */}
      <section id="sobre-mi" className="py-24 relative reveal-section">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl font-display font-bold mb-12 flex items-center gap-4">
            <span className="w-8 h-px bg-primary hidden md:block" />
            {t.about.title}
          </h2>

          <div data-stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {t.about.stats.map((stat) => (
              <div key={stat.label} className="glass-panel p-6 rounded-sm border border-white/5">
                <div
                  className="counter text-4xl md:text-5xl font-display font-black text-gradient"
                  data-count={stat.count}
                  data-suffix={stat.suffix}
                >
                  0{stat.suffix}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
              {t.about.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="[&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
              
              <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {t.about.info.map(item => (
                  <div key={item.label} className="border-l border-primary/30 pl-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
                    <div className="font-medium text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="aspect-square md:aspect-[4/5] relative rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 glass-panel">
                <img 
                  src={`${import.meta.env.BASE_URL}photos/photo-campus.jpeg`} 
                  alt={t.about.photoAlt} 
                  className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 opacity-80"
                />
                <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
                <div data-parallax="40" className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPERIENCIA */}
      <section id="experiencia" className="py-24 bg-card/30 relative reveal-section border-y border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl font-display font-bold mb-16 flex items-center gap-4">
            <span className="w-8 h-px bg-primary hidden md:block" />
            {t.experience.title}
          </h2>

          <div data-stagger className="space-y-12 border-l border-border/50 ml-2 md:ml-6">
            {t.experience.items.map((job, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 group">
                {/* Timeline Dot */}
                <div className="absolute w-3 h-3 bg-background border border-primary rounded-full -left-[6.5px] top-2 group-hover:bg-primary transition-colors shadow-[0_0_10px_hsl(var(--primary)/0)] group-hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {job.role} <span className="text-primary">@ {job.company}</span>
                  </h3>
                  <span className="text-sm font-mono text-muted-foreground mt-1 md:mt-0 tracking-tight">
                    {job.date}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-light">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CAPACIDADES */}
      <section id="capacidades" className="py-24 relative reveal-section">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl font-display font-bold mb-16 flex items-center gap-4">
            <span className="w-8 h-px bg-primary hidden md:block" />
            {t.skills.title}
          </h2>

          <div data-stagger className="grid md:grid-cols-2 gap-6">
            {t.skills.items.map((skillGroup, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-sm hover:border-primary/30 transition-colors group">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-sm group-hover:scale-110 transition-transform">
                    {SKILL_ICONS[idx]}
                  </div>
                  {skillGroup.title}
                </h3>
                <p className="text-muted-foreground mb-6 font-light">
                  {skillGroup.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-sm hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROYECTOS */}
      <section id="proyectos" className="py-24 bg-card/30 relative reveal-section border-y border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="section-title text-4xl md:text-5xl font-display font-bold flex items-center gap-4">
              <span className="w-8 h-px bg-primary hidden md:block" />
              {t.projects.title}
            </h2>
            <a href="https://github.com/muya03" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-white transition-colors group">
              {t.projects.viewMore}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div data-stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.projects.items.map((project, idx) => (
              <a 
                key={idx} 
                href={project.link} 
                target="_blank" 
                rel="noreferrer"
                className="group block glass-panel rounded-sm border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 text-primary z-10">
                  <ExternalLink size={20} />
                </div>

                {project.image && (
                  <div className="w-full aspect-video overflow-hidden border-b border-border">
                    <img
                      src={`${import.meta.env.BASE_URL}${project.image}`}
                      alt={project.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3 font-light">
                    {project.description}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="text-xs font-mono text-primary/80">{project.tech}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REPRESENTACIÓN ESTUDIANTIL */}
      <section id="representacion" className="py-24 relative reveal-section">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl font-display font-bold mb-16 flex items-center gap-4">
            <span className="w-8 h-px bg-primary hidden md:block" />
            {t.representation.title}
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
               <div className="aspect-[4/3] relative rounded-sm overflow-hidden glass-panel group">
                <img 
                  src={`${import.meta.env.BASE_URL}photos/photo-stage.jpg`} 
                  alt={t.representation.stageAlt} 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-1/2 aspect-square rounded-sm overflow-hidden glass-panel hidden md:block border-4 border-background">
                <img 
                  src={`${import.meta.env.BASE_URL}photos/photo-podium.jpg`} 
                  alt={t.representation.podiumAlt} 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-muted-foreground font-light">
                {t.representation.intro}
              </p>
              
              <ul className="space-y-4 pt-4">
                {t.representation.roles.map((role, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground/90">{role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FORMACIÓN Y LOGROS (Merged) */}
      <section id="formacion" className="py-24 bg-card/30 relative reveal-section border-y border-border/50">
        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16">
          
          {/* Educación */}
          <div>
             <h2 className="text-3xl font-display font-bold mb-10 flex items-center gap-4">
              {t.education.title}
            </h2>
            <div className="space-y-6">
              {t.education.items.map((item, i) => (
                <div
                  key={i}
                  className={`glass-panel p-6 border-l-2 ${i === 0 ? 'border-primary' : 'border-primary/40'}`}
                >
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logros */}
          <div>
            <h2 className="text-3xl font-display font-bold mb-10 flex items-center gap-4">
              {t.achievements.title}
            </h2>
            <ul className="space-y-4">
              {t.achievements.items.map((logro, i) => (
                <li key={i} className="flex gap-4 items-baseline pb-4 border-b border-white/5 last:border-0">
                  <span className="font-mono text-primary text-sm font-bold">{logro.year}</span>
                  <span className="text-foreground/80">{logro.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* 8. APARICIONES EN MEDIOS */}
      <section id="medios" className="py-24 relative reveal-section">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl font-display font-bold mb-12 flex items-center gap-4">
            <span className="w-8 h-px bg-primary hidden md:block" />
            {t.media.title}
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl font-light">
            {t.media.intro}
          </p>

          <div data-stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.media.items.map((media, idx) => (
              <a 
                key={idx} 
                href={media.url}
                target="_blank"
                rel="noreferrer" 
                className="p-4 glass-panel border border-white/5 hover:border-primary/40 transition-colors group flex flex-col gap-2"
              >
                <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">{media.outlet}</span>
                <span className="text-sm text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                  {media.title}
                </span>
                {media.originalTitle && (
                  <span className="text-xs text-muted-foreground/70 italic line-clamp-2 max-h-0 overflow-hidden opacity-0 group-hover:max-h-10 group-hover:opacity-100 transition-all duration-300">
                    {media.originalTitle}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACTO / FOOTER */}
      <footer id="contacto" className="relative border-t border-border pt-24 pb-12 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-[2/1] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6">
            {t.contact.title}
          </h2>
          <p className="text-xl text-muted-foreground font-light mb-12 max-w-xl mx-auto">
            {t.contact.intro}
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-24">
            <a href="mailto:mohamed.alhowaidi@gmail.com" className="flex items-center gap-3 px-6 py-3 glass-panel hover:bg-white/5 transition-colors w-full md:w-auto justify-center">
              <Mail className="w-5 h-5 text-primary" />
              <span>mohamed.alhowaidi@gmail.com</span>
            </a>
            <a href="tel:+34648492935" className="flex items-center gap-3 px-6 py-3 glass-panel hover:bg-white/5 transition-colors w-full md:w-auto justify-center">
              <span className="text-primary font-bold">{t.contact.phoneLabel}</span>
              <span>648 49 29 35</span>
            </a>
            <a href="https://www.linkedin.com/in/mohamedalhowaidi/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-3 glass-panel hover:bg-white/5 transition-colors w-full md:w-auto justify-center">
              <Linkedin className="w-5 h-5 text-primary" />
              <span>LinkedIn</span>
            </a>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Mohamed Al Howaidi. {t.contact.rights}</p>
            <p className="flex items-center gap-2">
              <MapPin size={14} /> {t.contact.location}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
