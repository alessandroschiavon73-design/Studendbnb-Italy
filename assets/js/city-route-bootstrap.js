(() => {
  "use strict";
  const script = document.currentScript;
  const slug = script?.dataset?.cityRoute;
  if (!slug) return;

  const originalTitle = document.title;
  const originalDescription = document.head.querySelector('meta[name="description"]')?.content || "";
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete("city");
  const runtimeUrl = new URL(location.href);

  /* The route path is authoritative. Never allow ?city= to make /bologna/
     render Milano (or any other mismatched city). */
  runtimeUrl.searchParams.set("city", slug);

  if (runtimeUrl.href !== location.href) history.replaceState(history.state, "", runtimeUrl.href);

  const restoreCleanUrl = () => {
    history.replaceState(history.state, "", cleanUrl.href);
    document.title = originalTitle;
    const description = document.head.querySelector('meta[name="description"]');
    if (description && originalDescription) description.content = originalDescription;

    const canonical = `https://casastudent.it/${encodeURIComponent(slug)}/`;
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const og = document.head.querySelector('meta[property="og:url"]');
    if (og) og.content = canonical;
    const ogTitle = document.head.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = originalTitle;
    const ogDescription = document.head.querySelector('meta[property="og:description"]');
    if (ogDescription && originalDescription) ogDescription.content = originalDescription;
    const twitterTitle = document.head.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = originalTitle;
    const twitterDescription = document.head.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && originalDescription) twitterDescription.content = originalDescription;

    /* Until equivalent city pages exist on every country domain, homepage
       hreflang links would be misleading on a city URL. */
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(item => item.remove());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(restoreCleanUrl, 0), { once: true });
  } else {
    setTimeout(restoreCleanUrl, 0);
  }
})();
