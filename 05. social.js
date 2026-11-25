/* 05. social.js - Connect section for the personal website.
   Each platform's Connect button links to the profile URL pasted in
   Admin (localStorage, per device). Until one is pasted, the button
   opens the platform's own site. No profile URL is ever invented. */
(function(){
  // Platform ids and their own home pages (fallbacks, never profiles).
  var PLATFORMS = {
    'facebook': 'https://www.facebook.com',
    'instagram': 'https://www.instagram.com',
    'youtube': 'https://www.youtube.com',
    'linkedin': 'https://www.linkedin.com',
    'tiktok': 'https://www.tiktok.com',
    'pinterest': 'https://www.pinterest.com',
    'rumble': 'https://rumble.com',
    'threads': 'https://www.threads.net',
    'x': 'https://x.com',
    'telegram': 'https://telegram.org',
    'vimeo': 'https://vimeo.com',
    'snapchat': 'https://www.snapchat.com',
    'reddit': 'https://www.reddit.com',
    'tumblr': 'https://www.tumblr.com',
    'discord': 'https://discord.com',
    'whatsapp': 'https://www.whatsapp.com',
    'behance': 'https://www.behance.net',
    'dribbble': 'https://dribbble.com',
    'adobe-stock': 'https://stock.adobe.com',
    'shutterstock': 'https://www.shutterstock.com',
    'istock': 'https://www.istockphoto.com',
    'alamy': 'https://www.alamy.com',
    'depositphotos': 'https://depositphotos.com',
    'dreamstime': 'https://www.dreamstime.com',
    '123rf': 'https://www.123rf.com',
    'freepik': 'https://www.freepik.com'
  };
  var KEY = 'pw_social_links';
  var KEY_CUSTOM = 'pw_social_custom';
  // Display names for the 26 fixed platforms (same as the Admin form labels).
  var NAMES = {
    'facebook': 'Facebook', 'instagram': 'Instagram', 'youtube': 'YouTube',
    'linkedin': 'LinkedIn', 'tiktok': 'TikTok', 'pinterest': 'Pinterest',
    'rumble': 'Rumble', 'threads': 'Threads', 'x': 'X', 'telegram': 'Telegram',
    'vimeo': 'Vimeo', 'snapchat': 'Snapchat', 'reddit': 'Reddit',
    'tumblr': 'Tumblr', 'discord': 'Discord', 'whatsapp': 'WhatsApp',
    'behance': 'Behance', 'dribbble': 'Dribbble', 'adobe-stock': 'Adobe Stock',
    'shutterstock': 'Shutterstock', 'istock': 'iStock', 'alamy': 'Alamy',
    'depositphotos': 'Depositphotos', 'dreamstime': 'Dreamstime',
    '123rf': '123RF', 'freepik': 'Freepik (now Magnific)'
  };
  // Custom platforms the user added via "Add Social Media": [{name, url}].
  function getCustom(){ try{ var a = JSON.parse(read(KEY_CUSTOM) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function storeCustom(list){ store(KEY_CUSTOM, JSON.stringify(list)); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  var mem = {};
  // Save a value (localStorage first, memory fallback).
  function store(k, v){ try{ localStorage.setItem(k, v); }catch(e){ mem[k] = v; } }
  // Read a value (localStorage first, memory fallback).
  function read(k){ try{ return localStorage.getItem(k); }catch(e){ return (k in mem) ? mem[k] : null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Load the saved profile links (an object of platform id -> URL).
  function getLinks(){ try{ return JSON.parse(read(KEY) || '{}'); }catch(e){ return {}; } }
  // A saved value is usable only as a full http(s) URL.
  function validUrl(v){ return /^https?:\/\/.+/.test(v || ''); }
  // Show a short message at the bottom of the screen.
  function toast(msg){
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(function(){ t.hidden = true; }, 3600);
  }
  // Point every Connect button (or tile link) at the saved profile, or the platform home.
  function render(){
    var links = getLinks();
    Array.prototype.slice.call(document.querySelectorAll('[data-platform]')).forEach(function(el){
      var id = el.getAttribute('data-platform');
      var saved = (links[id] || '').trim();
      var btn = el.tagName === 'A' ? el : el.querySelector('.social-btn');
      if(!btn) return;
      if(validUrl(saved)){
        btn.setAttribute('href', saved);
        if(btn.classList.contains('social-btn')) btn.textContent = 'Open profile';
        el.classList.add('linked');
      } else {
        btn.setAttribute('href', PLATFORMS[id] || '#');
        if(btn.classList.contains('social-btn')) btn.textContent = 'Connect';
        el.classList.remove('linked');
      }
    });
    renderCustomPublic();
    fitConnect();
  }
  // Home "Connect With Me" bar: show as many icons as fit the bar, hide
  // the rest (the "···" link opens the full list on the Contact page).
  // Bigger display -> more icons; smaller display -> fewer.
  function fitConnect(){
    var wrap = document.querySelector('.hp-connect-icons');
    if(!wrap) return;
    var icons = Array.prototype.slice.call(wrap.querySelectorAll('.hp-con-ic'));
    var more = wrap.querySelector('.hp-con-more');
    icons.forEach(function(ic){ ic.classList.remove('hp-con-hide'); });
    if(more) more.classList.remove('hp-con-hide');
    var avail = wrap.clientWidth;
    if(!avail) return;
    var gap = parseFloat(getComputedStyle(wrap).columnGap) || 0;
    var vis = icons.filter(function(ic){ return getComputedStyle(ic).display !== 'none'; });
    var total = 0;
    vis.forEach(function(ic, i){ total += ic.offsetWidth + (i ? gap : 0); });
    var showMore = total > avail;
    var limit = showMore ? avail - (more ? more.offsetWidth : 0) - gap : avail;
    var used = 0;
    vis.forEach(function(ic){
      var w = ic.offsetWidth;
      var need = used === 0 ? w : used + gap + w;
      if(need <= limit){ used = need; }
      else ic.classList.add('hp-con-hide');
    });
    if(more) more.classList.toggle('hp-con-hide', !showMore);
  }
  var fitT = null;
  window.addEventListener('resize', function(){
    clearTimeout(fitT);
    fitT = setTimeout(fitConnect, 120);
  });
  window.addEventListener('load', fitConnect);
  // Custom platforms on the public Contact page: append a tile per added
  // platform to the Social Media grid and keep the "(16)" count real.
  function renderCustomPublic(){
    var grid = document.querySelector('.brand-tiles.cols-16');
    if(!grid) return;
    Array.prototype.slice.call(grid.querySelectorAll('.brand-tile-custom')).forEach(function(el){ el.remove(); });
    var fixedCount = grid.querySelectorAll('.brand-tile').length;
    var custom = getCustom();
    custom.forEach(function(c){
      if(!validUrl(c.url)) return;
      var a = document.createElement('a');
      a.className = 'brand-tile brand-tile-custom';
      a.href = c.url; a.target = '_blank'; a.rel = 'noopener';
      var letter = (c.name || '?').trim().charAt(0).toUpperCase();
      a.innerHTML = '<span class="bl bl-custom">' + esc(letter) + '</span><span>' + esc(c.name) + '</span>';
      grid.appendChild(a);
    });
    var h = $('social-h');
    if(h){
      var total = fixedCount + custom.filter(function(c){ return validUrl(c.url); }).length;
      Array.prototype.slice.call(h.childNodes).forEach(function(n){
        if(n.nodeType === 3 && /Social Media/.test(n.nodeValue)){
          n.nodeValue = n.nodeValue.replace(/\(\d+\)/, '(' + total + ')');
        }
      });
    }
    // Home page "26 platforms" pill: 26 fixed + any custom platforms added.
    var hc = $('home-social-count');
    if(hc){
      var totalPlatforms = Object.keys(PLATFORMS).length + custom.length;
      hc.textContent = totalPlatforms + ' platform' + (totalPlatforms === 1 ? '' : 's');
    }
  }
  // "All Social Media" list in Admin: ONLY the platforms actually added
  // (fixed platforms with a saved profile link + custom platforms).
  // Nothing unconnected is shown here.
  function renderAdminList(){
    var list = $('sl-list');
    if(!list) return;
    var links = getLinks();
    var custom = getCustom();
    var html = '';
    Object.keys(PLATFORMS).forEach(function(id){
      var saved = (links[id] || '').trim();
      if(!validUrl(saved)) return;
      var name = NAMES[id] || id;
      var letter = name.charAt(0).toUpperCase();
      html += '<li class="admin-social-row"><span class="sl-ic">' + esc(letter) + '</span>'
        + '<span class="sl-main"><span class="sl-name">' + esc(name) + '</span>'
        + '<span class="sl-link connected">' + esc(saved) + '</span>'
        + '</span><span class="sl-actions"><button type="button" class="sl-edit" data-edit-fixed="' + esc(id) + '">Edit</button>'
        + '<button type="button" class="sl-remove" data-remove-fixed="' + esc(id) + '">Remove</button></span></li>';
    });
    custom.forEach(function(c, i){
      var letter = (c.name || '?').trim().charAt(0).toUpperCase();
      html += '<li class="admin-social-row"><span class="sl-ic">' + esc(letter) + '</span>'
        + '<span class="sl-main"><span class="sl-name">' + esc(c.name) + '</span>'
        + '<span class="sl-link connected">' + esc(c.url) + '</span>'
        + '</span><span class="sl-actions"><button type="button" class="sl-edit" data-edit-custom="' + i + '">Edit</button>'
        + '<button type="button" class="sl-remove" data-remove-custom="' + i + '">Remove</button></span></li>';
    });
    if(!html) html = '<li class="hint" style="list-style:none">Ekhono kono social media add kora hoy nai — upore Add Social Media button-e chap diye add korun.</li>';
    list.innerHTML = html;
  }
  // Refresh the Admin list when the panel opens.
  function fillAdmin(){
    renderAdminList();
  }
  // "Add Social Media": pick a platform preset (or Custom) + paste the
  // profile link. Editing reuses the same form.
  var editingFixed = '';
  var editingCustom = -1;
  function onPlatformChange(){
    var sel = $('sl-add-platform');
    var wrap = $('sl-add-name-wrap');
    if(!sel || !wrap) return;
    var v = sel.value;
    if(v === 'custom' || v === ''){
      wrap.hidden = false;
    } else {
      wrap.hidden = true;
    }
  }
  function openAddForm(){
    var f = $('sl-add-form');
    if(!f) return;
    f.hidden = false;
    var sel = $('sl-add-platform');
    if(sel) sel.focus();
  }
  function closeAddForm(){
    var f = $('sl-add-form');
    if(f) f.hidden = true;
    var sel = $('sl-add-platform');
    if(sel) sel.value = '';
    var wrap = $('sl-add-name-wrap');
    if(wrap) wrap.hidden = true;
    var n = $('sl-add-name'); if(n) n.value = '';
    var u = $('sl-add-url'); if(u) u.value = '';
    editingFixed = '';
    editingCustom = -1;
    var saveBtn = $('sl-add-save');
    if(saveBtn) saveBtn.textContent = 'Add';
  }
  function saveAddForm(){
    var sel = $('sl-add-platform');
    var nameInput = $('sl-add-name');
    var urlInput = $('sl-add-url');
    if(!sel || !urlInput) return;
    var platform = sel.value;
    var url = urlInput.value.trim();
    if(!platform){ toast('Platform beche nin.'); sel.focus(); return; }
    if(!url){ toast('Profile link din.'); urlInput.focus(); return; }
    if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if(!validUrl(url)){ toast('Thik link din (https://...).'); urlInput.focus(); return; }
    if(platform === 'custom'){
      var name = (nameInput ? nameInput.value : '').trim();
      if(!name){ toast('Platform name din.'); if(nameInput) nameInput.focus(); return; }
      var custom = getCustom();
      if(editingCustom >= 0 && custom[editingCustom]){
        custom[editingCustom] = { name: name, url: url };
        toast('Social media updated.');
      } else {
        custom.push({ name: name, url: url });
        toast('Social media added.');
      }
      storeCustom(custom);
    } else {
      var links = getLinks();
      links[platform] = url;
      store(KEY, JSON.stringify(links));
      toast(editingFixed ? 'Social media updated.' : 'Social media added.');
    }
    closeAddForm();
    renderAdminList();
    render();
    renderCustomPublic();
    document.dispatchEvent(new CustomEvent('pw-social-changed'));
  }
  // List actions: Edit (fixed -> prefill the add form with that preset;
  // custom -> prefill name + link), Remove (fixed clears the saved link,
  // custom deletes the entry).
  function onListClick(e){
    var t = e.target;
    if(!t) return;
    var fixed = t.getAttribute && t.getAttribute('data-edit-fixed');
    if(fixed){
      var links = getLinks();
      editingFixed = fixed;
      editingCustom = -1;
      var sel = $('sl-add-platform');
      if(sel){ sel.value = fixed; onPlatformChange(); }
      var u = $('sl-add-url'); if(u) u.value = links[fixed] || '';
      var saveBtn = $('sl-add-save');
      if(saveBtn) saveBtn.textContent = 'Update';
      openAddForm();
      return;
    }
    var editIdx = t.getAttribute && t.getAttribute('data-edit-custom');
    if(editIdx !== null && editIdx !== undefined && editIdx !== ''){
      var custom = getCustom();
      var c = custom[parseInt(editIdx, 10)];
      if(!c) return;
      editingCustom = parseInt(editIdx, 10);
      editingFixed = '';
      var s = $('sl-add-platform');
      if(s){ s.value = 'custom'; onPlatformChange(); }
      var n = $('sl-add-name'); if(n) n.value = c.name;
      var uu = $('sl-add-url'); if(uu) uu.value = c.url;
      var sb = $('sl-add-save');
      if(sb) sb.textContent = 'Update';
      openAddForm();
      return;
    }
    var remFixed = t.getAttribute && t.getAttribute('data-remove-fixed');
    if(remFixed){
      var l = getLinks();
      delete l[remFixed];
      store(KEY, JSON.stringify(l));
      renderAdminList();
      render();
      renderCustomPublic();
      document.dispatchEvent(new CustomEvent('pw-social-changed'));
      toast('Social media removed.');
      return;
    }
    var remIdx = t.getAttribute && t.getAttribute('data-remove-custom');
    if(remIdx !== null && remIdx !== undefined && remIdx !== ''){
      var list = getCustom();
      list.splice(parseInt(remIdx, 10), 1);
      storeCustom(list);
      renderAdminList();
      renderCustomPublic();
      document.dispatchEvent(new CustomEvent('pw-social-changed'));
      toast('Social media removed.');
    }
  }
  // Admin open/save wiring (the panel itself is opened by the footer link).
  // Fill the fields whenever the panel opens (via the #admin link).
  document.addEventListener('pw-admin-open', fillAdmin);
  var openBtn = $('admin-open');
  if(openBtn) openBtn.addEventListener('click', fillAdmin);
  var addOpenBtn = $('sl-add-open');
  if(addOpenBtn) addOpenBtn.addEventListener('click', function(){ closeAddForm(); openAddForm(); });
  var addPlatformSel = $('sl-add-platform');
  if(addPlatformSel) addPlatformSel.addEventListener('change', onPlatformChange);
  var addSaveBtn = $('sl-add-save');
  if(addSaveBtn) addSaveBtn.addEventListener('click', saveAddForm);
  var addCancelBtn = $('sl-add-cancel');
  if(addCancelBtn) addCancelBtn.addEventListener('click', closeAddForm);
  var slList = $('sl-list');
  if(slList) slList.addEventListener('click', onListClick);
  // Initial render on page load.
  render();
})();
