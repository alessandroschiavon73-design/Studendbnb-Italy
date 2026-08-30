(() => {
  "use strict";

  const CONFIG = window.STUDENTBNB_CONFIG || {};
  if (CONFIG.apiMode !== "supabase" || !CONFIG.supabaseUrl || !CONFIG.supabasePublishableKey) return;

  const COUNTRY = CONFIG.countryCode || "IT";
  const LISTINGS_KEY = "studentbnb_user_listings";
  const REQUESTS_KEY = "studentbnb_student_requests";
  const FAVORITES_KEY = "studentbnb_favorites";
  const SYNCED_LISTINGS_KEY = "casastudent_synced_listing_ids";
  const SYNCED_REQUESTS_KEY = "casastudent_synced_request_ids";
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  let client = null;
  let session = null;
  let cityMap = new Map();

  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  function safeJson(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function getArray(key) {
    const value = safeJson(localStorage.getItem(key) || "[]", []);
    return Array.isArray(value) ? value : [];
  }

  function setArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getIdSet(key) {
    return new Set(getArray(key));
  }

  function rememberId(key, id) {
    if (!id) return;
    const ids = getIdSet(key);
    ids.add(String(id));
    setArray(key, [...ids]);
  }

  function notify(message, error = false) {
    let el = qs("#casastudent-db-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "casastudent-db-toast";
      Object.assign(el.style, {
        position: "fixed", right: "18px", bottom: "18px", zIndex: "99999",
        maxWidth: "360px", padding: "13px 16px", borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,.18)", font: "600 14px/1.35 system-ui,sans-serif"
      });
      document.body.appendChild(el);
    }
    el.style.background = error ? "#fff1f1" : "#fff8d8";
    el.style.color = "#1d1d1d";
    el.style.border = error ? "1px solid #e2aaaa" : "1px solid #efd66b";
    el.textContent = message;
    el.hidden = false;
    clearTimeout(window.__casastudentDbToastTimer);
    window.__casastudentDbToastTimer = setTimeout(() => { el.hidden = true; }, 5500);
  }

  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = qs('script[data-casastudent-supabase-sdk]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = SDK_URL;
      s.async = true;
      s.dataset.casastudentSupabaseSdk = "1";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Impossibile caricare la libreria Supabase"));
      document.head.appendChild(s);
    });
  }

  function updateAccountUi() {
    const email = session?.user?.email || "";
    if (email) localStorage.setItem("studentbnb_user", email);
    else localStorage.removeItem("studentbnb_user");
    qsa("[data-account-label]").forEach(el => {
      el.textContent = email ? email.split("@")[0] : "Accedi";
    });
  }

  function openLogin() {
    qs("#login-modal")?.classList.add("active");
    const email = session?.user?.email;
    if (email) notify(`Sei già collegato come ${email}`);
  }

  function enhanceNotices() {
    qsa(".notice").forEach(el => {
      if (/salvat[oa].*browser|prototipo/i.test(el.textContent || "")) {
        el.innerHTML = "<strong>Database attivo:</strong> dopo l’accesso, annunci e richieste vengono salvati nel database CasaStudent e diventano disponibili anche dagli altri dispositivi.";
      }
    });
  }

  async function handleLogin(form) {
    if (!client) return;
    const email = String(new FormData(form).get("email") || "").trim();
    if (!email) return;
    const redirectTo = `${location.origin}${location.pathname}`;
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    });
    if (error) {
      notify(`Accesso non inviato: ${error.message}`, true);
      return;
    }
    notify("Ti abbiamo inviato un link di accesso via email. Aprilo per entrare in CasaStudent.");
    const modal = qs("#login-modal");
    if (modal) modal.classList.remove("active");
  }

  async function loadCities() {
    const { data, error } = await client
      .from("cities")
      .select("id,slug,name,country_code")
      .eq("country_code", COUNTRY)
      .eq("active", true);
    if (error) throw error;
    cityMap = new Map((data || []).map(city => [city.id, city]));
    return data || [];
  }

  async function cityForSlug(slug) {
    for (const city of cityMap.values()) if (city.slug === slug) return city;
    const { data, error } = await client
      .from("cities")
      .select("id,slug,name,country_code")
      .eq("country_code", COUNTRY)
      .eq("slug", slug)
      .single();
    if (error) throw error;
    cityMap.set(data.id, data);
    return data;
  }

  function parseLegacyDescription(text) {
    if (!text) return {};
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.casastudentLegacy && parsed.payload) return parsed.payload;
    } catch {}
    return { description: text };
  }

  function listingTypeToDb(type) {
    const value = String(type || "").toLowerCase();
    if (value.includes("posto letto")) return "bed";
    if (value.includes("stanza")) return "room";
    if (value.includes("monolocale")) return "studio";
    if (value.includes("bilocale") || value.includes("appartamento")) return "apartment";
    return "other";
  }

  function listingTypeFromDb(type) {
    return ({ room: "Stanza singola", bed: "Posto letto in doppia", studio: "Monolocale", apartment: "Appartamento", other: "Alloggio" })[type] || "Alloggio";
  }

  function firstPositiveNumber(...values) {
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  function firstInteger(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  function contactValue(obj, key) {
    return obj?.[key] || obj?.contact?.[key] || obj?.contacts?.[key] || null;
  }

  function publicLegacyPayload(obj) {
    const copy = { ...(obj || {}) };
    delete copy.email;
    delete copy.phone;
    delete copy.whatsapp;
    delete copy.telegram;
    delete copy.contact;
    delete copy.contacts;
    delete copy.contactEmail;
    delete copy.contactPhone;
    delete copy.contactWhatsapp;
    delete copy.contactTelegram;
    return copy;
  }

  function mapRemoteListing(row) {
    const legacy = parseLegacyDescription(row.description);
    const city = cityMap.get(row.city_id);
    return {
      ...legacy,
      id: row.id,
      countryCode: row.country_code,
      cityId: row.city_id,
      citySlug: city?.slug || legacy.citySlug || legacy.city || CONFIG.defaultCity,
      city: city?.slug || legacy.city || CONFIG.defaultCity,
      zone: legacy.zone || city?.name || "Centro",
      type: legacy.type || listingTypeFromDb(row.listing_type),
      arrangement: row.arrangement || legacy.arrangement || "",
      price: Number(row.price || legacy.price || 0),
      expensesIncluded: Boolean(row.expenses_included),
      expenses: Number(row.expenses_amount || legacy.expenses || 0),
      availableISO: row.available_from || legacy.availableISO || "",
      image: legacy.image || "assets/img/alloggio-1.webp",
      gallery: Array.isArray(legacy.gallery) && legacy.gallery.length ? legacy.gallery : ["assets/img/camera.webp","assets/img/cucina.webp","assets/img/bagno.webp","assets/img/corridoio.webp"],
      email: row.contact_email || legacy.email || "",
      phone: row.contact_phone || legacy.phone || "",
      whatsapp: row.contact_whatsapp || legacy.whatsapp || "",
      telegram: row.contact_telegram || legacy.telegram || "",
      verified: false,
      isDemo: false,
      _remote: true
    };
  }

  function mapRemoteRequest(row) {
    const legacy = parseLegacyDescription(row.description);
    const city = cityMap.get(row.city_id);
    return {
      ...legacy,
      id: row.id,
      countryCode: row.country_code,
      cityId: row.city_id,
      citySlug: city?.slug || legacy.citySlug || legacy.city || CONFIG.defaultCity,
      city: city?.slug || legacy.city || CONFIG.defaultCity,
      type: legacy.type || row.accommodation_type || "Alloggio",
      budget: Number(row.budget_max || legacy.budget || 0),
      availableFrom: row.available_from || legacy.availableFrom || "",
      availableTo: row.available_to || legacy.availableTo || "",
      email: row.contact_email || legacy.email || "",
      phone: row.contact_phone || legacy.phone || "",
      whatsapp: row.contact_whatsapp || legacy.whatsapp || "",
      telegram: row.contact_telegram || legacy.telegram || "",
      verified: false,
      _remote: true
    };
  }

  async function refreshRemoteCache({ reload = false } = {}) {
    if (!client) return;
    if (!cityMap.size) await loadCities();

    const listingSource = session?.user ? "listings" : "public_listings";
    const requestSource = session?.user ? "student_requests" : "public_student_requests";
    const [listingsResult, requestsResult] = await Promise.all([
      client.from(listingSource).select("*").eq("country_code", COUNTRY).eq("status", "published").order("created_at", { ascending: false }),
      client.from(requestSource).select("*").eq("country_code", COUNTRY).eq("status", "published").order("created_at", { ascending: false })
    ]);
    if (listingsResult.error) throw listingsResult.error;
    if (requestsResult.error) throw requestsResult.error;

    const remoteListings = (listingsResult.data || []).map(mapRemoteListing);
    const remoteRequests = (requestsResult.data || []).map(mapRemoteRequest);
    const pendingListings = getArray(LISTINGS_KEY).filter(item => item && item._syncPending && !item._remote);
    const pendingRequests = getArray(REQUESTS_KEY).filter(item => item && item._syncPending && !item._remote);

    const oldListings = localStorage.getItem(LISTINGS_KEY) || "[]";
    const oldRequests = localStorage.getItem(REQUESTS_KEY) || "[]";
    const newListings = JSON.stringify([...pendingListings, ...remoteListings]);
    const newRequests = JSON.stringify([...pendingRequests, ...remoteRequests]);
    localStorage.setItem(LISTINGS_KEY, newListings);
    localStorage.setItem(REQUESTS_KEY, newRequests);

    if (reload && (oldListings !== newListings || oldRequests !== newRequests)) {
      const relevant = qs("#listing-results") || qs("#listing-detail") || qs("#student-results") || qs("[data-student-results]");
      if (relevant) {
        const stamp = `${newListings.length}:${newRequests.length}`;
        if (sessionStorage.getItem("casastudent_db_reload_stamp") !== stamp) {
          sessionStorage.setItem("casastudent_db_reload_stamp", stamp);
          location.reload();
        }
      }
    }
  }

  async function syncNewestListing() {
    if (!client || !session?.user) return;
    const items = getArray(LISTINGS_KEY);
    const local = items.find(item => item && !item._remote && !getIdSet(SYNCED_LISTINGS_KEY).has(String(item.id)));
    if (!local) return;

    try {
      const city = await cityForSlug(local.citySlug || local.city || CONFIG.defaultCity);
      const payload = {
        country_code: COUNTRY,
        city_id: city.id,
        district_id: null,
        publisher_user_id: session.user.id,
        title: local.title || [local.type, local.zone, city.name].filter(Boolean).join(" · "),
        description: JSON.stringify({ casastudentLegacy: 1, payload: publicLegacyPayload(local) }),
        listing_type: listingTypeToDb(local.type),
        arrangement: local.arrangement || null,
        price: Number(local.price || 0),
        currency: CONFIG.currency || "EUR",
        expenses_included: Boolean(local.expensesIncluded),
        expenses_amount: Number(local.expenses || 0),
        deposit: firstPositiveNumber(local.deposit),
        agency_fee: firstPositiveNumber(local.agencyFee),
        available_from: local.availableISO || local.availableFrom || null,
        available_to: local.availableTo || null,
        minimum_stay_months: firstInteger(local.minimumStay),
        square_meters: firstPositiveNumber(local.surface, local.apartmentSurface),
        furnished: null,
        wifi_included: /sì|si|fibra/i.test(String(local.wifi || "")),
        address: local.address || null,
        latitude: null,
        longitude: null,
        contact_name: contactValue(local, "name"),
        contact_phone: contactValue(local, "phone"),
        contact_email: contactValue(local, "email") || session.user.email,
        contact_whatsapp: contactValue(local, "whatsapp"),
        contact_telegram: contactValue(local, "telegram"),
        status: "published",
        featured: false,
        published_at: new Date().toISOString()
      };
      const { error } = await client.from("listings").insert(payload);
      if (error) throw error;
      rememberId(SYNCED_LISTINGS_KEY, local.id);
      setArray(LISTINGS_KEY, items.filter(item => item?.id !== local.id));
      const msg = qs("#publish-success");
      if (msg) msg.innerHTML = `<strong>Annuncio pubblicato online.</strong><br>È stato salvato nel database CasaStudent ed è disponibile anche dagli altri dispositivi.`;
      notify("Annuncio salvato nel database CasaStudent.");
      await refreshRemoteCache();
    } catch (error) {
      const next = items.map(item => item?.id === local.id ? { ...item, _syncPending: true } : item);
      setArray(LISTINGS_KEY, next);
      notify(`L’annuncio è rimasto in attesa di sincronizzazione: ${error.message}`, true);
    }
  }

  async function syncNewestRequest() {
    if (!client || !session?.user) return;
    const items = getArray(REQUESTS_KEY);
    const local = items.find(item => item && !item._remote && !getIdSet(SYNCED_REQUESTS_KEY).has(String(item.id)));
    if (!local) return;

    try {
      const city = await cityForSlug(local.citySlug || local.city || CONFIG.defaultCity);
      const payload = {
        country_code: COUNTRY,
        city_id: city.id,
        district_id: null,
        user_id: session.user.id,
        title: local.title || `${local.name || "Studente"} cerca ${local.type || "alloggio"} a ${city.name}`,
        description: JSON.stringify({ casastudentLegacy: 1, payload: publicLegacyPayload(local) }),
        accommodation_type: local.type || null,
        budget_max: Number(local.budget || 0),
        currency: CONFIG.currency || "EUR",
        available_from: local.availableFrom || null,
        available_to: local.availableTo || null,
        minimum_stay_months: firstInteger(local.duration),
        contact_phone: local.phone || null,
        contact_email: local.email || session.user.email,
        contact_whatsapp: local.whatsapp || null,
        contact_telegram: local.telegram || null,
        status: "published",
        published_at: new Date().toISOString()
      };
      const { error } = await client.from("student_requests").insert(payload);
      if (error) throw error;
      rememberId(SYNCED_REQUESTS_KEY, local.id);
      setArray(REQUESTS_KEY, items.filter(item => item?.id !== local.id));
      const msg = qs("#request-success");
      if (msg) msg.innerHTML = `<strong>Richiesta pubblicata online.</strong><br>È stata salvata nel database CasaStudent ed è disponibile anche dagli altri dispositivi.`;
      notify("Richiesta studente salvata nel database CasaStudent.");
      await refreshRemoteCache();
    } catch (error) {
      const next = items.map(item => item?.id === local.id ? { ...item, _syncPending: true } : item);
      setArray(REQUESTS_KEY, next);
      notify(`La richiesta è rimasta in attesa di sincronizzazione: ${error.message}`, true);
    }
  }

  async function syncFavorite(listingId) {
    if (!client || !session?.user || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listingId)) return;
    const selected = new Set(getArray(FAVORITES_KEY)).has(listingId);
    if (selected) {
      const { error } = await client.from("favorites").upsert({ user_id: session.user.id, listing_id: listingId });
      if (error) console.warn("CasaStudent favorite sync", error);
    } else {
      const { error } = await client.from("favorites").delete().eq("user_id", session.user.id).eq("listing_id", listingId);
      if (error) console.warn("CasaStudent favorite sync", error);
    }
  }

  function installEventBridge() {
    document.addEventListener("submit", event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (form.id === "login-form") {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleLogin(form).catch(error => notify(error.message, true));
        return;
      }

      if ((form.id === "publish-form" || form.id === "student-request-form") && !session?.user) {
        event.preventDefault();
        event.stopImmediatePropagation();
        notify("Per pubblicare nel database devi prima accedere con la tua email.", true);
        openLogin();
      }
    }, true);

    document.addEventListener("submit", event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !session?.user) return;
      if (form.id === "publish-form") setTimeout(() => syncNewestListing(), 50);
      if (form.id === "student-request-form") setTimeout(() => syncNewestRequest(), 50);
    });

    document.addEventListener("click", event => {
      const button = event.target.closest?.("[data-favorite]");
      if (!button) return;
      setTimeout(() => syncFavorite(button.getAttribute("data-favorite")), 0);
    });

    document.addEventListener("click", event => {
      const link = event.target.closest?.("[data-login]");
      if (!link || !session?.user) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (confirm(`Sei collegato come ${session.user.email}. Vuoi uscire?`)) {
        client.auth.signOut().then(() => {
          session = null;
          updateAccountUi();
          notify("Disconnessione effettuata.");
        });
      }
    }, true);
  }

  async function init() {
    try {
      await loadSdk();
      client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      window.StudentBnBSupabase = client;

      const result = await client.auth.getSession();
      session = result.data.session || null;
      updateAccountUi();
      client.auth.onAuthStateChange((_event, nextSession) => {
        session = nextSession;
        updateAccountUi();
        if (nextSession?.user) {
          notify("Accesso CasaStudent completato.");
          refreshRemoteCache({ reload: true }).catch(console.warn);
        }
      });

      enhanceNotices();
      installEventBridge();
      await refreshRemoteCache({ reload: true });
      document.documentElement.dataset.casastudentDatabase = "connected";
    } catch (error) {
      console.error("CasaStudent Supabase integration", error);
      document.documentElement.dataset.casastudentDatabase = "error";
      notify(`Database non raggiungibile: ${error.message}`, true);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
