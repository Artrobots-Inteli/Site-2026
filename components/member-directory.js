// Public snapshots replace legacy cards only through an explicit board-approved siteKey.
class ArtrobotsMemberDirectory extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
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
    this.status = this.element('p', '', 'text-sm text-gray-400 mb-4');
    this.status.setAttribute('role', 'status');
    this.retry = this.element('button', this.english ? 'Try again' : 'Tentar novamente', 'mb-8 rounded-lg border border-secondary px-4 py-2 text-sm');
    this.retry.type = 'button';
    this.retry.hidden = true;
    this.retry.addEventListener('click', () => this.load());
    this.append(this.status, this.retry);
    this.sections = {};
    const labels = this.english ? {
      leadership: ['CLUB LEADERSHIP', 'Members leading the club today.', '#F59E0B'],
      projects: ['PROJECT MEMBERS', 'Members contributing to an active project.', '#855EDE'],
      community: ['COMMUNITY', 'Members without an active project allocation, with a place in our community.', '#AED6F1'],
    } : {
      leadership: ['DIRETORIA', 'Membros que conduzem o clube hoje.', '#F59E0B'],
      projects: ['MEMBROS EM PROJETOS', 'Membros que contribuem com um projeto em andamento.', '#855EDE'],
      community: ['COMUNIDADE', 'Membros sem alocação em projeto ativo, com espaço na nossa comunidade.', '#AED6F1'],
    };
    for (const group of ArtrobotsPublicMembers.groups) {
      const [title, description, color] = labels[group];
      const section = this.element('section', undefined, 'team-section connected-member-section');
      section.dataset.directoryGroup = group;
      section.style.setProperty('--team-color', color);
      section.hidden = true;
      const header = this.element('div', undefined, 'team-header');
      const icon = this.element('div', undefined, 'member-section-icon');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = group === 'leadership' ? '✦' : group === 'projects' ? '⌘' : '○';
      const text = this.element('div');
      text.append(this.element('h2', title, 'text-3xl font-bold font-display'), this.element('p', description, 'text-gray-400 text-sm mt-1'));
      header.append(icon, text);
      const grid = this.element('div', undefined, 'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5');
      section.append(header, grid);
      this.sections[group] = { section, grid };
      if (group === 'leadership') document.querySelector('[data-legacy-directory]')?.prepend(section);
      else if (group === 'projects') {
        const firstProject = document.querySelector('[data-legacy-directory] [data-legacy-project]');
        if (firstProject) firstProject.before(section);
        else this.before(section);
      } else this.append(section);
    }
  }
  card(member, origin) {
    const card = this.element('a', undefined, 'member-card connected-member-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border overflow-hidden text-center p-5');
    card.dataset.publicProfileId = member.id;
    card.href = `${origin}${member.profilePath}${this.english ? '?lang=en' : ''}`;
    card.setAttribute('aria-label', this.english ? `View ${member.name}'s profile` : `Ver perfil de ${member.name}`);
    const frame = this.element('div', undefined, 'w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4');
    const photo = this.element('img');
    photo.src = `${origin}${member.photoPath}`;
    photo.alt = member.name;
    photo.width = 96; photo.height = 96;
    photo.loading = 'lazy'; photo.referrerPolicy = 'no-referrer';
    photo.className = 'member-photo w-full h-full object-cover';
    photo.addEventListener('error', () => { photo.hidden = true; });
    frame.append(photo);
    card.append(frame, this.element('h3', member.name, 'font-bold text-base leading-tight mb-0.5'), this.element('p', member.position, 'connected-member-position text-xs font-semibold'), this.element('p', member.description, 'mt-3 text-sm text-gray-300 whitespace-pre-wrap break-words'), this.element('span', this.english ? 'View profile →' : 'Ver perfil →', 'member-profile-label'));
    return card;
  }
  async load() {
    this.retry.hidden = true;
    this.status.textContent = this.english ? 'Loading members…' : 'Carregando membros…';
    try {
      const origin = ArtrobotsPublicMembers.configuredOrigin(document, location);
      if (!origin) { this.status.textContent = ''; return; }
      const data = await ArtrobotsPublicMembers.loadFeed(origin);
      const fragments = Object.fromEntries(ArtrobotsPublicMembers.groups.map((group) => [group, document.createDocumentFragment()]));
      for (const member of data.members) fragments[member.directoryGroup].append(this.card(member, origin));
      // Validate/build everything before changing the existing directory.
      const linked = new Set(data.linkedSiteKeys);
      for (const card of document.querySelectorAll('[data-legacy-directory] [data-site-key]')) card.hidden = linked.has(card.dataset.siteKey);
      for (const section of document.querySelectorAll('[data-legacy-directory] [data-legacy-team]')) {
        section.hidden = [...section.querySelectorAll('[data-site-key]')].every((card) => card.hidden);
      }
      for (const group of ArtrobotsPublicMembers.groups) {
        const { section, grid } = this.sections[group];
        grid.replaceChildren(fragments[group]);
        section.hidden = !grid.children.length;
      }
      this.status.textContent = '';
    } catch {
      this.status.textContent = this.english ? 'Some member profiles could not be loaded. Please try again.' : 'Não foi possível carregar alguns perfis. Tente novamente.';
      this.retry.hidden = false;
    }
  }
}
customElements.define('artrobots-member-directory', ArtrobotsMemberDirectory);
