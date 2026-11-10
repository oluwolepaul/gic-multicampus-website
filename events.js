(function () {
  'use strict';
  var programs = window.GIC_EVENTS || [];
  var cards = Array.from(document.querySelectorAll('.season-card'));
  var campus = document.getElementById('eventCampus');
  var month = document.getElementById('eventMonth');
  var language = null;
  function zone(program) { return program.campus === 'houston' ? 'America/Chicago' : 'America/New_York'; }
  function today(program) {
    var parts = new Intl.DateTimeFormat('en-US',{timeZone:zone(program),year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    function part(type) { return parts.find(function (p) { return p.type === type; }).value; }
    return part('year') + '-' + part('month') + '-' + part('day');
  }
  function remaining(program) {
    var date = today(program);
    return program.dates.filter(function (event) { return event[4] ? event[4] > date : event[0] >= date; });
  }
  function stamp(date, hour, program) {
    // Supplied November/December 2026 events fall in US standard time.
    var offset = program.campus === 'houston' ? 6 : 5;
    return new Date(Date.parse(date + 'T00:00:00Z') + (hour + offset) * 3600000).toISOString().replace(/[-:]/g,'').replace('.000','');
  }
  function escapeICS(value) { return value.replace(/&amp;/g,'&').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
  function fold(line) {
    var result = '', length = 0;
    for (var character of line) { var bytes = new TextEncoder().encode(character).length; if (length + bytes > 73) { result += '\r\n '; length = 1; } result += character; length += bytes; }
    return result;
  }
  function downloadCalendar(program, card, occurrences) {
    var lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GIC//Church Events//EN','CALSCALE:GREGORIAN'];
    (occurrences || remaining(program)).forEach(function (event) {
      lines.push('BEGIN:VEVENT','UID:' + program.id + '-' + event[0] + '-' + (event[1] === null ? 'all-day' : event[1]) + '@gicglobal.org','DTSTAMP:' + new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'SUMMARY:' + escapeICS(event[2] + ' — ' + program.title),'LOCATION:' + escapeICS(card.querySelector('.season-address').textContent));
      if (event[1] === null) lines.push('DTSTART;VALUE=DATE:' + event[0].replace(/-/g,''),'DTEND;VALUE=DATE:' + event[4].replace(/-/g,''),'DESCRIPTION:Service times have not been announced. Contact the Houston campus before attending.');
      else { lines.push('DTSTART:' + stamp(event[0],event[1],program)); if (event[3]) lines.push('DTEND:' + stamp(event[0],event[3],program)); }
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    var url = URL.createObjectURL(new Blob([lines.map(fold).join('\r\n') + '\r\n'],{type:'text/calendar;charset=utf-8'}));
    var link = document.createElement('a'); link.href = url; link.download = program.id + '.ics'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); },1000);
  }
  cards.forEach(function (card) {
    var program = programs.find(function (p) { return p.id === card.dataset.eventId; }); if (!program) return;
    card.id = 'event-' + program.id;
    var upcoming = remaining(program);
    card.dataset.language = program.language;
    card.dataset.nextDate = upcoming.length ? (upcoming[0][0] < today(program) ? today(program) : upcoming[0][0]) : '9999-12-31';
    card.dataset.expired = String(!upcoming.length);
    var next = document.createElement('p'); next.className = 'season-next';
    if (upcoming.length) {
      var event = upcoming[0]; var formatted = new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(event[0] + 'T12:00:00Z'));
      next.textContent = event[4] && event[0] < today(program) ? 'Happening now · ' + event[2] : (program.language === 'es' ? 'Próximo: ' : 'Next: ') + formatted + ' · ' + event[2];
      card.querySelector('.season-badge').after(next);
    }
    var button = document.createElement('button'); button.type = 'button'; button.className = 'season-calendar'; button.textContent = program.language === 'es' ? 'Añadir al calendario' : 'Add to calendar'; button.addEventListener('click',function () { downloadCalendar(program,card); });
    card.querySelector('.season-actions').appendChild(button);
    var eventLink = document.createElement('a'); eventLink.href = 'events.html?campus=' + program.campus + '#event-' + program.id; eventLink.textContent = program.language === 'es' ? 'Enlace del evento' : 'Event link';
    card.querySelector('.season-actions').appendChild(eventLink);
    card.hidden = !upcoming.length;
  });
  document.querySelectorAll('.season-grid').forEach(function (grid) {
    Array.from(grid.querySelectorAll('.season-card')).sort(function (a,b) { return a.dataset.nextDate.localeCompare(b.dataset.nextDate); }).forEach(function (card) { grid.appendChild(card); });
  });
  document.querySelectorAll('.campus-event-empty').forEach(function (empty) { empty.hidden = Array.from(empty.previousElementSibling.children).some(function (card) { return !card.hidden; }); });
  if (!campus || !month) return;
  var toolbar = document.querySelector('.season-toolbar');
  var group = document.createElement('div'); var label = document.createElement('label'); label.htmlFor = 'eventLanguage'; label.textContent = 'Flyer language';
  language = document.createElement('select'); language.id = 'eventLanguage';
  [['all','All languages'],['en','English flyer'],['es','Spanish flyer']].forEach(function (entry) { var option = document.createElement('option'); option.value = entry[0]; option.textContent = entry[1]; language.appendChild(option); });
  group.append(label,language); toolbar.insertBefore(group,document.getElementById('eventCount'));
  var reset = document.createElement('button'); reset.type = 'button'; reset.className = 'season-reset'; reset.textContent = 'Clear filters'; toolbar.appendChild(reset);
  var grid = document.querySelectorAll('.season-grid')[0];
  var view = 'flyers';
  var restoring = true;
  var controls = document.createElement('div'); controls.className = 'event-view-controls'; controls.setAttribute('role','group'); controls.setAttribute('aria-label','Event display');
  var flyerView = document.createElement('button'); flyerView.type = 'button'; flyerView.textContent = 'Flyer cards'; flyerView.id = 'eventFlyerView';
  var scheduleView = document.createElement('button'); scheduleView.type = 'button'; scheduleView.textContent = 'Date & time schedule'; scheduleView.id = 'eventScheduleView';
  controls.append(flyerView,scheduleView); grid.before(controls);
  var agenda = document.createElement('div'); agenda.className = 'event-agenda'; agenda.id = 'eventAgenda'; agenda.hidden = true; grid.after(agenda);
  if (typeof window.print === 'function') {
    var print = document.createElement('button'); print.type = 'button'; print.className = 'event-print'; print.textContent = 'Print schedule';
    print.addEventListener('click',function () {
      document.body.setAttribute('data-print-events','true');
      window.addEventListener('afterprint',function () { document.body.removeAttribute('data-print-events'); },{once:true});
      window.print();
    });
    controls.appendChild(print);
  }
  function make(tag,className,text) { var el = document.createElement(tag); el.className = className; el.textContent = text; return el; }
  function timeLabel(hour) { var hours = Math.floor(hour); var minutes = Math.round((hour - hours) * 60); return (hours % 12 || 12) + (minutes ? ':' + String(minutes).padStart(2,'0') : '') + (hours >= 12 ? ' PM' : ' AM'); }
  function renderAgenda() {
    agenda.replaceChildren(); var sessions = [];
    cards.filter(function (card) { return !card.hidden; }).forEach(function (card) {
      var program = programs.find(function (p) { return p.id === card.dataset.eventId; });
      remaining(program).forEach(function (event) { sessions.push({program:program,card:card,event:event}); });
    });
    sessions.sort(function (a,b) { return stamp(a.event[0],a.event[1] || 0,a.program).localeCompare(stamp(b.event[0],b.event[1] || 0,b.program)); });
    sessions.forEach(function (session) {
      var program = session.program, event = session.event;
      var row = make('article','agenda-row','');
      var date = new Date(event[0] + 'T12:00:00Z');
      var badge = make('time','agenda-date',''); badge.dateTime = event[0];
      badge.append(make('span','agenda-month',new Intl.DateTimeFormat('en-US',{month:'short',timeZone:'UTC'}).format(date)),make('strong','agenda-day',String(date.getUTCDate())));
      var body = make('div','agenda-body','');
      body.append(make('p','agenda-campus',(program.campus === 'houston' ? 'Houston, Texas' : 'New York') + (program.language === 'es' ? ' · Spanish flyer' : program.language === 'en' ? ' · English flyer' : '')));
      var heading = make('h3','',event[2]); if (program.language === 'es') heading.lang = 'es'; body.appendChild(heading);
      if (program.title !== event[2]) body.appendChild(make('p','agenda-program',program.title.replace(/&amp;/g,'&')));
      var range = event[4] ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(date) + '–' + new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.parse(event[4] + 'T00:00:00Z') - 86400000)) : '';
      var time = event[1] === null ? range + ' · Service times to be confirmed' : timeLabel(event[1]) + (event[3] ? '–' + timeLabel(event[3]) : '') + ' · Local campus time';
      body.append(make('p','agenda-time',time),make('p','agenda-address',session.card.querySelector('.season-address').textContent));
      var actions = make('div','agenda-actions','');
      var calendar = make('button','season-calendar','Add this date'); calendar.type = 'button'; calendar.addEventListener('click',function () { downloadCalendar(program,session.card,[event]); });
      var flyer = make('a','','View flyer ↗'); flyer.href = program.html.match(/href="(images\/events\/[^\"]+)"/)[1]; flyer.target = '_blank'; flyer.rel = 'noopener';
      actions.append(calendar,flyer); row.append(badge,body,actions); agenda.appendChild(row);
    });
    return sessions.length;
  }
  function selectView(next) { view = next; grid.hidden = view === 'schedule'; agenda.hidden = view !== 'schedule'; flyerView.setAttribute('aria-pressed',String(view === 'flyers')); scheduleView.setAttribute('aria-pressed',String(view === 'schedule')); filterEvents(); }
  flyerView.addEventListener('click',function () { selectView('flyers'); }); scheduleView.addEventListener('click',function () { selectView('schedule'); });
  function filterEvents() {
    if (shareStatus) shareStatus.textContent = '';
    var count = 0;
    cards.forEach(function (card) {
      var visible = card.dataset.expired !== 'true' && (campus.value === 'all' || card.dataset.campus === campus.value) && (month.value === 'all' || card.dataset.month === month.value) && (language.value === 'all' || card.dataset.language === 'all' || card.dataset.language === language.value);
      card.hidden = !visible; if (visible) count++;
    });
    var dates = renderAgenda();
    document.getElementById('eventCount').textContent = view === 'schedule' ? dates + (dates === 1 ? ' schedule entry' : ' schedule entries') : count + (count === 1 ? ' event program' : ' event programs'); document.getElementById('eventEmpty').hidden = count > 0;
    reset.disabled = campus.value === 'all' && month.value === 'all' && language.value === 'all';
    var visibleLink = document.getElementById('eventViewLink'); if (visibleLink && location.href) visibleLink.value = viewURL().href;
    if (!restoring && window.history && location.href) {
      var url = viewURL();
      if (url.href !== location.href) window.history.pushState(null,'',url.href);
    }
  }
  function viewURL() {
    var url = new URL(location.href);
    [['campus',campus.value],['month',month.value],['language',language.value],['view',view]].forEach(function (entry) {
      if (entry[1] === 'all' || (entry[0] === 'view' && entry[1] === 'flyers')) url.searchParams.delete(entry[0]);
      else url.searchParams.set(entry[0],entry[1]);
    });
    url.hash = 'events'; return url;
  }
  function restoreView() {
    restoring = true;
    var params = new URLSearchParams(location.search);
    campus.value = ['houston','newyork','lagos'].includes(params.get('campus')) ? params.get('campus') : 'all';
    month.value = ['11','12'].includes(params.get('month')) ? params.get('month') : 'all';
    language.value = ['en','es'].includes(params.get('language')) ? params.get('language') : 'all';
    selectView(params.get('view') === 'schedule' ? 'schedule' : 'flyers');
    restoring = false;
  }
  if (/^https?:$/.test(location.protocol)) {
    var share = make('button','event-share','Copy this event view'); share.type = 'button';
    var shareStatus = make('span','event-share-status',''); shareStatus.setAttribute('role','status'); shareStatus.setAttribute('aria-live','polite');
    controls.append(share,shareStatus);
    share.addEventListener('click',function () {
      var link = viewURL().href;
      Promise.resolve().then(function () { return navigator.clipboard.writeText(link); }).then(function () { shareStatus.textContent = 'Link copied'; }).catch(function () {
        shareStatus.textContent = 'Copy the selected link:';
        var field = document.getElementById('eventViewLink');
        if (!field) { field = make('input','event-view-link',''); field.id = 'eventViewLink'; field.type = 'url'; field.readOnly = true; field.setAttribute('aria-label','Link to this filtered event view'); controls.appendChild(field); }
        field.value = link; field.focus(); field.select();
      });
    });
  }
  [campus,month,language].forEach(function (control) { control.addEventListener('change',filterEvents); });
  reset.addEventListener('click',function () { campus.value = month.value = language.value = 'all'; filterEvents(); });
  if (window.addEventListener) window.addEventListener('popstate',restoreView);
  toolbar.hidden = false; restoreView();
})();
