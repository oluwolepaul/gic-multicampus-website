(function () {
  'use strict';
  var grid = document.getElementById('homeMessages');
  var status = document.getElementById('homeMessagesStatus');
  if (!grid || !status) return;
  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); },12000);
  fetch('https://sermon-api.vercel.app/api/sermons',{signal:controller.signal,headers:{Accept:'application/json'}}).then(function (response) {
    if (!response.ok) throw new Error('Feed unavailable'); return response.json();
  }).then(function (data) {
    if (!Array.isArray(data.videos)) throw new Error('Invalid feed');
    var videos = data.videos.filter(function (video) { return video && /^[A-Za-z0-9_-]{11}$/.test(video.id); }).slice(0,3);
    grid.replaceChildren();
    videos.forEach(function (video) {
      var link = document.createElement('a'); link.className = 'home-message'; link.href = 'sermons.html?video=' + encodeURIComponent(video.id);
      var img = document.createElement('img'); img.src = 'https://i.ytimg.com/vi/' + video.id + '/mqdefault.jpg'; img.alt = ''; img.width = 320; img.height = 180; img.loading = 'lazy';
      var body = document.createElement('div'); body.className = 'home-message-body';
      var label = document.createElement('p'); label.className = 'section-label'; label.textContent = 'GIC Global · YouTube';
      var title = document.createElement('h3'); title.textContent = typeof video.title === 'string' ? video.title : 'Watch a recent message';
      var action = document.createElement('span'); action.className = 'home-message-action'; action.textContent = 'Watch message →';
      body.append(label,title,action); link.append(img,body); grid.appendChild(link);
    });
    status.textContent = videos.length ? 'Recent public messages and services from our Houston YouTube channel.' : 'Visit the message library or our YouTube channel for more videos.';
  }).catch(function () { status.textContent = 'Recent uploads couldn’t load. You can still browse the message library or visit our YouTube channel.'; }).finally(function () { clearTimeout(timeout); });
})();
