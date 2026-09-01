(function(){
  if(window.__STUDENTBNB_ANALYTICS_LOADED__) return;
  window.__STUDENTBNB_ANALYTICS_LOADED__=true;
  const cfg=window.STUDENTBNB_CONFIG||{};
  const code=cfg.countryCode||document.documentElement.lang?.slice(0,2).toUpperCase()||'EU';
  const key=`studentbnb:stats:${code}:v1`;
  const sessionKey=`studentbnb:session:${code}:v1`;
  const pathname=location.pathname||'/';
  const path=(pathname==='/'?'index.html':pathname.replace(/^\/+|\/+$/g,'')||'index.html').toLowerCase();
  const isStats=path==='stats.html';
  const empty=()=>({version:1,country:code,pageViews:0,sessions:0,ctaClicks:0,internalClicks:0,outboundClicks:0,pages:{},firstSeen:null,lastSeen:null});
  function read(){try{return {...empty(),...(JSON.parse(localStorage.getItem(key)||'{}'))};}catch(_){return empty();}}
  function write(s){try{localStorage.setItem(key,JSON.stringify(s));}catch(_){}}
  function update(fn){const s=read();fn(s);s.lastSeen=new Date().toISOString();if(!s.firstSeen)s.firstSeen=s.lastSeen;write(s);window.StudentBnBStats=s;return s;}
  if(!isStats){
    update(s=>{s.pageViews++;s.pages[path]=(s.pages[path]||0)+1;if(!sessionStorage.getItem(sessionKey)){s.sessions++;try{sessionStorage.setItem(sessionKey,'1')}catch(_){}}});
    addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;update(s=>{const href=a.getAttribute('href')||'';if(a.classList.contains('header-cta')||a.classList.contains('btn')||a.classList.contains('publish-choice'))s.ctaClicks++;if(/^https?:/i.test(href)&&!href.includes(location.hostname))s.outboundClicks++;else if(href&&!href.startsWith('#')&&!href.startsWith('mailto:')&&!href.startsWith('tel:'))s.internalClicks++;});},{passive:true});
    setTimeout(()=>{try{window.StudentBnBAPI?.track?.('page_view',{page:path,local:true});}catch(_){}},600);
  }else window.StudentBnBStats=read();
  function addStatsLink(){const label={IT:'Statistiche',ES:'Estadísticas',FR:'Statistiques',DE:'Statistiken',PL:'Statystyki',PT:'Estatísticas'}[code]||'Statistics';const box=document.querySelector('.footer-bottom')||document.querySelector('.footer-international');if(box&&!box.querySelector('[data-stats-link]')){const a=document.createElement('a');a.href='stats.html';a.dataset.statsLink='1';a.textContent=label;a.style.cssText='color:inherit;text-decoration:underline;margin-left:12px';box.appendChild(a);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addStatsLink);else addStatsLink();
})();

/* SEO route upgrader: keep the existing application engine while making the
   pilot city URLs the paths users and crawlers actually navigate to. */
(function(){
  if(window.__CASASTUDENT_SEO_ROUTES__) return;
  window.__CASASTUDENT_SEO_ROUTES__=true;
  const cleanCities=new Set(['padova','bologna','milano']);

  function cleanCityUrl(href){
    try{
      const url=new URL(href,location.href);
      if(url.origin!==location.origin) return null;
      if(!/(?:^|\/)padova\.html$/i.test(url.pathname)) return null;
      const city=(url.searchParams.get('city')||'').toLowerCase();
      if(!cleanCities.has(city)) return null;
      url.searchParams.delete('city');
      const query=url.searchParams.toString();
      return `/${encodeURIComponent(city)}/${query?`?${query}`:''}${url.hash||''}`;
    }catch(_){return null;}
  }

  function rewriteLinks(root=document){
    root.querySelectorAll?.('a[href]').forEach(a=>{
      const next=cleanCityUrl(a.getAttribute('href'));
      if(next&&a.getAttribute('href')!==next) a.setAttribute('href',next);
    });
  }

  function bindHomeSearch(){
    document.addEventListener('submit',event=>{
      const form=event.target;
      if(!(form instanceof HTMLFormElement)||form.id!=='home-search') return;
      const fd=new FormData(form);
      const city=String(fd.get('city')||'').toLowerCase();
      if(!cleanCities.has(city)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const url=new URL(`/${encodeURIComponent(city)}/`,location.origin);
      const type=String(fd.get('type')||'');
      if(type) url.searchParams.set('type',type);
      location.assign(url.pathname+url.search);
    },true);
  }

  const run=()=>rewriteLinks(document);
  bindHomeSearch();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList') record.addedNodes.forEach(node=>{if(node.nodeType===1) rewriteLinks(node);});
      else if(record.type==='attributes'&&record.target?.matches?.('a[href]')) rewriteLinks(record.target.parentElement||document);
    }
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
})();

(function(){if(document.querySelector('script[data-city-visuals]'))return;const s=document.createElement('script');s.src='assets/js/city-visuals.js?v=20260831-seo-routes';s.defer=true;s.dataset.cityVisuals='1';document.head.appendChild(s)})();
