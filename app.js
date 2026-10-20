(function () {
  'use strict';

  // Адрес, куда уходят заявки. Пока пусто: форма честно говорит, что не подключена.
  var ENDPOINT = '';

  var form = document.getElementById('lead');
  var note = document.getElementById('note');
  var send = form.querySelector('button[type="submit"]');
  var openedAt = Date.now();

  function show(text, kind) {
    note.textContent = text;
    note.className = 'note ' + kind;
    note.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var contact = f.contact.value.trim();

    if (!name) { show('Укажите имя.', 'err'); f.name.focus(); return; }
    if (!contact) { show('Укажите телефон или Telegram, чтобы я мог ответить.', 'err'); f.contact.focus(); return; }
    if (!f.consent.checked) { show('Поставьте галочку согласия на обработку персональных данных.', 'err'); f.consent.focus(); return; }

    // Ловушка для роботов: человек не видит поле "website" и не успевает отправить форму за 2 секунды.
    if (f.website.value !== '' || Date.now() - openedAt < 2000) {
      show('Заявка принята. Свяжусь с вами и пришлю вопросы для брифа.', 'ok');
      return;
    }

    if (!ENDPOINT) {
      show('Приём заявок через форму скоро заработает. Пока напишите мне в Telegram или WhatsApp.', 'err');
      return;
    }

    send.disabled = true;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 10000);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.slice(0, 100),
        contact: contact.slice(0, 100),
        service: f.service.value,
        about: f.about.value.trim().slice(0, 1000)
      }),
      signal: ctrl.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
      .then(function (res) {
        if (!res.ok) { throw new Error('bad status'); }
        show('Заявка принята. Свяжусь с вами и пришлю вопросы для брифа.', 'ok');
        form.reset();
      })
      .catch(function () {
        show('Не удалось отправить заявку. Попробуйте ещё раз или напишите мне в Telegram.', 'err');
      })
      .then(function () {
        clearTimeout(timer);
        send.disabled = false;
      });
  });

  // Кнопки «Заказать» выбирают нужную услугу в форме.
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { form.elements.service.value = a.getAttribute('data-service'); });
  });

  // Шкала сроков растёт один раз, когда блок попадает в экран.
  var bars = document.getElementById('bars');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    bars.classList.add('pre');
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { bars.classList.remove('pre'); obs.disconnect(); }
      });
    }, { threshold: 0.4 }).observe(bars);
  }
})();
