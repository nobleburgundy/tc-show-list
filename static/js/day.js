// Runs at the end of the Today and Tomorrow pages. Inlined by the build.
(function () {
  var main = document.querySelector('main');

  // 1. Put venues in the visitor's saved order (from the Settings page).
  try {
    var order = JSON.parse(localStorage.getItem('venueOrder') || 'null');
    if (Array.isArray(order)) {
      var sortIn = function (parent) {
        var items = Array.prototype.filter.call(parent.children, function (el) { return el.dataset.venue; });
        // Venues missing from the saved order (added later) go last, in the usual order.
        var rank = function (el) {
          var i = order.indexOf(el.dataset.venue);
          return i < 0 ? order.length + items.indexOf(el) : i;
        };
        var anchor = items.length ? items[items.length - 1].nextSibling : null;
        items.sort(function (a, b) { return rank(a) - rank(b); })
          .forEach(function (el) { parent.insertBefore(el, anchor); });
      };
      sortIn(main);
    }
  } catch (e) {}

  // Current time in Minnesota as "2026-11-04T21:30:00", to compare with show times.
  function centralNow() {
    var p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day + 'T' + p.hour + ':' + p.minute + ':' + p.second;
  }
  var now = centralNow();

  // 2. If the list isn't for the day this page is meant to show (e.g. a build failed
  //    overnight), say so plainly. data-offset is 0 on Today, 1 on Tomorrow.
  var built = main.dataset.date;
  var offset = Number(main.dataset.offset || 0);
  var expected = new Date(Date.parse(now.slice(0, 10) + 'T12:00:00Z') + offset * 864e5).toISOString().slice(0, 10);
  if (built && built !== expected) {
    var warn = document.createElement('p');
    warn.className = 'stale';
    warn.textContent = 'This list is for ' + document.querySelector('header .row span').textContent
      + ', not ' + (offset ? 'tomorrow' : 'today') + '. It will update soon.';
    main.insertBefore(warn, main.firstChild);
    return;
  }

  // 3. Grey out shows that are over. No end time listed? Assume about 3 hours.
  var plusHours = function (local, h) {
    return new Date(new Date(local + 'Z').getTime() + h * 36e5).toISOString().slice(0, 19);
  };
  Array.prototype.forEach.call(document.querySelectorAll('.show[data-start]'), function (el) {
    var end = el.dataset.end;
    if (!end || end <= el.dataset.start) end = plusHours(el.dataset.start, 3);
    if (end < now) el.classList.add('past');
  });
})();
