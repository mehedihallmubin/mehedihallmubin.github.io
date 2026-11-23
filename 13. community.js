/* 13. community.js - Community section for the personal website.
   Join links per community, saved in Admin (localStorage, per device).
   Until a real invite link is pasted, the Join button opens the
   platform's own site. No invite link is ever invented. */
(function(){
  var KEY='pw_community_links';
  var mem={};
  // Save the links object (localStorage first, memory fallback).
  function store(v){ try{ localStorage.setItem(KEY,v); }catch(e){ mem[KEY]=v; } }
  // Read the links object (localStorage first, memory fallback).
  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return mem[KEY]||null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Load the saved invite links (empty object when none are saved).
  function getLinks(){ try{ return JSON.parse(read()||'{}'); }catch(e){ return {}; } }
  // Platform homepages used while no real invite link is saved.
  var DEFAULTS={ discord:'https://discord.com', whatsapp:'https://www.whatsapp.com', telegram:'https://telegram.org', facebook:'https://www.facebook.com' };
  // Apply the saved links to the Join buttons (the cards live on Home only).
  function render(){
    var links=getLinks();
    Array.prototype.slice.call(document.querySelectorAll('.community-join')).forEach(function(a){
      var key=a.getAttribute('data-community');
      var url=(links[key]||'').trim();
      if(url){ a.setAttribute('href',url); a.classList.add('linked'); }
      else { a.setAttribute('href',DEFAULTS[key]||'#'); a.classList.remove('linked'); }
    });
  }
  // Fill the Admin fields with the saved links.
  function fillAdmin(){
    var links=getLinks();
    Object.keys(DEFAULTS).forEach(function(key){
      var el=$('cl-'+key);
      if(el) el.value=links[key]||'';
    });
    var s=$('community-saved'); if(s) s.hidden=true;
  }
  // Save the Admin fields (a bare domain gets https:// added).
  function saveAdmin(){
    var links={};
    Object.keys(DEFAULTS).forEach(function(key){
      var el=$('cl-'+key);
      var v=el?el.value.trim():'';
      if(v && !/^https?:\/\//i.test(v)) v='https://'+v;
      if(v) links[key]=v;
    });
    store(JSON.stringify(links));
    render();
    var s=$('community-saved'); if(s){ s.hidden=false; setTimeout(function(){ s.hidden=true; }, 3000); }
  }
  var saveBtn=$('community-save');
  if(saveBtn) saveBtn.addEventListener('click', saveAdmin);
  // Fill the Admin fields whenever the panel opens (via the #admin link).
  document.addEventListener('pw-admin-open', fillAdmin);
  var openBtn=$('admin-open');
  if(openBtn) openBtn.addEventListener('click', fillAdmin);
  render();
})();
