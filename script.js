// script.js
const SPLASH_FADE_MS = 500;
const SPLASH_EARLY_HIDE_DELAY_MS = 120;
let splashWasHidden = false;

function hideSplash() {
  if (splashWasHidden) return;
  const splash = document.getElementById("splash");
  if (!splash) return;

  splashWasHidden = true;
  splash.style.opacity = "0";

  window.setTimeout(() => {
    splash.style.display = "none";
  }, SPLASH_FADE_MS);
}

// Hide as soon as HTML is ready (doesn't wait heavy images/videos/CDNs)
window.addEventListener("DOMContentLoaded", () => {
  window.setTimeout(hideSplash, SPLASH_EARLY_HIDE_DELAY_MS);
});

// Keep a fallback for slow devices/network
window.addEventListener("load", hideSplash);

// Parallax effect for hero section
let spiderCurrentTop = 80; // Posição inicial da aranha

window.addEventListener("scroll", function () {
  const parallax = document.querySelector(".hero-parallax");
  if (parallax) {
    const scrolled = window.pageYOffset;
    parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
  }

  // Spider mascot with web animation
  const spiderMascot = document.getElementById("spider-mascot");
  const spiderWeb = document.getElementById("spider-web");

  if (spiderWeb) {
    const scrolled = window.pageYOffset;
    const navbarHeight = 80;
    const spiderTopNudge = -4;
    const spiderWebExtra = 4;

    // A aranha desce devagar: apenas 15% da velocidade do scroll
    // E sempre adiciona à posição atual, não pula
    const targetPosition = navbarHeight + scrolled * 0.05;

    // Interpola suavemente da posição atual para a target
    spiderCurrentTop += (targetPosition - spiderCurrentTop) * 0.1;

    // Move a aranha para baixo conforme o scroll
    if (spiderMascot) {
      spiderMascot.style.top = `${spiderCurrentTop + spiderTopNudge}px`;
    }

    // A teia cresce até o topo da aranha, usando a mesma referência do `top`
    // (evita tremulação no mobile por conta de `scale()` + transitions)
    const attachY = Math.max(6, spiderCurrentTop + spiderTopNudge + 14);
    spiderWeb.style.height = `${attachY}px`;
  }
}); // Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll("section").forEach((section) => {
  section.style.opacity = "0";
  section.style.transform = "translateY(20px)";
  section.style.transition = "all 0.6s ease-out";
  observer.observe(section);
});

// Sponsors scroll functionality
const sponsorsContainer = document.querySelector(".sponsors-container");
const scrollLeft = document.querySelector(".sponsors-scroll-left");
const scrollRight = document.querySelector(".sponsors-scroll-right");

if (scrollLeft && sponsorsContainer) {
  scrollLeft.addEventListener("click", () => {
    sponsorsContainer.scrollBy({ left: -300, behavior: "smooth" });
  });
}

if (scrollRight && sponsorsContainer) {
  scrollRight.addEventListener("click", () => {
    sponsorsContainer.scrollBy({ left: 300, behavior: "smooth" });
  });
}

const MODAL_TRANSITION_MS = 200;
const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupModal({ modalId, openBtnId, closeBtnId, extraCloseBtnIds = [] }) {
  const modalEl = document.getElementById(modalId);
  const openBtn = document.getElementById(openBtnId);
  const closeBtn = document.getElementById(closeBtnId);

  if (!modalEl) return;

  function open() {
    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");

    if (prefersReducedMotion) {
      modalEl.classList.add("is-open");
    } else {
      requestAnimationFrame(() => modalEl.classList.add("is-open"));
    }

    window.setTimeout(() => {
      if (typeof feather !== "undefined" && feather.replace) feather.replace();
    }, 10);
  }

  function close() {
    modalEl.classList.remove("is-open");

    if (prefersReducedMotion) {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
      return;
    }

    window.setTimeout(() => {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    }, MODAL_TRANSITION_MS);
  }

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  extraCloseBtnIds.forEach((id) => {
    const extraBtn = document.getElementById(id);
    if (extraBtn) extraBtn.addEventListener("click", close);
  });

  // Close when clicking outside the panel
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) close();
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalEl.classList.contains("hidden")) return;
    close();
  });
}

// Sponsorship Modal functionality
setupModal({
  modalId: "sponsorModal",
  openBtnId: "openSponsorModal",
  closeBtnId: "closeSponsorModal",
  extraCloseBtnIds: ["modalContactBtn"],
});

// SolidWorks Modal
setupModal({
  modalId: "solidworksModal",
  openBtnId: "openSolidworksModal",
  closeBtnId: "closeSolidworksModal",
});

// Elipse Modal
setupModal({
  modalId: "elipseModal",
  openBtnId: "openElipseModal",
  closeBtnId: "closeElipseModal",
});

