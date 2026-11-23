/* 06. header.js - Header interactions for the personal website.
   Hamburger drawer navigation + site search (this site's own content,
   across all pages). Keyboard accessible: Escape closes, focus moves
   in and out, Tab wraps inside the open drawer or search panel. */
(function(){
  function $(id){ return document.getElementById(id); }
  function lockScroll(on){ document.body.style.overflow = on ? 'hidden' : ''; }

  /* ---- Navigation drawer ---- */
  var menuBtn = $('menu-btn'), drawer = $('nav-drawer'), backdrop = $('drawer-backdrop'), drawerClose = $('drawer-close');
  function openDrawer(){
    drawer.classList.add('open'); backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false'); backdrop.setAttribute('aria-hidden', 'false');
    menuBtn.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu');
    lockScroll(true); drawerClose.focus();
  }
  function closeDrawer(){
    drawer.classList.remove('open'); backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true'); backdrop.setAttribute('aria-hidden', 'true');
    menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
    lockScroll(false); menuBtn.focus();
  }
  function isDrawerOpen(){ return drawer.classList.contains('open'); }
  menuBtn.addEventListener('click', function(){ isDrawerOpen() ? closeDrawer() : openDrawer(); });
  drawerClose.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  Array.prototype.slice.call(document.querySelectorAll('.drawer-nav a')).forEach(function(a){
    a.addEventListener('click', closeDrawer);
  });
  // Highlight the current page in the drawer.
  (function markActive(){
    var here = window.location.pathname.split('/').pop() || 'index.html';
    var isHome = (here === '' || here === 'index.html');
    var hash = window.location.hash;
    Array.prototype.slice.call(document.querySelectorAll('.drawer-nav a')).forEach(function(a){
      var href = a.getAttribute('href') || '';
      var parts = href.split('#');
      var page = parts[0] || 'index.html';
      var h = parts[1] ? '#' + parts[1] : '';
      var pageHere = (page === here) || (page === 'index.html' && isHome);
      var match = h ? (pageHere && hash === h) : (pageHere && (!hash || hash === '#top'));
      a.classList.toggle('active', match);
    });
  })();

  /* ---- Site search ---- */
  var searchBtn = $('search-btn'), overlay = $('search-overlay'), input = $('search-input'), resultsBox = $('search-results'), searchClose = $('search-close');
  // Site-wide entries: pages plus the brands and projects they hold.
  var SITE_PAGES = [
    {title: 'Home', snippet: 'Mehedi H. All Mubin — Designer, Video Editor & Social Media Manager', target: 'index.html', section: 'Home', page: true},
    {title: 'Work', snippet: 'My experience and services.', target: 'work.html', section: 'Work', page: true},
    {title: 'Portfolio', snippet: 'Selected work and the brands I work with.', target: 'portfolio.html', section: 'Portfolio', page: true},
    {title: 'Reviews', snippet: 'Real reviews from Google — shown here automatically once connected.', target: 'reviews.html', section: 'Reviews', page: true},
    {title: 'Contact', snippet: 'Write to me, find my profiles, join my groups.', target: 'contact.html', section: 'Contact', page: true},
    {title: 'Blog', snippet: 'Notes and updates.', target: 'blog.html', section: 'Blog', page: true},
    {title: 'Experience', snippet: 'Roles, places and dates as they happened.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Services', snippet: 'Graphic design, video editing, social media, digital marketing, e-commerce, education content.', target: 'work.html#services', section: 'Services'},
    {title: 'Connect', snippet: 'My profiles on 26 platforms.', target: 'contact.html#connect', section: 'Connect', page: true},
    {title: 'Community', snippet: 'My groups and servers — Discord, WhatsApp, Telegram, Facebook.', target: 'contact.html#community', section: 'Community', page: true},
    {title: 'Discord', snippet: 'Join my Discord server.', target: 'contact.html#community', section: 'Community'},
    {title: 'WhatsApp Group', snippet: 'Join my WhatsApp group.', target: 'contact.html#community', section: 'Community'},
    {title: 'Telegram', snippet: 'Join my Telegram group.', target: 'contact.html#community', section: 'Community'},
    {title: 'Facebook Group', snippet: 'Join my Facebook group.', target: 'contact.html#community', section: 'Community'},
    {title: 'Graphic Designer & Video Editor — Jax Corporation', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Founder — QuickShoppingNow (QSN)', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Founder — LUXAUR', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Designer, Video Editor & Social Media Manager — Raju Interior House and Gold Furniture', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Computer Training — NYTA', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Digital Marketing Course — Signature Mind Institute', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'SSC (Science) — Gobindaganj Government High School', snippet: 'Experience — work.html.', target: 'work.html#experience', section: 'Experience'},
    {title: 'Graphic Design', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'Video Editing', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'Social Media Management', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'Digital Marketing', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'E-commerce Stores', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'Education Content', snippet: 'Service — work.html.', target: 'work.html#services', section: 'Services'},
    {title: 'QuickShoppingNow', snippet: 'Selected work.', target: 'portfolio.html#portfolio', section: 'Portfolio'},
    {title: 'LUXAUR', snippet: 'Selected work.', target: 'portfolio.html#portfolio', section: 'Portfolio'},
    {title: 'Smart Ayan', snippet: 'Selected work.', target: 'portfolio.html#portfolio', section: 'Portfolio'},
    {title: 'Raju Interior House & Gold Furniture', snippet: 'Selected work.', target: 'portfolio.html#portfolio', section: 'Portfolio'},
    {title: 'Jax Corporation', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Raju Interior House', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Gold Furniture', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'QuickShoppingNow', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'LUXAUR', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Sajghar', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Jomidar Fashion', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Rekha\'s Craft', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Al Mubin Industries', snippet: 'A brand I work with.', target: 'portfolio.html#brands', section: 'Brands'},
    {title: 'Facebook', snippet: 'My profile on Facebook.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Instagram', snippet: 'My profile on Instagram.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'YouTube', snippet: 'My profile on YouTube.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'LinkedIn', snippet: 'My profile on LinkedIn.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'TikTok', snippet: 'My profile on TikTok.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Pinterest', snippet: 'My profile on Pinterest.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Rumble', snippet: 'My profile on Rumble.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Threads', snippet: 'My profile on Threads.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'X', snippet: 'My profile on X.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Telegram', snippet: 'My profile on Telegram.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Vimeo', snippet: 'My profile on Vimeo.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Snapchat', snippet: 'My profile on Snapchat.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Reddit', snippet: 'My profile on Reddit.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Tumblr', snippet: 'My profile on Tumblr.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Discord', snippet: 'My profile on Discord.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'WhatsApp', snippet: 'My profile on WhatsApp.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Behance', snippet: 'My profile on Behance.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Dribbble', snippet: 'My profile on Dribbble.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Adobe Stock', snippet: 'My profile on Adobe Stock.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Shutterstock', snippet: 'My profile on Shutterstock.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'iStock', snippet: 'My profile on iStock.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Alamy', snippet: 'My profile on Alamy.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Depositphotos', snippet: 'My profile on Depositphotos.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Dreamstime', snippet: 'My profile on Dreamstime.', target: 'contact.html#connect', section: 'Connect'},
    {title: '123RF', snippet: 'My profile on 123RF.', target: 'contact.html#connect', section: 'Connect'},
    {title: 'Freepik', snippet: 'My profile on Freepik.', target: 'contact.html#connect', section: 'Connect'},
  ];
  var index = [], activeIndex = -1;
  // Build the search index: this page's real sections plus the site entries.
  function buildIndex(){
    var items = [];
    items.push({title: 'Mehedi H. All Mubin', snippet: 'Designer, Video Editor & Social Media Manager', target: 'top', section: 'Home'});
    document.querySelectorAll('main section[id]').forEach(function(sec){
      var h2 = sec.querySelector('h2');
      var labelEl = sec.querySelector('.label');
      var label = labelEl ? labelEl.textContent.trim() : (h2 ? h2.textContent.trim() : sec.id.charAt(0).toUpperCase() + sec.id.slice(1));
      if(h2){
        var sub = sec.querySelector('.sec-sub');
        var snip = h2.textContent.trim() + (sub ? ' — ' + sub.textContent.trim() : '');
        items.push({title: label, snippet: snip, target: sec.id, section: label});
      }
      sec.querySelectorAll('h3').forEach(function(h3){
        if(h3.closest('.empty-state')) return;
        var p = h3.parentElement.querySelector('p');
        items.push({title: h3.textContent.trim(), snippet: p ? p.textContent.trim() : '', target: sec.id, section: label});
      });
      sec.querySelectorAll('.social-name').forEach(function(n){
        items.push({title: n.textContent.trim(), snippet: 'Connect — ' + label, target: sec.id, section: label});
      });
    });
    // Site entries after the page entries; same title keeps the page one.
    var seen = {};
    items.forEach(function(it){ seen[it.title.toLowerCase()] = true; });
    SITE_PAGES.forEach(function(it){
      if(!seen[it.title.toLowerCase()]){ items.push(it); seen[it.title.toLowerCase()] = true; }
    });
    return items;
  }
  function openSearch(){
    if(isDrawerOpen()) closeDrawer();
    overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
    lockScroll(true); input.value = ''; renderResults(''); input.focus();
  }
  function closeSearch(){
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true');
    lockScroll(false); searchBtn.focus();
  }
  function isSearchOpen(){ return overlay.classList.contains('open'); }
  function goTo(item){
    closeSearch();
    if(item.target.indexOf('.html') !== -1){ window.location.href = item.target; return; }
    var el = document.getElementById(item.target);
    if(el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  function renderResults(q){
    q = (q || '').trim().toLowerCase();
    var matches;
    if(!q){
      // Empty query: the site pages and main destinations, as navigation.
      matches = SITE_PAGES.filter(function(it){ return it.page; });
    } else {
      var titleHits = index.filter(function(it){ return it.title.toLowerCase().indexOf(q) !== -1; });
      var snipHits = index.filter(function(it){ return it.title.toLowerCase().indexOf(q) === -1 && it.snippet.toLowerCase().indexOf(q) !== -1; });
      matches = titleHits.concat(snipHits).slice(0, 8);
    }
    resultsBox.innerHTML = '';
    activeIndex = -1;
    if(!matches.length){
      var d = document.createElement('div'); d.className = 'search-empty';
      d.textContent = 'Nothing found for "' + (q || '') + '" — try another word.';
      resultsBox.appendChild(d); return;
    }
    matches.forEach(function(it){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'search-result'; b.setAttribute('role', 'option');
      var t = document.createElement('span'); t.className = 'sr-title'; t.textContent = it.title;
      var s = document.createElement('span'); s.className = 'sr-sec'; s.textContent = it.section;
      var n = document.createElement('span'); n.className = 'sr-snip'; n.textContent = it.snippet;
      b.appendChild(t); b.appendChild(s); b.appendChild(n);
      b.addEventListener('click', function(){ goTo(it); });
      resultsBox.appendChild(b);
    });
  }
  function moveActive(dir){
    var btns = resultsBox.querySelectorAll('.search-result');
    if(!btns.length) return;
    activeIndex = (activeIndex + dir + btns.length) % btns.length;
    btns.forEach(function(b, i){ b.classList.toggle('active', i === activeIndex); b.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'); });
    btns[activeIndex].focus();
  }
  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeSearch(); });
  input.addEventListener('input', function(){ renderResults(input.value); });
  // Arrow keys and Enter while the search panel is open.
  document.addEventListener('keydown', function(e){
    if(!isSearchOpen()) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); moveActive(1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); moveActive(-1); }
    else if(e.key === 'Enter' && document.activeElement === input){
      e.preventDefault();
      var btns = resultsBox.querySelectorAll('.search-result');
      var pick = activeIndex >= 0 ? btns[activeIndex] : btns[0];
      if(pick) pick.click();
    }
  });
  // "/" opens search; Escape closes whatever is open.
  document.addEventListener('keydown', function(e){
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    if(e.key === '/' && !typing && !isSearchOpen() && !isDrawerOpen()){ e.preventDefault(); openSearch(); }
    else if(e.key === 'Escape'){
      if(isSearchOpen()) closeSearch();
      else if(isDrawerOpen()) closeDrawer();
    }
  });
  // Light focus trap: Tab wraps inside the open drawer or search panel.
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var box = isSearchOpen() ? overlay.querySelector('.search-box') : (isDrawerOpen() ? drawer : null);
    if(!box) return;
    var f = Array.prototype.slice.call(box.querySelectorAll('button, a[href], input, [tabindex]')).filter(function(el){ return !el.disabled && el.offsetParent !== null; });
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  index = buildIndex();
})();
