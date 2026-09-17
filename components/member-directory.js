// Public snapshots only. This component never accesses an authenticated endpoint.
class ArtrobotsMemberDirectory extends HTMLElement {
  connectedCallback() {
    this.english = document.documentElement.lang.startsWith('en');
    this.render();
    this.load();
  }

  element(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  render() {
    this.replaceChildren();
    const heading = this.element('h2', this.english ? 'MEMBERS OF OUR COMMUNITY' : 'MEMBROS DA NOSSA COMUNIDADE', 'text-3xl font-bold font-display mb-3');
    const subtitle = this.element('p', this.english ? 'Profiles reviewed by the club board, connected to ArtroLove.' : 'Perfis revisados pela diretoria do clube, conectados à ArtroLove.', 'text-gray-300 mb-6');
    this.status = this.element('p', '', 'text-sm text-gray-400 mb-4');
    this.status.setAttribute('role', 'status');
    this.grid = this.element('div', undefined, 'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5');
    this.retry = this.element('button', this.english ? 'Try again' : 'Tentar novamente', 'mt-4 rounded-lg border border-secondary px-4 py-2 text-sm');
    this.retry.type = 'button';
    this.retry.hidden = true;
    this.retry.addEventListener('click', () => this.load());
    this.append(heading, subtitle, this.status, this.grid, this.retry);
  }

  async load() {
    this.retry.hidden = true;
    this.grid.replaceChildren();
    const configured = document.querySelector('meta[name="artrolove-public-origin"]')?.content?.trim();
    const local = ['localhost', '127.0.0.1'].includes(location.hostname);
    const origin = configured || (local ? 'http://127.0.0.1:3107' : '');
    if (!origin) {
      this.hidden = true; // Deployment has not connected the authoritative source yet.
      return;
    }
    this.hidden = false;
    this.status.textContent = this.english ? 'Loading member profiles…' : 'Carregando perfis de membros…';
    try {
      const base = new URL(origin);
      if (base.origin !== origin || base.username || base.password || !(base.protocol === 'https:' || local && base.origin === 'http://127.0.0.1:3107')) throw new Error('Invalid configured origin');
      const response = await fetch(`${base.origin}/api/public/members`, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (!Array.isArray(data.members)) throw new Error('Invalid feed');
      const fragment = document.createDocumentFragment();
      for (const member of data.members) {
        if (typeof member.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(member.id) || typeof member.name !== 'string' || typeof member.position !== 'string' || typeof member.description !== 'string' || member.photoPath !== `/api/public/members/${member.id}/photo`) throw new Error('Invalid profile');
        const card = this.element('article', undefined, 'member-card rounded-2xl border border-secondary/40 bg-primary p-5 text-center');
        card.dataset.publicProfileId = member.id;
        const photo = this.element('img');
        photo.src = `${base.origin}${member.photoPath}`;
        photo.alt = member.name;
        photo.width = 128; photo.height = 128;
        photo.loading = 'lazy'; photo.referrerPolicy = 'no-referrer';
        photo.className = 'mx-auto mb-4 h-32 w-32 rounded-full object-cover border-4 border-secondary';
        photo.addEventListener('error', () => { photo.hidden = true; });
        card.append(photo, this.element('h3', member.name, 'text-lg font-bold'), this.element('p', member.position, 'mt-1 text-light font-semibold text-sm'), this.element('p', member.description, 'mt-3 text-sm text-gray-300 whitespace-pre-wrap break-words'));
        fragment.append(card);
      }
      this.grid.append(fragment);
      this.status.textContent = data.members.length ? '' : this.english ? 'New profiles will appear here after board review.' : 'Novos perfis aparecerão aqui após a revisão da diretoria.';
    } catch {
      this.status.textContent = this.english ? 'Connected profiles are temporarily unavailable. The existing directory remains below.' : 'Os perfis conectados estão temporariamente indisponíveis. O diretório existente continua abaixo.';
      this.retry.hidden = false;
    }
  }
}
customElements.define('artrobots-member-directory', ArtrobotsMemberDirectory);
