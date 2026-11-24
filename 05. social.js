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
  }
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
  // "All Social Media" list in Admin: the 26 fixed platforms (with their
  // saved link / Not connected status) plus any custom platforms added.
  function renderAdminList(){
    var list = $('sl-list');
    if(!list) return;
    var links = getLinks();
    var custom = getCustom();
    var html = '';
    Object.keys(PLATFORMS).forEach(function(id){
      var name = NAMES[id] || id;
      var saved = (links[id] || '').trim();
      var letter = name.charAt(0).toUpperCase();
      html += '<li class="admin-social-row"><span class="sl-ic">' + esc(letter) + '</span>'
        + '<span class="sl-main"><span class="sl-name">' + esc(name) + '</span>'
        + (validUrl(saved)
            ? '<span class="sl-link connected">' + esc(saved) + '</span>'
            : '<span class="sl-link">Not connected</span>')
        + '</span><span class="sl-actions"><button type="button" class="sl-edit" data-edit-fixed="' + esc(id) + '">Edit</button></span></li>';
    });
    custom.forEach(function(c, i){
      var letter = (c.name || '?').trim().charAt(0).toUpperCase();
      html += '<li class="admin-social-row"><span class="sl-ic">' + esc(letter) + '</span>'
        + '<span class="sl-main"><span class="sl-name">' + esc(c.name) + '</span>'
        + '<span class="sl-link connected">' + esc(c.url) + '</span>'
        + '</span><span class="sl-actions"><button type="button" class="sl-edit" data-edit-custom="' + i + '">Edit</button>'
        + '<button type="button" class="sl-remove" data-remove-custom="' + i + '">Remove</button></span></li>';
    });
    list.innerHTML = html;
  }
  // Fill the Admin inputs with the saved links when the panel opens.
  function fillAdmin(){
    var links = getLinks();
    Object.keys(PLATFORMS).forEach(function(id){
      var input = $('sl-' + id);
      if(input) input.value = links[id] || '';
    });
    $('social-saved').hidden = true;
    renderAdminList();
  }
  // Save the Admin inputs: empty clears a platform, bare domains get https://.
  function saveAdmin(){
    var links = getLinks();
    var changed = false;
    Object.keys(PLATFORMS).forEach(function(id){
      var input = $('sl-' + id);
      if(!input) return;
      var v = input.value.trim();
      if(!v){ if(links[id]){ delete links[id]; changed = true; } return; }
      if(!/^https?:\/\//i.test(v)) v = 'https://' + v;
      if(links[id] !== v){ links[id] = v; changed = true; }
    });
    if(changed) store(KEY, JSON.stringify(links));
    render();
    renderAdminList();
    var s = $('social-saved'); s.hidden = false;
    setTimeout(function(){ s.hidden = true; }, 3000);
    toast('Social links saved.');
  }
  // "Add Social Media": add any platform (name + profile link). Editing a
  // custom platform reuses the same form (editing index >= 0).
  var editingCustom = -1;
  function openAddForm(){
    var f = $('sl-add-form');
    if(!f) return;
    f.hidden = false;
    var n = $('sl-add-name'); if(n) n.focus();
  }
  function closeAddForm(){
    var f = $('sl-add-form');
    if(f) f.hidden = true;
    var n = $('sl-add-name'); if(n) n.value = '';
    var u = $('sl-add-url'); if(u) u.value = '';
    editingCustom = -1;
    var saveBtn = $('sl-add-save');
    if(saveBtn) saveBtn.textContent = 'Add';
  }
  function saveAddForm(){
    var nameInput = $('sl-add-name');
    var urlInput = $('sl-add-url');
    if(!nameInput || !urlInput) return;
    var name = nameInput.value.trim();
    var url = urlInput.value.trim();
    if(!name){ toast('Platform name din.'); nameInput.focus(); return; }
    if(!url){ toast('Profile link din.'); urlInput.focus(); return; }
    if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if(!validUrl(url)){ toast('Thik link din (https://...).'); urlInput.focus(); return; }
    var custom = getCustom();
    if(editingCustom >= 0 && custom[editingCustom]){
      custom[editingCustom] = { name: name, url: url };
      toast('Social media updated.');
    } else {
      custom.push({ name: name, url: url });
      toast('Social media added.');
    }
    storeCustom(custom);
    closeAddForm();
    renderAdminList();
    renderCustomPublic();
  }
  // List actions: Edit (fixed -> focus its input; custom -> prefill the
  // add form), Remove (custom only).
  function onListClick(e){
    var t = e.target;
    if(!t) return;
    var fixed = t.getAttribute && t.getAttribute('data-edit-fixed');
    if(fixed){
      var input = $('sl-' + fixed);
      if(input){ input.scrollIntoView({ block: 'center' }); input.focus(); }
      return;
    }
    var editIdx = t.getAttribute && t.getAttribute('data-edit-custom');
    if(editIdx !== null && editIdx !== undefined && editIdx !== ''){
      var custom = getCustom();
      var c = custom[parseInt(editIdx, 10)];
      if(!c) return;
      editingCustom = parseInt(editIdx, 10);
      var n = $('sl-add-name'); if(n) n.value = c.name;
      var u = $('sl-add-url'); if(u) u.value = c.url;
      var saveBtn = $('sl-add-save');
      if(saveBtn) saveBtn.textContent = 'Update';
      openAddForm();
      return;
    }
    var remIdx = t.getAttribute && t.getAttribute('data-remove-custom');
    if(remIdx !== null && remIdx !== undefined && remIdx !== ''){
      var list = getCustom();
      list.splice(parseInt(remIdx, 10), 1);
      storeCustom(list);
      renderAdminList();
      renderCustomPublic();
      toast('Social media removed.');
    }
  }
  // Admin open/save wiring (the panel itself is opened by the footer link).
  // Fill the fields whenever the panel opens (via the #admin link).
  document.addEventListener('pw-admin-open', fillAdmin);
  var openBtn = $('admin-open');
  if(openBtn) openBtn.addEventListener('click', fillAdmin);
  var saveBtn = $('social-save');
  if(saveBtn) saveBtn.addEventListener('click', saveAdmin);
  // Add Social Media form wiring.
  var addOpenBtn = $('sl-add-open');
  if(addOpenBtn) addOpenBtn.addEventListener('click', function(){ closeAddForm(); openAddForm(); });
  var addSaveBtn = $('sl-add-save');
  if(addSaveBtn) addSaveBtn.addEventListener('click', saveAddForm);
  var addCancelBtn = $('sl-add-cancel');
  if(addCancelBtn) addCancelBtn.addEventListener('click', closeAddForm);
  var slList = $('sl-list');
  if(slList) slList.addEventListener('click', onListClick);
  // Initial render on page load.
  render();
})();
