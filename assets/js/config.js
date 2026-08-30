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
    ["EU","Europe","assets/img/flag-eu.svg","https://studentbnb.eu/"],
    ["IT","Italia","assets/img/flag-it.svg","https://studentbnb.it/"],
    ["ES","España","assets/img/flag-es.svg","https://studentbnb.es/"],
    ["FR","France","assets/img/flag-fr.svg","https://studentbnb.fr/"],
    ["DE","Deutschland","assets/img/flag-de.svg","https://student-bnb.de/"],
    ["PL","Polska","assets/img/flag-pl.svg","https://studentbnb.pl/"],
    ["PT","Portugal","assets/img/flag-pt.svg","https://studentbnb.pt/"]
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
    const box = document.querySelector(".footer-international .footer-country-links"); if (box) { box.innerHTML = sites.map(([code, label, flag, url]) => `<a href="${url}"${code === cfg.countryCode ? ' aria-current="page"' : ''}><img class="network-flag" src="${flag}" alt="" width="30" height="20"><span>${label}</span><span class="network-open" aria-hidden="true">↗</span></a>`).join(""); }
  }
  window.StudentBnBSEO = { update: updateSeo };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
(function(){if(document.querySelector('script[data-studentbnb-analytics]'))return;const s=document.createElement('script');s.src='assets/js/analytics.js?v=20260824';s.defer=true;s.dataset.studentbnbAnalytics='1';document.head.appendChild(s)})();
(function(){if(document.querySelector('script[data-studentbnb-supabase]'))return;const s=document.createElement('script');s.src='assets/js/supabase-integration.js?v=20260827';s.defer=true;s.dataset.studentbnbSupabase='1';document.head.appendChild(s)})();
