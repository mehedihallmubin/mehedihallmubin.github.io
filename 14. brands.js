/* 14. brands.js - Brands page + Admin brands editor.
   The 9 real brands are the default (same as the static cards on the
   Brands page). Admin edits (add/edit/remove) save in localStorage
   (per device) and re-render the Brands page. No brand is ever
   invented here — new brands come only from Admin. */
(function(){
  var KEY='pw_brands';
  var mem={};
  // Save the brand list (localStorage first, memory fallback).
  function store(v){ try{ localStorage.setItem(KEY,v); }catch(e){ mem[KEY]=v; } }
  // Read the brand list (localStorage first, memory fallback).
  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return mem[KEY]||null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Escape text for safe HTML insertion.
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  // Short message at the bottom of the screen.
  function toast(msg){
    var t=$('toast'); if(!t) return;
    t.textContent=msg; t.hidden=false;
    clearTimeout(t._h); t._h=setTimeout(function(){ t.hidden=true; }, 3600);
  }
  // The 9 real brands (same as the static cards on the Brands page).
  // logo = tile mark (text or SVG, as in the home mockup); tile = tile colour.
  var HOUSE='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5"/></svg>';
  var SOFA='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z"/><path d="M6 19v-2M18 19v-2"/></svg>';
  var CROWN='<svg width="26" height="26" viewBox="0 0 24 24" fill="#FFD700" aria-hidden="true"><path d="M3 7l4 4 5-5 5 5 4-4-1.5 9h-15L3 7z"/><rect x="5" y="17.5" width="14" height="2"/></svg>';
  var FLOWER='<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2c1.2 2.6 1.2 4.6 0 6-1.2-1.4-1.2-3.4 0-6zm6.9 3.1c-2.6 1.2-4.6 1.2-6 0 1.4-1.2 3.4-1.2 6 0zM22 12c-2.6-1.2-4.6-1.2-6 0 1.4 1.2 3.4 1.2 6 0zM18.9 18.9c-1.2-2.6-1.2-4.6 0-6 1.2 1.4 1.2 3.4 0 6zM12 22c-1.2-2.6-1.2-4.6 0-6 1.2 1.4 1.2 3.4 0 6zM5.1 18.9c1.2-2.6 1.2-4.6 0-6-1.2 1.4-1.2 3.4 0 6zM2 12c2.6-1.2 4.6-1.2 6 0-1.4 1.2-3.4 1.2-6 0zM5.1 5.1c2.6 1.2 4.6 1.2 6 0-1.4-1.2-3.4-1.2-6 0z"/><circle cx="12" cy="12" r="2.4" fill="#C0392B"/></svg>';
  // Stacked tile marks (icon + tiny brand name), as in the home mockup.
  var JOMIDAR='<span class="bt-stack">'+CROWN+'<small>Jomidar<br>Fashion</small></span>';
  var REKHA='<span class="bt-stack">'+FLOWER+'<small>Rekha\'s<br>Craft</small></span>';
  var AMI='<span class="bt-stack"><b class="bt-a">A</b><small>AL MUBIN</small></span>';
  var DEFAULTS=[
    {mono:'JAX', logo:'JAX', tile:'bt-jax', name:'Jax Corporation', role:'Graphic Designer & Video Editor', line:'My current role, since October 2026.'},
    {mono:'RH', logo:HOUSE, tile:'bt-raju', name:'Raju Interior House', role:'Designer, Video Editor & Social Media Manager', line:'December 2025 – October 2026.'},
    {mono:'GF', logo:SOFA, tile:'bt-gold', name:'Gold Furniture', role:'Designer, Video Editor & Social Media Manager', line:'December 2025 – October 2026.'},
    {mono:'QSN', logo:'QSN', tile:'bt-qsn', name:'QuickShoppingNow', role:'Founder', line:'A fashion marketplace for Bangladesh, launching on my own stores first.'},
    {mono:'LUXAUR', logo:'LUXAUR', tile:'bt-luxaur', name:'LUXAUR', role:'Founder', line:'My own shoe brand, starting with a black leather backless mule.'},
    {mono:'SJ', logo:'সাজঘর', tile:'bt-sajghar', name:'Sajghar', role:'Owner', line:'My store on QuickShoppingNow.'},
    {mono:'JF', logo:JOMIDAR, tile:'bt-jomidar', name:'Jomidar Fashion', role:'Owner', line:'My store on QuickShoppingNow.'},
    {mono:'RC', logo:REKHA, tile:'bt-rekha', name:"Rekha's Craft", role:'Owner', line:'My store on QuickShoppingNow.'},
    {mono:'AMI', logo:AMI, tile:'bt-ami', name:'Al Mubin Industries', role:'Founder & Sole Owner', line:'Planned company — QuickShoppingNow is its first project.'}
  ];
  // Load the brand list (defaults when nothing is saved).
  function getList(){
    try{ var l=JSON.parse(read()||'null'); if(Array.isArray(l)) return l; }catch(e){}
    return DEFAULTS.slice();
  }
  // Monogram from a brand name (first letters, up to 3).
  function mono(name){
    var parts=name.replace(/([a-z])([A-Z])/g,'$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
    var m=parts.map(function(p){ return p.charAt(0).toUpperCase(); }).join('').slice(0,3);
    if(m.length===1 && parts[0]) m=parts[0].slice(0,2).toUpperCase();
    return m||'?';
  }
  // Render the Brands page grid from the list (Brands page only).
  function render(){
    var grid=document.querySelector('#brands .grid');
    if(!grid) return;
    var list=getList();
    grid.innerHTML='';
    list.forEach(function(b){
      var card=document.createElement('article');
      card.className='card brand-card';
      card.innerHTML='<div class="who"><span class="avatar">'+esc(b.mono)+'</span><div><h3></h3><span></span></div></div><p></p>';
      card.querySelector('h3').textContent=b.name;
      card.querySelector('.who div span').textContent=b.role;
      card.querySelector('p').textContent=b.line;
      grid.appendChild(card);
    });
  }
  // Render the home page "My Brands & Projects" grid (home page only).
  // Tile mark comes from the brand's logo (default brands) or its monogram
  // (Admin-added brands); tile colour from the brand's tile class.
  function renderHome(){
    var grid=document.getElementById('home-brands');
    if(!grid) return;
    var list=getList();
    grid.innerHTML='';
    list.forEach(function(b){
      var card=document.createElement('article');
      card.className='home-brand';
      var logo=b.logo || b.mono || mono(b.name);
      var tile=b.tile || 'bt-default';
      card.innerHTML='<span class="home-brand-tile '+esc(tile)+'">'+logo+'</span><div class="home-brand-txt"><h3></h3><span></span><p></p></div>';
      card.querySelector('h3').textContent=b.name;
      card.querySelector('.home-brand-txt span').textContent=b.role;
      card.querySelector('p').textContent=b.line;
      grid.appendChild(card);
    });
  }
  // Two-tap delete: first tap arms it, second tap deletes.
  function armDelete(btn, fn){
    if(btn.dataset.armed){ delete btn.dataset.armed; fn(); return; }
    btn.dataset.armed='1'; btn.textContent='Tap again to delete';
    setTimeout(function(){ delete btn.dataset.armed; btn.textContent='Delete'; }, 3000);
  }
  // The brand being edited in the Admin form (null when adding).
  var editing=null;
  // Fill the Admin form for editing one brand.
  function startEdit(i){
    var b=getList()[i]; if(!b) return;
    editing=i;
    $('br-name').value=b.name; $('br-role').value=b.role; $('br-line').value=b.line;
    $('br-add').textContent='Save changes';
    $('br-cancel').hidden=false;
    $('br-name').focus();
  }
  // Clear the Admin form back to "add" mode.
  function resetForm(){
    editing=null;
    $('br-name').value=''; $('br-role').value=''; $('br-line').value='';
    $('br-add').textContent='Add brand';
    $('br-cancel').hidden=true;
  }
  // Render the brand list inside the Admin panel.
  function renderAdminList(){
    var box=$('br-list'); if(!box) return;
    box.innerHTML='';
    getList().forEach(function(b,i){
      var d=document.createElement('div'); d.className='admin-item';
      var top=document.createElement('div'); top.className='admin-item-top';
      var s=document.createElement('span'); s.textContent=b.name+' — '+b.role;
      var e=document.createElement('button'); e.type='button'; e.className='btn btn-ghost btn-sm'; e.textContent='Edit';
      var del=document.createElement('button'); del.type='button'; del.className='btn btn-ghost btn-sm'; del.textContent='Delete';
      e.addEventListener('click', function(){ startEdit(i); });
      del.addEventListener('click', function(){
        armDelete(del, function(){
          var l=getList(); l.splice(i,1); store(JSON.stringify(l));
          renderAdminList(); render(); renderHome(); toast('Brand removed.');
        });
      });
      top.appendChild(s); top.appendChild(e); top.appendChild(del);
      var p=document.createElement('p'); p.textContent=b.line;
      d.appendChild(top); d.appendChild(p); box.appendChild(d);
    });
  }
  // Add or save a brand from the Admin form.
  function saveForm(){
    var name=$('br-name').value.trim(), role=$('br-role').value.trim(), line=$('br-line').value.trim();
    if(!name || !role){ toast('Brand name and role both needed.'); return; }
    var l=getList();
    if(editing!==null && l[editing]){
      l[editing]={mono:l[editing].mono, logo:l[editing].logo, tile:l[editing].tile, name:name, role:role, line:line};
      toast('Brand updated.');
    } else {
      var m=mono(name);
      l.push({mono:m, logo:m, tile:'bt-default', name:name, role:role, line:line});
      toast('Brand added.');
    }
    store(JSON.stringify(l));
    resetForm(); renderAdminList(); render(); renderHome();
  }
  var addBtn=$('br-add');
  if(addBtn) addBtn.addEventListener('click', saveForm);
  var cancelBtn=$('br-cancel');
  if(cancelBtn) cancelBtn.addEventListener('click', resetForm);
  renderAdminList();
  render();
  renderHome();
})();
