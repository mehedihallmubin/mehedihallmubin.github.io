/* 16. texts.js - Editable texts (Hero, Services, Experience) + Admin.
   Each editable element carries data-text-key. Overrides save in
   localStorage (per device); without an override the original text
   shows. The roles line keeps its bold styling when applied (rebuilt
   from the slash-separated parts, comma style with & before the last). */
(function(){
  var KEY='pw_texts';
  var mem={};
  // Save the overrides (localStorage first, memory fallback).
  function store(v){ try{ localStorage.setItem(KEY,v); }catch(e){ mem[KEY]=v; } }
  // Read the overrides (localStorage first, memory fallback).
  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return mem[KEY]||null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Escape text for safe HTML insertion.
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  // The editable texts: group, key, label, kind, original text.
  var FIELDS=[
    {group:'Hero', key:'hero-eyebrow', label:'Greeting', kind:'text', def:'Hello, I’m'},
    {group:'Hero', key:'hero-roles', label:'Roles line', kind:'text', def:'Designer / Video Editor / Social Media Manager'},
    {group:'Services', key:'svc-1-title', label:'Service 1 title', kind:'text', def:'Graphic Design'},
    {group:'Services', key:'svc-1-desc', label:'Service 1 text', kind:'textarea', def:'Posts, banners, posters and brand visuals — clean, premium, made to be read at a glance.'},
    {group:'Services', key:'svc-2-title', label:'Service 2 title', kind:'text', def:'Video Editing'},
    {group:'Services', key:'svc-2-desc', label:'Service 2 text', kind:'textarea', def:'Short-form and episode edits — paced for people who scroll fast and decide faster.'},
    {group:'Services', key:'svc-3-title', label:'Service 3 title', kind:'text', def:'Social Media Management'},
    {group:'Services', key:'svc-3-desc', label:'Service 3 text', kind:'textarea', def:'Pages, content and messages — consistent posting with honest, real content.'},
    {group:'Services', key:'svc-4-title', label:'Service 4 title', kind:'text', def:'Digital Marketing'},
    {group:'Services', key:'svc-4-desc', label:'Service 4 text', kind:'textarea', def:'Trained in digital marketing — product pages, offers and campaigns that lead with clear prices.'},
    {group:'Services', key:'svc-5-title', label:'Service 5 title', kind:'text', def:'E-commerce Stores'},
    {group:'Services', key:'svc-5-desc', label:'Service 5 text', kind:'textarea', def:'Marketplace store setup and product listings, learned hands-on while building QSN.'},
    {group:'Services', key:'svc-6-title', label:'Service 6 title', kind:'text', def:'Education Content'},
    {group:'Services', key:'svc-6-desc', label:'Service 6 text', kind:'textarea', def:'Comedy-plus-education video work — teaching something real inside something fun to watch.'},
    {group:'Experience', key:'exp-1-title', label:'Experience 1 title', kind:'text', def:'Graphic Designer & Video Editor — Jax Corporation'},
    {group:'Experience', key:'exp-1-desc', label:'Experience 1 text', kind:'textarea', def:'Graphic design and video editing at Jax Corporation.'},
    {group:'Experience', key:'exp-2-title', label:'Experience 2 title', kind:'text', def:'Founder — QuickShoppingNow (QSN)'},
    {group:'Experience', key:'exp-2-desc', label:'Experience 2 text', kind:'textarea', def:'A fashion marketplace for Bangladesh, launching on my own stores first. Marketplace website, multiple stores and real product listings — built from zero capital.'},
    {group:'Experience', key:'exp-3-title', label:'Experience 3 title', kind:'text', def:'Founder — LUXAUR'},
    {group:'Experience', key:'exp-3-desc', label:'Experience 3 text', kind:'textarea', def:'My own shoe brand, starting with a black leather backless mule.'},
    {group:'Experience', key:'exp-4-title', label:'Experience 4 title', kind:'text', def:'Designer, Video Editor & Social Media Manager — Raju Interior House and Gold Furniture'},
    {group:'Experience', key:'exp-4-desc', label:'Experience 4 text', kind:'textarea', def:'Design, video editing and social media management for an interior house and a furniture brand.'},
    {group:'Experience', key:'exp-5-title', label:'Experience 5 title', kind:'text', def:'Computer Training — NYTA'},
    {group:'Experience', key:'exp-5-desc', label:'Experience 5 text', kind:'textarea', def:'6-month computer training course.'},
    {group:'Experience', key:'exp-6-title', label:'Experience 6 title', kind:'text', def:'Digital Marketing Course — Signature Mind Institute'},
    {group:'Experience', key:'exp-6-desc', label:'Experience 6 text', kind:'textarea', def:'6-month digital marketing course.'},
    {group:'Experience', key:'exp-7-title', label:'Experience 7 title', kind:'text', def:'SSC (Science) — Gobindaganj Government High School'},
    {group:'Experience', key:'exp-7-desc', label:'Experience 7 text', kind:'textarea', def:'Secondary School Certificate, Science group.'}
  ];
  // Load the saved overrides (only fields that differ from the original).
  function getOverrides(){
    try{ var o=JSON.parse(read()||'null'); if(o && typeof o==='object') return o; }catch(e){}
    return {};
  }
  // Apply the saved overrides to the page (elements on this page only).
  // Every field is applied (override if saved, else its original text),
  // so clearing an override (Reset) restores the original at once.
  function apply(){
    var o=getOverrides();
    FIELDS.forEach(function(f){
      var el=document.querySelector('[data-text-key="'+f.key+'"]');
      if(!el) return;
      var v=o[f.key]||f.def;
      if(f.key==='hero-roles'){
        var parts=v.split('/').map(function(s){ return s.trim(); }).filter(Boolean);
        var joined=parts.map(function(p){ return '<b>'+esc(p)+'</b>'; }).join(', ');
        if(parts.length>1) joined=joined.replace(/, ([^,]*)$/,' & $1');
        el.innerHTML=joined;
      } else {
        el.textContent=v;
      }
    });
  }
  // Build the Texts editor inside the Admin panel.
  function buildAdmin(){
    var box=$('tx-list'); if(!box) return;
    box.innerHTML='';
    var o=getOverrides();
    var curGroup='';
    FIELDS.forEach(function(f){
      if(f.group!==curGroup){
        curGroup=f.group;
        var h=document.createElement('h5'); h.textContent=curGroup; box.appendChild(h);
      }
      var row=document.createElement('div'); row.className='admin-text-row';
      var lab=document.createElement('label'); lab.setAttribute('for','tx-'+f.key); lab.textContent=f.label;
      var inp;
      if(f.kind==='textarea'){ inp=document.createElement('textarea'); inp.rows=3; }
      else { inp=document.createElement('input'); inp.type='text'; }
      inp.id='tx-'+f.key;
      inp.value=o[f.key]||f.def;
      row.appendChild(lab); row.appendChild(inp); box.appendChild(row);
    });
  }
  // Save the Texts editor (only values that differ from the original).
  function saveAdmin(){
    var o={};
    FIELDS.forEach(function(f){
      var el=$('tx-'+f.key);
      if(!el) return;
      var v=el.value.trim();
      if(v && v!==f.def) o[f.key]=v;
    });
    store(JSON.stringify(o));
    apply();
    var s=$('tx-saved'); if(s){ s.hidden=false; setTimeout(function(){ s.hidden=true; }, 3000); }
  }
  // Reset all texts to the original (clears the overrides).
  function resetAdmin(){
    store('{}');
    buildAdmin(); apply();
  }
  var saveBtn=$('tx-save');
  if(saveBtn) saveBtn.addEventListener('click', saveAdmin);
  var resetBtn=$('tx-reset');
  if(resetBtn) resetBtn.addEventListener('click', resetAdmin);
  buildAdmin();
  apply();
})();
