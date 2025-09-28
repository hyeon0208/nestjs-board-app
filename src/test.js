"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// app.mjs  또는 package.json에 "type":"module"
var node_async_hooks_1 = require("node:async_hooks");
var edge = new Map(); // child -> parent
var types = new Map(); // id -> type
(0, node_async_hooks_1.createHook)({
    init: function (asyncId, type, triggerAsyncId) {
        edge.set(asyncId, triggerAsyncId);
        types.set(asyncId, type); // ← 여기 BP
    },
    debugger: ,
    before: function (asyncId) {
        // ← 여기 BP
        // 디버거 Watch: executionAsyncId()
    },
    after: function (asyncId) { },
    destroy: function (asyncId) { },
}).enable();
function pathOf(id) {
    var p = [];
    while (id) {
        p.push("".concat(id, ":").concat(types.get(id)));
        id = edge.get(id);
    }
    return p.join(' <- ');
}
setTimeout(function () {
    var id = (0, node_async_hooks_1.executionAsyncId)();
    console.log('now:', id, 'path:', pathOf(id));
}, 10);
// const als = new AsyncLocalStorage();
// function log(label) {
//   console.log(label, { id: executionAsyncId(), store: als.getStore() });
//   // ← 여기에 BP. store 유지 여부만 보면 전파 OK/NG 바로 판단 가능
// }
// als.run({ reqId: 'R-1' }, () => {
//   log('T0');
//   setTimeout(() => {
//     log('T1');
//     Promise.resolve().then(() => log('microtask'));
//   }, 0);
// });
