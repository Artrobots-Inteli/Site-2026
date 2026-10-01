import { useEffect, useState } from 'react';
import { homeSlides } from '../data/home-slides';
import { Icon } from './Icon';

export function AboutCarousel({ english }: { english: boolean }) {
  const slides = homeSlides[english ? 'en' : 'pt'];
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const slide = slides[index];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChanged = () => setReducedMotion(media.matches);
    const visibilityChanged = () => setHidden(document.hidden);
    motionChanged();
    visibilityChanged();
    media.addEventListener('change', motionChanged);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      media.removeEventListener('change', motionChanged);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || hovered || focused || hidden || !autoplay) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, hovered, focused, hidden, autoplay, slides.length, index]);

  return (
    <section id="about" className="py-20 bg-primary">
      <div className="container mx-auto safe-container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-display">
          {english ? 'ABOUT US' : 'SOBRE NÓS'}
        </h2>
        <div
          id="aboutCarousel"
          className="grid lg:grid-cols-12 gap-8 items-start"
          role="region"
          aria-roledescription={english ? 'carousel' : 'carrossel'}
          aria-label={english ? 'About Artrobots' : 'Sobre a Artrobots'}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          <div className="lg:col-span-7 relative">
            <div className="rounded-lg overflow-hidden border border-secondary bg-dark">
              <img id="aboutMedia" src={slide.src} alt={slide.alt} className="w-full h-[420px] md:h-[520px] object-cover" loading="lazy" />
            </div>
            <button id="aboutPrev" type="button" aria-label={english ? 'Previous media' : 'Mídia anterior'} onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-dark border border-secondary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:bg-opacity-20 transition">
              <Icon name="chevron-left" />
            </button>
            <button id="aboutNext" type="button" aria-label={english ? 'Next media' : 'Próxima mídia'} onClick={() => setIndex((current) => (current + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-dark border border-secondary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:bg-opacity-20 transition">
              <Icon name="chevron-right" />
            </button>
            <button type="button" onClick={() => setAutoplay((current) => !current)} className="sr-only focus:not-sr-only focus:absolute focus:bottom-3 focus:left-3 bg-dark text-white rounded px-3 py-2">
              {autoplay ? (english ? 'Pause slideshow' : 'Pausar carrossel') : (english ? 'Play slideshow' : 'Reproduzir carrossel')}
            </button>
          </div>
          <div className="lg:col-span-5">
            <h3 id="aboutTitle" className="text-2xl font-bold mb-4 text-white">{slide.title}</h3>
            <p id="aboutText" className="text-gray mb-6 leading-relaxed">{slide.text}</p>
            <div className="grid grid-cols-3 gap-3">
              {slides.map((item, slideIndex) => (
                <button key={item.src} type="button" data-about-index={slideIndex} aria-pressed={index === slideIndex} onClick={() => setIndex(slideIndex)} className={`about-thumb text-left border border-secondary rounded-lg overflow-hidden bg-dark hover:bg-secondary hover:bg-opacity-20 transition${index === slideIndex ? ' ring-2 ring-accent' : ''}`}>
                  <img src={item.src} alt={item.alt} className="w-full h-24 object-cover" loading="lazy" />
                  <span className="block text-xs px-2 py-2 text-gray">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <a href="#contact" className="bg-accent hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 inline-flex items-center">
                {english ? 'Talk to the team' : 'Falar com a equipe'} <Icon name="message-circle" className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
