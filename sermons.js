(function () {
  'use strict';
  var ENDPOINT = 'https://sermon-api.vercel.app/api/sermons';
  var CHANNEL = 'https://www.youtube.com/@GicglobalTX';
  var videos = [], page = 1, pageSize = 9, loading = false;
  var grid = document.getElementById('sermonsGrid');
  var search = document.getElementById('sermonSearch');
  var year = document.getElementById('sermonYear');
  var status = document.getElementById('sermonFeedStatus');
  var count = document.getElementById('filterCount');
  var pagination = document.getElementById('pagination');
  var modal = document.getElementById('videoModal');
  var player = null, playerRequest = 0, apiPromise = null;
  function youtubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve,reject) {
      var timer = setTimeout(function () { reject(new Error('Player unavailable')); },12000);
      var previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { clearTimeout(timer); if (typeof previous === 'function') previous(); resolve(window.YT); };
      var script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.addEventListener('error',function () { clearTimeout(timer); reject(new Error('Player blocked')); });
      document.head.appendChild(script);
    }).catch(function (error) { apiPromise = null; throw error; });
    return apiPromise;
  }
  function destroyPlayer() { if (player) { try { player.destroy(); } catch (error) {} player = null; } }
  function fallback(video,message) {
    destroyPlayer();
    var preview = element('div','local-video-preview');
    var thumb = document.createElement('img'); thumb.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg'; thumb.alt = '';
    var content = element('div','local-video-content');
    content.append(element('h2','','Watch this message on YouTube'),element('p','',message));
    var link = element('a','btn-primary','Watch on YouTube ↗'); link.href = 'https://www.youtube.com/watch?v=' + video.id; link.target = '_blank'; link.rel = 'noopener';
    content.appendChild(link); preview.append(thumb,content); document.getElementById('videoContainer').replaceChildren(preview);
  }
  function element(tag, className, text) { var el = document.createElement(tag); if (className) el.className = className; if (text) el.textContent = text; return el; }
  function dateLabel(value) { return value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value)) : 'GIC Global'; }
  function closeVideo(event) {
    if (event && event.target !== event.currentTarget) return;
    playerRequest++; destroyPlayer();
    document.getElementById('videoContainer').replaceChildren(); modal.classList.remove('open'); document.body.style.overflow = '';
  }
  window.closeVideoModal = closeVideo;
  function openVideo(video) {
    var request = ++playerRequest; destroyPlayer();
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoMeta').textContent = dateLabel(video.publishedAt) + ' · GIC Global';
    document.getElementById('videoYtLink').href = 'https://www.youtube.com/watch?v=' + video.id;
    if (!/^https?:$/.test(location.protocol)) {
      fallback(video,'Embedded playback is unavailable in this file preview. You can watch the full video on YouTube.');
      modal.classList.add('open'); document.body.style.overflow = 'hidden'; return;
    }
    var container = document.getElementById('videoContainer');
    container.replaceChildren(element('p','video-loading','Loading video…'));
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    youtubeAPI().then(function (YT) {
      if (request !== playerRequest) return;
      var iframe = document.createElement('iframe'); iframe.title = video.title;
      iframe.src = 'https://www.youtube.com/embed/' + video.id + '?enablejsapi=1&playsinline=1&rel=0&origin=' + encodeURIComponent(location.origin);
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      container.replaceChildren(iframe);
      player = new YT.Player(iframe,{events:{onError:function () {
        if (request !== playerRequest) return;
        fallback(video,'YouTube couldn’t play this video here. You can still watch it directly on YouTube.');
      }}});
    }).catch(function () { if (request === playerRequest) fallback(video,'The video player couldn’t load. Open this message on YouTube to watch it.'); });
  }
  function render() {
    var query = search.value.trim().toLowerCase();
    var filtered = videos.filter(function (video) { return (!query || (video.title + ' ' + video.description).toLowerCase().includes(query)) && (!year.value || video.publishedAt.slice(0,4) === year.value); });
    grid.replaceChildren(); pagination.replaceChildren();
    count.textContent = filtered.length ? filtered.length + ' of ' + videos.length + ' recent uploads' : 'No matching uploads';
    if (!filtered.length) { var empty = element('div','empty-state'); empty.append(element('h2','empty-state-title', videos.length ? 'No matching messages' : 'No public uploads available'),element('p','empty-state-sub',videos.length ? 'Try another search or clear your filters.' : 'Visit our YouTube channel for more videos.')); grid.appendChild(empty); return; }
    var pages = Math.ceil(filtered.length / pageSize); page = Math.min(page,pages);
    filtered.slice((page - 1) * pageSize,page * pageSize).forEach(function (video) {
      var card = element('article','sermon-card');
      var watch = element('button','live-sermon-thumb'); watch.type = 'button'; watch.setAttribute('aria-label','Watch ' + video.title);
      var img = document.createElement('img'); img.src = 'https://i.ytimg.com/vi/' + video.id + '/mqdefault.jpg'; img.alt = ''; img.width = 320; img.height = 180; img.loading = 'lazy'; img.addEventListener('error',function () { img.hidden = true; });
      watch.append(img,element('span','live-sermon-play','▶')); watch.addEventListener('click',function () { openVideo(video); });
      var body = element('div','sermon-card-body'); body.append(element('p','sermon-series','GIC Global · Houston'),element('h2','sermon-title',video.title),element('p','sermon-date',dateLabel(video.publishedAt)));
      var description = element('p','live-sermon-description',video.description || 'Watch this public upload from GIC Global.');
      var button = element('button','card-btn-watch','Watch message'); button.type = 'button'; button.addEventListener('click',function () { openVideo(video); });
      var link = element('a','live-sermon-link','Open on YouTube ↗'); link.href = 'https://www.youtube.com/watch?v=' + video.id; link.target = '_blank'; link.rel = 'noopener';
      body.append(description,button,link); card.append(watch,body); grid.appendChild(card);
    });
    if (pages > 1) {
      var prev = element('button','page-btn','← Previous'); prev.type = 'button'; prev.disabled = page === 1; prev.addEventListener('click',function () { page--; render(); grid.scrollIntoView({block:'start'}); });
      var next = element('button','page-btn','Next →'); next.type = 'button'; next.disabled = page === pages; next.addEventListener('click',function () { page++; render(); grid.scrollIntoView({block:'start'}); });
      pagination.append(prev,element('span','page-info','Page ' + page + ' of ' + pages),next);
    }
  }
  async function load() {
    if (loading) return; loading = true; status.hidden = false; status.textContent = 'Loading recent uploads from GIC YouTube…'; grid.setAttribute('aria-busy','true');
    var controller = new AbortController(); var timer = setTimeout(function () { controller.abort(); },15000);
    try {
      var response = await fetch(ENDPOINT,{signal:controller.signal,headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Feed unavailable');
      var data = await response.json(); if (!Array.isArray(data.videos)) throw new Error('Invalid feed');
      var seen = new Set();
      videos = data.videos.filter(function (video) { if (!video || !/^[A-Za-z0-9_-]{11}$/.test(video.id) || seen.has(video.id)) return false; seen.add(video.id); return true; }).map(function (video) { return {id:video.id,title:typeof video.title === 'string' ? video.title : 'GIC message',description:typeof video.description === 'string' ? video.description : '',publishedAt:typeof video.publishedAt === 'string' && Number.isFinite(Date.parse(video.publishedAt)) ? video.publishedAt : ''}; });
      videos.sort(function (a,b) { return b.publishedAt.localeCompare(a.publishedAt); });
      year.replaceChildren(element('option','','All years')); year.firstElementChild.value = '';
      Array.from(new Set(videos.map(function (v) { return v.publishedAt.slice(0,4); }).filter(Boolean))).sort().reverse().forEach(function (value) { var option = element('option','',value); option.value = value; year.appendChild(option); });
      status.textContent = 'Showing up to 25 recent public channel uploads, including messages and services.'; render();
      var requestedVideo = new URLSearchParams(location.search).get('video');
      var requested = videos.find(function (video) { return video.id === requestedVideo; });
      if (requested) openVideo(requested);
    } catch (error) {
      count.textContent = 'Sermon feed unavailable'; status.replaceChildren(element('p','','We couldn’t load recent uploads. Please try again or visit our YouTube channel.'));
      var retry = element('button','reset-sermons','Try again'); retry.type = 'button'; retry.addEventListener('click',load);
      var channel = element('a','live-sermon-link','Visit GIC YouTube ↗'); channel.href = CHANNEL; channel.target = '_blank'; channel.rel = 'noopener'; status.append(retry,channel);
    } finally { clearTimeout(timer); loading = false; grid.setAttribute('aria-busy','false'); }
  }
  search.addEventListener('input',function () { page = 1; render(); }); year.addEventListener('change',function () { page = 1; render(); });
  document.getElementById('sermonReset').addEventListener('click',function () { search.value = year.value = ''; page = 1; render(); search.focus(); });
  document.addEventListener('keydown',function (event) { if (event.key === 'Escape') closeVideo(); });
  load();
})();
