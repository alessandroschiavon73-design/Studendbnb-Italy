window.STUDENTBNB_CONFIG = Object.freeze({
  appName: "StudentBnB",
  brandLine: "Base & Belong",
  countryCode: "IT",
  countryName: "Italia",
  locale: "it-IT",
  currency: "EUR",
  domain: "studentbnb.it",
  defaultCity: "padova",
  cityPage: "padova.html",
  reportEmail: "segnalazioni@studentbnb.it",
  apiMode: "supabase",
  apiBase: "/api/v1",
  supabaseUrl: "https://etyvaugscofodkhklqqz.supabase.co",
  supabasePublishableKey: "sb_publishable_MJiby1pof0ghYnw1UMx-jQ_bpQKyd0L",
  unifiedDatabase: true,
  schemaVersion: "1.3"
});

(function () {
  const cfg = window.STUDENTBNB_CONFIG;
  const sites = [
    ["IT","Italia","assets/img/flag-it.svg","https://studentbnb.it/"],
    ["ES","España","assets/img/flag-es.svg","https://studentbnb.es/"],
    ["FR","France","assets/img/flag-fr.svg","https://studentbnb.fr/"],
    ["DE","Deutschland","assets/img/flag-de.svg","https://student-bnb.de/"],
    ["PL","Polska","assets/img/flag-pl.svg","https://studentbnb.pl/"]
  ];
  const ogImage = `https://${cfg.domain}/assets/img/italia-proposta1.webp`;
  function upsertMeta(key, value, content) { let element = document.head.querySelector(`meta[${key}=\"${value}\"]`); if (!element) { element = document.createElement("meta"); element.setAttribute(key, value); document.head.appendChild(element); } element.setAttribute("content", content); }
  function upsertLink(rel, href, hreflang) { const selector = `link[rel=\"${rel}\"]${hreflang ? `[hreflang=\"${hreflang}\"]` : ""}`; let element = document.head.querySelector(selector); if (!element) { element = document.createElement("link"); element.rel = rel; if (hreflang) element.hreflang = hreflang; document.head.appendChild(element); } element.href = href; }
  function canonicalUrl() { const page = location.pathname.endsWith("/") ? "" : location.pathname.split("/").pop(); const params = new URLSearchParams(location.search); const canonicalParams = new URLSearchParams(); if (page === cfg.cityPage && params.get("city")) canonicalParams.set("city", params.get("city")); if (page === "annuncio.html" && params.get("id")) canonicalParams.set("id", params.get("id")); const query = canonicalParams.toString(); return `https://${cfg.domain}/${page || ""}${query ? `?${query}` : ""}`; }
  function updateSeo({title = document.title, description} = {}) { const desc = description || document.head.querySelector('meta[name="description"]')?.content || "Soggiorni temporanei per studenti in Italia."; const canonical = canonicalUrl(); upsertLink("canonical", canonical); upsertMeta("property", "og:title", title); upsertMeta("property", "og:description", desc); upsertMeta("property", "og:url", canonical); upsertMeta("property", "og:image", ogImage); upsertMeta("name", "twitter:title", title); upsertMeta("name", "twitter:description", desc); upsertMeta("name", "twitter:image", ogImage); }
  function addStructuredData() { let script = document.head.querySelector("#studentbnb-website-schema"); if (!script) { script = document.createElement("script"); script.id = "studentbnb-website-schema"; script.type = "application/ld+json"; document.head.appendChild(script); } script.textContent = JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:"StudentBnB",url:`https://${cfg.domain}/`,inLanguage:cfg.locale}); }
  function applyBranding() { document.title = document.title.replaceAll("CasaStudent", "StudentBnB"); const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let node; while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replaceAll("CasaStudent", "StudentBnB"); document.querySelectorAll("[aria-label]").forEach(element => element.setAttribute("aria-label", element.getAttribute("aria-label").replaceAll("CasaStudent", "StudentBnB"))); document.querySelectorAll(".brand").forEach(brand => { const labels = [...brand.children].filter(element => element.tagName === "SPAN" && !element.classList.contains("brand-icon")); const label = labels[labels.length - 1]; if (!label) return; const small = label.querySelector("small"); const smallHtml = small ? small.outerHTML : ""; label.innerHTML = `Student<strong>BnB</strong>${smallHtml}`; }); }
  function apply() {
    applyBranding();
    document.querySelectorAll(".brand small").forEach(element => { element.textContent = "Base & Belong"; element.style.fontStyle = "italic"; });
    const fp = document.querySelector(".site-footer .footer-grid>div:first-child p");
    if (fp) fp.textContent = "StudentBnB è dedicato ai soggiorni temporanei nella comunità studentesca: una settimana, due settimane o un mese, per Erasmus, stage, corsi ed esami.";
    upsertMeta("name", "robots", "index,follow,max-image-preview:large"); upsertMeta("property", "og:site_name", "StudentBnB — Base & Belong"); upsertMeta("property", "og:type", "website"); upsertMeta("name", "twitter:card", "summary_large_image"); updateSeo(); addStructuredData();
    const page = location.pathname.endsWith("/") ? "" : location.pathname.split("/").pop(); if (!page || page === "index.html") sites.forEach(([code, , , url]) => upsertLink("alternate", url, code.toLowerCase()));
    const box = document.querySelector(".footer-international .footer-country-links");
    if (box) {
      box.innerHTML = sites.map(([code, label, flag, url]) => `<a href="${url}"${code === cfg.countryCode ? ' aria-current="page"' : ' target="_blank" rel="noopener noreferrer"'}><img class="network-flag" src="${flag}" alt="" width="30" height="20"><span>${label}</span><span class="network-open" aria-hidden="true">↗</span></a>`).join("");
    }
  }
  window.StudentBnBSEO = { update: updateSeo };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
(function(){if(document.querySelector('script[data-studentbnb-analytics]'))return;const s=document.createElement('script');s.src='assets/js/analytics.js?v=20260824';s.defer=true;s.dataset.studentbnbAnalytics='1';document.head.appendChild(s)})();
(function(){if(document.querySelector('script[data-studentbnb-supabase]'))return;const s=document.createElement('script');s.src='assets/js/supabase-integration.js?v=20260827';s.defer=true;s.dataset.studentbnbSupabase='1';document.head.appendChild(s)})();

(function () {
  const cfg = window.STUDENTBNB_CONFIG || {};
  const casaStudentSites = [
    { code: "EU", label: "Europe", flag: "🇪🇺", url: "https://casastudent.eu/" },
    { code: "IT", label: "Italia", flag: "🇮🇹", url: "https://casastudent.it/" },
    { code: "ES", label: "España", flag: "🇪🇸", url: "https://casastudent.es/" },
    { code: "FR", label: "France", flag: "🇫🇷", url: "https://casastudent.fr/" },
    { code: "DE", label: "Deutschland", flag: "🇩🇪", url: "https://casastudent.de/" },
    { code: "PL", label: "Polska", flag: "🇵🇱", url: "https://casastudent.pl/" }
  ];
  const studentBnBSites = [
    { code: "IT", label: "Italia", flag: "🇮🇹", url: "https://studentbnb.it/" },
    { code: "ES", label: "España", flag: "🇪🇸", url: "https://studentbnb.es/" },
    { code: "FR", label: "France", flag: "🇫🇷", url: "https://studentbnb.fr/" },
    { code: "DE", label: "Deutschland", flag: "🇩🇪", url: "https://student-bnb.de/" },
    { code: "PL", label: "Polska", flag: "🇵🇱", url: "https://studentbnb.pl/" },
    { code: "PT", label: "Portugal", flag: "🇵🇹", url: "https://studentbnb.pt/" }
  ];
  const headings = {
    it: ["Portali CasaStudent", "Portali StudentBnB"],
    es: ["Portales CasaStudent", "Portales StudentBnB"],
    fr: ["Portails CasaStudent", "Portails StudentBnB"],
    de: ["CasaStudent-Portale", "StudentBnB-Portale"],
    pl: ["Portale CasaStudent", "Portale StudentBnB"],
    pt: ["Portais CasaStudent", "Portais StudentBnB"],
    en: ["CasaStudent portals", "StudentBnB portals"]
  };

  function currentFamily() {
    const identity = `${cfg.appName || ""} ${cfg.domain || ""}`.toLowerCase();
    return identity.includes("studentbnb") || identity.includes("student-bnb.de") ? "studentbnb" : "casastudent";
  }

  function removeHeaderFaqAndContacts() {
    document.querySelectorAll(".main-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (/#(?:faq|contact|contacts|contatti|contatto|contacto)$/.test(href)) link.remove();
    });
  }

  function links(sites, family) {
    const activeFamily = currentFamily();
    return sites.map((site) => {
      const active = family === activeFamily && site.code === (cfg.countryCode || "EU");
      return `<a class="portal-country-link${active ? " is-current" : ""}" href="${site.url}"${active ? ' aria-current="page"' : ""}><span class="portal-country-flag" aria-hidden="true">${site.flag}</span><span>${site.label}</span><span class="network-open" aria-hidden="true">${active ? "✓" : "↗"}</span></a>`;
    }).join("");
  }

  function renderDualFooter() {
    const footer = document.querySelector(".footer-international");
    if (!footer) return;
    const language = (document.documentElement.lang || cfg.locale || "en").slice(0, 2).toLowerCase();
    const labels = headings[language] || headings.en;
    footer.classList.add("dual-portal-footer");
    footer.innerHTML = `
      <section class="portal-family" aria-labelledby="casastudent-network-title">
        <strong class="portal-family-title" id="casastudent-network-title">${labels[0]}</strong>
        <nav class="footer-country-links portal-country-links" aria-label="${labels[0]}">${links(casaStudentSites, "casastudent")}</nav>
      </section>
      <section class="portal-family" aria-labelledby="studentbnb-network-title">
        <strong class="portal-family-title" id="studentbnb-network-title">${labels[1]}</strong>
        <nav class="footer-country-links portal-country-links" aria-label="${labels[1]}">${links(studentBnBSites, "studentbnb")}</nav>
      </section>`;
  }

  function installStyles() {
    if (document.getElementById("dual-portal-footer-style")) return;
    const style = document.createElement("style");
    style.id = "dual-portal-footer-style";
    style.textContent = `
      .footer-international.dual-portal-footer{display:grid!important;gap:18px!important;align-items:stretch!important}
      .dual-portal-footer .portal-family{display:grid;grid-template-columns:minmax(150px,.3fr) minmax(0,1fr);gap:14px 20px;align-items:start}
      .dual-portal-footer .portal-family+.portal-family{padding-top:18px;border-top:1px solid rgba(255,255,255,.18)}
      .dual-portal-footer .portal-family-title{display:block;line-height:1.35;padding-top:9px}
      .dual-portal-footer .portal-country-links{display:flex!important;flex-wrap:wrap!important;gap:9px!important;margin:0!important}
      .dual-portal-footer .portal-country-link{display:inline-flex!important;align-items:center!important;gap:7px!important;min-height:40px;padding:8px 11px!important;border-radius:10px;text-decoration:none}
      .dual-portal-footer .portal-country-link.is-current{font-weight:800;box-shadow:inset 0 0 0 2px currentColor}
      .dual-portal-footer .portal-country-flag{font-size:20px;line-height:1}
      .dual-portal-footer .network-open{margin-left:auto;opacity:.72}
      @media(max-width:720px){
        .dual-portal-footer .portal-family{grid-template-columns:1fr;gap:8px}
        .dual-portal-footer .portal-family-title{padding-top:0}
        .dual-portal-footer .portal-country-links{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}
        .dual-portal-footer .portal-country-link{width:100%;min-width:0}
      }
      @media(max-width:380px){.dual-portal-footer .portal-country-links{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function applyPortalNavigation() {
    removeHeaderFaqAndContacts();
    installStyles();
    renderDualFooter();
  }

  function applyAfterBranding() {
    window.setTimeout(applyPortalNavigation, 0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAfterBranding);
  else applyAfterBranding();
})();
