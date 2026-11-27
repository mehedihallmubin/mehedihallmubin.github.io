/* 15. blog.js - Blog page + Admin blog editor.
   Posts are real posts only, written in Admin. They save in
   localStorage (per device) and render on the Blog page. With no
   posts, the Blog page shows its honest empty state.
   Published posts also live in the SEED below (repo file) so visitors
   and fresh browsers see them after a push; localStorage wins here. */
(function(){
  var KEY='pw_blog_posts';
  // Published posts shipped in the repo (seed). Visitors and fresh browsers
  // see these. Admin saves to localStorage, which wins on this device.
  // Rio copies the Settings Backup JSON into this seed when publishing.
  var SEED=[{"title": "Luna is coming soon", "text": "Very soon Luna talk.", "date": "2026-11-25T20:34:25.796Z"}];
  window.PW_SEED_BLOG=SEED;
  var mem={};
  // Save the post list (localStorage first, memory fallback).
  function store(v){ try{ localStorage.setItem(KEY,v); }catch(e){ mem[KEY]=v; } }
  // Read the post list (localStorage first, memory fallback).
  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return mem[KEY]||null; } }
  // Shortcut for document.getElementById.
  function $(id){ return document.getElementById(id); }
  // Short message at the bottom of the screen.
  function toast(msg){
    var t=$('toast'); if(!t) return;
    t.textContent=msg; t.hidden=false;
    clearTimeout(t._h); t._h=setTimeout(function(){ t.hidden=true; }, 3600);
  }
  // Format an ISO date as "15 Nov 2026".
  function fmtDate(iso){ try{ return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return ''; } }
  // Load the posts (newest first). localStorage wins when this device has
  // saved posts; otherwise fall back to the published seed in the repo.
  function getPosts(){
    try{ var l=JSON.parse(read()||'null'); if(Array.isArray(l)) return l; }catch(e){}
    return SEED.slice();
  }
  // Render the Blog page posts (Blog page only).
  function render(){
    var wrap=$('blog-posts'); if(!wrap) return;
    var empty=$('blog-empty');
    var posts=getPosts();
    wrap.innerHTML='';
    if(!posts.length){ if(empty) empty.hidden=false; return; }
    if(empty) empty.hidden=true;
    posts.forEach(function(p){
      var a=document.createElement('article');
      a.className='card blog-post';
      a.innerHTML='<h3></h3><div class="post-date"></div><p></p>';
      a.querySelector('h3').textContent=p.title;
      a.querySelector('.post-date').textContent=fmtDate(p.date);
      a.querySelector('p').textContent=p.text;
      wrap.appendChild(a);
    });
  }
  // Two-tap delete: first tap arms it, second tap deletes.
  function armDelete(btn, fn){
    if(btn.dataset.armed){ delete btn.dataset.armed; fn(); return; }
    btn.dataset.armed='1'; btn.textContent='Tap again to delete';
    setTimeout(function(){ delete btn.dataset.armed; btn.textContent='Delete'; }, 3000);
  }
  // The post being edited in the Admin form (null when adding).
  var editing=null;
  // Fill the Admin form for editing one post.
  function startEdit(i){
    var p=getPosts()[i]; if(!p) return;
    editing=i;
    $('bp-title').value=p.title; $('bp-text').value=p.text;
    $('bp-add').textContent='Save changes';
    $('bp-cancel').hidden=false;
    $('bp-title').focus();
  }
  // Clear the Admin form back to "add" mode.
  function resetForm(){
    editing=null;
    $('bp-title').value=''; $('bp-text').value='';
    $('bp-add').textContent='Add post';
    $('bp-cancel').hidden=true;
  }
  // Render the post list inside the Admin panel.
  function renderAdminList(){
    var box=$('bp-list'); if(!box) return;
    box.innerHTML='';
    getPosts().forEach(function(p,i){
      var d=document.createElement('div'); d.className='admin-item';
      var top=document.createElement('div'); top.className='admin-item-top';
      var s=document.createElement('span'); s.textContent=p.title+' · '+fmtDate(p.date);
      var e=document.createElement('button'); e.type='button'; e.className='btn btn-ghost btn-sm'; e.textContent='Edit';
      var del=document.createElement('button'); del.type='button'; del.className='btn btn-ghost btn-sm'; del.textContent='Delete';
      e.addEventListener('click', function(){ startEdit(i); });
      del.addEventListener('click', function(){
        armDelete(del, function(){
          var l=getPosts(); l.splice(i,1); store(JSON.stringify(l));
          renderAdminList(); render(); toast('Post deleted.');
        });
      });
      top.appendChild(s); top.appendChild(e); top.appendChild(del);
      var txt=document.createElement('p'); txt.textContent=p.text.length>140 ? p.text.slice(0,140)+'…' : p.text;
      d.appendChild(top); d.appendChild(txt); box.appendChild(d);
    });
  }
  // Add or save a post from the Admin form.
  function saveForm(){
    var title=$('bp-title').value.trim(), text=$('bp-text').value.trim();
    if(!title || !text){ toast('Post title and text both needed.'); return; }
    var l=getPosts();
    if(editing!==null && l[editing]){
      l[editing]={title:title, text:text, date:l[editing].date};
      toast('Post updated.');
    } else {
      l.unshift({title:title, text:text, date:new Date().toISOString()});
      toast('Post added.');
    }
    store(JSON.stringify(l));
    resetForm(); renderAdminList(); render();
  }
  var addBtn=$('bp-add');
  if(addBtn) addBtn.addEventListener('click', saveForm);
  var cancelBtn=$('bp-cancel');
  if(cancelBtn) cancelBtn.addEventListener('click', resetForm);
  renderAdminList();
  render();
})();
