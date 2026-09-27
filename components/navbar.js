// components/navbar.js
class CustomNavbar extends HTMLElement {
  connectedCallback() {
    const currentPath = (window.location.pathname || "").toLowerCase();
    const htmlLang = (
      document.documentElement.getAttribute("lang") || ""
    ).toLowerCase();
    const isEnglish = htmlLang.startsWith("en");

    const currentFile = (currentPath.split("/").pop() || "").toLowerCase();
    const profilePage = currentFile === "membro.html" || currentFile === "membro-en.html";
    const pageKey = currentFile.startsWith("membros") ? "membros" : "index";
    const profileKey = new URLSearchParams(window.location.search).get('perfil');
    const profileQuery = profilePage && profileKey ? `?perfil=${encodeURIComponent(profileKey)}` : '';
    const ptUrl = profilePage ? `membro.html${profileQuery}` : pageKey === "membros" ? "membros.html" : "index.html";
    const enUrl = profilePage ? `membro-en.html${profileQuery}` : pageKey === "membros" ? "membros-en.html" : "index-en.html";

    const labels = isEnglish
      ? {
          about: "About",
          areas: "Areas",
          projects: "Projects",
          competitions: "Competitions",
          leadership: "Leadership",
          calendar: "Calendar",
          contact: "Contact",
          members: "Members",
        }
      : {
          about: "Sobre",
          areas: "Áreas",
          projects: "Projetos",
          competitions: "Competições",
          leadership: "Liderança",
          calendar: "Calendário",
          contact: "Contato",
          members: "Membros",
        };

    const isHomePage =
      currentPath.endsWith("/") ||
      currentPath.endsWith("/index.html") ||
      currentPath.endsWith("index.html") ||
      currentPath.endsWith("/index-en.html") ||
      currentPath.endsWith("index-en.html") ||
      currentPath === "";

    const homeHref = isEnglish ? "index-en.html" : "index.html";
    const baseHref = isHomePage ? "" : homeHref;
    const logoHref = isHomePage ? "#" : homeHref;

    const themeControl = `<label class="site-theme-control"><span class="sr-only">${isEnglish ? 'Colour theme' : 'Tema de cor'}</span><select data-theme-select aria-label="${isEnglish ? 'Colour theme' : 'Tema de cor'}"><option value="dark">${isEnglish ? 'Dark' : 'Noturno'}</option><option value="light">${isEnglish ? 'Light' : 'Claro'}</option><option value="system">${isEnglish ? 'System' : 'Sistema'}</option></select></label>`;
    const links = document.body.classList.contains('league-experience') ? [] : [
      [baseHref + '#projects', labels.projects], [baseHref + '#competitions', labels.competitions],
      [baseHref + '#sponsors', isEnglish ? 'Partners' : 'Parcerias'], [baseHref + '#calendar', labels.calendar],
      [isEnglish ? 'membros-en.html' : 'membros.html', labels.members]
    ];
    const languageControl = `<div class="site-language-control"><a href="${ptUrl}" data-lang="pt" ${!isEnglish ? 'aria-current="page"' : ''} aria-label="Português (Brasil)">PT</a><a href="${enUrl}" data-lang="en" ${isEnglish ? 'aria-current="page"' : ''} aria-label="English">EN</a></div>`;
    this.innerHTML = `
      <nav id="navbar" class="site-navigation" aria-label="${isEnglish ? 'Main navigation' : 'Navegação principal'}">
        <div class="site-navigation-bar"><a class="site-navigation-brand" href="${logoHref}" aria-label="Artrobots"><img src="assets/logo_circulo.png" alt="" width="36" height="36" /><span>ARTROBOTS</span></a>
          <div class="desktop-navigation">${links.map(([href,label]) => `<a href="${href}">${label}</a>`).join('')}<a class="site-community-nav" href="https://artrolove.artrobots.tech">ArtroLove ↗</a>${languageControl}${themeControl}</div>
          <button type="button" class="navigation-toggle" aria-controls="mobile-menu" aria-expanded="false" aria-label="${isEnglish ? 'Open menu' : 'Abrir menu'}">${isEnglish ? 'Menu' : 'Menu'} <span aria-hidden="true">☰</span></button>
        </div>
        <div id="mobile-menu" class="site-mobile-menu" hidden>${links.map(([href,label]) => `<a href="${href}">${label}</a>`).join('')}<a href="https://artrolove.artrobots.tech">ArtroLove ↗</a><div class="site-mobile-preferences">${languageControl}${themeControl}</div></div>
      </nav>`;
    const button = this.querySelector('.navigation-toggle');
    const menu = this.querySelector('#mobile-menu');
    function closeMenu() { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); }
    button.addEventListener('click', () => { menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    this.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeMenu(); button.focus(); } });
    if (globalThis.ArtrobotsTheme?.apply) globalThis.ArtrobotsTheme.apply(globalThis.ArtrobotsTheme.read());

    // Persist manual language choice
    this.querySelectorAll("a[data-lang]").forEach((link) => {
      link.addEventListener("click", () => {
        try {
          localStorage.setItem(
            "artrobots_lang",
            link.getAttribute("data-lang")
          );
        } catch {
          // ignore
        }
      });
    });

    // Add scroll effect
    window.addEventListener("scroll", function () {
      const navbar = document.getElementById("navbar");
      if (navbar && window.scrollY > 100) {
        navbar.classList.add("shadow-lg");
      } else if (navbar) {
        navbar.classList.remove("shadow-lg");
      }
    });
  }
}

customElements.define("custom-navbar", CustomNavbar);
