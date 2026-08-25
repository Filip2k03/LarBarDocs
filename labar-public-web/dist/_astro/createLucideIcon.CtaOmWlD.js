import{a as y,r as _}from"./index.DK-fsZOb.js";var d={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function w(){if(R)return i;R=1;var t=y(),f=Symbol.for("react.element"),a=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,u=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function p(o,e,m){var r,n={},s=null,x=null;m!==void 0&&(s=""+m),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(x=e.ref);for(r in e)l.call(e,r)&&!c.hasOwnProperty(r)&&(n[r]=e[r]);if(o&&o.defaultProps)for(r in e=o.defaultProps,e)n[r]===void 0&&(n[r]=e[r]);return{$$typeof:f,type:o,key:s,ref:x,props:n,_owner:u.current}}return i.Fragment=a,i.jsx=p,i.jsxs=p,i}var v;function h(){return v||(v=1,d.exports=w()),d.exports}var j=h();/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var k={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),O=(t,f)=>{const a=_.forwardRef(({color:l="currentColor",size:u=24,strokeWidth:c=2,absoluteStrokeWidth:p,className:o="",children:e,...m},r)=>_.createElement("svg",{ref:r,...k,width:u,height:u,stroke:l,strokeWidth:p?Number(c)*24/Number(u):c,className:["lucide",`lucide-${E(t)}`,o].join(" "),...m},[...f.map(([n,s])=>_.createElement(n,s)),...Array.isArray(e)?e:[e]]));return a.displayName=`${t}`,a};export{O as c,j};
