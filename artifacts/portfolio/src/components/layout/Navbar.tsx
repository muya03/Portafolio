import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Menu, X } from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/i18n';

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const NAV_LINKS = t.nav;
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Scroll detection for background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      const current = sections.find(section => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate active indicator
  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex(link => link.href === `#${activeSection}`);
    const activeEl = navRefs.current[activeIndex];
    const indicator = indicatorRef.current;

    if (activeEl && indicator) {
      animate(indicator, {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        duration: 400,
        ease: 'outElastic(1, .8)'
      });
    }
  }, [activeSection, lang]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <a 
          href="#inicio" 
          onClick={(e) => handleLinkClick(e, '#inicio')}
          className="text-xl font-display font-bold tracking-wider z-50 relative flex items-center gap-2 group"
        >
          <span className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_hsl(var(--primary))]"></span>
          M. AL HOWAIDI
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center relative">
          <div ref={indicatorRef} className="absolute bottom-0 h-0.5 bg-primary rounded-full" />
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              ref={el => { navRefs.current[i] = el; }}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === link.href.substring(1) 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </a>
          ))}

          <LanguageSwitcher lang={lang} setLang={setLang} className="ml-4" />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 lg:hidden z-50 relative">
          <LanguageSwitcher lang={lang} setLang={setLang} />
          <button
            className="text-foreground"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 glass-panel flex flex-col items-center justify-center transition-transform duration-500 lg:hidden ${
          isMobileOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`text-2xl font-display font-medium py-4 ${
                activeSection === link.href.substring(1) ? 'text-primary' : 'text-foreground'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher({
  lang,
  setLang,
  className = '',
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  className?: string;
}) {
  const options: Lang[] = ['es', 'va', 'ar', 'en'];
  return (
    <div
      className={`flex items-center rounded-sm border border-border overflow-hidden text-xs font-bold ${className}`}
      role="group"
      aria-label="Language"
    >
      {options.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 uppercase tracking-wider transition-colors ${
            lang === code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
