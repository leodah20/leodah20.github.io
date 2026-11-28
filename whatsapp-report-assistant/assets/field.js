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
  for(const [name,value] of [['night','Escuro'],['track',''],['day','Claro']]){
    const part=make('span','rv-appearance-'+name,value);
    part.setAttribute('aria-hidden','true');
    if(name==='track')part.append(make('span','t-toggle-thumb'));
    button.append(part);
  }
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
  document.body.append(residue,dock);
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      inView=entry.isIntersecting;render();
    },{threshold:0.07}).observe(host);
  }
  less.addEventListener('change',render);
  document.addEventListener('visibilitychange',render);
  render();
})();
