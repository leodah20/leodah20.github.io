'use strict';
(() => {
  const host=document.querySelector('[data-light-field]');
  if(!host)return;
  const less=matchMedia('(prefers-reduced-motion: reduce)');
  const decor=document.createElement('span');
  decor.className='rv-light-field';
  decor.setAttribute('aria-hidden','true');
  for(const name of ['depth','fold','rim']){
    const plane=document.createElement('span');
    plane.className='rv-light-layer rv-light-layer--'+name;
    decor.append(plane);
  }
  const root=document.documentElement,themeKey='runavolt-appearance',motionKey='runavolt-lab-light-paused';
  const load=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  let inView=!('IntersectionObserver' in window),manual=load(motionKey)==='1',light=load(themeKey)==='light';
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  const dock=make('div','rv-appearance-dock');
  dock.setAttribute('role','group');dock.setAttribute('aria-label','Aparência');
  const button=make('button','rv-appearance-switch t-toggle');
  button.type='button';button.setAttribute('role','switch');button.setAttribute('aria-label','Modo claro');
  const symbol=(mode,shape)=>{
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
    svg.setAttribute('class','rv-appearance-icon');
    svg.dataset.mode=mode;
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    path.setAttribute('d',shape);svg.append(path);return svg;
  };
  const moon=symbol('dark','M20.6 15.1A8.7 8.7 0 0 1 8.9 3.4 9 9 0 1 0 20.6 15.1Z');
  const sun=symbol('light','M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4');
  const caption=make('span','rv-appearance-caption'),mode=make('strong','rv-appearance-mode');
  caption.setAttribute('aria-hidden','true');caption.append(make('span','','Tema'),mode);
  const track=make('span','rv-appearance-track');
  track.setAttribute('aria-hidden','true');track.append(make('span','t-toggle-thumb'));
  button.append(moon,sun,caption,track);
  const options=make('details','rv-appearance-options'),summary=make('summary','rv-appearance-more','⋯');
  summary.setAttribute('aria-label','Preferências de animação');
  const label=make('label','rv-appearance-motion');
  const checkbox=make('input');checkbox.type='checkbox';
  label.append(checkbox,make('span','','Reduzir animações'));
  options.append(summary,label);dock.append(button,options);
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'&&options.open){options.open=false;summary.focus();}});
  function render(){
    const reduce=less.matches||manual,stop=reduce||document.hidden;
    root.dataset.rvTheme=light?'light':'dark';
    root.dataset.rvMotion=reduce?'reduce':'auto';
    root.dataset.residueState=stop?'paused':'running';
    host.dataset.fieldState=stop||!inView?'paused':'running';
    button.dataset.on=String(light);
    button.setAttribute('aria-checked',String(light));
    mode.textContent=light?'Claro':'Escuro';
    checkbox.disabled=less.matches;checkbox.checked=reduce;
    label.title=less.matches?'Seu dispositivo já está configurado para reduzir movimento.':'';
  }
  button.addEventListener('click',()=>{
    light=!light;button.classList.add('is-init');save(themeKey,light?'light':'dark');render();
  });
  checkbox.addEventListener('change',()=>{manual=checkbox.checked;save(motionKey,manual?'1':'0');render();});
  window.addEventListener('storage',e=>{
    if(e.key===themeKey||e.key===motionKey||e.key===null){
      light=load(themeKey)==='light';manual=load(motionKey)==='1';render();
    }
  });
  const residue=document.createElement('span');
  residue.className='rv-field-residue';
  residue.setAttribute('aria-hidden','true');
  host.prepend(decor);
  const header=document.querySelector('.workspace-bar,.rv-draft .toolbar,body>header.top,.site-header .header-inner');
  if(header){
    header.classList.add('rv-appearance-host');
    header.insertBefore(dock,header.querySelector(':scope>nav,:scope>form'));
  }else host.before(dock);
  document.body.append(residue);
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      inView=entry.isIntersecting;render();
    },{threshold:0.07}).observe(host);
  }
  less.addEventListener('change',render);
  document.addEventListener('visibilitychange',render);
  render();
})();
