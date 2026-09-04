(() => {
  "use strict";

  const cityPhotos = Object.freeze({
    ancona: "assets/img/citta-ancona-hero.webp",
    bari: "assets/img/citta-bari-hero.webp",
    bologna: "assets/img/citta-bologna.webp",
    cagliari: "assets/img/citta-cagliari-hero.webp",
    firenze: "assets/img/citta-firenze.webp",
    milano: "assets/img/citta-milano.webp",
    napoli: "assets/img/citta-napoli.webp",
    padova: "assets/img/padova-hero.webp",
    palermo: "assets/img/citta-palermo-hero.webp",
    pisa: "assets/img/citta-pisa.webp",
    roma: "assets/img/citta-roma.webp",
    torino: "assets/img/citta-torino.webp",
    trento: "assets/img/citta-trento-hero.webp",
    trieste: "assets/img/citta-trieste-hero.webp"
  });

  function currentCitySlug() {
    const bodySlug = document.body?.dataset?.citySlug;
    if (bodySlug) return bodySlug;
    const querySlug = new URLSearchParams(location.search).get("city");
    if (querySlug) return querySlug.toLowerCase();
    const pathSlug = location.pathname.split("/").filter(Boolean)[0];
    return pathSlug && cityPhotos[pathSlug] ? pathSlug : "padova";
  }

  function applyCityPhoto() {
    const slug = currentCitySlug();
    const hero = document.querySelector(".city-hero-bg");
    const photo = cityPhotos[slug];
    if (!hero || !photo) return;
    hero.style.backgroundImage = `url("${photo}")`;
    hero.style.backgroundPosition = "center";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(applyCityPhoto, 0), { once: true });
  } else {
    setTimeout(applyCityPhoto, 0);
  }
  setTimeout(applyCityPhoto, 350);
})();
