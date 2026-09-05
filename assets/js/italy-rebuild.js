(function(){
  'use strict';
  const keep=[['roma','Roma'],['milano','Milano'],['napoli','Napoli'],['torino','Torino'],['bologna','Bologna'],['padova','Padova'],['firenze','Firenze'],['pisa','Pisa'],['palermo','Palermo'],['catania','Catania'],['bari','Bari'],['genova','Genova'],['pavia','Pavia'],['perugia','Perugia'],['verona','Verona'],['parma','Parma'],['ferrara','Ferrara'],['messina','Messina'],['venezia','Venezia'],['cosenza-rende','Cosenza–Rende']];
  const allowed=new Set(keep.map(x=>x[0]));
  window.STUDENTBNB_CITIES=keep.map(([slug,name])=>({slug,name,active:true,countryCode:'IT'}));
  if(window.STUDENTBNB_DATA){window.STUDENTBNB_DATA.cities=window.STUDENTBNB_CITIES.map(c=>({...c,count:c.slug==='padova'?358:0,live:true}));window.STUDENTBNB_DATA.listings=(window.STUDENTBNB_DATA.listings||[]).filter(l=>allowed.has(String(l.citySlug||l.city||'padova').toLowerCase()));}
  window.STUDENTBNB_CITY_HERO={padova:'assets/img/padova-hero-v3.webp',bologna:'assets/img/citta-bologna.webp',milano:'assets/img/citta-milano.webp',roma:'assets/img/citta-roma.webp',torino:'assets/img/citta-torino.webp',firenze:'assets/img/citta-firenze.webp',pisa:'assets/img/citta-pisa.webp',napoli:'assets/img/citta-napoli.webp',bari:'assets/img/citta-bari-hero.webp',palermo:'assets/img/citta-palermo-hero.webp'};
  window.studentBnBCityUrl=slug=>'citta.html?city='+encodeURIComponent(slug||'padova');
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('a[href^="/"][href$="/"]').forEach(a=>{const m=a.getAttribute('href').match(/^\/([^/]+)\/$/);if(m&&allowed.has(m[1]))a.href=window.studentBnBCityUrl(m[1]);});
    const form=document.querySelector('#home-search'),select=document.querySelector('#home-city');if(form&&select){form.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();location.href=window.studentBnBCityUrl(select.value);},true);}
    setTimeout(function(){
      const hero=document.querySelector('.city-hero-bg');if(!hero)return;
      const slug=new URLSearchParams(location.search).get('city')||'padova';
      const primary=window.STUDENTBNB_CITY_HERO[slug]||`assets/img/citta-${slug}.webp`;
      hero.style.setProperty('background-image',`url('${primary}')`,'important');
      hero.style.setProperty('background-size','cover','important');hero.style.setProperty('background-position','center','important');
      const probe=new Image();probe.onerror=()=>hero.style.setProperty('background-image',"url('assets/img/italia-proposta1.webp')",'important');probe.src=primary;
    },0);
  });
})();