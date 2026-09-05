(function(){
  'use strict';
  const keep=[
    ['roma','Roma'],['milano','Milano'],['napoli','Napoli'],['torino','Torino'],['bologna','Bologna'],['padova','Padova'],['firenze','Firenze'],['pisa','Pisa'],['palermo','Palermo'],['catania','Catania'],['bari','Bari'],['genova','Genova'],['pavia','Pavia'],['perugia','Perugia'],['verona','Verona'],['parma','Parma'],['ferrara','Ferrara'],['messina','Messina'],['venezia','Venezia'],['cosenza-rende','Cosenza–Rende']
  ];
  const allowed=new Set(keep.map(x=>x[0]));
  window.STUDENTBNB_CITIES=keep.map(([slug,name])=>({slug,name,active:true,countryCode:'IT'}));
  if(window.STUDENTBNB_DATA){
    window.STUDENTBNB_DATA.cities=window.STUDENTBNB_CITIES.map(c=>({...c,count:c.slug==='padova'?358:0,live:true}));
    window.STUDENTBNB_DATA.listings=(window.STUDENTBNB_DATA.listings||[]).filter(l=>allowed.has(String(l.citySlug||l.city||'padova').toLowerCase()));
  }
  window.STUDENTBNB_CITY_HERO={
    padova:'assets/img/padova-hero-v3.webp',
    bologna:'assets/img/citta-bologna.webp',milano:'assets/img/citta-milano.webp',roma:'assets/img/citta-roma.webp',torino:'assets/img/citta-torino.webp',firenze:'assets/img/citta-firenze.webp',pisa:'assets/img/citta-pisa.webp',napoli:'assets/img/citta-napoli.webp',
    bari:'assets/img/citta-bari-hero.webp',cagliari:'assets/img/citta-cagliari-hero.webp',palermo:'assets/img/citta-palermo-hero.webp',trento:'assets/img/citta-trento-hero.webp',trieste:'assets/img/citta-trieste-hero.webp'
  };
  window.studentBnBCityUrl=function(slug){return 'citta.html?city='+encodeURIComponent(slug||'padova');};
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('a[href^="/"][href$="/"]').forEach(a=>{
      const m=a.getAttribute('href').match(/^\/([^/]+)\/$/); if(m&&allowed.has(m[1])) a.href=window.studentBnBCityUrl(m[1]);
    });
    const form=document.querySelector('#home-search'),select=document.querySelector('#home-city');
    if(form&&select){form.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();location.href=window.studentBnBCityUrl(select.value);},true);}
  });
})();