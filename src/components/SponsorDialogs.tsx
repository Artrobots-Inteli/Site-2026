import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export function SponsorDialogs({ english, open, onClose }: { english: boolean; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      previousFocus?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div id="sponsorModal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 is-open" role="dialog" aria-modal="true" aria-labelledby="sponsorModalTitle" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialogRef}>
      <div className="bg-white text-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button id="closeSponsorModal" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onClick={onClose} aria-label={english ? "Close" : "Fechar"}>
          <Icon name="x" className="w-8 h-8" />
        </button>
        <div className="p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-display text-primary" id="sponsorModalTitle">
            {english ? " Why Sponsor Us? " : " Por que Patrocinar a Gente? "}
          </h2>
          <p className="text-center text-gray mb-8 max-w-2xl mx-auto">
            {english ? " See how your company can benefit from supporting Artrobots. " : " Descubra como sua empresa pode se beneficiar ao apoiar a Artrobots. "}
          </p>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-secondary">
              <h3 className="text-2xl font-bold mb-3 text-primary">
                {english ? "Who We Are" : "Quem Somos"}
              </h3>
              <p>
                {english ? " We are Artrobots — a team passionate about technology, innovation, and learning. Our goal is to build robotics projects that challenge creativity and engineering limits, compete in events, and promote hands-on learning among our members. " : " Somoos a Artrobots, uma equipe apaixonada por tecnologia, inovação e aprendizado. Nosso objetivo é desenvolver projetos de robótica que desafiem os limites da criatividade e da engenharia, participando de competições e promovendo o aprendizado prático entre nossos membros. "}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-accent">
              <h3 className="text-2xl font-bold mb-3 text-primary">
                {english ? "What We Do" : " O Que Fazemos "}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Icon name="check-circle" className="w-5 h-5 mr-2 text-accent flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Robotics Projects:" : "Projetos de Robótica:"}
                    </strong>
                    {english ? " We build robots for competitions and technical challenges." : " Desenvolvemos robôs para competições e desafios técnicos."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="check-circle" className="w-5 h-5 mr-2 text-accent flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Education & Training:" : "Educação e Treinamento:"}
                    </strong>
                    {english ? " We provide workshops and training for our members and the community." : " Oferecemos workshops e treinamentos para nossos membros e a comunidade."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="check-circle" className="w-5 h-5 mr-2 text-accent flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Competing:" : "Participação em Competições:"}
                    </strong>
                    {english ? " We represent our institution in major robotics events such as RSM and RoboChallenge." : " Representamos nossa instituição em eventos de destaque no cenário da robótica como RSM e RoboChallenge."}
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-secondary to-purple p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-3">
                {english ? "Visibility We Offer" : "Visibilidade Oferecida"}
              </h3>
              <p className="mb-4">
                {english ? "By sponsoring Artrobots, your brand gets:" : "Ao patrocinar a Artrobots, sua marca terá:"}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Icon name="award" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Robot exposure:" : "Exposição no Robô:"}
                    </strong>
                    {english ? " Your logo displayed prominently on robots used in competitions." : " Sua logo será exibida em destaque nos robôs utilizados em competições."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="user" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Team shirts:" : "Camisetas Personalizadas:"}
                    </strong>
                    {english ? " Your logo on official Artrobots shirts." : " A logo da sua empresa estará presente nas camisetas oficiais da Artrobots."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="share-2" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Social media:" : "Redes Sociais:"}
                    </strong>
                    {english ? " Promotion on our social channels, including Instagram (artrobots.inteli) and LinkedIn." : " Divulgação em nossas redes sociais, incluindo Instagram(artrobots.inteli) e LinkedIn."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="calendar" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Events:" : "Eventos:"}
                    </strong>
                    {english ? " Brand presence on banners and promotional materials at events we attend." : " Presença da sua marca em banners e materiais de divulgação nos eventos que participamos."}
                  </span>
                </li>
                <li className="flex items-start">
                  <Icon name="file-text" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {english ? "Marketing materials:" : "Materiais de Divulgação:"}
                    </strong>
                    {english ? " Your logo included in flyers, presentations, and other promotional materials." : " Inclusão da logo em panfletos, apresentações e outros materiais promocionais."}
                  </span>
                </li>
              </ul>
            </div>
            <div className="text-center pt-4">
              <a href="#contact" id="modalContactBtn" className="bg-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 inline-flex items-center" onClick={onClose}>
                {english ? " Contact us " : " Entre em Contato "}
                <Icon name="mail" className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
