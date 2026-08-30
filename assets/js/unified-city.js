document.addEventListener('DOMContentLoaded',()=>{
  const root=document.querySelector('#listing-results');
  if(!root)return;
  const params=new URLSearchParams(location.search);
  const city=(params.get('city')||'padova').toLowerCase();
  const cityName=String(document.querySelector('#city-name')?.textContent||'Padova');
  const universities={
    padova:'Università degli Studi di Padova',bologna:'Università di Bologna',milano:'Università e poli universitari di Milano',roma:'Sapienza, Roma Tre, Tor Vergata e altri atenei',torino:'Università di Torino e Politecnico',firenze:'Università degli Studi di Firenze',pisa:'Università di Pisa',napoli:'Federico II e altri atenei',trento:'Università di Trento',trieste:'Università degli Studi di Trieste',venezia:'Ca’ Foscari e IUAV',verona:'Università degli Studi di Verona',pavia:'Università di Pavia',parma:'Università di Parma',ferrara:'Università di Ferrara',perugia:'Università degli Studi di Perugia',cagliari:'Università di Cagliari',palermo:'Università degli Studi di Palermo',catania:'Università di Catania',bari:'Università di Bari e Politecnico',ancona:'Università Politecnica delle Marche',genova:'Università di Genova',modena:'Università di Modena e Reggio Emilia','reggio-emilia':'Università di Modena e Reggio Emilia','salerno-fisciano':'Università degli Studi di Salerno','cosenza-rende':'Università della Calabria',pescara:'Università G. d’Annunzio',chieti:'Università G. d’Annunzio',bergamo:'Università degli Studi di Bergamo',caserta:'Università della Campania Luigi Vanvitelli',messina:'Università degli Studi di Messina'
  };
  const university=universities[city]||`Università e poli universitari di ${cityName}`;
  const requests=[...(JSON.parse(localStorage.getItem('studentbnb_student_requests')||'[]')),...(window.STUDENTBNB_REQUESTS||[])];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);
  const cityMatches=r=>String(r.citySlug||r.city||'').toLowerCase()===city || String(r.city||'').toLowerCase()===cityName.toLowerCase();
  const card=r=>{const initials=String(r.name||'S').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();const photo=r.photo?`<img src="${esc(r.photo)}" alt="">`:esc(initials);return `<article class="unified-request-card"><div class="unified-request-avatar">${photo}</div><div><span class="board-kind search">Cerco una stanza</span><h3>${esc(r.name||'Studente')}${r.age?`, ${esc(r.age)}`:''}</h3><p>${esc(r.course||'Studente')} · ${esc(r.university||r.city||'')}</p><div class="unified-request-facts"><span>${esc(r.type||'Alloggio')}</span><span>${esc(r.zones||'Zona flessibile')}</span><span>${esc(r.sociality||r.lifestyle||'Convivenza flessibile')}</span></div></div><div class="unified-request-budget">${money(r.budget)}<small>budget max / mese</small></div></article>`};

  const heroDescription=document.querySelector('#city-description');
  if(heroDescription) heroDescription.textContent=`Vivi ${cityName} da studente: trova una base vicina all’università, conosci casa e persone e poi scegli se restare.`;

  const filters=document.querySelector('.filters');
  if(filters && !document.querySelector('.university-city-intro')){
    const universityIntro=document.createElement('section');
    universityIntro.className='container university-city-intro';
    universityIntro.innerHTML=`<div class="unified-board-intro"><strong>Studiare e vivere a ${esc(cityName)}</strong><p>🎓 ${esc(university)} · Cerca per zona, prezzo e tipologia e guarda subito quanto sei vicino alla tua sede universitaria.</p></div>`;
    filters.parentNode.insertBefore(universityIntro,filters);
  }

  const intro=document.createElement('div');intro.className='unified-board-intro';intro.innerHTML='<strong>La vita universitaria della città, in un’unica bacheca.</strong><p>Qui trovi insieme chi ha una stanza disponibile e chi sta cercando un posto o nuovi coinquilini.</p>';
  root.parentNode.insertBefore(intro,root);
  const appendRequests=()=>{
    root.querySelectorAll('.unified-request-card').forEach(x=>x.remove());
    requests.filter(cityMatches).forEach(r=>root.insertAdjacentHTML('beforeend',card(r)));
    root.querySelectorAll('.listing-card').forEach(c=>{if(!c.querySelector('.board-kind')){const main=c.querySelector('.listing-main');if(main)main.insertAdjacentHTML('afterbegin','<span class="board-kind offer">Cerco un coinquilino</span>')}});
    const offerCount=root.querySelectorAll('.listing-card').length;
    const requestCount=root.querySelectorAll('.unified-request-card').length;
    const count=document.querySelector('#result-count');if(count)count.textContent=`${offerCount+requestCount} annunci nella bacheca universitaria`;
    const heroCount=document.querySelector('#city-count');if(heroCount)heroCount.textContent=`${offerCount+requestCount} opportunità per studenti`;
  };
  appendRequests();
  document.querySelectorAll('.filters select,.filters input').forEach(el=>el.addEventListener('change',()=>setTimeout(appendRequests,0)));
});
