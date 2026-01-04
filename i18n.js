// i18n.js
(function () {
  const STORAGE_KEY = "artrobots_lang"; // 'pt' | 'en'

  function normalizeLang(value) {
    if (!value) return null;
    const v = String(value).toLowerCase();
    if (v.startsWith("pt")) return "pt";
    if (v.startsWith("en")) return "en";
    return null;
  }

  function detectPreferredLang() {
    const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;

    const langs =
      Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language];

    for (const lang of langs) {
      const normalized = normalizeLang(lang);
      if (normalized === "pt") return "pt";
      if (normalized === "en") return "en";
    }

    // Default to English if we can't detect.
    return "en";
  }

  function getCurrentPageKey() {
    const path = (window.location.pathname || "").toLowerCase();
    const file = (path.split("/").pop() || "").toLowerCase();

    // Treat directory root as index.
    if (!file || file === "/") return "index";

    if (file.startsWith("membros")) return "membros";
    return "index";
  }

  function getCurrentVariant() {
    const htmlLang = (
      document.documentElement.getAttribute("lang") || ""
    ).toLowerCase();
    return htmlLang.startsWith("en") ? "en" : "pt";
  }

  function buildTargetUrl(pageKey, targetLang) {
    const hash = window.location.hash || "";
    if (pageKey === "membros") {
      return targetLang === "en"
        ? `membros-en.html${hash}`
        : `membros.html${hash}`;
    }
    return targetLang === "en" ? `index-en.html${hash}` : `index.html${hash}`;
  }

  try {
    const preferred = detectPreferredLang();
    const currentVariant = getCurrentVariant();
    const pageKey = getCurrentPageKey();

    if (preferred !== currentVariant) {
      const target = buildTargetUrl(pageKey, preferred);
      // Avoid redirect loops in weird hosting setups
      const currentFile = (
        window.location.pathname.split("/").pop() || ""
      ).toLowerCase();
      const targetFile = target.split("#")[0].toLowerCase();

      if (currentFile !== targetFile) {
        window.location.replace(target);
      }
    }
  } catch {
    // No-op: if localStorage is blocked or anything fails, we just don't redirect.
  }
})();
