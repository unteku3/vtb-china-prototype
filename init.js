const groups = [
 {title:'Знакомство',caption:'ЗНАКОМСТВО',description:'После обновления — три коротких слайда о новых возможностях. В следующий раз откроется привычная главная.',screens:[['intro1','Что нового · 1'],['intro2','Что нового · 2'],['intro3','Что нового · 3'],['coach','Подсказка на главной'],['banner','Баннер на главной']]},
 {title:'ВТБ Онлайн → Китай',caption:'ВНУТРИ ПРИВЫЧНОГО ПРИЛОЖЕНИЯ',description:'Три точки входа: плитка на главной, раздел «За рубеж» в платежах и поиск. Нижняя навигация приложения сохраняется.',screens:[['home','Главная ВТБ Онлайн'],['payments','Платежи · За рубеж'],['search','Поиск по приложению'],['china','Главная раздела «Китай»']]},
 {title:'Оплата юанями',caption:'ДО ПОЕЗДКИ → В ПОЕЗДКЕ',description:'Юани покупаются заранее. При оплате по QR видны источник списания, комиссия и остаток.',screens:[['buy','Купить юани'],['sources','Источник оплаты'],['scan','Сканировать QR'],['payConfirm','Подтверждение оплаты'],['payMixed','Доплата рублями'],['payDone','Оплата прошла']]},
 {title:'Возвраты и отказы',caption:'В ПОЕЗДКЕ → ПОСЛЕ ПОЕЗДКИ',description:'Возврат связан с исходной покупкой. При отказе сначала понятно, что произошло с деньгами, затем — что делать.',screens:[['purchase','Покупка в истории'],['returnHelp','Как вернуть покупку'],['refundPending','Возврат в пути'],['refundDone','Возврат зачислен · ₽'],['refundYuan','Возврат зачислен · ¥'],['refundPartial','Частичный возврат'],['failureA','Отказ · QR не поддерживается'],['failureB','Отказ · месячный лимит'],['failureC','Отказ · нет связи'],['failureD','Платёж проверяется'],['largePayment','Перед крупной покупкой']]},
 {title:'Крупный перевод',caption:'ПЕРЕВОД ПРОДАВЦУ В КИТАЙ',description:'От цели и документов до подтверждения зачисления. До отправки видна точная сумма, которую получит продавец.',screens:[['transferPurpose','Цель перевода'],['transferDocs','Документы'],['transferAmount','Сумма и итог'],['transferConfirm','Подтверждение'],['transferStatus','Отправлен в банк'],['transferReceived','Зачислен продавцу'],['transferDocsNeeded','Нужны документы'],['transferReturned','Возвращён'],['transferUnconfirmed','Нет подтверждения']]},
 {title:'Схема переходов',caption:'ОБЗОР ПУТЕЙ КЛИЕНТА',description:'Общий маршрут и ответвления. Каждый узел полной схемы открывает соответствующий экран.',screens:[['overview','Обзорный экран']]}
];
const screenOrder=groups.flatMap(g=>g.screens.map(s=>s[0]));
// Keep keyboard focus stable across local state updates, and isolate modal dialogs from the page.
let renderedRoute=null;
let activeModal=null;
let modalReturn=null;
let modalInert=[];
const focusableSelector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
function captureFocus(el=document.activeElement){
 if(!el||el===document.body)return null;
 return {element:el,id:el.id,tag:el.tagName,name:el.name,type:el.type,dataset:Object.fromEntries(Object.entries(el.dataset).filter(([key])=>key!=='busy')),value:el.value,start:el.selectionStart,end:el.selectionEnd};
}
function focusMatches(snapshot,scope=document){
 if(!snapshot)return null;
 if(snapshot.element?.isConnected&&scope.contains(snapshot.element))return snapshot.element;
 if(snapshot.id){const byId=document.getElementById(snapshot.id);if(byId&&scope.contains(byId))return byId;}
 const keys=Object.keys(snapshot.dataset||{});
 return [...scope.querySelectorAll(focusableSelector)].find(el=>el.tagName===snapshot.tag&&((keys.length&&keys.every(k=>el.dataset[k]===snapshot.dataset[k]))||(snapshot.name&&el.name===snapshot.name&&el.value===snapshot.value)))||null;
}
function restoreFocus(snapshot,scope=document){
 const el=focusMatches(snapshot,scope);if(!el||el.closest('[inert]'))return false;
 if(['INPUT','TEXTAREA'].includes(el.tagName)&&!['checkbox','radio','file','button','submit'].includes(el.type)&&snapshot.value!==undefined)el.value=snapshot.value;
 el.focus({preventScroll:true});
 if(snapshot.start!==null&&snapshot.start!==undefined&&el.setSelectionRange)try{el.setSelectionRange(snapshot.start,snapshot.end);}catch{}
 return true;
}
function focusHeading(){const el=document.querySelector('#phone-header h1,#phone-header h2,#phone-header [data-screen-heading]')||document.getElementById('screen');el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
function modalFocusable(modal){return [...modal.querySelectorAll(focusableSelector)].filter(el=>!el.closest('[inert]')&&el.getClientRects().length>0);}
window.releaseModal=(restore=true)=>{
 const previous=modalReturn;activeModal=null;modalReturn=null;
 for(const [el,wasInert] of modalInert)el.inert=wasInert;modalInert=[];
 if(restore&&!restoreFocus(previous))focusHeading();
};
window.activateModal=(modal,options={})=>{
 if(!modal)return;
 const returning=options.returnSnapshot||captureFocus(options.returnTarget||document.activeElement);
 releaseModal(false);activeModal=modal;modalReturn=returning;
 modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('tabindex','-1');
 let child=modal;
 while(child&&child!==document.body){for(const sibling of child.parentElement?.children||[]){if(sibling!==child){modalInert.push([sibling,sibling.inert]);sibling.inert=true;}}child=child.parentElement;}
 if(!restoreFocus(options.focusSnapshot,modal)){const first=modal.querySelector('h1,h2,h3')||modalFocusable(modal)[0]||modal;first.setAttribute('tabindex',first.matches('h1,h2,h3')?'-1':first.getAttribute('tabindex')||'0');first.focus({preventScroll:true});}
};
function syncModalAfterRender(snapshot,returnSnapshot){
 const modal=document.querySelector('.sheet,.onboarding,.coach-bubble');
 if(modal)activateModal(modal,{focusSnapshot:snapshot,returnSnapshot});
}
function currentId(){return state.onboard?'intro'+(state.slide+1):state.coach?'coach':state.route;}
function activeGroup(){return groups.findIndex(g=>g.screens.some(s=>s[0]===currentId()));}
function stepScreen(direction){let idx=screenOrder.indexOf(currentId());go(screenOrder[(idx+direction+screenOrder.length)%screenOrder.length]);}
function isExistingBankContext(){
 return !state.onboard&&!state.coach&&(state.route.startsWith('bank')||['domesticPayments','products'].includes(state.route));
}
function renderNavigation(){
 const bankContext=isExistingBankContext();
 let idx=activeGroup();
 if(idx<0)idx=state.route.startsWith('transfer')?4:bankContext?1:['history','receipt','failureList'].includes(state.route)?3:2;
 document.getElementById('screen-nav').innerHTML=groups.map((g,i)=>`<div class="nav-group"><button class="nav-group-toggle ${idx===i?'active':''}" data-go="${g.screens[0][0]}"><span class="group-num">0${i+1}</span>${g.title}${icon('chevron',14)}</button>${idx===i?`<div class="nav-children">${g.screens.map(([id,t])=>`<button class="nav-child ${id===currentId()?'active':''}" data-go="${id}">${t}</button>`).join('')}</div>`:''}</div>`).join('');
 document.getElementById('screen-kicker').textContent=bankContext?'ОБЫЧНЫЕ БАНКОВСКИЕ СЦЕНАРИИ':groups[idx].caption;
 document.getElementById('context-title').textContent=bankContext?'ВТБ Онлайн':groups[idx].title;
 document.getElementById('context-description').textContent=bankContext?'Счета, переводы по России, пополнение и оплата мобильного. Формы работают в учебном режиме.':groups[idx].description;
 const n=screenOrder.indexOf(currentId());
 document.getElementById('screen-count').textContent=n>=0?`${String(n+1).padStart(2,'0')} / ${screenOrder.length}`:'Дополнительный экран';
 renderControls(idx);
}
const opt=(label,id)=>`<button class="demo-option ${currentId()===id?'selected':''}" data-go="${id}">${label}</button>`;
function renderControls(idx){let h='';if(idx===0){h=`<div class="demo-title">ПЕРВОЕ ЗНАКОМСТВО</div>${opt('Показать обновление','intro1')}${opt('Подсказка на главной','coach')}${opt('Баннер перед поездкой','banner')}`;}
 if(idx===1){h=`<div class="demo-title">ГОТОВНОСТЬ К ПОЕЗДКЕ</div><button class="demo-option ${state.balance>0?'selected':''}" data-action="setBalance" data-balance="10000">Юани куплены · 10 000 ¥</button><button class="demo-option ${state.balance===0?'selected':''}" data-action="setBalance" data-balance="0">Перед покупкой · 0 ¥</button><p class="small muted" style="font-size:10px;margin-top:9px">Два состояния счёта из задания показаны последовательно.</p>`;}
 if(idx===2 || state.route==='largePayment'){h=`<div class="demo-title">СЦЕНАРИЙ QR-ОПЛАТЫ</div>${[['normal','Оплата с юаневого счёта'],['mixed','Юаней не хватает · доплата'],['large','Крупная покупка'],['failureA','Неподдерживаемый QR-код'],['failureB','Месячный лимит'],['failureC','Нет связи'],['failureD','Платёж проверяется']].map(([mode,t])=>`<button class="demo-option ${state.scanMode===mode?'selected':''}" data-action="setScan" data-mode="${mode}">${t}</button>`).join('')}<p class="small muted" style="font-size:10px;margin-top:10px">Для демонстрации сканирования нажмите на QR-код. Загруженное изображение запускает выбранный сценарий.</p>`;}
 if(idx===3 && state.route!=='largePayment'){h=`<div class="demo-title">СОСТОЯНИЕ ВОЗВРАТА</div>${opt('В пути','refundPending')}${opt('Зачислен в рублях · курс покупки','refundDone')}${opt('Зачислен в юанях · 850 ¥','refundYuan')}${opt('Частичный · 300 ¥','refundPartial')}<p class="small muted" style="font-size:10px;margin-top:10px">Валюта возврата соответствует источнику исходной оплаты. Ветки показывают разные покупки.</p>`;}
 if(idx===4){h=`<div class="demo-title">СОСТОЯНИЕ ПЕРЕВОДА</div>${opt('Отправлен в банк получателя','transferStatus')}${opt('Зачислен продавцу','transferReceived')}${opt('Запрошены документы','transferDocsNeeded')}${opt('Возвращён','transferReturned')}${opt('Подтверждение не поступало','transferUnconfirmed')}<label class="demo-check"><input id="holiday-mode" type="checkbox" ${state.holiday?'checked':''}>Перед праздниками в Китае</label><p class="small muted" style="font-size:10px;margin-top:12px">Получатель и банк — демонстрационные. Для подтверждения реальная СМС не нужна.</p>`;}
 if(idx===5){h=`<div class="demo-title">ПОЛНАЯ СХЕМА</div><button class="demo-option" data-action="openMap">Открыть на весь экран</button>`;}
 if(isExistingBankContext()){
   h=`<div class="demo-title">ПРИМЕР В РУБЛЯХ</div><p class="small muted">Дебетовая карта •• 4821</p><p class="bank-context-balance">Доступно: ${fmt(state.rubBalance)} ₽</p>${opt('Перевод по телефону','bankTransferPhone')}${opt('Перевод по карте','bankTransferCard')}${opt('Пополнить счёт','bankTopup')}${opt('Оплатить мобильный','bankMobile')}`;
 }
 document.getElementById('demo-controls').innerHTML=h?`<div class="demo-block">${h}</div>`:'';
 const portable=document.getElementById('portable-controls');portable.innerHTML=h?`<div class="demo-block">${h.replace('id="holiday-mode"','id="portable-holiday-mode"')}</div>`:'';
 document.getElementById('portable-screen').innerHTML=groups.map(g=>`<optgroup label="${g.title}">${g.screens.map(([id,t])=>`<option value="${id}" ${id===currentId()?'selected':''}>${t}</option>`).join('')}</optgroup>`).join('');
}
function renderOnboarding(){const slide=state.slide;const titles=['В ВТБ Онлайн появилась вкладка «Китай»','Платите юанями, которые купили заранее','Возвраты на счёт и статусы переводов'];const descriptions=['Всё для поездок и платежей в Китай теперь в одном месте: юани, оплата по QR-коду, возвраты и переводы продавцам.','Купите юани до поездки и платите по QR-коду без конвертации. Бюджет поездки известен заранее.','Возврат покупки придёт на счёт, а не наличными. Крупный перевод в Китай можно отследить до зачисления.'];const art=[`<div class="mini-phone"><div class="mini-bank-hero" style="background:var(--navy);border-radius:13px;padding:11px 10px;margin:-6px -3px 13px;color:#fff"><div class="mini-phone-header" style="color:#fff"><span>ВТБ</span><span>●</span></div><div style="font-size:9px;margin-top:15px;color:#d4e2f9">Мастер-счёт</div><b style="display:block;font-size:20px;letter-spacing:-.6px;margin:5px 0 12px">245 300 ₽</b><div style="display:flex;gap:5px"><span style="height:16px;background:#ffffff24;border-radius:4px;flex:1"></span><span style="height:16px;background:#ffffff24;border-radius:4px;flex:1"></span></div></div><div class="mini-services"><i></i><i></i><i></i><i>中</i></div><div class="mini-banner"></div></div><div class="floating-china"><span class="new-badge">Новое</span><span class="china-symbol">中</span><span>Китай</span></div>`,`<div class="qr-art">${qrGraphic(133)}</div><div class="coin-art">¥</div>`,`<div class="return-art">${icon('refund',177)}</div><div class="check-art">${icon('check',42)}</div>`];document.getElementById('overlay').innerHTML=`<section class="onboarding" role="dialog" aria-modal="true" aria-label="Что нового"><div class="onboard-top"><span>Что нового</span><button data-action="skipIntro">Пропустить ${icon('close',17)}</button></div><div class="onboard-art"><div class="art-blob"></div>${art[slide]}</div><h2>${titles[slide]}</h2><p>${descriptions[slide]}</p><div class="onboard-footer"><div class="onboard-dots">${titles.map((_,i)=>`<button class="${slide===i?'active':''}" data-action="introDot" data-slide="${i}" aria-label="Слайд ${i+1}" aria-current="${slide===i?'step':'false'}"></button>`).join('')}</div>${slide<2?actionBtn('Далее','nextIntro'):actionBtn('Открыть вкладку «Китай»','finishIntro')}${slide===2?'<button class="onboard-later" data-action="laterIntro">Посмотрю позже</button>':''}</div></section>`;const onboard=document.querySelector('.onboarding');let x=0;onboard.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX;},{passive:true});onboard.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>45){state.slide=Math.min(2,Math.max(0,state.slide+(dx<0?1:-1)));render();}},{passive:true});}
function renderCoach(){document.getElementById('overlay').innerHTML=`<div class="coach-shade"></div><div class="coach-bubble" role="dialog" aria-modal="true" aria-label="Новая вкладка «Китай»" tabindex="-1"><p>Вкладка «Китай» теперь здесь. Загляните перед поездкой.</p>${actionBtn('Понятно','dismissCoach')}</div>`;const tile=document.getElementById('china-tile');tile?.classList.add('coach-highlight');if(tile){const tileRect=tile.getBoundingClientRect();const phoneRect=document.getElementById('phone').getBoundingClientRect();document.querySelector('.coach-bubble').style.top=(tileRect.bottom-phoneRect.top+20)+'px';}}
window.render = () => {
 const snapshot=captureFocus();const previousReturn=modalReturn;const changed=renderedRoute!==state.route;const screen=document.getElementById('screen');const scrollTop=changed?0:screen.scrollTop;const sheetMarkup=!changed?document.querySelector('.sheet-shade')?.outerHTML||'':'';const openDetails=!changed?[...screen.querySelectorAll('details')].map(el=>el.open):[];releaseModal(false);const def=screens[state.route]();document.getElementById('phone').classList.toggle('camera-mode',!!def.dark);document.getElementById('phone').classList.toggle('bank-home',!!def.home);
 document.getElementById('status-bar').innerHTML=`<span>12:30</span><span class="status-icons"><svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="2.5" height="4" rx=".6"/><rect x="4" y="5" width="2.5" height="7" rx=".6"/><rect x="8" y="2" width="2.5" height="10" rx=".6"/><rect x="12" width="2.5" height="12" rx=".6"/></svg><svg width="16" height="13" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 5a11 11 0 0 1 14 0M5 8a6 6 0 0 1 8 0M8 11h2"/></svg><svg width="24" height="13" viewBox="0 0 26 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="21" height="12" rx="3" stroke="currentColor" stroke-width="1" opacity=".5"/><rect x="3" y="3" width="17" height="8" rx="1.5" fill="currentColor"/><path d="M24 5v4" stroke="currentColor" stroke-width="2"/></svg></span>`;
 document.getElementById('phone-header').innerHTML=def.homeHeader||(def.home?`<div class="header-home"><span class="avatar">${icon('user',21)}</span><span class="greeting">Добрый день!</span><span class="wordmark">ВТБ</span><button class="icon-button" data-action="notifications" aria-label="Уведомления">${icon('bell',22)}</button></div>`:`<div class="phone-header"><button class="icon-button" data-action="back" aria-label="Назад">${icon('back',23)}</button><h2 class="${def.title.length>20?'long-title':''}">${def.title}</h2>${def.headerAction||''}</div>`);
 if(def.home){const greeting=document.querySelector('#phone-header .bank-greeting,#phone-header .greeting');if(greeting){greeting.setAttribute('role','heading');greeting.setAttribute('aria-level','1');greeting.setAttribute('data-screen-heading','');}}
 screen.innerHTML=def.html;screen.setAttribute('aria-label',def.title);screen.setAttribute('tabindex','-1');screen.scrollTop=scrollTop;[...screen.querySelectorAll('details')].forEach((el,i)=>{if(openDetails[i])el.open=true;});if(changed){screen.classList.remove('animate');void screen.offsetWidth;screen.classList.add('animate');}
 document.getElementById('bottom-nav').innerHTML=def.nav?`<nav class="bottom-nav" aria-label="Навигация ВТБ Онлайн">${[['home','Главная','home'],['payments','Платежи','payments'],['products','Продукты','grid'],['history','История','history'],['chat','Чат','chat']].map(([id,t,ic])=>`<button class="${(def.navKey||state.route)===id||(state.route==='china'&&id==='home')?'active':''}" data-go="${id}" data-top-level="true">${icon(ic,22)}${t}</button>`).join('')}</nav>`:'';
 document.getElementById('overlay').innerHTML=sheetMarkup;if(state.onboard)renderOnboarding();else if(state.coach)renderCoach();renderNavigation();
 document.title=(state.onboard?'Что нового':def.title)+' · ВТБ Онлайн — учебный прототип';
 renderedRoute=state.route;
 if(document.querySelector('.sheet,.onboarding,.coach-bubble'))syncModalAfterRender(snapshot,previousReturn||snapshot);else if(changed||!restoreFocus(snapshot))focusHeading();
};
actions.notifications=actions.notifications||(()=>showSheet('Уведомления',`${listRow('Возврат зачислен','refundDone','refund')}${listRow('Перевод зачислен продавцу','transferReceived','payments')}`));
actions.togglePortable=()=>{const p=document.getElementById('portable-controls');p.hidden=!p.hidden;};
function openMap(){const node=(t,id,sub='',accent=false)=>`<button class="map-node ${accent?'accent':''}" data-action="mapGo" data-target="${id}">${t}${sub?`<small>${sub}</small>`:''}</button>`;const branch=items=>`<div class="map-branch">${items.map(([t,id])=>`<button data-action="mapGo" data-target="${id}">↳ ${t}</button>`).join('')}</div>`;const modal=document.getElementById('map-modal');modal.innerHTML=`<div class="map-header"><div><div class="eyebrow">ВТБ ОНЛАЙН / КИТАЙ</div><h2>Один раздел. Весь путь клиента.</h2><p>Нажмите на любой экран, чтобы перейти к нему в прототипе.</p></div><button class="studio-button" data-action="closeMap">Закрыть ✕</button></div><div class="map-content"><div class="map-lane"><div class="map-lane-title">Знакомство</div>${node('Что нового','intro1','Три слайда после обновления')}${node('Главная ВТБ Онлайн','home','Новая плитка в ряду сервисов')}${node('Китай','china','Готовность, баланс и быстрые действия',true)}<div>${node('Другие точки входа','payments')}${branch([['Платежи → За рубеж','payments'],['Поиск: Китай / юани / QR','search']])}</div></div><div class="map-lane"><div class="map-lane-title">01 / До поездки</div>${node('Китай','china','Готовность к поездке',true)}${node('Купить юани','buy','Курс фиксируется при покупке')}${node('Юани зачислены','buyDone','Накопительный счёт в юанях')}${node('Источник QR-оплаты','sources','Юани → рубли / рубли / юани')}</div><div class="map-lane"><div class="map-lane-title">02 / В поездке</div>${node('Сканировать QR','scan') }<div>${node('Подтвердить оплату','payConfirm')}${branch([['Доплата рублями','payMixed'],['Напоминание о возврате','largePayment']])}</div>${node('Оплата прошла','payDone','Чек и номер платежа')}<div>${node('Причина отказа','failureList')}${branch([['Личный QR → другой код','failureA'],['Лимит → мои лимиты','failureB'],['Связь → повторить','failureC'],['Списано → чат','failureD']])}</div></div><div class="map-lane"><div class="map-lane-title">03 / После поездки</div>${node('Покупка в истории','purchase')}${node('Как вернуть покупку','returnHelp','Возврат оформляет продавец')}${node('Возврат в пути','refundPending')}<div>${node('Возврат зачислен','refundDone','Связан с исходной покупкой',true)}${branch([['Возврат в юанях','refundYuan'],['Частичный возврат','refundPartial']])}</div></div><div class="map-lane"><div class="map-lane-title">04 / Крупный перевод</div>${node('Выбор цели','transferPurpose')}${node('Документы','transferDocs','Инвойс, получатель, автомобиль')}${node('Сумма и итог','transferAmount','Ровно 250 000 ¥ продавцу')}${node('Подтверждение','transferConfirm')}</div><div class="map-lane"><div class="map-lane-title">Статус и результат</div>${node('Принят ВТБ','transferStatus')}${node('Отправлен в банк','transferStatus','Номер платежа и документ')}${node('Зачислен продавцу','transferReceived','Подтверждение банка получателя',true)}<div>${branch([['Нужны документы','transferDocsNeeded'],['Возвращён','transferReturned'],['Нет подтверждения','transferUnconfirmed']])}</div></div><p class="map-note">Синяя метка «новое» внутри телефона отмечает дополнения к существующим функциям. Ветвления и переключатели снаружи телефона служат только для презентации.</p></div>`;modal.hidden=false;modal.setAttribute('aria-label','Схема переходов');activateModal(modal);}

