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
  }
  // Fill the Admin inputs with the saved links when the panel opens.
  function fillAdmin(){
    var links = getLinks();
    Object.keys(PLATFORMS).forEach(function(id){
      var input = $('sl-' + id);
      if(input) input.value = links[id] || '';
    });
    $('social-saved').hidden = true;
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
    var s = $('social-saved'); s.hidden = false;
    setTimeout(function(){ s.hidden = true; }, 3000);
    toast('Social links saved.');
  }
  // Admin open/save wiring (the panel itself is opened by the footer link).
  // Fill the fields whenever the panel opens (via the #admin link).
  document.addEventListener('pw-admin-open', fillAdmin);
  var openBtn = $('admin-open');
  if(openBtn) openBtn.addEventListener('click', fillAdmin);
  var saveBtn = $('social-save');
  if(saveBtn) saveBtn.addEventListener('click', saveAdmin);
  // Initial render on page load.
  render();
})();
