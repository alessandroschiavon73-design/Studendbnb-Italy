document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.home-hero .hero-copy');
  const brand=document.querySelector('.site-header .brand');
  if(brand){brand.setAttribute('aria-label','StudentBnB home');const txt=brand.querySelector(':scope > span:last-child');if(txt)txt.innerHTML='Student<strong>BnB</strong><small>Temporary student stays</small>';}
  if(hero){
    document.title='StudentBnB — Soggiorni temporanei per studenti | 1 settimana, 2 settimane o 1 mese';
    const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute('content','Soggiorni temporanei per studenti in studentati, case condivise e appartamenti studenteschi. Trova una stanza per una settimana, due settimane o un mese, anche per Erasmus, stage e periodi universitari brevi.');
    const h=hero.querySelector('h1'),p=hero.querySelector(':scope > p');
    hero.querySelectorAll('.studentbnb-tagline,.studentbnb-duration-options').forEach(el=>el.remove());
    if(h){h.innerHTML='Vivi per un po’ nella <span>vita studentesca.</span>';const t=document.createElement('div');t.className='studentbnb-tagline';t.textContent='Il tuo soggiorno temporaneo, tra studenti.';h.before(t);}
    if(p){p.classList.add('studentbnb-concept');p.textContent='Trova una stanza in studentato, in una casa condivisa da studenti o in un appartamento studentesco per Erasmus, stage, corsi, esami o semplicemente per qualche settimana.';const d=document.createElement('div');d.className='studentbnb-duration-options';d.innerHTML='<strong>1 settimana</strong><span>•</span><strong>2 settimane</strong><span>•</span><strong>1 mese</strong>';p.after(d);}
    const sh=hero.querySelector('.search-card h2');if(sh)sh.textContent='Dove vuoi soggiornare?';
  }
  const intl=document.querySelector('.footer-international > strong');if(intl)intl.textContent='Per soggiorni più lunghi: CasaStudent';
  const copy=document.querySelector('.footer-bottom span:first-child');if(copy)copy.textContent='© 2026 StudentBnB';
  const login=document.querySelector('#login-title');if(login)login.textContent='Accedi a StudentBnB';
  const f=document.querySelector('.site-footer .container')||document.querySelector('footer');if(f&&!f.querySelector('.casastudent-family')){const b=document.createElement('div');b.className='casastudent-family';b.innerHTML='StudentBnB è dedicato ai soggiorni temporanei nella comunità studentesca. Per una sistemazione più stabile visita <a href="https://casastudent.it/">CasaStudent ↗</a>.';f.appendChild(b)}
});