actions.closeMap=()=>{releaseModal(true);document.getElementById('map-modal').hidden=true;};
actions.mapGo=el=>{releaseModal(false);document.getElementById('map-modal').hidden=true;go(el.dataset.target);};
const skipUpdate=actions.skipIntro;actions.skipIntro=()=>{const returnTo=modalReturn;skipUpdate();restoreFocus(returnTo);};
const dismissCoach=actions.dismissCoach;actions.dismissCoach=()=>{releaseModal(false);dismissCoach();document.getElementById('china-tile')?.focus({preventScroll:true});};
const resetPrototype=actions.resetDemo;
actions.resetDemo=()=>{releaseModal(false);navigationState.depth=0;navigationState.flow=null;navigationState.completed.clear();navigationState.pendingBack=null;state.bankDraft=null;state.bankLastOperation=null;resetPrototype();syncNavigationHistory();};
const submitActionRoutes={buyYuan:'buy',pay:'payConfirm',payMixed:'payMixed',payLarge:'largePayment',transferSend:'transferSms',bankSubmit:'bankTransferConfirm',retryQrScan:'failureC'};
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-go],[data-action]');if(!el||!el.isConnected||el.closest('[inert]'))return;
 window.lastClickTarget=e.target;
 if(el.dataset.go){e.preventDefault();go(el.dataset.go);return;}
 const action=el.dataset.action;if(!actions[action]||el.dataset.busy==='true')return;
 if(submitActionRoutes[action]&&state.route!==submitActionRoutes[action])return;
 e.preventDefault();el.dataset.busy='true';
 try{await actions[action](el);}finally{if(el.isConnected)delete el.dataset.busy;}
});
document.addEventListener('change',e=>{if(e.target.name==='payment-source'){state.source=e.target.value;}if(e.target.id==='holiday-mode'||e.target.id==='portable-holiday-mode'){state.holiday=e.target.checked;go('transferAmount');}if(e.target.id==='portable-screen'){document.getElementById('portable-controls').hidden=true;go(e.target.value);}if(e.target.id==='qr-file'&&e.target.files.length&&state.route==='scan')actions.scanQR();});
document.addEventListener('input',e=>{if(e.target.id==='app-search')searchResults(e.target.value);if(e.target.id==='yuan-amount'){const n=Number(e.target.value.replace(/\s/g,''));const total=Number.isFinite(n)?fmt(n*13):'—';document.getElementById('purchase-cost').textContent=total+' ₽';document.getElementById('buy-button').textContent='Купить за '+total+' ₽';}});
document.addEventListener('submit',e=>{if(e.target.id==='chat-form'){e.preventDefault();const value=document.getElementById('chat-message').value.trim();if(value){state.messages.push(value);render();}}});
document.addEventListener('focusin',e=>{if(activeModal?.isConnected&&!activeModal.contains(e.target)){const target=modalFocusable(activeModal)[0]||activeModal;target.focus({preventScroll:true});}});
document.addEventListener('keydown',e=>{
 if(activeModal?.isConnected&&e.key==='Tab'){
  const targets=modalFocusable(activeModal);const first=targets[0],last=targets[targets.length-1];
  if(!targets.length){e.preventDefault();activeModal.focus();}
  else if(e.shiftKey&&(document.activeElement===first||!targets.includes(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||!targets.includes(document.activeElement))){e.preventDefault();first.focus();}
 }
 if(e.key==='Escape'){
  if(document.querySelector('.sheet-shade')){e.preventDefault();closeSheet();}
  else if(!document.getElementById('map-modal').hidden){e.preventDefault();actions.closeMap();}
  else if(state.onboard){e.preventDefault();actions.skipIntro();}
  else if(state.coach){e.preventDefault();releaseModal(false);actions.dismissCoach();}
 }
 if(state.onboard&&e.key==='ArrowRight'){e.preventDefault();actions.nextIntro();}
 if(state.onboard&&e.key==='ArrowLeft'){e.preventDefault();state.slide=Math.max(0,state.slide-1);render();}
});
window.addEventListener('popstate',event=>restoreNavigation(event.state));
const initialRoute=location.hash.slice(1);if(screens[initialRoute]){state.route=initialRoute;state.onboard=false;}
if(state.route==='china')state.stack=['home'];
const initialFlow=flowRoute(state.route);if(initialFlow)navigationState.flow={group:initialFlow,token:++navigationState.serial};
syncNavigationHistory();
render();
