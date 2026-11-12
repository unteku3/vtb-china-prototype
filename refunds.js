/* Screens for QR purchase history, account refunds, and payment failures. */
(function () {
  'use strict';

  const merchant = 'Магазин одежды Uniqlo, Шанхай';
  const paymentId = 'QR-20260512-0381';
  const mark = (name, size = 24) => {
    const paths = {
      shop: '<path d="M4 9h16v11H4zM3 9l2-6h14l2 6M3 9c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 20v-6h6v6"/>',
      refund: '<path d="M5 8h10a6 6 0 0 1 0 12h-4M5 8l5-5M5 8l5 5"/>',
      copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
      arrow: '<path d="m9 5 7 7-7 7"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      warning: '<path d="m12 3 10 18H2L12 3zM12 9v5M12 17h.01"/>',
      qr: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h6v6h-6zM3 12h6M12 3v6M12 12h3M12 18v3"/>',
      wifi: '<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01M3 3l18 18"/>',
      document: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  };
  const menuRow = (label, route, name = 'document') => `<button type="button" class="list-row" data-go="${route}" style="width:100%;display:flex;align-items:center;gap:12px;text-align:left"><span style="color:var(--blue)">${mark(name)}</span><span style="flex:1">${label}</span><span class="muted">${mark('arrow',18)}</span></button>`;
  const refundView = () => ({
    done: { route: 'refundDone', amount: '+11 050 ₽', detail: 'Возврат +11 050 ₽', rubles: true },
    yuan: { route: 'refundYuan', amount: '+850 ¥', detail: 'Возврат +850 ¥', rubles: false },
    partial: { route: 'refundPartial', amount: '+300 ¥', detail: 'Частичный возврат +300 ¥ из 850 ¥', rubles: false },
    pending: { route: 'refundPending', amount: '850 ¥', detail: 'Ожидается зачисление.', rubles: !!window.state.qrPaidWithRubles }
  }[window.state.refundStatus] || { route: 'refundPending', amount: '850 ¥', detail: 'Ожидается зачисление.', rubles: !!window.state.qrPaidWithRubles });
  const purchaseSummary = (rubles = refundView().rubles) => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><span style="display:grid;place-items:center;width:46px;height:46px;flex-shrink:0;border-radius:15px;background:var(--blue-soft);color:var(--blue)">${mark('shop')}</span><div><strong style="display:block;line-height:1.4">${merchant}</strong><div class="muted small" style="margin-top:4px">12 мая, 14:32</div></div></div><div style="font-size:26px;font-weight:700;letter-spacing:-.5px">${rubles ? '−11 050 ₽' : '−850 ¥'} <span style="font-size:16px;font-weight:400;color:var(--muted)">(${rubles ? '850 ¥' : '11 050 ₽'})</span></div><p class="small muted" style="margin:10px 0 0">${rubles ? 'Дебетовая карта •• 4821' : 'Накопительный счёт в юанях'}</p>`;
  const push = text => `<div role="status" style="display:flex;gap:10px;padding:15px;border:1px solid var(--line);border-radius:17px;background:var(--surface);box-shadow:0 5px 15px #0a335711;margin-bottom:16px"><strong style="display:grid;place-items:center;flex-shrink:0;align-self:flex-start;width:36px;height:36px;background:var(--blue);border-radius:9px;color:white;font-size:12px">ВТБ</strong><div style="font-size:14px;line-height:1.5">${text}</div></div>`;
  const failureScreen = (title, text, buttons, name = 'warning', pending = false) => {
    const { note, badge } = window.UI;
    return {
      title: 'Оплата по QR',
      html: `<div class="stack"><div class="hero" style="text-align:center;padding:24px 5px 12px"><span style="display:grid;place-items:center;width:76px;height:76px;border-radius:50%;margin:0 auto 22px;color:${pending ? 'var(--orange)' : 'var(--orange)'};background:${pending ? 'var(--warning-soft)' : 'var(--warning-soft)'}">${mark(name,36)}</span><h2 style="font-size:25px;line-height:1.2;margin:0">${title}</h2></div>${note(pending ? 'Деньги списаны, проверяем платёж' : 'Деньги не списаны', pending ? 'warning' : 'success')}<div style="display:flex;justify-content:flex-end">${badge()}</div><p style="font-size:16px;line-height:1.6;margin:0 0 14px">${text}</p>${buttons}</div>`
    };
  };

  Object.assign(window.screens, {
    history() {
      const { card, badge } = window.UI;
      const refund = refundView();
      const pending = refund.route === 'refundPending';
      return {
        title: 'История', nav: true,
        html: `<div class="stack"><div style="display:flex;align-items:center;justify-content:space-between"><h2 style="font-size:18px;margin:0">Операции в Китае</h2>${badge()}</div>${card(`<div class="muted small" style="margin-bottom:8px">12 мая</div><button type="button" class="list-row" data-go="purchase" style="display:flex;width:100%;gap:11px;text-align:left"><span style="color:var(--blue)">${mark('shop')}</span><span style="flex:1;line-height:1.45">${merchant}<span class="muted small" style="display:block">${refund.rubles ? 'Дебетовая карта •• 4821' : 'с юаневого счёта'}</span></span><strong style="white-space:nowrap">${refund.rubles ? '−11 050 ₽' : '−850 ¥'}</strong></button><button type="button" class="list-row" data-go="${refund.route}" style="display:flex;width:calc(100% - 34px);margin-left:34px;gap:11px;text-align:left"><span style="color:${pending ? 'var(--orange)' : 'var(--green)'}">${mark(pending ? 'clock' : 'refund')}</span><span style="flex:1;line-height:1.45">Возврат: магазин одежды<span class="muted small" style="display:block">${pending ? 'Ожидается зачисление.' : 'по покупке от 12 мая'}</span></span><strong style="white-space:nowrap;color:${pending ? 'var(--orange)' : 'var(--green)'}">${refund.amount}</strong></button><button type="button" class="list-row" data-action="restaurant" style="display:flex;width:100%;gap:11px;text-align:left"><span style="color:var(--blue)">${mark('shop')}</span><span style="flex:1">Ресторан, Пекин</span><strong style="white-space:nowrap">−320 ¥</strong></button>`)}${card(`${menuRow('Мои возвраты',refund.route,'refund')}${menuRow('Перевод 250 000 ¥','transferStatus','document')}`)}</div>`
      };
    },
    purchase() {
      const { card, badge } = window.UI;
      return {
        title: 'Покупка',
        html: `<div class="stack">${card(purchaseSummary())}${card(`<div class="small muted">Номер платежа:</div><button type="button" data-action="copyPaymentId" aria-label="Скопировать номер платежа" style="display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:12px 0;text-align:left;font-weight:600;color:var(--ink)"><span style="font-size:15px">${paymentId}</span><span style="color:var(--blue)">${mark('copy',20)}</span></button><p class="small muted" style="line-height:1.5;margin:0">Покажите номер продавцу, если хотите вернуть товар</p>`)}${card(`${menuRow('Как вернуть покупку','returnHelp','refund')}${menuRow('Проблема с оплатой','failureList','warning')}${menuRow('Чек','receipt','document')}`)}${card(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>Возвраты</strong>${badge()}</div>${menuRow(refundView().route === 'refundPending' ? 'Возврат в пути' : 'Возврат зачислен',refundView().route,'refund')}`)}</div>`
      };
    },
    returnHelp() {
      const { card, note, badge } = window.UI;
      const steps = [
        ['document','Покажите продавцу номер платежа или эту покупку в приложении.'],
        ['shop','Продавец оформит возврат в своём терминале на всю сумму или часть.'],
        ['refund','Деньги вернутся на ваш счёт по курсу покупки. Можно даже после возвращения домой.']
      ];
      return { title: 'Как вернуть покупку', html: `<div class="stack"><div style="display:flex;justify-content:flex-end">${badge()}</div>${card(steps.map(([icon,text],index) => `<div style="display:flex;gap:14px;padding:14px 0;${index < 2 ? 'border-bottom:1px solid var(--line)' : ''}"><div style="display:grid;place-items:center;flex-shrink:0;width:42px;height:42px;background:var(--blue-soft);color:var(--blue);border-radius:13px">${mark(icon)}</div><div style="line-height:1.55"><strong style="display:block;color:var(--muted);font-size:12px;margin-bottom:3px">${index + 1}</strong>${text}</div></div>`).join(''))}${note('Банк не может оформить возврат без согласия продавца.','info')}</div>` };
    },
    refundPending() {
      const { card, note, timeline, badge } = window.UI;
      return { title: 'Возврат в пути', html: `<div class="stack"><div style="display:flex;justify-content:flex-end">${badge()}</div>${card(`${purchaseSummary()}<div style="margin-top:20px;border-left:2px solid var(--orange);padding-left:13px">${note('Возврат 850 ¥ оформлен продавцом. Ожидается зачисление.','warning')}</div>`)}${card(`<div class="timeline-badge">${badge()}</div>${timeline([{label:'Продавец оформил возврат',status:'done'},{label:'Возврат передан в ВТБ',status:'active'},{label:'Зачислено на счёт',status:'waiting'}])}`)}</div>` };
    },
    refundDone() {
      const { card, timeline, badge, btn } = window.UI;
      return { title: 'Возврат зачислен', html: `<div class="stack">${push('ВТБ: возврат 850 ¥ по покупке в магазине Uniqlo зачислен на счёт. 11 050 ₽ по курсу покупки.')}${card(`${purchaseSummary(true)}<div style="display:flex;align-items:center;gap:10px;color:var(--green);margin-top:20px;border-left:2px solid var(--green);padding:12px 0 12px 13px"><span>${mark('refund',22)}</span><strong>Возврат +11 050 ₽</strong></div><p class="small muted" style="margin:8px 0 0">Зачислено на: Дебетовая карта •• 4821</p>`)}${card(`<div class="timeline-badge">${badge()}</div>${timeline([{label:'Продавец оформил возврат',status:'done'},{label:'Возврат передан в ВТБ',status:'done'},{label:'Зачислено на счёт',status:'done'}])}`)}${btn('Готово','history')}</div>` };
    },
    refundYuan() {
      const { card, timeline, badge, btn } = window.UI;
      return { title: 'Возврат зачислен', html: `<div class="stack">${push('ВТБ: возврат 850 ¥ по покупке в магазине Uniqlo зачислен на счёт.')}${card(`${purchaseSummary(false)}<div style="display:flex;align-items:center;gap:10px;color:var(--green);margin-top:20px;border-left:2px solid var(--green);padding:12px 0 12px 13px"><span>${mark('refund',22)}</span><strong>Возврат +850 ¥</strong></div><p class="small muted" style="margin:8px 0 0">Зачислено на: Накопительный счёт в юанях</p>`)}${card(`<div class="timeline-badge">${badge()}</div>${timeline([{label:'Продавец оформил возврат',status:'done'},{label:'Возврат передан в ВТБ',status:'done'},{label:'Зачислено на счёт',status:'done'}])}`)}${btn('Готово','history')}</div>` };
    },
    refundPartial() {
      const { card, badge, btn, timeline } = window.UI;
      return { title: 'Возврат зачислен', html: `<div class="stack"><div style="display:flex;justify-content:flex-end">${badge()}</div>${card(`${purchaseSummary(false)}<div style="display:flex;align-items:center;gap:10px;color:var(--green);margin-top:20px;border-left:2px solid var(--green);padding:12px 0 12px 13px"><span>${mark('refund',22)}</span><strong style="line-height:1.5">Частичный возврат +300 ¥ из 850 ¥</strong></div>`)}${card(`<div class="timeline-badge">${badge()}</div>${timeline([{label:'Продавец оформил возврат',status:'done'},{label:'Возврат передан в ВТБ',status:'done'},{label:'Зачислено на счёт',status:'done'}])}`)}${btn('Готово','history')}</div>` };
    },
    failureList() {
      const { card } = window.UI;
      return { title: 'Проблема с оплатой', html: `<div class="stack">${card(`${menuRow('Этот QR-код не поддерживается','failureA','qr')}${menuRow('Превышен месячный лимит','failureB','warning')}${menuRow('Нет ответа от платёжной системы','failureC','wifi')}${menuRow('Проверяем платёж','failureD','clock')}`)}</div>` };
    },
    failureA() {
      const { btn, actionBtn } = window.UI;
      return failureScreen('Этот QR-код не поддерживается', 'Это личный QR-код продавца. Попросите показать QR-код магазина или оплатите наличными.', `${actionBtn('Сканировать другой код','retryQrScan')}${btn('Где снять наличные','atms',true)}`, 'qr');
    },
    failureB() {
      const { btn } = window.UI;
      return failureScreen('Превышен месячный лимит', 'В этом месяце осталось 40 000 ₽. Разделите покупку или оплатите другим способом.', btn('Мои лимиты','limits'));
    },
    failureC() {
      const { actionBtn } = window.UI;
      return failureScreen('Нет ответа от платёжной системы', 'Повторите оплату через минуту.', actionBtn('Повторить','retryQrScan'), 'wifi');
    },
    failureD() {
      const { btn } = window.UI;
      return failureScreen('Проверяем платёж', 'Мы запросили статус у партнёра. Если платёж не дошёл, деньги вернутся автоматически. Не платите повторно, пока не придёт ответ.', btn('Написать в чат','chat'), 'clock', true);
    },
    receipt() {
      const { card, row, actionBtn } = window.UI;
      return { title: 'Чек', html: `<div class="stack">${card(`<div style="text-align:center;padding:8px 0 24px"><strong style="font-size:26px;color:var(--blue)">ВТБ</strong><h2 style="font-size:22px;margin:18px 0 8px">Оплачено 850 ¥</h2><div class="muted small">12 мая, 14:32</div></div>${row('Продавец',merchant)}${row('Списать с',window.state.qrPaidWithRubles ? 'Дебетовая карта •• 4821' : 'Накопительный счёт в юанях')}${window.state.qrPaidWithRubles ? row('Списано','11 050 ₽') : ''}${row('Комиссия','0 ₽')}<div class="divider"></div><div class="small muted" style="line-height:1.7;overflow-wrap:anywhere">Номер платежа: ${paymentId}</div>`)}${actionBtn('Скачать чек','downloadReceipt')}</div>` };
    }
  });

  Object.assign(window.actions, {
    retryQrScan() {
      window.state.scanMode = 'normal';
      window.go('scan');
    },
    async copyPaymentId() {
      try {
        await navigator.clipboard.writeText(paymentId);
        window.toast('Номер платежа скопирован');
      } catch (_) {
        window.showSheet('Номер платежа', `<p style="user-select:all;font-size:18px">${paymentId}</p><p class="muted small">Покажите номер продавцу, если хотите вернуть товар</p>`);
      }
    },
    downloadReceipt() {
      window.downloadFile('Чек_QR-20260512-0381.txt', `УЧЕБНЫЙ ПРОТОТИП. Не является банковским документом.\n\nВТБ\nОплачено 850 ¥\n${merchant}\n12 мая, 14:32\nСписать с: ${window.state.qrPaidWithRubles ? 'Дебетовая карта •• 4821' : 'Накопительный счёт в юанях'}\n${window.state.qrPaidWithRubles ? 'Списано: 11 050 ₽\n' : ''}Комиссия: 0 ₽\nНомер платежа: ${paymentId}\n`);
      window.toast('Чек скачан');
    }
  });
})();
