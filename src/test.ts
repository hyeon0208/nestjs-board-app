// // app.mjs  또는 package.json에 "type":"module"
// import { createHook, executionAsyncId } from 'node:async_hooks';

// const edge = new Map(); // child -> parent
// const types = new Map(); // id -> type

// createHook({
//   init(asyncId, type, triggerAsyncId) {
//     edge.set(asyncId, triggerAsyncId);
//     types.set(asyncId, type); // ← 여기 BP
//   },
//   before(asyncId) {
//     // ← 여기 BP
//     // 디버거 Watch: executionAsyncId()
//   },
//   after(asyncId) {},
//   destroy(asyncId) {},
// }).enable();

// function pathOf(id) {
//   const p = [];
//   while (id) {
//     p.push(`${id}:${types.get(id)}`);
//     id = edge.get(id);
//   }
//   return p.join(' <- ');
// }

// setTimeout(() => {
//   const id = executionAsyncId();
//   console.log('now:', id, 'path:', pathOf(id));
// }, 10);

// // const als = new AsyncLocalStorage();

// // function log(label) {
// //   console.log(label, { id: executionAsyncId(), store: als.getStore() });
// //   // ← 여기에 BP. store 유지 여부만 보면 전파 OK/NG 바로 판단 가능
// // }

// // als.run({ reqId: 'R-1' }, () => {
// //   log('T0');
// //   setTimeout(() => {
// //     log('T1');
// //     Promise.resolve().then(() => log('microtask'));
// //   }, 0);
// // });
