(function () {
  'use strict';

  // Волна от нажатия на кнопки. Если у посетителя включено «уменьшить движение», ничего не делаем.
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) return;

  function wave(btn, x, y, size, extraClass) {
    var el = document.createElement('span');
    el.className = 'ripple' + (extraClass ? ' ' + extraClass : '');
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('animationend', function () { el.remove(); });
    btn.appendChild(el);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn, .socials a');
    if (!btn || btn.disabled) return;

    var box = btn.getBoundingClientRect();
    var x = e.clientX - box.left;
    var y = e.clientY - box.top;
    // Нажатие с клавиатуры (Enter, пробел) не имеет координат: волна идёт из центра кнопки.
    if (e.detail === 0 || (!e.clientX && !e.clientY)) { x = box.width / 2; y = box.height / 2; }

    var size = Math.max(box.width, box.height) * 2.6;
    wave(btn, x, y, size, '');
    wave(btn, x, y, size, 'ring');
  });
})();
