import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLiveFeed} from '../lib/live-feed.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('live changes replace snapshots and cleanup stops all late callbacks',async()=>{
 let next,stops=0;const seen=[];
 const stop=createLiveFeed({prepare:async()=>{},subscribe:n=>{next=n;return()=>stops++},onData:r=>seen.push(r),onError:e=>{throw e}});
 await tick();next([{id:'a',value:1}]);next([{id:'a',value:2}]);next([]);
 assert.equal(seen.length,3);assert.deepEqual(seen.at(-1),[]);
 stop();next([{id:'late'}]);assert.equal(seen.length,3);assert.equal(stops,1);
});
test('logout while credentials are loading never starts the listener',async()=>{
 let resolve,started=0;
 const stop=createLiveFeed({prepare:()=>new Promise(r=>resolve=r),subscribe:()=>{started++;return()=>{}},onData:()=>{},onError:()=>{}});
 stop();resolve();await tick();assert.equal(started,0);
});
test('transient startup failures retry but permission failures do not',async()=>{
 let attempts=0,subscribed=0,errors=0;
 const stop=createLiveFeed({prepare:async()=>{if(++attempts===1)throw {code:'auth/network-request-failed'}},subscribe:()=>{subscribed++;return()=>{}},onData:()=>{},onError:()=>errors++,retryDelay:1});
 await new Promise(r=>setTimeout(r,25));assert.equal(subscribed,1);assert.equal(errors,1);stop();
 let denied=0;const stopDenied=createLiveFeed({prepare:async()=>{denied++;throw {code:'permission-denied'}},subscribe:()=>{throw Error('must not listen')},onData:()=>{},onError:()=>{},retryDelay:1});
 await new Promise(r=>setTimeout(r,25));assert.equal(denied,1);stopDenied();
});
