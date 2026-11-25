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
    // Social = platforms actually added (fixed with a saved profile link
    // + custom platforms), not the 26 fixed slots.
    var sc=0;
    try{
      var lk=JSON.parse(read('pw_social_links')||'{}');
      Object.keys(lk).forEach(function(id){ if(/^https?:\/\/.+/.test(lk[id]||'')) sc++; });
    }catch(e){}
    try{ var cu=JSON.parse(read('pw_social_custom')||'[]'); if(Array.isArray(cu)) cu.forEach(function(c){ if(c && /^https?:\/\/.+/.test(c.url||'')) sc++; }); }catch(e){}
    return {posts:countArr('pw_blog_posts'), brands:bn, reviews:countArr(K_MANUAL),
      social:sc, community:DS_FIXED.community, texts:DS_FIXED.texts};
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
    if(name==='settings') fillSettingsForm();
    if(name==='analytics') renderAnChart();
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
  // Logout: closes the panel and clears the login session, so the next
  // #mawa visit asks for email + password again.
  var logout=$('admin-logout'); if(logout) logout.addEventListener('click', function(){ mawaClearSession(); closeAdmin(); toast('Admin closed.'); });
  // Date-range select: no visitor data to filter — say so honestly.
  var range=$('ds-range'); if(range) range.addEventListener('change', function(){ toast('No visitor data yet — nothing to filter.'); });
  // Settings: clear every saved admin change on this device.
  var clearBtn=$('admin-clear-data');
  if(clearBtn) clearBtn.addEventListener('click', function(){
    ['pw_review_link','pw_review_widget','pw_manual_reviews','pw_social_links','pw_social_custom','pw_community_links','pw_blog_posts','pw_brands','pw_texts','pw_admin_activity','pw_settings','pw_last_saved'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    var m=$('admin-cleared'); if(m) m.hidden=false;
    applySettings();
    renderAdminDashboard();
    toast('Saved admin data cleared.');
  });
  // ============ SETTINGS PAGE (Neon Red Glassmorphism) ============
  // Settings live in localStorage (this device only) under pw_settings.
  var K_SET='pw_settings';
  var K_SAVED='pw_last_saved';
  var SET_DEFAULTS={
    title:'Mehedi H. All Mubin',
    tagline:'Creative \u2022 Professional',
    meta:'Mehedi H. All Mubin \u2014 designer, video editor and social media manager. Founder of QuickShoppingNow and LUXAUR. Portfolio at the bottom of this page.',
    url:'https://mehedihallmubin.github.io/',
    favicon:'',
    portrait:'',
    banner:'',
    role:'Creative \u2022 Professional',
    about:'I\u2019m a designer and video editor passionate about visual storytelling, brand building, and digital growth.',
    email:'mehedih.allmubin@gmail.com',
    phone:'+8801611541164',
    location:'',
    visibility:true, darkMode:true, animations:true, showAnalytics:true
  };
  // Email/phone currently applied to the page (defaults on first load).
  // applySettings() replaces these, so changing them again still works.
  var appliedEmail=SET_DEFAULTS.email;
  var appliedPhone=SET_DEFAULTS.phone;
  function getSettings(){
    var s={}; for(var k in SET_DEFAULTS) s[k]=SET_DEFAULTS[k];
    try{ var saved=JSON.parse(read(K_SET)||'null'); if(saved && typeof saved==='object') for(var k2 in saved) if(k2 in s) s[k2]=saved[k2]; }catch(e){}
    return s;
  }
  function storeSettings(s){ store(K_SET, JSON.stringify(s)); markSaved(); }
  function markSaved(){ try{ localStorage.setItem(K_SAVED, String(Date.now())); }catch(e){} updateSystemInfo(); }
  // Apply settings to the public site (runs on every page load).
  function applySettings(){
    var s=getSettings();
    var t=s.title||SET_DEFAULTS.title;
    document.title=t+(s.tagline?' \u2014 '+s.tagline:'');
    Array.prototype.slice.call(document.querySelectorAll('.brand-name, .home-brand-name, .home-hero-info h1, .hp-hero-info h1')).forEach(function(el){ el.textContent=t; });
    var m=document.querySelector('meta[name="description"]');
    if(m) m.setAttribute('content', s.meta||SET_DEFAULTS.meta);
    var fav=s.favicon||'m-logo.png';
    var link=document.querySelector('link[rel="icon"]')||document.querySelector('link[rel="shortcut icon"]');
    if(link) link.setAttribute('href', fav);
    // Customize: portrait, banner, role, about, email, phone, location.
    var pic=s.portrait||'mehedi-portrait.jpg';
    Array.prototype.slice.call(document.querySelectorAll('.home-portrait img, .hp-portrait img')).forEach(function(img){ img.src=pic; });
    var bn=$('home-banner'), bi=$('home-banner-img');
    if(bn && bi){
      if(s.banner){ bi.src=s.banner; bn.hidden=false; }
      else { bi.src=''; bn.hidden=true; }
    }
    var role=s.role||SET_DEFAULTS.role;
    Array.prototype.slice.call(document.querySelectorAll('.home-role, .hp-role')).forEach(function(el){ el.textContent=role; });
    var about=s.about||SET_DEFAULTS.about;
    Array.prototype.slice.call(document.querySelectorAll('.home-about p:not(.home-about-loc), .hp-about p:not(.hp-about-loc)')).forEach(function(el){ el.textContent=about; });
    var locEl=$('home-about-loc');
    if(locEl){
      if(s.location){ locEl.textContent=s.location; locEl.hidden=false; }
      else locEl.hidden=true;
    }
    var em=s.email||SET_DEFAULTS.email;
    var ph=s.phone||SET_DEFAULTS.phone;
    // Replace the previously applied email/phone (or the default on first
    // load) so changing them again still works.
    Array.prototype.slice.call(document.querySelectorAll('a[href^="mailto:"]')).forEach(function(a){
      var href=a.getAttribute('href');
      if(href.indexOf(appliedEmail)!== -1){
        a.setAttribute('href', href.split(appliedEmail).join(em));
        if(a.textContent.indexOf(appliedEmail)!== -1) a.textContent=a.textContent.split(appliedEmail).join(em);
      }
    });
    appliedEmail=em;
    Array.prototype.slice.call(document.querySelectorAll('a[href^="tel:"]')).forEach(function(a){
      var href=a.getAttribute('href');
      var telDigits=appliedPhone.replace(/[\s-]/g,'');
      if(href.indexOf(telDigits)!== -1){
        a.setAttribute('href', href.split(telDigits).join(ph.replace(/[\s-]/g,'')));
        // The visible text is formatted with spaces ("+880 1611 541164"),
        // so compare digits-only; replace only when the whole text is the number.
        if(a.textContent.replace(/[\s-]/g,'')===telDigits) a.textContent=ph;
      }
    });
    appliedPhone=ph;
    var b=document.getElementById('maint-banner');
    if(!s.visibility){
      if(!b){ b=document.createElement('div'); b.id='maint-banner'; b.className='maint-banner'; b.textContent='This website is under maintenance \u2014 please check back soon.'; if(document.body) document.body.insertBefore(b, document.body.firstChild); }
    } else if(b){ b.remove(); }
    document.documentElement.classList.toggle('light', !s.darkMode);
    document.documentElement.classList.toggle('no-anim', !s.animations);
    var showA=!!s.showAnalytics;
    Array.prototype.slice.call(document.querySelectorAll('[data-admin-view="analytics"]')).forEach(function(el){ el.style.display=showA?'':'none'; });
    var ov=document.querySelector('.admin-analytics'); if(ov) ov.style.display=showA?'':'none';
  }
  function setToggle(id, on){
    var b=$(id); if(!b) return;
    b.classList.toggle('on', !!on);
    b.setAttribute('aria-checked', on?'true':'false');
  }
  function getToggle(id){ var b=$(id); return b ? b.classList.contains('on') : true; }
  // Fill the Settings form from saved settings (when the Settings view opens).
  function fillSettingsForm(){
    // Always open on the General tab.
    document.querySelectorAll('.set-tab').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-set-tab')==='general'); });
    document.querySelectorAll('.set-panel').forEach(function(p){ p.hidden=p.getAttribute('data-set-panel')!=='general'; });
    var s=getSettings();
    var t=$('set-title'); if(t) t.value=s.title;
    var tg=$('set-tagline'); if(tg) tg.value=s.tagline;
    var mt=$('set-meta'); if(mt){ mt.value=s.meta; updateMetaCount(); }
    var u=$('set-url'); if(u) u.value=s.url;
    var fi=$('set-favicon-img'); if(fi) fi.src=s.favicon||'m-logo.png';
    setToggle('set-vis', s.visibility);
    setToggle('set-dark', s.darkMode);
    setToggle('set-anim', s.animations);
    setToggle('set-analytics', s.showAnalytics);
    updateSystemInfo();
  }
  // Save the General fields + toggle states.
  function saveSettingsForm(){
    var s=getSettings();
    var t=$('set-title'); if(t) s.title=t.value.trim()||SET_DEFAULTS.title;
    var tg=$('set-tagline'); if(tg) s.tagline=tg.value.trim();
    var mt=$('set-meta'); if(mt) s.meta=mt.value.trim()||SET_DEFAULTS.meta;
    s.visibility=getToggle('set-vis');
    s.darkMode=getToggle('set-dark');
    s.animations=getToggle('set-anim');
    s.showAnalytics=getToggle('set-analytics');
    storeSettings(s);
    applySettings();
    renderAdminDashboard();
    toast('Settings saved.');
  }
  // ============ CUSTOMIZE YOUR WEBSITE ============
  // Fill the Customize form from saved settings.
  function fillCustomizeForm(){
    var s=getSettings();
    var pi=$('cz-pic-img'); if(pi) pi.src=s.portrait||'mehedi-portrait.jpg';
    var bi=$('cz-banner-img'), be=$('cz-banner-empty');
    if(bi){ bi.src=s.banner||''; if(be) be.style.display=s.banner?'none':''; }
    var n=$('cz-name'); if(n) n.value=s.title;
    var r=$('cz-role'); if(r) r.value=s.role;
    var e=$('cz-email'); if(e) e.value=s.email;
    var p=$('cz-phone'); if(p) p.value=s.phone;
    var l=$('cz-location'); if(l) l.value=s.location||'';
    var a=$('cz-about'); if(a){ a.value=s.about; updateAboutCount(); }
  }
  // Save the Customize fields.
  function saveCustomizeForm(){
    var s=getSettings();
    var n=$('cz-name'); if(n) s.title=n.value.trim()||SET_DEFAULTS.title;
    var r=$('cz-role'); if(r) s.role=r.value.trim()||SET_DEFAULTS.role;
    var e=$('cz-email'); if(e && e.value.trim()) s.email=e.value.trim();
    var p=$('cz-phone'); if(p && p.value.trim()) s.phone=p.value.trim();
    var l=$('cz-location'); if(l) s.location=l.value.trim();
    var a=$('cz-about'); if(a) s.about=a.value.trim()||SET_DEFAULTS.about;
    storeSettings(s);
    applySettings();
    renderAdminDashboard();
    toast('Website updated.');
  }
  function updateAboutCount(){
    var a=$('cz-about'), c=$('cz-about-count');
    if(a && c) c.textContent=a.value.length+' / 600';
  }
  // Downscale an image file to a data URL (max dimension px).
  function imageToDataURL(file, maxDim, cb){
    if(!/^image\//.test(file.type)){ toast('Please choose an image file.'); return; }
    var img=new Image();
    var url=URL.createObjectURL(file);
    img.onload=function(){
      var w=img.naturalWidth, h=img.naturalHeight;
      var scale=Math.min(1, maxDim/Math.max(w,h));
      var cv=document.createElement('canvas');
      cv.width=Math.max(1, Math.round(w*scale)); cv.height=Math.max(1, Math.round(h*scale));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      cb(cv.toDataURL('image/jpeg', 0.85));
    };
    img.onerror=function(){ URL.revokeObjectURL(url); toast('Could not read that image.'); };
    img.src=url;
  }
  // Profile picture: Change / Remove.
  var czPicChange=$('cz-pic-change');
  if(czPicChange) czPicChange.addEventListener('click', function(){ var f=$('cz-pic-file'); if(f) f.click(); });
  var czPicFile=$('cz-pic-file');
  if(czPicFile) czPicFile.addEventListener('change', function(){
    var f=czPicFile.files && czPicFile.files[0];
    if(!f) return;
    imageToDataURL(f, 800, function(data){
      var s=getSettings(); s.portrait=data; storeSettings(s); applySettings();
      var pi=$('cz-pic-img'); if(pi) pi.src=data;
      toast('Profile picture updated.');
    });
    czPicFile.value='';
  });
  var czPicRemove=$('cz-pic-remove');
  if(czPicRemove) czPicRemove.addEventListener('click', function(){
    var s=getSettings(); s.portrait=''; storeSettings(s); applySettings();
    var pi=$('cz-pic-img'); if(pi) pi.src='mehedi-portrait.jpg';
    toast('Profile picture reset.');
  });
  // Banner image: Change / Remove.
  var czBannerChange=$('cz-banner-change');
  if(czBannerChange) czBannerChange.addEventListener('click', function(){ var f=$('cz-banner-file'); if(f) f.click(); });
  var czBannerFile=$('cz-banner-file');
  if(czBannerFile) czBannerFile.addEventListener('change', function(){
    var f=czBannerFile.files && czBannerFile.files[0];
    if(!f) return;
    imageToDataURL(f, 1400, function(data){
      var s=getSettings(); s.banner=data; storeSettings(s); applySettings();
      var bi=$('cz-banner-img'); if(bi) bi.src=data;
      var be=$('cz-banner-empty'); if(be) be.style.display='none';
      toast('Banner updated.');
    });
    czBannerFile.value='';
  });
  var czBannerRemove=$('cz-banner-remove');
  if(czBannerRemove) czBannerRemove.addEventListener('click', function(){
    var s=getSettings(); s.banner=''; storeSettings(s); applySettings();
    var bi=$('cz-banner-img'); if(bi) bi.src='';
    var be=$('cz-banner-empty'); if(be) be.style.display='';
    toast('Banner removed.');
  });
  // Customize: about counter + save button.
  var czAboutEl=$('cz-about');
  if(czAboutEl) czAboutEl.addEventListener('input', updateAboutCount);
  var czSaveBtn=$('cz-save');
  if(czSaveBtn) czSaveBtn.addEventListener('click', saveCustomizeForm);
  // Home header bell (public site): same as the admin bell.
  var hpBell=$('hp-bell');
  if(hpBell) hpBell.addEventListener('click', function(){ toast('No new notifications.'); });
  // ============ ANALYTICS ============
  // The site is static and tracks nothing, so every number is 0. The chart
  // still draws its grid + real date labels for the selected period, with an
  // honest empty state instead of a fake line.
  var AN_DAYS=30, AN_METRIC='visitors';
  function renderAnChart(){
    var svg=$('an-chart');
    if(!svg) return;
    var days=AN_DAYS;
    var W=720, H=260, L=44, R=10, T=12, B=28;
    var innerW=W-L-R, innerH=H-T-B;
    var max=1250;
    var ns='http://www.w3.org/2000/svg';
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    function el(name, attrs){ var e=document.createElementNS(ns,name); for(var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; }
    // Grid lines + y labels.
    var steps=[0,250,500,750,1000,1250];
    steps.forEach(function(v){
      var y=T+innerH-(v/max)*innerH;
      el('line',{x1:L,y1:y,x2:W-R,y2:y,stroke:'rgba(255,255,255,.07)','stroke-width':1});
      var t=el('text',{x:L-8,y:y+4,'text-anchor':'end',fill:'#A1A1AA','font-size':11});
      t.textContent=v.toLocaleString('en-US');
    });
    // X labels: real dates for the selected period (every ~3 days).
    var today=new Date();
    var start=new Date(today); start.setDate(today.getDate()-(days-1));
    var nLabels=Math.min(10, days);
    var fmt=function(d){ return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); };
    for(var i=0;i<nLabels;i++){
      var frac=nLabels===1?0:i/(nLabels-1);
      var d=new Date(start); d.setDate(start.getDate()+Math.round(frac*(days-1)));
      var x=L+frac*innerW;
      var t2=el('text',{x:x,y:H-8,'text-anchor':'middle',fill:'#A1A1AA','font-size':11});
      t2.textContent=fmt(d);
    }
    // Baseline (0 line) — no data line is drawn.
    el('line',{x1:L,y1:T+innerH,x2:W-R,y2:T+innerH,stroke:'rgba(255,255,255,.18)','stroke-width':1});
    var sub=$('an-chart-sub');
    if(sub){
      var label=AN_METRIC==='views'?'Page Views':AN_METRIC==='sessions'?'Sessions':'Visitors';
      sub.textContent='Daily '+label.toLowerCase()+' trends for the last '+days+' days ('+fmt(start)+' \u2013 '+fmt(today)+'). No data yet.';
    }
  }
  // Period dropdown.
  var anPeriod=$('an-period');
  if(anPeriod) anPeriod.addEventListener('change', function(){
    AN_DAYS=parseInt(anPeriod.value,10)||30;
    renderAnChart();
  });
  // Metric pills.
  document.querySelectorAll('.an-pill').forEach(function(b){
    b.addEventListener('click', function(){
      AN_METRIC=b.getAttribute('data-an-metric')||'visitors';
      document.querySelectorAll('.an-pill').forEach(function(x){ x.classList.toggle('active', x===b); });
      renderAnChart();
    });
  });
  // Export Report: downloads a JSON report with the real (zero) data.
  var anExport=$('an-export');
  if(anExport) anExport.addEventListener('click', function(){
    var today=new Date().toISOString().slice(0,10);
    var report={
      website:'https://mehedihallmubin.github.io/',
      generated:today,
      period_days:AN_DAYS,
      metric:AN_METRIC,
      note:'This site is static and does not track visitors. All counts are 0 until an analytics service is connected.',
      totals:{visitors:0, page_views:0, sessions:0, avg_session_duration_seconds:null},
      top_pages:[
        {path:'/(Home)', views:0},{path:'/about', views:0},{path:'/contact', views:0},{path:'/works', views:0},{path:'/blog', views:0}
      ],
      traffic_sources:{direct:0, google:0, youtube:0, social_media:0, other:0},
      devices:{desktop:0, mobile:0, tablet:0},
      countries:{bangladesh:0, india:0, united_states:0, united_kingdom:0, other:0}
    };
    var blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='analytics-report-'+today+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    toast('Report downloaded.');
  });
  // Meta description live counter.
  function updateMetaCount(){
    var mt=$('set-meta'), c=$('set-meta-count');
    if(mt && c) c.textContent=mt.value.length+' / 160';
  }
  // System Info: real data only — last save time, real post count, real
  // localStorage usage (all pw_* keys) vs the ~5 MB browser limit.
  function updateSystemInfo(){
    var sp=$('set-info-posts'); if(sp) sp.textContent=countArr('pw_blog_posts');
    var saved=read(K_SAVED);
    var sv=$('set-info-saved');
    if(sv) sv.textContent=saved ? new Date(parseInt(saved,10)).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}) : '\u2014';
    var bytes=0;
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(k && k.indexOf('pw_')===0) bytes+=(localStorage.getItem(k)||'').length*2;
      }
    }catch(e){}
    var kb=Math.round(bytes/1024);
    var st=$('set-info-storage'); if(st) st.textContent=kb+' KB';
    var pct=Math.min(100, Math.round(bytes/(5*1024*1024)*100));
    var pc=$('set-info-storage-pct'); if(pc) pc.textContent=pct+'%';
    var fill=$('set-storage-fill'); if(fill) fill.style.width=pct+'%';
  }
  // Settings tabs: General / Customize / Advanced stay in Settings; the
  // rest jump to that admin section (same as the sidebar).
  var SET_TAB_VIEW={content:'blog', social:'social', brands:'brands', reviews:'reviews', community:'community', texts:'texts'};
  function showSetTab(name){
    document.querySelectorAll('.set-tab').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-set-tab')===name); });
    if(name==='general' || name==='customize' || name==='advanced'){
      document.querySelectorAll('.set-panel').forEach(function(p){ p.hidden=p.getAttribute('data-set-panel')!==name; });
      if(name==='customize') fillCustomizeForm();
    } else if(SET_TAB_VIEW[name]){
      showAdminView(SET_TAB_VIEW[name]);
    }
  }
  document.querySelectorAll('.set-tab').forEach(function(b){
    b.addEventListener('click', function(){ showSetTab(b.getAttribute('data-set-tab')); });
  });
  // Toggles: flip + save immediately.
  ['set-vis','set-dark','set-anim','set-analytics'].forEach(function(id){
    var b=$(id);
    if(b) b.addEventListener('click', function(){
      var on=!b.classList.contains('on');
      setToggle(id, on);
      var s=getSettings();
      s.visibility=getToggle('set-vis'); s.darkMode=getToggle('set-dark');
      s.animations=getToggle('set-anim'); s.showAnalytics=getToggle('set-analytics');
      storeSettings(s);
      applySettings();
      renderAdminDashboard();
      toast('Preference saved.');
    });
  });
  // Meta description live counter.
  var metaEl=$('set-meta');
  if(metaEl) metaEl.addEventListener('input', updateMetaCount);
  // Quick Actions: Save / Clear / Backup / Restore.
  var setSaveBtn=$('set-save');
  if(setSaveBtn) setSaveBtn.addEventListener('click', saveSettingsForm);
  var setClearBtn=$('set-clear');
  if(setClearBtn) setClearBtn.addEventListener('click', function(){ var c=$('admin-clear-data'); if(c) c.click(); });
  var setBackupBtn=$('set-backup');
  if(setBackupBtn) setBackupBtn.addEventListener('click', function(){
    var data={};
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(k && k.indexOf('pw_')===0) data[k]=localStorage.getItem(k);
      }
    }catch(e){}
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    var a=document.createElement('a');
    var d=new Date();
    var pad=function(n){ return (n<10?'0':'')+n; };
    a.download='personal-website-backup-'+d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.json';
    a.href=URL.createObjectURL(blob);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    toast('Backup downloaded.');
  });
  var setRestoreBtn=$('set-restore');
  if(setRestoreBtn) setRestoreBtn.addEventListener('click', function(){ var f=$('set-restore-file'); if(f) f.click(); });
  var setRestoreFile=$('set-restore-file');
  if(setRestoreFile) setRestoreFile.addEventListener('change', function(){
    var f=setRestoreFile.files && setRestoreFile.files[0];
    if(!f) return;
    var r=new FileReader();
    r.onload=function(){
      try{
        var data=JSON.parse(r.result);
        var n=0;
        Object.keys(data).forEach(function(k){
          if(k.indexOf('pw_')===0){ try{ localStorage.setItem(k, data[k]); n++; }catch(e){} }
        });
        if(!n){ toast('No website data found in that file.'); return; }
        applySettings();
        renderAdminDashboard();
        fillSettingsForm();
        document.dispatchEvent(new CustomEvent('pw-admin-open'));
        toast('Backup restored ('+n+' items).');
      }catch(e){ toast('That file is not a valid backup.'); }
    };
    r.readAsText(f);
    setRestoreFile.value='';
  });
  // Favicon: Change (upload, downscaled to 32x32) / Remove (back to M logo).
  var favChange=$('set-favicon-change');
  if(favChange) favChange.addEventListener('click', function(){ var f=$('set-favicon-file'); if(f) f.click(); });
  var favFile=$('set-favicon-file');
  if(favFile) favFile.addEventListener('change', function(){
    var f=favFile.files && favFile.files[0];
    if(!f) return;
    if(!/^image\//.test(f.type)){ toast('Please choose an image file.'); favFile.value=''; return; }
    var img=new Image();
    var url=URL.createObjectURL(f);
    img.onload=function(){
      var cv=document.createElement('canvas'); cv.width=32; cv.height=32;
      var ctx=cv.getContext('2d');
      ctx.drawImage(img, 0, 0, 32, 32);
      var data=cv.toDataURL('image/png');
      URL.revokeObjectURL(url);
      var s=getSettings(); s.favicon=data; storeSettings(s); applySettings();
      var fi=$('set-favicon-img'); if(fi) fi.src=data;
      toast('Favicon updated.');
    };
    img.onerror=function(){ URL.revokeObjectURL(url); toast('Could not read that image.'); };
    img.src=url;
    favFile.value='';
  });
  var favRemove=$('set-favicon-remove');
  if(favRemove) favRemove.addEventListener('click', function(){
    var s=getSettings(); s.favicon=''; storeSettings(s); applySettings();
    var fi=$('set-favicon-img'); if(fi) fi.src='m-logo.png';
    toast('Favicon reset to the M logo.');
  });
  // Advanced: reset settings to default (posts/brands/links NOT touched).
  var setResetBtn=$('set-reset');
  if(setResetBtn) setResetBtn.addEventListener('click', function(){
    try{ localStorage.removeItem(K_SET); }catch(e){}
    try{ localStorage.removeItem(K_SAVED); }catch(e){}
    applySettings();
    fillSettingsForm();
    renderAdminDashboard();
    var m=$('set-reset-done'); if(m) m.hidden=false;
    setTimeout(function(){ if(m) m.hidden=true; }, 3000);
    toast('Settings reset to default.');
  });
  // Apply saved settings on every page load.
  applySettings();
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
  // opens only from a #mawa link (bookmark it). Guarded so removing
  // the button never breaks the page.
  var openBtn=$('admin-open');
  if(openBtn) openBtn.addEventListener('click', openAdmin);
  // Social links changed (add/edit/remove) — refresh the dashboard counts.
  document.addEventListener('pw-social-changed', renderAdminDashboard);
  $('admin-close').addEventListener('click', closeAdmin);
  $('admin-modal').addEventListener('click', function(e){ if(e.target===$('admin-modal')) closeAdmin(); });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      var l=$('mawa-login');
      if(l && !l.hidden){ mawaHideLogin(); history.replaceState(null,'',location.pathname+location.search); return; }
      closeAdmin();
    }
  });
  // SHA-256 (sync, lowercase hex; ASCII input). Used to check the #mawa
  // admin password without storing it in plain text.
  function sha256Hex(ascii){
    function rr(v,a){ return (v>>>a)|(v<<(32-a)); }
    var maxWord=Math.pow(2,32), result='';
    var words=[], asciiBitLength=ascii.length*8;
    var hash=sha256Hex.h=sha256Hex.h||[], k=sha256Hex.k=sha256Hex.k||[];
    var primeCounter=k.length, isComposite={};
    for(var candidate=2; primeCounter<64; candidate++){
      if(!isComposite[candidate]){
        for(var i=0;i<313;i+=candidate){ isComposite[i]=candidate; }
        hash[primeCounter]=(Math.pow(candidate,.5)*maxWord)|0;
        k[primeCounter++]=(Math.pow(candidate,1/3)*maxWord)|0;
      }
    }
    ascii+='\x80';
    while(ascii.length%64-56) ascii+='\x00';
    for(var i=0;i<ascii.length;i++){
      var j=ascii.charCodeAt(i); if(j>>8) return '';
      words[i>>2]|=j<<((3-i)%4)*8;
    }
    words[words.length]=(asciiBitLength/maxWord)|0;
    words[words.length]=asciiBitLength;
    for(var j=0;j<words.length;){
      var w=words.slice(j,j+=16), oldHash=hash;
      hash=hash.slice(0,8);
      for(var i=0;i<64;i++){
        var w15=w[i-15], w2=w[i-2], a=hash[0], e=hash[4];
        var temp1=hash[7]
          +(rr(e,6)^rr(e,11)^rr(e,25))
          +((e&hash[5])^((~e)&hash[6]))
          +k[i]
          +(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
        var temp2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
        hash=[(temp1+temp2)|0].concat(hash);
        hash[4]=(hash[4]+temp1)|0;
      }
      for(var i=0;i<8;i++){ hash[i]=(hash[i]+oldHash[i])|0; }
    }
    for(var i=0;i<8;i++){
      for(var j=3;j+1;j--){
        var b=(hash[i]>>(j*8))&255;
        result+=((b<16)?0:'')+b.toString(16);
      }
    }
    return result;
  }
  // #mawa admin login — LOCAL check only. This site is static (GitHub
  // Pages): there is no server, so there is no server-side account. The
  // email + password hash below are the admin login; the check runs in
  // the browser. It keeps casual visitors out, but it is NOT real
  // server security — anyone who reads the page code can bypass it.
  var MAWA_USER='allmubinmawa';
  var MAWA_EMAIL='mehedih.allmubin@gmail.com';
  var MAWA_PASS_HASH='24edc38247bae02bb4d73540562bdd659fc35020cee8401cb0f65ddb9cadeb23';
  var MAWA_SESSION_KEY='pw_admin_session';
  var MAWA_SESSION_DAYS=7;
  function mawaSessionValid(){
    var v=read(MAWA_SESSION_KEY);
    return v && (+v)>Date.now();
  }
  function mawaSetSession(){ store(MAWA_SESSION_KEY, String(Date.now()+MAWA_SESSION_DAYS*24*60*60*1000)); }
  function mawaClearSession(){ try{ localStorage.removeItem(MAWA_SESSION_KEY); }catch(e){} }
  function mawaShowLogin(){
    var l=$('mawa-login'); if(l) l.hidden=false;
    var u=$('mawa-user'); if(u) u.value='';
    var e=$('mawa-email'); if(e) e.value='';
    var p=$('mawa-pass'); if(p) p.value='';
    var err=$('mawa-error'); if(err) err.hidden=true;
    if(u) setTimeout(function(){ u.focus(); }, 60);
  }
  function mawaHideLogin(){ var l=$('mawa-login'); if(l) l.hidden=true; }
  function mawaTryLogin(){
    var un=(($('mawa-user')&&$('mawa-user').value)||'').trim().toLowerCase();
    var em=(($('mawa-email')&&$('mawa-email').value)||'').trim().toLowerCase();
    var pw=(($('mawa-pass')&&$('mawa-pass').value)||'');
    var err=$('mawa-error');
    if(un===MAWA_USER && em===MAWA_EMAIL && sha256Hex(pw)===MAWA_PASS_HASH){
      mawaHideLogin();
      mawaSetSession();
      openAdmin();
      history.replaceState(null,'',location.pathname+location.search);
    } else {
      if(err) err.hidden=false;
      var p=$('mawa-pass'); if(p){ p.value=''; p.focus(); }
    }
  }
  var mawaSubmit=$('mawa-submit');
  if(mawaSubmit) mawaSubmit.addEventListener('click', mawaTryLogin);
  ['mawa-user','mawa-email','mawa-pass'].forEach(function(id){
    var el=$(id);
    if(el) el.addEventListener('keydown', function(e){ if(e.key==='Enter') mawaTryLogin(); });
  });
  var mawaLoginEl=$('mawa-login');
  if(mawaLoginEl) mawaLoginEl.addEventListener('click', function(e){
    if(e.target===mawaLoginEl){ mawaHideLogin(); history.replaceState(null,'',location.pathname+location.search); }
  });
  // Open the panel from a #mawa link, then clear the hash so a reload
  // does not reopen it. The hashchange listener covers adding #mawa
  // to a page that is already open (no reload). The first check runs on
  // DOMContentLoaded so the other admin scripts have loaded and are
  // listening for the open event before the panel opens.
  function openFromHash(){
    if(location.hash==='#mawa'){
      if(mawaSessionValid()){ openAdmin(); history.replaceState(null,'',location.pathname+location.search); }
      else mawaShowLogin();
    }
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