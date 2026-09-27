/** Own one listener and cancel late startup, retries and callbacks on session changes. */
export function createLiveFeed({prepare,subscribe,onData,onError,retryDelay=15000}) {
 let active=true,unsubscribe=()=>{},timer;
 const retryable=e=>['unavailable','auth/network-request-failed','network-request-failed','deadline-exceeded'].includes(e?.code);
 const fail=e=>{
  if(!active)return;
  unsubscribe();unsubscribe=()=>{};
  onError(e);
  if(retryable(e)) timer=setTimeout(start,retryDelay);
 };
 async function start(){
  try {
   await prepare();
   if(!active)return;
   unsubscribe=subscribe(value=>{if(active)onData(value)},fail);
  } catch(e){fail(e)}
 }
 start();
 return ()=>{active=false;clearTimeout(timer);unsubscribe()};
}
