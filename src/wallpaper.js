/* Background adapted from dsh-theme-longmarch's makeColumns / FxLayer.
 * Copyright (c) 2026 Soviet-Dreadnaught. MIT; see THIRD_PARTY_NOTICES.md.
 * Monochrome club artwork, input exclusion, and lifecycle handling by Zero One.
 */
function makeColumns(count) {
  const glyphs = '01';
  const words = [...'零一日新好奇学习实践创造技术机会未来'];
  return Array.from({length:count},(_,i)=>{
    const length=34+Math.floor(Math.random()*46);
    let text='';
    for(let j=0;j<length;j++) text+=(j===0||Math.random()>.38)?glyphs[Math.floor(Math.random()*2)]:words[Math.floor(Math.random()*words.length)];
    const depth=['near','middle','far'][i%3];
    const duration={near:4.5+Math.random()*1.5,middle:6.5+Math.random()*2.5,far:10+Math.random()*3}[depth];
    return {depth,left:(i*100/count+Math.random()*60/count).toFixed(2)+'%',duration:duration.toFixed(2)+'s',delay:(-Math.random()*14).toFixed(2)+'s',opacity:({near:.92,middle:.65,far:.36}[depth]).toFixed(2),size:({near:14,middle:12,far:11}[depth])+'px',text};
  });
}
export function mountWallpaper(target, { logo, css, motion = true } = {}) {
  const host=document.createElement('div');
  host.className='zero-one-wallpaper';
  host.setAttribute('aria-hidden','true');
  host.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';
  const shadow=host.attachShadow({mode:'open'});
  shadow.innerHTML=`<style>${css}</style><div class="scene">
    <div class="effect-field"><div class="terminal-grid"></div>
      <div class="watermark"><img alt="" draggable="false"/></div>
      <div class="data-rain"></div><div class="data-packets"></div><div class="crt-scan"></div><div class="crt-sweep"></div><div class="arrival-sweep"></div><div class="vignette"></div>
      <svg class="mechanical-perimeter" viewBox="0 0 1000 700" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path class="frame-line" d="M20 112V44L44 20H230M770 20H956L980 44V112M980 588V656L956 680H770M230 680H44L20 656V588"/>
        <path class="frame-secondary" d="M29 96V48L48 29H146M854 29H952L971 48V96M971 604V652L952 671H854M146 671H48L29 652V604M20 292V328M20 372V408M980 292V328M980 372V408"/>
        <path class="frame-ticks" d="M188 20V28M200 20V26M212 20V28M788 20V28M800 20V26M812 20V28M188 680V672M200 680V674M212 680V672M788 680V672M800 680V674M812 680V672"/>
        <g class="clamp-left"><path class="frame-lock" d="M15 335H25V365H15Z"/><path class="clamp-teeth" d="M25 340H33M25 350H33M25 360H33"/></g>
        <g class="clamp-right"><path class="frame-lock" d="M975 335H985V365H975Z"/><path class="clamp-teeth" d="M967 340H975M967 350H975M967 360H975"/></g>
        <path class="servo-guide" d="M38 118V582M962 118V582"/>
        <g class="track-shuttle track-shuttle-left"><path class="shuttle-body" d="M14 118H34V150L24 160L14 150Z"/><path class="shuttle-cut" d="M19 127H29M19 134H29"/></g>
        <g class="track-shuttle track-shuttle-right"><path class="shuttle-body" d="M966 540H986V572L976 582L966 572Z"/><path class="shuttle-cut" d="M971 549H981M971 556H981"/></g>
        <g class="rail-packet-top"><path class="rail-light" d="M250 20H294M250 24H266"/></g>
        <g class="rail-packet-bottom"><path class="rail-light" d="M706 680H750M734 676H750"/></g>
      </svg>
    </div>
    <div class="hero-label"><h1>零一·凌界<span class="terminal-cursor"></span></h1><p>从零到一，让技术进步成为每个人的机会！</p></div>
    <div class="terminal-caption"><span>ZERO TO ONE // RIXIN AI</span><span>从好奇开始 · 向实践出发</span></div>
  </div>`;
  shadow.querySelector('img').src=logo;
  const rain=shadow.querySelector('.data-rain');
  for(const col of makeColumns(36)) {
    const el=document.createElement('div');el.className='rain-column rain-'+col.depth;
    Object.assign(el.style,{left:col.left,fontSize:col.size,opacity:col.opacity,animationDuration:col.duration,animationDelay:col.delay});
    const head=document.createElement('span');head.className='rain-head';head.textContent=col.text.slice(0,1);
    el.append(head,document.createTextNode(col.text.slice(1)));rain.append(el);
  }
  const packets=shadow.querySelector('.data-packets');
  for(let i=0;i<8;i++) {
    const packet=document.createElement('i');packet.className='flow-packet';
    packet.style.left=(8+i*12)+'%';
    packet.style.animationDuration=(3.8+(i%3)*.9)+'s';
    packet.style.animationDelay=(-i*.7)+'s';packets.append(packet);
  }
  target.append(host);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=motion;
  let entranceAnimations=[], accelerated=[], entranceGeneration=0, entranceCount=0;
  const cancelEntrance=()=>{
    entranceGeneration++;
    for(const animation of entranceAnimations) animation.cancel();
    for(const animation of accelerated) animation.updatePlaybackRate(1);
    entranceAnimations=[];accelerated=[];host.dataset.entrance='idle';
  };
  const sync=()=>{
    const paused=!enabled||document.hidden||reduced.matches;
    host.dataset.paused=String(paused);
    if(paused) cancelEntrance();
  };
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
  return {
    host,
    setMotion(value){enabled=!!value;sync();},
    cancelEntrance,
    playEntrance(){
      cancelEntrance();host.dataset.entranceCount=String(++entranceCount);
      if(!enabled||document.hidden||reduced.matches) return false;
      const generation=entranceGeneration;
      host.dataset.entrance='running';
      const reveal=(selector,from,{duration=1100,delay=0}={})=>{
        const el=shadow.querySelector(selector);
        const final={opacity:getComputedStyle(el).opacity};
        if(from.transform) final.transform='none';
        const animation=el.animate([{...from,opacity:0},final],{duration,delay,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
        entranceAnimations.push(animation);
      };
      reveal('.mechanical-perimeter',{transform:'scale(.94,.88)'},{duration:1250});
      reveal('.terminal-grid',{}, {duration:900});
      reveal('.data-rain',{transform:'translateY(-48px)'},{duration:1450,delay:120});
      reveal('.data-packets',{}, {duration:800,delay:180});
      reveal('.watermark',{}, {duration:1400,delay:240});
      reveal('h1',{transform:'translateY(12px)'},{duration:700,delay:280});
      reveal('p',{transform:'translateY(8px)'},{duration:650,delay:400});
      const sweep=shadow.querySelector('.arrival-sweep').animate([
        {transform:'translateY(-45cqh)',opacity:0},{opacity:.6,offset:.2},{opacity:.45,offset:.7},{transform:'translateY(55cqh)',opacity:0}
      ],{duration:1600,easing:'linear'});
      entranceAnimations.push(sweep);
      for(const el of shadow.querySelectorAll('.rain-column')) {
        for(const animation of el.getAnimations()) {animation.updatePlaybackRate(2.2);accelerated.push(animation);}
      }
      Promise.allSettled(entranceAnimations.map(a=>a.finished)).then(()=>{
        if(generation!==entranceGeneration) return;
        cancelEntrance();
      });
      return true;
    },
    setInputExclusion(rect){
      const field=shadow.querySelector('.effect-field');
      if(!rect){field.style.clipPath='none';return;}
      const {left:l,top:t,right:r,bottom:b}=rect;
      field.style.clipPath=`polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${l}px ${t}px,${l}px ${b}px,${r}px ${b}px,${r}px ${t}px,${l}px ${t}px,0 0)`;
    },
    setHeroPosition(y){shadow.querySelector('.hero-label').style.top=y+'px';},
    dispose(){cancelEntrance();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);host.remove();}
  };
}
