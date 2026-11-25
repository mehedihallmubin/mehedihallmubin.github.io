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
  // The 10 real brands (same as the static cards on the Brands page).
  // logo = tile mark (text or SVG, as in the home mockup); tile = tile colour.
  var HOUSE='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5"/></svg>';
  var SOFA='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z"/><path d="M6 19v-2M18 19v-2"/></svg>';
  var MOON='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
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
    {mono:'AMI', logo:AMI, tile:'bt-ami', name:'Al Mubin Industries', role:'Founder & Sole Owner', line:'Planned company — QuickShoppingNow is its first project.'},
    {mono:'LUNA', logo:MOON, tile:'bt-luna', name:'Luna', role:'Founder', line:'My AI voice assistant, launching ~May 2027.'}
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
  // Render the terminal Portfolio brands panel (#pf-brands) from the list
  // (Portfolio page only). Admin edits re-render here too.
  function render(){
    var box=document.getElementById('pf-brands');
    if(!box) return;
    var list=getList();
    box.innerHTML='';
    list.forEach(function(b){
      var d=document.createElement('div'); d.className='pf-brand';
      var monoTxt=b.mono||mono(b.name);
      var tile=b.tile||'bt-default';
      d.innerHTML='<span class="pf-b-mono '+esc(tile)+'"></span><div><b></b><span></span></div>';
      d.querySelector('.pf-b-mono').textContent=monoTxt;
      d.querySelector('b').textContent=b.name;
      d.querySelector('div span').textContent=b.role+' — '+b.line;
      box.appendChild(d);
    });
    var c=$('pf-brands-count'); if(c) c.textContent=list.length;
  }
  // Render the home page "My Brands & Projects" grid (home page only).
  // Tile mark comes from the brand's logo (default brands) or its monogram
  // (Admin-added brands); tile colour from the brand's tile class.
  // Home page "My Brands & Projects" — the 4 featured brands (Jax, LUXAUR,
  // QuickShoppingNow, Raju), rendered from the live brand list so Admin
  // edits to those brands show here. The full list lives on Portfolio.
  // Short role lines are the mockup's (the full roles are too long for the
  // narrow home cards).
  var FEATURED=['Al Mubin Industries','QuickShoppingNow','LUXAUR','Luna'];
  var SHORT_ROLE={'Al Mubin Industries':'Parent Company','QuickShoppingNow':'E-commerce','LUXAUR':'Fashion Brand','Luna':'AI Assistant'};
  function renderHome(){
    var grid=document.getElementById('hp-brands');
    if(!grid) return;
    var list=getList().filter(function(b){ return FEATURED.indexOf(b.name)!== -1; });
    // Keep the mockup's featured order even if the list order changes.
    list.sort(function(a,b){ return FEATURED.indexOf(a.name)-FEATURED.indexOf(b.name); });
    grid.innerHTML='';
    list.forEach(function(b){
      var card=document.createElement('a');
      card.className='hp-brand';
      card.href='portfolio.html';
      var logo=b.logo || b.mono || mono(b.name);
      var tile=b.tile || 'bt-default';
      card.innerHTML='<span class="hp-brand-tile '+esc(tile)+'">'+logo+'</span><span class="hp-brand-txt"><b></b><span></span></span><span class="hp-brand-arrow" aria-hidden="true">&#8599;</span>';
      card.querySelector('.hp-brand-txt b').textContent=b.name;
      card.querySelector('.hp-brand-txt span').textContent=SHORT_ROLE[b.name]||b.role;
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
  // Show the Add Brand form.
  function openAddForm(){
    var f=$('br-add-form');
    if(!f) return;
    f.hidden=false;
    $('br-name').focus();
  }
  // Hide the Add Brand form.
  function closeAddForm(){
    var f=$('br-add-form');
    if(f) f.hidden=true;
  }
  // Fill the Admin form for editing one brand.
  function startEdit(i){
    var b=getList()[i]; if(!b) return;
    editing=i;
    $('br-name').value=b.name; $('br-role').value=b.role; $('br-line').value=b.line;
    $('br-add').textContent='Save changes';
    $('br-cancel').hidden=false;
    openAddForm();
  }
  // Clear the Admin form back to "add" mode and hide it.
  function resetForm(){
    editing=null;
    $('br-name').value=''; $('br-role').value=''; $('br-line').value='';
    $('br-add').textContent='Add brand';
    $('br-cancel').hidden=true;
    closeAddForm();
  }
  // Render the brand list inside the Admin panel, with serial numbers.
  function renderAdminList(){
    var box=$('br-list'); if(!box) return;
    box.innerHTML='';
    getList().forEach(function(b,i){
      var d=document.createElement('div'); d.className='admin-item';
      var top=document.createElement('div'); top.className='admin-item-top';
      var num=document.createElement('span'); num.className='admin-item-num'; num.textContent=(i+1);
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
      top.appendChild(num); top.appendChild(s); top.appendChild(e); top.appendChild(del);
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
  var addOpenBtn=$('br-add-open');
  if(addOpenBtn) addOpenBtn.addEventListener('click', function(){ resetForm(); openAddForm(); });
  var addBtn=$('br-add');
  if(addBtn) addBtn.addEventListener('click', saveForm);
  var cancelBtn=$('br-cancel');
  if(cancelBtn) cancelBtn.addEventListener('click', resetForm);
  // ---- Terminal portfolio (portfolio.html only) ----
  // Infinite canvas: drag to pan, wheel to zoom, rail / arrows / keys to jump
  // between the 8 panels, counter [n/8]. On phone the panels stack and
  // scroll normally (see the phone CSS).
  var THEMES=[
    {id:'blackmoney', name:'Blackmoney', bg:'#0a0a0a', acc:'#ff5c38'},
    {id:'circuit', name:'Circuit', bg:'#0b1220', acc:'#38bdf8'},
    {id:'lightning', name:'Lightning', bg:'#0a0a08', acc:'#facc15'},
    {id:'crimson', name:'Crimson', bg:'#0d0205', acc:'#dc143c'},
    {id:'gold', name:'Gold', bg:'#0d0b06', acc:'#d4af37'},
    {id:'forest', name:'Forest', bg:'#060d08', acc:'#22c55e'},
    {id:'ocean', name:'Ocean', bg:'#050a12', acc:'#38bdf8'},
    {id:'mono', name:'Mono', bg:'#000000', acc:'#ffffff'}
  ];
  // Real GitHub commit counts per day (api.github.com, 2026-11-26).
  var COMMITS={'2026-11-22':3,'2026-11-23':11,'2026-11-24':7,'2026-11-25':6};
  function initTerminal(){
    var app=document.querySelector('.pf-app');
    if(!app) return;
    var stage=$('pf-stage'), canvas=$('pf-canvas');
    if(!stage||!canvas) return;
    var panels=Array.prototype.slice.call(canvas.querySelectorAll('.pf-panel'));
    var railItems=Array.prototype.slice.call(document.querySelectorAll('.pf-rail-item'));
    var counter=$('pf-counter'), zoomLabel=$('pf-zoom-label');
    var N=panels.length;
    var state={x:0,y:0,s:1,cur:0};
    var isPhone=function(){ return window.innerWidth<=760; };
    function apply(){ canvas.style.transform='translate('+state.x+'px,'+state.y+'px) scale('+state.s+')'; }
    function stageSize(){ return {w:stage.clientWidth,h:stage.clientHeight}; }
    function setAnim(on){ canvas.classList.toggle('no-anim', !on); }
    function updateCounter(){
      var best=0, bd=1e9, i, d;
      if(isPhone()){
        var mid=window.scrollY+window.innerHeight/2;
        panels.forEach(function(p,idx){
          var r=p.getBoundingClientRect();
          var c=r.top+window.scrollY+r.height/2;
          d=Math.abs(c-mid); if(d<bd){bd=d;best=idx;}
        });
      } else {
        var st=stageSize();
        var cx=(st.w/2-state.x)/state.s, cy=(st.h/2-state.y)/state.s;
        panels.forEach(function(p,idx){
          var px=p.offsetLeft+p.offsetWidth/2, py=p.offsetTop+p.offsetHeight/2;
          d=Math.hypot(px-cx,py-cy); if(d<bd){bd=d;best=idx;}
        });
      }
      state.cur=best;
      if(counter) counter.textContent='['+(best+1)+'/'+N+']';
      railItems.forEach(function(it,idx){ it.classList.toggle('is-active', idx===best); });
    }
    function goTo(i, animate){
      i=Math.max(0, Math.min(N-1, i));
      state.cur=i;
      if(isPhone()){
        panels[i].scrollIntoView({behavior:animate===false?'auto':'smooth', block:'start'});
        updateCounter();
        return;
      }
      var st=stageSize();
      var fitS=Math.min(1, (st.w-80)/880);
      var s=Math.max(fitS, 0.35);
      state.s=s;
      var cx=panels[i].offsetLeft+panels[i].offsetWidth/2;
      var cy=panels[i].offsetTop+panels[i].offsetHeight/2;
      state.x=st.w/2-cx*s;
      state.y=st.h/2-cy*s;
      setAnim(animate!==false);
      apply();
      if(zoomLabel) zoomLabel.textContent=Math.round(s*100)+'%';
      updateCounter();
    }
    function fitAll(animate){
      if(isPhone()) return;
      var st=stageSize();
      var cw=canvas.scrollWidth, ch=canvas.scrollHeight;
      if(!cw||!ch) return;
      var s=Math.min((st.w-60)/cw, (st.h-60)/ch, 1);
      state.s=s;
      state.x=(st.w-cw*s)/2;
      state.y=(st.h-ch*s)/2;
      setAnim(animate!==false);
      apply();
      if(zoomLabel) zoomLabel.textContent=Math.round(s*100)+'%';
      updateCounter();
    }
    function zoomBy(f, cx, cy){
      if(isPhone()) return;
      var ns=Math.max(0.25, Math.min(1.5, state.s*f));
      var st=stageSize();
      cx=(cx===undefined)?st.w/2:cx;
      cy=(cy===undefined)?st.h/2:cy;
      var wx=(cx-state.x)/state.s, wy=(cy-state.y)/state.s;
      state.s=ns;
      state.x=cx-wx*ns;
      state.y=cy-wy*ns;
      setAnim(false);
      apply();
      if(zoomLabel) zoomLabel.textContent=Math.round(ns*100)+'%';
      updateCounter();
    }
    // Drag to pan (a real drag pans; a plain click still follows links).
    var pDown=null, pDrag=false, suppressClick=false;
    stage.addEventListener('pointerdown', function(e){
      if(isPhone()) return;
      pDown={x:e.clientX, y:e.clientY, sx:state.x, sy:state.y};
      pDrag=false;
    });
    window.addEventListener('pointermove', function(e){
      if(!pDown||isPhone()) return;
      var dx=e.clientX-pDown.x, dy=e.clientY-pDown.y;
      if(!pDrag && Math.hypot(dx,dy)>5){ pDrag=true; stage.classList.add('dragging'); }
      if(pDrag){
        state.x=pDown.sx+dx; state.y=pDown.sy+dy;
        setAnim(false);
        apply();
      }
    });
    window.addEventListener('pointerup', function(){
      if(pDown && pDrag){ suppressClick=true; setTimeout(function(){ suppressClick=false; }, 50); setTimeout(updateCounter, 60); }
      pDown=null;
      if(pDrag){ pDrag=false; stage.classList.remove('dragging'); }
    });
    stage.addEventListener('click', function(e){
      if(suppressClick){ e.stopPropagation(); e.preventDefault(); }
    }, true);
    // Wheel: zoom over the canvas background; scroll inside a panel's content.
    stage.addEventListener('wheel', function(e){
      if(isPhone()) return;
      var el=e.target.closest ? e.target.closest('.pf-content') : null;
      if(el){
        var canUp=el.scrollTop>0;
        var canDown=el.scrollTop+el.clientHeight<el.scrollHeight-1;
        if((e.deltaY<0 && canUp)||(e.deltaY>0 && canDown)) return;
      }
      e.preventDefault();
      var r=stage.getBoundingClientRect();
      var f=e.deltaY<0 ? 1.12 : 1/1.12;
      zoomBy(f, e.clientX-r.left, e.clientY-r.top);
    }, {passive:false});
    // Rail / prev / next / zoom buttons.
    railItems.forEach(function(it,i){ it.addEventListener('click', function(){ goTo(i); }); });
    var prevBtn=$('pf-prev'), nextBtn=$('pf-next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(state.cur-1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(state.cur+1); });
    var zi=$('pf-zoom-in'), zo=$('pf-zoom-out'), zf=$('pf-zoom-fit');
    if(zi) zi.addEventListener('click', function(){ zoomBy(1.25); });
    if(zo) zo.addEventListener('click', function(){ zoomBy(1/1.25); });
    if(zf) zf.addEventListener('click', function(){ fitAll(); });
    document.addEventListener('keydown', function(e){
      if(!app) return;
      var t=e.target;
      if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)) return;
      var adm=$('admin-modal');
      if(adm && !adm.hidden) return;
      if(e.key==='ArrowRight'){ goTo(state.cur+1); }
      else if(e.key==='ArrowLeft'){ goTo(state.cur-1); }
      else if(e.key==='+'||e.key==='='){ zoomBy(1.25); }
      else if(e.key==='-'){ zoomBy(1/1.25); }
      else if(e.key==='0'){ fitAll(); }
    });
    var rT=null;
    window.addEventListener('resize', function(){
      clearTimeout(rT);
      rT=setTimeout(function(){ goTo(state.cur, false); }, 150);
    });
    window.addEventListener('load', function(){ goTo(state.cur, false); });
    // Themes: build the 8 cards, click recolors the whole terminal.
    var themeBox=$('pf-themes');
    if(themeBox){
      themeBox.innerHTML='';
      THEMES.forEach(function(t){
        var b=document.createElement('button');
        b.type='button'; b.className='pf-theme'; b.setAttribute('data-theme', t.id);
        b.innerHTML='<span class="pf-theme-mini">'
          +'<span class="t-line"><span class="t-kw">const</span> <span class="t-var">theme</span> = <span class="t-str">"'+esc(t.id)+'"</span>;</span>'
          +'<span class="t-line"><span class="t-com">// bg '+esc(t.bg)+' &middot; accent '+esc(t.acc)+'</span></span>'
          +'<span class="t-line"><span class="t-fn">apply</span>(theme);</span>'
          +'</span><span class="pf-theme-name">'+esc(t.name)+'<i>&#9679; active</i></span>';
        b.addEventListener('click', function(){ applyTheme(t.id); });
        themeBox.appendChild(b);
      });
    }
    function applyTheme(id){
      var t=THEMES[0];
      THEMES.forEach(function(x){ if(x.id===id) t=x; });
      app.setAttribute('data-theme', t.id);
      var cs=$('pf-cs-name'); if(cs) cs.textContent=t.id;
      var at=$('pf-active-theme'); if(at) at.textContent=t.id;
      Array.prototype.slice.call(document.querySelectorAll('.pf-theme')).forEach(function(c){
        c.classList.toggle('is-active', c.getAttribute('data-theme')===t.id);
      });
      try{ localStorage.setItem('pw_pf_theme', t.id); }catch(e){}
    }
    var saved=null;
    try{ saved=localStorage.getItem('pw_pf_theme'); }catch(e){}
    applyTheme(saved||'blackmoney');
    // Contribution calendar (real commit counts, see COMMITS).
    var cal=$('pf-cal');
    if(cal){
      var weeks=26, today=new Date(); today.setHours(0,0,0,0);
      var start=new Date(today);
      start.setDate(start.getDate()-start.getDay()-(weeks-1)*7);
      cal.innerHTML='';
      var total=0;
      for(var w=0; w<weeks; w++){
        for(var d=0; d<7; d++){
          var dt=new Date(start); dt.setDate(start.getDate()+w*7+d);
          var key=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
          var c=COMMITS[key]||0; total+=c;
          var lv=c===0?0:c<=3?1:c<=6?2:c<=10?3:4;
          var cell=document.createElement('span');
          cell.className='pf-cal-cell lv'+lv;
          cell.title=key+' · '+c+' commit'+(c===1?'':'s');
          if(dt>today) cell.classList.add('future');
          cal.appendChild(cell);
        }
      }
      var cap=$('pf-cal-cap');
      if(cap) cap.textContent=total+' commits · since 22 Nov 2026 · github.com/mehedihallmubin';
    }
    // Start on the intro panel.
    goTo(0, false);
    window.addEventListener('scroll', updateCounter, {passive:true});
  }
  renderAdminList();
  render();
  renderHome();
  initTerminal();
})();
