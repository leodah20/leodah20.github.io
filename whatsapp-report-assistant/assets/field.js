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
  const button=document.createElement('button');
  button.type='button';
  button.className='rv-field-toggle';
  let inView=!('IntersectionObserver' in window),manual=false;
  try{manual=localStorage.getItem('runavolt-lab-light-paused')==='1';}catch{}
  function render(){
    const stop=less.matches||manual||document.hidden;
    host.dataset.fieldState=stop||!inView?'paused':'running';
    document.documentElement.dataset.residueState=stop?'paused':'running';
    button.hidden=less.matches;
    button.textContent=manual?'Ativar luz':'Pausar luz';
    button.setAttribute('aria-label',manual?'Retomar movimento de fundo':'Pausar movimento de fundo');
  }
  button.addEventListener('click',()=>{
    manual=!manual;
    try{localStorage.setItem('runavolt-lab-light-paused',manual?'1':'0');}catch{}
    render();
  });
  const residue=document.createElement('span');
  residue.className='rv-field-residue';
  residue.setAttribute('aria-hidden','true');
  host.prepend(decor);
  document.body.append(residue,button);
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      inView=entry.isIntersecting;render();
    },{threshold:0.07}).observe(host);
  }
  less.addEventListener('change',render);
  document.addEventListener('visibilitychange',render);
  render();
})();
