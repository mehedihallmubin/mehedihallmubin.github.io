/* 03. reviews.js - Review system for the personal website.
   Google reviews widget + Give a Review button + manual reviews + admin.
   Settings live in localStorage (per device). No fake reviews, ever. */
(function(){
  // Storage keys (localStorage; in-memory fallback if storage is unavailable).
  var K_LINK='pw_review_link', K_WIDGET='pw_review_widget', K_MANUAL='pw_manual_reviews';
  var mem={};
  // Save a value (localStorage first, memory fallback).
  function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){ mem[k]=v; } }
  // Read a value (localStorage first, memory fallback).
  function read(k){ try{ return localStorage.getItem(k); }catch(e){ return (k in mem)?mem[k]:null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Escape text for safe HTML insertion.
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  // Star icon (inline SVG) used for ratings.
  var STAR='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6 1.04-4.9 4.5 1.3 6.7L12 17.3 6.1 20.5l1.3-6.7L2.5 9.3l6.6-1.04z"/></svg>';
  // Build a 5-star row with n stars filled.
  function stars(n){ var h=''; for(var i=1;i<=5;i++){ h+='<span class="'+(i<=n?'on':'off')+'">'+STAR+'</span>'; } return '<span class="stars">'+h+'</span>'; }
  // Format an ISO date as "15 Nov 2026".
  function fmtDate(iso){ try{ return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return ''; } }
  // Load the manually added reviews (newest first).
  function getManual(){ try{ return JSON.parse(read(K_MANUAL)||'[]'); }catch(e){ return []; } }
  // Inject the pasted widget embed code. Scripts are recreated so they run.
  function renderWidget(code){
    var box=$('review-widget'); if(!box) return;
    box.innerHTML=''; box.hidden=!code;
    if(!code) return;
    var tmp=document.createElement('div'); tmp.innerHTML=code;
    Array.prototype.slice.call(tmp.childNodes).forEach(function(node){
      if(node.nodeType===1 && node.tagName==='SCRIPT'){
        var s=document.createElement('script');
        if(node.src){ s.src=node.src; } else { s.text=node.textContent; }
        if(node.async) s.async=true; if(node.defer) s.defer=true;
        box.appendChild(s);
      } else { box.appendChild(node); }
    });
  }
  // Render the whole Reviews section from the saved settings.
  function render(){
    var link=(read(K_LINK)||'').trim();
    var btn=$('give-review-btn');
    if(btn){ if(link){ btn.setAttribute('href',link); } else { btn.setAttribute('href','#'); } }
    renderWidget((read(K_WIDGET)||'').trim());
    var list=getManual();
    var grid=$('manual-reviews');
    if(!grid) return;
    grid.innerHTML='';
    list.forEach(function(r){
      var card=document.createElement('article'); card.className='card review-card';
      var initial=(r.name||'?').trim().charAt(0).toUpperCase();
      card.innerHTML='<div class="who"><span class="avatar">'+esc(initial)+'</span><div><b></b><span>'+esc(fmtDate(r.date))+'</span></div></div>'+stars(r.stars)+'<p></p>';
      card.querySelector('b').textContent=r.name;
      card.querySelector('p').textContent=r.text;
      grid.appendChild(card);
    });
    var sum=$('review-summary');
    if(sum){
      if(list.length){
        var avg=list.reduce(function(a,r){return a+r.stars;},0)/list.length;
        sum.innerHTML=stars(Math.round(avg))+'<span>'+avg.toFixed(1)+' out of 5 &middot; '+list.length+' review'+(list.length>1?'s':'')+'</span>';
        sum.hidden=false;
      } else { sum.hidden=true; sum.innerHTML=''; }
    }
    var emp=$('reviews-empty');
    if(emp) emp.hidden = !!((read(K_WIDGET)||'').trim() || list.length);
  }
  // Show a short message at the bottom of the screen.
  function toast(msg){
    var t=$('toast'); t.textContent=msg; t.hidden=false;
    clearTimeout(t._h); t._h=setTimeout(function(){ t.hidden=true; }, 3600);
  }
  // "Give a Review": open Google when a link is saved, else explain why not.
  var grb=$('give-review-btn');
  if(grb) grb.addEventListener('click', function(e){
    if(!(read(K_LINK)||'').trim()){ e.preventDefault(); toast("Google review link isn't connected yet — add it from Admin."); }
  });
  // List the saved manual reviews inside the admin panel.
  function renderMrList(){
    var box=$('mr-list'); box.innerHTML='';
    getManual().forEach(function(r,i){
      var d=document.createElement('div'); d.className='mr-item';
      var s=document.createElement('span'); s.textContent=r.name+' · '+r.stars+'★ · '+fmtDate(r.date);
      var b=document.createElement('button'); b.type='button'; b.textContent='Delete';
      b.addEventListener('click', function(){
        var l=getManual(); l.splice(i,1); store(K_MANUAL, JSON.stringify(l)); renderMrList(); render();
      });
      d.appendChild(s); d.appendChild(b); box.appendChild(d);
    });
  }
  // Open the admin panel and fill it with the saved settings.
  function openAdmin(){
    $('admin-link').value=(read(K_LINK)||'');
    $('admin-widget').value=(read(K_WIDGET)||'');
    renderMrList();
    $('admin-saved').hidden=true;
    $('admin-modal').hidden=false;
    // Let the other admin sections (social, community) fill their fields.
    document.dispatchEvent(new CustomEvent('pw-admin-open'));
  }
  // Close the admin panel.
  function closeAdmin(){ $('admin-modal').hidden=true; }
  // Admin open/close wiring (close button, backdrop, Escape).
  // There is no visible Admin button on the public site — the panel
  // opens only from a #admin link (bookmark it). Guarded so removing
  // the button never breaks the page.
  var openBtn=$('admin-open');
  if(openBtn) openBtn.addEventListener('click', openAdmin);
  $('admin-close').addEventListener('click', closeAdmin);
  $('admin-modal').addEventListener('click', function(e){ if(e.target===$('admin-modal')) closeAdmin(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeAdmin(); });
  // Open the panel from a #admin link, then clear the hash so a reload
  // does not reopen it. The hashchange listener covers adding #admin
  // to a page that is already open (no reload). The first check runs on
  // DOMContentLoaded so the other admin scripts have loaded and are
  // listening for the open event before the panel opens.
  function openFromHash(){
    if(location.hash==='#admin'){ openAdmin(); history.replaceState(null,'',location.pathname+location.search); }
  }
  document.addEventListener('DOMContentLoaded', openFromHash);
  window.addEventListener('hashchange', openFromHash);
  // Save settings: Google review link + widget embed code.
  $('admin-save').addEventListener('click', function(){
    store(K_LINK, $('admin-link').value.trim());
    store(K_WIDGET, $('admin-widget').value.trim());
    render();
    var s=$('admin-saved'); s.hidden=false;
    setTimeout(function(){ s.hidden=true; }, 3000);
  });
  // Add a manual review (real reviews only).
  $('mr-add').addEventListener('click', function(){
    var name=$('mr-name').value.trim(), text=$('mr-text').value.trim(), starsN=parseInt($('mr-stars').value,10)||5;
    if(!name || !text){ toast('Name and review text both needed.'); return; }
    var l=getManual(); l.unshift({name:name, stars:starsN, text:text, date:new Date().toISOString()});
    store(K_MANUAL, JSON.stringify(l));
    $('mr-name').value=''; $('mr-text').value='';
    renderMrList(); render();
    toast('Review added.');
  });
  // Initial render on page load.
  render();
})();