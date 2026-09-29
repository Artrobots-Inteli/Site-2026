import { useEffect, useRef, useState } from 'react';
import { AboutCarousel } from '../components/AboutCarousel';
import { Icon } from '../components/Icon';
import { SiteContent } from '../components/SiteContent';
import { SponsorDialogs } from '../components/SponsorDialogs';
import { MemberCard } from '../components/MemberCard';
import { usePublicMembers } from '../hooks/usePublicMembers';
import { orderedLeadership } from '../lib/public-members';

/** Published home content, preserving the two existing languages and section anchors. */
export function HomePage({ english }: { english: boolean }) {
  const { feed: membersFeed, origin: membersOrigin, status: membersStatus, retry: retryMembers } = usePublicMembers();
  const currentLeadership = orderedLeadership(membersFeed?.members ?? []);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [contactRequested, setContactRequested] = useState(false);
  const sponsorsRef = useRef<HTMLDivElement>(null);
  const [sponsorsScrollable, setSponsorsScrollable] = useState(false);
  useEffect(() => {
    const container = sponsorsRef.current;
    if (!container) return;
    const measure = () => setSponsorsScrollable(Boolean(container.querySelector('[data-kind="PARTNERSHIP"]')) && container.scrollWidth > container.clientWidth + 2);
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resize?.observe(container);
    if (container.firstElementChild) resize?.observe(container.firstElementChild);
    // The CMS owns its React subtree. Observe the dimensions/content only;
    // control visibility and disabled state remain React state.
    const content = new MutationObserver(measure);
    content.observe(container, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    container.addEventListener('load', measure, true);
    measure();
    return () => {
      resize?.disconnect();
      content.disconnect();
      window.removeEventListener('resize', measure);
      container.removeEventListener('load', measure, true);
    };
  }, []);
  const scrollSponsors = (left: number) => {
    sponsorsRef.current?.scrollBy({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <>
      <section className="brand-hero" aria-labelledby="home-title">
        <div className="container mx-auto brand-hero-layout">
          <div className="brand-hero-copy">
            <p className="brand-eyebrow">
              {"INTELI / ROBOTICS"}
            </p>
            <h1 id="home-title">
              {"ARTROBOTS"}
            </h1>
            <p className="brand-hero-subtitle">
              {english ? "Inteli Robotics Club" : "Clube de Robótica do Inteli"}
            </p>
            <div className="brand-hero-actions">
              <a href={english ? "membros-en.html" : "membros.html"} className="brand-button brand-button-primary">
                {english ? "Members " : "Membros "}
                <Icon name="arrow-up-right" />
              </a>
              <a href="#projects" className="brand-button brand-button-secondary">
                {english ? "Projects " : "Projetos "}
                <Icon name="arrow-down" />
              </a>
            </div>
            <a href="https://artrolove.artrobots.tech" className="brand-community-link">
              <img src="assets/artrolove-spider.png" alt="" width="48" height="39" />
              {" ArtroLove "}
              <Icon name="arrow-up-right" />
            </a>
          </div>
          <div className="brand-hero-mark" aria-hidden="true">
            <img src="assets/logo_circulo.png" alt="" width="752" height="754" fetchPriority="high" />
          </div>
        </div>
      </section>
      <AboutCarousel english={english} />
      <section id="areas" className="py-20 bg-dark">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-display">
            {english ? " TEAM AREAS " : " ÁREAS DA EQUIPE "}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary p-6 rounded-lg hover:bg-secondary hover:bg-opacity-20 transition duration-300 border border-secondary">
              <div className="bg-secondary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Icon name="cpu" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {english ? "Computing" : "Computação"}
              </h3>
              <p className="text-gray-300">
                {english ? "Computing develops robot logic, computer vision, and artificial intelligence." : "Computação desenvolve a lógica dos robôs, visão computacional e inteligência artificial."}
              </p>
            </div>
            <div className="bg-primary p-6 rounded-lg hover:bg-secondary hover:bg-opacity-20 transition duration-300 border border-secondary">
              <div className="bg-secondary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Icon name="zap" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {english ? "Electrical" : "Elétrica"}
              </h3>
              <p className="text-gray-300">
                {english ? "Electrical designs and builds electronic circuits and power systems." : "Elétrica projeta e implementa circuitos eletrônicos e sistemas de potência."}
              </p>
            </div>
            <div className="bg-primary p-6 rounded-lg hover:bg-secondary hover:bg-opacity-20 transition duration-300 border border-secondary">
              <div className="bg-secondary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Icon name="tool" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {english ? "Mechanical" : "Mecânica"}
              </h3>
              <p className="text-gray-300">{english ? "Mechanical designs and builds structures and motion systems." : "Mecânica projeta e fabrica estruturas e sistemas de movimento."}</p>
            </div>
            <div className="bg-primary p-6 rounded-lg hover:bg-secondary hover:bg-opacity-20 transition duration-300 border border-secondary">
              <div className="bg-secondary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Icon name="share-2" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {"Marketing"}
              </h3>
              <p className="text-gray-300">{english ? "Outreach, fundraising, and social media management." : "Divulgação do clube, captação de recursos e gestão de redes sociais."}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="projects" className="py-20 bg-primary">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-display">
            {english ? " PROJECTS IN DEVELOPMENT " : " PROJETOS EM DESENVOLVIMENTO "}
          </h2>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            {english ? " Discover the projects currently being developed by the Artrobots team this semester " : " Conheça os projetos que estão sendo desenvolvidos pela equipe Artrobots este semestre "}
          </p>
          <SiteContent kind="PROJECT" english={english} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto" />
          <div className="text-center mt-12">
            <a href={english ? "membros-en.html" : "membros.html"} className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-2xl">
              <Icon name="users" className="w-5 h-5" />
              {english ? " See Teams and Members " : " Ver Equipes e Membros "}
            </a>
          </div>
        </div>
      </section>
      <section id="competitions" className="py-20 bg-dark">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-display">
            {english ? " COMPETITIONS " : " COMPETIÇÕES "}
          </h2>
          <SiteContent kind="COMPETITION" english={english} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto" />
        </div>
      </section>
      <section id="sponsors" className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('/assets/inteliescada.webp')] bg-cover bg-center animate-pulse" />
        </div>
        <div className="container mx-auto safe-container relative">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gradient-animated">
            {english ? " OUR PARTNERS " : " NOSSOS PARCEIROS "}
          </h2>
          <div className="sponsors-container w-full overflow-x-auto pb-4" ref={sponsorsRef}>
            <SiteContent kind="PARTNERSHIP" english={english} className="sponsors-grid inline-flex gap-12 px-4" />
          </div>
          <div className="flex justify-center mt-8" hidden={!sponsorsScrollable} style={{ display: sponsorsScrollable ? undefined : 'none' }}>
            <button type="button" disabled={!sponsorsScrollable} aria-label={english ? "Previous partners" : "Parceiros anteriores"} className="sponsors-scroll-left bg-secondary bg-opacity-50 hover:bg-opacity-100 text-white p-3 rounded-full mr-4 transition-all duration-300 transform hover:scale-110" onClick={() => scrollSponsors(-300)}>
              <span aria-hidden="true">
                {"←"}
              </span>
            </button>
            <button type="button" disabled={!sponsorsScrollable} aria-label={english ? "Next partners" : "Próximos parceiros"} className="sponsors-scroll-right bg-secondary bg-opacity-50 hover:bg-opacity-100 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110" onClick={() => scrollSponsors(300)}>
              <span aria-hidden="true">
                {"→"}
              </span>
            </button>
          </div>
          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button id="openSponsorModal" className="bg-secondary hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 inline-flex items-center justify-center" onClick={() => setSponsorOpen(true)}>
              {english ? " Why sponsor? " : " Por que patrocinar? "}
              <Icon name="help-circle" className="ml-2" />
            </button>
            <a href="#contact" className="bg-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 inline-flex items-center justify-center">
              {english ? " Become a partner " : " Seja nosso parceiro "}
              <Icon name="briefcase" className="ml-2" />
            </a>
          </div>
        </div>
      </section>
      <section id="leadership" className="py-20 bg-primary">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-display">
            {english ? " LEADERSHIP " : " LIDERANÇA "}
          </h2>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            {english ? " Meet the board that leads the club and coordinates our projects " : " Conheça a diretoria que lidera o clube e coordena nossos projetos "}
          </p>
          {membersStatus === 'error' ? <div className="text-center text-gray-300" role="status">
            <p>{english ? 'Leadership is temporarily unavailable.' : 'A diretoria está temporariamente indisponível.'}</p>
            <button type="button" onClick={retryMembers} className="mt-4 rounded-lg border border-secondary px-4 py-2">{english ? 'Try again' : 'Tentar novamente'}</button>
          </div> : membersStatus === 'loading' ? <p className="text-center text-gray-300" role="status">{english ? 'Loading leadership…' : 'Carregando diretoria…'}</p>
            : currentLeadership.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto member-profile-grid" data-current-leadership="">
              {currentLeadership.map(member => <MemberCard key={member.id} member={member} origin={membersOrigin} english={english} color="#855EDE" />)}
            </div> : <p className="text-center text-gray-300" role="status">{english ? 'No leadership profiles are published yet.' : 'Ainda não há perfis de diretoria publicados.'}</p>}          <div className="text-center mt-12">
            <a href={english ? "membros-en.html" : "membros.html"} className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-secondary px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-2xl">
              <Icon name="users" className="w-6 h-6" />
              {english ? " See Members " : " Ver Membros "}
            </a>
          </div>
        </div>
      </section>
      <section id="calendar" className="py-20 bg-dark">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-display">
            {english ? " CALENDAR " : " CALENDÁRIO "}
          </h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            {english ? " Follow our upcoming events, competitions, and meetings " : " Acompanhe nossos próximos eventos, competições e reuniões "}
          </p>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-accent p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {english ? "CLUB AGENDA" : "AGENDA DO CLUBE"}
                </h3>
              </div>
              <SiteContent kind="EVENT" english={english} className="p-6 space-y-4" />
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-20 bg-dark">
        <div className="container mx-auto safe-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-display">
            {english ? " CONTACT " : " CONTATO "}
          </h2>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <h3 className="text-xl font-bold mb-4">
                {english ? "Get in touch" : "Entre em contato"}
              </h3>
              <p className="text-gray-300 mb-6">
                {english ? " Interested in sponsoring us, collaborating, or just learning more about our work? Send us a message! " : " Tem interesse em nos patrocinar, colaborar ou apenas saber mais sobre nosso trabalho? Mande uma mensagem! "}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icon name="mail" className="text-secondary mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      {"Email"}
                    </h4>
                    <p className="text-gray-300"><a href="mailto:artrobots@inteli.edu.br" className="hover:text-secondary transition">artrobots@inteli.edu.br</a></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Icon name="instagram" className="text-secondary mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      {"Instagram"}
                    </h4>
                    <a href="https://instagram.com/artrobots.inteli" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent transition">
                      {" instagram.com/artrobots.inteli "}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Icon name="map-pin" className="text-secondary mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      {english ? "Location" : "Localização"}
                    </h4>
                    <p className="text-gray-300">
                      {english ? " Inteli - Institute of Technology and Leadership " : " Inteli - Instituto de Tecnologia e Liderança "}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Icon name="clock" className="text-secondary mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      {english ? "Hours" : "Horários"}
                    </h4>
                    <p className="text-gray-300">
                      {english ? "Mon–Fri, 10:00–18:00" : "Segunda a sexta, 10h às 18h"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); setContactRequested(true); }}>
                <div>
                  <label htmlFor="name" className="block mb-2">
                    {english ? "Name" : "Nome"}
                  </label>
                  <input type="text" id="name" className="w-full bg-primary text-white border border-gray rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2">
                    {"Email"}
                  </label>
                  <input type="email" id="email" className="w-full bg-primary text-white border border-gray rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2">
                    {english ? "Message" : "Mensagem"}
                  </label>
                  <textarea id="message" rows={4} className="w-full bg-primary text-white border border-gray rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <button type="submit" className="bg-secondary hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 inline-flex items-center">
                  {english ? " Send message " : " Enviar mensagem "}
                  <Icon name="send" className="ml-2" />
                </button>
                {contactRequested && <p role="status">{english ? "This form does not send messages yet. Please use one of the contacts listed alongside it." : "Este formulário ainda não envia mensagens. Utilize um dos contatos indicados ao lado."}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>
      <SponsorDialogs english={english} open={sponsorOpen} onClose={() => setSponsorOpen(false)} />
    </>
  );
}
