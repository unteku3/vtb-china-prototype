/* China transfer concept. Local state only; no bank connection. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getState = () => {
    const s = window.state;
    if (!s.transferPurpose) s.transferPurpose = 'Покупка автомобиля';
    if (s.transferMatched === undefined) s.transferMatched = true;
    if (!s.transferInvoice) s.transferInvoice = 'Invoice_BYD.pdf';
    return s;
  };
  const U = () => window.UI;
  const purposeOptions = ['Покупка автомобиля', 'Оплата товаров', 'Обучение', 'Лечение', 'Другое'];
  const purposeIcons = ['car', 'bag', 'book', 'heart', 'grid'];
  const cleanClose = () => { if (window.closeSheet) window.closeSheet(); };
  const upload = (accept, callback) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', () => { if (input.files && input.files[0]) callback(input.files[0]); });
    input.click();
  };
  const documentHtml = () => `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Документ об исполнении — ВТБ</title><style>:root{--blue:#1E4BD2;--ink:#2F3441;--muted:#596675;--line:#dce4ed}body{font-family:Arial,sans-serif;color:var(--ink);max-width:760px;margin:70px auto;padding:24px}h1{color:var(--blue);font-size:38px}.tag{color:var(--muted);font-size:14px}td{padding:16px 0;border-bottom:1px solid var(--line)}table{width:100%;border-collapse:collapse}td:last-child{text-align:right;font-weight:bold}</style><p class="tag">Учебный прототип · Не является банковским документом</p><h1>ВТБ</h1><h2>Документ об исполнении</h2><table><tr><td>Номер платежа</td><td>VTB-CN-7781245</td></tr><tr><td>Получатель</td><td>BYD AUTO CO., LTD.</td></tr><tr><td>Банк получателя</td><td>BANK OF CHINA</td></tr><tr><td>Сумма</td><td>250 000 ¥</td></tr><tr><td>Цель</td><td>${esc(getState().transferPurpose)}</td></tr><tr><td>Принят ВТБ</td><td>14 мая, 10:05</td></tr><tr><td>Отправлен в банк получателя</td><td>14 мая, 11:20</td></tr></table><p>Статус зачисления подтверждается отдельно банком получателя.</p></html>`;
  const statusButtons = () => `${U().actionBtn('Скачать документ об исполнении', 'transferDownload')}${U().actionBtn('Отправить продавцу', 'transferShare', true)}${U().btn('Вопрос по переводу', 'chat', true)}`;
  const transferTimeline = (mode = 'pending') => {
    const last = mode === 'received'
      ? { label: 'Зачислен продавцу', status: 'done' }
      : mode === 'docs'
      ? { label: 'Банк получателя запросил документы', status: 'active' }
      : mode === 'returned'
      ? { label: 'Платёж возвращён банком получателя', status: 'error' }
      : mode === 'unconfirmed'
      ? { label: 'Подтверждение от банка получателя пока не поступило', status: 'waiting', detail: U().icon('clock', 16) }
      : { label: 'Зачислен продавцу', status: 'waiting' };
    return `<div class="timeline-badge">${U().badge()}</div>` + U().timeline([
      { label: 'Принят ВТБ', detail: '14 мая, 10:05', status: 'done' },
      { label: 'Отправлен в банк получателя', detail: '14 мая, 11:20<br><span class="small">Номер платежа: VTB-CN-7781245</span>', status: 'done' },
      last
    ]);
  };

  Object.assign(window.screens, {
    transferPurpose: () => {
      const s = getState(), ui = U();
      return { title: 'Перевод в Китай по реквизитам', html: `<div class="stack">${ui.card(`<p class="muted small" style="margin:0 0 16px">Цель перевода</p>${purposeOptions.map((purpose, i) => `<button class="list-row purpose-option" type="button" data-action="transferSelectPurpose" data-purpose="${purpose}" aria-pressed="${s.transferPurpose === purpose}" style="width:100%;display:flex;gap:12px;align-items:center;text-align:left;padding:16px 0;border:0;border-bottom:1px solid var(--line);background:transparent;color:inherit;font:inherit">${ui.icon(purposeIcons[i], 22)}<span style="flex:1">${purpose}</span><span class="radio ${s.transferPurpose === purpose ? 'checked' : ''}" style="width:20px;height:20px;border-radius:50%;border:${s.transferPurpose === purpose ? '6px solid var(--blue)' : '1.5px solid var(--field-border)'}"></span></button>`).join('')}`)}<p class="muted">От цели зависит список документов. Правильные документы снижают риск задержки платежа.</p>${ui.btn('Далее', 'transferDocs')}</div>` };
    },
    transferDocs: () => {
      const s = getState(), ui = U(), car = s.transferPurpose === 'Покупка автомобиля';
      return { title: car ? 'Документы для покупки автомобиля' : 'Документы для перевода', html: `<div class="stack">${ui.card(`<div class="timeline-badge">${ui.badge()}</div><div class="row" style="align-items:flex-start"><span class="checkmark" style="color:var(--green)">✓</span><div style="flex:1"><strong>Договор купли-продажи или инвойс</strong><p class="small" style="color:var(--blue);margin-bottom:8px">${ui.icon('file', 16)} ${esc(s.transferInvoice)}</p><button class="text-button" data-action="transferUploadInvoice" type="button">Загрузить</button></div></div><div class="divider"></div><label style="display:flex;align-items:flex-start;gap:12px;line-height:1.5"><input type="checkbox" id="transfer-match" ${s.transferMatched ? 'checked' : ''} style="accent-color:var(--blue);width:19px;height:19px;flex-shrink:0;margin-top:2px">Получатель в договоре совпадает с получателем перевода</label>${car ? `<div class="divider"></div><div class="row" style="align-items:flex-start"><span style="color:${s.transferVin ? 'var(--green)' : 'var(--muted)'}">${s.transferVin ? '✓' : '○'}</span><div style="flex:1"><strong>VIN или данные автомобиля</strong>${s.transferVin ? `<p class="muted small" style="overflow-wrap:anywhere">${esc(s.transferVin)}</p>` : ''}<button class="text-button" data-action="transferAddVin" type="button">${s.transferVin ? 'Изменить' : 'Добавить'}</button></div></div>` : ''}`)}${ui.note('Банк проверит документы до отправки, чтобы банк продавца не вернул платёж.')}<p id="transfer-docs-error" class="small" role="alert" style="color:var(--red);margin:0"></p>${ui.actionBtn('Далее', 'transferDocsNext')}</div>` };
    },
    transferAmount: () => {
      const s = getState(), ui = U();
      return { title: 'Сумма и итог перевода', html: `<div class="stack">${ui.card(`<label class="muted small">Продавец получит</label>${ui.amount('250 000 ¥')}`)}${ui.card(`<div style="display:flex;align-items:center;justify-content:space-between"><h3 style="margin:0 0 14px">Итог</h3>${ui.badge()}</div>${ui.row('Сумма по курсу 13,00', '3 250 000 ₽')}${ui.row('Комиссия 1%', '32 500 ₽')}<div class="divider"></div>${ui.row('<strong>Спишется</strong>', '<strong>3 282 500 ₽</strong>')}<div class="note success" style="margin-top:14px;color:var(--green);padding:14px;background:var(--success-soft);border-radius:12px">✓ Продавец получит ровно 250 000 ¥</div>`)}<p class="muted small">Лимит переводов на зарубежные счета в этом месяце: осталось 640 000 $ из 1 000 000 $</p>${s.holiday ? ui.note('С 1 по 7 октября в Китае праздники. Зачисление может задержаться до 8 октября.', 'warning') : ''}${ui.btn('Продолжить', 'transferConfirm')}</div>` };
    },
    transferConfirm: () => {
      const s = getState(), ui = U();
      return { title: 'Подтверждение перевода', html: `<div class="stack">${ui.card(`<p class="muted small" style="margin-top:0">Получатель</p><h3 style="margin:0 0 7px">BYD AUTO CO., LTD.</h3><p class="muted small" style="margin:0">BANK OF CHINA</p>`)}${ui.card(`${ui.row('Продавец получит', '<strong>250 000 ¥</strong>')}${ui.row('Спишется', '<strong>3 282 500 ₽</strong>')}${ui.row('Цель', esc(s.transferPurpose))}`)}${ui.card(`<h3 style="margin-top:0">Приложенные документы</h3><p class="small">${ui.icon('file', 18)} ${esc(s.transferInvoice)}</p>${s.transferPurpose === 'Покупка автомобиля' ? `<p class="small" style="overflow-wrap:anywhere">${ui.icon('check', 18)} VIN или данные автомобиля${s.transferVin ? ': ' + esc(s.transferVin) : ''}</p>` : ''}`)}${ui.btn('Подтвердить кодом из СМС', 'transferSms')}</div>` };
    },
    transferSms: () => {
      const ui = U();
      return { title: 'Подтверждение перевода', html: `<div class="stack"><div class="hero"><div class="hero-icon">${ui.icon('shield', 40)}</div><h2>Подтвердить кодом из СМС</h2><p class="muted">Перевод 250 000 ¥</p></div>${ui.card(`<p class="small" style="margin:0">Демонстрация подтверждения</p><p class="muted small" style="margin-bottom:0">В учебном прототипе код из СМС не требуется.</p>`)}${ui.actionBtn('Подтвердить', 'transferSend')}${ui.btn('Отменить', 'transferConfirm', true)}</div>` };
    },
    transferStatus: () => {
      const ui = U();
      return { title: 'Перевод 250 000 ¥', html: `<div class="stack">${ui.card(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><strong>Статус перевода</strong></div>${transferTimeline()}`)}<p class="muted">Обычно в течение 1 рабочего дня. Мы сообщим, когда банк получателя подтвердит зачисление.</p>${statusButtons()}</div>` };
    },
    transferReceived: () => {
      const ui = U();
      return { title: 'Перевод 250 000 ¥', html: `<div class="stack"><div class="push-notification" role="status" style="display:flex;gap:10px;background:#fff;border:1px solid var(--line);padding:14px;border-radius:16px;font-size:14px;line-height:1.4"><strong style="color:var(--blue)">ВТБ</strong><span>ВТБ: перевод 250 000 ¥ зачислен продавцу.</span></div>${ui.note('Продавец получил 250 000 ¥. Можно сообщить дилеру.', 'success')}${ui.card(transferTimeline('received'))}${statusButtons()}</div>` };
    },
    transferDocsNeeded: () => {
      const s = getState(), ui = U();
      return { title: 'Перевод 250 000 ¥', html: `<div class="stack">${ui.card(transferTimeline('docs'))}${ui.card(`<div style="display:flex;justify-content:space-between;gap:10px"><h3 style="margin:0 0 16px">Загрузите до 17 мая: спецификация автомобиля</h3>${ui.badge()}</div>${s.transferSpecification ? `<p class="small" style="color:var(--green);overflow-wrap:anywhere">✓ ${esc(s.transferSpecification)}</p>` : ''}${ui.actionBtn('Загрузить', 'transferUploadSpec')}`)}<p class="muted">Ваш менеджер Анна свяжется с вами сегодня.</p>${ui.btn('Вопрос по переводу', 'chat', true)}</div>` };
    },
    transferReturned: () => {
      const ui = U();
      return { title: 'Перевод 250 000 ¥', html: `<div class="stack">${ui.card(transferTimeline('returned'))}${ui.card(`<div style="margin-bottom:16px">${ui.badge()}</div>${ui.row('Причина', 'банк получателя не принял платёж')}${ui.row('Возвращено', '<strong>3 230 000 ₽</strong>')}${ui.row('Удержано комиссий', '52 500 ₽')}${ui.row('Зачислено на', 'Дебетовая карта •• 4821')}`)}${ui.actionBtn('Что делать дальше', 'transferNextSteps')}${ui.btn('Связаться с банком', 'chat', true)}</div>` };
    },
    transferUnconfirmed: () => {
      const ui = U();
      return { title: 'Перевод 250 000 ¥', html: `<div class="stack">${ui.card(transferTimeline('unconfirmed'))}<p class="muted">Обычно подтверждение приходит в течение 1 рабочего дня. Мы продолжаем отслеживать перевод.</p>${ui.actionBtn('Запросить статус', 'transferAskStatus')}${ui.btn('Вопрос по переводу', 'chat', true)}</div>` };
    }
  });

  Object.assign(window.actions, {
    transferSelectPurpose: el => { getState().transferPurpose = el.dataset.purpose; window.render(); },
    transferAddVin: () => {
      window.showSheet('VIN или данные автомобиля', `<label class="small muted" for="transfer-vin">VIN или данные автомобиля</label><input id="transfer-vin" type="text" maxlength="120" value="${esc(getState().transferVin || '')}" style="width:100%;padding:15px;border:1px solid var(--field-border);border-radius:12px;font:inherit;margin:12px 0 18px" autocomplete="off">${U().actionBtn('Добавить', 'transferSaveVin')}`);
      setTimeout(() => document.getElementById('transfer-vin')?.focus(), 50);
    },
    transferSaveVin: () => {
      const input = document.getElementById('transfer-vin');
      const value = input?.value.trim();
      if (!value) { if (input) { input.style.borderColor = 'var(--red)'; input.focus(); } return; }
      getState().transferVin = value;
      cleanClose(); window.render();
    },
    transferUploadInvoice: () => upload('.pdf,.png,.jpg,.jpeg', file => { getState().transferInvoice = file.name; window.render(); window.toast('Документ загружен'); }),
    transferDocsNext: () => {
      const s = getState();
      const match = document.getElementById('transfer-match');
      if (match) s.transferMatched = match.checked;
      if (!s.transferMatched || (s.transferPurpose === 'Покупка автомобиля' && !s.transferVin)) {
        const target = document.getElementById('transfer-docs-error');
        if (target) target.textContent = !s.transferMatched ? 'Подтвердите совпадение получателя в договоре и переводе.' : 'Добавьте VIN или данные автомобиля.';
        return;
      }
      window.go('transferAmount');
    },
    transferSend: () => { getState().transferSent = true; window.go('transferStatus'); },
    transferDownload: () => { window.downloadFile('VTB-CN-7781245.html', documentHtml()); window.toast('Документ об исполнении скачан'); },
    transferShare: () => window.showSheet('Поделиться', `<p class="muted small">Номер платежа: VTB-CN-7781245</p>${U().actionBtn('Скопировать номер платежа', 'transferCopy', true)}${U().actionBtn('Скачать документ об исполнении', 'transferDownload', true)}`),
    transferCopy: async () => {
      try { await navigator.clipboard.writeText('VTB-CN-7781245'); window.toast('Номер платежа скопирован'); }
      catch { const input = document.createElement('textarea'); input.value = 'VTB-CN-7781245'; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.appendChild(input); input.select(); const ok = document.execCommand('copy'); input.remove(); window.toast(ok ? 'Номер платежа скопирован' : 'Номер платежа: VTB-CN-7781245'); }
    },
    transferUploadSpec: () => upload('.pdf,.png,.jpg,.jpeg', file => { getState().transferSpecification = file.name; window.render(); window.toast('Документ загружен'); }),
    transferAskStatus: () => { window.showSheet('Запросить статус', `<p>Подтверждение от банка получателя пока не поступило</p><p class="muted">Обычно подтверждение приходит в течение 1 рабочего дня. Мы продолжаем отслеживать перевод.</p>${U().btn('Вопрос по переводу', 'chat')}`); },
    transferNextSteps: () => window.showSheet('Что делать дальше', `<p>Причина: банк получателя не принял платёж</p><p class="muted">Номер платежа: VTB-CN-7781245</p>${U().btn('Связаться с банком', 'chat')}`)
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'transfer-match') getState().transferMatched = event.target.checked;
  });
})();
