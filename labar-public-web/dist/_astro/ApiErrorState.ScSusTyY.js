import{c as a,j as e}from"./createLucideIcon.CtaOmWlD.js";import"./index.DK-fsZOb.js";import{c as r}from"./endpoints.ByKlIkiu.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=a("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=a("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=a("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]),y=({error:t,onRetry:s,title:i="Service Temporarily Unavailable",className:n=""})=>{const c=t instanceof r&&(t.isNetworkError||t.isTimeout),l=t instanceof r?t.getUserMessage("en"):t?.message||"Unable to communicate with the LaBar live API server.";return e.jsxs("div",{className:`rounded-3xl border border-red-200 bg-red-50/70 p-6 text-center ${n}`,children:[e.jsx("div",{className:"mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-brand-red mb-3",children:c?e.jsx(x,{size:22}):e.jsx(o,{size:22})}),e.jsx("h4",{className:"text-base font-bold text-neutral-900 mb-1",children:i}),e.jsx("p",{className:"text-xs text-neutral-600 max-w-md mx-auto mb-4",children:l}),s&&e.jsxs("button",{type:"button",onClick:s,className:"inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold border border-neutral-300 shadow-sm transition-all active:scale-95 cursor-pointer",children:[e.jsx(d,{size:14}),e.jsx("span",{children:"Retry Connection"})]})]})};export{o as A,d as R,y as a};
