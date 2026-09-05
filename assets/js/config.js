window.STUDENTBNB_CONFIG=Object.freeze({
  appName:"StudentBnB",brandLine:"Prova prima di scegliere",countryCode:"IT",countryName:"Italia",locale:"it-IT",currency:"EUR",domain:"studentbnb.it",defaultCity:"padova",cityPage:"citta.html",reportEmail:"segnalazioni@studentbnb.it",apiMode:"supabase",apiBase:"/api/v1",supabaseUrl:"https://etyvaugscofodkhklqqz.supabase.co",supabasePublishableKey:"sb_publishable_MJiby1pof0ghYnw1UMx-jQ_bpQKyd0L",unifiedDatabase:true,schemaVersion:"2.0-spain-base"
});
(function(){
 const cfg=window.STUDENTBNB_CONFIG;
 function meta(k,v,c){let e=document.head.querySelector(`meta[${k}="${v}"]`);if(!e){e=document.createElement('meta');e.setAttribute(k,v);document.head.appendChild(e)}e.content=c}
 function link(r,h,l){const s=`link[rel="${r}"]${l?`[hreflang="${l}"]`:''}`;let e=document.head.querySelector(s);if(!e){e=document.createElement('link');e.rel=r;if(l)e.hreflang=l;document.head.appendChild(e)}e.href=h}
 function updateSeo(title,description){const t=typeof title==='string'?title:document.title;const d=description||document.querySelector('meta[name="description"]')?.content||'Soggiorni di prova per studenti in Italia.';const u=`https://${cfg.domain}${location.pathname}${location.search}`;link('canonical',u);meta('name','robots','index,follow,max-image-preview:large');meta('property','og:site_name','StudentBnB');meta('property','og:type','website');meta('property','og:title',t);meta('property','og:description',d);meta('property','og:url',u)}
 window.StudentBnBSEO={update:updateSeo};
 const apply=()=>{updateSeo();[['it','https://studentbnb.it/'],['es','https://studentbnb.es/'],['fr','https://studentbnb.fr/'],['de','https://student-bnb.de/'],['pl','https://studentbnb.pl/'],['pt','https://studentbnb.pt/'],['x-default','https://studentbnb.eu/']].forEach(x=>link('alternate',x[1],x[0]));};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
(function(){if(document.querySelector('script[data-studentbnb-analytics]'))return;const s=document.createElement('script');s.src='assets/js/analytics.js?v=20260905';s.defer=true;s.dataset.studentbnbAnalytics='1';document.head.appendChild(s)})();