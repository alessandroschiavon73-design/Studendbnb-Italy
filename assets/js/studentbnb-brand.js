document.addEventListener('DOMContentLoaded',()=>{
  const brand=document.querySelector('.site-header .brand');
  if(brand){brand.setAttribute('aria-label','StudentBnB home');const txt=brand.querySelector(':scope > span:last-child');if(txt){txt.innerHTML='Student<strong>BnB</strong><small>Base to belong</small>';}}
  const hero=document.querySelector('.home-hero .hero-copy');
  if(hero){const h=hero.querySelector('h1');const p=hero.querySelector(':scope > p');if(h){const old=hero.querySelector('.studentbnb-tagline');if(old)old.remove();h.innerHTML='Student<span>BnB</span>';const t=document.createElement('div');t.className='studentbnb-tagline';t.textContent='Prova prima di scegliere.';h.after(t);}if(p){p.classList.add('studentbnb-concept');p.textContent='Vivi qualche giorno nella tua possibile futura casa, conosci i tuoi futuri coinquilini e decidi con più sicurezza prima del trasferimento definitivo.';}const sh=hero.querySelector('.search-card h2');if(sh)sh.textContent='Dove vuoi fare una prova?';}
  const f=document.querySelector('.site-footer .container')||document.querySelector('footer');if(f&&!f.querySelector('.casastudent-family')){const b=document.createElement('div');b.className='casastudent-family';b.innerHTML='StudentBnB è parte della famiglia <a href="https://casastudent.it/">CasaStudent ↗</a> · StudentBnB per provare, CasaStudent per restare.';f.appendChild(b)}
});
