document.addEventListener('DOMContentLoaded',()=>{
  const root=document.querySelector('#listing-results');
  if(!root)return;
  const params=new URLSearchParams(location.search);
  const city=(params.get('city')||'padova').toLowerCase();
  const requests=[...(JSON.parse(localStorage.getItem('studentbnb_student_requests')||'[]')),...(window.STUDENTBNB_REQUESTS||[])];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);
  const cityMatches=r=>String(r.citySlug||r.city||'').toLowerCase()===city || String(r.city||'').toLowerCase()===String(document.querySelector('#city-name')?.textContent||'').toLowerCase();
  const card=r=>{const initials=String(r.name||'S').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();const photo=r.photo?`<img src="${esc(r.photo)}" alt="">`:esc(initials);return `<article class="unified-request-card"><div class="unified-request-avatar">${photo}</div><div><span class="board-kind search">Cerco una stanza</span><h3>${esc(r.name||'Studente')}${r.age?`, ${esc(r.age)}`:''}</h3><p>${esc(r.course||'Studente')} · ${esc(r.university||r.city||'')}</p><div class="unified-request-facts"><span>${esc(r.type||'Alloggio')}</span><span>${esc(r.zones||'Zona flessibile')}</span><span>${esc(r.sociality||r.lifestyle||'Convivenza flessibile')}</span></div></div><div class="unified-request-budget">${money(r.budget)}<small>budget max / mese</small></div></article>`};
  const intro=document.createElement('div');intro.className='unified-board-intro';intro.innerHTML='<strong>Tutto quello che succede in questa città, in un’unica bacheca.</strong><p>Qui trovi insieme chi ha una stanza disponibile e chi sta cercando un posto o nuovi coinquilini.</p>';
  root.parentNode.insertBefore(intro,root);
  const appendRequests=()=>{
    root.querySelectorAll('.unified-request-card').forEach(x=>x.remove());
    requests.filter(cityMatches).forEach(r=>root.insertAdjacentHTML('beforeend',card(r)));
    root.querySelectorAll('.listing-card').forEach(c=>{if(!c.querySelector('.board-kind')){const main=c.querySelector('.listing-main');if(main)main.insertAdjacentHTML('afterbegin','<span class="board-kind offer">Cerco un coinquilino</span>')}});
    const offerCount=root.querySelectorAll('.listing-card').length;
    const requestCount=root.querySelectorAll('.unified-request-card').length;
    const count=document.querySelector('#result-count');if(count)count.textContent=`${offerCount+requestCount} annunci nella bacheca`;
    const heroCount=document.querySelector('#city-count');if(heroCount)heroCount.textContent=`${offerCount+requestCount} annunci disponibili`;
  };
  appendRequests();
  document.querySelectorAll('.filters select,.filters input').forEach(el=>el.addEventListener('change',()=>setTimeout(appendRequests,0)));
});
