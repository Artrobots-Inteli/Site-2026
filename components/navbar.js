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

    this.innerHTML = `
            <nav class="bg-primary bg-opacity-90 backdrop-blur-md fixed top-0 w-full z-40 transition-all duration-300" id="navbar">
                <div class="container mx-auto px-6 py-4">
                    <div class="flex justify-between items-center">
            <a href="${logoHref}" class="flex items-center space-x-3 hover:opacity-80 transition">
                            <img src="assets/logo_circulo.png" alt="Artrobots Logo" class="w-10 h-10" />
                            <span class="text-2xl font-bold text-white font-display">ARTROBOTS</span>
                        </a>
                        <div class="hidden md:flex items-center space-x-8">
              <a href="${baseHref}#about" class="hover:text-accent transition">${
      labels.about
    }</a>
              <a href="${baseHref}#areas" class="hover:text-accent transition">${
      labels.areas
    }</a>
              <a href="${baseHref}#projects" class="hover:text-accent transition">${
      labels.projects
    }</a>
              <a href="${baseHref}#competitions" class="hover:text-accent transition">${
      labels.competitions
    }</a>
              <a href="${baseHref}#leadership" class="hover:text-accent transition">${
      labels.leadership
    }</a>
              <a href="${baseHref}#calendar" class="hover:text-accent transition">${
      labels.calendar
    }</a>
              <a href="${baseHref}#contact" class="hover:text-accent transition">${
      labels.contact
    }</a>

              <a
                href="${isEnglish ? 'membros-en.html' : 'membros.html'}"
                class="bg-secondary hover:bg-purple text-white font-bold py-1.5 px-5 rounded-full transition duration-300 inline-flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ${labels.members}
              </a>

              <div class="inline-flex border border-secondary rounded-full overflow-hidden">
                <a
                  href="${ptUrl}"
                  data-lang="pt"
                  class="px-3 py-1 text-sm font-semibold transition ${
                    !isEnglish
                      ? "bg-secondary text-white"
                      : "text-gray-300 hover:bg-secondary hover:bg-opacity-20"
                  }"
                  aria-label="Português (Brasil)"
                >PT-BR</a>
                <a
                  href="${enUrl}"
                  data-lang="en"
                  class="px-3 py-1 text-sm font-semibold transition ${
                    isEnglish
                      ? "bg-secondary text-white"
                      : "text-gray-300 hover:bg-secondary hover:bg-opacity-20"
                  }"
                  aria-label="English"
                >ENG</a>
              </div>
                        </div>
                        <button class="md:hidden text-white" onclick="toggleMenu()" aria-controls="mobile-menu" aria-expanded="false">
                            <i data-feather="menu"></i>
                        </button>
                    </div>
                    <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 overflow-hidden opacity-0 -translate-y-1 max-h-0 transition-all duration-200 ease-out">
            <a href="${baseHref}#about" class="block py-2 hover:text-accent">${
      labels.about
    }</a>
            <a href="${baseHref}#areas" class="block py-2 hover:text-accent">${
      labels.areas
    }</a>
            <a href="${baseHref}#projects" class="block py-2 hover:text-accent">${
      labels.projects
    }</a>
            <a href="${baseHref}#competitions" class="block py-2 hover:text-accent">${
      labels.competitions
    }</a>
            <a href="${baseHref}#leadership" class="block py-2 hover:text-accent">${
      labels.leadership
    }</a>
            <a href="${baseHref}#calendar" class="block py-2 hover:text-accent">${
      labels.calendar
    }</a>
            <a href="${baseHref}#contact" class="block py-2 hover:text-accent">${
      labels.contact
    }</a>

            <a
              href="${isEnglish ? 'membros-en.html' : 'membros.html'}"
              class="mt-2 inline-flex items-center bg-secondary hover:bg-purple text-white font-bold py-2 px-5 rounded-full transition duration-300 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              ${labels.members}
            </a>

            <div class="mt-4 inline-flex border border-secondary rounded-full overflow-hidden">
              <a
                href="${ptUrl}"
                data-lang="pt"
                class="px-3 py-1 text-sm font-semibold transition ${
                  !isEnglish
                    ? "bg-secondary text-white"
                    : "text-gray-300 hover:bg-secondary hover:bg-opacity-20"
                }"
                aria-label="Português (Brasil)"
              >PT-BR</a>
              <a
                href="${enUrl}"
                data-lang="en"
                class="px-3 py-1 text-sm font-semibold transition ${
                  isEnglish
                    ? "bg-secondary text-white"
                    : "text-gray-300 hover:bg-secondary hover:bg-opacity-20"
                }"
                aria-label="English"
              >ENG</a>
            </div>
                    </div>
                </div>
            </nav>
        `;

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

function toggleMenu() {
  const menu = document.getElementById("mobile-menu");

  if (!menu) return;

  const navbarToggleButton = document.querySelector(
    'button[aria-controls="mobile-menu"]'
  );

  const transitionMs = 200;
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    if (navbarToggleButton)
      navbarToggleButton.setAttribute("aria-expanded", "true");

    if (prefersReducedMotion) {
      menu.classList.add("opacity-100", "translate-y-0", "max-h-96");
      menu.classList.remove("opacity-0", "-translate-y-1", "max-h-0");
      return;
    }

    // Next frame so the browser can apply the initial (closed) styles.
    requestAnimationFrame(() => {
      menu.classList.add("opacity-100", "translate-y-0", "max-h-96");
      menu.classList.remove("opacity-0", "-translate-y-1", "max-h-0");
    });
  } else {
    if (navbarToggleButton)
      navbarToggleButton.setAttribute("aria-expanded", "false");

    if (prefersReducedMotion) {
      menu.classList.add("hidden");
      menu.classList.remove("opacity-100", "translate-y-0", "max-h-96");
      menu.classList.add("opacity-0", "-translate-y-1", "max-h-0");
      return;
    }

    menu.classList.add("opacity-0", "-translate-y-1", "max-h-0");
    menu.classList.remove("opacity-100", "translate-y-0", "max-h-96");

    window.setTimeout(() => {
      menu.classList.add("hidden");
    }, transitionMs);
  }
}
