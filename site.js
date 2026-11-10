(function () {
  'use strict';
  var current = location.pathname.split('/').pop() || 'index.html';
  var campusDetails = window.GIC_CAMPUSES || [];
  function campusLink(text,href,className) { var a = document.createElement('a'); a.textContent = text; a.href = href; if (className) a.className = className; return a; }
  document.querySelectorAll('.loc-card').forEach(function (card) {
    var detail = campusDetails.find(function (entry) { return entry.page === card.getAttribute('href'); }); if (!detail) return;
    var body = card.querySelector('.loc-body'); if (!body) return;
    var type = document.createElement('span'); type.className = 'campus-format'; type.textContent = detail.format;
    var schedule = document.createElement('p'); schedule.className = 'campus-card-schedule'; schedule.textContent = detail.sunday;
    body.prepend(type); body.querySelector('.loc-region')?.after(schedule);
  });
  var detail = campusDetails.find(function (entry) { return entry.page === current; });
  if (detail) {
    var summary = document.createElement('section'); summary.className = 'campus-visit-summary'; summary.setAttribute('aria-labelledby','visitSummaryHeading');
    var inside = document.createElement('div'); inside.className = 'section-inner visit-summary-inner';
    var info = document.createElement('div'); var heading = document.createElement('h2'); heading.id = 'visitSummaryHeading'; heading.textContent = detail.id === 'lagos' ? 'Connect with GIC Lagos' : 'Your visit at a glance';
    var type = document.createElement('p'); type.className = 'campus-format'; type.textContent = detail.format;
    var address = document.createElement('p'); address.className = 'visit-address'; address.textContent = detail.address;
    var schedule = document.createElement('p'); schedule.className = 'visit-schedule'; schedule.textContent = detail.sunday;
    var time = document.createElement('p'); time.className = 'visit-time-note'; time.textContent = [detail.midweek,detail.timeNote].filter(Boolean).join(' · ');
    info.append(type,heading,address,schedule,time);
    var actions = document.createElement('div'); actions.className = 'visit-summary-actions';
    actions.appendChild(campusLink(detail.id === 'lagos' ? 'Ask about online worship' : 'Plan your first visit','contact.html?campus='+detail.id+'&reason=visit','btn-primary'));
    if (detail.id !== 'lagos') { var directions=campusLink('Get directions ↗','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(detail.address),'visit-directions'); directions.target='_blank'; directions.rel='noopener'; actions.appendChild(directions); }
    if (detail.phone) actions.appendChild(campusLink('Call '+detail.phoneLabel,'tel:'+detail.phone,'visit-phone'));
    var help = document.createElement('p'); help.className = 'visit-help'; help.textContent = detail.id === 'lagos' ? 'Our team can help you find the broadcast and confirm the time.' : 'Questions about parking, children’s activities, or accessibility? Ask our team before your visit.';
    actions.appendChild(help); inside.append(info,actions); summary.appendChild(inside);
    document.querySelector('.page-hero')?.after(summary);
  }
  if (current === 'contact.html') {
    var params = new URLSearchParams(location.search);
    var campusValues = {houston:'Houston, Texas',newyork:'New York',lagos:'Lagos'};
    var campusField = document.getElementById('campus');
    if (campusField && campusValues[params.get('campus')]) campusField.value = campusValues[params.get('campus')];
    if (params.get('reason') === 'visit') {
      var visit = document.querySelector('.dept-btn[data-dept="Plan a Visit"]'); if (visit) visit.click();
    }
  }
  var contactSend = document.getElementById('contactSendBtn');
  if (contactSend) {
    contactSend.addEventListener('click',function (event) {
      var firstInvalid = null;
      ['firstName','lastName','email','message'].forEach(function (id) {
        var field = document.getElementById(id); if (!field) return;
        var errorId = id + '-error'; var error = document.getElementById(errorId);
        var valid = Boolean(field.value.trim()) && field.checkValidity();
        field.setAttribute('aria-invalid',String(!valid));
        if (!valid) {
          if (!error) { error = document.createElement('p'); error.id = errorId; error.className = 'inline-error'; field.after(error); }
          error.textContent = id === 'email' ? 'Enter a valid email address.' : 'Please complete this field.';
          field.setAttribute('aria-describedby',errorId); if (!firstInvalid) firstInvalid = field;
        } else { if (error) error.remove(); field.removeAttribute('aria-describedby'); }
      });
      if (firstInvalid) { event.preventDefault(); event.stopImmediatePropagation(); firstInvalid.focus(); }
    },true);
  }
  var campuses = {'location-texas.html':['houston','Houston'], 'location-newyork.html':['newyork','New York'], 'location-lagos.html':['lagos','Lagos']};
  if (campuses[current]) {
    var campus = campuses[current];
    var section = document.createElement('section'); section.className = 'section campus-events-link'; section.id = 'campus-events';
    var hero = document.querySelector('.page-hero-inner');
    if (hero) {
      var actions = document.createElement('div'); actions.className = 'campus-quick-actions';
      var visit = document.createElement('a'); visit.className = 'btn-primary'; visit.textContent = campus[0] === 'lagos' ? 'Ask about joining online' : 'Plan your first visit'; visit.href = 'contact.html?campus=' + campus[0] + '&reason=visit';
      var events = document.createElement('a'); events.className = 'welcome-secondary'; events.textContent = 'Upcoming campus events'; events.href = '#campus-events';
      actions.append(visit,events); hero.appendChild(actions);
    }
    var inner = document.createElement('div'); inner.className = 'section-inner';
    var heading = document.createElement('h2'); heading.className = 'section-h2'; heading.textContent = 'What’s happening at ' + campus[1];
    var link = document.createElement('a'); link.className = 'btn-primary'; link.href = 'events.html?campus=' + campus[0] + '#events'; link.textContent = 'Explore campus events →';
    var grid = document.createElement('div'); grid.className = 'season-grid';
    var programs = (window.GIC_EVENTS || []).filter(function (program) { return program.campus === campus[0]; });
    programs.forEach(function (program) { var template = document.createElement('template'); template.innerHTML = program.html; grid.appendChild(template.content.firstElementChild); });
    var empty = document.createElement('p'); empty.className = 'season-empty campus-event-empty'; empty.hidden = true; empty.textContent = 'No upcoming events announced yet. Please contact us for updates.';
    var note = document.createElement('p'); note.className = 'season-time-note'; note.textContent = 'All times are local to this campus.';
    inner.append(heading,note,grid,empty,link); section.appendChild(inner);
    var main = document.querySelector('main'); if (main) { var newsletter = main.querySelector('.newsletter'); if (newsletter) newsletter.before(section); else main.appendChild(section); }
  }
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(function (a) {
    a.classList.remove('active');
    if (a.getAttribute('href') === current) a.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('.has-dropdown > a, .mob-has-dropdown > a').forEach(function (a) {
    a.setAttribute('role', 'button'); a.setAttribute('aria-expanded', 'false');
    var menu = a.parentElement;
    a.addEventListener('click', function (event) {
      event.preventDefault();
      if (menu.classList.contains('has-dropdown')) menu.classList.toggle('menu-expanded');
      a.setAttribute('aria-expanded', String(menu.classList.contains('open') || menu.classList.contains('menu-expanded')));
    });
    a.addEventListener('keydown', function (event) { if (event.key === ' ') { event.preventDefault(); a.click(); } });
  });
  document.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"]), textarea, select').forEach(function (field, i) {
    if (!field.id) field.id = 'site-field-' + i;
    var previous = field.previousElementSibling;
    if (previous && previous.tagName === 'LABEL') { previous.htmlFor = field.id; return; }
    if (document.querySelector('label[for="' + field.id + '"]')) return;
    var text = field.getAttribute('placeholder') || (field.id === 'customAmount' ? 'Custom amount (USD)' : 'Choose an option');
    var label = document.createElement('label'); label.className = 'field-label'; label.htmlFor = field.id; label.textContent = text;
    field.before(label);
    if (field.type === 'email') field.autocomplete = 'email';
    if (field.type === 'tel') field.autocomplete = 'tel';
  });
  document.querySelectorAll('.newsletter-form, .nl-form, .contact-form').forEach(function (form) {
    var note = document.createElement('p'); note.className = 'handoff-note';
    note.textContent = 'Opens a draft in your email app. Send the email there to complete your request. You can also email info@gicglobal.org.';
    form.appendChild(note);
  });
  var alts = {'images/drayo.portfolio.jpg':'Dr. A. A. Ajim', 'images/drayo2.portfolio.jpg':'Senior pastors of Grace International Church', 'images/img2.portfolio.jpg':'Worship at Grace International Church', 'images/img3.portfolio.jpg':'Our Grace International Church family', 'images/tx.portfolio.jpg':'Houston campus', 'images/ny.portfolio.jpg':'New York campus', 'images/lag.portfolio.jpg':'Lagos campus'};
  document.querySelectorAll('img:not([alt])').forEach(function (img) {
    var src = img.getAttribute('src');
    img.alt = alts[src] || (/photo-tx-/.test(src) ? 'Houston campus' : /photo-ny-/.test(src) ? 'New York campus' : /photo-lag-/.test(src) ? 'Lagos campus' : 'Grace International Church');
  });
  document.querySelectorAll('.hc-dot').forEach(function (button, i) { button.setAttribute('aria-label', 'Show slide ' + (i + 1)); });
  document.querySelectorAll('.modal-close, .mobile-nav-close').forEach(function (button) { button.setAttribute('aria-label','Close dialog'); });
  document.querySelectorAll('.social-btn').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var platform = /youtube\.com/.test(href) ? 'YouTube' : /facebook\.com/.test(href) ? 'Facebook' : /instagram\.com/.test(href) ? 'Instagram' : /twitter\.com|x\.com/.test(href) ? 'X' : '';
    if (platform) { link.setAttribute('aria-label','GIC on ' + platform); link.title = 'GIC on ' + platform; if (platform === 'X') link.textContent = 'X'; }
  });
  document.querySelectorAll('.breadcrumb a[href="#"]').forEach(function (link) { link.href = 'index.html#locations'; });
  document.querySelectorAll('.faq-item').forEach(function (item, index) {
    var button = item.querySelector('.faq-question'); var answer = item.querySelector('.faq-answer'); if (!button || !answer) return;
    answer.id = answer.id || 'faq-answer-' + index; button.setAttribute('aria-controls',answer.id);
    function sync() { button.setAttribute('aria-expanded',String(item.classList.contains('open'))); }
    sync(); new MutationObserver(sync).observe(item,{attributes:true,attributeFilter:['class']});
  });
  document.querySelectorAll('.dept-btn, .map-tab, .fund-tab, .freq-btn, .amount-btn, .method-btn').forEach(function (button) {
    function sync() { button.setAttribute('aria-pressed',String(/(?:^|\s)active(?:-|\s|$)/.test(button.className))); }
    sync(); new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['class']});
  });
  function keyboardCards() {
    document.querySelectorAll('div[onclick^="openModal"], div[onclick^="openVideo"]').forEach(function (card) {
      if (card.getAttribute('role') === 'button') return;
      card.setAttribute('role','button'); card.tabIndex = 0;
      card.setAttribute('aria-label',card.querySelector('.min-card-title')?.textContent || 'View message details');
      card.addEventListener('keydown',function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); } });
    });
  }
  keyboardCards();
  var sermonGrid = document.querySelector('.sermons-grid, .sermon-grid'); if (sermonGrid) new MutationObserver(keyboardCards).observe(sermonGrid,{childList:true});
  document.querySelectorAll('.season-card').forEach(function (card) {
    var address = card.querySelector('.season-address'); if (!address) return;
    var a = document.createElement('a'); a.className = 'season-directions'; a.textContent = 'Get directions ↗';
    a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address.textContent);
    a.target = '_blank'; a.rel = 'noopener'; address.after(a);
  });
  var activeDialog = null, returnFocus = null;
  var dialogs = Array.from(document.querySelectorAll('.modal-overlay, #mobileNav'));
  dialogs.forEach(function (dialog, i) {
    dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.tabIndex = -1;
    dialog.setAttribute('aria-label', dialog.id === 'mobileNav' ? 'Navigation menu' : 'Details');
    dialog.inert = !dialog.classList.contains('open');
    new MutationObserver(function () {
      var open = dialog.classList.contains('open'); dialog.inert = !open;
      if (open && activeDialog !== dialog) {
        returnFocus = document.activeElement; activeDialog = dialog;
        (dialog.querySelector('button, a[href], input') || dialog).focus();
      } else if (!open && activeDialog === dialog) { activeDialog = null; if (returnFocus && returnFocus.isConnected) returnFocus.focus(); }
      var hamburger = document.getElementById('hamburger');
      if (dialog.id === 'mobileNav' && hamburger) hamburger.setAttribute('aria-expanded', String(open));
    }).observe(dialog, {attributes:true, attributeFilter:['class']});
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('.menu-expanded').forEach(function (menu) { menu.classList.remove('menu-expanded'); var a=menu.querySelector('a'); if(a) a.setAttribute('aria-expanded','false'); });
      if (activeDialog && activeDialog.id === 'mobileNav') document.getElementById('mobileClose')?.click();
    }
    if (event.key !== 'Tab' || !activeDialog) return;
    var focusable = Array.from(activeDialog.querySelectorAll('a[href],button,input,textarea,select,[tabindex="0"]')).filter(function (el) { return !el.disabled && el.getClientRects().length; });
    if (!focusable.length) { event.preventDefault(); activeDialog.focus(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === activeDialog)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  var hamburger = document.getElementById('hamburger');
  if (hamburger) { hamburger.setAttribute('aria-controls','mobileNav'); hamburger.setAttribute('aria-expanded','false'); }
})();
