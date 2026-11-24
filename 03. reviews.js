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
  // ---- Admin dashboard (Option A) ----
  // Real counts only: blog posts + manual reviews + brands come from
  // localStorage (defaults where the site ships them); social (26),
  // community (9) and texts (29) are fixed section sizes. Views/visitors
  // are 0 — this static site tracks nothing. Recent activity logs real
  // admin opens to localStorage; nothing here is invented.
  var K_ACT='pw_admin_activity';
  var DS_FIXED={social:26, community:9, texts:29};
  function countArr(k){ try{ var a=JSON.parse(read(k)||'[]'); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
  function getCounts(){
    var brands=read('pw_brands');
    var bn=9; // site ships 9 real brands; an edited list lives in pw_brands
    if(brands){ try{ var a=JSON.parse(brands); if(Array.isArray(a)) bn=a.length; }catch(e){} }
    return {posts:countArr('pw_blog_posts'), brands:bn, reviews:countArr(K_MANUAL),
      social:DS_FIXED.social, community:DS_FIXED.community, texts:DS_FIXED.texts};
  }
  function setTxt(id,v){ var el=$(id); if(el) el.textContent=v; }
  function relTime(ts){
    var d=Math.max(0, Date.now()-ts), m=Math.floor(d/60000);
    if(m<1) return 'Just now';
    if(m<60) return m+(m===1?' min ago':' min ago');
    var h=Math.floor(m/60); if(h<24) return h+(h===1?' hour ago':' hours ago');
    return new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  }
  function getActivity(){ try{ var a=JSON.parse(read(K_ACT)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function logActivity(label){
    var a=getActivity(); a.unshift({label:label, ts:Date.now()});
    store(K_ACT, JSON.stringify(a.slice(0,20)));
  }
  function renderAdminDashboard(){
    var c=getCounts();
    setTxt('ds-posts', c.posts); setTxt('ds-brands', c.brands); setTxt('ds-reviews', c.reviews);
    setTxt('ds-social', c.social);
    setTxt('ds-mc-posts', c.posts===0?'No posts yet':(c.posts+(c.posts===1?' post':' posts')));
    setTxt('ds-mc-brands', c.brands+(c.brands===1?' brand':' brands'));
    setTxt('ds-mc-reviews', c.reviews===0?'No reviews yet':(c.reviews+(c.reviews===1?' review':' reviews')));
    setTxt('ds-mc-community', c.community+' communities');
    setTxt('ds-mc-texts', c.texts+' texts');
    setTxt('ds-ag-posts', c.posts); setTxt('ds-ag-brands', c.brands); setTxt('ds-ag-reviews', c.reviews);
    setTxt('ds-ag-social', c.social); setTxt('ds-ag-community', c.community); setTxt('ds-ag-texts', c.texts);
    // Donut: real distribution over Blog / Brands / Reviews / Community / Texts.
    var cats=[['Blog Posts',c.posts,'rgba(220,20,60,.35)'],['Brands',c.brands,'#8B0000'],['Reviews',c.reviews,'rgba(220,20,60,.25)'],['Community',c.community,'rgba(220,20,60,.6)'],['Texts',c.texts,'#DC143C']];
    var total=cats.reduce(function(s,x){ return s+x[1]; },0);
    var donut=$('ds-donut'), legend=$('ds-donut-legend'), center=$('ds-donut-center');
    if(donut){
      if(total===0){ donut.style.background='rgba(255,255,255,.08)'; if(center) center.innerHTML='No<br>content'; }
      else{
        var stops=[], acc=0;
        cats.forEach(function(x){ var p=x[1]/total*100; stops.push(x[2]+' '+acc+'% '+(acc+p)+'%'); acc+=p; });
        donut.style.background='conic-gradient('+stops.join(',')+')';
        if(center) center.innerHTML='All<br>Content';
      }
    }
    if(legend){
      legend.innerHTML=cats.map(function(x){
        var pc=total===0?0:Math.round(x[1]/total*100);
        return '<li><span class="dot" style="background:'+x[2]+'"></span>'+esc(x[0])+'<b>'+pc+'%</b></li>';
      }).join('');
    }
    // Recent activity: last 3 real admin opens/views (or all, when expanded).
    var list=$('ds-activity');
    if(list){
      var a=getActivity().slice(0, activityExpanded?20:3);
      if(a.length===0){ list.innerHTML='<li class="admin-activity-empty">No activity yet — opens and views will appear here.</li>'; }
      else{
        list.innerHTML=a.map(function(x){
          return '<li><span class="act-ic"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></span>'+esc(x.label)+'<time>'+relTime(x.ts)+'</time></li>';
        }).join('');
      }
    }
  }
  // Switch the admin view (dashboard + 8 sections). Logs the view as real activity.
  var VIEW_LABELS={dashboard:'Dashboard viewed', blog:'Blog Posts viewed', social:'Social Links viewed', brands:'Brands viewed', reviews:'Reviews viewed', community:'Community Links viewed', texts:'Texts viewed', analytics:'Analytics viewed', settings:'Settings viewed'};
  function showAdminView(name, focusId){
    var views=document.querySelectorAll('#admin-modal .admin-view');
    views.forEach(function(v){ v.hidden=(v.getAttribute('data-view')!==name); });
    document.querySelectorAll('#admin-modal [data-admin-view]').forEach(function(b){
      var isNav=b.classList.contains('admin-nav-item')||b.classList.contains('admin-tab');
      if(isNav) b.classList.toggle('active', b.getAttribute('data-admin-view')===name);
    });
    var more=$('admin-more-menu'); if(more) more.hidden=true;
    closeSideDrawer();
    logActivity(VIEW_LABELS[name]||'Admin viewed');
    renderAdminDashboard();
    if(focusId){ var f=$(focusId); if(f) setTimeout(function(){ f.focus(); }, 60); }
    var main=document.querySelector('#admin-modal .admin-main'); if(main) main.scrollTop=0;
  }
  // Wire every dashboard navigation button (sidebar, phone tabs, quick
  // actions, manage cards, more-menu) to the view switcher.
  document.querySelectorAll('#admin-modal [data-admin-view]').forEach(function(b){
    b.addEventListener('click', function(){ showAdminView(b.getAttribute('data-admin-view'), b.getAttribute('data-admin-focus')); });
  });
  // "All Activity" toggles the full real activity log (up to 20 entries).
  var activityExpanded=false;
  var allActBtn=$('ds-all-activity');
  if(allActBtn) allActBtn.addEventListener('click', function(){
    activityExpanded=!activityExpanded;
    allActBtn.innerHTML=activityExpanded?'Show less &lsaquo;':'All Activity &rsaquo;';
    renderAdminDashboard();
  });
  // Phone hamburger: open the sidebar as an overlay drawer.
  var sideBar=document.querySelector('#admin-modal .admin-side');
  var sideBackdrop=$('admin-side-backdrop');
  var menuBtn=$('admin-tab-menu');
  function closeSideDrawer(){ if(sideBar) sideBar.classList.remove('open'); if(sideBackdrop) sideBackdrop.hidden=true; }
  if(menuBtn) menuBtn.addEventListener('click', function(e){
    e.stopPropagation();
    var open=sideBar && sideBar.classList.toggle('open');
    if(sideBackdrop) sideBackdrop.hidden=!open;
  });
  if(sideBackdrop) sideBackdrop.addEventListener('click', closeSideDrawer);
  // Phone "more" menu (Community / Texts / Analytics / Settings).
  var moreBtn=$('admin-tab-more'), moreMenu=$('admin-more-menu');
  if(moreBtn && moreMenu){
    moreBtn.addEventListener('click', function(e){ e.stopPropagation(); moreMenu.hidden=!moreMenu.hidden; });
    document.addEventListener('click', function(e){ if(!moreMenu.hidden && !moreMenu.contains(e.target)) moreMenu.hidden=true; });
  }
  // Bell: no notification system exists — say so honestly.
  var bell=$('admin-bell'); if(bell) bell.addEventListener('click', function(){ toast('No new notifications.'); });
  // Logout: no password exists — it just closes the panel.
  var logout=$('admin-logout'); if(logout) logout.addEventListener('click', function(){ closeAdmin(); toast('Admin closed.'); });
  // Date-range select: no visitor data to filter — say so honestly.
  var range=$('ds-range'); if(range) range.addEventListener('change', function(){ toast('No visitor data yet — nothing to filter.'); });
  // Settings: clear every saved admin change on this device.
  var clearBtn=$('admin-clear-data');
  if(clearBtn) clearBtn.addEventListener('click', function(){
    ['pw_review_link','pw_review_widget','pw_manual_reviews','pw_social_links','pw_community_links','pw_blog_posts','pw_brands','pw_texts','pw_admin_activity'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    var m=$('admin-cleared'); if(m) m.hidden=false;
    renderAdminDashboard();
    toast('Saved admin data cleared.');
  });
  // Open the admin panel and fill it with the saved settings.
  function openAdmin(){
    $('admin-link').value=(read(K_LINK)||'');
    $('admin-widget').value=(read(K_WIDGET)||'');
    renderMrList();
    $('admin-saved').hidden=true;
    $('admin-modal').hidden=false;
    showAdminView('dashboard');
    logActivity('Admin panel accessed');
    renderAdminDashboard();
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