// About carousel functionality
(function initAboutCarousel() {
  const carousel = document.getElementById("aboutCarousel");
  const mediaEl = document.getElementById("aboutMedia");
  const titleEl = document.getElementById("aboutTitle");
  const textEl = document.getElementById("aboutText");
  const prevBtn = document.getElementById("aboutPrev");
  const nextBtn = document.getElementById("aboutNext");
  const thumbButtons = Array.from(
    document.querySelectorAll("[data-about-index]")
  );

  if (
    !carousel ||
    !mediaEl ||
    !titleEl ||
    !textEl ||
    thumbButtons.length === 0
  ) {
    return;
  }

  const htmlLang = (
    document.documentElement.getAttribute("lang") || ""
  ).toLowerCase();
  const langKey = htmlLang.startsWith("en") ? "en" : "pt";

  const slidesByLang = {
    pt: [
      {
        src: "assets/MEMBROS.jpg",
        alt: "Membros do Artrobots",
        title: "O clube (e quem faz acontecer)",
        text: "Somos a Artrobots, o clube de robótica do Inteli. A gente aprende na prática: do primeiro protótipo até robôs prontos para competir, sempre com trabalho em equipe e muita mão na massa.",
      },
      {
        src: "assets/artrobots-robochallenge.jpeg",
        alt: "Artrobots no RoboChallenge",
        title: "RoboChallenge 2025 (Seguidor de Linha)",
        text: "Em 2025, participamos do RoboChallenge levando nosso Seguidor de Linha: projeto que mistura mecânica, eletrônica e software para navegar pela pista com precisão e consistência.",
      },
      {
        src: "assets/auladearduino.gif",
        alt: "Aula de Arduino",
        title: "Institucional: aulas e formação",
        text: "Também fazemos aulas internas para desenvolver a base do time. Aqui, um trecho de uma aula de Arduino, colocando a mão na massa desde o começo.",
      },
      {
        src: "assets/estourabalao-inteliday.gif",
        alt: "Inteli Day",
        title: "Evento: Estoura Balão no Inteli Day",
        text: "O Inteli Day é um dia em que a faculdade recebe várias pessoas para conhecer o campus. Nesse dia, realizamos um evento chamado Estoura Balão, em que o participante controlava o robô pelo celular e precisava conseguir estourar o balão usando um palito fixado na parte da frente do robô.",
      },
      {
        src: "assets/seguidordelinha-rsm.png",
        alt: "Artrobots na RSM",
        title: "RSM 2024 (Seguidor de Linha)",
        text: "Em 2024, participamos da RSM, um evento de robótica que reúne equipes estudantis para apresentar projetos, trocar experiências e competir em diferentes categorias. Levamos nosso Seguidor de Linha, colocando em prática tudo o que aprendemos em programação, eletrônica e trabalho em equipe.",
      },
    ],
    en: [
      {
        src: "assets/MEMBROS.jpg",
        alt: "Artrobots members",
        title: "The club (and the people behind it)",
        text: "We are Artrobots, Inteli's robotics club. We learn by doing: from the first prototype to competition-ready robots — always with teamwork and lots of hands-on building.",
      },
      {
        src: "assets/artrobots-robochallenge.jpeg",
        alt: "Artrobots at RoboChallenge",
        title: "RoboChallenge 2025 (Line Follower)",
        text: "In 2025, we competed at RoboChallenge with our Line Follower — a project combining mechanics, electronics and software to navigate the track with precision and consistency.",
      },
      {
        src: "assets/auladearduino.gif",
        alt: "Arduino class",
        title: "Internal training and learning",
        text: "We also run internal classes to build the team's foundations. Here is a clip from an Arduino lesson — hands-on from day one.",
      },
      {
        src: "assets/estourabalao-inteliday.gif",
        alt: "Inteli Day",
        title: "Event: Balloon Pop at Inteli Day",
        text: "Inteli Day is when the university welcomes visitors to get to know the campus. We ran a Balloon Pop event where participants controlled a robot via phone and had to pop a balloon using a stick mounted at the front of the robot.",
      },
      {
        src: "assets/seguidordelinha-rsm.png",
        alt: "Artrobots at RSM",
        title: "RSM 2024 (Line Follower)",
        text: "In 2024, we took part in RSM, a robotics event that brings student teams together to showcase projects, exchange experiences, and compete across categories. We brought our Line Follower and put into practice everything we learned in programming, electronics and teamwork.",
      },
    ],
  };

  const slides = slidesByLang[langKey];

  let currentIndex = 0;
  let autoplayTimer = null;
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActiveThumb(index) {
    thumbButtons.forEach((btn) => {
      const btnIndex = Number(btn.getAttribute("data-about-index"));
      if (btnIndex === index) {
        btn.classList.add("ring-2", "ring-accent");
      } else {
        btn.classList.remove("ring-2", "ring-accent");
      }
    });
  }

  function render(index) {
    const slide = slides[index];
    if (!slide) return;

    mediaEl.src = slide.src;
    mediaEl.alt = slide.alt;
    titleEl.textContent = slide.title;
    textEl.textContent = slide.text;
    setActiveThumb(index);

    // Make sure icons inside the carousel are rendered
    if (typeof feather !== "undefined" && feather && feather.replace) {
      feather.replace();
    }
  }

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    render(currentIndex);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(next, 7000);
  }

  thumbButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-about-index"));
      if (Number.isNaN(idx)) return;
      goTo(idx);
      startAutoplay();
    });
  });

  if (nextBtn)
    nextBtn.addEventListener("click", () => (next(), startAutoplay()));
  if (prevBtn)
    prevBtn.addEventListener("click", () => (prev(), startAutoplay()));

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  render(currentIndex);
  startAutoplay();
})();
