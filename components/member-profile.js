class ArtrobotsMemberProfile extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.english = document.documentElement.lang.startsWith('en');
    this.directory = this.english ? 'membros-en.html' : 'membros.html';
    this.key = new URLSearchParams(location.search).get('perfil');
    this.status = this.element('p', '', 'text-gray-300');
    this.status.setAttribute('role', 'status');
    this.content = this.element('div');
    this.retry = this.element('button', this.english ? 'Try again' : 'Tentar novamente', 'mt-6 rounded-lg border border-secondary px-4 py-2');
    this.retry.type = 'button';
    this.retry.hidden = true;
    this.retry.addEventListener('click', () => this.load());
    this.append(this.status, this.content, this.retry);
    this.load();
  }
  element(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  async load() {
    this.retry.hidden = true;
    this.content.replaceChildren();
    this.status.textContent = this.english ? 'Loading profile…' : 'Carregando perfil…';
    if (!ArtrobotsPublicMembers.validSiteKey(this.key)) {
      this.status.textContent = this.english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
      return;
    }
    try {
      const origin = ArtrobotsPublicMembers.configuredOrigin(document, location);
      if (origin) {
        const feed = await ArtrobotsPublicMembers.loadFeed(origin);
        const state = ArtrobotsPublicMembers.profileState(feed, this.key);
        if (state.kind === 'connected') {
          this.status.textContent = this.english ? 'Opening profile…' : 'Abrindo perfil…';
          location.replace(`${origin}${state.member.profilePath}${this.english ? '?lang=en' : ''}`);
          return;
        }
        if (state.kind === 'withdrawn') {
          this.status.textContent = this.english ? 'This profile is not publicly available.' : 'Este perfil não está disponível publicamente.';
          return;
        }
      }
      const response = await fetch(this.directory, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Directory unavailable');
      const source = new DOMParser().parseFromString(await response.text(), 'text/html');
      const cards = [...source.querySelectorAll('[data-site-key]')].filter((card) => card.dataset.siteKey === this.key);
      if (!cards.length) {
        this.status.textContent = this.english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
        return;
      }
      const records = cards.map((card) => ({
        name: card.querySelector('h3')?.textContent?.trim(),
        photo: card.querySelector('img')?.getAttribute('src'),
        position: card.querySelector('p')?.textContent?.trim(),
        team: card.closest('[data-legacy-team]')?.querySelector('h2')?.textContent?.trim(),
        teamId: card.closest('[data-legacy-team]')?.id,
      }));
      const first = records[0];
      // Multiple historical appearances belong together only with the exact same public identity.
      if (!first.name || !first.photo || records.some((item) => item.name !== first.name || item.photo !== first.photo || !item.position || !item.team || !item.teamId)) throw new Error('Conflicting public identity');
      const photoUrl = new URL(first.photo, location.href);
      if (photoUrl.origin !== location.origin || !first.photo.startsWith('assets/')) throw new Error('Invalid local photo');
      const heading = this.element('div', undefined, 'member-profile-heading');
      const photo = this.element('img');
      photo.src = photoUrl.href; photo.alt = first.name; photo.width = 96; photo.height = 96;
      photo.className = 'member-profile-photo';
      photo.addEventListener('error', () => { photo.hidden = true; });
      const title = this.element('div');
      title.append(this.element('p', this.english ? 'ARTROBOTS COMMUNITY' : 'COMUNIDADE ARTROBOTS', 'text-sm text-light mb-2'), this.element('h1', first.name, 'text-4xl font-bold font-display'));
      heading.append(photo, title);
      const history = this.element('ul', undefined, 'member-profile-history');
      for (const record of records) {
        const item = this.element('li');
        const link = this.element('a', record.team, 'text-light font-bold');
        link.href = `${this.directory}#${encodeURIComponent(record.teamId)}`;
        item.append(link, this.element('p', record.position, 'mt-2 text-gray-300'));
        history.append(item);
      }
      this.content.append(heading, this.element('h2', this.english ? 'On the club website' : 'No site do clube', 'text-xl font-bold'), this.element('p', this.english ? 'Public information from our member directory. Current project participation is shown when this profile is connected to ArtroLove.' : 'Informações públicas do nosso diretório de membros. A participação atual em projetos aparece quando este perfil é conectado à ArtroLove.', 'mt-3 text-gray-400'), history);
      document.title = `${first.name} - Artrobots`;
      this.status.textContent = '';
    } catch {
      // Without a fresh feed, a withdrawn association cannot safely fall back to an old card.
      this.status.textContent = this.english ? 'We could not load this profile. Please try again.' : 'Não foi possível carregar este perfil. Tente novamente.';
      this.retry.hidden = false;
    }
  }
}
customElements.define('artrobots-member-profile', ArtrobotsMemberProfile);
