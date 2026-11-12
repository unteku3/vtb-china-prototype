/* Existing banking context, reconstructed from VTB's public 2026 references.
   All forms are a local demonstration. No requests are sent to a bank. */
(() => {
  const U = window.UI;
  glyphs.phone = '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 18h2"/>';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => Number(value).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
  const labelRow = (text, route, name='chevron', detail='') => `<button class="list-row" data-go="${route}"><span class="circle-icon">${U.icon(name,22)}</span><span class="row-content">${text}${detail?`<small class="muted">${detail}</small>`:''}</span><span class="chevron">${U.icon('chevron',18)}</span></button>`;
  const field = (id,label,placeholder,value='',type='text',mode='text') => `<label class="bank-field" for="${id}"><span>${label}</span><input id="${id}" type="${type}" inputmode="${mode}" placeholder="${placeholder}" value="${escape(value)}" autocomplete="off"></label>`;
  const balances = () => `${U.card(`<p class="small muted">Дебетовая карта •• 4821</p><div class="bank-product"><div class="mini-card"><span>ВТБ</span><b>МИР</b></div><strong>${money(state.rubBalance)} ₽</strong></div>${labelRow('Пополнить счёт','bankTopup','arrowUp')}${labelRow('Перевести','payments','payments')}`)}${U.card(`<p class="small muted">Накопительный счёт в юанях</p><div class="bank-product"><span class="circle-icon">${U.icon('yuan')}</span><strong>${money(state.balance)} ¥</strong></div>${labelRow('Купить юани','buy','yuan')}${labelRow('Чем платить по QR-коду','sources','qr')}`)}`;
  const titleAndBadge = title => `<div class="feature-heading"><h3>${title}</h3>${U.badge()}</div>`;
  const baseService = (text,route,name) => `<button class="bank-service" data-go="${route}"><span class="bank-service-icon">${U.icon(name,25)}</span><span>${text}</span></button>`;
  const basicServices = () => `${baseService('Клиенту ВТБ','bankTransferPhone','user')}${baseService('В другой банк','bankTransferCard','payments')}${baseService('QR и оплата по фото','bankQr','qr')}${baseService('Оплата мобильного','bankMobile','phone')}`;
  const chinaTile = () => `<button id="china-tile" class="bank-service china-service" data-go="china"><span class="bank-service-icon"><span class="china-symbol">中</span></span><span>Китай</span>${!state.chinaSeen?'<span class="new-badge">Новое</span>':''}</button>`;
  const currentDraft = () => state.bankDraft || {kind:'phone',destination:'',amount:''};
  const formTitle = kind => ({phone:'По номеру телефона',card:'По номеру карты',mobile:'Оплата мобильного',topup:'Пополнить счёт'}[kind]);
  const startForm = kind => {
    const d = currentDraft().kind===kind ? currentDraft() : {kind,destination:'',amount:''};
    const topup=kind==='topup', card=kind==='card';
    return {title:formTitle(kind),html:`${U.card(`${topup?`<h3>Из другого банка</h3><p class="small muted">На Дебетовую карту •• 4821</p>`:field('bank-destination',card?'Номер карты':'Номер телефона',card?'Номер карты получателя':'+7 ___ ___-__-__',d.destination,'text',card?'numeric':'tel')}${field('bank-amount','Сумма','0 ₽',d.amount,'text','decimal')}<p id="bank-form-error" class="form-error" role="alert"></p>`)}${!topup?U.card(U.row('Списать с','Дебетовая карта •• 4821')+U.row('Доступно',`${money(state.rubBalance)} ₽`)):''}<button class="button" data-action="bankReview" data-kind="${kind}">Продолжить</button>`};
  };
  Object.assign(window.screens,{
    home:()=>({title:'Главная',home:true,nav:true,homeHeader:`<div class="bank-home-header"><button class="bank-profile-button" data-go="bankProfile" aria-label="Профиль">${U.icon('user',23)}</button><span class="bank-greeting">Добрый день!</span><button class="icon-button" data-go="search" aria-label="Поиск по приложению">${U.icon('search',23)}</button><button class="icon-button" data-go="bankNotifications" aria-label="Уведомления">${U.icon('bell',23)}</button></div>`,html:`<section class="bank-hero"><div class="bank-account-label"><span>Мастер-счёт в рублях</span><span class="bank-vtb">ВТБ</span></div><div class="bank-main-balance">${money(state.rubBalance)} <span>₽</span></div><p class="bank-account-card">Дебетовая карта •• 4821</p><div class="bank-hero-actions"><button class="bank-hero-tile bank-topup" data-go="bankTopup">${U.icon('arrowUp',22)}<span>Пополнить счёт</span></button><button class="bank-hero-tile bank-all-accounts" data-go="products"><span>Все мои счета<br>и продукты</span>${U.icon('wallet',27)}</button><button class="bank-hero-tile bank-benefit" data-go="bankBenefits">${U.icon('gift',23)}<span>Выгода</span></button></div></section><div class="bank-home-content"><section class="card bank-services"><div class="bank-section-heading"><h3>Платежи и переводы</h3><button class="icon-button" data-go="payments" aria-label="Все платежи и переводы">${U.icon('chevron',18)}</button></div><div class="bank-services-grid">${basicServices()}${chinaTile()}</div></section><section class="card bank-frequent"><div class="bank-section-heading"><h3>Частые операции</h3></div><div class="bank-frequent-grid"><button data-go="bankTopup"><span class="bank-contact self">Я</span><span>Себе</span></button><button data-go="bankTransferPhone"><span class="bank-contact">${U.icon('user',23)}</span><span>По телефону</span></button><button data-go="bankMobile"><span class="bank-contact phone">${U.icon('phone',23)}</span><span>Мобильный</span></button></div></section>${!state.bannerClosed&&Date.now()-Number(persisted.get('firstSeen'))<7*864e5?U.card(`<button class="banner-close" data-action="closeBanner" aria-label="Закрыть баннер">${U.icon('close',18)}</button><span class="new-badge">новое</span><h3>Едете в Китай?</h3><p>Проверьте готовность к поездке за минуту.</p>${U.link('Проверить','china')}<div class="travel-art">${U.icon('plane',64)}</div>`,'travel-banner bank-china-banner'):''}<div class="section-title">Всегда под рукой</div>${U.card(`${labelRow('Безопасность','bankSecurity','shield')}${labelRow('Выгода','bankBenefits','gift')}`)}</div>`}),
    payments:()=>({title:'Платежи',nav:true,html:`<button class="search-box" data-go="search">${U.icon('search',20)}<span>Поиск по приложению</span></button>${U.card(`<h3>Платежи и переводы</h3>${labelRow('По номеру телефона','bankTransferPhone','phone')}${labelRow('По номеру карты','bankTransferCard','card')}${labelRow('QR и оплата по фото','bankQr','qr')}${labelRow('Оплата мобильного','bankMobile','phone')}`)}<div class="section-title">За рубеж</div>${U.card(`<button class="list-row" data-go="china"><span class="circle-icon"><span class="china-symbol">中</span></span><span class="row-content">Китай: оплата и переводы</span>${U.badge()}<span class="chevron">${U.icon('chevron',18)}</span></button>${labelRow('Перевод по реквизитам','transferPurpose','file')}`)}`}),
    domesticPayments:()=>({title:'Переводы',nav:true,html:U.card(`${labelRow('По номеру телефона','bankTransferPhone','phone')}${labelRow('По номеру карты','bankTransferCard','card')}`)}),
    products:()=>({title:'Все мои счета и продукты',nav:true,html:`<div class="section-title">Счета и карты</div>${balances()}`}),
    bankTransferPhone:()=>startForm('phone'),
    bankTransferCard:()=>startForm('card'),
    bankMobile:()=>startForm('mobile'),
    bankTopup:()=>startForm('topup'),
    bankTransferConfirm:()=>{const d=currentDraft();const to=d.kind==='topup'?'Дебетовая карта •• 4821':d.kind==='card'?'Карта •• '+d.destination.replace(/\D/g,'').slice(-4):'Телефон •• '+d.destination.replace(/\D/g,'').slice(-4);return {title:d.kind==='topup'?'Подтверждение пополнения':'Подтверждение',html:`<div class="hero"><span class="hero-icon bank-blue-icon">${U.icon('payments',36)}</span>${U.amount(`${money(d.amount)} ₽`)}</div>${U.card(`${U.row(d.kind==='topup'?'Зачислить на':'Получатель',to)}${d.kind!=='topup'?U.row('Списать с','Дебетовая карта •• 4821'):''}`)}${U.actionBtn('Подтвердить','bankSubmit')}${U.btn('Отменить','payments',true)}`};},
    bankTransferDone:()=>{const d=state.bankLastOperation||currentDraft();return {title:d.kind==='topup'?'Счёт пополнен':d.kind==='mobile'?'Оплата прошла':'Перевод выполнен',html:`<div class="hero"><span class="hero-icon">${U.icon('check',38)}</span><h2>${d.kind==='topup'?'Счёт пополнен':d.kind==='mobile'?'Оплачено':'Перевод выполнен'}</h2>${U.amount(`${money(d.amount||0)} ₽`)}</div>${U.btn('Готово',d.kind==='topup'?'home':'payments')}`};},
    bankBenefits:()=>({title:'Выгода',nav:true,navKey:'products',html:`${U.card(`<div class="bank-benefit-heading"><span class="circle-icon">${U.icon('gift',28)}</span><h3>Кэшбэк</h3></div><p class="muted">Категории и предложения</p>${U.actionBtn('Посмотреть предложения','bankBenefitInfo',true)}`)}${U.card(labelRow('Мои счета и продукты','products','wallet'))}`}),
    bankProfile:()=>({title:'Профиль',html:`${U.card(`${labelRow('Мои счета и продукты','products','wallet')}${labelRow('Безопасность','bankSecurity','shield')}${labelRow('Уведомления','bankNotifications','bell')}${labelRow('Чат с банком','chat','chat')}`)}`}),
    bankSecurity:()=>({title:'Безопасность',html:`${U.card(`<div class="bank-benefit-heading"><span class="circle-icon">${U.icon('shield',28)}</span><h3>Безопасность</h3></div>${labelRow('Связаться с банком','chat','chat')}`)}`}),
    bankNotifications:()=>({title:'Уведомления',html:`${U.card(`${labelRow('Возврат зачислен','refundDone','refund')}${labelRow('Перевод зачислен продавцу','transferReceived','payments')}`)}`}),
    bankQr:()=>({title:'QR и оплата по фото',html:`${U.card(`<div class="bank-benefit-heading"><span class="circle-icon">${U.icon('qr',28)}</span><h3>Оплата по QR-коду</h3></div><p class="muted">Выберите, где хотите оплатить покупку</p>${labelRow('В России','bankQrDomestic','qr')}${labelRow('Китай: оплата и переводы','china','plane')}`)}`}),
    bankQrDomestic:()=>({title:'Оплата по QR-коду',html:`<div class="hero"><span class="hero-icon bank-blue-icon">${U.icon('qr',38)}</span><h2>Сканирование QR-кода</h2></div>${U.actionBtn('Загрузить QR из галереи','bankQrUpload')}${U.btn('Назад','bankQr',true)}<input id="bank-qr-file" type="file" accept="image/*" hidden>`})
  });
  // Only model additions are tagged. Existing bank surfaces keep their ordinary labels.
  for(const id of ['china','payConfirm','payMixed','sources','largePayment']){
    const original=screens[id];
    screens[id]=()=>{const d=original();if(id==='china')d.html=d.html.replace('<h3>Готовность к поездке</h3>',titleAndBadge('Готовность к поездке'));else d.html=`<div class="screen-feature-marker">${U.badge()}</div>`+d.html;return d;};
  }
  Object.assign(actions,{
    existingTopup:()=>go('bankTopup'),cashback:()=>go('bankBenefits'),notifications:()=>go('bankNotifications'),
    bankReview:el=>{
      const kind=el.dataset.kind;
      const amount=Number((document.getElementById('bank-amount')?.value||'').replace(/[\s₽]/g,'').replace(',','.'));
      const destination=document.getElementById('bank-destination')?.value.trim()||'';
      const digits=destination.replace(/\D/g,'');
      let error='';
      if(kind!=='topup'&&(kind==='card'?!/^\d{16,19}$/.test(digits):!/^\d{10,11}$/.test(digits)))error=kind==='card'?'Проверьте номер карты.':'Проверьте номер телефона.';
      else if(!Number.isFinite(amount)||amount<=0)error='Введите сумму больше нуля.';
      else if(kind!=='topup'&&amount>state.rubBalance)error='Недостаточно рублей на выбранном счёте.';
      state.bankDraft={kind,destination,amount:document.getElementById('bank-amount').value};
      if(error){document.getElementById('bank-form-error').textContent=error;return;}
      state.bankDraft.amount=amount;state.bankDraft.confirmed=false;go('bankTransferConfirm');
    },
    bankSubmit:()=>{
      const d=currentDraft();if(d.confirmed||!Number.isFinite(d.amount)||d.amount<=0)return;
      if(d.kind!=='topup'&&d.amount>state.rubBalance){toast('Недостаточно рублей на выбранном счёте.');return;}
      d.confirmed=true;state.rubBalance+=d.kind==='topup'?d.amount:-d.amount;state.bankLastOperation={...d,destination:undefined};
      go('bankTransferDone');
    },
    bankBenefitInfo:()=>showSheet('Выгода',`${U.card('<p>Кэшбэк и предложения</p>')}<p class="muted">Персональные предложения не подключены в учебном прототипе.</p>${U.actionBtn('Готово','closeSheet')}`),
    bankQrUpload:()=>document.getElementById('bank-qr-file').click()
  });
  document.addEventListener('input',event=>{
    if(['bank-destination','bank-amount'].includes(event.target.id)){
      const kind={bankTransferPhone:'phone',bankTransferCard:'card',bankMobile:'mobile',bankTopup:'topup'}[state.route];
      if(kind)state.bankDraft={kind,destination:document.getElementById('bank-destination')?.value||'',amount:document.getElementById('bank-amount')?.value||''};
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='bank-qr-file'&&event.target.files.length){showSheet('QR и оплата по фото',`${U.note('Изображение выбрано. Распознавание российских QR-кодов не подключено в учебном прототипе.')}<p class="small muted">Файл остаётся на вашем устройстве.</p>${U.actionBtn('Готово','closeSheet')}`);}
  });
})();
