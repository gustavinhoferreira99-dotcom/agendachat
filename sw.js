/* AgendaChat: recebe as notificações de novos agendamentos */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  let d={};
  try{d=e.data.json()}catch(_){d={title:'AgendaChat',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'AgendaChat',{
    body:d.body||'',tag:d.tag||undefined,renotify:!!d.tag,data:{url:d.url||'./?admin'}
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const u=new URL((e.notification.data&&e.notification.data.url)||'./?admin',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if('focus' in c){if(c.navigate)c.navigate(u).catch(()=>{});return c.focus()}}
    return self.clients.openWindow(u)}));
});
