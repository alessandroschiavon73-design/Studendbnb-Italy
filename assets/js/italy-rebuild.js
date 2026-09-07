(function(){
  'use strict';
  const keep=[['roma','Roma'],['milano','Milano'],['napoli','Napoli'],['torino','Torino'],['bologna','Bologna'],['padova','Padova'],['firenze','Firenze'],['pisa','Pisa'],['palermo','Palermo'],['catania','Catania'],['bari','Bari'],['genova','Genova'],['pavia','Pavia'],['perugia','Perugia'],['verona','Verona'],['parma','Parma'],['ferrara','Ferrara'],['messina','Messina'],['venezia','Venezia'],['cosenza-rende','Cosenza–Rende']];
  const allowed=new Set(keep.map(x=>x[0]));
  window.STUDENTBNB_CITIES=keep.map(([slug,name])=>({slug,name,active:true,countryCode:'IT'}));
  if(window.STUDENTBNB_DATA){window.STUDENTBNB_DATA.cities=window.STUDENTBNB_CITIES.map(c=>({...c,count:c.slug==='padova'?358:0,live:true}));window.STUDENTBNB_DATA.listings=(window.STUDENTBNB_DATA.listings||[]).filter(l=>allowed.has(String(l.citySlug||l.city||'padova').toLowerCase()));}

  const hdCityImages={
    milano:'https://images.unsplash.com/photo-1779043506531-c964ff6db172?auto=format&fit=crop&fm=webp&q=82&w=2400',
    roma:'assets/img/roma-colosseo.webp',
    napoli:'https://images.unsplash.com/photo-1773600876856-338c2e99cd45?auto=format&fit=crop&fm=webp&q=82&w=2400',
    torino:'https://images.unsplash.com/photo-1770462956276-898ea31652c2?auto=format&fit=crop&fm=webp&q=82&w=2400',
    bologna:'https://images.unsplash.com/photo-1682277303978-7ba42c704590?auto=format&fit=crop&fm=webp&q=82&w=2400',
    padova:'assets/img/padova-palazzo-ragione.webp',
    firenze:'https://images.unsplash.com/photo-1774116978984-969c27e5f9d9?auto=format&fit=crop&fm=webp&q=82&w=2400',
    pisa:'https://images.unsplash.com/photo-1773467588137-16e619170f1d?auto=format&fit=crop&fm=webp&q=82&w=2400',
    palermo:'https://images.unsplash.com/photo-1774244764179-f34b65061ec6?auto=format&fit=crop&fm=webp&q=82&w=2400',
    bari:'https://images.unsplash.com/photo-1564863756233-e90e6d2f264b?auto=format&fit=crop&fm=webp&q=82&w=2400',
    cagliari:'assets/img/citta-cagliari-hero.webp'
  };

  window.STUDENTBNB_CITY_HERO={padova:hdCityImages.padova,bologna:hdCityImages.bologna,milano:hdCityImages.milano,roma:hdCityImages.roma,torino:hdCityImages.torino,firenze:hdCityImages.firenze,pisa:hdCityImages.pisa,napoli:hdCityImages.napoli,bari:hdCityImages.bari,palermo:hdCityImages.palermo,cagliari:hdCityImages.cagliari};
  window.studentBnBCityUrl=slug=>'citta.html?city='+encodeURIComponent(slug||'padova');

  function upgradeHomeCityImages(){
    Object.entries(hdCityImages).forEach(([slug,src])=>{
      document.querySelectorAll(`a.city-card[href*="city=${slug}"] img`).forEach(img=>{
        img.src=src;
        img.removeAttribute('srcset');
        img.loading='lazy';
        img.decoding='async';
      });
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('a[href^="/"][href$="/"]').forEach(a=>{const m=a.getAttribute('href').match(/^\/([^/]+)\/$/);if(m&&allowed.has(m[1]))a.href=window.studentBnBCityUrl(m[1]);});
    const form=document.querySelector('#home-search'),select=document.querySelector('#home-city');if(form&&select){form.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();location.href=window.studentBnBCityUrl(select.value);},true);}
    upgradeHomeCityImages();
    setTimeout(upgradeHomeCityImages,500);
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
