
(() => {
  "use strict";
  const CONFIG = window.STUDENTBNB_CONFIG || {countryCode:"IT",locale:"it-IT",currency:"EUR",defaultCity:"padova",cityPage:"padova.html",reportEmail:"segnalazioni@casastudent.it"};
  const DATA = window.STUDENTBNB_DATA || {listings:[], cities:[]};
  const DEMO_REQUESTS = window.STUDENTBNB_REQUESTS || [];
  const CITIES = (window.STUDENTBNB_CITIES || DATA.cities || []).map(city => ({
    ...city,
    id: city.id || `city_${String(CONFIG.countryCode).toLowerCase()}_${String(city.slug).replace(/-/g,"_")}`,
    countryCode: city.countryCode || CONFIG.countryCode,
    active: city.active !== false
  }));
  const ZONES = window.STUDENTBNB_ZONES || {};

  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat(CONFIG.locale || "it-IT", {style:"currency", currency:CONFIG.currency || "EUR", maximumFractionDigits:0}).format(Number(n)||0);
  const formatDate = (iso, fallback="Da concordare") => {
    if(!iso) return fallback;
    const date = new Date(`${iso}T12:00:00`);
    return Number.isNaN(date.getTime()) ? fallback : new Intl.DateTimeFormat(CONFIG.locale || "it-IT", {day:"numeric",month:"long",year:"numeric"}).format(date);
  };
  const updateSeo = (title, description) => window.StudentBnBSEO?.update({title, description});

  function cityBySlug(slug){
    return CITIES.find(city => city.slug === slug) || CITIES.find(city => city.slug === CONFIG.defaultCity) || CITIES[0] || {slug:CONFIG.defaultCity,name:"Padova",id:"city_it_padova",countryCode:CONFIG.countryCode};
  }

  function citySlugFromValue(value){
    const normalized = String(value || "").toLowerCase();
    return CITIES.find(city => city.slug === normalized || city.name.toLowerCase() === normalized)?.slug || normalized;
  }

  function listingCitySlug(listing){
    return citySlugFromValue(listing.citySlug || listing.city || CONFIG.defaultCity) || CONFIG.defaultCity;
  }

  function cityOptions(selected=""){
    return CITIES.map(city => `<option value="${escapeHtml(city.slug)}"${city.slug === selected ? " selected" : ""}>${escapeHtml(city.name)}</option>`).join("");
  }

  function setupCitySelectors(){
    const queryCity = citySlugFromValue(new URLSearchParams(location.search).get("city") || "");
    const configurations = [
      ["#home-city", "", CONFIG.defaultCity],
      ["#city", "Seleziona", queryCity],
      ["#request-city", "Seleziona", queryCity],
      ["#student-filter-city", "Tutte le città", ""]
    ];
    configurations.forEach(([selector, placeholder, fallback]) => {
      const select = qs(selector);
      if(!select) return;
      const current = select.value || fallback;
      select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") + cityOptions(current);
      if(current && CITIES.some(city => city.slug === current)) select.value = current;
    });
  }

  function getUserListings(){
    try { return JSON.parse(localStorage.getItem("studentbnb_user_listings") || "[]"); }
    catch { return []; }
  }
  function allListings(){ return [...getUserListings(), ...DATA.listings]; }
  function getUserRequests(){
    try { return JSON.parse(localStorage.getItem("studentbnb_student_requests") || "[]"); }
    catch { return []; }
  }
  function allStudentRequests(){ return [...getUserRequests(), ...DEMO_REQUESTS]; }
  function favorites(){
    try { return new Set(JSON.parse(localStorage.getItem("studentbnb_favorites") || "[]")); }
    catch { return new Set(); }
  }
  function saveFavorites(set){ localStorage.setItem("studentbnb_favorites", JSON.stringify([...set])); }

  function toast(message){
    let el = qs("#toast");
    if(!el){
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
  }

  function setupDemoNotice(){
    const map = qs(".map-stage");
    if(!map || qs(".demo-map-notice", map)) return;
    const notice = document.createElement("p");
    notice.className = "demo-map-notice";
    notice.textContent = "Anteprima dimostrativa: annunci, profili e quantità mostrate sono esempi.";
    map.appendChild(notice);
  }

  function setupHeader(){
    const menu = qs(".menu-button");
    const nav = qs(".main-nav");
    if(menu && nav){
      menu.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menu.setAttribute("aria-expanded", String(open));
      });
    }
    qsa("[data-login]").forEach(btn => btn.addEventListener("click", e => {
      e.preventDefault();
      qs("#login-modal")?.classList.add("active");
    }));
    qsa("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => {
      btn.closest(".modal-backdrop")?.classList.remove("active");
    }));
    qsa(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => {
      if(e.target === backdrop) backdrop.classList.remove("active");
    }));
    const loginForm = qs("#login-form");
    if(loginForm){
      loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = new FormData(loginForm).get("email");
        localStorage.setItem("studentbnb_user", String(email));
        qs("#login-modal")?.classList.remove("active");
        updateAccountLabel();
        toast("Accesso effettuato");
      });
    }
    updateAccountLabel();
  }

  function updateAccountLabel(){
    const email = localStorage.getItem("studentbnb_user");
    qsa("[data-account-label]").forEach(el => {
      el.textContent = email ? email.split("@")[0] : "Accedi";
    });
  }

  function setupPublishMenus(){
    const closeMenus = except => {
      qsa(".publish-menu.open").forEach(wrapper => {
        if(wrapper === except) return;
        wrapper.classList.remove("open");
        const trigger = qs(".header-cta", wrapper);
        const menu = qs(".publish-choice-menu", wrapper);
        if(trigger) trigger.setAttribute("aria-expanded","false");
        if(menu) menu.hidden = true;
      });
    };
    qsa(".header-cta").forEach((trigger,index) => {
      if(trigger.closest(".publish-menu")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "publish-menu";
      trigger.parentNode.insertBefore(wrapper,trigger);
      wrapper.appendChild(trigger);
      const menu = document.createElement("div");
      const menuId = `publish-choice-menu-${index+1}`;
      menu.id = menuId;
      menu.className = "publish-choice-menu";
      menu.hidden = true;
      menu.innerHTML = `
        <a href="cerco.html"><span class="choice-icon" aria-hidden="true">🏠</span><span><strong>Cerco casa</strong><small>Pubblica la tua richiesta e fatti contattare.</small></span><b aria-hidden="true">›</b></a>
        <a href="pubblica.html"><span class="choice-icon" aria-hidden="true">🔑</span><span><strong>Offro un alloggio</strong><small>Pubblica una stanza, un posto letto o un appartamento.</small></span><b aria-hidden="true">›</b></a>
        <a href="intergenerazionale.html"><span class="choice-icon" aria-hidden="true">🤝</span><span><strong>Ospitalità solidale</strong><small>Una stanza agevolata in cambio di un piccolo aiuto.</small></span><b aria-hidden="true">›</b></a>`;
      wrapper.appendChild(menu);
      trigger.setAttribute("aria-haspopup","true");
      trigger.setAttribute("aria-controls",menuId);
      trigger.setAttribute("aria-expanded","false");
      trigger.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = menu.hidden;
        closeMenus(wrapper);
        menu.hidden = !willOpen;
        wrapper.classList.toggle("open",willOpen);
        trigger.setAttribute("aria-expanded",String(willOpen));
      });
      menu.addEventListener("click",e => e.stopPropagation());
    });
    document.addEventListener("click",() => closeMenus());
    document.addEventListener("keydown",e => {
      if(e.key === "Escape") closeMenus();
    });
  }

  function setupFavorites(){
    qsa("[data-favorite]").forEach(btn => {
      const id = btn.getAttribute("data-favorite");
      const favs = favorites();
      btn.classList.toggle("active", favs.has(id));
      btn.setAttribute("aria-pressed", String(favs.has(id)));
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const set = favorites();
        if(set.has(id)){ set.delete(id); toast("Rimosso dai preferiti"); }
        else { set.add(id); toast("Salvato nei preferiti"); }
        saveFavorites(set);
        qsa(`[data-favorite="${CSS.escape(id)}"]`).forEach(x => {
          x.classList.toggle("active", set.has(id));
          x.setAttribute("aria-pressed", String(set.has(id)));
        });
      });
    });
  }

  function setupHome(){
    const form = qs("#home-search");
    if(form){
      form.addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(form);
        const city = citySlugFromValue(fd.get("city")) || CONFIG.defaultCity;
        const type = fd.get("type");
        location.href = `${CONFIG.cityPage}?city=${encodeURIComponent(city)}&type=${encodeURIComponent(type || "")}`;
      });
    }
    qsa("[data-city-coming]").forEach(el => el.addEventListener("click", e => {
      e.preventDefault();
      toast(`${el.getAttribute("data-city-coming")} sarà attivata dopo il lancio pilota di Padova.`);
    }));
    qsa("[data-country-coming]").forEach(el => el.addEventListener("click", e => {
      e.preventDefault();
      toast(`CasaStudent ${el.getAttribute("data-country-coming")} sarà disponibile prossimamente.`);
    }));
  }

  function listingCard(l){
    const expenseClass = l.expensesIncluded ? "included" : "excluded";
    const expenseText = l.expensesIncluded ? "● Spese incluse" : `● Spese escluse${l.expenses ? ` (+${money(l.expenses)})` : ""}`;
    const priceClass = l.expensesIncluded ? "" : "expenses-out";
    return `
      <article class="listing-card" data-id="${escapeHtml(l.id)}">
        <a href="annuncio.html?id=${encodeURIComponent(l.id)}" aria-label="Apri ${escapeHtml(l.zone)}">
          <img class="listing-image" src="${escapeHtml(l.image || "assets/img/alloggio-1.webp")}" alt="${escapeHtml(l.type)} a ${escapeHtml(l.zone)}">
        </a>
        <div class="listing-main">
          <div class="listing-title-row">
            <h3><a href="annuncio.html?id=${encodeURIComponent(l.id)}">${escapeHtml(l.zone)}</a></h3>
            <span class="pill">${escapeHtml(l.tag || "offerta trasparente")}</span>
          </div>
          <div class="listing-meta"><span>♙ ${escapeHtml(l.type)}</span><span>${escapeHtml(l.arrangement || "")}</span>${l.isDemo ? `<span class="demo-badge">Esempio dimostrativo</span>` : l.verified ? `<span class="verification-badge">✓ Inserzionista verificato</span>` : ""}</div>
          ${l.intergenerational?.enabled ? `<span class="solidarity-badge">🤝 Ospitalità solidale</span>` : ""}
          <div class="listing-submeta">
            <span>Disponibile ${escapeHtml(formatDate(l.availableISO,l.available || "da concordare"))}</span>
            <span>🚲 ${escapeHtml(l.university || "Università")}: ${escapeHtml(String(l.universityMinutes || "—"))} min</span>
            <span>🚌 Centro: ${escapeHtml(String(l.centerMinutes || "—"))} min</span>
            ${l.household?.atmosphere ? `<span>👥 ${escapeHtml(l.household.atmosphere)}</span>` : ""}
          </div>
        </div>
        <div class="listing-price">
          <div class="price ${priceClass}">${money(l.price)}<small>/mese</small></div>
          <span class="expenses-badge ${expenseClass}">${expenseText}</span>
        </div>
        <div class="listing-actions">
          <button class="favorite-button" type="button" data-favorite="${escapeHtml(l.id)}" aria-label="Aggiungi ai preferiti">♡</button>
          <a href="annuncio.html?id=${encodeURIComponent(l.id)}" aria-label="Apri annuncio">›</a>
        </div>
      </article>`;
  }

  function setupCityPage(){
    const list = qs("#listing-results");
    if(!list) return;
    const params = new URLSearchParams(location.search);
    const requestedCity = citySlugFromValue(params.get("city") || CONFIG.defaultCity);
    const city = cityBySlug(requestedCity);
    const citySlug = city.slug;
    const cityName = city.name;
    const cityImageSlugs = new Set(["bologna","firenze","milano","napoli","padova","pisa","roma","torino"]);
    const heroImage = citySlug === "padova" ? "assets/img/padova-hero.webp" : cityImageSlugs.has(citySlug) ? `assets/img/citta-${citySlug}.webp` : "assets/img/italia-proposta1.webp";
    document.title = `Alloggi per studenti a ${cityName} | CasaStudent`;
    const seoDescription = `Stanze, posti letto e appartamenti per studenti a ${cityName}, con costi, spese e condizioni confrontabili.`;
    const metaDescription = qs('meta[name="description"]');
    if(metaDescription) metaDescription.content = seoDescription;
    updateSeo(document.title, seoDescription);
    if(qs("#city-breadcrumb")) qs("#city-breadcrumb").textContent = cityName;
    if(qs("#city-name")) qs("#city-name").textContent = cityName;
    if(qs("#city-description")) qs("#city-description").textContent = `Scopri gli alloggi nelle zone universitarie di ${cityName}. Ogni offerta evidenzia costi, spese e condizioni contrattuali.`;
    if(qs(".city-hero-bg")) qs(".city-hero-bg").style.backgroundImage = `url('${heroImage}')`;
    const controls = {
      zone: qs("#filter-zone"),
      type: qs("#filter-type"),
      price: qs("#filter-price"),
      expenses: qs("#filter-expenses"),
      arrangement: qs("#filter-arrangement"),
      available: qs("#filter-available"),
      sort: qs("#filter-sort")
    };
    if(controls.zone){
      controls.zone.innerHTML = `<option value="">Tutte le zone</option>` + (ZONES[citySlug] || []).map(zone => `<option value="${escapeHtml(zone)}">${escapeHtml(zone)}</option>`).join("");
    }
    if(params.get("type") && controls.type){
      const requested = params.get("type");
      const option = [...controls.type.options].find(o => o.value.toLowerCase().includes(requested.toLowerCase()) || requested.toLowerCase().includes(o.value.toLowerCase()));
      if(option) controls.type.value = option.value;
    }
    if(params.get("formula") === "intergenerazionale" && controls.arrangement){
      controls.arrangement.value = "intergenerational";
    }
    function render(){
      let items = allListings().filter(l => {
        if(listingCitySlug(l) !== citySlug) return false;
        if(controls.zone?.value && l.zone !== controls.zone.value) return false;
        if(controls.type?.value && l.type !== controls.type.value) return false;
        if(controls.price?.value && Number(l.price) > Number(controls.price.value)) return false;
        if(controls.expenses?.value === "included" && !l.expensesIncluded) return false;
        if(controls.expenses?.value === "excluded" && l.expensesIncluded) return false;
        if(controls.arrangement?.value === "intergenerational" && !l.intergenerational?.enabled) return false;
        if(controls.arrangement?.value === "standard" && l.intergenerational?.enabled) return false;
        if(controls.available?.value && l.availableISO && l.availableISO > controls.available.value) return false;
        return true;
      });
      const sort = controls.sort?.value;
      if(sort === "price-asc") items.sort((a,b) => a.price-b.price);
      if(sort === "price-desc") items.sort((a,b) => b.price-a.price);
      if(sort === "zone") items.sort((a,b) => a.zone.localeCompare(b.zone,"it"));
      list.innerHTML = items.length ? items.map(listingCard).join("") : `<div class="empty-state"><h3>Nessun annuncio disponibile a ${escapeHtml(cityName)}</h3><p>Il collegamento è attivo: puoi essere tra i primi a pubblicare un alloggio o una richiesta per questa città.</p><div class="empty-actions"><a class="btn btn-yellow" href="pubblica.html?city=${encodeURIComponent(citySlug)}">Pubblica un annuncio</a><a class="btn btn-white" href="cerco.html?city=${encodeURIComponent(citySlug)}">Cerco alloggio</a></div></div>`;
      const count = qs("#result-count");
      if(count) count.textContent = `${items.length} ${items.length === 1 ? "offerta trovata" : "offerte trovate"} a ${cityName}`;
      const heroCount = qs("#city-count");
      if(heroCount) heroCount.textContent = items.length ? `${items.length} ${items.length === 1 ? "annuncio disponibile" : "annunci disponibili"}` : "Città attiva — annunci in arrivo";
      const pagination = qs(".pagination");
      if(pagination) pagination.hidden = items.length < 6;
      setupFavorites();
    }
    Object.values(controls).filter(Boolean).forEach(c => c.addEventListener("change", render));
    render();
  }

  function getListingById(id){
    return allListings().find(x => String(x.id) === String(id)) || DATA.listings[0];
  }

  function setupDetail(){
    const root = qs("#detail-root");
    if(!root) return;
    const id = new URLSearchParams(location.search).get("id") || DATA.listings[0]?.id;
    const l = getListingById(id);
    const listingCity = cityBySlug(listingCitySlug(l));
    const robots = qs('meta[name="robots"]');
    if(robots && l.isDemo) robots.content = "noindex,follow";
    document.title = `${l.type} in ${l.zone}, ${listingCity.name} | CasaStudent`;
    updateSeo(document.title, `${l.type} in ${l.zone}, ${listingCity.name}: canone, spese, disponibilità e condizioni dell’alloggio.`);
    const detailCityLink = qs("#detail-city-link");
    if(detailCityLink){
      detailCityLink.textContent = listingCity.name;
      detailCityLink.href = `${CONFIG.cityPage}?city=${encodeURIComponent(listingCity.slug)}`;
    }
    const gallery = (l.gallery && l.gallery.length ? l.gallery : [l.image]).slice(0,4);
    while(gallery.length < 4) gallery.push(gallery[gallery.length-1] || "assets/img/alloggio-1.webp");
    root.innerHTML = detailTemplate(l, gallery);
    qsa(".thumb", root).forEach(btn => btn.addEventListener("click", () => {
      qs("#main-photo", root).src = btn.dataset.src;
    }));
    setupFavorites();
    setupProtectedContacts();
  }

  function detailTemplate(l, gallery){
    const listingCity = cityBySlug(listingCitySlug(l));
    const billList = (l.bills || []).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
    const rules = (l.rules || []).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
    const nearby = (l.nearby || []).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
    const email = encodeURIComponent(l.email || "info@casastudent.it");
    const wa = (l.whatsapp || "").replace(/\D/g,"");
    const phone = (l.phone || "").replace(/\s/g,"");
    const expenseText = l.expensesIncluded ? "Spese incluse" : `Spese escluse${l.expenses ? `: circa ${money(l.expenses)}/mese` : ""}`;
    const agency = l.publisher === "Agenzia" ? `<dt>Costo agenzia</dt><dd>${escapeHtml(l.agencyFee || "Da dichiarare")}</dd>` : "";
    const household = householdTemplate(l);
    const contactActions = l.isDemo ? `
      <div class="demo-contact-box"><strong>Annuncio di esempio</strong><span>I contatti non sono attivi perché questo contenuto serve a mostrare il funzionamento della piattaforma.</span></div>` : `
      ${wa ? `<a class="btn btn-green btn-block" data-protected-contact href="https://wa.me/${wa}?text=${encodeURIComponent("Buongiorno, vi contatto per l’annuncio CasaStudent "+l.id)}" target="_blank" rel="noopener">◉ Contatta su WhatsApp</a>` : ""}
      <a class="btn btn-blue btn-block" data-protected-contact href="mailto:${email}?subject=${encodeURIComponent("Richiesta informazioni annuncio "+l.id)}">✉ Invia un’email</a>
      ${phone ? `<a class="btn btn-white btn-block" data-protected-contact href="tel:${phone}">☎ Chiama: ${escapeHtml(l.phone)}</a>` : ""}`;
    return `
      <div class="detail-title-row">
        <div>
          <h1>${escapeHtml(l.type)} in ${escapeHtml(l.zone)} <span class="pill">${escapeHtml(l.tag || "")}</span></h1>
          <div class="top-meta"><span>♙ ${escapeHtml(l.type)}</span><span>⌂ ${escapeHtml(l.arrangement || "")}</span><span>▣ Disponibile ${escapeHtml(formatDate(l.availableISO,l.available || ""))}</span>${l.isDemo ? `<span class="demo-badge">Esempio dimostrativo</span>` : l.verified ? `<span class="verification-badge">✓ Inserzionista verificato</span>` : ""}</div>
          ${l.intergenerational?.enabled ? `<span class="solidarity-badge">🤝 Ospitalità solidale intergenerazionale</span>` : ""}
        </div>
        <div class="detail-price"><div class="price">${money(l.price)}<small>/mese</small></div><span class="expenses-badge ${l.expensesIncluded?"included":"excluded"}">${expenseText}</span></div>
        <button class="favorite-button" data-favorite="${escapeHtml(l.id)}" aria-label="Aggiungi ai preferiti">♡</button>
      </div>

      <div class="gallery-contact">
        <div class="gallery">
          <img id="main-photo" class="main-photo" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(l.type)} a ${escapeHtml(l.zone)}">
          <div class="thumbs">
            ${gallery.slice(1).map((src,i)=>`<button class="thumb" data-src="${escapeHtml(src)}" aria-label="Apri foto ${i+2}"><img src="${escapeHtml(src)}" alt=""></button>`).join("")}
          </div>
        </div>
        <aside class="contact-card">
          <h2>Contatta ${l.publisher === "Agenzia" ? "l’agenzia" : "l’inserzionista"}</h2>
          <p>Fai domande sui costi, sul contratto e sulla disponibilità prima di fissare la visita.</p>
          <div class="contact-stack">
            ${contactActions}
          </div>
          ${l.isDemo ? "" : `<p class="micro-note">I contatti sono protetti: accedi gratuitamente per utilizzarli.</p>`}
          <div class="safety-box"><strong>Affitta in sicurezza</strong><br>Non inviare denaro prima di aver verificato l’alloggio, il contratto e l’identità dell’inserzionista.</div>
        </aside>
      </div>

      <div class="distance-strip">
        <div class="distance-item"><b>🚲</b><span>Università ${escapeHtml(l.university || "")}<strong>${escapeHtml(String(l.universityMinutes || "—"))} min</strong></span></div>
        <div class="distance-item"><b>🚌</b><span>Centro città<strong>${escapeHtml(String(l.centerMinutes || "—"))} min</strong></span></div>
        <div class="distance-item"><b>🚶</b><span>Stazione dei treni<strong>5 min</strong></span></div>
        <div class="distance-item"><b>🛒</b><span>Supermercato<strong>3 min</strong></span></div>
        <div class="distance-item"><b>🚏</b><span>Fermata bus<strong>2 min</strong></span></div>
      </div>

      <div class="detail-grid">
        <section class="info-card">
          <h2>Dettagli dell’offerta</h2>
          <dl class="definition-list">
            <dt>Tipologia</dt><dd>${escapeHtml(l.type)}</dd>
            <dt>Superficie stanza</dt><dd>${escapeHtml(String(l.surface || "—"))} m²</dd>
            <dt>Superficie alloggio</dt><dd>${escapeHtml(String(l.apartmentSurface || "—"))} m²</dd>
            <dt>Coinquilini</dt><dd>${escapeHtml(String(l.roommates ?? "—"))}</dd>
            <dt>Piano</dt><dd>${escapeHtml(l.floor || "—")}</dd>
            <dt>Riscaldamento</dt><dd>${escapeHtml(l.heating || "—")}</dd>
            <dt>Aria condizionata</dt><dd>${escapeHtml(l.airConditioning || "—")}</dd>
            <dt>Wi‑Fi</dt><dd>${escapeHtml(l.wifi || "—")}</dd>
            <dt>Animali</dt><dd>${escapeHtml(l.pets || "—")}</dd>
            <dt>Fumatori</dt><dd>${escapeHtml(l.smokers || "—")}</dd>
            <dt>Contratto</dt><dd>${escapeHtml(l.contract || "—")}</dd>
            ${agency}
          </dl>
        </section>
        <section class="info-card"><h2>Cosa è incluso</h2><ul class="check-list">${billList || "<li>Informazioni da confermare</li>"}</ul></section>
        <div>
          <section class="info-card cost-card"><h2>Canone</h2><div class="price">${money(l.price)}<small>/mese</small></div><strong>${expenseText}</strong></section>
          <section class="info-card cost-card" style="margin-top:16px"><h2>Deposito cauzionale</h2><strong style="font-size:24px">${money(l.deposit)}</strong><br><span>${l.deposit && l.price ? (l.deposit/l.price).toFixed(0)+" mensilità" : "Da definire"}</span></section>
        </div>
      </div>

      ${household}
      ${intergenerationalTemplate(l)}

      <div class="description-grid">
        <section class="info-card">
          <h2>Descrizione</h2><p>${escapeHtml(l.description || "")}</p>
          <div class="description-columns">
            <div><h3>Regole della casa</h3><ul class="bullet-list">${rules}</ul></div>
            <div><h3>Servizi nelle vicinanze</h3><ul class="bullet-list">${nearby}</ul></div>
          </div>
        </section>
        <section class="info-card map-card"><h2>Dove si trova</h2><img src="assets/img/mappa-arcella.webp" alt="Mappa indicativa della zona"><strong>${escapeHtml(l.zone)}, ${escapeHtml(listingCity.name)}</strong><p>La posizione esatta viene condivisa dall’inserzionista prima della visita.</p></section>
      </div>

      <div class="detail-footer-grid">
        <section class="info-card"><h2>▣ Disponibilità</h2><strong>Disponibile ${escapeHtml(formatDate(l.availableISO,l.available || ""))}</strong><br><span>Permanenza minima: ${escapeHtml(l.minimumStay || "da concordare")}</span><br><span>Preavviso: ${escapeHtml(l.notice || "da concordare")}</span></section>
        <section class="info-card"><h2>◎ Chi pubblica</h2>${l.isDemo ? `<strong>Profilo dimostrativo</strong><br><span>Dati e date non rappresentano un’offerta reale.</span>` : `<strong>${escapeHtml(l.publisher || "Privato")}</strong>${l.verified ? `<br><span class="verification-badge">✓ Email verificata</span>` : ""}<br><span>Annuncio pubblicato il ${escapeHtml(l.published || "oggi")}</span><br><span>Ultimo aggiornamento: ${escapeHtml(l.updated || "oggi")}</span>`}</section>
        <section class="info-card"><h2>◇ ID annuncio</h2><strong>#${escapeHtml(l.id)}</strong><br><a href="mailto:segnalazioni@casastudent.it?subject=${encodeURIComponent("Segnalazione annuncio "+l.id)}" style="color:#1565a8;text-decoration:underline">Segnala annuncio</a></section>
      </div>`;
  }

  function intergenerationalTemplate(l){
    const data = l.intergenerational;
    if(!data?.enabled) return "";
    const help = (data.help || []).map(item => `<span>${escapeHtml(item)}</span>`).join("");
    return `
      <section class="info-card intergenerational-fields" aria-labelledby="solidarity-detail-title">
        <h2 id="solidarity-detail-title">🤝 Ospitalità solidale intergenerazionale</h2>
        <p>La stanza è proposta a prezzo agevolato in cambio di una presenza cordiale e di piccoli aiuti concordati.</p>
        <div class="solidarity-example-list">${help || "<span>Aiuto da concordare insieme</span>"}</div>
        <div class="household-grid" style="margin-top:14px">
          <div class="household-stat"><span>Impegno indicativo</span><strong>${escapeHtml(data.hours || "Da concordare")}</strong></div>
          <div class="household-stat"><span>Riduzione del canone</span><strong>${data.discount ? money(data.discount)+" al mese" : "Già compresa nel prezzo"}</strong></div>
        </div>
        <p class="micro-note">Il piccolo aiuto non comprende assistenza sanitaria, assistenza personale, somministrazione di farmaci o lavoro professionale.</p>
      </section>`;
  }

  function householdTemplate(l){
    const h = l.household || {};
    const isWholeApartment = Number(l.roommates || 0) === 0 || l.arrangement === "Appartamento intero";
    const composition = h.composition || (isWholeApartment ? "Appartamento intero" : `${l.roommates || "—"} coinquilini`);
    const interests = (h.interests || []).map(x => `<span class="profile-chip yellow">${escapeHtml(x)}</span>`).join("");
    const description = h.description || (isWholeApartment
      ? "L’alloggio viene affittato interamente: non sono presenti coinquilini già residenti."
      : "Il profilo completo dei coinquilini non è ancora stato compilato dall’inserzionista.");
    return `
      <section class="info-card household-panel" aria-labelledby="household-title">
        <h2 id="household-title">👥 Con chi vivrai</h2>
        <p>${escapeHtml(description)}</p>
        <div class="household-grid">
          <div class="household-stat"><span>Composizione</span><strong>${escapeHtml(composition)}</strong></div>
          <div class="household-stat"><span>Età indicativa</span><strong>${escapeHtml(h.ageRange || "Da chiedere")}</strong></div>
          <div class="household-stat"><span>Atmosfera</span><strong>${escapeHtml(h.atmosphere || "Da conoscere")}</strong></div>
          <div class="household-stat"><span>Lingue parlate</span><strong>${escapeHtml(h.languages || "Da chiedere")}</strong></div>
          <div class="household-stat"><span>Pulizie</span><strong>${escapeHtml(h.cleanliness || "Da concordare")}</strong></div>
          <div class="household-stat"><span>Ospiti</span><strong>${escapeHtml(h.guests || "Da concordare")}</strong></div>
          <div class="household-stat"><span>Cucina e pasti</span><strong>${escapeHtml(h.cooking || "Autonomi")}</strong></div>
          <div class="household-stat"><span>Fumo e animali</span><strong>${escapeHtml(`${l.smokers || "Da chiedere"} · ${l.pets || "Da chiedere"}`)}</strong></div>
        </div>
        ${interests ? `<div class="household-story"><strong>Interessi condivisi</strong><div class="profile-chips">${interests}</div></div>` : ""}
      </section>`;
  }

  function setupPublish(){
    const form = qs("#publish-form");
    if(!form) return;
    const expenseIncluded = qs("#expenses-included");
    const expenseAmountWrap = qs("#expense-amount-wrap");
    const agency = qs("#publisher-type");
    const agencyWrap = qs("#agency-fee-wrap");
    const arrangement = qs("#arrangement");
    const intergenerationalWrap = qs("#intergenerational-host-fields");
    function syncConditional(){
      if(expenseAmountWrap) expenseAmountWrap.classList.toggle("hidden", expenseIncluded?.value !== "no");
      if(agencyWrap) agencyWrap.classList.toggle("hidden", agency?.value !== "Agenzia");
      if(intergenerationalWrap) intergenerationalWrap.classList.toggle("hidden", arrangement?.value !== "Ospitalità intergenerazionale");
    }
    expenseIncluded?.addEventListener("change",syncConditional);
    agency?.addEventListener("change",syncConditional);
    arrangement?.addEventListener("change",syncConditional);
    if(new URLSearchParams(location.search).get("formula") === "intergenerazionale" && arrangement){
      arrangement.value = "Ospitalità intergenerazionale";
    }
    syncConditional();

    qs("#preview-button")?.addEventListener("click", () => {
      if(!form.reportValidity()) return;
      const l = formToListing(new FormData(form));
      const preview = qs("#publish-preview");
      preview.innerHTML = listingCard(l);
      preview.classList.add("active");
      setupFavorites();
      preview.scrollIntoView({behavior:"smooth",block:"center"});
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      if(!form.reportValidity()) return;
      const l = formToListing(new FormData(form));
      const saved = getUserListings();
      saved.unshift(l);
      localStorage.setItem("studentbnb_user_listings", JSON.stringify(saved));
      const msg = qs("#publish-success");
      const publishedCity = cityBySlug(citySlugFromValue(l.city));
      msg.classList.add("active");
      msg.innerHTML = `<strong>Annuncio salvato.</strong><br>È ora visibile nell’elenco di ${escapeHtml(publishedCity.name)} su questo dispositivo. <a href="padova.html?city=${encodeURIComponent(publishedCity.slug)}" style="text-decoration:underline">Apri gli annunci</a>.`;
      msg.scrollIntoView({behavior:"smooth",block:"center"});
      form.reset();
      syncConditional();
    });
  }

  function formToListing(fd){
    const city = cityBySlug(citySlugFromValue(fd.get("city")));
    const id = globalThis.crypto?.randomUUID?.() || `listing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const included = fd.get("expensesIncluded") === "yes";
    return {
      id, countryCode:CONFIG.countryCode, cityId:city.id, citySlug:city.slug, city:city.slug, zone:fd.get("zone"), tag:fd.get("tag") || "nuovo annuncio", type:fd.get("type"),
      arrangement:fd.get("arrangement"), price:Number(fd.get("price")), expensesIncluded:included,
      expenses:included ? 0 : Number(fd.get("expenses")||0), availableISO:fd.get("available"), available:formatDate(fd.get("available"),"Da concordare"),
      university:fd.get("university") || "Università", universityMinutes:Number(fd.get("universityMinutes")||0),
      centerMinutes:Number(fd.get("centerMinutes")||0), image:"assets/img/alloggio-1.webp",
      gallery:["assets/img/camera.webp","assets/img/cucina.webp","assets/img/bagno.webp","assets/img/corridoio.webp"],
      surface:Number(fd.get("surface")||0), apartmentSurface:Number(fd.get("apartmentSurface")||0),
      roommates:Number(fd.get("roommates")||0), floor:fd.get("floor"), heating:fd.get("heating"),
      airConditioning:fd.get("airConditioning"), wifi:fd.get("wifi"), pets:fd.get("pets"),
      smokers:fd.get("smokers"), contract:fd.get("contract"), deposit:Number(fd.get("deposit")||0),
      minimumStay:fd.get("minimumStay"), notice:fd.get("notice"),
      bills:fd.getAll("bills"), description:fd.get("description"),
      rules:(fd.get("rules")||"").split("\n").filter(Boolean),
      nearby:(fd.get("nearby")||"").split("\n").filter(Boolean),
      household:{
        composition:fd.get("householdComposition") || (Number(fd.get("roommates")||0) ? `${fd.get("roommates")} coinquilini` : "Appartamento intero"),
        ageRange:fd.get("householdAge") || "Da chiedere", languages:fd.get("householdLanguages") || "Da chiedere",
        atmosphere:fd.get("householdAtmosphere") || "Da conoscere", cleanliness:fd.get("householdCleanliness") || "Da concordare",
        guests:fd.get("householdGuests") || "Da concordare", cooking:fd.get("householdCooking") || "Autonomi",
        interests:fd.getAll("householdInterests"), description:fd.get("householdDescription") || ""
      },
      intergenerational:{
        enabled:fd.get("arrangement") === "Ospitalità intergenerazionale",
        help:fd.getAll("intergenerationalHelp"),hours:fd.get("intergenerationalHours"),
        discount:Number(fd.get("intergenerationalDiscount")||0),notes:fd.get("intergenerationalNotes") || ""
      },
      publisher:fd.get("publisherType"), agencyFee:fd.get("agencyFee"), phone:fd.get("phone"),
      email:fd.get("email"), whatsapp:(fd.get("whatsapp")||"").replace(/\D/g,""),
      verified:false,published:"oggi", updated:"oggi"
    };
  }

  function bindZoneSelector(citySelector, zoneSelector){
    const city = qs(citySelector);
    const zone = qs(zoneSelector);
    if(!city || !zone) return;
    const sync = () => {
      const items = ZONES[city.value] || [];
      zone.innerHTML = `<option value="">${items.length ? "Seleziona la zona" : "Prima seleziona la città"}</option>` + items.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("");
    };
    city.addEventListener("change", sync);
    sync();
  }

  function setupZoneSelectors(){
    bindZoneSelector("#city", "#zone");
    bindZoneSelector("#request-city", "#request-zone");
  }

  function requestCard(r){
    const initials = String(r.name || "S").split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase();
    const photo = r.photo ? `<img src="${escapeHtml(r.photo)}" alt="Foto profilo di ${escapeHtml(r.name)}">` : escapeHtml(initials);
    const languages = (r.languages || []).map(x => `<span class="profile-chip">${escapeHtml(x)}</span>`).join("");
    const interests = (r.interests || []).map(x => `<span class="profile-chip yellow">${escapeHtml(x)}</span>`).join("");
    const wa = String(r.whatsapp || "").replace(/\D/g,"");
    const phone = String(r.phone || "").replace(/\s/g,"");
    return `
      <article class="request-card${r.livingModel === "intergenerational" ? " intergenerational" : ""}" data-request-id="${escapeHtml(r.id)}">
        <div class="student-avatar">${photo}</div>
        <div>
          <div class="request-card-head">
            <div><h2>${escapeHtml(r.name)}${r.age ? `, ${escapeHtml(r.age)}` : ""}</h2><div class="request-subtitle">${escapeHtml(r.course || "Studente")} · ${escapeHtml(r.university || r.city)}</div></div>
            <div class="request-budget">${money(r.budget)}<small>/mese max</small></div>
          </div>
          ${r.isDemo ? `<div class="demo-badge">Profilo dimostrativo</div>` : r.verified ? `<div class="verification-badge">✓ Profilo studente verificato</div>` : `<div class="request-subtitle">Profilo non ancora verificato</div>`}
          ${r.livingModel === "intergenerational" ? `<div class="solidarity-badge">🤝 Disponibile all’ospitalità solidale</div>` : ""}
          <div class="profile-chips">${languages}${interests}</div>
          <p class="request-summary">${escapeHtml(r.bio || "")}</p>
          <div class="request-facts">
            <div><span>Cerca</span><strong>${escapeHtml(r.type || "Alloggio")}</strong></div>
            <div><span>Zone</span><strong>${escapeHtml(r.zones || "Qualsiasi zona")}</strong></div>
            <div><span>Periodo</span><strong>${escapeHtml(formatDate(r.availableFromISO,r.availableFrom || "Da concordare"))} – ${escapeHtml(formatDate(r.availableToISO,r.availableTo || "flessibile"))}</strong></div>
            <div><span>Convivenza</span><strong>${escapeHtml(r.sociality || r.lifestyle || "Flessibile")}</strong></div>
            <div><span>Fumo / animali</span><strong>${escapeHtml(`${r.smoking || "Da indicare"} · ${r.pets || "Da indicare"}`)}</strong></div>
            <div><span>Ordine e cucina</span><strong>${escapeHtml(`${r.cleanliness || "Da indicare"} · ${r.cooking || "Da indicare"}`)}</strong></div>
            ${r.livingModel === "intergenerational" ? `<div><span>Piccolo aiuto</span><strong>${escapeHtml((r.intergenerationalHelp || []).join(", ") || "Da concordare")}</strong></div><div><span>Tempo massimo</span><strong>${escapeHtml(r.intergenerationalHours || "Da concordare")}</strong></div>` : ""}
          </div>
        </div>
        <div class="request-card-actions">
          ${r.isDemo ? `<span class="demo-contact-inline">Contatti non attivi per i profili di esempio.</span>` : `
            ${wa ? `<a class="btn btn-green" data-protected-contact href="https://wa.me/${wa}?text=${encodeURIComponent("Buongiorno "+r.name+", ti contatto per la tua richiesta su CasaStudent "+r.id)}" target="_blank" rel="noopener">◉ WhatsApp</a>` : ""}
            ${r.email ? `<a class="btn btn-blue" data-protected-contact href="mailto:${escapeHtml(r.email)}?subject=${encodeURIComponent("Proposta alloggio CasaStudent "+r.id)}">✉ Email</a>` : ""}
            ${phone ? `<a class="btn btn-white" data-protected-contact href="tel:${escapeHtml(phone)}">☎ Chiama</a>` : ""}`}
        </div>
      </article>`;
  }

  function setupStudentRequestsPage(){
    const root = qs("#student-request-results");
    if(!root) return;
    const city = qs("#student-filter-city");
    const zone = qs("#student-filter-zone");
    const type = qs("#student-filter-type");
    const budget = qs("#student-filter-budget");
    const available = qs("#student-filter-available");
    const livingModel = qs("#student-filter-living-model");
    const university = qs("#student-filter-university");
    const language = qs("#student-filter-language");
    const smoking = qs("#student-filter-smoking");
    const sort = qs("#student-filter-sort");
    const syncZones = () => {
      if(!zone) return;
      const zones = city?.value ? (ZONES[city.value] || []) : [];
      zone.innerHTML = `<option value="">Tutte le zone</option>` + zones.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
    };
    city?.addEventListener("change",syncZones);
    syncZones();
    const render = () => {
      let items = allStudentRequests().filter(r => {
        if(city?.value && citySlugFromValue(r.city) !== city.value) return false;
        if(zone?.value && !String(r.zones || "").toLowerCase().includes(zone.value.toLowerCase())) return false;
        if(type?.value && r.type !== type.value) return false;
        if(budget?.value && Number(r.budget) < Number(budget.value)) return false;
        if(available?.value && r.availableFromISO && r.availableFromISO > available.value) return false;
        if(livingModel?.value && r.livingModel !== livingModel.value) return false;
        if(university?.value && !`${r.university || ""} ${r.course || ""}`.toLowerCase().includes(university.value.toLowerCase())) return false;
        if(language?.value && !(r.languages || []).some(item => item.toLowerCase().includes(language.value.toLowerCase()))) return false;
        if(smoking?.value && !String(r.smoking || "").toLowerCase().includes(smoking.value.toLowerCase())) return false;
        return true;
      });
      if(sort?.value === "budget-asc") items.sort((a,b)=>a.budget-b.budget);
      if(sort?.value === "budget-desc") items.sort((a,b)=>b.budget-a.budget);
      root.innerHTML = items.length ? items.map(requestCard).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>Nessun profilo con questi filtri</h3><p>Prova a cambiare città, tipologia o budget.</p></div>`;
      const count = qs("#student-request-count");
      if(count) count.textContent = `${items.length} ${items.length === 1 ? "studente cerca" : "studenti cercano"} un alloggio`;
      setupProtectedContacts();
    };
    [city,zone,type,budget,available,livingModel,university,language,smoking,sort].filter(Boolean).forEach(x => {
      x.addEventListener(x.tagName === "INPUT" ? "input" : "change",render);
    });
    render();
  }

  function fileAsDataUrl(file){
    return new Promise(resolve => {
      if(!file){ resolve(""); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  function setupStudentRequestForm(){
    const form = qs("#student-request-form");
    if(!form) return;
    const photoInput = qs("#student-photo");
    const photoPreview = qs("#student-photo-preview");
    const livingModel = qs("#student-living-model");
    const intergenerationalWrap = qs("#student-intergenerational-fields");
    const syncLivingModel = () => intergenerationalWrap?.classList.toggle("hidden", livingModel?.value !== "intergenerational");
    livingModel?.addEventListener("change",syncLivingModel);
    if(new URLSearchParams(location.search).get("formula") === "intergenerazionale" && livingModel){
      livingModel.value = "intergenerational";
    }
    syncLivingModel();
    photoInput?.addEventListener("change", () => {
      const file = photoInput.files?.[0];
      if(!file || file.size > 1500000){
        if(file) toast("La foto profilo deve pesare meno di 1,5 MB");
        photoInput.value = "";
        photoPreview?.classList.remove("active");
        return;
      }
      const url = URL.createObjectURL(file);
      if(photoPreview){ photoPreview.src = url; photoPreview.classList.add("active"); }
    });
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if(!form.reportValidity()) return;
      const fd = new FormData(form);
      const photo = await fileAsDataUrl(photoInput?.files?.[0]);
      const requestCity = cityBySlug(citySlugFromValue(fd.get("city")));
      const r = {
        id:(globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(16).slice(2)}`),countryCode:CONFIG.countryCode,cityId:requestCity.id,citySlug:requestCity.slug,name:fd.get("name"),age:fd.get("age"),city:requestCity.name,
        zones:[fd.get("zone"),fd.get("otherZones")].filter(Boolean).join(", "),type:fd.get("type"),budget:Number(fd.get("budget")),
        availableFromISO:fd.get("availableFrom"),availableToISO:fd.get("availableTo"),availableFrom:formatDate(fd.get("availableFrom"),"Da concordare"),availableTo:formatDate(fd.get("availableTo"),"Flessibile"),university:fd.get("university"),course:fd.get("course"),studyYear:fd.get("studyYear"),
        languages:(fd.get("languages")||"").split(",").map(x=>x.trim()).filter(Boolean),smoking:fd.get("smoking"),pets:fd.get("pets"),
        lifestyle:fd.get("lifestyle"),cleanliness:fd.get("cleanliness"),sociality:fd.get("sociality"),cooking:fd.get("cooking"),
        livingModel:fd.get("livingModel") || "standard",intergenerationalHelp:fd.getAll("intergenerationalHelp"),intergenerationalHours:fd.get("intergenerationalHours"),
        interests:fd.getAll("interests"),bio:fd.get("bio"),email:fd.get("email"),phone:fd.get("phone"),
        whatsapp:String(fd.get("whatsapp")||"").replace(/\D/g,""),photo,verified:false,published:"oggi"
      };
      const saved = getUserRequests();
      saved.unshift(r);
      localStorage.setItem("studentbnb_student_requests",JSON.stringify(saved));
      const msg = qs("#request-success");
      if(msg){
        msg.classList.add("active");
        msg.innerHTML = `<strong>Richiesta salvata.</strong><br>Il tuo profilo è ora visibile nella pagina <a href="studenti.html" style="text-decoration:underline">Studenti in cerca</a> su questo dispositivo.`;
        msg.scrollIntoView({behavior:"smooth",block:"center"});
      }
      form.reset();
      syncLivingModel();
      photoPreview?.classList.remove("active");
      qs("#request-city")?.dispatchEvent(new Event("change"));
    });
  }

  function setupProtectedContacts(){
    qsa("[data-protected-contact]").forEach(link => {
      if(link.dataset.protectionBound === "true") return;
      link.dataset.protectionBound = "true";
      link.addEventListener("click", e => {
        if(localStorage.getItem("studentbnb_user")) return;
        e.preventDefault();
        qs("#login-modal")?.classList.add("active");
        toast("Accedi gratuitamente per utilizzare i contatti");
      });
    });
  }

  function setupAlerts(){
    qsa("[data-save-alert]").forEach(button => button.addEventListener("click", () => {
      if(!localStorage.getItem("studentbnb_user")){
        qs("#login-modal")?.classList.add("active");
        toast("Accedi per salvare la ricerca e ricevere gli avvisi");
        return;
      }
      const alerts = JSON.parse(localStorage.getItem("studentbnb_alerts") || "[]");
      const filters = Object.fromEntries(qsa(".filters input,.filters select").filter(field => field.id).map(field => [field.id,field.value]));
      alerts.push({page:location.pathname,query:location.search,filters,created:new Date().toISOString()});
      localStorage.setItem("studentbnb_alerts",JSON.stringify(alerts));
      toast("Ricerca salvata. Gli avvisi sono attivi su questo dispositivo");
    }));
  }

  function setupWizard(formSelector, progressSelector){
    const form = qs(formSelector);
    const progress = qs(progressSelector);
    if(!form || !progress) return;
    const sections = qsa(":scope > .form-section",form);
    const steps = qsa(".progress-step",progress);
    if(sections.length < 2) return;
    let current = 0;
    form.classList.add("wizard-ready");
    sections.forEach((section,index) => {
      if(index < sections.length - 1){
        const controls = document.createElement("div");
        controls.className = "wizard-controls";
        controls.innerHTML = `${index ? `<button class="btn btn-white" type="button" data-wizard-back>← Indietro</button>` : "<span></span>"}<button class="btn btn-yellow" type="button" data-wizard-next>Continua →</button>`;
        section.appendChild(controls);
      } else {
        const actions = qs(".form-actions",section);
        if(actions && !qs("[data-wizard-back]",actions)){
          const back = document.createElement("button");
          back.type = "button";
          back.className = "btn btn-white";
          back.dataset.wizardBack = "";
          back.textContent = "← Indietro";
          actions.prepend(back);
        }
      }
    });
    const show = index => {
      current = Math.max(0,Math.min(index,sections.length-1));
      sections.forEach((section,i) => section.hidden = i !== current);
      steps.forEach((step,i) => {
        step.classList.toggle("active",i === current);
        step.classList.toggle("completed",i < current);
      });
      progress.scrollIntoView({behavior:"smooth",block:"center"});
    };
    form.addEventListener("click",event => {
      const next = event.target.closest("[data-wizard-next]");
      const back = event.target.closest("[data-wizard-back]");
      if(next){
        const invalid = qsa("input,select,textarea",sections[current]).find(field => !field.checkValidity());
        if(invalid){ invalid.reportValidity(); return; }
        show(current+1);
      }
      if(back) show(current-1);
    });
    show(0);
  }

  function escapeHtml(value){
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupCitySelectors();
    setupHeader();
    setupPublishMenus();
    setupHome();
    setupDemoNotice();
    setupCityPage();
    setupDetail();
    setupPublish();
    setupZoneSelectors();
    setupStudentRequestForm();
    setupStudentRequestsPage();
    setupFavorites();
    setupProtectedContacts();
    setupAlerts();
    setupWizard("#publish-form",".progress.five");
    setupWizard("#student-request-form",".progress.three");
  });
})();
