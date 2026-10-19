document.addEventListener('DOMContentLoaded',()=>{
  const cards=[...document.querySelectorAll('.quest-card')];
  const primary=cards.map(c=>c.querySelector('.quest-card-heading .progress-checkbox')).filter(Boolean);
  const allChecks=[...document.querySelectorAll('.progress-checkbox')];
  const search=document.getElementById('quest-search');
  const result=document.getElementById('quest-results');
  const text=document.getElementById('quest-progress-text');
  const fill=document.getElementById('quest-progress-fill');
  const track=document.querySelector('.quest-progress-track');
  let filter='all';

  allChecks.forEach(box=>{const key=box.dataset.id||box.id;if(key&&localStorage.getItem(key)==='completed')box.checked=true;box.addEventListener('change',()=>{if(key)box.checked?localStorage.setItem(key,'completed'):localStorage.removeItem(key);update()})});
  cards.forEach(card=>{card.classList.toggle('is-missable',card.dataset.missable==='true');const button=card.querySelector('.quest-details-toggle'),details=card.querySelector('.quest-details');button?.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));button.textContent=open?'View details':'Hide details';details.hidden=open})});

  function apply(){const q=(search?.value||'').trim().toLowerCase();let shown=0;cards.forEach(card=>{const box=card.querySelector('.quest-card-heading .progress-checkbox');const matchesSearch=!q||card.dataset.search.includes(q)||card.dataset.number===q;const matchesFilter=filter==='all'||(filter==='complete'&&box?.checked)||(filter==='incomplete'&&!box?.checked)||(filter==='missable'&&card.dataset.missable==='true');card.hidden=!(matchesSearch&&matchesFilter);if(!card.hidden)shown++});if(result)result.textContent=`Showing ${shown} of ${cards.length} requests`}
  function update(){const completed=primary.filter(b=>b.checked).length,total=primary.length,percent=total?Math.round(completed/total*100):0;if(text)text.textContent=`${completed} of ${total} requests (${percent}%)`;if(fill)fill.style.width=`${percent}%`;if(track)track.setAttribute('aria-valuenow',String(percent));cards.forEach(c=>c.classList.toggle('is-complete',c.querySelector('.quest-card-heading .progress-checkbox')?.checked));apply()}
  search?.addEventListener('input',apply);
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('is-active',b===button));apply()}));
  document.getElementById('next-incomplete')?.addEventListener('click',()=>{const card=cards.find(c=>!c.querySelector('.quest-card-heading .progress-checkbox')?.checked);if(card){filter='all';search.value='';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('is-active',b.dataset.filter==='all'));apply();card.scrollIntoView({behavior:'smooth',block:'center'});card.querySelector('.progress-checkbox')?.focus({preventScroll:true})}});
  update();
});
