document.addEventListener('DOMContentLoaded',()=>{
  const base='https://studentbnb.it/';

  const replaceText=()=>{
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){
      if(!n.parentElement?.closest('.dual-portal-footer')) n.nodeValue=n.nodeValue.replaceAll('CasaStudent','StudentBnB');
    }
    document.querySelectorAll('[aria-label]').forEach(e=>{
      if(!e.closest('.dual-portal-footer')) e.setAttribute('aria-label',e.getAttribute('aria-label').replaceAll('CasaStudent','StudentBnB'));
    });
  };

  const removeHeaderFaqAndContacts=()=>{
    document.querySelectorAll('.main-nav a').forEach(link=>{
      const href=(link.getAttribute('href')||'').toLowerCase();
      const label=(link.textContent||'').trim().toLowerCase();
      if(/#(?:faq|contact|contacts|contatti|contatto|contacto)$/.test(href)||['faq','contatti','contatto','contact'].includes(label)) link.remove();
    });
  };

  const adaptRequestPage=()=>{
    const budget=document.querySelector('label[for="request-budget"]');
    if(budget) budget.textContent='Budget massimo per il soggiorno (€) *';
    const durationLabel=document.querySelector('label[for="request-duration"]');
    if(durationLabel) durationLabel.textContent='Durata del soggiorno *';
    const duration=document.querySelector('#request-duration');
    if(duration){
      duration.innerHTML='<option value="1 settimana">1 settimana</option><option value="2 settimane">2 settimane</option><option value="1 mese">1 mese</option>';
    }
    const heading=document.querySelector('.form-heading h1');
    const intro=document.querySelector('.form-heading p');
    if(heading&&document.querySelector('#student-request-form')) heading.textContent='Trova casa e coinquilini per il tuo soggiorno di prova';
    if(intro&&document.querySelector('#student-request-form')) intro.textContent='Indica dove vuoi vivere, il tuo budget e se vuoi fermarti una settimana, due settimane o un mese.';
  };

  const adaptPublishPage=()=>{
    const form=document.querySelector('#publish-form');
    if(!form) return;
    const heading=document.querySelector('.form-heading h1');
    const intro=document.querySelector('.form-heading p');
    if(heading) heading.textContent='Pubblica un soggiorno StudentBnB';
    if(intro) intro.textContent='Proponi la casa per un periodo di prova di una settimana, due settimane o un mese, con costi e regole chiare.';

    const priceLabel=document.querySelector('label[for="price"]');
    if(priceLabel) priceLabel.textContent='Canone mensile di riferimento (€) *';

    const cross=document.querySelector('.studentbnb-crosspublish');
    if(cross){
      const firstLabel=cross.querySelector('label.check-option');
      if(firstLabel) firstLabel.hidden=true;
      const p=cross.querySelector(':scope > p');
      if(p) p.textContent='Definisci i prezzi StudentBnB per 1 settimana, 2 settimane e 1 mese. Il sistema propone una maggiorazione modificabile rispetto al canone mensile di riferimento.';
    }

    const sections=[...document.querySelectorAll('.form-section.card')];
    const conditions=sections.find(s=>s.querySelector('#contract')||s.querySelector('#minimumStay')||s.querySelector('#notice'));
    if(conditions){
      const h2=conditions.querySelector('h2');
      const p=conditions.querySelector(':scope > p');
      if(h2) h2.textContent='3. Durata, uscita e servizi';
      if(p) p.textContent='Definisci condizioni semplici e comprensibili per il soggiorno di prova.';
    }
    const contractLabel=document.querySelector('label[for="contract"]');
    if(contractLabel) contractLabel.textContent='Accordo / formula *';
    const contract=document.querySelector('#contract');
    if(contract) contract.placeholder='Es. accordo di ospitalità / locazione breve';
    const minLabel=document.querySelector('label[for="minimumStay"]');
    if(minLabel) minLabel.textContent='Durata disponibile *';
    const minimum=document.querySelector('#minimumStay');
    if(minimum){ minimum.placeholder='1 settimana / 2 settimane / 1 mese'; minimum.value=minimum.value||'1 settimana / 2 settimane / 1 mese'; }
    const noticeLabel=document.querySelector('label[for="notice"]');
    if(noticeLabel) noticeLabel.textContent='Regole per modifica o cancellazione *';
    const notice=document.querySelector('#notice');
    if(notice) notice.placeholder='Es. da concordare prima del soggiorno';
  };

  const adaptSolidarityPage=()=>{
    const pageText=[...document.querySelectorAll('main p')].find(p=>/mette in contatto persone anziane/i.test(p.textContent||''));
    if(pageText) pageText.textContent='StudentBnB mette in contatto persone con una stanza libera e studenti interessati a una convivenza temporanea, chiara e rispettosa. Il canone agevolato e l’eventuale piccolo aiuto vengono concordati insieme, con limiti precisi.';
  };

  replaceText();
  removeHeaderFaqAndContacts();
  adaptRequestPage();
  adaptPublishPage();
  adaptSolidarityPage();

  document.querySelectorAll('.brand').forEach(b=>{
    const labels=[...b.children].filter(e=>e.tagName==='SPAN'&&!e.classList.contains('brand-icon'));
    const l=labels[labels.length-1];
    if(l) l.innerHTML='Student<strong>BnB</strong><small>Base to belong</small>';
  });

  const hero=document.querySelector('.home-hero .hero-copy');
  if(hero){
    document.title='StudentBnB — Prima le persone, poi la stanza';
    const m=document.querySelector('meta[name="description"]');if(m)m.content='Scegli la città e scopri insieme chi cerca una stanza e chi cerca un coinquilino. Prima le persone, poi la stanza.';
    const h=hero.querySelector('h1'),p=hero.querySelector(':scope > p');
    hero.querySelectorAll('.studentbnb-tagline,.studentbnb-duration-options').forEach(el=>el.remove());
    if(h)h.innerHTML='Prima le persone,<br><span>poi la stanza.</span>';
    if(p){p.classList.add('studentbnb-concept');p.textContent='Una settimana, due settimane o un mese per conoscersi prima di scegliere se continuare.';}
    const sh=hero.querySelector('.search-card h2');if(sh)sh.textContent='Dove?';
    const sp=hero.querySelector('.search-card > p');if(sp)sp.textContent='Scegli la città oppure clicca direttamente sulla mappa.';
    const type=hero.querySelector('#home-type');if(type)type.closest('.field')?.remove();
    const submit=hero.querySelector('#home-search button[type="submit"]');if(submit)submit.textContent='Vai alla città';
    hero.querySelector('.hero-market-actions')?.remove();
  }

  let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c)}
  c.href=base+(location.pathname==='/'?'':location.pathname.replace(/^\//,''))+location.search;
  const schema=document.querySelector('#studentbnb-website-schema');if(schema)schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'StudentBnB',url:base,inLanguage:'it-IT'});
  const og=document.querySelector('meta[property="og:site_name"]');if(og)og.content='StudentBnB — Base to belong';
  const intl=document.querySelector('.footer-international > strong');if(intl)intl.textContent='Per soggiorni più lunghi: CasaStudent';
  const copy=document.querySelector('.footer-bottom span:first-child');if(copy)copy.textContent='© 2026 StudentBnB';
  const login=document.querySelector('#login-title');if(login)login.textContent='Accedi a StudentBnB';
  const f=document.querySelector('.site-footer .container')||document.querySelector('footer');
  if(f&&!f.querySelector('.casastudent-family')){
    const b=document.createElement('div');b.className='casastudent-family';
    b.innerHTML='StudentBnB è dedicato ai soggiorni temporanei nella comunità studentesca. Per una sistemazione più stabile visita <a href="https://casastudent.it/">CasaStudent ↗</a>.';
    f.appendChild(b);
  }
});
