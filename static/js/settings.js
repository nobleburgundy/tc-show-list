// Settings page: drag venues into the order you want. Inlined into settings.html by
// the build, after `var VENUES = [{ id, name, area }, ...]` (default A–Z order).
// Mouse: drag anywhere on a row. Touch: drag by the ≡ handle (so the page still scrolls).
// Keyboard: focus a handle, then Up/Down arrows (Home/End jump to the top/bottom).
(function () {
  var KEY = 'venueOrder';
  var list = document.getElementById('order');
  var status = document.getElementById('status');
  var reset = document.getElementById('reset');
  var byId = {};
  VENUES.forEach(function (v) { byId[v.id] = v; });
  var defaults = VENUES.map(function (v) { return v.id; });

  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!Array.isArray(saved)) return defaults.slice();
    var kept = saved.filter(function (id) { return byId[id]; });
    return kept.concat(defaults.filter(function (id) { return kept.indexOf(id) < 0; }));
  }

  function currentOrder() {
    return Array.prototype.map.call(list.children, function (li) { return li.dataset.id; });
  }

  function save(msg) {
    var order = currentOrder();
    var isDefault = order.join() === defaults.join();
    try {
      if (isDefault) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(order));
      status.textContent = msg;
    } catch (e) {
      status.textContent = 'Could not save: this browser is blocking storage.';
    }
    reset.disabled = isDefault;
  }

  // Numbers and screen-reader labels follow the current position.
  function renumber() {
    var n = list.children.length;
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.querySelector('.num').textContent = String(i + 1);
      li.querySelector('.handle').setAttribute('aria-label',
        'Move ' + byId[li.dataset.id].name + ', position ' + (i + 1) + ' of ' + n);
    });
  }

  function render(order) {
    list.textContent = '';
    order.forEach(function (id) {
      var v = byId[id];
      var li = document.createElement('li');
      li.dataset.id = id;
      li.innerHTML = '<button type="button" class="handle" aria-describedby="keys">≡</button>'
        + '<span class="num"></span><span class="name"></span><span class="area"></span>';
      li.querySelector('.name').textContent = v.name;
      li.querySelector('.area').textContent = v.area;
      list.appendChild(li);
    });
    renumber();
  }

  function moved(li) {
    renumber();
    var pos = Array.prototype.indexOf.call(list.children, li) + 1;
    save('Saved. ' + byId[li.dataset.id].name + ' is now #' + pos + '.');
  }

  // ---- Dragging (Pointer Events cover mouse, touch and pen) ----
  var drag = null;

  list.addEventListener('pointerdown', function (e) {
    var li = e.target.closest('li');
    if (!li || e.button !== 0) return;
    var onHandle = !!e.target.closest('.handle');
    if (e.pointerType !== 'mouse' && !onHandle) return; // let touch scroll the page
    e.preventDefault(); // no text selection while dragging
    drag = { li: li, y: e.clientY, active: false, start: Array.prototype.indexOf.call(list.children, li) };
    list.setPointerCapture(e.pointerId); // the list never moves, so capture survives reordering
  });

  list.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.active) {
      if (Math.abs(e.clientY - drag.y) < 4) return; // a click, not a drag (yet)
      drag.active = true;
      drag.li.classList.add('dragging');
      document.body.classList.add('is-dragging');
    }
    // Drop before the first row whose middle is below the pointer.
    var before = null;
    for (var i = 0; i < list.children.length; i++) {
      var it = list.children[i];
      if (it === drag.li) continue;
      var r = it.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) { before = it; break; }
    }
    if (before !== drag.li.nextSibling && before !== drag.li) {
      list.insertBefore(drag.li, before);
      renumber();
    }
    // Scroll when dragging near the top or bottom edge of the screen.
    if (e.clientY < 48) window.scrollBy(0, -12);
    else if (e.clientY > window.innerHeight - 48) window.scrollBy(0, 12);
  });

  function endDrag() {
    if (!drag) return;
    var d = drag;
    drag = null;
    d.li.classList.remove('dragging');
    document.body.classList.remove('is-dragging');
    if (d.active && Array.prototype.indexOf.call(list.children, d.li) !== d.start) moved(d.li);
  }
  list.addEventListener('pointerup', endDrag);
  list.addEventListener('pointercancel', endDrag);
  list.addEventListener('lostpointercapture', endDrag);

  // ---- Keyboard ----
  list.addEventListener('keydown', function (e) {
    if (!e.target.classList.contains('handle')) return;
    var li = e.target.closest('li');
    var target;
    if (e.key === 'ArrowUp') target = li.previousElementSibling;
    else if (e.key === 'ArrowDown') target = li.nextElementSibling && li.nextElementSibling.nextElementSibling;
    else if (e.key === 'Home') target = list.firstElementChild;
    else if (e.key === 'End') target = null;
    else return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && !target) return; // already first
    if (e.key === 'ArrowDown' && !li.nextElementSibling) return; // already last
    if (target === li) return;
    list.insertBefore(li, target);
    e.target.focus();
    moved(li);
  });

  reset.addEventListener('click', function () {
    render(defaults);
    save('Back to A–Z.');
  });

  document.getElementById('nojs').hidden = true;
  list.hidden = false;
  reset.hidden = false;
  render(load());
  reset.disabled = currentOrder().join() === defaults.join();
})();
