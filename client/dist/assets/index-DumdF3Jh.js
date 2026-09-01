(function(){const w=document.createElement("link").relList;if(w&&w.supports&&w.supports("modulepreload"))return;for(const M of document.querySelectorAll('link[rel="modulepreload"]'))b(M);new MutationObserver(M=>{for(const A of M)if(A.type==="childList")for(const O of A.addedNodes)O.tagName==="LINK"&&O.rel==="modulepreload"&&b(O)}).observe(document,{childList:!0,subtree:!0});function m(M){const A={};return M.integrity&&(A.integrity=M.integrity),M.referrerPolicy&&(A.referrerPolicy=M.referrerPolicy),M.crossOrigin==="use-credentials"?A.credentials="include":M.crossOrigin==="anonymous"?A.credentials="omit":A.credentials="same-origin",A}function b(M){if(M.ep)return;M.ep=!0;const A=m(M);fetch(M.href,A)}})();function rc(c){return c&&c.__esModule&&Object.prototype.hasOwnProperty.call(c,"default")?c.default:c}var Yi={exports:{}},Vr={},qi={exports:{}},he={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Hu;function up(){if(Hu)return he;Hu=1;var c=Symbol.for("react.element"),w=Symbol.for("react.portal"),m=Symbol.for("react.fragment"),b=Symbol.for("react.strict_mode"),M=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),O=Symbol.for("react.context"),H=Symbol.for("react.forward_ref"),D=Symbol.for("react.suspense"),q=Symbol.for("react.memo"),Q=Symbol.for("react.lazy"),j=Symbol.iterator;function F(o){return o===null||typeof o!="object"?null:(o=j&&o[j]||o["@@iterator"],typeof o=="function"?o:null)}var le={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ye=Object.assign,X={};function y(o,g,C){this.props=o,this.context=g,this.refs=X,this.updater=C||le}y.prototype.isReactComponent={},y.prototype.setState=function(o,g){if(typeof o!="object"&&typeof o!="function"&&o!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,o,g,"setState")},y.prototype.forceUpdate=function(o){this.updater.enqueueForceUpdate(this,o,"forceUpdate")};function V(){}V.prototype=y.prototype;function ie(o,g,C){this.props=o,this.context=g,this.refs=X,this.updater=C||le}var P=ie.prototype=new V;P.constructor=ie,ye(P,y.prototype),P.isPureReactComponent=!0;var se=Array.isArray,_=Object.prototype.hasOwnProperty,pe={current:null},ve={key:!0,ref:!0,__self:!0,__source:!0};function be(o,g,C){var T,R={},$=null,L=null;if(g!=null)for(T in g.ref!==void 0&&(L=g.ref),g.key!==void 0&&($=""+g.key),g)_.call(g,T)&&!ve.hasOwnProperty(T)&&(R[T]=g[T]);var U=arguments.length-2;if(U===1)R.children=C;else if(1<U){for(var Z=Array(U),fe=0;fe<U;fe++)Z[fe]=arguments[fe+2];R.children=Z}if(o&&o.defaultProps)for(T in U=o.defaultProps,U)R[T]===void 0&&(R[T]=U[T]);return{$$typeof:c,type:o,key:$,ref:L,props:R,_owner:pe.current}}function ee(o,g){return{$$typeof:c,type:o.type,key:g,ref:o.ref,props:o.props,_owner:o._owner}}function ge(o){return typeof o=="object"&&o!==null&&o.$$typeof===c}function Pe(o){var g={"=":"=0",":":"=2"};return"$"+o.replace(/[=:]/g,function(C){return g[C]})}var oe=/\/+/g;function xe(o,g){return typeof o=="object"&&o!==null&&o.key!=null?Pe(""+o.key):g.toString(36)}function Fe(o,g,C,T,R){var $=typeof o;($==="undefined"||$==="boolean")&&(o=null);var L=!1;if(o===null)L=!0;else switch($){case"string":case"number":L=!0;break;case"object":switch(o.$$typeof){case c:case w:L=!0}}if(L)return L=o,R=R(L),o=T===""?"."+xe(L,0):T,se(R)?(C="",o!=null&&(C=o.replace(oe,"$&/")+"/"),Fe(R,g,C,"",function(fe){return fe})):R!=null&&(ge(R)&&(R=ee(R,C+(!R.key||L&&L.key===R.key?"":(""+R.key).replace(oe,"$&/")+"/")+o)),g.push(R)),1;if(L=0,T=T===""?".":T+":",se(o))for(var U=0;U<o.length;U++){$=o[U];var Z=T+xe($,U);L+=Fe($,g,C,Z,R)}else if(Z=F(o),typeof Z=="function")for(o=Z.call(o),U=0;!($=o.next()).done;)$=$.value,Z=T+xe($,U++),L+=Fe($,g,C,Z,R);else if($==="object")throw g=String(o),Error("Objects are not valid as a React child (found: "+(g==="[object Object]"?"object with keys {"+Object.keys(o).join(", ")+"}":g)+"). If you meant to render a collection of children, use an array instead.");return L}function De(o,g,C){if(o==null)return o;var T=[],R=0;return Fe(o,T,"","",function($){return g.call(C,$,R++)}),T}function Oe(o){if(o._status===-1){var g=o._result;g=g(),g.then(function(C){(o._status===0||o._status===-1)&&(o._status=1,o._result=C)},function(C){(o._status===0||o._status===-1)&&(o._status=2,o._result=C)}),o._status===-1&&(o._status=0,o._result=g)}if(o._status===1)return o._result.default;throw o._result}var Se={current:null},I={transition:null},J={ReactCurrentDispatcher:Se,ReactCurrentBatchConfig:I,ReactCurrentOwner:pe};function p(){throw Error("act(...) is not supported in production builds of React.")}return he.Children={map:De,forEach:function(o,g,C){De(o,function(){g.apply(this,arguments)},C)},count:function(o){var g=0;return De(o,function(){g++}),g},toArray:function(o){return De(o,function(g){return g})||[]},only:function(o){if(!ge(o))throw Error("React.Children.only expected to receive a single React element child.");return o}},he.Component=y,he.Fragment=m,he.Profiler=M,he.PureComponent=ie,he.StrictMode=b,he.Suspense=D,he.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,he.act=p,he.cloneElement=function(o,g,C){if(o==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+o+".");var T=ye({},o.props),R=o.key,$=o.ref,L=o._owner;if(g!=null){if(g.ref!==void 0&&($=g.ref,L=pe.current),g.key!==void 0&&(R=""+g.key),o.type&&o.type.defaultProps)var U=o.type.defaultProps;for(Z in g)_.call(g,Z)&&!ve.hasOwnProperty(Z)&&(T[Z]=g[Z]===void 0&&U!==void 0?U[Z]:g[Z])}var Z=arguments.length-2;if(Z===1)T.children=C;else if(1<Z){U=Array(Z);for(var fe=0;fe<Z;fe++)U[fe]=arguments[fe+2];T.children=U}return{$$typeof:c,type:o.type,key:R,ref:$,props:T,_owner:L}},he.createContext=function(o){return o={$$typeof:O,_currentValue:o,_currentValue2:o,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},o.Provider={$$typeof:A,_context:o},o.Consumer=o},he.createElement=be,he.createFactory=function(o){var g=be.bind(null,o);return g.type=o,g},he.createRef=function(){return{current:null}},he.forwardRef=function(o){return{$$typeof:H,render:o}},he.isValidElement=ge,he.lazy=function(o){return{$$typeof:Q,_payload:{_status:-1,_result:o},_init:Oe}},he.memo=function(o,g){return{$$typeof:q,type:o,compare:g===void 0?null:g}},he.startTransition=function(o){var g=I.transition;I.transition={};try{o()}finally{I.transition=g}},he.unstable_act=p,he.useCallback=function(o,g){return Se.current.useCallback(o,g)},he.useContext=function(o){return Se.current.useContext(o)},he.useDebugValue=function(){},he.useDeferredValue=function(o){return Se.current.useDeferredValue(o)},he.useEffect=function(o,g){return Se.current.useEffect(o,g)},he.useId=function(){return Se.current.useId()},he.useImperativeHandle=function(o,g,C){return Se.current.useImperativeHandle(o,g,C)},he.useInsertionEffect=function(o,g){return Se.current.useInsertionEffect(o,g)},he.useLayoutEffect=function(o,g){return Se.current.useLayoutEffect(o,g)},he.useMemo=function(o,g){return Se.current.useMemo(o,g)},he.useReducer=function(o,g,C){return Se.current.useReducer(o,g,C)},he.useRef=function(o){return Se.current.useRef(o)},he.useState=function(o){return Se.current.useState(o)},he.useSyncExternalStore=function(o,g,C){return Se.current.useSyncExternalStore(o,g,C)},he.useTransition=function(){return Se.current.useTransition()},he.version="18.3.1",he}var Qu;function rs(){return Qu||(Qu=1,qi.exports=up()),qi.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Gu;function cp(){if(Gu)return Vr;Gu=1;var c=rs(),w=Symbol.for("react.element"),m=Symbol.for("react.fragment"),b=Object.prototype.hasOwnProperty,M=c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,A={key:!0,ref:!0,__self:!0,__source:!0};function O(H,D,q){var Q,j={},F=null,le=null;q!==void 0&&(F=""+q),D.key!==void 0&&(F=""+D.key),D.ref!==void 0&&(le=D.ref);for(Q in D)b.call(D,Q)&&!A.hasOwnProperty(Q)&&(j[Q]=D[Q]);if(H&&H.defaultProps)for(Q in D=H.defaultProps,D)j[Q]===void 0&&(j[Q]=D[Q]);return{$$typeof:w,type:H,key:F,ref:le,props:j,_owner:M.current}}return Vr.Fragment=m,Vr.jsx=O,Vr.jsxs=O,Vr}var Yu;function dp(){return Yu||(Yu=1,Yi.exports=cp()),Yi.exports}var l=dp(),z=rs();const pp=rc(z);var ea={},Xi={exports:{}},pt={},Zi={exports:{}},Ji={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var qu;function fp(){return qu||(qu=1,(function(c){function w(I,J){var p=I.length;I.push(J);e:for(;0<p;){var o=p-1>>>1,g=I[o];if(0<M(g,J))I[o]=J,I[p]=g,p=o;else break e}}function m(I){return I.length===0?null:I[0]}function b(I){if(I.length===0)return null;var J=I[0],p=I.pop();if(p!==J){I[0]=p;e:for(var o=0,g=I.length,C=g>>>1;o<C;){var T=2*(o+1)-1,R=I[T],$=T+1,L=I[$];if(0>M(R,p))$<g&&0>M(L,R)?(I[o]=L,I[$]=p,o=$):(I[o]=R,I[T]=p,o=T);else if($<g&&0>M(L,p))I[o]=L,I[$]=p,o=$;else break e}}return J}function M(I,J){var p=I.sortIndex-J.sortIndex;return p!==0?p:I.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var A=performance;c.unstable_now=function(){return A.now()}}else{var O=Date,H=O.now();c.unstable_now=function(){return O.now()-H}}var D=[],q=[],Q=1,j=null,F=3,le=!1,ye=!1,X=!1,y=typeof setTimeout=="function"?setTimeout:null,V=typeof clearTimeout=="function"?clearTimeout:null,ie=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function P(I){for(var J=m(q);J!==null;){if(J.callback===null)b(q);else if(J.startTime<=I)b(q),J.sortIndex=J.expirationTime,w(D,J);else break;J=m(q)}}function se(I){if(X=!1,P(I),!ye)if(m(D)!==null)ye=!0,Oe(_);else{var J=m(q);J!==null&&Se(se,J.startTime-I)}}function _(I,J){ye=!1,X&&(X=!1,V(be),be=-1),le=!0;var p=F;try{for(P(J),j=m(D);j!==null&&(!(j.expirationTime>J)||I&&!Pe());){var o=j.callback;if(typeof o=="function"){j.callback=null,F=j.priorityLevel;var g=o(j.expirationTime<=J);J=c.unstable_now(),typeof g=="function"?j.callback=g:j===m(D)&&b(D),P(J)}else b(D);j=m(D)}if(j!==null)var C=!0;else{var T=m(q);T!==null&&Se(se,T.startTime-J),C=!1}return C}finally{j=null,F=p,le=!1}}var pe=!1,ve=null,be=-1,ee=5,ge=-1;function Pe(){return!(c.unstable_now()-ge<ee)}function oe(){if(ve!==null){var I=c.unstable_now();ge=I;var J=!0;try{J=ve(!0,I)}finally{J?xe():(pe=!1,ve=null)}}else pe=!1}var xe;if(typeof ie=="function")xe=function(){ie(oe)};else if(typeof MessageChannel<"u"){var Fe=new MessageChannel,De=Fe.port2;Fe.port1.onmessage=oe,xe=function(){De.postMessage(null)}}else xe=function(){y(oe,0)};function Oe(I){ve=I,pe||(pe=!0,xe())}function Se(I,J){be=y(function(){I(c.unstable_now())},J)}c.unstable_IdlePriority=5,c.unstable_ImmediatePriority=1,c.unstable_LowPriority=4,c.unstable_NormalPriority=3,c.unstable_Profiling=null,c.unstable_UserBlockingPriority=2,c.unstable_cancelCallback=function(I){I.callback=null},c.unstable_continueExecution=function(){ye||le||(ye=!0,Oe(_))},c.unstable_forceFrameRate=function(I){0>I||125<I?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ee=0<I?Math.floor(1e3/I):5},c.unstable_getCurrentPriorityLevel=function(){return F},c.unstable_getFirstCallbackNode=function(){return m(D)},c.unstable_next=function(I){switch(F){case 1:case 2:case 3:var J=3;break;default:J=F}var p=F;F=J;try{return I()}finally{F=p}},c.unstable_pauseExecution=function(){},c.unstable_requestPaint=function(){},c.unstable_runWithPriority=function(I,J){switch(I){case 1:case 2:case 3:case 4:case 5:break;default:I=3}var p=F;F=I;try{return J()}finally{F=p}},c.unstable_scheduleCallback=function(I,J,p){var o=c.unstable_now();switch(typeof p=="object"&&p!==null?(p=p.delay,p=typeof p=="number"&&0<p?o+p:o):p=o,I){case 1:var g=-1;break;case 2:g=250;break;case 5:g=1073741823;break;case 4:g=1e4;break;default:g=5e3}return g=p+g,I={id:Q++,callback:J,priorityLevel:I,startTime:p,expirationTime:g,sortIndex:-1},p>o?(I.sortIndex=p,w(q,I),m(D)===null&&I===m(q)&&(X?(V(be),be=-1):X=!0,Se(se,p-o))):(I.sortIndex=g,w(D,I),ye||le||(ye=!0,Oe(_))),I},c.unstable_shouldYield=Pe,c.unstable_wrapCallback=function(I){var J=F;return function(){var p=F;F=J;try{return I.apply(this,arguments)}finally{F=p}}}})(Ji)),Ji}var Xu;function mp(){return Xu||(Xu=1,Zi.exports=fp()),Zi.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zu;function hp(){if(Zu)return pt;Zu=1;var c=rs(),w=mp();function m(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var b=new Set,M={};function A(e,t){O(e,t),O(e+"Capture",t)}function O(e,t){for(M[e]=t,e=0;e<t.length;e++)b.add(t[e])}var H=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),D=Object.prototype.hasOwnProperty,q=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Q={},j={};function F(e){return D.call(j,e)?!0:D.call(Q,e)?!1:q.test(e)?j[e]=!0:(Q[e]=!0,!1)}function le(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function ye(e,t,n,r){if(t===null||typeof t>"u"||le(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function X(e,t,n,r,a,i,s){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=a,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=s}var y={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){y[e]=new X(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];y[t]=new X(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){y[e]=new X(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){y[e]=new X(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){y[e]=new X(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){y[e]=new X(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){y[e]=new X(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){y[e]=new X(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){y[e]=new X(e,5,!1,e.toLowerCase(),null,!1,!1)});var V=/[\-:]([a-z])/g;function ie(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(V,ie);y[t]=new X(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(V,ie);y[t]=new X(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(V,ie);y[t]=new X(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){y[e]=new X(e,1,!1,e.toLowerCase(),null,!1,!1)}),y.xlinkHref=new X("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){y[e]=new X(e,1,!1,e.toLowerCase(),null,!0,!0)});function P(e,t,n,r){var a=y.hasOwnProperty(t)?y[t]:null;(a!==null?a.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(ye(t,n,a,r)&&(n=null),r||a===null?F(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):a.mustUseProperty?e[a.propertyName]=n===null?a.type===3?!1:"":n:(t=a.attributeName,r=a.attributeNamespace,n===null?e.removeAttribute(t):(a=a.type,n=a===3||a===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var se=c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,_=Symbol.for("react.element"),pe=Symbol.for("react.portal"),ve=Symbol.for("react.fragment"),be=Symbol.for("react.strict_mode"),ee=Symbol.for("react.profiler"),ge=Symbol.for("react.provider"),Pe=Symbol.for("react.context"),oe=Symbol.for("react.forward_ref"),xe=Symbol.for("react.suspense"),Fe=Symbol.for("react.suspense_list"),De=Symbol.for("react.memo"),Oe=Symbol.for("react.lazy"),Se=Symbol.for("react.offscreen"),I=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=I&&e[I]||e["@@iterator"],typeof e=="function"?e:null)}var p=Object.assign,o;function g(e){if(o===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);o=t&&t[1]||""}return`
`+o+e}var C=!1;function T(e,t){if(!e||C)return"";C=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(x){var r=x}Reflect.construct(e,[],t)}else{try{t.call()}catch(x){r=x}e.call(t.prototype)}else{try{throw Error()}catch(x){r=x}e()}}catch(x){if(x&&r&&typeof x.stack=="string"){for(var a=x.stack.split(`
`),i=r.stack.split(`
`),s=a.length-1,u=i.length-1;1<=s&&0<=u&&a[s]!==i[u];)u--;for(;1<=s&&0<=u;s--,u--)if(a[s]!==i[u]){if(s!==1||u!==1)do if(s--,u--,0>u||a[s]!==i[u]){var d=`
`+a[s].replace(" at new "," at ");return e.displayName&&d.includes("<anonymous>")&&(d=d.replace("<anonymous>",e.displayName)),d}while(1<=s&&0<=u);break}}}finally{C=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?g(e):""}function R(e){switch(e.tag){case 5:return g(e.type);case 16:return g("Lazy");case 13:return g("Suspense");case 19:return g("SuspenseList");case 0:case 2:case 15:return e=T(e.type,!1),e;case 11:return e=T(e.type.render,!1),e;case 1:return e=T(e.type,!0),e;default:return""}}function $(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ve:return"Fragment";case pe:return"Portal";case ee:return"Profiler";case be:return"StrictMode";case xe:return"Suspense";case Fe:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Pe:return(e.displayName||"Context")+".Consumer";case ge:return(e._context.displayName||"Context")+".Provider";case oe:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case De:return t=e.displayName||null,t!==null?t:$(e.type)||"Memo";case Oe:t=e._payload,e=e._init;try{return $(e(t))}catch{}}return null}function L(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return $(t);case 8:return t===be?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function U(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Z(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function fe(e){var t=Z(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var a=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return a.call(this)},set:function(s){r=""+s,i.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(s){r=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function me(e){e._valueTracker||(e._valueTracker=fe(e))}function Ne(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=Z(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function ue(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function ce(e,t){var n=t.checked;return p({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Ve(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=U(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Xe(e,t){t=t.checked,t!=null&&P(e,"checked",t,!1)}function Ke(e,t){Xe(e,t);var n=U(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?at(e,t.type,n):t.hasOwnProperty("defaultValue")&&at(e,t.type,U(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Ze(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function at(e,t,n){(t!=="number"||ue(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var $e=Array.isArray;function xt(e,t,n,r){if(e=e.options,t){t={};for(var a=0;a<n.length;a++)t["$"+n[a]]=!0;for(n=0;n<e.length;n++)a=t.hasOwnProperty("$"+e[n].value),e[n].selected!==a&&(e[n].selected=a),a&&r&&(e[n].defaultSelected=!0)}else{for(n=""+U(n),t=null,a=0;a<e.length;a++){if(e[a].value===n){e[a].selected=!0,r&&(e[a].defaultSelected=!0);return}t!==null||e[a].disabled||(t=e[a])}t!==null&&(t.selected=!0)}}function mn(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(m(91));return p({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ht(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(m(92));if($e(n)){if(1<n.length)throw Error(m(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:U(n)}}function hn(e,t){var n=U(t.value),r=U(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Tn(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function gn(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function vn(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?gn(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var te,ze=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,a){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,a)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(te=te||document.createElement("div"),te.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=te.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function yt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var it={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Qt=["Webkit","ms","Moz","O"];Object.keys(it).forEach(function(e){Qt.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),it[t]=it[e]})});function xn(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||it.hasOwnProperty(e)&&it[e]?(""+t).trim():t+"px"}function ss(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,a=xn(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,a):e[n]=a}}var mc=p({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function sa(e,t){if(t){if(mc[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(m(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(m(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(m(61))}if(t.style!=null&&typeof t.style!="object")throw Error(m(62))}}function oa(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ua=null;function ca(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var da=null,Ln=null,In=null;function os(e){if(e=Er(e)){if(typeof da!="function")throw Error(m(280));var t=e.stateNode;t&&(t=hl(t),da(e.stateNode,e.type,t))}}function us(e){Ln?In?In.push(e):In=[e]:Ln=e}function cs(){if(Ln){var e=Ln,t=In;if(In=Ln=null,os(e),t)for(e=0;e<t.length;e++)os(t[e])}}function ds(e,t){return e(t)}function ps(){}var pa=!1;function fs(e,t,n){if(pa)return e(t,n);pa=!0;try{return ds(e,t,n)}finally{pa=!1,(Ln!==null||In!==null)&&(ps(),cs())}}function ir(e,t){var n=e.stateNode;if(n===null)return null;var r=hl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(m(231,t,typeof n));return n}var fa=!1;if(H)try{var sr={};Object.defineProperty(sr,"passive",{get:function(){fa=!0}}),window.addEventListener("test",sr,sr),window.removeEventListener("test",sr,sr)}catch{fa=!1}function hc(e,t,n,r,a,i,s,u,d){var x=Array.prototype.slice.call(arguments,3);try{t.apply(n,x)}catch(N){this.onError(N)}}var or=!1,Qr=null,Gr=!1,ma=null,gc={onError:function(e){or=!0,Qr=e}};function vc(e,t,n,r,a,i,s,u,d){or=!1,Qr=null,hc.apply(gc,arguments)}function xc(e,t,n,r,a,i,s,u,d){if(vc.apply(this,arguments),or){if(or){var x=Qr;or=!1,Qr=null}else throw Error(m(198));Gr||(Gr=!0,ma=x)}}function yn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function ms(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function hs(e){if(yn(e)!==e)throw Error(m(188))}function yc(e){var t=e.alternate;if(!t){if(t=yn(e),t===null)throw Error(m(188));return t!==e?null:e}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var i=a.alternate;if(i===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===i.child){for(i=a.child;i;){if(i===n)return hs(a),e;if(i===r)return hs(a),t;i=i.sibling}throw Error(m(188))}if(n.return!==r.return)n=a,r=i;else{for(var s=!1,u=a.child;u;){if(u===n){s=!0,n=a,r=i;break}if(u===r){s=!0,r=a,n=i;break}u=u.sibling}if(!s){for(u=i.child;u;){if(u===n){s=!0,n=i,r=a;break}if(u===r){s=!0,r=i,n=a;break}u=u.sibling}if(!s)throw Error(m(189))}}if(n.alternate!==r)throw Error(m(190))}if(n.tag!==3)throw Error(m(188));return n.stateNode.current===n?e:t}function gs(e){return e=yc(e),e!==null?vs(e):null}function vs(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=vs(e);if(t!==null)return t;e=e.sibling}return null}var xs=w.unstable_scheduleCallback,ys=w.unstable_cancelCallback,wc=w.unstable_shouldYield,kc=w.unstable_requestPaint,Re=w.unstable_now,jc=w.unstable_getCurrentPriorityLevel,ha=w.unstable_ImmediatePriority,ws=w.unstable_UserBlockingPriority,Yr=w.unstable_NormalPriority,Nc=w.unstable_LowPriority,ks=w.unstable_IdlePriority,qr=null,Tt=null;function bc(e){if(Tt&&typeof Tt.onCommitFiberRoot=="function")try{Tt.onCommitFiberRoot(qr,e,void 0,(e.current.flags&128)===128)}catch{}}var Ct=Math.clz32?Math.clz32:Ec,Sc=Math.log,Cc=Math.LN2;function Ec(e){return e>>>=0,e===0?32:31-(Sc(e)/Cc|0)|0}var Xr=64,Zr=4194304;function ur(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Jr(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,a=e.suspendedLanes,i=e.pingedLanes,s=n&268435455;if(s!==0){var u=s&~a;u!==0?r=ur(u):(i&=s,i!==0&&(r=ur(i)))}else s=n&~a,s!==0?r=ur(s):i!==0&&(r=ur(i));if(r===0)return 0;if(t!==0&&t!==r&&(t&a)===0&&(a=r&-r,i=t&-t,a>=i||a===16&&(i&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-Ct(t),a=1<<n,r|=e[n],t&=~a;return r}function _c(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function zc(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,a=e.expirationTimes,i=e.pendingLanes;0<i;){var s=31-Ct(i),u=1<<s,d=a[s];d===-1?((u&n)===0||(u&r)!==0)&&(a[s]=_c(u,t)):d<=t&&(e.expiredLanes|=u),i&=~u}}function ga(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function js(){var e=Xr;return Xr<<=1,(Xr&4194240)===0&&(Xr=64),e}function va(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function cr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Ct(t),e[t]=n}function Mc(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var a=31-Ct(n),i=1<<a;t[a]=0,r[a]=-1,e[a]=-1,n&=~i}}function xa(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Ct(n),a=1<<r;a&t|e[r]&t&&(e[r]|=t),n&=~a}}var je=0;function Ns(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var bs,ya,Ss,Cs,Es,wa=!1,el=[],Gt=null,Yt=null,qt=null,dr=new Map,pr=new Map,Xt=[],Pc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function _s(e,t){switch(e){case"focusin":case"focusout":Gt=null;break;case"dragenter":case"dragleave":Yt=null;break;case"mouseover":case"mouseout":qt=null;break;case"pointerover":case"pointerout":dr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":pr.delete(t.pointerId)}}function fr(e,t,n,r,a,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[a]},t!==null&&(t=Er(t),t!==null&&ya(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,a!==null&&t.indexOf(a)===-1&&t.push(a),e)}function Fc(e,t,n,r,a){switch(t){case"focusin":return Gt=fr(Gt,e,t,n,r,a),!0;case"dragenter":return Yt=fr(Yt,e,t,n,r,a),!0;case"mouseover":return qt=fr(qt,e,t,n,r,a),!0;case"pointerover":var i=a.pointerId;return dr.set(i,fr(dr.get(i)||null,e,t,n,r,a)),!0;case"gotpointercapture":return i=a.pointerId,pr.set(i,fr(pr.get(i)||null,e,t,n,r,a)),!0}return!1}function zs(e){var t=wn(e.target);if(t!==null){var n=yn(t);if(n!==null){if(t=n.tag,t===13){if(t=ms(n),t!==null){e.blockedOn=t,Es(e.priority,function(){Ss(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function tl(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=ja(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);ua=r,n.target.dispatchEvent(r),ua=null}else return t=Er(n),t!==null&&ya(t),e.blockedOn=n,!1;t.shift()}return!0}function Ms(e,t,n){tl(e)&&n.delete(t)}function Tc(){wa=!1,Gt!==null&&tl(Gt)&&(Gt=null),Yt!==null&&tl(Yt)&&(Yt=null),qt!==null&&tl(qt)&&(qt=null),dr.forEach(Ms),pr.forEach(Ms)}function mr(e,t){e.blockedOn===t&&(e.blockedOn=null,wa||(wa=!0,w.unstable_scheduleCallback(w.unstable_NormalPriority,Tc)))}function hr(e){function t(a){return mr(a,e)}if(0<el.length){mr(el[0],e);for(var n=1;n<el.length;n++){var r=el[n];r.blockedOn===e&&(r.blockedOn=null)}}for(Gt!==null&&mr(Gt,e),Yt!==null&&mr(Yt,e),qt!==null&&mr(qt,e),dr.forEach(t),pr.forEach(t),n=0;n<Xt.length;n++)r=Xt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Xt.length&&(n=Xt[0],n.blockedOn===null);)zs(n),n.blockedOn===null&&Xt.shift()}var Rn=se.ReactCurrentBatchConfig,nl=!0;function Lc(e,t,n,r){var a=je,i=Rn.transition;Rn.transition=null;try{je=1,ka(e,t,n,r)}finally{je=a,Rn.transition=i}}function Ic(e,t,n,r){var a=je,i=Rn.transition;Rn.transition=null;try{je=4,ka(e,t,n,r)}finally{je=a,Rn.transition=i}}function ka(e,t,n,r){if(nl){var a=ja(e,t,n,r);if(a===null)Oa(e,t,r,rl,n),_s(e,r);else if(Fc(a,e,t,n,r))r.stopPropagation();else if(_s(e,r),t&4&&-1<Pc.indexOf(e)){for(;a!==null;){var i=Er(a);if(i!==null&&bs(i),i=ja(e,t,n,r),i===null&&Oa(e,t,r,rl,n),i===a)break;a=i}a!==null&&r.stopPropagation()}else Oa(e,t,r,null,n)}}var rl=null;function ja(e,t,n,r){if(rl=null,e=ca(r),e=wn(e),e!==null)if(t=yn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=ms(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return rl=e,null}function Ps(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(jc()){case ha:return 1;case ws:return 4;case Yr:case Nc:return 16;case ks:return 536870912;default:return 16}default:return 16}}var Zt=null,Na=null,ll=null;function Fs(){if(ll)return ll;var e,t=Na,n=t.length,r,a="value"in Zt?Zt.value:Zt.textContent,i=a.length;for(e=0;e<n&&t[e]===a[e];e++);var s=n-e;for(r=1;r<=s&&t[n-r]===a[i-r];r++);return ll=a.slice(e,1<r?1-r:void 0)}function al(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function il(){return!0}function Ts(){return!1}function ft(e){function t(n,r,a,i,s){this._reactName=n,this._targetInst=a,this.type=r,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(n=e[u],this[u]=n?n(i):i[u]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?il:Ts,this.isPropagationStopped=Ts,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=il)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=il)},persist:function(){},isPersistent:il}),t}var An={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ba=ft(An),gr=p({},An,{view:0,detail:0}),Rc=ft(gr),Sa,Ca,vr,sl=p({},gr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:_a,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==vr&&(vr&&e.type==="mousemove"?(Sa=e.screenX-vr.screenX,Ca=e.screenY-vr.screenY):Ca=Sa=0,vr=e),Sa)},movementY:function(e){return"movementY"in e?e.movementY:Ca}}),Ls=ft(sl),Ac=p({},sl,{dataTransfer:0}),Dc=ft(Ac),Oc=p({},gr,{relatedTarget:0}),Ea=ft(Oc),$c=p({},An,{animationName:0,elapsedTime:0,pseudoElement:0}),Bc=ft($c),Vc=p({},An,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Uc=ft(Vc),Wc=p({},An,{data:0}),Is=ft(Wc),Kc={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Hc={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Qc={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Gc(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Qc[e])?!!t[e]:!1}function _a(){return Gc}var Yc=p({},gr,{key:function(e){if(e.key){var t=Kc[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=al(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Hc[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:_a,charCode:function(e){return e.type==="keypress"?al(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?al(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),qc=ft(Yc),Xc=p({},sl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Rs=ft(Xc),Zc=p({},gr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:_a}),Jc=ft(Zc),ed=p({},An,{propertyName:0,elapsedTime:0,pseudoElement:0}),td=ft(ed),nd=p({},sl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),rd=ft(nd),ld=[9,13,27,32],za=H&&"CompositionEvent"in window,xr=null;H&&"documentMode"in document&&(xr=document.documentMode);var ad=H&&"TextEvent"in window&&!xr,As=H&&(!za||xr&&8<xr&&11>=xr),Ds=" ",Os=!1;function $s(e,t){switch(e){case"keyup":return ld.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Bs(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Dn=!1;function id(e,t){switch(e){case"compositionend":return Bs(t);case"keypress":return t.which!==32?null:(Os=!0,Ds);case"textInput":return e=t.data,e===Ds&&Os?null:e;default:return null}}function sd(e,t){if(Dn)return e==="compositionend"||!za&&$s(e,t)?(e=Fs(),ll=Na=Zt=null,Dn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return As&&t.locale!=="ko"?null:t.data;default:return null}}var od={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Vs(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!od[e.type]:t==="textarea"}function Us(e,t,n,r){us(r),t=pl(t,"onChange"),0<t.length&&(n=new ba("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var yr=null,wr=null;function ud(e){so(e,0)}function ol(e){var t=Un(e);if(Ne(t))return e}function cd(e,t){if(e==="change")return t}var Ws=!1;if(H){var Ma;if(H){var Pa="oninput"in document;if(!Pa){var Ks=document.createElement("div");Ks.setAttribute("oninput","return;"),Pa=typeof Ks.oninput=="function"}Ma=Pa}else Ma=!1;Ws=Ma&&(!document.documentMode||9<document.documentMode)}function Hs(){yr&&(yr.detachEvent("onpropertychange",Qs),wr=yr=null)}function Qs(e){if(e.propertyName==="value"&&ol(wr)){var t=[];Us(t,wr,e,ca(e)),fs(ud,t)}}function dd(e,t,n){e==="focusin"?(Hs(),yr=t,wr=n,yr.attachEvent("onpropertychange",Qs)):e==="focusout"&&Hs()}function pd(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ol(wr)}function fd(e,t){if(e==="click")return ol(t)}function md(e,t){if(e==="input"||e==="change")return ol(t)}function hd(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Et=typeof Object.is=="function"?Object.is:hd;function kr(e,t){if(Et(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var a=n[r];if(!D.call(t,a)||!Et(e[a],t[a]))return!1}return!0}function Gs(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ys(e,t){var n=Gs(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Gs(n)}}function qs(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?qs(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Xs(){for(var e=window,t=ue();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=ue(e.document)}return t}function Fa(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function gd(e){var t=Xs(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&qs(n.ownerDocument.documentElement,n)){if(r!==null&&Fa(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var a=n.textContent.length,i=Math.min(r.start,a);r=r.end===void 0?i:Math.min(r.end,a),!e.extend&&i>r&&(a=r,r=i,i=a),a=Ys(n,i);var s=Ys(n,r);a&&s&&(e.rangeCount!==1||e.anchorNode!==a.node||e.anchorOffset!==a.offset||e.focusNode!==s.node||e.focusOffset!==s.offset)&&(t=t.createRange(),t.setStart(a.node,a.offset),e.removeAllRanges(),i>r?(e.addRange(t),e.extend(s.node,s.offset)):(t.setEnd(s.node,s.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var vd=H&&"documentMode"in document&&11>=document.documentMode,On=null,Ta=null,jr=null,La=!1;function Zs(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;La||On==null||On!==ue(r)||(r=On,"selectionStart"in r&&Fa(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),jr&&kr(jr,r)||(jr=r,r=pl(Ta,"onSelect"),0<r.length&&(t=new ba("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=On)))}function ul(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var $n={animationend:ul("Animation","AnimationEnd"),animationiteration:ul("Animation","AnimationIteration"),animationstart:ul("Animation","AnimationStart"),transitionend:ul("Transition","TransitionEnd")},Ia={},Js={};H&&(Js=document.createElement("div").style,"AnimationEvent"in window||(delete $n.animationend.animation,delete $n.animationiteration.animation,delete $n.animationstart.animation),"TransitionEvent"in window||delete $n.transitionend.transition);function cl(e){if(Ia[e])return Ia[e];if(!$n[e])return e;var t=$n[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Js)return Ia[e]=t[n];return e}var eo=cl("animationend"),to=cl("animationiteration"),no=cl("animationstart"),ro=cl("transitionend"),lo=new Map,ao="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Jt(e,t){lo.set(e,t),A(t,[e])}for(var Ra=0;Ra<ao.length;Ra++){var Aa=ao[Ra],xd=Aa.toLowerCase(),yd=Aa[0].toUpperCase()+Aa.slice(1);Jt(xd,"on"+yd)}Jt(eo,"onAnimationEnd"),Jt(to,"onAnimationIteration"),Jt(no,"onAnimationStart"),Jt("dblclick","onDoubleClick"),Jt("focusin","onFocus"),Jt("focusout","onBlur"),Jt(ro,"onTransitionEnd"),O("onMouseEnter",["mouseout","mouseover"]),O("onMouseLeave",["mouseout","mouseover"]),O("onPointerEnter",["pointerout","pointerover"]),O("onPointerLeave",["pointerout","pointerover"]),A("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),A("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),A("onBeforeInput",["compositionend","keypress","textInput","paste"]),A("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),A("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),A("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Nr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),wd=new Set("cancel close invalid load scroll toggle".split(" ").concat(Nr));function io(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,xc(r,t,void 0,e),e.currentTarget=null}function so(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],a=r.event;r=r.listeners;e:{var i=void 0;if(t)for(var s=r.length-1;0<=s;s--){var u=r[s],d=u.instance,x=u.currentTarget;if(u=u.listener,d!==i&&a.isPropagationStopped())break e;io(a,u,x),i=d}else for(s=0;s<r.length;s++){if(u=r[s],d=u.instance,x=u.currentTarget,u=u.listener,d!==i&&a.isPropagationStopped())break e;io(a,u,x),i=d}}}if(Gr)throw e=ma,Gr=!1,ma=null,e}function Ee(e,t){var n=t[Ka];n===void 0&&(n=t[Ka]=new Set);var r=e+"__bubble";n.has(r)||(oo(t,e,2,!1),n.add(r))}function Da(e,t,n){var r=0;t&&(r|=4),oo(n,e,r,t)}var dl="_reactListening"+Math.random().toString(36).slice(2);function br(e){if(!e[dl]){e[dl]=!0,b.forEach(function(n){n!=="selectionchange"&&(wd.has(n)||Da(n,!1,e),Da(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[dl]||(t[dl]=!0,Da("selectionchange",!1,t))}}function oo(e,t,n,r){switch(Ps(t)){case 1:var a=Lc;break;case 4:a=Ic;break;default:a=ka}n=a.bind(null,t,n,e),a=void 0,!fa||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(a=!0),r?a!==void 0?e.addEventListener(t,n,{capture:!0,passive:a}):e.addEventListener(t,n,!0):a!==void 0?e.addEventListener(t,n,{passive:a}):e.addEventListener(t,n,!1)}function Oa(e,t,n,r,a){var i=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var u=r.stateNode.containerInfo;if(u===a||u.nodeType===8&&u.parentNode===a)break;if(s===4)for(s=r.return;s!==null;){var d=s.tag;if((d===3||d===4)&&(d=s.stateNode.containerInfo,d===a||d.nodeType===8&&d.parentNode===a))return;s=s.return}for(;u!==null;){if(s=wn(u),s===null)return;if(d=s.tag,d===5||d===6){r=i=s;continue e}u=u.parentNode}}r=r.return}fs(function(){var x=i,N=ca(n),S=[];e:{var k=lo.get(e);if(k!==void 0){var B=ba,K=e;switch(e){case"keypress":if(al(n)===0)break e;case"keydown":case"keyup":B=qc;break;case"focusin":K="focus",B=Ea;break;case"focusout":K="blur",B=Ea;break;case"beforeblur":case"afterblur":B=Ea;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":B=Ls;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":B=Dc;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":B=Jc;break;case eo:case to:case no:B=Bc;break;case ro:B=td;break;case"scroll":B=Rc;break;case"wheel":B=rd;break;case"copy":case"cut":case"paste":B=Uc;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":B=Rs}var G=(t&4)!==0,Ae=!G&&e==="scroll",h=G?k!==null?k+"Capture":null:k;G=[];for(var f=x,v;f!==null;){v=f;var E=v.stateNode;if(v.tag===5&&E!==null&&(v=E,h!==null&&(E=ir(f,h),E!=null&&G.push(Sr(f,E,v)))),Ae)break;f=f.return}0<G.length&&(k=new B(k,K,null,n,N),S.push({event:k,listeners:G}))}}if((t&7)===0){e:{if(k=e==="mouseover"||e==="pointerover",B=e==="mouseout"||e==="pointerout",k&&n!==ua&&(K=n.relatedTarget||n.fromElement)&&(wn(K)||K[Dt]))break e;if((B||k)&&(k=N.window===N?N:(k=N.ownerDocument)?k.defaultView||k.parentWindow:window,B?(K=n.relatedTarget||n.toElement,B=x,K=K?wn(K):null,K!==null&&(Ae=yn(K),K!==Ae||K.tag!==5&&K.tag!==6)&&(K=null)):(B=null,K=x),B!==K)){if(G=Ls,E="onMouseLeave",h="onMouseEnter",f="mouse",(e==="pointerout"||e==="pointerover")&&(G=Rs,E="onPointerLeave",h="onPointerEnter",f="pointer"),Ae=B==null?k:Un(B),v=K==null?k:Un(K),k=new G(E,f+"leave",B,n,N),k.target=Ae,k.relatedTarget=v,E=null,wn(N)===x&&(G=new G(h,f+"enter",K,n,N),G.target=v,G.relatedTarget=Ae,E=G),Ae=E,B&&K)t:{for(G=B,h=K,f=0,v=G;v;v=Bn(v))f++;for(v=0,E=h;E;E=Bn(E))v++;for(;0<f-v;)G=Bn(G),f--;for(;0<v-f;)h=Bn(h),v--;for(;f--;){if(G===h||h!==null&&G===h.alternate)break t;G=Bn(G),h=Bn(h)}G=null}else G=null;B!==null&&uo(S,k,B,G,!1),K!==null&&Ae!==null&&uo(S,Ae,K,G,!0)}}e:{if(k=x?Un(x):window,B=k.nodeName&&k.nodeName.toLowerCase(),B==="select"||B==="input"&&k.type==="file")var Y=cd;else if(Vs(k))if(Ws)Y=md;else{Y=pd;var ne=dd}else(B=k.nodeName)&&B.toLowerCase()==="input"&&(k.type==="checkbox"||k.type==="radio")&&(Y=fd);if(Y&&(Y=Y(e,x))){Us(S,Y,n,N);break e}ne&&ne(e,k,x),e==="focusout"&&(ne=k._wrapperState)&&ne.controlled&&k.type==="number"&&at(k,"number",k.value)}switch(ne=x?Un(x):window,e){case"focusin":(Vs(ne)||ne.contentEditable==="true")&&(On=ne,Ta=x,jr=null);break;case"focusout":jr=Ta=On=null;break;case"mousedown":La=!0;break;case"contextmenu":case"mouseup":case"dragend":La=!1,Zs(S,n,N);break;case"selectionchange":if(vd)break;case"keydown":case"keyup":Zs(S,n,N)}var re;if(za)e:{switch(e){case"compositionstart":var ae="onCompositionStart";break e;case"compositionend":ae="onCompositionEnd";break e;case"compositionupdate":ae="onCompositionUpdate";break e}ae=void 0}else Dn?$s(e,n)&&(ae="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(ae="onCompositionStart");ae&&(As&&n.locale!=="ko"&&(Dn||ae!=="onCompositionStart"?ae==="onCompositionEnd"&&Dn&&(re=Fs()):(Zt=N,Na="value"in Zt?Zt.value:Zt.textContent,Dn=!0)),ne=pl(x,ae),0<ne.length&&(ae=new Is(ae,e,null,n,N),S.push({event:ae,listeners:ne}),re?ae.data=re:(re=Bs(n),re!==null&&(ae.data=re)))),(re=ad?id(e,n):sd(e,n))&&(x=pl(x,"onBeforeInput"),0<x.length&&(N=new Is("onBeforeInput","beforeinput",null,n,N),S.push({event:N,listeners:x}),N.data=re))}so(S,t)})}function Sr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function pl(e,t){for(var n=t+"Capture",r=[];e!==null;){var a=e,i=a.stateNode;a.tag===5&&i!==null&&(a=i,i=ir(e,n),i!=null&&r.unshift(Sr(e,i,a)),i=ir(e,t),i!=null&&r.push(Sr(e,i,a))),e=e.return}return r}function Bn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function uo(e,t,n,r,a){for(var i=t._reactName,s=[];n!==null&&n!==r;){var u=n,d=u.alternate,x=u.stateNode;if(d!==null&&d===r)break;u.tag===5&&x!==null&&(u=x,a?(d=ir(n,i),d!=null&&s.unshift(Sr(n,d,u))):a||(d=ir(n,i),d!=null&&s.push(Sr(n,d,u)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var kd=/\r\n?/g,jd=/\u0000|\uFFFD/g;function co(e){return(typeof e=="string"?e:""+e).replace(kd,`
`).replace(jd,"")}function fl(e,t,n){if(t=co(t),co(e)!==t&&n)throw Error(m(425))}function ml(){}var $a=null,Ba=null;function Va(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Ua=typeof setTimeout=="function"?setTimeout:void 0,Nd=typeof clearTimeout=="function"?clearTimeout:void 0,po=typeof Promise=="function"?Promise:void 0,bd=typeof queueMicrotask=="function"?queueMicrotask:typeof po<"u"?function(e){return po.resolve(null).then(e).catch(Sd)}:Ua;function Sd(e){setTimeout(function(){throw e})}function Wa(e,t){var n=t,r=0;do{var a=n.nextSibling;if(e.removeChild(n),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(r===0){e.removeChild(a),hr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=a}while(n);hr(t)}function en(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function fo(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Vn=Math.random().toString(36).slice(2),Lt="__reactFiber$"+Vn,Cr="__reactProps$"+Vn,Dt="__reactContainer$"+Vn,Ka="__reactEvents$"+Vn,Cd="__reactListeners$"+Vn,Ed="__reactHandles$"+Vn;function wn(e){var t=e[Lt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Dt]||n[Lt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=fo(e);e!==null;){if(n=e[Lt])return n;e=fo(e)}return t}e=n,n=e.parentNode}return null}function Er(e){return e=e[Lt]||e[Dt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Un(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(m(33))}function hl(e){return e[Cr]||null}var Ha=[],Wn=-1;function tn(e){return{current:e}}function _e(e){0>Wn||(e.current=Ha[Wn],Ha[Wn]=null,Wn--)}function Ce(e,t){Wn++,Ha[Wn]=e.current,e.current=t}var nn={},Je=tn(nn),st=tn(!1),kn=nn;function Kn(e,t){var n=e.type.contextTypes;if(!n)return nn;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var a={},i;for(i in n)a[i]=t[i];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=a),a}function ot(e){return e=e.childContextTypes,e!=null}function gl(){_e(st),_e(Je)}function mo(e,t,n){if(Je.current!==nn)throw Error(m(168));Ce(Je,t),Ce(st,n)}function ho(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var a in r)if(!(a in t))throw Error(m(108,L(e)||"Unknown",a));return p({},n,r)}function vl(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||nn,kn=Je.current,Ce(Je,e),Ce(st,st.current),!0}function go(e,t,n){var r=e.stateNode;if(!r)throw Error(m(169));n?(e=ho(e,t,kn),r.__reactInternalMemoizedMergedChildContext=e,_e(st),_e(Je),Ce(Je,e)):_e(st),Ce(st,n)}var Ot=null,xl=!1,Qa=!1;function vo(e){Ot===null?Ot=[e]:Ot.push(e)}function _d(e){xl=!0,vo(e)}function rn(){if(!Qa&&Ot!==null){Qa=!0;var e=0,t=je;try{var n=Ot;for(je=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Ot=null,xl=!1}catch(a){throw Ot!==null&&(Ot=Ot.slice(e+1)),xs(ha,rn),a}finally{je=t,Qa=!1}}return null}var Hn=[],Qn=0,yl=null,wl=0,wt=[],kt=0,jn=null,$t=1,Bt="";function Nn(e,t){Hn[Qn++]=wl,Hn[Qn++]=yl,yl=e,wl=t}function xo(e,t,n){wt[kt++]=$t,wt[kt++]=Bt,wt[kt++]=jn,jn=e;var r=$t;e=Bt;var a=32-Ct(r)-1;r&=~(1<<a),n+=1;var i=32-Ct(t)+a;if(30<i){var s=a-a%5;i=(r&(1<<s)-1).toString(32),r>>=s,a-=s,$t=1<<32-Ct(t)+a|n<<a|r,Bt=i+e}else $t=1<<i|n<<a|r,Bt=e}function Ga(e){e.return!==null&&(Nn(e,1),xo(e,1,0))}function Ya(e){for(;e===yl;)yl=Hn[--Qn],Hn[Qn]=null,wl=Hn[--Qn],Hn[Qn]=null;for(;e===jn;)jn=wt[--kt],wt[kt]=null,Bt=wt[--kt],wt[kt]=null,$t=wt[--kt],wt[kt]=null}var mt=null,ht=null,Me=!1,_t=null;function yo(e,t){var n=St(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function wo(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,mt=e,ht=en(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,mt=e,ht=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=jn!==null?{id:$t,overflow:Bt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=St(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,mt=e,ht=null,!0):!1;default:return!1}}function qa(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Xa(e){if(Me){var t=ht;if(t){var n=t;if(!wo(e,t)){if(qa(e))throw Error(m(418));t=en(n.nextSibling);var r=mt;t&&wo(e,t)?yo(r,n):(e.flags=e.flags&-4097|2,Me=!1,mt=e)}}else{if(qa(e))throw Error(m(418));e.flags=e.flags&-4097|2,Me=!1,mt=e}}}function ko(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;mt=e}function kl(e){if(e!==mt)return!1;if(!Me)return ko(e),Me=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Va(e.type,e.memoizedProps)),t&&(t=ht)){if(qa(e))throw jo(),Error(m(418));for(;t;)yo(e,t),t=en(t.nextSibling)}if(ko(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(m(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){ht=en(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}ht=null}}else ht=mt?en(e.stateNode.nextSibling):null;return!0}function jo(){for(var e=ht;e;)e=en(e.nextSibling)}function Gn(){ht=mt=null,Me=!1}function Za(e){_t===null?_t=[e]:_t.push(e)}var zd=se.ReactCurrentBatchConfig;function _r(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(m(309));var r=n.stateNode}if(!r)throw Error(m(147,e));var a=r,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(s){var u=a.refs;s===null?delete u[i]:u[i]=s},t._stringRef=i,t)}if(typeof e!="string")throw Error(m(284));if(!n._owner)throw Error(m(290,e))}return e}function jl(e,t){throw e=Object.prototype.toString.call(t),Error(m(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function No(e){var t=e._init;return t(e._payload)}function bo(e){function t(h,f){if(e){var v=h.deletions;v===null?(h.deletions=[f],h.flags|=16):v.push(f)}}function n(h,f){if(!e)return null;for(;f!==null;)t(h,f),f=f.sibling;return null}function r(h,f){for(h=new Map;f!==null;)f.key!==null?h.set(f.key,f):h.set(f.index,f),f=f.sibling;return h}function a(h,f){return h=pn(h,f),h.index=0,h.sibling=null,h}function i(h,f,v){return h.index=v,e?(v=h.alternate,v!==null?(v=v.index,v<f?(h.flags|=2,f):v):(h.flags|=2,f)):(h.flags|=1048576,f)}function s(h){return e&&h.alternate===null&&(h.flags|=2),h}function u(h,f,v,E){return f===null||f.tag!==6?(f=Ui(v,h.mode,E),f.return=h,f):(f=a(f,v),f.return=h,f)}function d(h,f,v,E){var Y=v.type;return Y===ve?N(h,f,v.props.children,E,v.key):f!==null&&(f.elementType===Y||typeof Y=="object"&&Y!==null&&Y.$$typeof===Oe&&No(Y)===f.type)?(E=a(f,v.props),E.ref=_r(h,f,v),E.return=h,E):(E=Hl(v.type,v.key,v.props,null,h.mode,E),E.ref=_r(h,f,v),E.return=h,E)}function x(h,f,v,E){return f===null||f.tag!==4||f.stateNode.containerInfo!==v.containerInfo||f.stateNode.implementation!==v.implementation?(f=Wi(v,h.mode,E),f.return=h,f):(f=a(f,v.children||[]),f.return=h,f)}function N(h,f,v,E,Y){return f===null||f.tag!==7?(f=Pn(v,h.mode,E,Y),f.return=h,f):(f=a(f,v),f.return=h,f)}function S(h,f,v){if(typeof f=="string"&&f!==""||typeof f=="number")return f=Ui(""+f,h.mode,v),f.return=h,f;if(typeof f=="object"&&f!==null){switch(f.$$typeof){case _:return v=Hl(f.type,f.key,f.props,null,h.mode,v),v.ref=_r(h,null,f),v.return=h,v;case pe:return f=Wi(f,h.mode,v),f.return=h,f;case Oe:var E=f._init;return S(h,E(f._payload),v)}if($e(f)||J(f))return f=Pn(f,h.mode,v,null),f.return=h,f;jl(h,f)}return null}function k(h,f,v,E){var Y=f!==null?f.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return Y!==null?null:u(h,f,""+v,E);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case _:return v.key===Y?d(h,f,v,E):null;case pe:return v.key===Y?x(h,f,v,E):null;case Oe:return Y=v._init,k(h,f,Y(v._payload),E)}if($e(v)||J(v))return Y!==null?null:N(h,f,v,E,null);jl(h,v)}return null}function B(h,f,v,E,Y){if(typeof E=="string"&&E!==""||typeof E=="number")return h=h.get(v)||null,u(f,h,""+E,Y);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case _:return h=h.get(E.key===null?v:E.key)||null,d(f,h,E,Y);case pe:return h=h.get(E.key===null?v:E.key)||null,x(f,h,E,Y);case Oe:var ne=E._init;return B(h,f,v,ne(E._payload),Y)}if($e(E)||J(E))return h=h.get(v)||null,N(f,h,E,Y,null);jl(f,E)}return null}function K(h,f,v,E){for(var Y=null,ne=null,re=f,ae=f=0,Ge=null;re!==null&&ae<v.length;ae++){re.index>ae?(Ge=re,re=null):Ge=re.sibling;var ke=k(h,re,v[ae],E);if(ke===null){re===null&&(re=Ge);break}e&&re&&ke.alternate===null&&t(h,re),f=i(ke,f,ae),ne===null?Y=ke:ne.sibling=ke,ne=ke,re=Ge}if(ae===v.length)return n(h,re),Me&&Nn(h,ae),Y;if(re===null){for(;ae<v.length;ae++)re=S(h,v[ae],E),re!==null&&(f=i(re,f,ae),ne===null?Y=re:ne.sibling=re,ne=re);return Me&&Nn(h,ae),Y}for(re=r(h,re);ae<v.length;ae++)Ge=B(re,h,ae,v[ae],E),Ge!==null&&(e&&Ge.alternate!==null&&re.delete(Ge.key===null?ae:Ge.key),f=i(Ge,f,ae),ne===null?Y=Ge:ne.sibling=Ge,ne=Ge);return e&&re.forEach(function(fn){return t(h,fn)}),Me&&Nn(h,ae),Y}function G(h,f,v,E){var Y=J(v);if(typeof Y!="function")throw Error(m(150));if(v=Y.call(v),v==null)throw Error(m(151));for(var ne=Y=null,re=f,ae=f=0,Ge=null,ke=v.next();re!==null&&!ke.done;ae++,ke=v.next()){re.index>ae?(Ge=re,re=null):Ge=re.sibling;var fn=k(h,re,ke.value,E);if(fn===null){re===null&&(re=Ge);break}e&&re&&fn.alternate===null&&t(h,re),f=i(fn,f,ae),ne===null?Y=fn:ne.sibling=fn,ne=fn,re=Ge}if(ke.done)return n(h,re),Me&&Nn(h,ae),Y;if(re===null){for(;!ke.done;ae++,ke=v.next())ke=S(h,ke.value,E),ke!==null&&(f=i(ke,f,ae),ne===null?Y=ke:ne.sibling=ke,ne=ke);return Me&&Nn(h,ae),Y}for(re=r(h,re);!ke.done;ae++,ke=v.next())ke=B(re,h,ae,ke.value,E),ke!==null&&(e&&ke.alternate!==null&&re.delete(ke.key===null?ae:ke.key),f=i(ke,f,ae),ne===null?Y=ke:ne.sibling=ke,ne=ke);return e&&re.forEach(function(op){return t(h,op)}),Me&&Nn(h,ae),Y}function Ae(h,f,v,E){if(typeof v=="object"&&v!==null&&v.type===ve&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case _:e:{for(var Y=v.key,ne=f;ne!==null;){if(ne.key===Y){if(Y=v.type,Y===ve){if(ne.tag===7){n(h,ne.sibling),f=a(ne,v.props.children),f.return=h,h=f;break e}}else if(ne.elementType===Y||typeof Y=="object"&&Y!==null&&Y.$$typeof===Oe&&No(Y)===ne.type){n(h,ne.sibling),f=a(ne,v.props),f.ref=_r(h,ne,v),f.return=h,h=f;break e}n(h,ne);break}else t(h,ne);ne=ne.sibling}v.type===ve?(f=Pn(v.props.children,h.mode,E,v.key),f.return=h,h=f):(E=Hl(v.type,v.key,v.props,null,h.mode,E),E.ref=_r(h,f,v),E.return=h,h=E)}return s(h);case pe:e:{for(ne=v.key;f!==null;){if(f.key===ne)if(f.tag===4&&f.stateNode.containerInfo===v.containerInfo&&f.stateNode.implementation===v.implementation){n(h,f.sibling),f=a(f,v.children||[]),f.return=h,h=f;break e}else{n(h,f);break}else t(h,f);f=f.sibling}f=Wi(v,h.mode,E),f.return=h,h=f}return s(h);case Oe:return ne=v._init,Ae(h,f,ne(v._payload),E)}if($e(v))return K(h,f,v,E);if(J(v))return G(h,f,v,E);jl(h,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,f!==null&&f.tag===6?(n(h,f.sibling),f=a(f,v),f.return=h,h=f):(n(h,f),f=Ui(v,h.mode,E),f.return=h,h=f),s(h)):n(h,f)}return Ae}var Yn=bo(!0),So=bo(!1),Nl=tn(null),bl=null,qn=null,Ja=null;function ei(){Ja=qn=bl=null}function ti(e){var t=Nl.current;_e(Nl),e._currentValue=t}function ni(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Xn(e,t){bl=e,Ja=qn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(ut=!0),e.firstContext=null)}function jt(e){var t=e._currentValue;if(Ja!==e)if(e={context:e,memoizedValue:t,next:null},qn===null){if(bl===null)throw Error(m(308));qn=e,bl.dependencies={lanes:0,firstContext:e}}else qn=qn.next=e;return t}var bn=null;function ri(e){bn===null?bn=[e]:bn.push(e)}function Co(e,t,n,r){var a=t.interleaved;return a===null?(n.next=n,ri(t)):(n.next=a.next,a.next=n),t.interleaved=n,Vt(e,r)}function Vt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var ln=!1;function li(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Eo(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Ut(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function an(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(we&2)!==0){var a=r.pending;return a===null?t.next=t:(t.next=a.next,a.next=t),r.pending=t,Vt(e,n)}return a=r.interleaved,a===null?(t.next=t,ri(r)):(t.next=a.next,a.next=t),r.interleaved=t,Vt(e,n)}function Sl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,xa(e,n)}}function _o(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var a=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?a=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?a=i=t:i=i.next=t}else a=i=t;n={baseState:r.baseState,firstBaseUpdate:a,lastBaseUpdate:i,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Cl(e,t,n,r){var a=e.updateQueue;ln=!1;var i=a.firstBaseUpdate,s=a.lastBaseUpdate,u=a.shared.pending;if(u!==null){a.shared.pending=null;var d=u,x=d.next;d.next=null,s===null?i=x:s.next=x,s=d;var N=e.alternate;N!==null&&(N=N.updateQueue,u=N.lastBaseUpdate,u!==s&&(u===null?N.firstBaseUpdate=x:u.next=x,N.lastBaseUpdate=d))}if(i!==null){var S=a.baseState;s=0,N=x=d=null,u=i;do{var k=u.lane,B=u.eventTime;if((r&k)===k){N!==null&&(N=N.next={eventTime:B,lane:0,tag:u.tag,payload:u.payload,callback:u.callback,next:null});e:{var K=e,G=u;switch(k=t,B=n,G.tag){case 1:if(K=G.payload,typeof K=="function"){S=K.call(B,S,k);break e}S=K;break e;case 3:K.flags=K.flags&-65537|128;case 0:if(K=G.payload,k=typeof K=="function"?K.call(B,S,k):K,k==null)break e;S=p({},S,k);break e;case 2:ln=!0}}u.callback!==null&&u.lane!==0&&(e.flags|=64,k=a.effects,k===null?a.effects=[u]:k.push(u))}else B={eventTime:B,lane:k,tag:u.tag,payload:u.payload,callback:u.callback,next:null},N===null?(x=N=B,d=S):N=N.next=B,s|=k;if(u=u.next,u===null){if(u=a.shared.pending,u===null)break;k=u,u=k.next,k.next=null,a.lastBaseUpdate=k,a.shared.pending=null}}while(!0);if(N===null&&(d=S),a.baseState=d,a.firstBaseUpdate=x,a.lastBaseUpdate=N,t=a.shared.interleaved,t!==null){a=t;do s|=a.lane,a=a.next;while(a!==t)}else i===null&&(a.shared.lanes=0);En|=s,e.lanes=s,e.memoizedState=S}}function zo(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],a=r.callback;if(a!==null){if(r.callback=null,r=n,typeof a!="function")throw Error(m(191,a));a.call(r)}}}var zr={},It=tn(zr),Mr=tn(zr),Pr=tn(zr);function Sn(e){if(e===zr)throw Error(m(174));return e}function ai(e,t){switch(Ce(Pr,t),Ce(Mr,e),Ce(It,zr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:vn(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=vn(t,e)}_e(It),Ce(It,t)}function Zn(){_e(It),_e(Mr),_e(Pr)}function Mo(e){Sn(Pr.current);var t=Sn(It.current),n=vn(t,e.type);t!==n&&(Ce(Mr,e),Ce(It,n))}function ii(e){Mr.current===e&&(_e(It),_e(Mr))}var Te=tn(0);function El(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var si=[];function oi(){for(var e=0;e<si.length;e++)si[e]._workInProgressVersionPrimary=null;si.length=0}var _l=se.ReactCurrentDispatcher,ui=se.ReactCurrentBatchConfig,Cn=0,Le=null,Ue=null,He=null,zl=!1,Fr=!1,Tr=0,Md=0;function et(){throw Error(m(321))}function ci(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Et(e[n],t[n]))return!1;return!0}function di(e,t,n,r,a,i){if(Cn=i,Le=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,_l.current=e===null||e.memoizedState===null?Ld:Id,e=n(r,a),Fr){i=0;do{if(Fr=!1,Tr=0,25<=i)throw Error(m(301));i+=1,He=Ue=null,t.updateQueue=null,_l.current=Rd,e=n(r,a)}while(Fr)}if(_l.current=Fl,t=Ue!==null&&Ue.next!==null,Cn=0,He=Ue=Le=null,zl=!1,t)throw Error(m(300));return e}function pi(){var e=Tr!==0;return Tr=0,e}function Rt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return He===null?Le.memoizedState=He=e:He=He.next=e,He}function Nt(){if(Ue===null){var e=Le.alternate;e=e!==null?e.memoizedState:null}else e=Ue.next;var t=He===null?Le.memoizedState:He.next;if(t!==null)He=t,Ue=e;else{if(e===null)throw Error(m(310));Ue=e,e={memoizedState:Ue.memoizedState,baseState:Ue.baseState,baseQueue:Ue.baseQueue,queue:Ue.queue,next:null},He===null?Le.memoizedState=He=e:He=He.next=e}return He}function Lr(e,t){return typeof t=="function"?t(e):t}function fi(e){var t=Nt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=Ue,a=r.baseQueue,i=n.pending;if(i!==null){if(a!==null){var s=a.next;a.next=i.next,i.next=s}r.baseQueue=a=i,n.pending=null}if(a!==null){i=a.next,r=r.baseState;var u=s=null,d=null,x=i;do{var N=x.lane;if((Cn&N)===N)d!==null&&(d=d.next={lane:0,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null}),r=x.hasEagerState?x.eagerState:e(r,x.action);else{var S={lane:N,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null};d===null?(u=d=S,s=r):d=d.next=S,Le.lanes|=N,En|=N}x=x.next}while(x!==null&&x!==i);d===null?s=r:d.next=u,Et(r,t.memoizedState)||(ut=!0),t.memoizedState=r,t.baseState=s,t.baseQueue=d,n.lastRenderedState=r}if(e=n.interleaved,e!==null){a=e;do i=a.lane,Le.lanes|=i,En|=i,a=a.next;while(a!==e)}else a===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function mi(e){var t=Nt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,i=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do i=e(i,s.action),s=s.next;while(s!==a);Et(i,t.memoizedState)||(ut=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,r]}function Po(){}function Fo(e,t){var n=Le,r=Nt(),a=t(),i=!Et(r.memoizedState,a);if(i&&(r.memoizedState=a,ut=!0),r=r.queue,hi(Io.bind(null,n,r,e),[e]),r.getSnapshot!==t||i||He!==null&&He.memoizedState.tag&1){if(n.flags|=2048,Ir(9,Lo.bind(null,n,r,a,t),void 0,null),Qe===null)throw Error(m(349));(Cn&30)!==0||To(n,t,a)}return a}function To(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Le.updateQueue,t===null?(t={lastEffect:null,stores:null},Le.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Lo(e,t,n,r){t.value=n,t.getSnapshot=r,Ro(t)&&Ao(e)}function Io(e,t,n){return n(function(){Ro(t)&&Ao(e)})}function Ro(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Et(e,n)}catch{return!0}}function Ao(e){var t=Vt(e,1);t!==null&&Ft(t,e,1,-1)}function Do(e){var t=Rt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Lr,lastRenderedState:e},t.queue=e,e=e.dispatch=Td.bind(null,Le,e),[t.memoizedState,e]}function Ir(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=Le.updateQueue,t===null?(t={lastEffect:null,stores:null},Le.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Oo(){return Nt().memoizedState}function Ml(e,t,n,r){var a=Rt();Le.flags|=e,a.memoizedState=Ir(1|t,n,void 0,r===void 0?null:r)}function Pl(e,t,n,r){var a=Nt();r=r===void 0?null:r;var i=void 0;if(Ue!==null){var s=Ue.memoizedState;if(i=s.destroy,r!==null&&ci(r,s.deps)){a.memoizedState=Ir(t,n,i,r);return}}Le.flags|=e,a.memoizedState=Ir(1|t,n,i,r)}function $o(e,t){return Ml(8390656,8,e,t)}function hi(e,t){return Pl(2048,8,e,t)}function Bo(e,t){return Pl(4,2,e,t)}function Vo(e,t){return Pl(4,4,e,t)}function Uo(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Wo(e,t,n){return n=n!=null?n.concat([e]):null,Pl(4,4,Uo.bind(null,t,e),n)}function gi(){}function Ko(e,t){var n=Nt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ci(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ho(e,t){var n=Nt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ci(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Qo(e,t,n){return(Cn&21)===0?(e.baseState&&(e.baseState=!1,ut=!0),e.memoizedState=n):(Et(n,t)||(n=js(),Le.lanes|=n,En|=n,e.baseState=!0),t)}function Pd(e,t){var n=je;je=n!==0&&4>n?n:4,e(!0);var r=ui.transition;ui.transition={};try{e(!1),t()}finally{je=n,ui.transition=r}}function Go(){return Nt().memoizedState}function Fd(e,t,n){var r=cn(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Yo(e))qo(t,n);else if(n=Co(e,t,n,r),n!==null){var a=lt();Ft(n,e,r,a),Xo(n,t,r)}}function Td(e,t,n){var r=cn(e),a={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Yo(e))qo(t,a);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var s=t.lastRenderedState,u=i(s,n);if(a.hasEagerState=!0,a.eagerState=u,Et(u,s)){var d=t.interleaved;d===null?(a.next=a,ri(t)):(a.next=d.next,d.next=a),t.interleaved=a;return}}catch{}finally{}n=Co(e,t,a,r),n!==null&&(a=lt(),Ft(n,e,r,a),Xo(n,t,r))}}function Yo(e){var t=e.alternate;return e===Le||t!==null&&t===Le}function qo(e,t){Fr=zl=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Xo(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,xa(e,n)}}var Fl={readContext:jt,useCallback:et,useContext:et,useEffect:et,useImperativeHandle:et,useInsertionEffect:et,useLayoutEffect:et,useMemo:et,useReducer:et,useRef:et,useState:et,useDebugValue:et,useDeferredValue:et,useTransition:et,useMutableSource:et,useSyncExternalStore:et,useId:et,unstable_isNewReconciler:!1},Ld={readContext:jt,useCallback:function(e,t){return Rt().memoizedState=[e,t===void 0?null:t],e},useContext:jt,useEffect:$o,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ml(4194308,4,Uo.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ml(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ml(4,2,e,t)},useMemo:function(e,t){var n=Rt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Rt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Fd.bind(null,Le,e),[r.memoizedState,e]},useRef:function(e){var t=Rt();return e={current:e},t.memoizedState=e},useState:Do,useDebugValue:gi,useDeferredValue:function(e){return Rt().memoizedState=e},useTransition:function(){var e=Do(!1),t=e[0];return e=Pd.bind(null,e[1]),Rt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=Le,a=Rt();if(Me){if(n===void 0)throw Error(m(407));n=n()}else{if(n=t(),Qe===null)throw Error(m(349));(Cn&30)!==0||To(r,t,n)}a.memoizedState=n;var i={value:n,getSnapshot:t};return a.queue=i,$o(Io.bind(null,r,i,e),[e]),r.flags|=2048,Ir(9,Lo.bind(null,r,i,n,t),void 0,null),n},useId:function(){var e=Rt(),t=Qe.identifierPrefix;if(Me){var n=Bt,r=$t;n=(r&~(1<<32-Ct(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Tr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Md++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Id={readContext:jt,useCallback:Ko,useContext:jt,useEffect:hi,useImperativeHandle:Wo,useInsertionEffect:Bo,useLayoutEffect:Vo,useMemo:Ho,useReducer:fi,useRef:Oo,useState:function(){return fi(Lr)},useDebugValue:gi,useDeferredValue:function(e){var t=Nt();return Qo(t,Ue.memoizedState,e)},useTransition:function(){var e=fi(Lr)[0],t=Nt().memoizedState;return[e,t]},useMutableSource:Po,useSyncExternalStore:Fo,useId:Go,unstable_isNewReconciler:!1},Rd={readContext:jt,useCallback:Ko,useContext:jt,useEffect:hi,useImperativeHandle:Wo,useInsertionEffect:Bo,useLayoutEffect:Vo,useMemo:Ho,useReducer:mi,useRef:Oo,useState:function(){return mi(Lr)},useDebugValue:gi,useDeferredValue:function(e){var t=Nt();return Ue===null?t.memoizedState=e:Qo(t,Ue.memoizedState,e)},useTransition:function(){var e=mi(Lr)[0],t=Nt().memoizedState;return[e,t]},useMutableSource:Po,useSyncExternalStore:Fo,useId:Go,unstable_isNewReconciler:!1};function zt(e,t){if(e&&e.defaultProps){t=p({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function vi(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Tl={isMounted:function(e){return(e=e._reactInternals)?yn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=lt(),a=cn(e),i=Ut(r,a);i.payload=t,n!=null&&(i.callback=n),t=an(e,i,a),t!==null&&(Ft(t,e,a,r),Sl(t,e,a))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=lt(),a=cn(e),i=Ut(r,a);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=an(e,i,a),t!==null&&(Ft(t,e,a,r),Sl(t,e,a))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=lt(),r=cn(e),a=Ut(n,r);a.tag=2,t!=null&&(a.callback=t),t=an(e,a,r),t!==null&&(Ft(t,e,r,n),Sl(t,e,r))}};function Zo(e,t,n,r,a,i,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,i,s):t.prototype&&t.prototype.isPureReactComponent?!kr(n,r)||!kr(a,i):!0}function Jo(e,t,n){var r=!1,a=nn,i=t.contextType;return typeof i=="object"&&i!==null?i=jt(i):(a=ot(t)?kn:Je.current,r=t.contextTypes,i=(r=r!=null)?Kn(e,a):nn),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Tl,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=a,e.__reactInternalMemoizedMaskedChildContext=i),t}function eu(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Tl.enqueueReplaceState(t,t.state,null)}function xi(e,t,n,r){var a=e.stateNode;a.props=n,a.state=e.memoizedState,a.refs={},li(e);var i=t.contextType;typeof i=="object"&&i!==null?a.context=jt(i):(i=ot(t)?kn:Je.current,a.context=Kn(e,i)),a.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(vi(e,t,i,n),a.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(t=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),t!==a.state&&Tl.enqueueReplaceState(a,a.state,null),Cl(e,n,a,r),a.state=e.memoizedState),typeof a.componentDidMount=="function"&&(e.flags|=4194308)}function Jn(e,t){try{var n="",r=t;do n+=R(r),r=r.return;while(r);var a=n}catch(i){a=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:a,digest:null}}function yi(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function wi(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Ad=typeof WeakMap=="function"?WeakMap:Map;function tu(e,t,n){n=Ut(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){$l||($l=!0,Ii=r),wi(e,t)},n}function nu(e,t,n){n=Ut(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var a=t.value;n.payload=function(){return r(a)},n.callback=function(){wi(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){wi(e,t),typeof r!="function"&&(on===null?on=new Set([this]):on.add(this));var s=t.stack;this.componentDidCatch(t.value,{componentStack:s!==null?s:""})}),n}function ru(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Ad;var a=new Set;r.set(t,a)}else a=r.get(t),a===void 0&&(a=new Set,r.set(t,a));a.has(n)||(a.add(n),e=Xd.bind(null,e,t,n),t.then(e,e))}function lu(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function au(e,t,n,r,a){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Ut(-1,1),t.tag=2,an(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=a,e)}var Dd=se.ReactCurrentOwner,ut=!1;function rt(e,t,n,r){t.child=e===null?So(t,null,n,r):Yn(t,e.child,n,r)}function iu(e,t,n,r,a){n=n.render;var i=t.ref;return Xn(t,a),r=di(e,t,n,r,i,a),n=pi(),e!==null&&!ut?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a,Wt(e,t,a)):(Me&&n&&Ga(t),t.flags|=1,rt(e,t,r,a),t.child)}function su(e,t,n,r,a){if(e===null){var i=n.type;return typeof i=="function"&&!Vi(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,ou(e,t,i,r,a)):(e=Hl(n.type,null,r,t,t.mode,a),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,(e.lanes&a)===0){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:kr,n(s,r)&&e.ref===t.ref)return Wt(e,t,a)}return t.flags|=1,e=pn(i,r),e.ref=t.ref,e.return=t,t.child=e}function ou(e,t,n,r,a){if(e!==null){var i=e.memoizedProps;if(kr(i,r)&&e.ref===t.ref)if(ut=!1,t.pendingProps=r=i,(e.lanes&a)!==0)(e.flags&131072)!==0&&(ut=!0);else return t.lanes=e.lanes,Wt(e,t,a)}return ki(e,t,n,r,a)}function uu(e,t,n){var r=t.pendingProps,a=r.children,i=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ce(tr,gt),gt|=n;else{if((n&1073741824)===0)return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,Ce(tr,gt),gt|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,Ce(tr,gt),gt|=r}else i!==null?(r=i.baseLanes|n,t.memoizedState=null):r=n,Ce(tr,gt),gt|=r;return rt(e,t,a,n),t.child}function cu(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ki(e,t,n,r,a){var i=ot(n)?kn:Je.current;return i=Kn(t,i),Xn(t,a),n=di(e,t,n,r,i,a),r=pi(),e!==null&&!ut?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a,Wt(e,t,a)):(Me&&r&&Ga(t),t.flags|=1,rt(e,t,n,a),t.child)}function du(e,t,n,r,a){if(ot(n)){var i=!0;vl(t)}else i=!1;if(Xn(t,a),t.stateNode===null)Il(e,t),Jo(t,n,r),xi(t,n,r,a),r=!0;else if(e===null){var s=t.stateNode,u=t.memoizedProps;s.props=u;var d=s.context,x=n.contextType;typeof x=="object"&&x!==null?x=jt(x):(x=ot(n)?kn:Je.current,x=Kn(t,x));var N=n.getDerivedStateFromProps,S=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function";S||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u!==r||d!==x)&&eu(t,s,r,x),ln=!1;var k=t.memoizedState;s.state=k,Cl(t,r,s,a),d=t.memoizedState,u!==r||k!==d||st.current||ln?(typeof N=="function"&&(vi(t,n,N,r),d=t.memoizedState),(u=ln||Zo(t,n,u,r,k,d,x))?(S||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=d),s.props=r,s.state=d,s.context=x,r=u):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{s=t.stateNode,Eo(e,t),u=t.memoizedProps,x=t.type===t.elementType?u:zt(t.type,u),s.props=x,S=t.pendingProps,k=s.context,d=n.contextType,typeof d=="object"&&d!==null?d=jt(d):(d=ot(n)?kn:Je.current,d=Kn(t,d));var B=n.getDerivedStateFromProps;(N=typeof B=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u!==S||k!==d)&&eu(t,s,r,d),ln=!1,k=t.memoizedState,s.state=k,Cl(t,r,s,a);var K=t.memoizedState;u!==S||k!==K||st.current||ln?(typeof B=="function"&&(vi(t,n,B,r),K=t.memoizedState),(x=ln||Zo(t,n,x,r,k,K,d)||!1)?(N||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(r,K,d),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(r,K,d)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||u===e.memoizedProps&&k===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&k===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=K),s.props=r,s.state=K,s.context=d,r=x):(typeof s.componentDidUpdate!="function"||u===e.memoizedProps&&k===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&k===e.memoizedState||(t.flags|=1024),r=!1)}return ji(e,t,n,r,i,a)}function ji(e,t,n,r,a,i){cu(e,t);var s=(t.flags&128)!==0;if(!r&&!s)return a&&go(t,n,!1),Wt(e,t,i);r=t.stateNode,Dd.current=t;var u=s&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&s?(t.child=Yn(t,e.child,null,i),t.child=Yn(t,null,u,i)):rt(e,t,u,i),t.memoizedState=r.state,a&&go(t,n,!0),t.child}function pu(e){var t=e.stateNode;t.pendingContext?mo(e,t.pendingContext,t.pendingContext!==t.context):t.context&&mo(e,t.context,!1),ai(e,t.containerInfo)}function fu(e,t,n,r,a){return Gn(),Za(a),t.flags|=256,rt(e,t,n,r),t.child}var Ni={dehydrated:null,treeContext:null,retryLane:0};function bi(e){return{baseLanes:e,cachePool:null,transitions:null}}function mu(e,t,n){var r=t.pendingProps,a=Te.current,i=!1,s=(t.flags&128)!==0,u;if((u=s)||(u=e!==null&&e.memoizedState===null?!1:(a&2)!==0),u?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(a|=1),Ce(Te,a&1),e===null)return Xa(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(s=r.children,e=r.fallback,i?(r=t.mode,i=t.child,s={mode:"hidden",children:s},(r&1)===0&&i!==null?(i.childLanes=0,i.pendingProps=s):i=Ql(s,r,0,null),e=Pn(e,r,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=bi(n),t.memoizedState=Ni,e):Si(t,s));if(a=e.memoizedState,a!==null&&(u=a.dehydrated,u!==null))return Od(e,t,s,r,u,a,n);if(i){i=r.fallback,s=t.mode,a=e.child,u=a.sibling;var d={mode:"hidden",children:r.children};return(s&1)===0&&t.child!==a?(r=t.child,r.childLanes=0,r.pendingProps=d,t.deletions=null):(r=pn(a,d),r.subtreeFlags=a.subtreeFlags&14680064),u!==null?i=pn(u,i):(i=Pn(i,s,n,null),i.flags|=2),i.return=t,r.return=t,r.sibling=i,t.child=r,r=i,i=t.child,s=e.child.memoizedState,s=s===null?bi(n):{baseLanes:s.baseLanes|n,cachePool:null,transitions:s.transitions},i.memoizedState=s,i.childLanes=e.childLanes&~n,t.memoizedState=Ni,r}return i=e.child,e=i.sibling,r=pn(i,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function Si(e,t){return t=Ql({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Ll(e,t,n,r){return r!==null&&Za(r),Yn(t,e.child,null,n),e=Si(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Od(e,t,n,r,a,i,s){if(n)return t.flags&256?(t.flags&=-257,r=yi(Error(m(422))),Ll(e,t,s,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=r.fallback,a=t.mode,r=Ql({mode:"visible",children:r.children},a,0,null),i=Pn(i,a,s,null),i.flags|=2,r.return=t,i.return=t,r.sibling=i,t.child=r,(t.mode&1)!==0&&Yn(t,e.child,null,s),t.child.memoizedState=bi(s),t.memoizedState=Ni,i);if((t.mode&1)===0)return Ll(e,t,s,null);if(a.data==="$!"){if(r=a.nextSibling&&a.nextSibling.dataset,r)var u=r.dgst;return r=u,i=Error(m(419)),r=yi(i,r,void 0),Ll(e,t,s,r)}if(u=(s&e.childLanes)!==0,ut||u){if(r=Qe,r!==null){switch(s&-s){case 4:a=2;break;case 16:a=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:a=32;break;case 536870912:a=268435456;break;default:a=0}a=(a&(r.suspendedLanes|s))!==0?0:a,a!==0&&a!==i.retryLane&&(i.retryLane=a,Vt(e,a),Ft(r,e,a,-1))}return Bi(),r=yi(Error(m(421))),Ll(e,t,s,r)}return a.data==="$?"?(t.flags|=128,t.child=e.child,t=Zd.bind(null,e),a._reactRetry=t,null):(e=i.treeContext,ht=en(a.nextSibling),mt=t,Me=!0,_t=null,e!==null&&(wt[kt++]=$t,wt[kt++]=Bt,wt[kt++]=jn,$t=e.id,Bt=e.overflow,jn=t),t=Si(t,r.children),t.flags|=4096,t)}function hu(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ni(e.return,t,n)}function Ci(e,t,n,r,a){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:a}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=a)}function gu(e,t,n){var r=t.pendingProps,a=r.revealOrder,i=r.tail;if(rt(e,t,r.children,n),r=Te.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&hu(e,n,t);else if(e.tag===19)hu(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(Ce(Te,r),(t.mode&1)===0)t.memoizedState=null;else switch(a){case"forwards":for(n=t.child,a=null;n!==null;)e=n.alternate,e!==null&&El(e)===null&&(a=n),n=n.sibling;n=a,n===null?(a=t.child,t.child=null):(a=n.sibling,n.sibling=null),Ci(t,!1,a,n,i);break;case"backwards":for(n=null,a=t.child,t.child=null;a!==null;){if(e=a.alternate,e!==null&&El(e)===null){t.child=a;break}e=a.sibling,a.sibling=n,n=a,a=e}Ci(t,!0,n,null,i);break;case"together":Ci(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Il(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Wt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),En|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(m(153));if(t.child!==null){for(e=t.child,n=pn(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=pn(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function $d(e,t,n){switch(t.tag){case 3:pu(t),Gn();break;case 5:Mo(t);break;case 1:ot(t.type)&&vl(t);break;case 4:ai(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,a=t.memoizedProps.value;Ce(Nl,r._currentValue),r._currentValue=a;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(Ce(Te,Te.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?mu(e,t,n):(Ce(Te,Te.current&1),e=Wt(e,t,n),e!==null?e.sibling:null);Ce(Te,Te.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return gu(e,t,n);t.flags|=128}if(a=t.memoizedState,a!==null&&(a.rendering=null,a.tail=null,a.lastEffect=null),Ce(Te,Te.current),r)break;return null;case 22:case 23:return t.lanes=0,uu(e,t,n)}return Wt(e,t,n)}var vu,Ei,xu,yu;vu=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},Ei=function(){},xu=function(e,t,n,r){var a=e.memoizedProps;if(a!==r){e=t.stateNode,Sn(It.current);var i=null;switch(n){case"input":a=ce(e,a),r=ce(e,r),i=[];break;case"select":a=p({},a,{value:void 0}),r=p({},r,{value:void 0}),i=[];break;case"textarea":a=mn(e,a),r=mn(e,r),i=[];break;default:typeof a.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=ml)}sa(n,r);var s;n=null;for(x in a)if(!r.hasOwnProperty(x)&&a.hasOwnProperty(x)&&a[x]!=null)if(x==="style"){var u=a[x];for(s in u)u.hasOwnProperty(s)&&(n||(n={}),n[s]="")}else x!=="dangerouslySetInnerHTML"&&x!=="children"&&x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&x!=="autoFocus"&&(M.hasOwnProperty(x)?i||(i=[]):(i=i||[]).push(x,null));for(x in r){var d=r[x];if(u=a!=null?a[x]:void 0,r.hasOwnProperty(x)&&d!==u&&(d!=null||u!=null))if(x==="style")if(u){for(s in u)!u.hasOwnProperty(s)||d&&d.hasOwnProperty(s)||(n||(n={}),n[s]="");for(s in d)d.hasOwnProperty(s)&&u[s]!==d[s]&&(n||(n={}),n[s]=d[s])}else n||(i||(i=[]),i.push(x,n)),n=d;else x==="dangerouslySetInnerHTML"?(d=d?d.__html:void 0,u=u?u.__html:void 0,d!=null&&u!==d&&(i=i||[]).push(x,d)):x==="children"?typeof d!="string"&&typeof d!="number"||(i=i||[]).push(x,""+d):x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&(M.hasOwnProperty(x)?(d!=null&&x==="onScroll"&&Ee("scroll",e),i||u===d||(i=[])):(i=i||[]).push(x,d))}n&&(i=i||[]).push("style",n);var x=i;(t.updateQueue=x)&&(t.flags|=4)}},yu=function(e,t,n,r){n!==r&&(t.flags|=4)};function Rr(e,t){if(!Me)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function tt(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var a=e.child;a!==null;)n|=a.lanes|a.childLanes,r|=a.subtreeFlags&14680064,r|=a.flags&14680064,a.return=e,a=a.sibling;else for(a=e.child;a!==null;)n|=a.lanes|a.childLanes,r|=a.subtreeFlags,r|=a.flags,a.return=e,a=a.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Bd(e,t,n){var r=t.pendingProps;switch(Ya(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return tt(t),null;case 1:return ot(t.type)&&gl(),tt(t),null;case 3:return r=t.stateNode,Zn(),_e(st),_e(Je),oi(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(kl(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,_t!==null&&(Di(_t),_t=null))),Ei(e,t),tt(t),null;case 5:ii(t);var a=Sn(Pr.current);if(n=t.type,e!==null&&t.stateNode!=null)xu(e,t,n,r,a),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(m(166));return tt(t),null}if(e=Sn(It.current),kl(t)){r=t.stateNode,n=t.type;var i=t.memoizedProps;switch(r[Lt]=t,r[Cr]=i,e=(t.mode&1)!==0,n){case"dialog":Ee("cancel",r),Ee("close",r);break;case"iframe":case"object":case"embed":Ee("load",r);break;case"video":case"audio":for(a=0;a<Nr.length;a++)Ee(Nr[a],r);break;case"source":Ee("error",r);break;case"img":case"image":case"link":Ee("error",r),Ee("load",r);break;case"details":Ee("toggle",r);break;case"input":Ve(r,i),Ee("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},Ee("invalid",r);break;case"textarea":Ht(r,i),Ee("invalid",r)}sa(n,i),a=null;for(var s in i)if(i.hasOwnProperty(s)){var u=i[s];s==="children"?typeof u=="string"?r.textContent!==u&&(i.suppressHydrationWarning!==!0&&fl(r.textContent,u,e),a=["children",u]):typeof u=="number"&&r.textContent!==""+u&&(i.suppressHydrationWarning!==!0&&fl(r.textContent,u,e),a=["children",""+u]):M.hasOwnProperty(s)&&u!=null&&s==="onScroll"&&Ee("scroll",r)}switch(n){case"input":me(r),Ze(r,i,!0);break;case"textarea":me(r),Tn(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=ml)}r=a,t.updateQueue=r,r!==null&&(t.flags|=4)}else{s=a.nodeType===9?a:a.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=gn(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=s.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=s.createElement(n,{is:r.is}):(e=s.createElement(n),n==="select"&&(s=e,r.multiple?s.multiple=!0:r.size&&(s.size=r.size))):e=s.createElementNS(e,n),e[Lt]=t,e[Cr]=r,vu(e,t,!1,!1),t.stateNode=e;e:{switch(s=oa(n,r),n){case"dialog":Ee("cancel",e),Ee("close",e),a=r;break;case"iframe":case"object":case"embed":Ee("load",e),a=r;break;case"video":case"audio":for(a=0;a<Nr.length;a++)Ee(Nr[a],e);a=r;break;case"source":Ee("error",e),a=r;break;case"img":case"image":case"link":Ee("error",e),Ee("load",e),a=r;break;case"details":Ee("toggle",e),a=r;break;case"input":Ve(e,r),a=ce(e,r),Ee("invalid",e);break;case"option":a=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},a=p({},r,{value:void 0}),Ee("invalid",e);break;case"textarea":Ht(e,r),a=mn(e,r),Ee("invalid",e);break;default:a=r}sa(n,a),u=a;for(i in u)if(u.hasOwnProperty(i)){var d=u[i];i==="style"?ss(e,d):i==="dangerouslySetInnerHTML"?(d=d?d.__html:void 0,d!=null&&ze(e,d)):i==="children"?typeof d=="string"?(n!=="textarea"||d!=="")&&yt(e,d):typeof d=="number"&&yt(e,""+d):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(M.hasOwnProperty(i)?d!=null&&i==="onScroll"&&Ee("scroll",e):d!=null&&P(e,i,d,s))}switch(n){case"input":me(e),Ze(e,r,!1);break;case"textarea":me(e),Tn(e);break;case"option":r.value!=null&&e.setAttribute("value",""+U(r.value));break;case"select":e.multiple=!!r.multiple,i=r.value,i!=null?xt(e,!!r.multiple,i,!1):r.defaultValue!=null&&xt(e,!!r.multiple,r.defaultValue,!0);break;default:typeof a.onClick=="function"&&(e.onclick=ml)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return tt(t),null;case 6:if(e&&t.stateNode!=null)yu(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(m(166));if(n=Sn(Pr.current),Sn(It.current),kl(t)){if(r=t.stateNode,n=t.memoizedProps,r[Lt]=t,(i=r.nodeValue!==n)&&(e=mt,e!==null))switch(e.tag){case 3:fl(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&fl(r.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Lt]=t,t.stateNode=r}return tt(t),null;case 13:if(_e(Te),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(Me&&ht!==null&&(t.mode&1)!==0&&(t.flags&128)===0)jo(),Gn(),t.flags|=98560,i=!1;else if(i=kl(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(m(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(m(317));i[Lt]=t}else Gn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;tt(t),i=!1}else _t!==null&&(Di(_t),_t=null),i=!0;if(!i)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Te.current&1)!==0?We===0&&(We=3):Bi())),t.updateQueue!==null&&(t.flags|=4),tt(t),null);case 4:return Zn(),Ei(e,t),e===null&&br(t.stateNode.containerInfo),tt(t),null;case 10:return ti(t.type._context),tt(t),null;case 17:return ot(t.type)&&gl(),tt(t),null;case 19:if(_e(Te),i=t.memoizedState,i===null)return tt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Rr(i,!1);else{if(We!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=El(e),s!==null){for(t.flags|=128,Rr(i,!1),r=s.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)i=n,e=r,i.flags&=14680066,s=i.alternate,s===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=s.childLanes,i.lanes=s.lanes,i.child=s.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=s.memoizedProps,i.memoizedState=s.memoizedState,i.updateQueue=s.updateQueue,i.type=s.type,e=s.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return Ce(Te,Te.current&1|2),t.child}e=e.sibling}i.tail!==null&&Re()>nr&&(t.flags|=128,r=!0,Rr(i,!1),t.lanes=4194304)}else{if(!r)if(e=El(s),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Rr(i,!0),i.tail===null&&i.tailMode==="hidden"&&!s.alternate&&!Me)return tt(t),null}else 2*Re()-i.renderingStartTime>nr&&n!==1073741824&&(t.flags|=128,r=!0,Rr(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(n=i.last,n!==null?n.sibling=s:t.child=s,i.last=s)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=Re(),t.sibling=null,n=Te.current,Ce(Te,r?n&1|2:n&1),t):(tt(t),null);case 22:case 23:return $i(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(gt&1073741824)!==0&&(tt(t),t.subtreeFlags&6&&(t.flags|=8192)):tt(t),null;case 24:return null;case 25:return null}throw Error(m(156,t.tag))}function Vd(e,t){switch(Ya(t),t.tag){case 1:return ot(t.type)&&gl(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Zn(),_e(st),_e(Je),oi(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return ii(t),null;case 13:if(_e(Te),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(m(340));Gn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return _e(Te),null;case 4:return Zn(),null;case 10:return ti(t.type._context),null;case 22:case 23:return $i(),null;case 24:return null;default:return null}}var Rl=!1,nt=!1,Ud=typeof WeakSet=="function"?WeakSet:Set,W=null;function er(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ie(e,t,r)}else n.current=null}function _i(e,t,n){try{n()}catch(r){Ie(e,t,r)}}var wu=!1;function Wd(e,t){if($a=nl,e=Xs(),Fa(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,u=-1,d=-1,x=0,N=0,S=e,k=null;t:for(;;){for(var B;S!==n||a!==0&&S.nodeType!==3||(u=s+a),S!==i||r!==0&&S.nodeType!==3||(d=s+r),S.nodeType===3&&(s+=S.nodeValue.length),(B=S.firstChild)!==null;)k=S,S=B;for(;;){if(S===e)break t;if(k===n&&++x===a&&(u=s),k===i&&++N===r&&(d=s),(B=S.nextSibling)!==null)break;S=k,k=S.parentNode}S=B}n=u===-1||d===-1?null:{start:u,end:d}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ba={focusedElem:e,selectionRange:n},nl=!1,W=t;W!==null;)if(t=W,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,W=e;else for(;W!==null;){t=W;try{var K=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(K!==null){var G=K.memoizedProps,Ae=K.memoizedState,h=t.stateNode,f=h.getSnapshotBeforeUpdate(t.elementType===t.type?G:zt(t.type,G),Ae);h.__reactInternalSnapshotBeforeUpdate=f}break;case 3:var v=t.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(m(163))}}catch(E){Ie(t,t.return,E)}if(e=t.sibling,e!==null){e.return=t.return,W=e;break}W=t.return}return K=wu,wu=!1,K}function Ar(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var a=r=r.next;do{if((a.tag&e)===e){var i=a.destroy;a.destroy=void 0,i!==void 0&&_i(t,n,i)}a=a.next}while(a!==r)}}function Al(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function zi(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function ku(e){var t=e.alternate;t!==null&&(e.alternate=null,ku(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Lt],delete t[Cr],delete t[Ka],delete t[Cd],delete t[Ed])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function ju(e){return e.tag===5||e.tag===3||e.tag===4}function Nu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||ju(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Mi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=ml));else if(r!==4&&(e=e.child,e!==null))for(Mi(e,t,n),e=e.sibling;e!==null;)Mi(e,t,n),e=e.sibling}function Pi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Pi(e,t,n),e=e.sibling;e!==null;)Pi(e,t,n),e=e.sibling}var Ye=null,Mt=!1;function sn(e,t,n){for(n=n.child;n!==null;)bu(e,t,n),n=n.sibling}function bu(e,t,n){if(Tt&&typeof Tt.onCommitFiberUnmount=="function")try{Tt.onCommitFiberUnmount(qr,n)}catch{}switch(n.tag){case 5:nt||er(n,t);case 6:var r=Ye,a=Mt;Ye=null,sn(e,t,n),Ye=r,Mt=a,Ye!==null&&(Mt?(e=Ye,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):Ye.removeChild(n.stateNode));break;case 18:Ye!==null&&(Mt?(e=Ye,n=n.stateNode,e.nodeType===8?Wa(e.parentNode,n):e.nodeType===1&&Wa(e,n),hr(e)):Wa(Ye,n.stateNode));break;case 4:r=Ye,a=Mt,Ye=n.stateNode.containerInfo,Mt=!0,sn(e,t,n),Ye=r,Mt=a;break;case 0:case 11:case 14:case 15:if(!nt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){a=r=r.next;do{var i=a,s=i.destroy;i=i.tag,s!==void 0&&((i&2)!==0||(i&4)!==0)&&_i(n,t,s),a=a.next}while(a!==r)}sn(e,t,n);break;case 1:if(!nt&&(er(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(u){Ie(n,t,u)}sn(e,t,n);break;case 21:sn(e,t,n);break;case 22:n.mode&1?(nt=(r=nt)||n.memoizedState!==null,sn(e,t,n),nt=r):sn(e,t,n);break;default:sn(e,t,n)}}function Su(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Ud),t.forEach(function(r){var a=Jd.bind(null,e,r);n.has(r)||(n.add(r),r.then(a,a))})}}function Pt(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r];try{var i=e,s=t,u=s;e:for(;u!==null;){switch(u.tag){case 5:Ye=u.stateNode,Mt=!1;break e;case 3:Ye=u.stateNode.containerInfo,Mt=!0;break e;case 4:Ye=u.stateNode.containerInfo,Mt=!0;break e}u=u.return}if(Ye===null)throw Error(m(160));bu(i,s,a),Ye=null,Mt=!1;var d=a.alternate;d!==null&&(d.return=null),a.return=null}catch(x){Ie(a,t,x)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Cu(t,e),t=t.sibling}function Cu(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Pt(t,e),At(e),r&4){try{Ar(3,e,e.return),Al(3,e)}catch(G){Ie(e,e.return,G)}try{Ar(5,e,e.return)}catch(G){Ie(e,e.return,G)}}break;case 1:Pt(t,e),At(e),r&512&&n!==null&&er(n,n.return);break;case 5:if(Pt(t,e),At(e),r&512&&n!==null&&er(n,n.return),e.flags&32){var a=e.stateNode;try{yt(a,"")}catch(G){Ie(e,e.return,G)}}if(r&4&&(a=e.stateNode,a!=null)){var i=e.memoizedProps,s=n!==null?n.memoizedProps:i,u=e.type,d=e.updateQueue;if(e.updateQueue=null,d!==null)try{u==="input"&&i.type==="radio"&&i.name!=null&&Xe(a,i),oa(u,s);var x=oa(u,i);for(s=0;s<d.length;s+=2){var N=d[s],S=d[s+1];N==="style"?ss(a,S):N==="dangerouslySetInnerHTML"?ze(a,S):N==="children"?yt(a,S):P(a,N,S,x)}switch(u){case"input":Ke(a,i);break;case"textarea":hn(a,i);break;case"select":var k=a._wrapperState.wasMultiple;a._wrapperState.wasMultiple=!!i.multiple;var B=i.value;B!=null?xt(a,!!i.multiple,B,!1):k!==!!i.multiple&&(i.defaultValue!=null?xt(a,!!i.multiple,i.defaultValue,!0):xt(a,!!i.multiple,i.multiple?[]:"",!1))}a[Cr]=i}catch(G){Ie(e,e.return,G)}}break;case 6:if(Pt(t,e),At(e),r&4){if(e.stateNode===null)throw Error(m(162));a=e.stateNode,i=e.memoizedProps;try{a.nodeValue=i}catch(G){Ie(e,e.return,G)}}break;case 3:if(Pt(t,e),At(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{hr(t.containerInfo)}catch(G){Ie(e,e.return,G)}break;case 4:Pt(t,e),At(e);break;case 13:Pt(t,e),At(e),a=e.child,a.flags&8192&&(i=a.memoizedState!==null,a.stateNode.isHidden=i,!i||a.alternate!==null&&a.alternate.memoizedState!==null||(Li=Re())),r&4&&Su(e);break;case 22:if(N=n!==null&&n.memoizedState!==null,e.mode&1?(nt=(x=nt)||N,Pt(t,e),nt=x):Pt(t,e),At(e),r&8192){if(x=e.memoizedState!==null,(e.stateNode.isHidden=x)&&!N&&(e.mode&1)!==0)for(W=e,N=e.child;N!==null;){for(S=W=N;W!==null;){switch(k=W,B=k.child,k.tag){case 0:case 11:case 14:case 15:Ar(4,k,k.return);break;case 1:er(k,k.return);var K=k.stateNode;if(typeof K.componentWillUnmount=="function"){r=k,n=k.return;try{t=r,K.props=t.memoizedProps,K.state=t.memoizedState,K.componentWillUnmount()}catch(G){Ie(r,n,G)}}break;case 5:er(k,k.return);break;case 22:if(k.memoizedState!==null){zu(S);continue}}B!==null?(B.return=k,W=B):zu(S)}N=N.sibling}e:for(N=null,S=e;;){if(S.tag===5){if(N===null){N=S;try{a=S.stateNode,x?(i=a.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(u=S.stateNode,d=S.memoizedProps.style,s=d!=null&&d.hasOwnProperty("display")?d.display:null,u.style.display=xn("display",s))}catch(G){Ie(e,e.return,G)}}}else if(S.tag===6){if(N===null)try{S.stateNode.nodeValue=x?"":S.memoizedProps}catch(G){Ie(e,e.return,G)}}else if((S.tag!==22&&S.tag!==23||S.memoizedState===null||S===e)&&S.child!==null){S.child.return=S,S=S.child;continue}if(S===e)break e;for(;S.sibling===null;){if(S.return===null||S.return===e)break e;N===S&&(N=null),S=S.return}N===S&&(N=null),S.sibling.return=S.return,S=S.sibling}}break;case 19:Pt(t,e),At(e),r&4&&Su(e);break;case 21:break;default:Pt(t,e),At(e)}}function At(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(ju(n)){var r=n;break e}n=n.return}throw Error(m(160))}switch(r.tag){case 5:var a=r.stateNode;r.flags&32&&(yt(a,""),r.flags&=-33);var i=Nu(e);Pi(e,i,a);break;case 3:case 4:var s=r.stateNode.containerInfo,u=Nu(e);Mi(e,u,s);break;default:throw Error(m(161))}}catch(d){Ie(e,e.return,d)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Kd(e,t,n){W=e,Eu(e)}function Eu(e,t,n){for(var r=(e.mode&1)!==0;W!==null;){var a=W,i=a.child;if(a.tag===22&&r){var s=a.memoizedState!==null||Rl;if(!s){var u=a.alternate,d=u!==null&&u.memoizedState!==null||nt;u=Rl;var x=nt;if(Rl=s,(nt=d)&&!x)for(W=a;W!==null;)s=W,d=s.child,s.tag===22&&s.memoizedState!==null?Mu(a):d!==null?(d.return=s,W=d):Mu(a);for(;i!==null;)W=i,Eu(i),i=i.sibling;W=a,Rl=u,nt=x}_u(e)}else(a.subtreeFlags&8772)!==0&&i!==null?(i.return=a,W=i):_u(e)}}function _u(e){for(;W!==null;){var t=W;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:nt||Al(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!nt)if(n===null)r.componentDidMount();else{var a=t.elementType===t.type?n.memoizedProps:zt(t.type,n.memoizedProps);r.componentDidUpdate(a,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&zo(t,i,r);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}zo(t,s,n)}break;case 5:var u=t.stateNode;if(n===null&&t.flags&4){n=u;var d=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":d.autoFocus&&n.focus();break;case"img":d.src&&(n.src=d.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var x=t.alternate;if(x!==null){var N=x.memoizedState;if(N!==null){var S=N.dehydrated;S!==null&&hr(S)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(m(163))}nt||t.flags&512&&zi(t)}catch(k){Ie(t,t.return,k)}}if(t===e){W=null;break}if(n=t.sibling,n!==null){n.return=t.return,W=n;break}W=t.return}}function zu(e){for(;W!==null;){var t=W;if(t===e){W=null;break}var n=t.sibling;if(n!==null){n.return=t.return,W=n;break}W=t.return}}function Mu(e){for(;W!==null;){var t=W;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Al(4,t)}catch(d){Ie(t,n,d)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var a=t.return;try{r.componentDidMount()}catch(d){Ie(t,a,d)}}var i=t.return;try{zi(t)}catch(d){Ie(t,i,d)}break;case 5:var s=t.return;try{zi(t)}catch(d){Ie(t,s,d)}}}catch(d){Ie(t,t.return,d)}if(t===e){W=null;break}var u=t.sibling;if(u!==null){u.return=t.return,W=u;break}W=t.return}}var Hd=Math.ceil,Dl=se.ReactCurrentDispatcher,Fi=se.ReactCurrentOwner,bt=se.ReactCurrentBatchConfig,we=0,Qe=null,Be=null,qe=0,gt=0,tr=tn(0),We=0,Dr=null,En=0,Ol=0,Ti=0,Or=null,ct=null,Li=0,nr=1/0,Kt=null,$l=!1,Ii=null,on=null,Bl=!1,un=null,Vl=0,$r=0,Ri=null,Ul=-1,Wl=0;function lt(){return(we&6)!==0?Re():Ul!==-1?Ul:Ul=Re()}function cn(e){return(e.mode&1)===0?1:(we&2)!==0&&qe!==0?qe&-qe:zd.transition!==null?(Wl===0&&(Wl=js()),Wl):(e=je,e!==0||(e=window.event,e=e===void 0?16:Ps(e.type)),e)}function Ft(e,t,n,r){if(50<$r)throw $r=0,Ri=null,Error(m(185));cr(e,n,r),((we&2)===0||e!==Qe)&&(e===Qe&&((we&2)===0&&(Ol|=n),We===4&&dn(e,qe)),dt(e,r),n===1&&we===0&&(t.mode&1)===0&&(nr=Re()+500,xl&&rn()))}function dt(e,t){var n=e.callbackNode;zc(e,t);var r=Jr(e,e===Qe?qe:0);if(r===0)n!==null&&ys(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&ys(n),t===1)e.tag===0?_d(Fu.bind(null,e)):vo(Fu.bind(null,e)),bd(function(){(we&6)===0&&rn()}),n=null;else{switch(Ns(r)){case 1:n=ha;break;case 4:n=ws;break;case 16:n=Yr;break;case 536870912:n=ks;break;default:n=Yr}n=$u(n,Pu.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Pu(e,t){if(Ul=-1,Wl=0,(we&6)!==0)throw Error(m(327));var n=e.callbackNode;if(rr()&&e.callbackNode!==n)return null;var r=Jr(e,e===Qe?qe:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=Kl(e,r);else{t=r;var a=we;we|=2;var i=Lu();(Qe!==e||qe!==t)&&(Kt=null,nr=Re()+500,zn(e,t));do try{Yd();break}catch(u){Tu(e,u)}while(!0);ei(),Dl.current=i,we=a,Be!==null?t=0:(Qe=null,qe=0,t=We)}if(t!==0){if(t===2&&(a=ga(e),a!==0&&(r=a,t=Ai(e,a))),t===1)throw n=Dr,zn(e,0),dn(e,r),dt(e,Re()),n;if(t===6)dn(e,r);else{if(a=e.current.alternate,(r&30)===0&&!Qd(a)&&(t=Kl(e,r),t===2&&(i=ga(e),i!==0&&(r=i,t=Ai(e,i))),t===1))throw n=Dr,zn(e,0),dn(e,r),dt(e,Re()),n;switch(e.finishedWork=a,e.finishedLanes=r,t){case 0:case 1:throw Error(m(345));case 2:Mn(e,ct,Kt);break;case 3:if(dn(e,r),(r&130023424)===r&&(t=Li+500-Re(),10<t)){if(Jr(e,0)!==0)break;if(a=e.suspendedLanes,(a&r)!==r){lt(),e.pingedLanes|=e.suspendedLanes&a;break}e.timeoutHandle=Ua(Mn.bind(null,e,ct,Kt),t);break}Mn(e,ct,Kt);break;case 4:if(dn(e,r),(r&4194240)===r)break;for(t=e.eventTimes,a=-1;0<r;){var s=31-Ct(r);i=1<<s,s=t[s],s>a&&(a=s),r&=~i}if(r=a,r=Re()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Hd(r/1960))-r,10<r){e.timeoutHandle=Ua(Mn.bind(null,e,ct,Kt),r);break}Mn(e,ct,Kt);break;case 5:Mn(e,ct,Kt);break;default:throw Error(m(329))}}}return dt(e,Re()),e.callbackNode===n?Pu.bind(null,e):null}function Ai(e,t){var n=Or;return e.current.memoizedState.isDehydrated&&(zn(e,t).flags|=256),e=Kl(e,t),e!==2&&(t=ct,ct=n,t!==null&&Di(t)),e}function Di(e){ct===null?ct=e:ct.push.apply(ct,e)}function Qd(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var a=n[r],i=a.getSnapshot;a=a.value;try{if(!Et(i(),a))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function dn(e,t){for(t&=~Ti,t&=~Ol,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Ct(t),r=1<<n;e[n]=-1,t&=~r}}function Fu(e){if((we&6)!==0)throw Error(m(327));rr();var t=Jr(e,0);if((t&1)===0)return dt(e,Re()),null;var n=Kl(e,t);if(e.tag!==0&&n===2){var r=ga(e);r!==0&&(t=r,n=Ai(e,r))}if(n===1)throw n=Dr,zn(e,0),dn(e,t),dt(e,Re()),n;if(n===6)throw Error(m(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Mn(e,ct,Kt),dt(e,Re()),null}function Oi(e,t){var n=we;we|=1;try{return e(t)}finally{we=n,we===0&&(nr=Re()+500,xl&&rn())}}function _n(e){un!==null&&un.tag===0&&(we&6)===0&&rr();var t=we;we|=1;var n=bt.transition,r=je;try{if(bt.transition=null,je=1,e)return e()}finally{je=r,bt.transition=n,we=t,(we&6)===0&&rn()}}function $i(){gt=tr.current,_e(tr)}function zn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Nd(n)),Be!==null)for(n=Be.return;n!==null;){var r=n;switch(Ya(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&gl();break;case 3:Zn(),_e(st),_e(Je),oi();break;case 5:ii(r);break;case 4:Zn();break;case 13:_e(Te);break;case 19:_e(Te);break;case 10:ti(r.type._context);break;case 22:case 23:$i()}n=n.return}if(Qe=e,Be=e=pn(e.current,null),qe=gt=t,We=0,Dr=null,Ti=Ol=En=0,ct=Or=null,bn!==null){for(t=0;t<bn.length;t++)if(n=bn[t],r=n.interleaved,r!==null){n.interleaved=null;var a=r.next,i=n.pending;if(i!==null){var s=i.next;i.next=a,r.next=s}n.pending=r}bn=null}return e}function Tu(e,t){do{var n=Be;try{if(ei(),_l.current=Fl,zl){for(var r=Le.memoizedState;r!==null;){var a=r.queue;a!==null&&(a.pending=null),r=r.next}zl=!1}if(Cn=0,He=Ue=Le=null,Fr=!1,Tr=0,Fi.current=null,n===null||n.return===null){We=1,Dr=t,Be=null;break}e:{var i=e,s=n.return,u=n,d=t;if(t=qe,u.flags|=32768,d!==null&&typeof d=="object"&&typeof d.then=="function"){var x=d,N=u,S=N.tag;if((N.mode&1)===0&&(S===0||S===11||S===15)){var k=N.alternate;k?(N.updateQueue=k.updateQueue,N.memoizedState=k.memoizedState,N.lanes=k.lanes):(N.updateQueue=null,N.memoizedState=null)}var B=lu(s);if(B!==null){B.flags&=-257,au(B,s,u,i,t),B.mode&1&&ru(i,x,t),t=B,d=x;var K=t.updateQueue;if(K===null){var G=new Set;G.add(d),t.updateQueue=G}else K.add(d);break e}else{if((t&1)===0){ru(i,x,t),Bi();break e}d=Error(m(426))}}else if(Me&&u.mode&1){var Ae=lu(s);if(Ae!==null){(Ae.flags&65536)===0&&(Ae.flags|=256),au(Ae,s,u,i,t),Za(Jn(d,u));break e}}i=d=Jn(d,u),We!==4&&(We=2),Or===null?Or=[i]:Or.push(i),i=s;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var h=tu(i,d,t);_o(i,h);break e;case 1:u=d;var f=i.type,v=i.stateNode;if((i.flags&128)===0&&(typeof f.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(on===null||!on.has(v)))){i.flags|=65536,t&=-t,i.lanes|=t;var E=nu(i,u,t);_o(i,E);break e}}i=i.return}while(i!==null)}Ru(n)}catch(Y){t=Y,Be===n&&n!==null&&(Be=n=n.return);continue}break}while(!0)}function Lu(){var e=Dl.current;return Dl.current=Fl,e===null?Fl:e}function Bi(){(We===0||We===3||We===2)&&(We=4),Qe===null||(En&268435455)===0&&(Ol&268435455)===0||dn(Qe,qe)}function Kl(e,t){var n=we;we|=2;var r=Lu();(Qe!==e||qe!==t)&&(Kt=null,zn(e,t));do try{Gd();break}catch(a){Tu(e,a)}while(!0);if(ei(),we=n,Dl.current=r,Be!==null)throw Error(m(261));return Qe=null,qe=0,We}function Gd(){for(;Be!==null;)Iu(Be)}function Yd(){for(;Be!==null&&!wc();)Iu(Be)}function Iu(e){var t=Ou(e.alternate,e,gt);e.memoizedProps=e.pendingProps,t===null?Ru(e):Be=t,Fi.current=null}function Ru(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Bd(n,t,gt),n!==null){Be=n;return}}else{if(n=Vd(n,t),n!==null){n.flags&=32767,Be=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{We=6,Be=null;return}}if(t=t.sibling,t!==null){Be=t;return}Be=t=e}while(t!==null);We===0&&(We=5)}function Mn(e,t,n){var r=je,a=bt.transition;try{bt.transition=null,je=1,qd(e,t,n,r)}finally{bt.transition=a,je=r}return null}function qd(e,t,n,r){do rr();while(un!==null);if((we&6)!==0)throw Error(m(327));n=e.finishedWork;var a=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(m(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(Mc(e,i),e===Qe&&(Be=Qe=null,qe=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Bl||(Bl=!0,$u(Yr,function(){return rr(),null})),i=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||i){i=bt.transition,bt.transition=null;var s=je;je=1;var u=we;we|=4,Fi.current=null,Wd(e,n),Cu(n,e),gd(Ba),nl=!!$a,Ba=$a=null,e.current=n,Kd(n),kc(),we=u,je=s,bt.transition=i}else e.current=n;if(Bl&&(Bl=!1,un=e,Vl=a),i=e.pendingLanes,i===0&&(on=null),bc(n.stateNode),dt(e,Re()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)a=t[n],r(a.value,{componentStack:a.stack,digest:a.digest});if($l)throw $l=!1,e=Ii,Ii=null,e;return(Vl&1)!==0&&e.tag!==0&&rr(),i=e.pendingLanes,(i&1)!==0?e===Ri?$r++:($r=0,Ri=e):$r=0,rn(),null}function rr(){if(un!==null){var e=Ns(Vl),t=bt.transition,n=je;try{if(bt.transition=null,je=16>e?16:e,un===null)var r=!1;else{if(e=un,un=null,Vl=0,(we&6)!==0)throw Error(m(331));var a=we;for(we|=4,W=e.current;W!==null;){var i=W,s=i.child;if((W.flags&16)!==0){var u=i.deletions;if(u!==null){for(var d=0;d<u.length;d++){var x=u[d];for(W=x;W!==null;){var N=W;switch(N.tag){case 0:case 11:case 15:Ar(8,N,i)}var S=N.child;if(S!==null)S.return=N,W=S;else for(;W!==null;){N=W;var k=N.sibling,B=N.return;if(ku(N),N===x){W=null;break}if(k!==null){k.return=B,W=k;break}W=B}}}var K=i.alternate;if(K!==null){var G=K.child;if(G!==null){K.child=null;do{var Ae=G.sibling;G.sibling=null,G=Ae}while(G!==null)}}W=i}}if((i.subtreeFlags&2064)!==0&&s!==null)s.return=i,W=s;else e:for(;W!==null;){if(i=W,(i.flags&2048)!==0)switch(i.tag){case 0:case 11:case 15:Ar(9,i,i.return)}var h=i.sibling;if(h!==null){h.return=i.return,W=h;break e}W=i.return}}var f=e.current;for(W=f;W!==null;){s=W;var v=s.child;if((s.subtreeFlags&2064)!==0&&v!==null)v.return=s,W=v;else e:for(s=f;W!==null;){if(u=W,(u.flags&2048)!==0)try{switch(u.tag){case 0:case 11:case 15:Al(9,u)}}catch(Y){Ie(u,u.return,Y)}if(u===s){W=null;break e}var E=u.sibling;if(E!==null){E.return=u.return,W=E;break e}W=u.return}}if(we=a,rn(),Tt&&typeof Tt.onPostCommitFiberRoot=="function")try{Tt.onPostCommitFiberRoot(qr,e)}catch{}r=!0}return r}finally{je=n,bt.transition=t}}return!1}function Au(e,t,n){t=Jn(n,t),t=tu(e,t,1),e=an(e,t,1),t=lt(),e!==null&&(cr(e,1,t),dt(e,t))}function Ie(e,t,n){if(e.tag===3)Au(e,e,n);else for(;t!==null;){if(t.tag===3){Au(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(on===null||!on.has(r))){e=Jn(n,e),e=nu(t,e,1),t=an(t,e,1),e=lt(),t!==null&&(cr(t,1,e),dt(t,e));break}}t=t.return}}function Xd(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=lt(),e.pingedLanes|=e.suspendedLanes&n,Qe===e&&(qe&n)===n&&(We===4||We===3&&(qe&130023424)===qe&&500>Re()-Li?zn(e,0):Ti|=n),dt(e,t)}function Du(e,t){t===0&&((e.mode&1)===0?t=1:(t=Zr,Zr<<=1,(Zr&130023424)===0&&(Zr=4194304)));var n=lt();e=Vt(e,t),e!==null&&(cr(e,t,n),dt(e,n))}function Zd(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Du(e,n)}function Jd(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(m(314))}r!==null&&r.delete(t),Du(e,n)}var Ou;Ou=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||st.current)ut=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return ut=!1,$d(e,t,n);ut=(e.flags&131072)!==0}else ut=!1,Me&&(t.flags&1048576)!==0&&xo(t,wl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Il(e,t),e=t.pendingProps;var a=Kn(t,Je.current);Xn(t,n),a=di(null,t,r,e,a,n);var i=pi();return t.flags|=1,typeof a=="object"&&a!==null&&typeof a.render=="function"&&a.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,ot(r)?(i=!0,vl(t)):i=!1,t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,li(t),a.updater=Tl,t.stateNode=a,a._reactInternals=t,xi(t,r,e,n),t=ji(null,t,r,!0,i,n)):(t.tag=0,Me&&i&&Ga(t),rt(null,t,a,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Il(e,t),e=t.pendingProps,a=r._init,r=a(r._payload),t.type=r,a=t.tag=tp(r),e=zt(r,e),a){case 0:t=ki(null,t,r,e,n);break e;case 1:t=du(null,t,r,e,n);break e;case 11:t=iu(null,t,r,e,n);break e;case 14:t=su(null,t,r,zt(r.type,e),n);break e}throw Error(m(306,r,""))}return t;case 0:return r=t.type,a=t.pendingProps,a=t.elementType===r?a:zt(r,a),ki(e,t,r,a,n);case 1:return r=t.type,a=t.pendingProps,a=t.elementType===r?a:zt(r,a),du(e,t,r,a,n);case 3:e:{if(pu(t),e===null)throw Error(m(387));r=t.pendingProps,i=t.memoizedState,a=i.element,Eo(e,t),Cl(t,r,null,n);var s=t.memoizedState;if(r=s.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){a=Jn(Error(m(423)),t),t=fu(e,t,r,n,a);break e}else if(r!==a){a=Jn(Error(m(424)),t),t=fu(e,t,r,n,a);break e}else for(ht=en(t.stateNode.containerInfo.firstChild),mt=t,Me=!0,_t=null,n=So(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Gn(),r===a){t=Wt(e,t,n);break e}rt(e,t,r,n)}t=t.child}return t;case 5:return Mo(t),e===null&&Xa(t),r=t.type,a=t.pendingProps,i=e!==null?e.memoizedProps:null,s=a.children,Va(r,a)?s=null:i!==null&&Va(r,i)&&(t.flags|=32),cu(e,t),rt(e,t,s,n),t.child;case 6:return e===null&&Xa(t),null;case 13:return mu(e,t,n);case 4:return ai(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Yn(t,null,r,n):rt(e,t,r,n),t.child;case 11:return r=t.type,a=t.pendingProps,a=t.elementType===r?a:zt(r,a),iu(e,t,r,a,n);case 7:return rt(e,t,t.pendingProps,n),t.child;case 8:return rt(e,t,t.pendingProps.children,n),t.child;case 12:return rt(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,a=t.pendingProps,i=t.memoizedProps,s=a.value,Ce(Nl,r._currentValue),r._currentValue=s,i!==null)if(Et(i.value,s)){if(i.children===a.children&&!st.current){t=Wt(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var u=i.dependencies;if(u!==null){s=i.child;for(var d=u.firstContext;d!==null;){if(d.context===r){if(i.tag===1){d=Ut(-1,n&-n),d.tag=2;var x=i.updateQueue;if(x!==null){x=x.shared;var N=x.pending;N===null?d.next=d:(d.next=N.next,N.next=d),x.pending=d}}i.lanes|=n,d=i.alternate,d!==null&&(d.lanes|=n),ni(i.return,n,t),u.lanes|=n;break}d=d.next}}else if(i.tag===10)s=i.type===t.type?null:i.child;else if(i.tag===18){if(s=i.return,s===null)throw Error(m(341));s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),ni(s,n,t),s=i.sibling}else s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===t){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}rt(e,t,a.children,n),t=t.child}return t;case 9:return a=t.type,r=t.pendingProps.children,Xn(t,n),a=jt(a),r=r(a),t.flags|=1,rt(e,t,r,n),t.child;case 14:return r=t.type,a=zt(r,t.pendingProps),a=zt(r.type,a),su(e,t,r,a,n);case 15:return ou(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,a=t.pendingProps,a=t.elementType===r?a:zt(r,a),Il(e,t),t.tag=1,ot(r)?(e=!0,vl(t)):e=!1,Xn(t,n),Jo(t,r,a),xi(t,r,a,n),ji(null,t,r,!0,e,n);case 19:return gu(e,t,n);case 22:return uu(e,t,n)}throw Error(m(156,t.tag))};function $u(e,t){return xs(e,t)}function ep(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function St(e,t,n,r){return new ep(e,t,n,r)}function Vi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function tp(e){if(typeof e=="function")return Vi(e)?1:0;if(e!=null){if(e=e.$$typeof,e===oe)return 11;if(e===De)return 14}return 2}function pn(e,t){var n=e.alternate;return n===null?(n=St(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Hl(e,t,n,r,a,i){var s=2;if(r=e,typeof e=="function")Vi(e)&&(s=1);else if(typeof e=="string")s=5;else e:switch(e){case ve:return Pn(n.children,a,i,t);case be:s=8,a|=8;break;case ee:return e=St(12,n,t,a|2),e.elementType=ee,e.lanes=i,e;case xe:return e=St(13,n,t,a),e.elementType=xe,e.lanes=i,e;case Fe:return e=St(19,n,t,a),e.elementType=Fe,e.lanes=i,e;case Se:return Ql(n,a,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case ge:s=10;break e;case Pe:s=9;break e;case oe:s=11;break e;case De:s=14;break e;case Oe:s=16,r=null;break e}throw Error(m(130,e==null?e:typeof e,""))}return t=St(s,n,t,a),t.elementType=e,t.type=r,t.lanes=i,t}function Pn(e,t,n,r){return e=St(7,e,r,t),e.lanes=n,e}function Ql(e,t,n,r){return e=St(22,e,r,t),e.elementType=Se,e.lanes=n,e.stateNode={isHidden:!1},e}function Ui(e,t,n){return e=St(6,e,null,t),e.lanes=n,e}function Wi(e,t,n){return t=St(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function np(e,t,n,r,a){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=va(0),this.expirationTimes=va(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=va(0),this.identifierPrefix=r,this.onRecoverableError=a,this.mutableSourceEagerHydrationData=null}function Ki(e,t,n,r,a,i,s,u,d){return e=new np(e,t,n,u,d),t===1?(t=1,i===!0&&(t|=8)):t=0,i=St(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},li(i),e}function rp(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:pe,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Bu(e){if(!e)return nn;e=e._reactInternals;e:{if(yn(e)!==e||e.tag!==1)throw Error(m(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(ot(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(m(171))}if(e.tag===1){var n=e.type;if(ot(n))return ho(e,n,t)}return t}function Vu(e,t,n,r,a,i,s,u,d){return e=Ki(n,r,!0,e,a,i,s,u,d),e.context=Bu(null),n=e.current,r=lt(),a=cn(n),i=Ut(r,a),i.callback=t??null,an(n,i,a),e.current.lanes=a,cr(e,a,r),dt(e,r),e}function Gl(e,t,n,r){var a=t.current,i=lt(),s=cn(a);return n=Bu(n),t.context===null?t.context=n:t.pendingContext=n,t=Ut(i,s),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=an(a,t,s),e!==null&&(Ft(e,a,s,i),Sl(e,a,s)),s}function Yl(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Uu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Hi(e,t){Uu(e,t),(e=e.alternate)&&Uu(e,t)}function lp(){return null}var Wu=typeof reportError=="function"?reportError:function(e){console.error(e)};function Qi(e){this._internalRoot=e}ql.prototype.render=Qi.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(m(409));Gl(e,t,null,null)},ql.prototype.unmount=Qi.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;_n(function(){Gl(null,e,null,null)}),t[Dt]=null}};function ql(e){this._internalRoot=e}ql.prototype.unstable_scheduleHydration=function(e){if(e){var t=Cs();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Xt.length&&t!==0&&t<Xt[n].priority;n++);Xt.splice(n,0,e),n===0&&zs(e)}};function Gi(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Xl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Ku(){}function ap(e,t,n,r,a){if(a){if(typeof r=="function"){var i=r;r=function(){var x=Yl(s);i.call(x)}}var s=Vu(t,r,e,0,null,!1,!1,"",Ku);return e._reactRootContainer=s,e[Dt]=s.current,br(e.nodeType===8?e.parentNode:e),_n(),s}for(;a=e.lastChild;)e.removeChild(a);if(typeof r=="function"){var u=r;r=function(){var x=Yl(d);u.call(x)}}var d=Ki(e,0,!1,null,null,!1,!1,"",Ku);return e._reactRootContainer=d,e[Dt]=d.current,br(e.nodeType===8?e.parentNode:e),_n(function(){Gl(t,d,n,r)}),d}function Zl(e,t,n,r,a){var i=n._reactRootContainer;if(i){var s=i;if(typeof a=="function"){var u=a;a=function(){var d=Yl(s);u.call(d)}}Gl(t,s,e,a)}else s=ap(n,t,e,a,r);return Yl(s)}bs=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=ur(t.pendingLanes);n!==0&&(xa(t,n|1),dt(t,Re()),(we&6)===0&&(nr=Re()+500,rn()))}break;case 13:_n(function(){var r=Vt(e,1);if(r!==null){var a=lt();Ft(r,e,1,a)}}),Hi(e,1)}},ya=function(e){if(e.tag===13){var t=Vt(e,134217728);if(t!==null){var n=lt();Ft(t,e,134217728,n)}Hi(e,134217728)}},Ss=function(e){if(e.tag===13){var t=cn(e),n=Vt(e,t);if(n!==null){var r=lt();Ft(n,e,t,r)}Hi(e,t)}},Cs=function(){return je},Es=function(e,t){var n=je;try{return je=e,t()}finally{je=n}},da=function(e,t,n){switch(t){case"input":if(Ke(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=hl(r);if(!a)throw Error(m(90));Ne(r),Ke(r,a)}}}break;case"textarea":hn(e,n);break;case"select":t=n.value,t!=null&&xt(e,!!n.multiple,t,!1)}},ds=Oi,ps=_n;var ip={usingClientEntryPoint:!1,Events:[Er,Un,hl,us,cs,Oi]},Br={findFiberByHostInstance:wn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},sp={bundleType:Br.bundleType,version:Br.version,rendererPackageName:Br.rendererPackageName,rendererConfig:Br.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:se.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=gs(e),e===null?null:e.stateNode},findFiberByHostInstance:Br.findFiberByHostInstance||lp,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Jl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Jl.isDisabled&&Jl.supportsFiber)try{qr=Jl.inject(sp),Tt=Jl}catch{}}return pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ip,pt.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Gi(t))throw Error(m(200));return rp(e,t,null,n)},pt.createRoot=function(e,t){if(!Gi(e))throw Error(m(299));var n=!1,r="",a=Wu;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(a=t.onRecoverableError)),t=Ki(e,1,!1,null,null,n,!1,r,a),e[Dt]=t.current,br(e.nodeType===8?e.parentNode:e),new Qi(t)},pt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(m(188)):(e=Object.keys(e).join(","),Error(m(268,e)));return e=gs(t),e=e===null?null:e.stateNode,e},pt.flushSync=function(e){return _n(e)},pt.hydrate=function(e,t,n){if(!Xl(t))throw Error(m(200));return Zl(null,e,t,!0,n)},pt.hydrateRoot=function(e,t,n){if(!Gi(e))throw Error(m(405));var r=n!=null&&n.hydratedSources||null,a=!1,i="",s=Wu;if(n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=Vu(t,null,e,1,n??null,a,!1,i,s),e[Dt]=t.current,br(e),r)for(e=0;e<r.length;e++)n=r[e],a=n._getVersion,a=a(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,a]:t.mutableSourceEagerHydrationData.push(n,a);return new ql(t)},pt.render=function(e,t,n){if(!Xl(t))throw Error(m(200));return Zl(null,e,t,!1,n)},pt.unmountComponentAtNode=function(e){if(!Xl(e))throw Error(m(40));return e._reactRootContainer?(_n(function(){Zl(null,null,e,!1,function(){e._reactRootContainer=null,e[Dt]=null})}),!0):!1},pt.unstable_batchedUpdates=Oi,pt.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Xl(n))throw Error(m(200));if(e==null||e._reactInternals===void 0)throw Error(m(38));return Zl(e,t,n,!1,r)},pt.version="18.3.1-next-f1338f8080-20240426",pt}var Ju;function lc(){if(Ju)return Xi.exports;Ju=1;function c(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(c)}catch(w){console.error(w)}}return c(),Xi.exports=hp(),Xi.exports}var ec;function gp(){if(ec)return ea;ec=1;var c=lc();return ea.createRoot=c.createRoot,ea.hydrateRoot=c.hydrateRoot,ea}var vp=gp();const xp=rc(vp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yp=c=>c.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ac=(...c)=>c.filter((w,m,b)=>!!w&&w.trim()!==""&&b.indexOf(w)===m).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var wp={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kp=z.forwardRef(({color:c="currentColor",size:w=24,strokeWidth:m=2,absoluteStrokeWidth:b,className:M="",children:A,iconNode:O,...H},D)=>z.createElement("svg",{ref:D,...wp,width:w,height:w,stroke:c,strokeWidth:b?Number(m)*24/Number(w):m,className:ac("lucide",M),...H},[...O.map(([q,Q])=>z.createElement(q,Q)),...Array.isArray(A)?A:[A]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=(c,w)=>{const m=z.forwardRef(({className:b,...M},A)=>z.createElement(kp,{ref:A,iconNode:w,className:ac(`lucide-${yp(c)}`,b),...M}));return m.displayName=`${c}`,m};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jp=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],Np=de("ArrowLeftRight",jp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bp=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]],ic=de("ChartColumn",bp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sp=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ts=de("Check",Sp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],na=de("CircleAlert",Cp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ep=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],lr=de("CircleCheck",Ep);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _p=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],tc=de("Clock",_p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zp=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],sc=de("Copy",zp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mp=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],ns=de("Database",Mp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pp=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],aa=de("Download",Pp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fp=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],Tp=de("ExternalLink",Fp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lp=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Ip=de("Eye",Lp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rp=[["path",{d:"M10 12v-1",key:"v7bkov"}],["path",{d:"M10 18v-2",key:"1cjy8d"}],["path",{d:"M10 7V6",key:"dljcrl"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01",key:"gkbcor"}],["circle",{cx:"10",cy:"20",r:"2",key:"1xzdoj"}]],Ap=de("FileArchive",Rp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dp=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],ar=de("FileCode",Dp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Op=[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]],$p=de("Filter",Op);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bp=[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]],Vp=de("Gauge",Bp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Up=[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M13 6h3a2 2 0 0 1 2 2v7",key:"1yeb86"}],["path",{d:"M11 18H8a2 2 0 0 1-2-2V9",key:"19pyzm"}]],ta=de("GitCompare",Up);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Kp=de("Info",Wp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hp=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],ls=de("KeyRound",Hp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qp=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],Gp=de("Layers",Qp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yp=[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]],qp=de("MessageSquare",Yp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xp=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],Zp=de("Pause",Xp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jp=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],ef=de("PenLine",Jp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tf=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],nf=de("Play",tf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rf=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Ur=de("Plus",rf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lf=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],ra=de("RefreshCw",lf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const af=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],sf=de("RotateCcw",af);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const of=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],uf=de("Save",of);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cf=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],df=de("Search",cf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pf=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ff=de("Settings",pf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mf=[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]],hf=de("SlidersVertical",mf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gf=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],Fn=de("Sparkles",gf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vf=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],es=de("Star",vf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xf=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],la=de("Trash2",xf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yf=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],oc=de("Volume2",yf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wf=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],kf=de("VolumeX",wf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jf=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]],Nf=de("WandSparkles",jf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bf=[["path",{d:"M12.8 19.6A2 2 0 1 0 14 16H2",key:"148xed"}],["path",{d:"M17.5 8a2.5 2.5 0 1 1 2 4H2",key:"1u4tom"}],["path",{d:"M9.8 4.4A2 2 0 1 1 11 8H2",key:"75valh"}]],Sf=de("Wind",bf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cf=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ia=de("X",Cf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ef=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],uc=de("Zap",Ef),_f=({activeTab:c,onSelectTab:w,onOpenSettings:m,config:b,datasetCount:M})=>{var O,H;const A=(b==null?void 0:b.poolSize)||(b!=null&&b.isKeyConfigured?1:0);return l.jsxs("header",{className:"navbar-root",children:[l.jsxs("div",{className:"navbar-container",children:[l.jsxs("div",{className:"navbar-brand",onClick:()=>w("api"),style:{cursor:"pointer"},children:[l.jsxs("div",{className:"brand-icon-wrapper",children:[l.jsx("span",{className:"brand-flag-badge",children:"Kurdish"}),l.jsx("div",{className:"brand-logo-icon",children:"🎙️"})]}),l.jsxs("div",{children:[l.jsxs("div",{className:"brand-title",children:[l.jsx("span",{className:"text-gradient",children:"Kurdish TTS"})," Studio"]}),l.jsx("div",{className:"brand-subtitle",children:"ElevenLabs Multi-Key Generator & Kurdish Dataset Engine"})]})]}),l.jsxs("nav",{className:"navbar-nav",children:[l.jsxs("button",{id:"nav-tab-api",className:`nav-tab-btn ${c==="api"?"active":""}`,onClick:()=>w("api"),children:[l.jsx(Fn,{size:18,className:"nav-tab-icon"}),l.jsx("span",{children:"Speech Generation"})]}),l.jsxs("button",{id:"nav-tab-dataset",className:`nav-tab-btn ${c==="dataset"?"active":""}`,onClick:()=>w("dataset"),children:[l.jsx(ns,{size:18,className:"nav-tab-icon"}),l.jsx("span",{children:"Dataset Manager"}),M>0&&l.jsx("span",{className:"nav-count-badge",children:M})]}),l.jsxs("button",{id:"nav-tab-compare",className:`nav-tab-btn ${c==="compare"?"active":""}`,onClick:()=>w("compare"),children:[l.jsx(ta,{size:18,className:"nav-tab-icon"}),l.jsx("span",{children:"Compare & Evaluate"})]})]}),l.jsxs("div",{className:"navbar-actions",children:[l.jsx("button",{className:`api-status-pill ${b!=null&&b.keyValid?"status-valid":"status-warning"}`,onClick:m,title:b!=null&&b.keyValid?`Key Pool Active: ${A} keys configured with automatic failover`:"Configure ElevenLabs API Keys",children:b!=null&&b.keyValid?l.jsxs(l.Fragment,{children:[l.jsx(lr,{size:15,className:"status-icon"}),l.jsx("span",{className:"status-text",children:A>1?`${A} Keys (Failover On)`:`1 Key (${((H=(O=b.userInfo)==null?void 0:O.tier)==null?void 0:H.toUpperCase())||"Ready"})`})]}):l.jsxs(l.Fragment,{children:[l.jsx(na,{size:15,className:"status-icon"}),l.jsx("span",{className:"status-text",children:"Add API Keys"})]})}),l.jsx("button",{id:"btn-open-settings",className:"btn btn-secondary btn-icon",onClick:m,title:"Multi-Key Pool & Settings",children:l.jsx(ls,{size:18})})]})]}),l.jsx("style",{children:`
        .navbar-root {
          background: rgba(11, 15, 23, 0.85);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 12px 24px;
        }

        .navbar-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          user-select: none;
        }

        .brand-icon-wrapper {
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.1));
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
        }

        .brand-flag-badge {
          position: absolute;
          top: -7px;
          right: -6px;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          background: linear-gradient(90deg, #10B981, #F59E0B, #EF4444);
          color: #FFFFFF;
          padding: 1px 5px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 0.74rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 2px;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.75);
          padding: 4px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }

        .nav-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-tab-btn.active {
          color: #FFFFFF;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(129, 140, 248, 0.2));
          border: 1px solid rgba(56, 189, 248, 0.4);
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.2);
        }

        .nav-tab-btn.active .nav-tab-icon {
          color: #38BDF8;
        }

        .nav-count-badge {
          font-size: 0.7rem;
          background: #0284C7;
          color: #FFFFFF;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .status-valid {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34D399;
        }

        .status-valid:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
        }

        .status-warning {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          color: #FBBF24;
        }

        .status-warning:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
        }

        .btn-icon {
          padding: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `})]})},zf=({toasts:c,onDismiss:w})=>l.jsxs("div",{className:"toast-container",children:[c.map(m=>l.jsx(Mf,{toast:m,onDismiss:w},m.id)),l.jsx("style",{children:`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
          width: calc(100vw - 48px);
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: rgba(18, 24, 38, 0.95);
          backdrop-filter: var(--glass-blur);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          border: 1px solid var(--border-medium);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .toast-item.toast-success {
          border-left: 4px solid var(--accent-emerald);
        }
        .toast-item.toast-error {
          border-left: 4px solid var(--accent-rose);
        }
        .toast-item.toast-info {
          border-left: 4px solid var(--primary);
        }

        .toast-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .toast-success .toast-icon { color: var(--accent-emerald); }
        .toast-error .toast-icon { color: var(--accent-rose); }
        .toast-info .toast-icon { color: var(--primary); }

        .toast-content {
          flex: 1;
        }
        .toast-title {
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--text-main);
        }
        .toast-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.4;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: color var(--transition-fast);
        }
        .toast-close:hover {
          color: var(--text-main);
        }
      `})]}),Mf=({toast:c,onDismiss:w})=>(z.useEffect(()=>{const m=setTimeout(()=>{w(c.id)},c.duration||4500);return()=>clearTimeout(m)},[c,w]),l.jsxs("div",{className:`toast-item toast-${c.type}`,children:[l.jsxs("div",{className:"toast-icon",children:[c.type==="success"&&l.jsx(lr,{size:18}),c.type==="error"&&l.jsx(na,{size:18}),c.type==="info"&&l.jsx(Kp,{size:18})]}),l.jsxs("div",{className:"toast-content",children:[l.jsx("div",{className:"toast-title",children:c.title}),c.message&&l.jsx("div",{className:"toast-desc",children:c.message})]}),l.jsx("button",{className:"toast-close",onClick:()=>w(c.id),children:l.jsx(ia,{size:14})})]}));var cc=lc();const vt="/api";async function dc(){const c=await fetch(`${vt}/config`);if(!c.ok)throw new Error("Failed to fetch system configuration");return await c.json()}async function Pf(){const c=await fetch(`${vt}/config/keys`),w=await c.json();if(!c.ok)throw new Error(w.error||"Failed to fetch key pool");return w}async function pc(c){const w=await fetch(`${vt}/config/keys`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:c})}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to add key to pool");return m}async function Ff(c){const w=await fetch(`${vt}/config/keys/${c}`,{method:"DELETE"}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to delete key");return m}async function Tf(){const c=await fetch(`${vt}/voices`),w=await c.json();if(!c.ok)throw new Error(w.error||"Failed to fetch voices");return w.voices||[]}async function Lf(){const c=await fetch(`${vt}/models`),w=await c.json();if(!c.ok)throw new Error(w.error||"Failed to fetch models");return w.models||[]}async function If(c){const w=await fetch(`${vt}/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to generate speech");return m}async function Rf(){const c=await fetch(`${vt}/dataset`),w=await c.json();if(!c.ok)throw new Error(w.error||"Failed to fetch dataset");return w.samples||[]}async function Wr(c,w){const m=await fetch(`${vt}/dataset/${encodeURIComponent(c)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)}),b=await m.json();if(!m.ok)throw new Error(b.error||"Failed to update sample");return b.sample}async function Af(c){const w=await fetch(`${vt}/dataset/${encodeURIComponent(c)}`,{method:"DELETE"}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to delete sample")}function Df(){return`${vt}/dataset/export/zip`}function fc(){return`${vt}/dataset/export/audar-zip`}async function Of(){const c=await fetch(`${vt}/dataset/export/audar-summary`);if(!c.ok)throw new Error("Failed to fetch Audar dataset summary");return await c.json()}const $f=({config:c,onClose:w,onConfigUpdated:m})=>{const[b,M]=z.useState([]),[A,O]=z.useState(null),[H,D]=z.useState(""),[q,Q]=z.useState(!0),[j,F]=z.useState(!1),[le,ye]=z.useState(null),[X,y]=z.useState(null);z.useEffect(()=>{V()},[]);const V=async()=>{Q(!0);try{const ee=await Pf();M(ee.keys||[]),O(ee);const ge=await dc().catch(()=>null);ge&&m(ge)}catch(ee){console.warn("Failed to load key pool:",ee.message)}finally{Q(!1)}},ie=async ee=>{if(ee.preventDefault(),!!H.trim()){F(!0),y(null);try{const ge=await pc(H.trim());y({success:!0,message:ge.message||"API key validated and added to pool!"}),D(""),await V()}catch(ge){y({success:!1,message:ge.message||"Invalid ElevenLabs API Key"})}finally{F(!1)}}},P=async ee=>{ye(ee),y(null);try{await Ff(ee),await V()}catch(ge){y({success:!1,message:ge.message||"Failed to remove key"})}finally{ye(null)}},se=b.reduce((ee,ge)=>ee+(ge.characterLimit||0),0),_=b.reduce((ee,ge)=>ee+(ge.characterCount||0),0),pe=(A==null?void 0:A.totalRemainingCharacters)??Math.max(0,se-_),ve=se>0?Math.min(100,Math.round(_/se*100)):0,be=l.jsxs("div",{className:"modal-backdrop",onClick:w,children:[l.jsxs("div",{className:"modal-container settings-modal-box",onClick:ee=>ee.stopPropagation(),children:[l.jsxs("div",{className:"modal-header",children:[l.jsxs("div",{className:"modal-title-group",children:[l.jsx(ls,{size:22,className:"text-cyan"}),l.jsxs("div",{children:[l.jsx("div",{className:"modal-title",children:"Multi-API Key Pool & Failover"}),l.jsx("div",{className:"modal-subtitle",children:"Add multiple ElevenLabs accounts with automatic quota failover"})]})]}),l.jsx("button",{className:"btn-ghost btn-icon",onClick:w,title:"Close Settings",children:l.jsx(ia,{size:18})})]}),l.jsxs("div",{className:"settings-body",children:[l.jsxs("div",{className:"pool-summary-card",children:[l.jsxs("div",{className:"summary-left",children:[l.jsxs("div",{className:"summary-title-row",children:[l.jsx("span",{className:"summary-title",children:"Key Pool Health"}),l.jsxs("span",{className:"badge badge-emerald",children:[l.jsx(uc,{size:12}),l.jsx("span",{children:"Auto-Failover Active"})]})]}),l.jsxs("div",{className:"summary-stats",children:[l.jsxs("span",{children:[l.jsx("strong",{children:b.filter(ee=>ee.status==="ready").length})," of ",l.jsx("strong",{children:b.length})," keys ready"]}),l.jsx("span",{className:"stat-dot",children:"•"}),l.jsxs("span",{children:[l.jsx("strong",{children:pe.toLocaleString()})," chars available"]})]})]}),l.jsxs("button",{className:"btn btn-secondary btn-sm refresh-pool-btn",onClick:V,disabled:q,title:"Refresh quota status for all keys",children:[l.jsx(ra,{size:13,className:q?"spin":""}),l.jsx("span",{children:"Refresh"})]})]}),b.length>0&&se>0&&l.jsxs("div",{className:"quota-meter-box",children:[l.jsxs("div",{className:"quota-labels",children:[l.jsx("span",{children:"Combined Pool Quota"}),l.jsxs("span",{children:[ve,"% (",_.toLocaleString()," / ",se.toLocaleString()," used)"]})]}),l.jsx("div",{className:"meter-track",children:l.jsx("div",{className:"meter-fill",style:{width:`${ve}%`}})})]}),l.jsxs("div",{className:"keys-section",children:[l.jsxs("div",{className:"section-label",children:["Configured API Keys in Pool (",b.length,")"]}),q?l.jsxs("div",{className:"loading-keys-state",children:[l.jsx(ra,{size:18,className:"spin text-cyan"}),l.jsx("span",{children:"Checking API key statuses and character quotas..."})]}):b.length===0?l.jsxs("div",{className:"empty-keys-box",children:[l.jsx(na,{size:24,className:"text-amber"}),l.jsxs("div",{children:[l.jsx("div",{className:"empty-title",children:"No API Keys Configured"}),l.jsx("div",{className:"empty-desc",children:"Add one or more ElevenLabs API keys below to enable speech generation."})]})]}):l.jsx("div",{className:"keys-list",children:b.map((ee,ge)=>{const Pe=ee.characterCount||0,oe=ee.characterLimit||1e4,xe=oe>0?Math.min(100,Math.round(Pe/oe*100)):0,Fe=ge===0;return l.jsxs("div",{className:`key-card ${ee.status==="exhausted"?"key-exhausted":""}`,children:[l.jsxs("div",{className:"key-card-header",children:[l.jsxs("div",{className:"key-info-left",children:[l.jsxs("div",{className:"key-index-badge",children:["#",ge+1]}),l.jsx("code",{className:"key-masked",children:ee.maskedKey}),Fe&&l.jsx("span",{className:"badge badge-cyan",children:"Primary"}),l.jsx("span",{className:`badge ${ee.isValid?"badge-emerald":"badge-rose"}`,children:ee.tier?ee.tier.toUpperCase():"KEY"})]}),l.jsxs("div",{className:"key-card-actions",children:[ee.status==="exhausted"?l.jsx("span",{className:"badge badge-amber",children:"Exhausted (Auto-Skipped)"}):ee.isValid?l.jsx("span",{className:"badge badge-emerald",children:"Ready"}):l.jsx("span",{className:"badge badge-rose",children:"Invalid"}),l.jsx("button",{type:"button",className:"btn-danger-icon",onClick:()=>P(ge),disabled:le===ge,title:"Remove this key from pool",children:l.jsx(la,{size:15})})]})]}),ee.isValid&&l.jsxs("div",{className:"key-quota-row",children:[l.jsxs("div",{className:"key-quota-meta",children:[l.jsxs("span",{children:[ee.remainingCharacters.toLocaleString()," chars remaining"]}),l.jsxs("span",{children:[Pe.toLocaleString()," / ",oe.toLocaleString()]})]}),l.jsx("div",{className:"meter-track-mini",children:l.jsx("div",{className:`meter-fill ${xe>90?"meter-fill-warn":""}`,style:{width:`${xe}%`}})})]}),ee.error&&l.jsx("div",{className:"key-error-msg",children:ee.error})]},ee.id||ge)})})]}),l.jsxs("div",{className:"add-key-card",children:[l.jsxs("div",{className:"add-key-header",children:[l.jsx(Ur,{size:16,className:"text-cyan"}),l.jsx("span",{className:"add-key-title",children:"Add Another ElevenLabs API Key to Pool"})]}),l.jsxs("form",{onSubmit:ie,className:"add-key-form-inner",children:[l.jsxs("div",{className:"key-form-row",children:[l.jsx("input",{type:"password",className:"input-control key-input-field",placeholder:"Paste ElevenLabs xi-api-key here (e.g. sk_...)",value:H,onChange:ee=>D(ee.target.value),id:"add-api-key-input",disabled:j}),l.jsxs("button",{type:"submit",className:"btn btn-primary add-key-submit-btn",disabled:j||!H.trim(),children:[l.jsx(Ur,{size:16}),l.jsx("span",{children:j?"Validating...":"Add Key"})]})]}),X&&l.jsxs("div",{className:`feedback-alert ${X.success?"feedback-success":"feedback-error"}`,children:[X.success?l.jsx(lr,{size:16}):l.jsx(na,{size:16}),l.jsx("span",{children:X.message})]})]})]}),l.jsxs("div",{className:"tips-section",children:[l.jsx("div",{className:"tips-title",children:"⚡ How Multi-Key Auto-Failover Works:"}),l.jsxs("ul",{className:"tips-list",children:[l.jsx("li",{children:"You can add 2, 3, or more free/paid ElevenLabs accounts to this pool."}),l.jsxs("li",{children:["Generations automatically use the first ready key. If that key exhausts its quota (401/402/429), the engine ",l.jsx("strong",{children:"immediately switches to the next account"})," without failing your request."]}),l.jsxs("li",{children:["Keys are stored locally in your environment (",l.jsx("code",{children:".env"})," & ",l.jsx("code",{children:"keys.json"}),") and never exposed publicly."]})]})]})]}),l.jsxs("div",{className:"modal-footer",children:[l.jsxs("a",{href:"https://elevenlabs.io/app/settings/api-keys",target:"_blank",rel:"noreferrer",className:"btn btn-secondary btn-sm",children:[l.jsx("span",{children:"Get ElevenLabs Key"}),l.jsx(Tp,{size:13})]}),l.jsx("button",{className:"btn btn-primary btn-sm",onClick:w,children:"Done"})]})]}),l.jsx("style",{children:`
        .settings-modal-box {
          max-width: 680px;
          width: 95vw;
        }

        .settings-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: calc(85vh - 120px);
          overflow-y: auto;
        }

        .settings-body > * {
          flex-shrink: 0;
        }

        .pool-summary-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .summary-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .summary-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
        }

        .summary-stats {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-dot {
          color: var(--border-medium);
        }

        .quota-meter-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quota-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .meter-track {
          height: 6px;
          background: rgba(30, 41, 59, 0.9);
          border-radius: 3px;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #38BDF8, #10B981);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .meter-fill-warn {
          background: linear-gradient(90deg, #F59E0B, #EF4444);
        }

        .section-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .keys-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .key-card {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all var(--transition-fast);
        }

        .key-card:hover {
          border-color: rgba(56, 189, 248, 0.4);
        }

        .key-exhausted {
          opacity: 0.7;
          border-color: rgba(245, 158, 11, 0.4);
        }

        .key-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .key-info-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .key-index-badge {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
        }

        .key-masked {
          font-family: var(--font-mono);
          font-size: 0.86rem;
          color: #F8FAFC;
        }

        .key-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-danger-icon {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-danger-icon:hover {
          color: #F87171;
          background: rgba(239, 68, 68, 0.15);
        }

        .key-quota-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .key-quota-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .meter-track-mini {
          height: 4px;
          background: rgba(30, 41, 59, 0.9);
          border-radius: 2px;
          overflow: hidden;
        }

        .key-error-msg {
          font-size: 0.75rem;
          color: #F87171;
        }

        .loading-keys-state {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-muted);
          justify-content: center;
        }

        .empty-keys-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-md);
        }

        .empty-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #FBBF24;
        }

        .empty-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .add-key-card {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: var(--radius-md);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .add-key-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #38BDF8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .add-key-form-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .key-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .key-input-field {
          flex: 1;
          min-width: 0;
          min-height: 44px;
          height: 44px;
          background: #0B0F17;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 0.92rem;
          color: #FFFFFF;
        }

        .add-key-submit-btn {
          height: 44px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .feedback-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
        }

        .feedback-success {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .feedback-error {
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .tips-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .tips-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #38BDF8;
          margin-bottom: 6px;
        }

        .tips-list {
          padding-left: 18px;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `})]});return cc.createPortal(be,document.body)};var as={};(function c(w,m,b,M){var A=!!(w.Worker&&w.Blob&&w.Promise&&w.OffscreenCanvas&&w.OffscreenCanvasRenderingContext2D&&w.HTMLCanvasElement&&w.HTMLCanvasElement.prototype.transferControlToOffscreen&&w.URL&&w.URL.createObjectURL),O=typeof Path2D=="function"&&typeof DOMMatrix=="function",H=(function(){if(!w.OffscreenCanvas)return!1;try{var p=new OffscreenCanvas(1,1),o=p.getContext("2d");o.fillRect(0,0,1,1);var g=p.transferToImageBitmap();o.createPattern(g,"no-repeat")}catch{return!1}return!0})();function D(){}function q(p){var o=m.exports.Promise,g=o!==void 0?o:w.Promise;return typeof g=="function"?new g(p):(p(D,D),null)}var Q=(function(p,o){return{transform:function(g){if(p)return g;if(o.has(g))return o.get(g);var C=new OffscreenCanvas(g.width,g.height),T=C.getContext("2d");return T.drawImage(g,0,0),o.set(g,C),C},clear:function(){o.clear()}}})(H,new Map),j=(function(){var p=Math.floor(16.666666666666668),o,g,C={},T=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(o=function(R){var $=Math.random();return C[$]=requestAnimationFrame(function L(U){T===U||T+p-1<U?(T=U,delete C[$],R()):C[$]=requestAnimationFrame(L)}),$},g=function(R){C[R]&&cancelAnimationFrame(C[R])}):(o=function(R){return setTimeout(R,p)},g=function(R){return clearTimeout(R)}),{frame:o,cancel:g}})(),F=(function(){var p,o,g={};function C(T){function R($,L){T.postMessage({options:$||{},callback:L})}T.init=function(L){var U=L.transferControlToOffscreen();T.postMessage({canvas:U},[U])},T.fire=function(L,U,Z){if(o)return R(L,null),o;var fe=Math.random().toString(36).slice(2);return o=q(function(me){function Ne(ue){ue.data.callback===fe&&(delete g[fe],T.removeEventListener("message",Ne),o=null,Q.clear(),Z(),me())}T.addEventListener("message",Ne),R(L,fe),g[fe]=Ne.bind(null,{data:{callback:fe}})}),o},T.reset=function(){T.postMessage({reset:!0});for(var L in g)g[L](),delete g[L]}}return function(){if(p)return p;if(!b&&A){var T=["var CONFETTI, SIZE = {}, module = {};","("+c.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{p=new Worker(URL.createObjectURL(new Blob([T])))}catch(R){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",R),null}C(p)}return p}})(),le={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function ye(p,o){return o?o(p):p}function X(p){return p!=null}function y(p,o,g){return ye(p&&X(p[o])?p[o]:le[o],g)}function V(p){return p<0?0:Math.floor(p)}function ie(p,o){return Math.floor(Math.random()*(o-p))+p}function P(p){return parseInt(p,16)}function se(p){return p.map(_)}function _(p){var o=String(p).replace(/[^0-9a-f]/gi,"");return o.length<6&&(o=o[0]+o[0]+o[1]+o[1]+o[2]+o[2]),{r:P(o.substring(0,2)),g:P(o.substring(2,4)),b:P(o.substring(4,6))}}function pe(p){var o=y(p,"origin",Object);return o.x=y(o,"x",Number),o.y=y(o,"y",Number),o}function ve(p){p.width=document.documentElement.clientWidth,p.height=document.documentElement.clientHeight}function be(p){var o=p.getBoundingClientRect();p.width=o.width,p.height=o.height}function ee(p){var o=document.createElement("canvas");return o.style.position="fixed",o.style.top="0px",o.style.left="0px",o.style.pointerEvents="none",o.style.zIndex=p,o}function ge(p,o,g,C,T,R,$,L,U){p.save(),p.translate(o,g),p.rotate(R),p.scale(C,T),p.arc(0,0,1,$,L,U),p.restore()}function Pe(p){var o=p.angle*(Math.PI/180),g=p.spread*(Math.PI/180);return{x:p.x,y:p.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:p.startVelocity*.5+Math.random()*p.startVelocity,angle2D:-o+(.5*g-Math.random()*g),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:p.color,shape:p.shape,tick:0,totalTicks:p.ticks,decay:p.decay,drift:p.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:p.gravity*3,ovalScalar:.6,scalar:p.scalar,flat:p.flat}}function oe(p,o){o.x+=Math.cos(o.angle2D)*o.velocity+o.drift,o.y+=Math.sin(o.angle2D)*o.velocity+o.gravity,o.velocity*=o.decay,o.flat?(o.wobble=0,o.wobbleX=o.x+10*o.scalar,o.wobbleY=o.y+10*o.scalar,o.tiltSin=0,o.tiltCos=0,o.random=1):(o.wobble+=o.wobbleSpeed,o.wobbleX=o.x+10*o.scalar*Math.cos(o.wobble),o.wobbleY=o.y+10*o.scalar*Math.sin(o.wobble),o.tiltAngle+=.1,o.tiltSin=Math.sin(o.tiltAngle),o.tiltCos=Math.cos(o.tiltAngle),o.random=Math.random()+2);var g=o.tick++/o.totalTicks,C=o.x+o.random*o.tiltCos,T=o.y+o.random*o.tiltSin,R=o.wobbleX+o.random*o.tiltCos,$=o.wobbleY+o.random*o.tiltSin;if(p.fillStyle="rgba("+o.color.r+", "+o.color.g+", "+o.color.b+", "+(1-g)+")",p.beginPath(),O&&o.shape.type==="path"&&typeof o.shape.path=="string"&&Array.isArray(o.shape.matrix))p.fill(Se(o.shape.path,o.shape.matrix,o.x,o.y,Math.abs(R-C)*.1,Math.abs($-T)*.1,Math.PI/10*o.wobble));else if(o.shape.type==="bitmap"){var L=Math.PI/10*o.wobble,U=Math.abs(R-C)*.1,Z=Math.abs($-T)*.1,fe=o.shape.bitmap.width*o.scalar,me=o.shape.bitmap.height*o.scalar,Ne=new DOMMatrix([Math.cos(L)*U,Math.sin(L)*U,-Math.sin(L)*Z,Math.cos(L)*Z,o.x,o.y]);Ne.multiplySelf(new DOMMatrix(o.shape.matrix));var ue=p.createPattern(Q.transform(o.shape.bitmap),"no-repeat");ue.setTransform(Ne),p.globalAlpha=1-g,p.fillStyle=ue,p.fillRect(o.x-fe/2,o.y-me/2,fe,me),p.globalAlpha=1}else if(o.shape==="circle")p.ellipse?p.ellipse(o.x,o.y,Math.abs(R-C)*o.ovalScalar,Math.abs($-T)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI):ge(p,o.x,o.y,Math.abs(R-C)*o.ovalScalar,Math.abs($-T)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI);else if(o.shape==="star")for(var ce=Math.PI/2*3,Ve=4*o.scalar,Xe=8*o.scalar,Ke=o.x,Ze=o.y,at=5,$e=Math.PI/at;at--;)Ke=o.x+Math.cos(ce)*Xe,Ze=o.y+Math.sin(ce)*Xe,p.lineTo(Ke,Ze),ce+=$e,Ke=o.x+Math.cos(ce)*Ve,Ze=o.y+Math.sin(ce)*Ve,p.lineTo(Ke,Ze),ce+=$e;else p.moveTo(Math.floor(o.x),Math.floor(o.y)),p.lineTo(Math.floor(o.wobbleX),Math.floor(T)),p.lineTo(Math.floor(R),Math.floor($)),p.lineTo(Math.floor(C),Math.floor(o.wobbleY));return p.closePath(),p.fill(),o.tick<o.totalTicks}function xe(p,o,g,C,T){var R=o.slice(),$=p.getContext("2d"),L,U,Z=q(function(fe){function me(){L=U=null,$.clearRect(0,0,C.width,C.height),Q.clear(),T(),fe()}function Ne(){b&&!(C.width===M.width&&C.height===M.height)&&(C.width=p.width=M.width,C.height=p.height=M.height),!C.width&&!C.height&&(g(p),C.width=p.width,C.height=p.height),$.clearRect(0,0,C.width,C.height),R=R.filter(function(ue){return oe($,ue)}),R.length?L=j.frame(Ne):me()}L=j.frame(Ne),U=me});return{addFettis:function(fe){return R=R.concat(fe),Z},canvas:p,promise:Z,reset:function(){L&&j.cancel(L),U&&U()}}}function Fe(p,o){var g=!p,C=!!y(o||{},"resize"),T=!1,R=y(o,"disableForReducedMotion",Boolean),$=A&&!!y(o||{},"useWorker"),L=$?F():null,U=g?ve:be,Z=p&&L?!!p.__confetti_initialized:!1,fe=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,me;function Ne(ce,Ve,Xe){for(var Ke=y(ce,"particleCount",V),Ze=y(ce,"angle",Number),at=y(ce,"spread",Number),$e=y(ce,"startVelocity",Number),xt=y(ce,"decay",Number),mn=y(ce,"gravity",Number),Ht=y(ce,"drift",Number),hn=y(ce,"colors",se),Tn=y(ce,"ticks",Number),gn=y(ce,"shapes"),vn=y(ce,"scalar"),te=!!y(ce,"flat"),ze=pe(ce),yt=Ke,it=[],Qt=p.width*ze.x,xn=p.height*ze.y;yt--;)it.push(Pe({x:Qt,y:xn,angle:Ze,spread:at,startVelocity:$e,color:hn[yt%hn.length],shape:gn[ie(0,gn.length)],ticks:Tn,decay:xt,gravity:mn,drift:Ht,scalar:vn,flat:te}));return me?me.addFettis(it):(me=xe(p,it,U,Ve,Xe),me.promise)}function ue(ce){var Ve=R||y(ce,"disableForReducedMotion",Boolean),Xe=y(ce,"zIndex",Number);if(Ve&&fe)return q(function($e){$e()});g&&me?p=me.canvas:g&&!p&&(p=ee(Xe),document.body.appendChild(p)),C&&!Z&&U(p);var Ke={width:p.width,height:p.height};L&&!Z&&L.init(p),Z=!0,L&&(p.__confetti_initialized=!0);function Ze(){if(L){var $e={getBoundingClientRect:function(){if(!g)return p.getBoundingClientRect()}};U($e),L.postMessage({resize:{width:$e.width,height:$e.height}});return}Ke.width=Ke.height=null}function at(){me=null,C&&(T=!1,w.removeEventListener("resize",Ze)),g&&p&&(document.body.contains(p)&&document.body.removeChild(p),p=null,Z=!1)}return C&&!T&&(T=!0,w.addEventListener("resize",Ze,!1)),L?L.fire(ce,Ke,at):Ne(ce,Ke,at)}return ue.reset=function(){L&&L.reset(),me&&me.reset()},ue}var De;function Oe(){return De||(De=Fe(null,{useWorker:!0,resize:!0})),De}function Se(p,o,g,C,T,R,$){var L=new Path2D(p),U=new Path2D;U.addPath(L,new DOMMatrix(o));var Z=new Path2D;return Z.addPath(U,new DOMMatrix([Math.cos($)*T,Math.sin($)*T,-Math.sin($)*R,Math.cos($)*R,g,C])),Z}function I(p){if(!O)throw new Error("path confetti are not supported in this browser");var o,g;typeof p=="string"?o=p:(o=p.path,g=p.matrix);var C=new Path2D(o),T=document.createElement("canvas"),R=T.getContext("2d");if(!g){for(var $=1e3,L=$,U=$,Z=0,fe=0,me,Ne,ue=0;ue<$;ue+=2)for(var ce=0;ce<$;ce+=2)R.isPointInPath(C,ue,ce,"nonzero")&&(L=Math.min(L,ue),U=Math.min(U,ce),Z=Math.max(Z,ue),fe=Math.max(fe,ce));me=Z-L,Ne=fe-U;var Ve=10,Xe=Math.min(Ve/me,Ve/Ne);g=[Xe,0,0,Xe,-Math.round(me/2+L)*Xe,-Math.round(Ne/2+U)*Xe]}return{type:"path",path:o,matrix:g}}function J(p){var o,g=1,C="#000000",T='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof p=="string"?o=p:(o=p.text,g="scalar"in p?p.scalar:g,T="fontFamily"in p?p.fontFamily:T,C="color"in p?p.color:C);var R=10*g,$=""+R+"px "+T,L=new OffscreenCanvas(R,R),U=L.getContext("2d");U.font=$;var Z=U.measureText(o),fe=Math.ceil(Z.actualBoundingBoxRight+Z.actualBoundingBoxLeft),me=Math.ceil(Z.actualBoundingBoxAscent+Z.actualBoundingBoxDescent),Ne=2,ue=Z.actualBoundingBoxLeft+Ne,ce=Z.actualBoundingBoxAscent+Ne;fe+=Ne+Ne,me+=Ne+Ne,L=new OffscreenCanvas(fe,me),U=L.getContext("2d"),U.font=$,U.fillStyle=C,U.fillText(o,ue,ce);var Ve=1/g;return{type:"bitmap",bitmap:L.transferToImageBitmap(),matrix:[Ve,0,0,Ve,-fe*Ve/2,-me*Ve/2]}}m.exports=function(){return Oe().apply(this,arguments)},m.exports.reset=function(){Oe().reset()},m.exports.create=Fe,m.exports.shapeFromPath=I,m.exports.shapeFromText=J})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),as,!1);const Bf=as.exports;as.exports.create;const Vf=[{title:"Happy with Laughs",emotion:"laugh",text:"سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش ڕوویدا."},{title:"Whisper Secret",emotion:"whisper",text:"[whisper] گوێ بگرە، ئەمە نهێنییەکی زۆر گەورەیە."},{title:"Angry Question",emotion:"angry",text:"ئەمە چییە؟ [angry] بۆچی هەمیشە ئەمە ڕوودەدات؟"},{title:"Multi-Emotions",emotion:"mixed",text:"سڵاو! [laugh] ئەمە زۆر خۆشە بەڵام [whisper] دەبێت زۆر هێمن بین."},{title:"Simple Greeting",emotion:"neutral",text:"سڵاو! چۆنی؟"}],Uf=[{char:"ێ",name:"Ye bi ser"},{char:"ڕ",name:"Re giran"},{char:"ڵ",name:"Lam giran"},{char:"ڤ",name:"Ve"},{char:"ۆ",name:"O"},{char:"ئ",name:"Hamza"},{char:"ک",name:"Kaf"},{char:"ی",name:"Ye"},{char:"ە",name:"He / Ae"}],Wf=[{tag:"[laugh]",label:"Laugh"},{tag:"[whisper]",label:"Whisper"},{tag:"[sigh]",label:"Sigh"},{tag:"[gasp]",label:"Gasp"},{tag:"[crying]",label:"Crying"},{tag:"[shouting]",label:"Shout"},{tag:"[angry]",label:"Angry"},{tag:"[happy]",label:"Happy"},{tag:"[giggle]",label:"Giggle"},{tag:"[excited]",label:"Excited"},{tag:"[cough]",label:"Cough"}],Kf=({value:c,onChange:w,label:m="Kurdish Text (Unicode / RTL)",placeholder:b="دەقی کوردی لێرە بنووسە... (کلیک لەسەر تاگەکانی [laugh] یان [whisper] بکە بۆ دانانیان لەناو دێڕەکەدا)",disabled:M=!1,onSelectPreset:A,showInlineTagToolbar:O=!0})=>{const H=z.useRef(null),[D,q]=z.useState(""),Q=P=>{const se=H.current;if(!se){w((c||"")+P);return}const _=se.selectionStart??c.length,pe=se.selectionEnd??c.length,ve=c.substring(0,_),be=c.substring(pe),ee=ve.length>0&&!ve.endsWith(" ")&&!ve.endsWith(`
`),ge=be.length>0&&!be.startsWith(" ")&&!be.startsWith(`
`),Pe=`${ee?" ":""}${P} `,oe=ve+Pe+be;w(oe),setTimeout(()=>{se.focus();const xe=_+Pe.length;se.setSelectionRange(xe,xe)},10)},j=()=>{if(!D.trim())return;let P=D.trim();P.startsWith("[")||(P=`[${P}`),P.endsWith("]")||(P=`${P}]`),Q(P),q("")},F=P=>{Q(P)},le=()=>{c&&navigator.clipboard.writeText(c)},ye=c.replace(/\[([a-zA-Z0-9_\s-]+)\]/g,"").replace(/\s+/g," ").trim(),X=c.match(/\[([a-zA-Z0-9_\s-]+)\]/g)||[],y={};X.forEach(P=>{y[P]=(y[P]||0)+1});const V=ye?ye.split(/\s+/).length:0,ie=ye.length;return l.jsxs("div",{className:"kurdish-editor-container",children:[l.jsxs("div",{className:"editor-header",children:[l.jsxs("div",{className:"editor-label-group",children:[l.jsx("label",{className:"form-label",style:{marginBottom:0},children:m}),l.jsx("span",{className:"badge badge-cyan",children:"Sorani UTF-8"}),X.length>0&&l.jsxs("span",{className:"badge badge-emerald",children:[X.length," Tag",X.length>1?"s":""," in Text"]})]}),l.jsx("div",{className:"editor-actions",children:c&&l.jsxs(l.Fragment,{children:[l.jsxs("button",{type:"button",className:"aux-btn",onClick:le,title:"Copy Kurdish text to clipboard",children:[l.jsx(sc,{size:13}),l.jsx("span",{children:"Copy"})]}),l.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>w(""),title:"Clear text",children:[l.jsx(la,{size:13}),l.jsx("span",{children:"Clear"})]})]})})]}),A&&l.jsxs("div",{className:"presets-bar",children:[l.jsxs("div",{className:"presets-title",children:[l.jsx(Fn,{size:12}),l.jsx("span",{children:"Presets:"})]}),l.jsx("div",{className:"presets-list",children:Vf.map((P,se)=>l.jsx("button",{type:"button",className:"preset-pill",onClick:()=>A(P.text,P.emotion),title:P.text,children:P.title},se))})]}),O&&l.jsxs("div",{className:"inline-tags-bar",children:[l.jsxs("div",{className:"tags-bar-header",children:[l.jsx(Nf,{size:13,className:"text-cyan"}),l.jsx("span",{children:"Click to Insert Audio Tag at Cursor:"})]}),l.jsxs("div",{className:"inline-tags-list",children:[Wf.map(P=>l.jsx("button",{type:"button",className:"inline-tag-chip",onClick:()=>Q(P.tag),title:`Click to insert ${P.tag} (click multiple times for repeated tags)`,disabled:M,children:l.jsx("code",{children:P.tag})},P.tag)),l.jsxs("div",{className:"custom-tag-mini-box",children:[l.jsx("input",{type:"text",className:"custom-tag-mini-input",placeholder:"custom tag...",value:D,onChange:P=>q(P.target.value),onKeyDown:P=>{P.key==="Enter"&&(P.preventDefault(),j())}}),l.jsx("button",{type:"button",className:"custom-tag-mini-btn",onClick:j,title:"Insert custom tag",disabled:!D.trim(),children:l.jsx(Ur,{size:12})})]})]})]}),l.jsx("div",{className:"textarea-wrapper",children:l.jsx("textarea",{ref:H,dir:"rtl",lang:"ckb",className:"textarea-control textarea-kurdish",value:c,onChange:P=>w(P.target.value),placeholder:b,disabled:M,rows:4,id:"kurdish-text-input"})}),X.length>0&&l.jsxs("div",{className:"tags-detected-banner",children:[l.jsxs("div",{className:"detected-chips-row",children:[l.jsx("span",{className:"detected-label",children:"Active Speech Tags:"}),Object.entries(y).map(([P,se])=>l.jsxs("span",{className:"tag-count-pill",children:[l.jsx("code",{children:P}),se>1&&l.jsxs("span",{className:"pill-count",children:["×",se]})]},P))]}),l.jsxs("div",{className:"clean-transcript-row",dir:"rtl",children:[l.jsx("span",{className:"clean-label",children:"Saved in JSON (Clean Unicode):"}),l.jsx("span",{className:"kurdish-text clean-text-val",children:ye||"(Empty)"})]})]}),l.jsxs("div",{className:"editor-footer",children:[l.jsxs("div",{className:"keyboard-helper",children:[l.jsx("span",{className:"helper-label",children:"Kurdish Chars:"}),l.jsx("div",{className:"char-buttons",children:Uf.map(P=>l.jsx("button",{type:"button",className:"char-btn",onClick:()=>F(P.char),title:`Insert ${P.name} (${P.char})`,children:P.char},P.char))})]}),l.jsxs("div",{className:"editor-stats",children:[l.jsxs("span",{children:[V," words"]}),l.jsx("span",{className:"stats-divider",children:"•"}),l.jsxs("span",{children:[ie," clean chars"]})]})]}),l.jsx("style",{children:`
        .kurdish-editor-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }

        .editor-label-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .editor-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inline-tags-bar {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(15, 23, 42, 0.7);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
        }

        .tags-bar-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #38BDF8;
        }

        .inline-tags-list {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .inline-tag-chip {
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #F8FAFC;
          padding: 4px 9px;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.12s ease;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .inline-tag-chip code {
          font-family: var(--font-mono);
          color: #38BDF8;
          font-weight: 600;
        }

        .inline-tag-chip:hover {
          background: #0284C7;
          border-color: #38BDF8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
        }

        .inline-tag-chip:hover code {
          color: #FFFFFF;
        }

        .inline-tag-chip:active {
          transform: scale(0.95);
        }

        .custom-tag-mini-box {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 1px 4px;
        }

        .custom-tag-mini-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.75rem;
          font-family: var(--font-mono);
          padding: 3px 6px;
          width: 95px;
          outline: none;
        }

        .custom-tag-mini-btn {
          background: #0284C7;
          border: none;
          color: #fff;
          border-radius: 3px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .custom-tag-mini-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .presets-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .presets-title {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .presets-list {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preset-pill {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .preset-pill:hover {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.35);
        }

        .textarea-wrapper {
          position: relative;
        }

        .tags-detected-banner {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detected-chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .detected-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #38BDF8;
        }

        .tag-count-pill {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-sm);
          padding: 2px 7px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag-count-pill code {
          font-family: var(--font-mono);
          color: #BAE6FD;
          font-weight: 600;
        }

        .pill-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #34D399;
          font-weight: 700;
        }

        .clean-transcript-row {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 6px;
        }

        .clean-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #34D399;
          white-space: nowrap;
          font-family: var(--font-sans);
        }

        .clean-text-val {
          color: #FFFFFF;
          font-size: 0.95rem;
        }

        .editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 4px;
        }

        .keyboard-helper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .helper-label {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .char-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .char-btn {
          font-family: var(--font-kurdish);
          font-size: 1.05rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid var(--border-medium);
          color: var(--text-main);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .char-btn:hover {
          background: #0284C7;
          color: #fff;
          border-color: #38BDF8;
          transform: translateY(-1px);
        }

        .editor-stats {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stats-divider {
          color: var(--border-medium);
        }
      `})]})},Kr=({src:c,sampleId:w,autoPlay:m=!1,onEnded:b,onTimeUpdate:M,showDownload:A=!0})=>{const O=z.useRef(null),[H,D]=z.useState(!1),[q,Q]=z.useState(0),[j,F]=z.useState(0),[le,ye]=z.useState(1),[X,y]=z.useState(!1),[V,ie]=z.useState(1);z.useEffect(()=>{O.current&&(O.current.playbackRate=le)},[le]),z.useEffect(()=>{D(!1),Q(0)},[c]);const P=()=>{O.current&&(H?(O.current.pause(),D(!1)):O.current.play().then(()=>{D(!0)}).catch(oe=>{console.error("Audio play error:",oe)}))},se=()=>{if(!O.current)return;const oe=O.current.currentTime;Q(oe),M&&M(oe)},_=()=>{O.current&&F(O.current.duration||0)},pe=oe=>{const xe=parseFloat(oe.target.value);Q(xe),O.current&&(O.current.currentTime=xe)},ve=()=>{if(!O.current)return;const oe=!X;y(oe),O.current.muted=oe},be=()=>{const oe=[.75,1,1.25,1.5],xe=(oe.indexOf(le)+1)%oe.length;ye(oe[xe])},ee=()=>{O.current&&(O.current.currentTime=0,Q(0),O.current.play(),D(!0))},ge=oe=>{if(isNaN(oe)||oe<0)return"0:00";const xe=Math.floor(oe/60),Fe=Math.floor(oe%60);return`${xe}:${Fe<10?"0":""}${Fe}`},Pe=j>0?q/j*100:0;return l.jsxs("div",{className:"audio-player-card",children:[l.jsx("audio",{ref:O,src:c,autoPlay:m,onTimeUpdate:se,onLoadedMetadata:_,onEnded:()=>{D(!1),b&&b()}}),l.jsxs("div",{className:"audio-player-main",children:[l.jsx("button",{className:`player-play-btn ${H?"playing":""}`,onClick:P,"aria-label":H?"Pause":"Play",children:H?l.jsx(Zp,{size:20}):l.jsx(nf,{size:20,style:{marginLeft:2}})}),l.jsxs("div",{className:"player-track-container",children:[l.jsx("div",{className:"player-waveform-bg",children:Array.from({length:32}).map((oe,xe)=>{const Fe=xe/32*100<=Pe,De=20+Math.sin(xe*.6)*15+Math.cos(xe*1.2)*10;return l.jsx("div",{className:`waveform-bar ${Fe?"active":""}`,style:{height:`${Math.max(15,De)}%`}},xe)})}),l.jsx("input",{type:"range",min:"0",max:j||100,step:"0.01",value:q,onChange:pe,className:"player-seek-slider"})]}),l.jsxs("div",{className:"player-time-badge",children:[l.jsx("span",{children:ge(q)}),l.jsx("span",{className:"time-separator",children:"/"}),l.jsx("span",{children:ge(j)})]})]}),l.jsxs("div",{className:"audio-player-aux",children:[l.jsxs("div",{className:"aux-left",children:[l.jsx("button",{className:"aux-btn",onClick:ee,title:"Replay from start",children:l.jsx(sf,{size:14})}),l.jsxs("button",{className:"aux-btn speed-badge",onClick:be,title:"Change Speed",children:[l.jsx(Vp,{size:13}),l.jsxs("span",{children:[le,"x"]})]}),l.jsx("button",{className:"aux-btn",onClick:ve,title:X?"Unmute":"Mute",children:X?l.jsx(kf,{size:14}):l.jsx(oc,{size:14})})]}),A&&w&&l.jsxs("a",{href:`/api/dataset/${w}/download/wav`,download:`${w}.wav`,className:"aux-btn download-btn",title:"Download Audio (WAV)",children:[l.jsx(aa,{size:14}),l.jsx("span",{children:"WAV"})]})]}),l.jsx("style",{children:`
        .audio-player-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .audio-player-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .player-play-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284C7, #0369A1);
          border: 1px solid rgba(56, 189, 248, 0.5);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          transition: all var(--transition-fast);
        }

        .player-play-btn:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #0EA5E9, #0284C7);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
        }

        .player-play-btn.playing {
          background: linear-gradient(135deg, #10B981, #059669);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        .player-track-container {
          flex: 1;
          position: relative;
          height: 36px;
          display: flex;
          align-items: center;
        }

        .player-waveform-bg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2px;
          pointer-events: none;
          padding: 0 4px;
        }

        .waveform-bar {
          flex: 1;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          transition: background 0.15s ease, height 0.15s ease;
        }

        .waveform-bar.active {
          background: linear-gradient(to top, #38BDF8, #818CF8);
        }

        .player-seek-slider {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .player-time-badge {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(30, 41, 59, 0.6);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .time-separator {
          color: var(--text-dim);
        }

        .audio-player-aux {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle);
          padding-top: 6px;
        }

        .aux-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aux-btn {
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-family: var(--font-sans);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .aux-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .speed-badge {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .download-btn {
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.3);
        }

        .download-btn:hover {
          background: rgba(56, 189, 248, 0.15);
        }
      `})]})},Hf=({alignment:c,currentTime:w=0,onSeekTime:m})=>{const[b,M]=z.useState("chars");if(!c||!c.characters||c.characters.length===0)return l.jsxs("div",{className:"alignment-empty-state",children:[l.jsx(tc,{size:16,className:"text-dim"}),l.jsx("span",{children:"No timing/alignment metadata returned for this generation."})]});const A=c.characters,O=c.character_start_times_seconds||[],H=c.character_end_times_seconds||[];return l.jsxs("div",{className:"alignment-root",children:[l.jsxs("div",{className:"alignment-header",children:[l.jsxs("div",{className:"alignment-title",children:[l.jsx(tc,{size:15,className:"text-cyan"}),l.jsxs("span",{children:["ElevenLabs Character Alignment (",A.length," characters)"]})]}),l.jsxs("div",{className:"alignment-toggle",children:[l.jsxs("button",{className:`toggle-pill ${b==="chars"?"active":""}`,onClick:()=>M("chars"),children:[l.jsx(Ip,{size:12}),l.jsx("span",{children:"Interactive"})]}),l.jsxs("button",{className:`toggle-pill ${b==="table"?"active":""}`,onClick:()=>M("table"),children:[l.jsx(Gp,{size:12}),l.jsx("span",{children:"Data"})]})]})]}),b==="chars"?l.jsx("div",{className:"alignment-chars-stream",dir:"rtl",children:A.map((D,q)=>{const Q=O[q]??0,j=H[q]??Q+.05,F=w>=Q&&w<=j,le=w>j;return l.jsxs("span",{className:`align-char-chip ${F?"active":""} ${le?"passed":""}`,onClick:()=>m&&m(Q),title:`${D} (${Q.toFixed(2)}s - ${j.toFixed(2)}s)`,children:[D===" "?" ":D,l.jsxs("span",{className:"char-timestamp",children:[Q.toFixed(2),"s"]})]},q)})}):l.jsx("div",{className:"alignment-table-wrapper",children:l.jsxs("table",{className:"alignment-table",children:[l.jsx("thead",{children:l.jsxs("tr",{children:[l.jsx("th",{children:"#"}),l.jsx("th",{children:"Char"}),l.jsx("th",{children:"Start (s)"}),l.jsx("th",{children:"End (s)"}),l.jsx("th",{children:"Duration (ms)"})]})}),l.jsx("tbody",{children:A.map((D,q)=>{const Q=O[q]??0,j=H[q]??0,F=Math.round((j-Q)*1e3);return l.jsxs("tr",{onClick:()=>m&&m(Q),style:{cursor:"pointer"},children:[l.jsx("td",{children:q+1}),l.jsx("td",{className:"kurdish-cell",children:D}),l.jsx("td",{children:Q.toFixed(3)}),l.jsx("td",{children:j.toFixed(3)}),l.jsxs("td",{children:[F,"ms"]})]},q)})})]})}),l.jsx("style",{children:`
        .alignment-root {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alignment-empty-state {
          padding: 12px;
          background: rgba(15, 23, 42, 0.4);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alignment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .alignment-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .text-cyan {
          color: #38BDF8;
        }

        .alignment-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(30, 41, 59, 0.8);
          padding: 2px;
          border-radius: var(--radius-sm);
        }

        .toggle-pill {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .toggle-pill.active {
          background: #0284C7;
          color: #fff;
        }

        .alignment-chars-stream {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          max-height: 180px;
          overflow-y: auto;
          padding: 8px;
          background: rgba(11, 15, 23, 0.6);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .align-char-chip {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-kurdish);
          font-size: 1.15rem;
          min-width: 26px;
          height: 42px;
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.1s ease;
          position: relative;
        }

        .align-char-chip:hover {
          background: rgba(56, 189, 248, 0.25);
          border-color: #38BDF8;
        }

        .align-char-chip.active {
          background: #0284C7;
          border-color: #38BDF8;
          color: #fff;
          transform: scale(1.12);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
          z-index: 5;
        }

        .align-char-chip.passed {
          opacity: 0.6;
        }

        .char-timestamp {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          color: var(--text-dim);
          line-height: 1;
        }

        .align-char-chip.active .char-timestamp {
          color: #BAE6FD;
        }

        .alignment-table-wrapper {
          max-height: 180px;
          overflow-y: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .alignment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          font-family: var(--font-mono);
          text-align: left;
        }

        .alignment-table th {
          background: rgba(30, 41, 59, 0.9);
          padding: 6px 10px;
          color: var(--text-muted);
          position: sticky;
          top: 0;
        }

        .alignment-table td {
          padding: 5px 10px;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .alignment-table tr:hover td {
          background: rgba(56, 189, 248, 0.1);
        }

        .kurdish-cell {
          font-family: var(--font-kurdish);
          font-size: 1rem;
        }
      `})]})},Qf=[{key:"naturalness",label:"Naturalness",desc:"Human-like cadence, flow, and pacing"},{key:"emotion",label:"Emotion Expression",desc:"Accuracy of intended emotional delivery"},{key:"pronunciation",label:"Pronunciation",desc:"Accuracy of Kurdish Sorani vowels & consonants"},{key:"overall",label:"Overall Quality",desc:"Suitability for Kurdish TTS dataset"}],Hr=({ratings:c,onSaveRatings:w,compact:m=!1})=>{const[b,M]=z.useState({naturalness:(c==null?void 0:c.naturalness)||0,emotion:(c==null?void 0:c.emotion)||0,pronunciation:(c==null?void 0:c.pronunciation)||0,overall:(c==null?void 0:c.overall)||0,notes:(c==null?void 0:c.notes)||""}),[A,O]=z.useState(!1),[H,D]=z.useState(!1),q=(j,F)=>{const le={...b,[j]:F};M(le),m&&w(le)},Q=async()=>{O(!0);try{await w(b),D(!0),setTimeout(()=>D(!1),2500)}finally{O(!1)}};return m?l.jsxs("div",{className:"compact-rating-root",children:[l.jsxs("div",{className:"compact-stars-row",children:[l.jsx("span",{className:"compact-label",children:"Overall:"}),[1,2,3,4,5].map(j=>l.jsx("button",{type:"button",className:`star-btn ${j<=(b.overall||0)?"filled":""}`,onClick:()=>q("overall",j),title:`${j} / 5`,children:l.jsx(es,{size:14})},j)),b.overall>0&&l.jsxs("span",{className:"score-num",children:["(",b.overall,"/5)"]})]}),l.jsx("style",{children:`
          .compact-rating-root {
            display: inline-flex;
            align-items: center;
          }
          .compact-stars-row {
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .compact-label {
            font-size: 0.75rem;
            color: var(--text-dim);
            margin-right: 4px;
          }
          .star-btn {
            background: transparent;
            border: none;
            color: rgba(148, 163, 184, 0.3);
            cursor: pointer;
            padding: 1px;
            display: flex;
            align-items: center;
            transition: transform 0.1s ease, color 0.1s ease;
          }
          .star-btn:hover {
            transform: scale(1.2);
            color: #FBBF24;
          }
          .star-btn.filled {
            color: #F59E0B;
          }
          .score-num {
            font-family: var(--font-mono);
            font-size: 0.72rem;
            color: #FBBF24;
            margin-left: 4px;
            font-weight: 600;
          }
        `})]}):l.jsxs("div",{className:"rating-card",children:[l.jsxs("div",{className:"rating-header",children:[l.jsxs("div",{className:"rating-title-group",children:[l.jsx(es,{size:16,className:"text-amber"}),l.jsx("span",{className:"rating-card-title",children:"Dataset Quality Rating (1–5)"})]}),H&&l.jsxs("span",{className:"save-badge",children:[l.jsx(ts,{size:13}),l.jsx("span",{children:"Ratings Saved"})]})]}),l.jsx("div",{className:"criteria-grid",children:Qf.map(j=>{const F=b[j.key]||0;return l.jsxs("div",{className:"criteria-item",children:[l.jsxs("div",{className:"criteria-info",children:[l.jsx("span",{className:"criteria-name",children:j.label}),l.jsx("span",{className:"criteria-desc",children:j.desc})]}),l.jsx("div",{className:"stars-selector",children:[1,2,3,4,5].map(le=>l.jsxs("button",{type:"button",className:`star-pill ${le<=F?"active":""}`,onClick:()=>q(j.key,le),title:`${j.label}: ${le} Star${le>1?"s":""}`,children:[l.jsx(es,{size:15,fill:le<=F?"currentColor":"none"}),l.jsx("span",{children:le})]},le))})]},j.key)})}),l.jsxs("div",{className:"rating-notes-box",children:[l.jsxs("div",{className:"notes-label",children:[l.jsx(qp,{size:13}),l.jsx("span",{children:"Linguistic Notes & Pronunciation Feedback:"})]}),l.jsx("textarea",{className:"input-control notes-textarea",value:b.notes||"",onChange:j=>M({...b,notes:j.target.value}),placeholder:"e.g. Kurdish vowels 'ێ' and 'ۆ' sounded natural, slight robot tone on angry inflection...",rows:2})]}),l.jsx("div",{className:"rating-footer",children:l.jsx("button",{type:"button",className:"btn btn-primary btn-sm",onClick:Q,disabled:A,children:A?l.jsx("span",{children:"Saving..."}):l.jsxs(l.Fragment,{children:[l.jsx(ts,{size:14}),l.jsx("span",{children:"Save Evaluation to JSON"})]})})}),l.jsx("style",{children:`
        .rating-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rating-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rating-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-card-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .text-amber {
          color: #F59E0B;
        }

        .save-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .criteria-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .criteria-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.5);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          gap: 12px;
        }

        .criteria-info {
          display: flex;
          flex-direction: column;
        }

        .criteria-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .criteria-desc {
          font-size: 0.72rem;
          color: var(--text-dim);
        }

        .stars-selector {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .star-pill {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-dim);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.76rem;
          font-family: var(--font-mono);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .star-pill:hover {
          background: rgba(245, 158, 11, 0.15);
          color: #FBBF24;
          border-color: #F59E0B;
          transform: translateY(-1px);
        }

        .star-pill.active {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
          border-color: #F59E0B;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
        }

        .rating-notes-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .notes-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .notes-textarea {
          font-size: 0.85rem;
          padding: 8px 12px;
          resize: vertical;
        }

        .rating-footer {
          display: flex;
          justify-content: flex-end;
        }
      `})]})},is=({sample:c,onClose:w,onSampleUpdated:m})=>{const[b,M]=z.useState(!1),[A,O]=z.useState(!1),[H,D]=z.useState(c.emotion||"neutral"),[q,Q]=z.useState(c.notes||""),[j,F]=z.useState(!1),le=JSON.stringify(c,null,2),ye=()=>{navigator.clipboard.writeText(le),M(!0),setTimeout(()=>M(!1),2e3)},X=async()=>{F(!0);try{const V=await Wr(c.id,{emotion:H,notes:q});m(V),O(!1)}catch(V){alert(`Failed to save changes: ${V.message}`)}finally{F(!1)}},y=l.jsxs("div",{className:"modal-backdrop",onClick:w,children:[l.jsxs("div",{className:"modal-container",onClick:V=>V.stopPropagation(),children:[l.jsxs("div",{className:"modal-header",children:[l.jsxs("div",{className:"modal-title-group",children:[l.jsx(ar,{size:20,className:"text-cyan"}),l.jsxs("div",{children:[l.jsxs("div",{className:"modal-title",children:["Sample Metadata: ",c.id]}),l.jsxs("div",{className:"modal-subtitle",children:[c.json_filename," • ",c.method==="elevenlabs_api"?"API Generation":"Normal Website Workflow"]})]})]}),l.jsxs("div",{className:"modal-header-actions",children:[l.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:()=>O(!A),children:[l.jsx(ef,{size:14}),l.jsx("span",{children:A?"Cancel Edit":"Edit Metadata"})]}),l.jsx("button",{className:"btn-ghost btn-icon",onClick:w,children:l.jsx(ia,{size:18})})]})]}),l.jsxs("div",{className:"kurdish-spotlight-card",children:[l.jsxs("div",{className:"spotlight-header",children:[l.jsx("span",{className:"spotlight-label",children:"Authoritative Kurdish Transcript (Unicode UTF-8)"}),l.jsxs("span",{className:"badge badge-emerald",children:[c.language.toUpperCase()," • ",c.script]})]}),l.jsx("div",{className:"kurdish-text kurdish-spotlight-body",dir:"rtl",children:c.text})]}),A&&l.jsxs("div",{className:"edit-metadata-form",children:[l.jsxs("div",{className:"form-group",children:[l.jsx("label",{className:"form-label",children:"Emotion"}),l.jsxs("select",{className:"select-control",value:H,onChange:V=>D(V.target.value),children:[l.jsx("option",{value:"neutral",children:"Neutral"}),l.jsx("option",{value:"happy",children:"Happy"}),l.jsx("option",{value:"sad",children:"Sad"}),l.jsx("option",{value:"angry",children:"Angry"}),l.jsx("option",{value:"excited",children:"Excited"}),l.jsx("option",{value:"whisper",children:"Whisper"}),l.jsx("option",{value:"laughing",children:"Laughing"}),l.jsx("option",{value:"custom",children:"Custom"})]})]}),l.jsxs("div",{className:"form-group",children:[l.jsx("label",{className:"form-label",children:"Notes & Feedback"}),l.jsx("textarea",{className:"textarea-control",value:q,onChange:V=>Q(V.target.value),rows:2})]}),l.jsxs("button",{className:"btn btn-primary btn-sm",onClick:X,disabled:j,children:[l.jsx(uf,{size:14}),l.jsx("span",{children:j?"Saving...":"Save Changes"})]})]}),l.jsxs("div",{className:"json-viewer-wrapper",children:[l.jsxs("div",{className:"json-viewer-header",children:[l.jsx("span",{className:"json-title",children:"Raw JSON Payload"}),l.jsxs("div",{className:"json-actions",children:[l.jsxs("button",{className:"aux-btn",onClick:ye,children:[b?l.jsx(ts,{size:13,className:"text-emerald"}):l.jsx(sc,{size:13}),l.jsx("span",{children:b?"Copied":"Copy JSON"})]}),l.jsxs("a",{href:`/api/dataset/${c.id}/download/json`,download:c.json_filename,className:"aux-btn",children:[l.jsx(aa,{size:13}),l.jsx("span",{children:"Download JSON"})]})]})]}),l.jsx("pre",{className:"json-code-block",children:le})]}),l.jsxs("div",{className:"modal-footer",children:[l.jsxs("div",{className:"modal-created-info",children:["Created: ",new Date(c.created_at).toLocaleString()]}),l.jsx("button",{className:"btn btn-secondary btn-sm",onClick:w,children:"Close"})]})]}),l.jsx("style",{children:`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #0F172A;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          max-width: 760px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .modal-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kurdish-spotlight-card {
          margin: 16px 20px;
          background: rgba(18, 24, 38, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          box-shadow: inset 0 0 20px rgba(56, 189, 248, 0.05);
        }

        .spotlight-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .spotlight-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .kurdish-spotlight-body {
          font-size: 1.3rem;
          color: #FFFFFF;
          line-height: 1.8;
        }

        .edit-metadata-form {
          margin: 0 20px 16px 20px;
          background: rgba(30, 41, 59, 0.6);
          padding: 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
        }

        .json-viewer-wrapper {
          margin: 0 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 180px;
          max-height: 300px;
          background: #080C14;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .json-viewer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: rgba(15, 23, 42, 0.9);
          border-bottom: 1px solid var(--border-subtle);
        }

        .json-title {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .json-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .json-code-block {
          flex: 1;
          margin: 0;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #38BDF8;
          overflow: auto;
          line-height: 1.5;
        }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(11, 15, 23, 0.9);
        }

        .modal-created-info {
          font-size: 0.78rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }
      `})]});return cc.createPortal(y,document.body)},nc=[{value:"neutral",label:"Neutral",tag:"",color:"neutral",desc:"Standard baseline tone"},{value:"laughing",label:"Laughing",tag:"[laugh]",color:"laughing",desc:"Native v3 laughter & cheerful delivery"},{value:"happy",label:"Happy",tag:"[happy]",color:"happy",desc:"Joyful & upbeat inflection"},{value:"whisper",label:"Whisper",tag:"[whisper]",color:"whisper",desc:"Soft breathy whisper"},{value:"angry",label:"Angry",tag:"[angry]",color:"angry",desc:"Sharp, aggressive intensity"},{value:"sad",label:"Sad",tag:"[sad]",color:"sad",desc:"Melancholic, slower cadence"},{value:"excited",label:"Excited",tag:"[excited]",color:"excited",desc:"Energetic, dynamic pitch"},{value:"custom",label:"Custom Tag",tag:"[laugh]",color:"custom",desc:"User-defined audio tag prompt"}],Gf=({config:c,onOpenSettings:w,onSampleCreated:m,addToast:b,onConfigUpdated:M})=>{const[A,O]=z.useState("سڵاو! [laugh] چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا."),[H,D]=z.useState("laughing"),[q,Q]=z.useState(["laughing"]),[j,F]=z.useState(""),[le,ye]=z.useState(!0),[X,y]=z.useState(!1),[V,ie]=z.useState(!1),[P,se]=z.useState(""),[_,pe]=z.useState(!1),[ve,be]=z.useState([]),[ee,ge]=z.useState([]),[Pe,oe]=z.useState(""),[xe,Fe]=z.useState("eleven_v3"),[De,Oe]=z.useState(!1),[Se,I]=z.useState(""),[J,p]=z.useState(!1),[o,g]=z.useState(!1),[C,T]=z.useState(.5),[R,$]=z.useState(.75),[L,U]=z.useState(0),[Z,fe]=z.useState(!0),[me,Ne]=z.useState(!1),[ue,ce]=z.useState(null),[Ve,Xe]=z.useState(0),[Ke,Ze]=z.useState(null),at=z.useRef(null),$e=(c==null?void 0:c.poolSize)||(c!=null&&c.isKeyConfigured?1:0);z.useEffect(()=>{xt()},[c==null?void 0:c.keyValid]);const xt=async()=>{if(c!=null&&c.keyValid){p(!0);try{const[te,ze]=await Promise.all([Tf().catch(()=>[]),Lf().catch(()=>[])]);be(te),ge(ze),te.length>0&&!Pe&&oe(te[0].voice_id)}catch(te){console.warn("Could not load voice catalog:",te)}finally{p(!1)}}},mn=(te,ze)=>{O(te),ze&&nc.some(yt=>yt.value===ze)&&D(ze)},Ht=nc.find(te=>te.value===H),hn=H==="custom"?j:(Ht==null?void 0:Ht.tag)||"",Tn=async te=>{if(te.preventDefault(),!A.trim()){b({type:"error",title:"Input Error",message:"Please enter Kurdish text to generate speech."});return}if(!(c!=null&&c.keyValid)){b({type:"error",title:"API Key Missing",message:"Please add at least one ElevenLabs API Key in Settings."}),w();return}const ze=ve.find(it=>it.voice_id===Pe),yt=De?Se.trim()||"eleven_v3":xe;Ne(!0);try{const Qt=(await If({text:A.trim(),emotion:H,emotions:q,emotionTag:hn,includeTagInPrompt:le,whisperEntire:X,voiceId:Pe||"21m00Tcm4TlvDq8ikWAM",voiceName:ze?ze.name:void 0,modelId:yt,voiceSettings:{stability:X?.35:C,similarity_boost:R,style:X?.45:L,use_speaker_boost:Z}})).sample;ce(Qt),m(Qt),setTimeout(()=>{var xn;(xn=at.current)==null||xn.scrollIntoView({behavior:"smooth",block:"center"})},150),Bf({particleCount:50,spread:60,origin:{y:.7}}),b({type:"success",title:"Speech Generated Successfully!",message:`Sample saved as ${Qt.id}.wav and ${Qt.id}.json with clean Kurdish transcript.`})}catch(it){b({type:"error",title:"Speech Generation Failed",message:it.message||"ElevenLabs API returned an error."})}finally{Ne(!1)}},gn=async te=>{if(ue)try{const ze=await Wr(ue.id,{ratings:te});ce(ze),m(ze),b({type:"success",title:"Ratings Saved",message:"Evaluation saved to metadata JSON."})}catch(ze){b({type:"error",title:"Save Failed",message:ze.message})}},vn=async te=>{if(te.preventDefault(),!!P.trim()){pe(!0);try{const ze=await pc(P.trim());b({type:"success",title:"API Key Added to Pool",message:ze.message||"Key validated and added to pool successfully."}),M&&M({status:"ok",isKeyConfigured:!0,keyValid:!0,poolSize:ze.pool.length,validationError:null,maskedKey:`${P.slice(0,4)}...${P.slice(-4)}`}),se(""),ie(!1),xt()}catch(ze){b({type:"error",title:"Validation Failed",message:ze.message||"Invalid ElevenLabs API Key."})}finally{pe(!1)}}};return l.jsxs("div",{className:"api-page-root",children:[l.jsx("div",{className:"page-header",children:l.jsxs("div",{children:[l.jsxs("h1",{className:"page-title",children:[l.jsx(Fn,{size:24,className:"text-cyan inline-icon"}),l.jsx("span",{children:"ElevenLabs Multi-Key Speech Generator"})]}),l.jsxs("p",{className:"page-description",children:["Synthesize Kurdish emotional speech with ElevenLabs v3. Supports multiple inline tags (",l.jsx("code",{children:"[laugh]"}),", ",l.jsx("code",{children:"[whisper]"}),", ",l.jsx("code",{children:"[sigh]"}),"), full continuous whispering, and ",l.jsx("strong",{children:"automatic multi-key quota failover"})," while preserving exact clean Unicode transcripts."]})]})}),l.jsxs("div",{className:`glass-card api-config-banner ${c!=null&&c.keyValid?"config-connected":"config-missing"}`,children:[l.jsxs("div",{className:"config-banner-left",children:[l.jsx("div",{className:"config-icon-badge",children:c!=null&&c.keyValid?l.jsx(uc,{size:20,className:"text-emerald"}):l.jsx(ls,{size:20,className:"text-amber"})}),l.jsxs("div",{className:"config-info",children:[l.jsxs("div",{className:"config-status-title",children:[l.jsx("span",{children:"ElevenLabs Multi-Key Pool:"}),c!=null&&c.keyValid?l.jsxs(l.Fragment,{children:[l.jsxs("span",{className:"badge badge-emerald",children:[$e," Key",$e>1?"s":""," Active"]}),l.jsx("span",{className:"badge badge-purple",children:"Auto-Failover On"})]}):l.jsx("span",{className:"badge badge-amber",children:"No Keys Configured"})]}),l.jsx("div",{className:"config-status-desc",children:c!=null&&c.keyValid?`Pool active with ${$e} account(s). If any key runs out of quota, generation automatically switches to the next available account.`:"Add one or more ElevenLabs API keys to enable synthesis. Multiple accounts will automatically failover."})]})]}),l.jsxs("div",{className:"config-banner-actions",children:[l.jsxs("button",{type:"button",className:"btn btn-secondary btn-sm",onClick:()=>ie(!V),children:[l.jsx(Ur,{size:14}),l.jsx("span",{children:V?"Cancel":"Quick Add Key"})]}),l.jsxs("button",{type:"button",className:"btn btn-primary btn-sm",onClick:w,children:[l.jsx(ff,{size:14}),l.jsx("span",{children:"Manage Key Pool"})]})]})]}),V&&l.jsxs("form",{onSubmit:vn,className:"inline-key-form-card glass-card",children:[l.jsxs("div",{className:"key-form-row",children:[l.jsx("input",{type:"password",className:"input-control",placeholder:"Paste xi-api-key here to add to pool (e.g. sk_...)",value:P,onChange:te=>se(te.target.value),id:"inline-api-key-input"}),l.jsxs("button",{type:"submit",className:"btn btn-primary btn-sm",disabled:_||!P.trim(),children:[l.jsx(Ur,{size:14}),l.jsx("span",{children:_?"Validating...":"Add to Pool"})]})]}),l.jsxs("div",{className:"key-form-hint",children:["🔒 Key will be validated and added to the failover pool (",l.jsx("code",{children:".env"})," & ",l.jsx("code",{children:"keys.json"}),")."]})]}),l.jsxs("div",{className:"api-grid-layout",children:[l.jsxs("form",{onSubmit:Tn,className:"glass-card generator-form-card",children:[l.jsx("div",{className:"form-group",children:l.jsx(Kf,{value:A,onChange:O,onSelectPreset:mn,label:"Kurdish Transcript with Inline Tags",disabled:me,showInlineTagToolbar:!0})}),l.jsx("div",{className:"whisper-banner-card",children:l.jsxs("label",{className:"whisper-checkbox-row",children:[l.jsx("input",{type:"checkbox",checked:X,onChange:te=>y(te.target.checked)}),l.jsxs("div",{className:"whisper-label-wrap",children:[l.jsxs("div",{className:"whisper-title",children:[l.jsx(Sf,{size:16,className:"text-purple"}),l.jsx("span",{children:"💨 Whisper Throughout Entire Audio"}),l.jsx("span",{className:"badge badge-purple",children:"Continuous Mode"})]}),l.jsx("div",{className:"whisper-desc",children:"Instructs ElevenLabs v3 to maintain a continuous, soft whisper from the first word to the end of the audio track."})]})]})}),l.jsxs("div",{className:"grid-2 form-row-compact",children:[l.jsxs("div",{className:"form-group",children:[l.jsxs("div",{className:"form-label-row",children:[l.jsx("label",{className:"form-label",style:{marginBottom:0},children:"Voice ID / Preset"}),(c==null?void 0:c.keyValid)&&l.jsx("button",{type:"button",className:"reload-btn",onClick:xt,title:"Reload voices from ElevenLabs",children:l.jsx(ra,{size:12,className:J?"spin":""})})]}),ve.length>0?l.jsx("select",{className:"select-control",value:Pe,onChange:te=>oe(te.target.value),disabled:me,children:ve.map(te=>l.jsxs("option",{value:te.voice_id,children:[te.name," (",te.category||"voice",")"]},te.voice_id))}):l.jsx("input",{type:"text",className:"input-control",placeholder:"Enter ElevenLabs Voice ID (e.g. 21m00Tcm4TlvDq8ikWAM)",value:Pe,onChange:te=>oe(te.target.value),disabled:me})]}),l.jsxs("div",{className:"form-group",children:[l.jsxs("div",{className:"form-label-row",children:[l.jsx("label",{className:"form-label",style:{marginBottom:0},children:"ElevenLabs Model"}),l.jsx("span",{className:"badge badge-emerald",children:"v3 Audio Tags"})]}),l.jsxs("select",{className:"select-control",value:De?"custom":xe,onChange:te=>{te.target.value==="custom"?Oe(!0):(Oe(!1),Fe(te.target.value))},disabled:me,children:[l.jsx("option",{value:"eleven_v3",children:"ElevenLabs v3 (Recommended — Supports [laugh], [whisper], [sigh])"}),l.jsx("option",{value:"eleven_multilingual_v3",children:"Eleven Multilingual v3"}),l.jsx("option",{value:"eleven_turbo_v3",children:"Eleven Turbo v3"}),l.jsx("option",{value:"eleven_multilingual_v2",children:"Eleven Multilingual v2"}),l.jsx("option",{value:"eleven_turbo_v2_5",children:"Eleven Turbo v2.5 (Fast Multilingual)"}),l.jsx("option",{value:"eleven_flash_v2_5",children:"Eleven Flash v2.5 (Ultra Low Latency)"}),l.jsx("option",{value:"eleven_flash_v2",children:"Eleven Flash v2"}),l.jsx("option",{value:"eleven_monolingual_v1",children:"Eleven English v1"}),l.jsx("option",{value:"custom",children:"Custom Model ID..."})]}),De&&l.jsx("input",{type:"text",className:"input-control",style:{marginTop:6},placeholder:"Enter custom model ID (e.g. eleven_v3, eleven_multilingual_v3)",value:Se,onChange:te=>I(te.target.value),disabled:me})]})]}),l.jsx("div",{className:"advanced-settings-toggle",children:l.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>g(!o),children:[l.jsx(hf,{size:13}),l.jsx("span",{children:o?"Hide Advanced Parameters":"Advanced Parameters (Stability, Similarity Boost, Style)"})]})}),o&&l.jsxs("div",{className:"advanced-settings-panel",children:[l.jsxs("div",{className:"slider-group",children:[l.jsxs("div",{className:"slider-label-row",children:[l.jsxs("span",{children:["Stability: ",C.toFixed(2)]}),l.jsx("span",{className:"slider-desc",children:"Higher = consistent / Lower = expressive"})]}),l.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:C,onChange:te=>T(parseFloat(te.target.value)),className:"range-slider"})]}),l.jsxs("div",{className:"slider-group",children:[l.jsxs("div",{className:"slider-label-row",children:[l.jsxs("span",{children:["Similarity Boost: ",R.toFixed(2)]}),l.jsx("span",{className:"slider-desc",children:"Closeness to original speaker voice"})]}),l.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:R,onChange:te=>$(parseFloat(te.target.value)),className:"range-slider"})]}),l.jsxs("div",{className:"slider-group",children:[l.jsxs("div",{className:"slider-label-row",children:[l.jsxs("span",{children:["Style Exaggeration: ",L.toFixed(2)]}),l.jsx("span",{className:"slider-desc",children:"Amplifies emotional delivery"})]}),l.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:L,onChange:te=>U(parseFloat(te.target.value)),className:"range-slider"})]}),l.jsxs("label",{className:"checkbox-label",style:{marginTop:6},children:[l.jsx("input",{type:"checkbox",checked:Z,onChange:te=>fe(te.target.checked)}),l.jsx("span",{children:"Enable Speaker Boost (Improves clarity and volume)"})]})]}),l.jsx("div",{className:"form-submit-row",children:l.jsx("button",{type:"submit",className:"btn btn-primary btn-lg submit-btn pulse-glow",disabled:me||!A.trim(),id:"btn-generate-speech",children:me?l.jsxs(l.Fragment,{children:[l.jsx(ra,{size:18,className:"spin"}),l.jsx("span",{children:"Synthesizing Kurdish Audio with ElevenLabs v3..."})]}):l.jsxs(l.Fragment,{children:[l.jsx(Fn,{size:18}),l.jsx("span",{children:"Generate Kurdish Speech (API)"})]})})})]}),l.jsx("div",{ref:at,className:"generation-output-container sticky-output-panel",children:ue?l.jsxs("div",{className:"glass-card glass-card-glow output-card",children:[l.jsxs("div",{className:"output-card-header",children:[l.jsxs("div",{className:"output-badge-group",children:[l.jsxs("span",{className:"badge badge-cyan",children:["ID: ",ue.id]}),l.jsx("span",{className:`badge emotion-badge-${ue.emotion}`,children:ue.emotion.toUpperCase()}),l.jsx("span",{className:"badge badge-purple",children:ue.model_id})]}),l.jsx("div",{className:"output-header-actions",children:l.jsxs("button",{className:"aux-btn",onClick:()=>Ze(ue),title:"Inspect full JSON metadata",children:[l.jsx(ar,{size:13}),l.jsx("span",{children:"Inspect JSON"})]})})]}),l.jsxs("div",{className:"output-kurdish-box",children:[l.jsxs("div",{className:"output-kurdish-label",children:[l.jsx("span",{children:"Preserved Kurdish Transcript (Clean Unicode)"}),l.jsx("span",{className:"badge badge-emerald",children:"Exact UTF-8"})]}),l.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:ue.text})]}),l.jsx("div",{className:"output-audio-section",children:l.jsx(Kr,{src:ue.audioUrl||`/api/dataset/${ue.id}/audio`,sampleId:ue.id,autoPlay:!0,onTimeUpdate:Xe})}),ue.alignment&&l.jsx("div",{className:"output-alignment-section",children:l.jsx(Hf,{alignment:ue.alignment,currentTime:Ve})}),l.jsx("div",{className:"output-rating-section",children:l.jsx(Hr,{ratings:ue.ratings,onSaveRatings:gn})})]}):l.jsxs("div",{className:"glass-card empty-output-card",children:[l.jsx("div",{className:"empty-icon-wrap",children:l.jsx(oc,{size:36,className:"text-cyan"})}),l.jsx("div",{className:"empty-title",children:"Ready for Speech Generation"}),l.jsxs("p",{className:"empty-sub",children:["Enter your Kurdish text on the left, insert tags like ",l.jsx("code",{children:"[laugh]"})," or enable ",l.jsx("code",{children:"Continuous Whisper"}),", and press ",l.jsx("strong",{children:"Generate Kurdish Speech"}),"."]}),l.jsxs("div",{className:"empty-features-list",children:[l.jsxs("div",{className:"feature-item",children:[l.jsx(lr,{size:15,className:"text-emerald"}),l.jsx("span",{children:"Interactive result panel opens directly in view"})]}),l.jsxs("div",{className:"feature-item",children:[l.jsx(lr,{size:15,className:"text-emerald"}),l.jsxs("span",{children:["Preserves clean Kurdish text in ",l.jsx("code",{children:"001.json"})," stripping tags"]})]}),l.jsxs("div",{className:"feature-item",children:[l.jsx(lr,{size:15,className:"text-emerald"}),l.jsx("span",{children:"Supports multiple inline emotion tags & continuous whisper"})]})]})]})})]}),Ke&&l.jsx(is,{sample:Ke,onClose:()=>Ze(null),onSampleUpdated:te=>{Ze(te),(ue==null?void 0:ue.id)===te.id&&ce(te)}}),l.jsx("style",{children:`
        .api-page-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .page-title {
          font-size: 1.65rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.02em;
        }

        .inline-icon {
          color: #38BDF8;
        }

        .page-description {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin-top: 4px;
          max-width: 860px;
          line-height: 1.6;
        }

        .api-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .api-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .sticky-output-panel {
          position: sticky;
          top: 84px;
        }

        .generator-form-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .whisper-banner-card {
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .api-config-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          gap: 16px;
          flex-wrap: wrap;
        }

        .config-connected {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .config-missing {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .config-banner-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .config-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .config-status-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--text-main);
        }

        .config-status-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .config-banner-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inline-key-form-card {
          padding: 14px 20px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: fadeIn 0.2s ease;
        }

        .key-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .key-form-row input {
          flex: 1;
        }

        .key-form-hint {
          font-size: 0.74rem;
          color: var(--text-dim);
        }

        .whisper-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .whisper-checkbox-row input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          accent-color: #A855F7;
          cursor: pointer;
        }

        .whisper-label-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .whisper-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #E2E8F0;
        }

        .text-purple {
          color: #C084FC;
        }

        .whisper-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .form-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .emotion-prompt-preview {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .emotions-chips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .emotions-chips-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .emotion-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 6px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .emotion-chip:hover {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.4);
          color: var(--text-main);
        }

        .emotion-chip.selected {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .emotion-chip-label {
          font-weight: 700;
          font-size: 0.82rem;
        }

        .emotion-chip-tag {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          opacity: 0.7;
          margin-top: 2px;
        }

        .custom-emotion-input-row {
          margin-top: 10px;
        }

        .form-row-compact {
          margin-bottom: 0;
        }

        .reload-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
        }

        .reload-btn:hover {
          color: var(--text-main);
        }

        .spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .advanced-settings-toggle {
          display: flex;
        }

        .advanced-settings-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .slider-desc {
          font-weight: normal;
          color: var(--text-dim);
          font-size: 0.72rem;
        }

        .range-slider {
          width: 100%;
          accent-color: #38BDF8;
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-main);
          cursor: pointer;
        }

        .form-submit-row {
          margin-top: 8px;
        }

        .submit-btn {
          width: 100%;
        }

        /* Output Card Styling */
        .output-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .output-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .output-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .output-kurdish-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 14px 16px;
        }

        .output-kurdish-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .output-kurdish-text {
          font-size: 1.25rem;
          color: #FFFFFF;
          line-height: 1.8;
        }

        .empty-output-card {
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 480px;
          justify-content: center;
        }

        .empty-icon-wrap {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .empty-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          max-width: 380px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .empty-features-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
          width: 100%;
          max-width: 380px;
          background: rgba(15, 23, 42, 0.5);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .feature-item code {
          font-family: var(--font-mono);
          color: #38BDF8;
        }
      `})]})},Yf=({isOpen:c,onClose:w})=>{var D,q,Q;const[m,b]=z.useState(!0),[M,A]=z.useState(null),[O,H]=z.useState(null);return z.useEffect(()=>{c&&(b(!0),H(null),Of().then(j=>{A(j),b(!1)}).catch(j=>{H(j.message),b(!1)}))},[c]),c?l.jsx("div",{className:"modal-backdrop",onClick:w,children:l.jsxs("div",{className:"modal-container glass-card audar-modal",onClick:j=>j.stopPropagation(),style:{maxWidth:"780px"},children:[l.jsxs("div",{className:"modal-header",children:[l.jsxs("div",{className:"modal-title-group",children:[l.jsx("div",{className:"modal-icon-badge",style:{background:"linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",color:"#0f172a"},children:l.jsx(Fn,{size:20})}),l.jsxs("div",{children:[l.jsx("h2",{className:"modal-title",children:"Audar Canonical Speech Dataset Exporter"}),l.jsx("p",{className:"modal-subtitle",children:"Central Kurdish (Sorani / سۆرانی - ckb) Canonical Schema v2.0"})]})]}),l.jsx("button",{className:"btn-close-modal",onClick:w,children:l.jsx(ia,{size:18})})]}),l.jsx("div",{className:"modal-body",style:{maxHeight:"70vh",overflowY:"auto"},children:m?l.jsxs("div",{className:"loading-state",style:{padding:"2.5rem",textAlign:"center"},children:[l.jsx("div",{className:"spinner",style:{margin:"0 auto 1rem"}}),l.jsx("p",{className:"text-muted",children:"Computing Kurdish phoneme coverage and schema verification..."})]}):O?l.jsx("div",{className:"error-banner",style:{padding:"1rem",color:"#ef4444"},children:l.jsxs("p",{children:["Failed to load summary: ",O]})}):l.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.25rem"},children:[l.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"0.75rem"},children:[l.jsxs("div",{className:"glass-card",style:{padding:"0.9rem",textAlign:"center",background:"rgba(255,255,255,0.03)"},children:[l.jsx("div",{className:"text-muted",style:{fontSize:"0.75rem",textTransform:"uppercase"},children:"Total Samples"}),l.jsx("div",{style:{fontSize:"1.5rem",fontWeight:700,color:"#38bdf8"},children:M.totalSamples})]}),l.jsxs("div",{className:"glass-card",style:{padding:"0.9rem",textAlign:"center",background:"rgba(255,255,255,0.03)"},children:[l.jsx("div",{className:"text-muted",style:{fontSize:"0.75rem",textTransform:"uppercase"},children:"Total Duration"}),l.jsxs("div",{style:{fontSize:"1.5rem",fontWeight:700,color:"#10b981"},children:[M.totalDurationSeconds,"s"]}),l.jsxs("div",{style:{fontSize:"0.7rem",color:"#94a3b8"},children:["~",M.totalDurationHours," hrs"]})]}),l.jsxs("div",{className:"glass-card",style:{padding:"0.9rem",textAlign:"center",background:"rgba(255,255,255,0.03)"},children:[l.jsx("div",{className:"text-muted",style:{fontSize:"0.75rem",textTransform:"uppercase"},children:"Splits (T/V/T)"}),l.jsxs("div",{style:{fontSize:"1.25rem",fontWeight:700,color:"#f59e0b"},children:[((D=M.splits)==null?void 0:D.train)||0," / ",((q=M.splits)==null?void 0:q.val)||0," / ",((Q=M.splits)==null?void 0:Q.test)||0]}),l.jsx("div",{style:{fontSize:"0.7rem",color:"#94a3b8"},children:"Train / Val / Test"})]}),l.jsxs("div",{className:"glass-card",style:{padding:"0.9rem",textAlign:"center",background:"rgba(255,255,255,0.03)"},children:[l.jsx("div",{className:"text-muted",style:{fontSize:"0.75rem",textTransform:"uppercase"},children:"Audio Target"}),l.jsx("div",{style:{fontSize:"1.25rem",fontWeight:700,color:"#a855f7"},children:"24 kHz"}),l.jsx("div",{style:{fontSize:"0.7rem",color:"#94a3b8"},children:"16-bit Mono WAV"})]})]}),l.jsxs("div",{className:"glass-card",style:{padding:"1rem",background:"rgba(255,255,255,0.02)"},children:[l.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.75rem"},children:[l.jsx(ic,{size:16,className:"text-cyan"}),l.jsx("h4",{style:{margin:0,fontSize:"0.9rem",fontWeight:600},children:"Kurdish Phoneme Inventory Coverage"})]}),l.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:"0.5rem"},children:Object.entries(M.phoneticCoverage||{}).map(([j,F])=>l.jsxs("div",{style:{padding:"0.5rem 0.6rem",borderRadius:"6px",background:F>0?"rgba(56, 189, 248, 0.08)":"rgba(255, 255, 255, 0.02)",border:F>0?"1px solid rgba(56, 189, 248, 0.25)":"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[l.jsx("span",{style:{fontSize:"1.1rem",fontWeight:700,fontFamily:"Noto Naskh Arabic, sans-serif"},children:j}),l.jsxs("span",{style:{fontSize:"0.75rem",color:F>0?"#38bdf8":"#64748b",fontWeight:600},children:[F,"%"]})]},j))})]}),l.jsxs("div",{className:"glass-card",style:{padding:"1rem",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.07)"},children:[l.jsx("div",{style:{fontSize:"0.8rem",fontWeight:600,color:"#94a3b8",marginBottom:"0.5rem"},children:"ZIP ARCHIVE LAYOUT (Audar Canonical Schema v2.0):"}),l.jsx("pre",{style:{margin:0,fontSize:"0.78rem",color:"#38bdf8",lineHeight:1.45,fontFamily:"monospace"},children:`dataset_export/
├── audio/                      <-- 24kHz 16-bit Mono PCM WAV files
│   ├── krd_synth_spk01_001.wav
│   └── ...
├── data.jsonl                  <-- Master Canonical JSONL (Full Metrics & Tags)
├── metadata.csv                <-- TTS Manifest (Pipe-delimited: audio|text|spk|emotion)
├── whisper.jsonl               <-- ASR Training Manifest (Whisper / Meta MMS)
└── manifest.json               <-- Dataset Summary, Stats & SHA256 Hashes`})]})]})}),l.jsxs("div",{className:"modal-footer",style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[l.jsx("button",{className:"btn btn-secondary btn-sm",onClick:w,children:"Close"}),l.jsxs("a",{href:fc(),download:"audar_kurdish_canonical_dataset.zip",className:"btn btn-accent btn-md",style:{background:"linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",color:"#ffffff",fontWeight:600,display:"inline-flex",alignItems:"center",gap:"0.5rem",textDecoration:"none"},children:[l.jsx(aa,{size:18}),l.jsx("span",{children:"Download Audar Canonical Dataset (ZIP)"})]})]})]})}):null},qf=({samples:c,onSampleUpdated:w,onSampleDeleted:m,addToast:b})=>{const[M,A]=z.useState(""),[O,H]=z.useState("all"),[D,q]=z.useState("all"),[Q,j]=z.useState(null),[F,le]=z.useState(null),[ye,X]=z.useState(!1),[y,V]=z.useState("cards"),ie=c.filter(_=>{if(M.trim()){const pe=M.toLowerCase(),ve=_.id.toLowerCase().includes(pe),be=_.text.toLowerCase().includes(pe),ee=(_.voice_name||_.voice_id||"").toLowerCase().includes(pe);if(!ve&&!be&&!ee)return!1}return!(O!=="all"&&_.emotion!==O||D!=="all"&&_.method!==D)}),P=async _=>{if(window.confirm(`Are you sure you want to delete sample "${_}" and its WAV/JSON files?`))try{await Af(_),m(_),b({type:"info",title:"Sample Deleted",message:`Sample ${_} removed from dataset.`})}catch(pe){b({type:"error",title:"Delete Failed",message:pe.message})}},se=async(_,pe)=>{try{const ve=await Wr(_,{ratings:pe});w(ve),b({type:"success",title:"Rating Saved",message:`Ratings updated for ${_}`})}catch(ve){b({type:"error",title:"Rating Failed",message:ve.message})}};return l.jsxs("div",{className:"dataset-page-root",children:[l.jsxs("div",{className:"dataset-page-header",children:[l.jsxs("div",{children:[l.jsxs("h1",{className:"page-title",children:[l.jsx(ns,{size:24,className:"text-cyan inline-icon"}),l.jsx("span",{children:"Kurdish Speech Dataset Manager"})]}),l.jsx("p",{className:"page-description",children:"Authoritative repository of all generated Kurdish WAV audio files, Asosoft Kurdish orthography, and Audar Canonical Speech Schema."})]}),l.jsxs("div",{className:"header-actions",style:{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"},children:[l.jsxs("a",{href:fc(),download:"audar_kurdish_canonical_dataset.zip",className:"btn btn-accent btn-md",id:"btn-download-audar-canonical-zip",style:{background:"linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",color:"#ffffff",fontWeight:600,boxShadow:"0 4px 14px rgba(6, 182, 212, 0.35)",display:"inline-flex",alignItems:"center",gap:"6px"},title:"Export full dataset formatted strictly according to Audar Canonical Schema (data.jsonl, metadata.csv, whisper.jsonl, 24kHz Mono WAVs)",children:[l.jsx(Fn,{size:17}),l.jsx("span",{children:"Export Audar Canonical (ZIP)"})]}),l.jsxs("button",{onClick:()=>X(!0),className:"btn btn-secondary btn-md",id:"btn-audar-schema-stats",style:{display:"inline-flex",alignItems:"center",gap:"6px"},title:"View Kurdish Phoneme Coverage and Audar Schema specifications",children:[l.jsx(ic,{size:17}),l.jsx("span",{children:"Audar Schema & Stats"})]}),l.jsxs("a",{href:Df(),download:"kurdish_tts_dataset.zip",className:"btn btn-secondary btn-sm",id:"btn-download-dataset-zip",title:"Download raw audio and JSON files",children:[l.jsx(Ap,{size:15}),l.jsx("span",{children:"Raw ZIP"})]})]})]}),l.jsxs("div",{className:"glass-card filter-card",children:[l.jsxs("div",{className:"filter-grid",children:[l.jsxs("div",{className:"search-input-wrapper",children:[l.jsx(df,{size:16,className:"search-icon"}),l.jsx("input",{type:"text",className:"input-control search-input",placeholder:"Search by Kurdish text, ID (e.g. 001), or voice...",value:M,onChange:_=>A(_.target.value)})]}),l.jsxs("div",{className:"filter-select-group",children:[l.jsx($p,{size:15,className:"text-muted"}),l.jsxs("select",{className:"select-control filter-select",value:O,onChange:_=>H(_.target.value),children:[l.jsx("option",{value:"all",children:"All Emotions"}),l.jsx("option",{value:"neutral",children:"Neutral"}),l.jsx("option",{value:"happy",children:"Happy"}),l.jsx("option",{value:"sad",children:"Sad"}),l.jsx("option",{value:"angry",children:"Angry"}),l.jsx("option",{value:"excited",children:"Excited"}),l.jsx("option",{value:"whisper",children:"Whisper"}),l.jsx("option",{value:"laughing",children:"Laughing"}),l.jsx("option",{value:"custom",children:"Custom"})]})]}),l.jsx("div",{className:"filter-select-group",children:l.jsxs("select",{className:"select-control filter-select",value:D,onChange:_=>q(_.target.value),children:[l.jsx("option",{value:"all",children:"All Methods"}),l.jsx("option",{value:"elevenlabs_api",children:"ElevenLabs API"}),l.jsx("option",{value:"elevenlabs_web",children:"Normal Web Workflow"})]})}),l.jsxs("div",{className:"view-mode-toggle",children:[l.jsx("button",{className:`view-btn ${y==="cards"?"active":""}`,onClick:()=>V("cards"),children:"Cards"}),l.jsx("button",{className:`view-btn ${y==="table"?"active":""}`,onClick:()=>V("table"),children:"Table"})]})]}),l.jsx("div",{className:"filter-stats-bar",children:l.jsxs("span",{className:"stats-count",children:["Showing ",l.jsx("strong",{children:ie.length})," of ",l.jsx("strong",{children:c.length})," total samples"]})})]}),ie.length===0?l.jsxs("div",{className:"glass-card empty-dataset-state",children:[l.jsx(ns,{size:40,className:"text-dim"}),l.jsx("div",{className:"empty-title",children:"No Samples Found"}),l.jsx("p",{className:"empty-sub",children:c.length===0?"No audio samples have been generated yet. Use the API Generation or Normal Web Workflow tab to create your first Kurdish TTS sample!":"No samples matched your search or filter criteria."})]}):y==="cards"?l.jsx("div",{className:"samples-card-grid",children:ie.map(_=>l.jsxs("div",{className:"glass-card sample-item-card",children:[l.jsxs("div",{className:"sample-card-header",children:[l.jsxs("div",{className:"sample-id-badge-group",children:[l.jsx("span",{className:"sample-id-pill",children:_.id}),l.jsx("span",{className:`badge emotion-badge-${_.emotion}`,children:_.emotion.toUpperCase()}),l.jsx("span",{className:`badge ${_.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:_.method==="elevenlabs_api"?"API":"Web"})]}),l.jsxs("div",{className:"sample-card-actions",children:[l.jsxs("button",{className:"aux-btn",onClick:()=>le(_),title:"Inspect & Edit Metadata JSON",children:[l.jsx(ar,{size:13}),l.jsx("span",{children:"JSON"})]}),l.jsx("button",{className:"aux-btn btn-danger",onClick:()=>P(_.id),title:"Delete Sample",children:l.jsx(la,{size:13})})]})]}),l.jsx("div",{className:"sample-kurdish-box",children:l.jsx("div",{className:"kurdish-text sample-kurdish-text",dir:"rtl",children:_.text})}),l.jsxs("div",{className:"sample-details-row",children:[l.jsxs("div",{className:"detail-item",children:[l.jsx("span",{className:"detail-label",children:"Voice:"}),l.jsx("span",{className:"detail-val",children:_.voice_name||_.voice_id||"ElevenLabs Voice"})]}),l.jsxs("div",{className:"detail-item",children:[l.jsx("span",{className:"detail-label",children:"Model:"}),l.jsx("span",{className:"detail-val",children:_.model_id||"Multilingual"})]})]}),l.jsx("div",{className:"sample-audio-wrap",children:l.jsx(Kr,{src:_.audioUrl||`/api/dataset/${_.id}/audio`,sampleId:_.id,showDownload:!0})}),l.jsx("div",{className:"sample-rating-wrap",children:l.jsx(Hr,{ratings:_.ratings,onSaveRatings:pe=>se(_.id,pe),compact:!0})})]},_.id))}):l.jsx("div",{className:"glass-card table-view-card",children:l.jsx("div",{className:"dataset-table-container",children:l.jsxs("table",{className:"dataset-table",children:[l.jsx("thead",{children:l.jsxs("tr",{children:[l.jsx("th",{children:"ID"}),l.jsx("th",{children:"Kurdish Transcript (RTL)"}),l.jsx("th",{children:"Emotion"}),l.jsx("th",{children:"Method"}),l.jsx("th",{children:"Voice / Model"}),l.jsx("th",{children:"Audio Playback"}),l.jsx("th",{children:"Rating"}),l.jsx("th",{children:"Date"}),l.jsx("th",{children:"Actions"})]})}),l.jsx("tbody",{children:ie.map(_=>l.jsxs("tr",{children:[l.jsx("td",{children:l.jsx("span",{className:"sample-id-pill",children:_.id})}),l.jsx("td",{className:"kurdish-table-cell",dir:"rtl",children:_.text}),l.jsx("td",{children:l.jsx("span",{className:`badge emotion-badge-${_.emotion}`,children:_.emotion})}),l.jsx("td",{children:l.jsx("span",{className:`badge ${_.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:_.method==="elevenlabs_api"?"API":"Web"})}),l.jsxs("td",{className:"voice-cell",children:[l.jsx("div",{className:"voice-name",children:_.voice_name||"ElevenLabs"}),l.jsx("div",{className:"model-name",children:_.model_id||"v2"})]}),l.jsx("td",{style:{minWidth:260},children:l.jsx(Kr,{src:_.audioUrl||`/api/dataset/${_.id}/audio`,sampleId:_.id,showDownload:!1})}),l.jsx("td",{children:l.jsx(Hr,{ratings:_.ratings,onSaveRatings:pe=>se(_.id,pe),compact:!0})}),l.jsx("td",{className:"date-cell",children:new Date(_.created_at).toLocaleDateString()}),l.jsx("td",{children:l.jsxs("div",{className:"table-actions",children:[l.jsx("button",{className:"aux-btn",onClick:()=>le(_),title:"Inspect Metadata",children:l.jsx(ar,{size:13})}),l.jsx("a",{href:`/api/dataset/${_.id}/download/wav`,download:`${_.id}.wav`,className:"aux-btn",title:"Download WAV",children:l.jsx(aa,{size:13})}),l.jsx("button",{className:"aux-btn btn-danger",onClick:()=>P(_.id),title:"Delete",children:l.jsx(la,{size:13})})]})})]},_.id))})]})})}),F&&l.jsx(is,{sample:F,onClose:()=>le(null),onSampleUpdated:_=>{le(_),w(_)}}),l.jsx(Yf,{isOpen:ye,onClose:()=>X(!1)}),l.jsx("style",{children:`
        .dataset-page-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dataset-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-grid {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }

        .search-input {
          padding-left: 36px;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-select {
          min-width: 150px;
        }

        .view-mode-toggle {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 2px;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
        }

        .view-btn.active {
          background: #0284C7;
          color: #fff;
        }

        .filter-stats-bar {
          font-size: 0.78rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .samples-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }

        .sample-item-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sample-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sample-id-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sample-id-pill {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .sample-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sample-kurdish-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          min-height: 70px;
          display: flex;
          align-items: center;
        }

        .sample-kurdish-text {
          font-size: 1.15rem;
          color: #FFFFFF;
          line-height: 1.7;
          width: 100%;
        }

        .sample-details-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: var(--text-dim);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-val {
          color: var(--text-main);
          font-weight: 500;
        }

        .empty-dataset-state {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .dataset-table-container {
          overflow-x: auto;
        }

        .dataset-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .dataset-table th {
          padding: 12px 14px;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border-medium);
          background: rgba(15, 23, 42, 0.6);
        }

        .dataset-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .dataset-table tr:hover td {
          background: rgba(56, 189, 248, 0.05);
        }

        .kurdish-table-cell {
          font-family: var(--font-kurdish);
          font-size: 1.1rem;
          max-width: 280px;
          line-height: 1.6;
        }

        .voice-name {
          font-weight: 600;
        }

        .model-name {
          font-size: 0.72rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }

        .date-cell {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `})]})},Xf=({samples:c,onSampleUpdated:w,addToast:m})=>{const[b,M]=z.useState(""),[A,O]=z.useState(""),[H,D]=z.useState(null),q=c.reduce((y,V)=>{const ie=V.text.trim();return y[ie]||(y[ie]=[]),y[ie].push(V),y},{}),Q=Object.entries(q).filter(([y,V])=>V.length>=2),j=c.find(y=>y.id===b)||(c.length>0?c[0]:null),F=c.find(y=>y.id===A)||(c.length>1?c[1]:null),le=y=>{const V=y.find(P=>P.method==="elevenlabs_api")||y[0],ie=y.find(P=>P.method==="elevenlabs_web")||y[1]||y[0];M(V.id),O(ie.id)},ye=async y=>{if(j)try{const V=await Wr(j.id,{ratings:y});w(V),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample A (${j.id})`})}catch(V){m({type:"error",title:"Save Failed",message:V.message})}},X=async y=>{if(F)try{const V=await Wr(F.id,{ratings:y});w(V),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample B (${F.id})`})}catch(V){m({type:"error",title:"Save Failed",message:V.message})}};return c.length<2?l.jsxs("div",{className:"compare-page-root",children:[l.jsxs("div",{className:"page-header",children:[l.jsxs("h1",{className:"page-title",children:[l.jsx(ta,{size:24,className:"text-cyan inline-icon"}),l.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),l.jsx("p",{className:"page-description",children:"Side-by-side A/B evaluation of Kurdish speech naturalness, emotional inflection, and pronunciation."})]}),l.jsxs("div",{className:"glass-card empty-compare-card",children:[l.jsx(ta,{size:48,className:"text-dim"}),l.jsx("div",{className:"empty-title",children:"Need at least 2 Samples to Compare"}),l.jsxs("p",{className:"empty-sub",children:["Generate speech using both the ",l.jsx("strong",{children:"ElevenLabs API"})," and ",l.jsx("strong",{children:"Normal Web Workflow"})," tabs to compare them side-by-side!"]})]})]}):l.jsxs("div",{className:"compare-page-root",children:[l.jsx("div",{className:"page-header",children:l.jsxs("div",{children:[l.jsxs("h1",{className:"page-title",children:[l.jsx(ta,{size:24,className:"text-cyan inline-icon"}),l.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),l.jsx("p",{className:"page-description",children:"Side-by-side A/B benchmark of Kurdish speech quality, Kurdish vowel pronunciation, and emotional accuracy."})]})}),Q.length>0&&l.jsxs("div",{className:"glass-card matching-pairs-card",children:[l.jsxs("div",{className:"pairs-title",children:[l.jsx(Fn,{size:15,className:"text-amber"}),l.jsxs("span",{children:["Found ",Q.length," Matching Kurdish Text Group",Q.length>1?"s":"",":"]})]}),l.jsx("div",{className:"pairs-list",children:Q.map(([y,V],ie)=>l.jsxs("button",{className:"pair-select-btn",onClick:()=>le(V),title:y,children:[l.jsxs("span",{className:"pair-count-badge",children:[V.length," versions"]}),l.jsx("span",{className:"kurdish-text pair-text",dir:"rtl",children:y})]},ie))})]}),l.jsxs("div",{className:"glass-card selector-bar",children:[l.jsxs("div",{className:"selector-column",children:[l.jsx("label",{className:"form-label",children:"Sample A (Left)"}),l.jsx("select",{className:"select-control",value:(j==null?void 0:j.id)||"",onChange:y=>M(y.target.value),children:c.map(y=>l.jsxs("option",{value:y.id,children:[y.id," • [",y.method==="elevenlabs_api"?"API":"Web","] ",y.emotion," — ",y.text.slice(0,30),"..."]},y.id))})]}),l.jsx("div",{className:"compare-icon-wrap",children:l.jsx(Np,{size:20,className:"text-cyan"})}),l.jsxs("div",{className:"selector-column",children:[l.jsx("label",{className:"form-label",children:"Sample B (Right)"}),l.jsx("select",{className:"select-control",value:(F==null?void 0:F.id)||"",onChange:y=>O(y.target.value),children:c.map(y=>l.jsxs("option",{value:y.id,children:[y.id," • [",y.method==="elevenlabs_api"?"API":"Web","] ",y.emotion," — ",y.text.slice(0,30),"..."]},y.id))})]})]}),l.jsxs("div",{className:"grid-2 compare-grid",children:[j&&l.jsxs("div",{className:"glass-card compare-card card-a",children:[l.jsxs("div",{className:"compare-card-header",children:[l.jsxs("div",{className:"compare-card-title",children:[l.jsx("span",{className:"side-badge badge-a",children:"Sample A"}),l.jsx("span",{className:"sample-id-pill",children:j.id}),l.jsx("span",{className:`badge ${j.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:j.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),l.jsxs("button",{className:"aux-btn",onClick:()=>D(j),children:[l.jsx(ar,{size:13}),l.jsx("span",{children:"JSON"})]})]}),l.jsxs("div",{className:"output-kurdish-box",children:[l.jsxs("div",{className:"output-kurdish-label",children:[l.jsx("span",{children:"Preserved Kurdish Transcript"}),l.jsx("span",{className:`badge emotion-badge-${j.emotion}`,children:j.emotion})]}),l.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:j.text})]}),l.jsxs("div",{className:"compare-meta-table",children:[l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Voice:"}),l.jsx("span",{className:"meta-v",children:j.voice_name||j.voice_id||"ElevenLabs Voice"})]}),l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Model:"}),l.jsx("span",{className:"meta-v",children:j.model_id||"Multilingual"})]}),l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),l.jsx("span",{className:"meta-v",children:j.emotion_tag||"None"})]})]}),l.jsx(Kr,{src:j.audioUrl||`/api/dataset/${j.id}/audio`,sampleId:j.id}),l.jsx(Hr,{ratings:j.ratings,onSaveRatings:ye})]}),F&&l.jsxs("div",{className:"glass-card compare-card card-b",children:[l.jsxs("div",{className:"compare-card-header",children:[l.jsxs("div",{className:"compare-card-title",children:[l.jsx("span",{className:"side-badge badge-b",children:"Sample B"}),l.jsx("span",{className:"sample-id-pill",children:F.id}),l.jsx("span",{className:`badge ${F.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:F.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),l.jsxs("button",{className:"aux-btn",onClick:()=>D(F),children:[l.jsx(ar,{size:13}),l.jsx("span",{children:"JSON"})]})]}),l.jsxs("div",{className:"output-kurdish-box",children:[l.jsxs("div",{className:"output-kurdish-label",children:[l.jsx("span",{children:"Preserved Kurdish Transcript"}),l.jsx("span",{className:`badge emotion-badge-${F.emotion}`,children:F.emotion})]}),l.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:F.text})]}),l.jsxs("div",{className:"compare-meta-table",children:[l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Voice:"}),l.jsx("span",{className:"meta-v",children:F.voice_name||F.voice_id||"ElevenLabs Voice"})]}),l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Model:"}),l.jsx("span",{className:"meta-v",children:F.model_id||"Multilingual"})]}),l.jsxs("div",{className:"meta-row",children:[l.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),l.jsx("span",{className:"meta-v",children:F.emotion_tag||"None"})]})]}),l.jsx(Kr,{src:F.audioUrl||`/api/dataset/${F.id}/audio`,sampleId:F.id}),l.jsx(Hr,{ratings:F.ratings,onSaveRatings:X})]})]}),H&&l.jsx(is,{sample:H,onClose:()=>D(null),onSampleUpdated:y=>{D(y),w(y)}}),l.jsx("style",{children:`
        .compare-page-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .matching-pairs-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 18px;
        }

        .pairs-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .pairs-list {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .pair-select-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .pair-select-btn:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38BDF8;
        }

        .pair-count-badge {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }

        .pair-text {
          font-size: 0.95rem;
          color: var(--text-main);
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 20px;
        }

        .selector-column {
          flex: 1;
        }

        .compare-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          margin-top: 18px;
        }

        .compare-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-a {
          border-top: 3px solid #38BDF8;
        }

        .card-b {
          border-top: 3px solid #10B981;
        }

        .compare-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .compare-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .side-badge {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .badge-a {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
        }

        .badge-b {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
        }

        .compare-meta-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(15, 23, 42, 0.6);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
        }

        .meta-k {
          color: var(--text-dim);
        }

        .meta-v {
          font-weight: 600;
          color: var(--text-main);
          font-family: var(--font-mono);
        }

        .empty-compare-card {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      `})]})},Zf=()=>{const[c,w]=z.useState("api"),[m,b]=z.useState(null),[M,A]=z.useState([]),[O,H]=z.useState(!1),[D,q]=z.useState([]),Q=y=>{const V="toast_"+Math.random().toString(36).substring(2,9);q(ie=>[...ie,{...y,id:V}])},j=y=>{q(V=>V.filter(ie=>ie.id!==y))};z.useEffect(()=>{F()},[]);const F=async()=>{try{const[y,V]=await Promise.all([dc().catch(()=>({status:"ok",isKeyConfigured:!1,keyValid:!1})),Rf().catch(()=>[])]);b(y),A(V)}catch(y){console.warn("Initial data load warning:",y)}},le=y=>{A(V=>{const ie=V.findIndex(P=>P.id===y.id);if(ie!==-1){const P=[...V];return P[ie]=y,P}return[y,...V]})},ye=y=>{A(V=>V.map(ie=>ie.id===y.id?y:ie))},X=y=>{A(V=>V.filter(ie=>ie.id!==y))};return l.jsxs("div",{className:"app-root",children:[l.jsx(_f,{activeTab:c,onSelectTab:w,onOpenSettings:()=>H(!0),config:m,datasetCount:M.length}),l.jsxs("main",{className:"app-container",children:[c==="api"&&l.jsx(Gf,{config:m,onOpenSettings:()=>H(!0),onSampleCreated:le,addToast:Q,onConfigUpdated:b}),c==="dataset"&&l.jsx(qf,{samples:M,onSampleUpdated:ye,onSampleDeleted:X,addToast:Q}),c==="compare"&&l.jsx(Xf,{samples:M,onSampleUpdated:ye,addToast:Q})]}),l.jsx("footer",{className:"app-footer",children:l.jsxs("div",{className:"footer-content",children:[l.jsxs("div",{className:"footer-brand",children:[l.jsx("span",{className:"footer-flag",children:"☀️"}),l.jsx("span",{children:"Kurdish TTS Dataset Studio"})]}),l.jsx("div",{className:"footer-info",children:"Strict UTF-8 Kurdish Sorani Unicode Preservation • Multi-Key ElevenLabs Engine"})]})}),O&&l.jsx($f,{config:m,onClose:()=>H(!1),onConfigUpdated:y=>b(y)}),l.jsx(zf,{toasts:D,onDismiss:j})]})};xp.createRoot(document.getElementById("root")).render(l.jsx(pp.StrictMode,{children:l.jsx(Zf,{})}));
