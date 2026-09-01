(function(){const k=document.createElement("link").relList;if(k&&k.supports&&k.supports("modulepreload"))return;for(const I of document.querySelectorAll('link[rel="modulepreload"]'))b(I);new MutationObserver(I=>{for(const R of I)if(R.type==="childList")for(const $ of R.addedNodes)$.tagName==="LINK"&&$.rel==="modulepreload"&&b($)}).observe(document,{childList:!0,subtree:!0});function m(I){const R={};return I.integrity&&(R.integrity=I.integrity),I.referrerPolicy&&(R.referrerPolicy=I.referrerPolicy),I.crossOrigin==="use-credentials"?R.credentials="include":I.crossOrigin==="anonymous"?R.credentials="omit":R.credentials="same-origin",R}function b(I){if(I.ep)return;I.ep=!0;const R=m(I);fetch(I.href,R)}})();function rc(d){return d&&d.__esModule&&Object.prototype.hasOwnProperty.call(d,"default")?d.default:d}var Qi={exports:{}},Br={},Gi={exports:{}},pe={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Hu;function sp(){if(Hu)return pe;Hu=1;var d=Symbol.for("react.element"),k=Symbol.for("react.portal"),m=Symbol.for("react.fragment"),b=Symbol.for("react.strict_mode"),I=Symbol.for("react.profiler"),R=Symbol.for("react.provider"),$=Symbol.for("react.context"),Q=Symbol.for("react.forward_ref"),D=Symbol.for("react.suspense"),q=Symbol.for("react.memo"),G=Symbol.for("react.lazy"),C=Symbol.iterator;function L(o){return o===null||typeof o!="object"?null:(o=C&&o[C]||o["@@iterator"],typeof o=="function"?o:null)}var re={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},he=Object.assign,Y={};function w(o,g,E){this.props=o,this.context=g,this.refs=Y,this.updater=E||re}w.prototype.isReactComponent={},w.prototype.setState=function(o,g){if(typeof o!="object"&&typeof o!="function"&&o!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,o,g,"setState")},w.prototype.forceUpdate=function(o){this.updater.enqueueForceUpdate(this,o,"forceUpdate")};function B(){}B.prototype=w.prototype;function ie(o,g,E){this.props=o,this.context=g,this.refs=Y,this.updater=E||re}var y=ie.prototype=new B;y.constructor=ie,he(y,w.prototype),y.isPureReactComponent=!0;var Z=Array.isArray,we=Object.prototype.hasOwnProperty,je={current:null},xe={key:!0,ref:!0,__self:!0,__source:!0};function Ce(o,g,E){var z,T={},A=null,M=null;if(g!=null)for(z in g.ref!==void 0&&(M=g.ref),g.key!==void 0&&(A=""+g.key),g)we.call(g,z)&&!xe.hasOwnProperty(z)&&(T[z]=g[z]);var U=arguments.length-2;if(U===1)T.children=E;else if(1<U){for(var X=Array(U),ce=0;ce<U;ce++)X[ce]=arguments[ce+2];T.children=X}if(o&&o.defaultProps)for(z in U=o.defaultProps,U)T[z]===void 0&&(T[z]=U[z]);return{$$typeof:d,type:o,key:A,ref:M,props:T,_owner:je.current}}function le(o,g){return{$$typeof:d,type:o.type,key:g,ref:o.ref,props:o.props,_owner:o._owner}}function me(o){return typeof o=="object"&&o!==null&&o.$$typeof===d}function Pe(o){var g={"=":"=0",":":"=2"};return"$"+o.replace(/[=:]/g,function(E){return g[E]})}var se=/\/+/g;function ge(o,g){return typeof o=="object"&&o!==null&&o.key!=null?Pe(""+o.key):g.toString(36)}function Fe(o,g,E,z,T){var A=typeof o;(A==="undefined"||A==="boolean")&&(o=null);var M=!1;if(o===null)M=!0;else switch(A){case"string":case"number":M=!0;break;case"object":switch(o.$$typeof){case d:case k:M=!0}}if(M)return M=o,T=T(M),o=z===""?"."+ge(M,0):z,Z(T)?(E="",o!=null&&(E=o.replace(se,"$&/")+"/"),Fe(T,g,E,"",function(ce){return ce})):T!=null&&(me(T)&&(T=le(T,E+(!T.key||M&&M.key===T.key?"":(""+T.key).replace(se,"$&/")+"/")+o)),g.push(T)),1;if(M=0,z=z===""?".":z+":",Z(o))for(var U=0;U<o.length;U++){A=o[U];var X=z+ge(A,U);M+=Fe(A,g,E,X,T)}else if(X=L(o),typeof X=="function")for(o=X.call(o),U=0;!(A=o.next()).done;)A=A.value,X=z+ge(A,U++),M+=Fe(A,g,E,X,T);else if(A==="object")throw g=String(o),Error("Objects are not valid as a React child (found: "+(g==="[object Object]"?"object with keys {"+Object.keys(o).join(", ")+"}":g)+"). If you meant to render a collection of children, use an array instead.");return M}function De(o,g,E){if(o==null)return o;var z=[],T=0;return Fe(o,z,"","",function(A){return g.call(E,A,T++)}),z}function Oe(o){if(o._status===-1){var g=o._result;g=g(),g.then(function(E){(o._status===0||o._status===-1)&&(o._status=1,o._result=E)},function(E){(o._status===0||o._status===-1)&&(o._status=2,o._result=E)}),o._status===-1&&(o._status=0,o._result=g)}if(o._status===1)return o._result.default;throw o._result}var Se={current:null},F={transition:null},J={ReactCurrentDispatcher:Se,ReactCurrentBatchConfig:F,ReactCurrentOwner:je};function p(){throw Error("act(...) is not supported in production builds of React.")}return pe.Children={map:De,forEach:function(o,g,E){De(o,function(){g.apply(this,arguments)},E)},count:function(o){var g=0;return De(o,function(){g++}),g},toArray:function(o){return De(o,function(g){return g})||[]},only:function(o){if(!me(o))throw Error("React.Children.only expected to receive a single React element child.");return o}},pe.Component=w,pe.Fragment=m,pe.Profiler=I,pe.PureComponent=ie,pe.StrictMode=b,pe.Suspense=D,pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,pe.act=p,pe.cloneElement=function(o,g,E){if(o==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+o+".");var z=he({},o.props),T=o.key,A=o.ref,M=o._owner;if(g!=null){if(g.ref!==void 0&&(A=g.ref,M=je.current),g.key!==void 0&&(T=""+g.key),o.type&&o.type.defaultProps)var U=o.type.defaultProps;for(X in g)we.call(g,X)&&!xe.hasOwnProperty(X)&&(z[X]=g[X]===void 0&&U!==void 0?U[X]:g[X])}var X=arguments.length-2;if(X===1)z.children=E;else if(1<X){U=Array(X);for(var ce=0;ce<X;ce++)U[ce]=arguments[ce+2];z.children=U}return{$$typeof:d,type:o.type,key:T,ref:A,props:z,_owner:M}},pe.createContext=function(o){return o={$$typeof:$,_currentValue:o,_currentValue2:o,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},o.Provider={$$typeof:R,_context:o},o.Consumer=o},pe.createElement=Ce,pe.createFactory=function(o){var g=Ce.bind(null,o);return g.type=o,g},pe.createRef=function(){return{current:null}},pe.forwardRef=function(o){return{$$typeof:Q,render:o}},pe.isValidElement=me,pe.lazy=function(o){return{$$typeof:G,_payload:{_status:-1,_result:o},_init:Oe}},pe.memo=function(o,g){return{$$typeof:q,type:o,compare:g===void 0?null:g}},pe.startTransition=function(o){var g=F.transition;F.transition={};try{o()}finally{F.transition=g}},pe.unstable_act=p,pe.useCallback=function(o,g){return Se.current.useCallback(o,g)},pe.useContext=function(o){return Se.current.useContext(o)},pe.useDebugValue=function(){},pe.useDeferredValue=function(o){return Se.current.useDeferredValue(o)},pe.useEffect=function(o,g){return Se.current.useEffect(o,g)},pe.useId=function(){return Se.current.useId()},pe.useImperativeHandle=function(o,g,E){return Se.current.useImperativeHandle(o,g,E)},pe.useInsertionEffect=function(o,g){return Se.current.useInsertionEffect(o,g)},pe.useLayoutEffect=function(o,g){return Se.current.useLayoutEffect(o,g)},pe.useMemo=function(o,g){return Se.current.useMemo(o,g)},pe.useReducer=function(o,g,E){return Se.current.useReducer(o,g,E)},pe.useRef=function(o){return Se.current.useRef(o)},pe.useState=function(o){return Se.current.useState(o)},pe.useSyncExternalStore=function(o,g,E){return Se.current.useSyncExternalStore(o,g,E)},pe.useTransition=function(){return Se.current.useTransition()},pe.version="18.3.1",pe}var Qu;function ts(){return Qu||(Qu=1,Gi.exports=sp()),Gi.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Gu;function op(){if(Gu)return Br;Gu=1;var d=ts(),k=Symbol.for("react.element"),m=Symbol.for("react.fragment"),b=Object.prototype.hasOwnProperty,I=d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,R={key:!0,ref:!0,__self:!0,__source:!0};function $(Q,D,q){var G,C={},L=null,re=null;q!==void 0&&(L=""+q),D.key!==void 0&&(L=""+D.key),D.ref!==void 0&&(re=D.ref);for(G in D)b.call(D,G)&&!R.hasOwnProperty(G)&&(C[G]=D[G]);if(Q&&Q.defaultProps)for(G in D=Q.defaultProps,D)C[G]===void 0&&(C[G]=D[G]);return{$$typeof:k,type:Q,key:L,ref:re,props:C,_owner:I.current}}return Br.Fragment=m,Br.jsx=$,Br.jsxs=$,Br}var qu;function up(){return qu||(qu=1,Qi.exports=op()),Qi.exports}var a=up(),P=ts();const cp=rc(P);var ea={},qi={exports:{}},pt={},Yi={exports:{}},Xi={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Yu;function dp(){return Yu||(Yu=1,(function(d){function k(F,J){var p=F.length;F.push(J);e:for(;0<p;){var o=p-1>>>1,g=F[o];if(0<I(g,J))F[o]=J,F[p]=g,p=o;else break e}}function m(F){return F.length===0?null:F[0]}function b(F){if(F.length===0)return null;var J=F[0],p=F.pop();if(p!==J){F[0]=p;e:for(var o=0,g=F.length,E=g>>>1;o<E;){var z=2*(o+1)-1,T=F[z],A=z+1,M=F[A];if(0>I(T,p))A<g&&0>I(M,T)?(F[o]=M,F[A]=p,o=A):(F[o]=T,F[z]=p,o=z);else if(A<g&&0>I(M,p))F[o]=M,F[A]=p,o=A;else break e}}return J}function I(F,J){var p=F.sortIndex-J.sortIndex;return p!==0?p:F.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var R=performance;d.unstable_now=function(){return R.now()}}else{var $=Date,Q=$.now();d.unstable_now=function(){return $.now()-Q}}var D=[],q=[],G=1,C=null,L=3,re=!1,he=!1,Y=!1,w=typeof setTimeout=="function"?setTimeout:null,B=typeof clearTimeout=="function"?clearTimeout:null,ie=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(F){for(var J=m(q);J!==null;){if(J.callback===null)b(q);else if(J.startTime<=F)b(q),J.sortIndex=J.expirationTime,k(D,J);else break;J=m(q)}}function Z(F){if(Y=!1,y(F),!he)if(m(D)!==null)he=!0,Oe(we);else{var J=m(q);J!==null&&Se(Z,J.startTime-F)}}function we(F,J){he=!1,Y&&(Y=!1,B(Ce),Ce=-1),re=!0;var p=L;try{for(y(J),C=m(D);C!==null&&(!(C.expirationTime>J)||F&&!Pe());){var o=C.callback;if(typeof o=="function"){C.callback=null,L=C.priorityLevel;var g=o(C.expirationTime<=J);J=d.unstable_now(),typeof g=="function"?C.callback=g:C===m(D)&&b(D),y(J)}else b(D);C=m(D)}if(C!==null)var E=!0;else{var z=m(q);z!==null&&Se(Z,z.startTime-J),E=!1}return E}finally{C=null,L=p,re=!1}}var je=!1,xe=null,Ce=-1,le=5,me=-1;function Pe(){return!(d.unstable_now()-me<le)}function se(){if(xe!==null){var F=d.unstable_now();me=F;var J=!0;try{J=xe(!0,F)}finally{J?ge():(je=!1,xe=null)}}else je=!1}var ge;if(typeof ie=="function")ge=function(){ie(se)};else if(typeof MessageChannel<"u"){var Fe=new MessageChannel,De=Fe.port2;Fe.port1.onmessage=se,ge=function(){De.postMessage(null)}}else ge=function(){w(se,0)};function Oe(F){xe=F,je||(je=!0,ge())}function Se(F,J){Ce=w(function(){F(d.unstable_now())},J)}d.unstable_IdlePriority=5,d.unstable_ImmediatePriority=1,d.unstable_LowPriority=4,d.unstable_NormalPriority=3,d.unstable_Profiling=null,d.unstable_UserBlockingPriority=2,d.unstable_cancelCallback=function(F){F.callback=null},d.unstable_continueExecution=function(){he||re||(he=!0,Oe(we))},d.unstable_forceFrameRate=function(F){0>F||125<F?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):le=0<F?Math.floor(1e3/F):5},d.unstable_getCurrentPriorityLevel=function(){return L},d.unstable_getFirstCallbackNode=function(){return m(D)},d.unstable_next=function(F){switch(L){case 1:case 2:case 3:var J=3;break;default:J=L}var p=L;L=J;try{return F()}finally{L=p}},d.unstable_pauseExecution=function(){},d.unstable_requestPaint=function(){},d.unstable_runWithPriority=function(F,J){switch(F){case 1:case 2:case 3:case 4:case 5:break;default:F=3}var p=L;L=F;try{return J()}finally{L=p}},d.unstable_scheduleCallback=function(F,J,p){var o=d.unstable_now();switch(typeof p=="object"&&p!==null?(p=p.delay,p=typeof p=="number"&&0<p?o+p:o):p=o,F){case 1:var g=-1;break;case 2:g=250;break;case 5:g=1073741823;break;case 4:g=1e4;break;default:g=5e3}return g=p+g,F={id:G++,callback:J,priorityLevel:F,startTime:p,expirationTime:g,sortIndex:-1},p>o?(F.sortIndex=p,k(q,F),m(D)===null&&F===m(q)&&(Y?(B(Ce),Ce=-1):Y=!0,Se(Z,p-o))):(F.sortIndex=g,k(D,F),he||re||(he=!0,Oe(we))),F},d.unstable_shouldYield=Pe,d.unstable_wrapCallback=function(F){var J=L;return function(){var p=L;L=J;try{return F.apply(this,arguments)}finally{L=p}}}})(Xi)),Xi}var Xu;function pp(){return Xu||(Xu=1,Yi.exports=dp()),Yi.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ju;function fp(){if(Ju)return pt;Ju=1;var d=ts(),k=pp();function m(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var b=new Set,I={};function R(e,t){$(e,t),$(e+"Capture",t)}function $(e,t){for(I[e]=t,e=0;e<t.length;e++)b.add(t[e])}var Q=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),D=Object.prototype.hasOwnProperty,q=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,G={},C={};function L(e){return D.call(C,e)?!0:D.call(G,e)?!1:q.test(e)?C[e]=!0:(G[e]=!0,!1)}function re(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function he(e,t,n,r){if(t===null||typeof t>"u"||re(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function Y(e,t,n,r,l,i,s){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=l,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=s}var w={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){w[e]=new Y(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];w[t]=new Y(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){w[e]=new Y(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){w[e]=new Y(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){w[e]=new Y(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){w[e]=new Y(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){w[e]=new Y(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){w[e]=new Y(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){w[e]=new Y(e,5,!1,e.toLowerCase(),null,!1,!1)});var B=/[\-:]([a-z])/g;function ie(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(B,ie);w[t]=new Y(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(B,ie);w[t]=new Y(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(B,ie);w[t]=new Y(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){w[e]=new Y(e,1,!1,e.toLowerCase(),null,!1,!1)}),w.xlinkHref=new Y("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){w[e]=new Y(e,1,!1,e.toLowerCase(),null,!0,!0)});function y(e,t,n,r){var l=w.hasOwnProperty(t)?w[t]:null;(l!==null?l.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(he(t,n,l,r)&&(n=null),r||l===null?L(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):l.mustUseProperty?e[l.propertyName]=n===null?l.type===3?!1:"":n:(t=l.attributeName,r=l.attributeNamespace,n===null?e.removeAttribute(t):(l=l.type,n=l===3||l===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Z=d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,we=Symbol.for("react.element"),je=Symbol.for("react.portal"),xe=Symbol.for("react.fragment"),Ce=Symbol.for("react.strict_mode"),le=Symbol.for("react.profiler"),me=Symbol.for("react.provider"),Pe=Symbol.for("react.context"),se=Symbol.for("react.forward_ref"),ge=Symbol.for("react.suspense"),Fe=Symbol.for("react.suspense_list"),De=Symbol.for("react.memo"),Oe=Symbol.for("react.lazy"),Se=Symbol.for("react.offscreen"),F=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=F&&e[F]||e["@@iterator"],typeof e=="function"?e:null)}var p=Object.assign,o;function g(e){if(o===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);o=t&&t[1]||""}return`
`+o+e}var E=!1;function z(e,t){if(!e||E)return"";E=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(x){var r=x}Reflect.construct(e,[],t)}else{try{t.call()}catch(x){r=x}e.call(t.prototype)}else{try{throw Error()}catch(x){r=x}e()}}catch(x){if(x&&r&&typeof x.stack=="string"){for(var l=x.stack.split(`
`),i=r.stack.split(`
`),s=l.length-1,u=i.length-1;1<=s&&0<=u&&l[s]!==i[u];)u--;for(;1<=s&&0<=u;s--,u--)if(l[s]!==i[u]){if(s!==1||u!==1)do if(s--,u--,0>u||l[s]!==i[u]){var c=`
`+l[s].replace(" at new "," at ");return e.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",e.displayName)),c}while(1<=s&&0<=u);break}}}finally{E=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?g(e):""}function T(e){switch(e.tag){case 5:return g(e.type);case 16:return g("Lazy");case 13:return g("Suspense");case 19:return g("SuspenseList");case 0:case 2:case 15:return e=z(e.type,!1),e;case 11:return e=z(e.type.render,!1),e;case 1:return e=z(e.type,!0),e;default:return""}}function A(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case xe:return"Fragment";case je:return"Portal";case le:return"Profiler";case Ce:return"StrictMode";case ge:return"Suspense";case Fe:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Pe:return(e.displayName||"Context")+".Consumer";case me:return(e._context.displayName||"Context")+".Provider";case se:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case De:return t=e.displayName||null,t!==null?t:A(e.type)||"Memo";case Oe:t=e._payload,e=e._init;try{return A(e(t))}catch{}}return null}function M(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return A(t);case 8:return t===Ce?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function U(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function X(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ce(e){var t=X(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var l=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(s){r=""+s,i.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(s){r=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function de(e){e._valueTracker||(e._valueTracker=ce(e))}function Ne(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=X(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function oe(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function ue(e,t){var n=t.checked;return p({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Ue(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=U(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Xe(e,t){t=t.checked,t!=null&&y(e,"checked",t,!1)}function We(e,t){Xe(e,t);var n=U(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?at(e,t.type,n):t.hasOwnProperty("defaultValue")&&at(e,t.type,U(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Je(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function at(e,t,n){(t!=="number"||oe(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var $e=Array.isArray;function vt(e,t,n,r){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&r&&(e[n].defaultSelected=!0)}else{for(n=""+U(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,r&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function mn(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(m(91));return p({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ht(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(m(92));if($e(n)){if(1<n.length)throw Error(m(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:U(n)}}function hn(e,t){var n=U(t.value),r=U(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Fn(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function gn(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function vn(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?gn(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var ee,ze=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,l){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,l)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(ee=ee||document.createElement("div"),ee.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=ee.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function xt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var it={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Qt=["Webkit","ms","Moz","O"];Object.keys(it).forEach(function(e){Qt.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),it[t]=it[e]})});function xn(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||it.hasOwnProperty(e)&&it[e]?(""+t).trim():t+"px"}function ss(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,l=xn(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,l):e[n]=l}}var pc=p({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function aa(e,t){if(t){if(pc[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(m(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(m(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(m(61))}if(t.style!=null&&typeof t.style!="object")throw Error(m(62))}}function ia(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var sa=null;function oa(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ua=null,Tn=null,Ln=null;function os(e){if(e=Cr(e)){if(typeof ua!="function")throw Error(m(280));var t=e.stateNode;t&&(t=hl(t),ua(e.stateNode,e.type,t))}}function us(e){Tn?Ln?Ln.push(e):Ln=[e]:Tn=e}function cs(){if(Tn){var e=Tn,t=Ln;if(Ln=Tn=null,os(e),t)for(e=0;e<t.length;e++)os(t[e])}}function ds(e,t){return e(t)}function ps(){}var ca=!1;function fs(e,t,n){if(ca)return e(t,n);ca=!0;try{return ds(e,t,n)}finally{ca=!1,(Tn!==null||Ln!==null)&&(ps(),cs())}}function ar(e,t){var n=e.stateNode;if(n===null)return null;var r=hl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(m(231,t,typeof n));return n}var da=!1;if(Q)try{var ir={};Object.defineProperty(ir,"passive",{get:function(){da=!0}}),window.addEventListener("test",ir,ir),window.removeEventListener("test",ir,ir)}catch{da=!1}function fc(e,t,n,r,l,i,s,u,c){var x=Array.prototype.slice.call(arguments,3);try{t.apply(n,x)}catch(N){this.onError(N)}}var sr=!1,Qr=null,Gr=!1,pa=null,mc={onError:function(e){sr=!0,Qr=e}};function hc(e,t,n,r,l,i,s,u,c){sr=!1,Qr=null,fc.apply(mc,arguments)}function gc(e,t,n,r,l,i,s,u,c){if(hc.apply(this,arguments),sr){if(sr){var x=Qr;sr=!1,Qr=null}else throw Error(m(198));Gr||(Gr=!0,pa=x)}}function yn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function ms(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function hs(e){if(yn(e)!==e)throw Error(m(188))}function vc(e){var t=e.alternate;if(!t){if(t=yn(e),t===null)throw Error(m(188));return t!==e?null:e}for(var n=e,r=t;;){var l=n.return;if(l===null)break;var i=l.alternate;if(i===null){if(r=l.return,r!==null){n=r;continue}break}if(l.child===i.child){for(i=l.child;i;){if(i===n)return hs(l),e;if(i===r)return hs(l),t;i=i.sibling}throw Error(m(188))}if(n.return!==r.return)n=l,r=i;else{for(var s=!1,u=l.child;u;){if(u===n){s=!0,n=l,r=i;break}if(u===r){s=!0,r=l,n=i;break}u=u.sibling}if(!s){for(u=i.child;u;){if(u===n){s=!0,n=i,r=l;break}if(u===r){s=!0,r=i,n=l;break}u=u.sibling}if(!s)throw Error(m(189))}}if(n.alternate!==r)throw Error(m(190))}if(n.tag!==3)throw Error(m(188));return n.stateNode.current===n?e:t}function gs(e){return e=vc(e),e!==null?vs(e):null}function vs(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=vs(e);if(t!==null)return t;e=e.sibling}return null}var xs=k.unstable_scheduleCallback,ys=k.unstable_cancelCallback,xc=k.unstable_shouldYield,yc=k.unstable_requestPaint,Re=k.unstable_now,wc=k.unstable_getCurrentPriorityLevel,fa=k.unstable_ImmediatePriority,ws=k.unstable_UserBlockingPriority,qr=k.unstable_NormalPriority,kc=k.unstable_LowPriority,ks=k.unstable_IdlePriority,Yr=null,Tt=null;function jc(e){if(Tt&&typeof Tt.onCommitFiberRoot=="function")try{Tt.onCommitFiberRoot(Yr,e,void 0,(e.current.flags&128)===128)}catch{}}var bt=Math.clz32?Math.clz32:bc,Nc=Math.log,Sc=Math.LN2;function bc(e){return e>>>=0,e===0?32:31-(Nc(e)/Sc|0)|0}var Xr=64,Jr=4194304;function or(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Zr(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,l=e.suspendedLanes,i=e.pingedLanes,s=n&268435455;if(s!==0){var u=s&~l;u!==0?r=or(u):(i&=s,i!==0&&(r=or(i)))}else s=n&~l,s!==0?r=or(s):i!==0&&(r=or(i));if(r===0)return 0;if(t!==0&&t!==r&&(t&l)===0&&(l=r&-r,i=t&-t,l>=i||l===16&&(i&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-bt(t),l=1<<n,r|=e[n],t&=~l;return r}function Cc(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ec(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,l=e.expirationTimes,i=e.pendingLanes;0<i;){var s=31-bt(i),u=1<<s,c=l[s];c===-1?((u&n)===0||(u&r)!==0)&&(l[s]=Cc(u,t)):c<=t&&(e.expiredLanes|=u),i&=~u}}function ma(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function js(){var e=Xr;return Xr<<=1,(Xr&4194240)===0&&(Xr=64),e}function ha(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ur(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-bt(t),e[t]=n}function _c(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var l=31-bt(n),i=1<<l;t[l]=0,r[l]=-1,e[l]=-1,n&=~i}}function ga(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-bt(n),l=1<<r;l&t|e[r]&t&&(e[r]|=t),n&=~l}}var ke=0;function Ns(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Ss,va,bs,Cs,Es,xa=!1,el=[],Gt=null,qt=null,Yt=null,cr=new Map,dr=new Map,Xt=[],zc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function _s(e,t){switch(e){case"focusin":case"focusout":Gt=null;break;case"dragenter":case"dragleave":qt=null;break;case"mouseover":case"mouseout":Yt=null;break;case"pointerover":case"pointerout":cr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":dr.delete(t.pointerId)}}function pr(e,t,n,r,l,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[l]},t!==null&&(t=Cr(t),t!==null&&va(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function Mc(e,t,n,r,l){switch(t){case"focusin":return Gt=pr(Gt,e,t,n,r,l),!0;case"dragenter":return qt=pr(qt,e,t,n,r,l),!0;case"mouseover":return Yt=pr(Yt,e,t,n,r,l),!0;case"pointerover":var i=l.pointerId;return cr.set(i,pr(cr.get(i)||null,e,t,n,r,l)),!0;case"gotpointercapture":return i=l.pointerId,dr.set(i,pr(dr.get(i)||null,e,t,n,r,l)),!0}return!1}function zs(e){var t=wn(e.target);if(t!==null){var n=yn(t);if(n!==null){if(t=n.tag,t===13){if(t=ms(n),t!==null){e.blockedOn=t,Es(e.priority,function(){bs(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function tl(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=wa(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);sa=r,n.target.dispatchEvent(r),sa=null}else return t=Cr(n),t!==null&&va(t),e.blockedOn=n,!1;t.shift()}return!0}function Ms(e,t,n){tl(e)&&n.delete(t)}function Pc(){xa=!1,Gt!==null&&tl(Gt)&&(Gt=null),qt!==null&&tl(qt)&&(qt=null),Yt!==null&&tl(Yt)&&(Yt=null),cr.forEach(Ms),dr.forEach(Ms)}function fr(e,t){e.blockedOn===t&&(e.blockedOn=null,xa||(xa=!0,k.unstable_scheduleCallback(k.unstable_NormalPriority,Pc)))}function mr(e){function t(l){return fr(l,e)}if(0<el.length){fr(el[0],e);for(var n=1;n<el.length;n++){var r=el[n];r.blockedOn===e&&(r.blockedOn=null)}}for(Gt!==null&&fr(Gt,e),qt!==null&&fr(qt,e),Yt!==null&&fr(Yt,e),cr.forEach(t),dr.forEach(t),n=0;n<Xt.length;n++)r=Xt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Xt.length&&(n=Xt[0],n.blockedOn===null);)zs(n),n.blockedOn===null&&Xt.shift()}var In=Z.ReactCurrentBatchConfig,nl=!0;function Fc(e,t,n,r){var l=ke,i=In.transition;In.transition=null;try{ke=1,ya(e,t,n,r)}finally{ke=l,In.transition=i}}function Tc(e,t,n,r){var l=ke,i=In.transition;In.transition=null;try{ke=4,ya(e,t,n,r)}finally{ke=l,In.transition=i}}function ya(e,t,n,r){if(nl){var l=wa(e,t,n,r);if(l===null)Aa(e,t,r,rl,n),_s(e,r);else if(Mc(l,e,t,n,r))r.stopPropagation();else if(_s(e,r),t&4&&-1<zc.indexOf(e)){for(;l!==null;){var i=Cr(l);if(i!==null&&Ss(i),i=wa(e,t,n,r),i===null&&Aa(e,t,r,rl,n),i===l)break;l=i}l!==null&&r.stopPropagation()}else Aa(e,t,r,null,n)}}var rl=null;function wa(e,t,n,r){if(rl=null,e=oa(r),e=wn(e),e!==null)if(t=yn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=ms(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return rl=e,null}function Ps(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(wc()){case fa:return 1;case ws:return 4;case qr:case kc:return 16;case ks:return 536870912;default:return 16}default:return 16}}var Jt=null,ka=null,ll=null;function Fs(){if(ll)return ll;var e,t=ka,n=t.length,r,l="value"in Jt?Jt.value:Jt.textContent,i=l.length;for(e=0;e<n&&t[e]===l[e];e++);var s=n-e;for(r=1;r<=s&&t[n-r]===l[i-r];r++);return ll=l.slice(e,1<r?1-r:void 0)}function al(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function il(){return!0}function Ts(){return!1}function ft(e){function t(n,r,l,i,s){this._reactName=n,this._targetInst=l,this.type=r,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(n=e[u],this[u]=n?n(i):i[u]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?il:Ts,this.isPropagationStopped=Ts,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=il)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=il)},persist:function(){},isPersistent:il}),t}var Rn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ja=ft(Rn),hr=p({},Rn,{view:0,detail:0}),Lc=ft(hr),Na,Sa,gr,sl=p({},hr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ca,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==gr&&(gr&&e.type==="mousemove"?(Na=e.screenX-gr.screenX,Sa=e.screenY-gr.screenY):Sa=Na=0,gr=e),Na)},movementY:function(e){return"movementY"in e?e.movementY:Sa}}),Ls=ft(sl),Ic=p({},sl,{dataTransfer:0}),Rc=ft(Ic),Ac=p({},hr,{relatedTarget:0}),ba=ft(Ac),Dc=p({},Rn,{animationName:0,elapsedTime:0,pseudoElement:0}),Oc=ft(Dc),$c=p({},Rn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Bc=ft($c),Uc=p({},Rn,{data:0}),Is=ft(Uc),Vc={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Kc={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Wc={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Hc(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Wc[e])?!!t[e]:!1}function Ca(){return Hc}var Qc=p({},hr,{key:function(e){if(e.key){var t=Vc[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=al(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Kc[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ca,charCode:function(e){return e.type==="keypress"?al(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?al(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Gc=ft(Qc),qc=p({},sl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Rs=ft(qc),Yc=p({},hr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ca}),Xc=ft(Yc),Jc=p({},Rn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Zc=ft(Jc),ed=p({},sl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),td=ft(ed),nd=[9,13,27,32],Ea=Q&&"CompositionEvent"in window,vr=null;Q&&"documentMode"in document&&(vr=document.documentMode);var rd=Q&&"TextEvent"in window&&!vr,As=Q&&(!Ea||vr&&8<vr&&11>=vr),Ds=" ",Os=!1;function $s(e,t){switch(e){case"keyup":return nd.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Bs(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var An=!1;function ld(e,t){switch(e){case"compositionend":return Bs(t);case"keypress":return t.which!==32?null:(Os=!0,Ds);case"textInput":return e=t.data,e===Ds&&Os?null:e;default:return null}}function ad(e,t){if(An)return e==="compositionend"||!Ea&&$s(e,t)?(e=Fs(),ll=ka=Jt=null,An=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return As&&t.locale!=="ko"?null:t.data;default:return null}}var id={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Us(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!id[e.type]:t==="textarea"}function Vs(e,t,n,r){us(r),t=pl(t,"onChange"),0<t.length&&(n=new ja("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var xr=null,yr=null;function sd(e){so(e,0)}function ol(e){var t=Un(e);if(Ne(t))return e}function od(e,t){if(e==="change")return t}var Ks=!1;if(Q){var _a;if(Q){var za="oninput"in document;if(!za){var Ws=document.createElement("div");Ws.setAttribute("oninput","return;"),za=typeof Ws.oninput=="function"}_a=za}else _a=!1;Ks=_a&&(!document.documentMode||9<document.documentMode)}function Hs(){xr&&(xr.detachEvent("onpropertychange",Qs),yr=xr=null)}function Qs(e){if(e.propertyName==="value"&&ol(yr)){var t=[];Vs(t,yr,e,oa(e)),fs(sd,t)}}function ud(e,t,n){e==="focusin"?(Hs(),xr=t,yr=n,xr.attachEvent("onpropertychange",Qs)):e==="focusout"&&Hs()}function cd(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ol(yr)}function dd(e,t){if(e==="click")return ol(t)}function pd(e,t){if(e==="input"||e==="change")return ol(t)}function fd(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ct=typeof Object.is=="function"?Object.is:fd;function wr(e,t){if(Ct(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var l=n[r];if(!D.call(t,l)||!Ct(e[l],t[l]))return!1}return!0}function Gs(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function qs(e,t){var n=Gs(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Gs(n)}}function Ys(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ys(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Xs(){for(var e=window,t=oe();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=oe(e.document)}return t}function Ma(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function md(e){var t=Xs(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Ys(n.ownerDocument.documentElement,n)){if(r!==null&&Ma(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var l=n.textContent.length,i=Math.min(r.start,l);r=r.end===void 0?i:Math.min(r.end,l),!e.extend&&i>r&&(l=r,r=i,i=l),l=qs(n,i);var s=qs(n,r);l&&s&&(e.rangeCount!==1||e.anchorNode!==l.node||e.anchorOffset!==l.offset||e.focusNode!==s.node||e.focusOffset!==s.offset)&&(t=t.createRange(),t.setStart(l.node,l.offset),e.removeAllRanges(),i>r?(e.addRange(t),e.extend(s.node,s.offset)):(t.setEnd(s.node,s.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var hd=Q&&"documentMode"in document&&11>=document.documentMode,Dn=null,Pa=null,kr=null,Fa=!1;function Js(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Fa||Dn==null||Dn!==oe(r)||(r=Dn,"selectionStart"in r&&Ma(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),kr&&wr(kr,r)||(kr=r,r=pl(Pa,"onSelect"),0<r.length&&(t=new ja("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Dn)))}function ul(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var On={animationend:ul("Animation","AnimationEnd"),animationiteration:ul("Animation","AnimationIteration"),animationstart:ul("Animation","AnimationStart"),transitionend:ul("Transition","TransitionEnd")},Ta={},Zs={};Q&&(Zs=document.createElement("div").style,"AnimationEvent"in window||(delete On.animationend.animation,delete On.animationiteration.animation,delete On.animationstart.animation),"TransitionEvent"in window||delete On.transitionend.transition);function cl(e){if(Ta[e])return Ta[e];if(!On[e])return e;var t=On[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Zs)return Ta[e]=t[n];return e}var eo=cl("animationend"),to=cl("animationiteration"),no=cl("animationstart"),ro=cl("transitionend"),lo=new Map,ao="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Zt(e,t){lo.set(e,t),R(t,[e])}for(var La=0;La<ao.length;La++){var Ia=ao[La],gd=Ia.toLowerCase(),vd=Ia[0].toUpperCase()+Ia.slice(1);Zt(gd,"on"+vd)}Zt(eo,"onAnimationEnd"),Zt(to,"onAnimationIteration"),Zt(no,"onAnimationStart"),Zt("dblclick","onDoubleClick"),Zt("focusin","onFocus"),Zt("focusout","onBlur"),Zt(ro,"onTransitionEnd"),$("onMouseEnter",["mouseout","mouseover"]),$("onMouseLeave",["mouseout","mouseover"]),$("onPointerEnter",["pointerout","pointerover"]),$("onPointerLeave",["pointerout","pointerover"]),R("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),R("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),R("onBeforeInput",["compositionend","keypress","textInput","paste"]),R("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),R("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),R("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var jr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),xd=new Set("cancel close invalid load scroll toggle".split(" ").concat(jr));function io(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,gc(r,t,void 0,e),e.currentTarget=null}function so(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],l=r.event;r=r.listeners;e:{var i=void 0;if(t)for(var s=r.length-1;0<=s;s--){var u=r[s],c=u.instance,x=u.currentTarget;if(u=u.listener,c!==i&&l.isPropagationStopped())break e;io(l,u,x),i=c}else for(s=0;s<r.length;s++){if(u=r[s],c=u.instance,x=u.currentTarget,u=u.listener,c!==i&&l.isPropagationStopped())break e;io(l,u,x),i=c}}}if(Gr)throw e=pa,Gr=!1,pa=null,e}function Ee(e,t){var n=t[Va];n===void 0&&(n=t[Va]=new Set);var r=e+"__bubble";n.has(r)||(oo(t,e,2,!1),n.add(r))}function Ra(e,t,n){var r=0;t&&(r|=4),oo(n,e,r,t)}var dl="_reactListening"+Math.random().toString(36).slice(2);function Nr(e){if(!e[dl]){e[dl]=!0,b.forEach(function(n){n!=="selectionchange"&&(xd.has(n)||Ra(n,!1,e),Ra(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[dl]||(t[dl]=!0,Ra("selectionchange",!1,t))}}function oo(e,t,n,r){switch(Ps(t)){case 1:var l=Fc;break;case 4:l=Tc;break;default:l=ya}n=l.bind(null,t,n,e),l=void 0,!da||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),r?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function Aa(e,t,n,r,l){var i=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var u=r.stateNode.containerInfo;if(u===l||u.nodeType===8&&u.parentNode===l)break;if(s===4)for(s=r.return;s!==null;){var c=s.tag;if((c===3||c===4)&&(c=s.stateNode.containerInfo,c===l||c.nodeType===8&&c.parentNode===l))return;s=s.return}for(;u!==null;){if(s=wn(u),s===null)return;if(c=s.tag,c===5||c===6){r=i=s;continue e}u=u.parentNode}}r=r.return}fs(function(){var x=i,N=oa(n),S=[];e:{var j=lo.get(e);if(j!==void 0){var O=ja,K=e;switch(e){case"keypress":if(al(n)===0)break e;case"keydown":case"keyup":O=Gc;break;case"focusin":K="focus",O=ba;break;case"focusout":K="blur",O=ba;break;case"beforeblur":case"afterblur":O=ba;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":O=Ls;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":O=Rc;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":O=Xc;break;case eo:case to:case no:O=Oc;break;case ro:O=Zc;break;case"scroll":O=Lc;break;case"wheel":O=td;break;case"copy":case"cut":case"paste":O=Bc;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":O=Rs}var W=(t&4)!==0,Ae=!W&&e==="scroll",h=W?j!==null?j+"Capture":null:j;W=[];for(var f=x,v;f!==null;){v=f;var _=v.stateNode;if(v.tag===5&&_!==null&&(v=_,h!==null&&(_=ar(f,h),_!=null&&W.push(Sr(f,_,v)))),Ae)break;f=f.return}0<W.length&&(j=new O(j,K,null,n,N),S.push({event:j,listeners:W}))}}if((t&7)===0){e:{if(j=e==="mouseover"||e==="pointerover",O=e==="mouseout"||e==="pointerout",j&&n!==sa&&(K=n.relatedTarget||n.fromElement)&&(wn(K)||K[Dt]))break e;if((O||j)&&(j=N.window===N?N:(j=N.ownerDocument)?j.defaultView||j.parentWindow:window,O?(K=n.relatedTarget||n.toElement,O=x,K=K?wn(K):null,K!==null&&(Ae=yn(K),K!==Ae||K.tag!==5&&K.tag!==6)&&(K=null)):(O=null,K=x),O!==K)){if(W=Ls,_="onMouseLeave",h="onMouseEnter",f="mouse",(e==="pointerout"||e==="pointerover")&&(W=Rs,_="onPointerLeave",h="onPointerEnter",f="pointer"),Ae=O==null?j:Un(O),v=K==null?j:Un(K),j=new W(_,f+"leave",O,n,N),j.target=Ae,j.relatedTarget=v,_=null,wn(N)===x&&(W=new W(h,f+"enter",K,n,N),W.target=v,W.relatedTarget=Ae,_=W),Ae=_,O&&K)t:{for(W=O,h=K,f=0,v=W;v;v=$n(v))f++;for(v=0,_=h;_;_=$n(_))v++;for(;0<f-v;)W=$n(W),f--;for(;0<v-f;)h=$n(h),v--;for(;f--;){if(W===h||h!==null&&W===h.alternate)break t;W=$n(W),h=$n(h)}W=null}else W=null;O!==null&&uo(S,j,O,W,!1),K!==null&&Ae!==null&&uo(S,Ae,K,W,!0)}}e:{if(j=x?Un(x):window,O=j.nodeName&&j.nodeName.toLowerCase(),O==="select"||O==="input"&&j.type==="file")var H=od;else if(Us(j))if(Ks)H=pd;else{H=cd;var te=ud}else(O=j.nodeName)&&O.toLowerCase()==="input"&&(j.type==="checkbox"||j.type==="radio")&&(H=dd);if(H&&(H=H(e,x))){Vs(S,H,n,N);break e}te&&te(e,j,x),e==="focusout"&&(te=j._wrapperState)&&te.controlled&&j.type==="number"&&at(j,"number",j.value)}switch(te=x?Un(x):window,e){case"focusin":(Us(te)||te.contentEditable==="true")&&(Dn=te,Pa=x,kr=null);break;case"focusout":kr=Pa=Dn=null;break;case"mousedown":Fa=!0;break;case"contextmenu":case"mouseup":case"dragend":Fa=!1,Js(S,n,N);break;case"selectionchange":if(hd)break;case"keydown":case"keyup":Js(S,n,N)}var ne;if(Ea)e:{switch(e){case"compositionstart":var ae="onCompositionStart";break e;case"compositionend":ae="onCompositionEnd";break e;case"compositionupdate":ae="onCompositionUpdate";break e}ae=void 0}else An?$s(e,n)&&(ae="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(ae="onCompositionStart");ae&&(As&&n.locale!=="ko"&&(An||ae!=="onCompositionStart"?ae==="onCompositionEnd"&&An&&(ne=Fs()):(Jt=N,ka="value"in Jt?Jt.value:Jt.textContent,An=!0)),te=pl(x,ae),0<te.length&&(ae=new Is(ae,e,null,n,N),S.push({event:ae,listeners:te}),ne?ae.data=ne:(ne=Bs(n),ne!==null&&(ae.data=ne)))),(ne=rd?ld(e,n):ad(e,n))&&(x=pl(x,"onBeforeInput"),0<x.length&&(N=new Is("onBeforeInput","beforeinput",null,n,N),S.push({event:N,listeners:x}),N.data=ne))}so(S,t)})}function Sr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function pl(e,t){for(var n=t+"Capture",r=[];e!==null;){var l=e,i=l.stateNode;l.tag===5&&i!==null&&(l=i,i=ar(e,n),i!=null&&r.unshift(Sr(e,i,l)),i=ar(e,t),i!=null&&r.push(Sr(e,i,l))),e=e.return}return r}function $n(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function uo(e,t,n,r,l){for(var i=t._reactName,s=[];n!==null&&n!==r;){var u=n,c=u.alternate,x=u.stateNode;if(c!==null&&c===r)break;u.tag===5&&x!==null&&(u=x,l?(c=ar(n,i),c!=null&&s.unshift(Sr(n,c,u))):l||(c=ar(n,i),c!=null&&s.push(Sr(n,c,u)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var yd=/\r\n?/g,wd=/\u0000|\uFFFD/g;function co(e){return(typeof e=="string"?e:""+e).replace(yd,`
`).replace(wd,"")}function fl(e,t,n){if(t=co(t),co(e)!==t&&n)throw Error(m(425))}function ml(){}var Da=null,Oa=null;function $a(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Ba=typeof setTimeout=="function"?setTimeout:void 0,kd=typeof clearTimeout=="function"?clearTimeout:void 0,po=typeof Promise=="function"?Promise:void 0,jd=typeof queueMicrotask=="function"?queueMicrotask:typeof po<"u"?function(e){return po.resolve(null).then(e).catch(Nd)}:Ba;function Nd(e){setTimeout(function(){throw e})}function Ua(e,t){var n=t,r=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(r===0){e.removeChild(l),mr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=l}while(n);mr(t)}function en(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function fo(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Bn=Math.random().toString(36).slice(2),Lt="__reactFiber$"+Bn,br="__reactProps$"+Bn,Dt="__reactContainer$"+Bn,Va="__reactEvents$"+Bn,Sd="__reactListeners$"+Bn,bd="__reactHandles$"+Bn;function wn(e){var t=e[Lt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Dt]||n[Lt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=fo(e);e!==null;){if(n=e[Lt])return n;e=fo(e)}return t}e=n,n=e.parentNode}return null}function Cr(e){return e=e[Lt]||e[Dt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Un(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(m(33))}function hl(e){return e[br]||null}var Ka=[],Vn=-1;function tn(e){return{current:e}}function _e(e){0>Vn||(e.current=Ka[Vn],Ka[Vn]=null,Vn--)}function be(e,t){Vn++,Ka[Vn]=e.current,e.current=t}var nn={},Ze=tn(nn),st=tn(!1),kn=nn;function Kn(e,t){var n=e.type.contextTypes;if(!n)return nn;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var l={},i;for(i in n)l[i]=t[i];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=l),l}function ot(e){return e=e.childContextTypes,e!=null}function gl(){_e(st),_e(Ze)}function mo(e,t,n){if(Ze.current!==nn)throw Error(m(168));be(Ze,t),be(st,n)}function ho(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var l in r)if(!(l in t))throw Error(m(108,M(e)||"Unknown",l));return p({},n,r)}function vl(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||nn,kn=Ze.current,be(Ze,e),be(st,st.current),!0}function go(e,t,n){var r=e.stateNode;if(!r)throw Error(m(169));n?(e=ho(e,t,kn),r.__reactInternalMemoizedMergedChildContext=e,_e(st),_e(Ze),be(Ze,e)):_e(st),be(st,n)}var Ot=null,xl=!1,Wa=!1;function vo(e){Ot===null?Ot=[e]:Ot.push(e)}function Cd(e){xl=!0,vo(e)}function rn(){if(!Wa&&Ot!==null){Wa=!0;var e=0,t=ke;try{var n=Ot;for(ke=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Ot=null,xl=!1}catch(l){throw Ot!==null&&(Ot=Ot.slice(e+1)),xs(fa,rn),l}finally{ke=t,Wa=!1}}return null}var Wn=[],Hn=0,yl=null,wl=0,yt=[],wt=0,jn=null,$t=1,Bt="";function Nn(e,t){Wn[Hn++]=wl,Wn[Hn++]=yl,yl=e,wl=t}function xo(e,t,n){yt[wt++]=$t,yt[wt++]=Bt,yt[wt++]=jn,jn=e;var r=$t;e=Bt;var l=32-bt(r)-1;r&=~(1<<l),n+=1;var i=32-bt(t)+l;if(30<i){var s=l-l%5;i=(r&(1<<s)-1).toString(32),r>>=s,l-=s,$t=1<<32-bt(t)+l|n<<l|r,Bt=i+e}else $t=1<<i|n<<l|r,Bt=e}function Ha(e){e.return!==null&&(Nn(e,1),xo(e,1,0))}function Qa(e){for(;e===yl;)yl=Wn[--Hn],Wn[Hn]=null,wl=Wn[--Hn],Wn[Hn]=null;for(;e===jn;)jn=yt[--wt],yt[wt]=null,Bt=yt[--wt],yt[wt]=null,$t=yt[--wt],yt[wt]=null}var mt=null,ht=null,Me=!1,Et=null;function yo(e,t){var n=St(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function wo(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,mt=e,ht=en(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,mt=e,ht=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=jn!==null?{id:$t,overflow:Bt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=St(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,mt=e,ht=null,!0):!1;default:return!1}}function Ga(e){return(e.mode&1)!==0&&(e.flags&128)===0}function qa(e){if(Me){var t=ht;if(t){var n=t;if(!wo(e,t)){if(Ga(e))throw Error(m(418));t=en(n.nextSibling);var r=mt;t&&wo(e,t)?yo(r,n):(e.flags=e.flags&-4097|2,Me=!1,mt=e)}}else{if(Ga(e))throw Error(m(418));e.flags=e.flags&-4097|2,Me=!1,mt=e}}}function ko(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;mt=e}function kl(e){if(e!==mt)return!1;if(!Me)return ko(e),Me=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!$a(e.type,e.memoizedProps)),t&&(t=ht)){if(Ga(e))throw jo(),Error(m(418));for(;t;)yo(e,t),t=en(t.nextSibling)}if(ko(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(m(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){ht=en(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}ht=null}}else ht=mt?en(e.stateNode.nextSibling):null;return!0}function jo(){for(var e=ht;e;)e=en(e.nextSibling)}function Qn(){ht=mt=null,Me=!1}function Ya(e){Et===null?Et=[e]:Et.push(e)}var Ed=Z.ReactCurrentBatchConfig;function Er(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(m(309));var r=n.stateNode}if(!r)throw Error(m(147,e));var l=r,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(s){var u=l.refs;s===null?delete u[i]:u[i]=s},t._stringRef=i,t)}if(typeof e!="string")throw Error(m(284));if(!n._owner)throw Error(m(290,e))}return e}function jl(e,t){throw e=Object.prototype.toString.call(t),Error(m(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function No(e){var t=e._init;return t(e._payload)}function So(e){function t(h,f){if(e){var v=h.deletions;v===null?(h.deletions=[f],h.flags|=16):v.push(f)}}function n(h,f){if(!e)return null;for(;f!==null;)t(h,f),f=f.sibling;return null}function r(h,f){for(h=new Map;f!==null;)f.key!==null?h.set(f.key,f):h.set(f.index,f),f=f.sibling;return h}function l(h,f){return h=pn(h,f),h.index=0,h.sibling=null,h}function i(h,f,v){return h.index=v,e?(v=h.alternate,v!==null?(v=v.index,v<f?(h.flags|=2,f):v):(h.flags|=2,f)):(h.flags|=1048576,f)}function s(h){return e&&h.alternate===null&&(h.flags|=2),h}function u(h,f,v,_){return f===null||f.tag!==6?(f=Bi(v,h.mode,_),f.return=h,f):(f=l(f,v),f.return=h,f)}function c(h,f,v,_){var H=v.type;return H===xe?N(h,f,v.props.children,_,v.key):f!==null&&(f.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===Oe&&No(H)===f.type)?(_=l(f,v.props),_.ref=Er(h,f,v),_.return=h,_):(_=Hl(v.type,v.key,v.props,null,h.mode,_),_.ref=Er(h,f,v),_.return=h,_)}function x(h,f,v,_){return f===null||f.tag!==4||f.stateNode.containerInfo!==v.containerInfo||f.stateNode.implementation!==v.implementation?(f=Ui(v,h.mode,_),f.return=h,f):(f=l(f,v.children||[]),f.return=h,f)}function N(h,f,v,_,H){return f===null||f.tag!==7?(f=Pn(v,h.mode,_,H),f.return=h,f):(f=l(f,v),f.return=h,f)}function S(h,f,v){if(typeof f=="string"&&f!==""||typeof f=="number")return f=Bi(""+f,h.mode,v),f.return=h,f;if(typeof f=="object"&&f!==null){switch(f.$$typeof){case we:return v=Hl(f.type,f.key,f.props,null,h.mode,v),v.ref=Er(h,null,f),v.return=h,v;case je:return f=Ui(f,h.mode,v),f.return=h,f;case Oe:var _=f._init;return S(h,_(f._payload),v)}if($e(f)||J(f))return f=Pn(f,h.mode,v,null),f.return=h,f;jl(h,f)}return null}function j(h,f,v,_){var H=f!==null?f.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return H!==null?null:u(h,f,""+v,_);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case we:return v.key===H?c(h,f,v,_):null;case je:return v.key===H?x(h,f,v,_):null;case Oe:return H=v._init,j(h,f,H(v._payload),_)}if($e(v)||J(v))return H!==null?null:N(h,f,v,_,null);jl(h,v)}return null}function O(h,f,v,_,H){if(typeof _=="string"&&_!==""||typeof _=="number")return h=h.get(v)||null,u(f,h,""+_,H);if(typeof _=="object"&&_!==null){switch(_.$$typeof){case we:return h=h.get(_.key===null?v:_.key)||null,c(f,h,_,H);case je:return h=h.get(_.key===null?v:_.key)||null,x(f,h,_,H);case Oe:var te=_._init;return O(h,f,v,te(_._payload),H)}if($e(_)||J(_))return h=h.get(v)||null,N(f,h,_,H,null);jl(f,_)}return null}function K(h,f,v,_){for(var H=null,te=null,ne=f,ae=f=0,Ge=null;ne!==null&&ae<v.length;ae++){ne.index>ae?(Ge=ne,ne=null):Ge=ne.sibling;var ye=j(h,ne,v[ae],_);if(ye===null){ne===null&&(ne=Ge);break}e&&ne&&ye.alternate===null&&t(h,ne),f=i(ye,f,ae),te===null?H=ye:te.sibling=ye,te=ye,ne=Ge}if(ae===v.length)return n(h,ne),Me&&Nn(h,ae),H;if(ne===null){for(;ae<v.length;ae++)ne=S(h,v[ae],_),ne!==null&&(f=i(ne,f,ae),te===null?H=ne:te.sibling=ne,te=ne);return Me&&Nn(h,ae),H}for(ne=r(h,ne);ae<v.length;ae++)Ge=O(ne,h,ae,v[ae],_),Ge!==null&&(e&&Ge.alternate!==null&&ne.delete(Ge.key===null?ae:Ge.key),f=i(Ge,f,ae),te===null?H=Ge:te.sibling=Ge,te=Ge);return e&&ne.forEach(function(fn){return t(h,fn)}),Me&&Nn(h,ae),H}function W(h,f,v,_){var H=J(v);if(typeof H!="function")throw Error(m(150));if(v=H.call(v),v==null)throw Error(m(151));for(var te=H=null,ne=f,ae=f=0,Ge=null,ye=v.next();ne!==null&&!ye.done;ae++,ye=v.next()){ne.index>ae?(Ge=ne,ne=null):Ge=ne.sibling;var fn=j(h,ne,ye.value,_);if(fn===null){ne===null&&(ne=Ge);break}e&&ne&&fn.alternate===null&&t(h,ne),f=i(fn,f,ae),te===null?H=fn:te.sibling=fn,te=fn,ne=Ge}if(ye.done)return n(h,ne),Me&&Nn(h,ae),H;if(ne===null){for(;!ye.done;ae++,ye=v.next())ye=S(h,ye.value,_),ye!==null&&(f=i(ye,f,ae),te===null?H=ye:te.sibling=ye,te=ye);return Me&&Nn(h,ae),H}for(ne=r(h,ne);!ye.done;ae++,ye=v.next())ye=O(ne,h,ae,ye.value,_),ye!==null&&(e&&ye.alternate!==null&&ne.delete(ye.key===null?ae:ye.key),f=i(ye,f,ae),te===null?H=ye:te.sibling=ye,te=ye);return e&&ne.forEach(function(ip){return t(h,ip)}),Me&&Nn(h,ae),H}function Ae(h,f,v,_){if(typeof v=="object"&&v!==null&&v.type===xe&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case we:e:{for(var H=v.key,te=f;te!==null;){if(te.key===H){if(H=v.type,H===xe){if(te.tag===7){n(h,te.sibling),f=l(te,v.props.children),f.return=h,h=f;break e}}else if(te.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===Oe&&No(H)===te.type){n(h,te.sibling),f=l(te,v.props),f.ref=Er(h,te,v),f.return=h,h=f;break e}n(h,te);break}else t(h,te);te=te.sibling}v.type===xe?(f=Pn(v.props.children,h.mode,_,v.key),f.return=h,h=f):(_=Hl(v.type,v.key,v.props,null,h.mode,_),_.ref=Er(h,f,v),_.return=h,h=_)}return s(h);case je:e:{for(te=v.key;f!==null;){if(f.key===te)if(f.tag===4&&f.stateNode.containerInfo===v.containerInfo&&f.stateNode.implementation===v.implementation){n(h,f.sibling),f=l(f,v.children||[]),f.return=h,h=f;break e}else{n(h,f);break}else t(h,f);f=f.sibling}f=Ui(v,h.mode,_),f.return=h,h=f}return s(h);case Oe:return te=v._init,Ae(h,f,te(v._payload),_)}if($e(v))return K(h,f,v,_);if(J(v))return W(h,f,v,_);jl(h,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,f!==null&&f.tag===6?(n(h,f.sibling),f=l(f,v),f.return=h,h=f):(n(h,f),f=Bi(v,h.mode,_),f.return=h,h=f),s(h)):n(h,f)}return Ae}var Gn=So(!0),bo=So(!1),Nl=tn(null),Sl=null,qn=null,Xa=null;function Ja(){Xa=qn=Sl=null}function Za(e){var t=Nl.current;_e(Nl),e._currentValue=t}function ei(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Yn(e,t){Sl=e,Xa=qn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(ut=!0),e.firstContext=null)}function kt(e){var t=e._currentValue;if(Xa!==e)if(e={context:e,memoizedValue:t,next:null},qn===null){if(Sl===null)throw Error(m(308));qn=e,Sl.dependencies={lanes:0,firstContext:e}}else qn=qn.next=e;return t}var Sn=null;function ti(e){Sn===null?Sn=[e]:Sn.push(e)}function Co(e,t,n,r){var l=t.interleaved;return l===null?(n.next=n,ti(t)):(n.next=l.next,l.next=n),t.interleaved=n,Ut(e,r)}function Ut(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var ln=!1;function ni(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Eo(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Vt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function an(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(ve&2)!==0){var l=r.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),r.pending=t,Ut(e,n)}return l=r.interleaved,l===null?(t.next=t,ti(r)):(t.next=l.next,l.next=t),r.interleaved=t,Ut(e,n)}function bl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ga(e,n)}}function _o(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var l=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?l=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?l=i=t:i=i.next=t}else l=i=t;n={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:i,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Cl(e,t,n,r){var l=e.updateQueue;ln=!1;var i=l.firstBaseUpdate,s=l.lastBaseUpdate,u=l.shared.pending;if(u!==null){l.shared.pending=null;var c=u,x=c.next;c.next=null,s===null?i=x:s.next=x,s=c;var N=e.alternate;N!==null&&(N=N.updateQueue,u=N.lastBaseUpdate,u!==s&&(u===null?N.firstBaseUpdate=x:u.next=x,N.lastBaseUpdate=c))}if(i!==null){var S=l.baseState;s=0,N=x=c=null,u=i;do{var j=u.lane,O=u.eventTime;if((r&j)===j){N!==null&&(N=N.next={eventTime:O,lane:0,tag:u.tag,payload:u.payload,callback:u.callback,next:null});e:{var K=e,W=u;switch(j=t,O=n,W.tag){case 1:if(K=W.payload,typeof K=="function"){S=K.call(O,S,j);break e}S=K;break e;case 3:K.flags=K.flags&-65537|128;case 0:if(K=W.payload,j=typeof K=="function"?K.call(O,S,j):K,j==null)break e;S=p({},S,j);break e;case 2:ln=!0}}u.callback!==null&&u.lane!==0&&(e.flags|=64,j=l.effects,j===null?l.effects=[u]:j.push(u))}else O={eventTime:O,lane:j,tag:u.tag,payload:u.payload,callback:u.callback,next:null},N===null?(x=N=O,c=S):N=N.next=O,s|=j;if(u=u.next,u===null){if(u=l.shared.pending,u===null)break;j=u,u=j.next,j.next=null,l.lastBaseUpdate=j,l.shared.pending=null}}while(!0);if(N===null&&(c=S),l.baseState=c,l.firstBaseUpdate=x,l.lastBaseUpdate=N,t=l.shared.interleaved,t!==null){l=t;do s|=l.lane,l=l.next;while(l!==t)}else i===null&&(l.shared.lanes=0);En|=s,e.lanes=s,e.memoizedState=S}}function zo(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],l=r.callback;if(l!==null){if(r.callback=null,r=n,typeof l!="function")throw Error(m(191,l));l.call(r)}}}var _r={},It=tn(_r),zr=tn(_r),Mr=tn(_r);function bn(e){if(e===_r)throw Error(m(174));return e}function ri(e,t){switch(be(Mr,t),be(zr,e),be(It,_r),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:vn(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=vn(t,e)}_e(It),be(It,t)}function Xn(){_e(It),_e(zr),_e(Mr)}function Mo(e){bn(Mr.current);var t=bn(It.current),n=vn(t,e.type);t!==n&&(be(zr,e),be(It,n))}function li(e){zr.current===e&&(_e(It),_e(zr))}var Te=tn(0);function El(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var ai=[];function ii(){for(var e=0;e<ai.length;e++)ai[e]._workInProgressVersionPrimary=null;ai.length=0}var _l=Z.ReactCurrentDispatcher,si=Z.ReactCurrentBatchConfig,Cn=0,Le=null,Ve=null,He=null,zl=!1,Pr=!1,Fr=0,_d=0;function et(){throw Error(m(321))}function oi(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ct(e[n],t[n]))return!1;return!0}function ui(e,t,n,r,l,i){if(Cn=i,Le=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,_l.current=e===null||e.memoizedState===null?Fd:Td,e=n(r,l),Pr){i=0;do{if(Pr=!1,Fr=0,25<=i)throw Error(m(301));i+=1,He=Ve=null,t.updateQueue=null,_l.current=Ld,e=n(r,l)}while(Pr)}if(_l.current=Fl,t=Ve!==null&&Ve.next!==null,Cn=0,He=Ve=Le=null,zl=!1,t)throw Error(m(300));return e}function ci(){var e=Fr!==0;return Fr=0,e}function Rt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return He===null?Le.memoizedState=He=e:He=He.next=e,He}function jt(){if(Ve===null){var e=Le.alternate;e=e!==null?e.memoizedState:null}else e=Ve.next;var t=He===null?Le.memoizedState:He.next;if(t!==null)He=t,Ve=e;else{if(e===null)throw Error(m(310));Ve=e,e={memoizedState:Ve.memoizedState,baseState:Ve.baseState,baseQueue:Ve.baseQueue,queue:Ve.queue,next:null},He===null?Le.memoizedState=He=e:He=He.next=e}return He}function Tr(e,t){return typeof t=="function"?t(e):t}function di(e){var t=jt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=Ve,l=r.baseQueue,i=n.pending;if(i!==null){if(l!==null){var s=l.next;l.next=i.next,i.next=s}r.baseQueue=l=i,n.pending=null}if(l!==null){i=l.next,r=r.baseState;var u=s=null,c=null,x=i;do{var N=x.lane;if((Cn&N)===N)c!==null&&(c=c.next={lane:0,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null}),r=x.hasEagerState?x.eagerState:e(r,x.action);else{var S={lane:N,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null};c===null?(u=c=S,s=r):c=c.next=S,Le.lanes|=N,En|=N}x=x.next}while(x!==null&&x!==i);c===null?s=r:c.next=u,Ct(r,t.memoizedState)||(ut=!0),t.memoizedState=r,t.baseState=s,t.baseQueue=c,n.lastRenderedState=r}if(e=n.interleaved,e!==null){l=e;do i=l.lane,Le.lanes|=i,En|=i,l=l.next;while(l!==e)}else l===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function pi(e){var t=jt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=n.dispatch,l=n.pending,i=t.memoizedState;if(l!==null){n.pending=null;var s=l=l.next;do i=e(i,s.action),s=s.next;while(s!==l);Ct(i,t.memoizedState)||(ut=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,r]}function Po(){}function Fo(e,t){var n=Le,r=jt(),l=t(),i=!Ct(r.memoizedState,l);if(i&&(r.memoizedState=l,ut=!0),r=r.queue,fi(Io.bind(null,n,r,e),[e]),r.getSnapshot!==t||i||He!==null&&He.memoizedState.tag&1){if(n.flags|=2048,Lr(9,Lo.bind(null,n,r,l,t),void 0,null),Qe===null)throw Error(m(349));(Cn&30)!==0||To(n,t,l)}return l}function To(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Le.updateQueue,t===null?(t={lastEffect:null,stores:null},Le.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Lo(e,t,n,r){t.value=n,t.getSnapshot=r,Ro(t)&&Ao(e)}function Io(e,t,n){return n(function(){Ro(t)&&Ao(e)})}function Ro(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ct(e,n)}catch{return!0}}function Ao(e){var t=Ut(e,1);t!==null&&Pt(t,e,1,-1)}function Do(e){var t=Rt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Tr,lastRenderedState:e},t.queue=e,e=e.dispatch=Pd.bind(null,Le,e),[t.memoizedState,e]}function Lr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=Le.updateQueue,t===null?(t={lastEffect:null,stores:null},Le.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Oo(){return jt().memoizedState}function Ml(e,t,n,r){var l=Rt();Le.flags|=e,l.memoizedState=Lr(1|t,n,void 0,r===void 0?null:r)}function Pl(e,t,n,r){var l=jt();r=r===void 0?null:r;var i=void 0;if(Ve!==null){var s=Ve.memoizedState;if(i=s.destroy,r!==null&&oi(r,s.deps)){l.memoizedState=Lr(t,n,i,r);return}}Le.flags|=e,l.memoizedState=Lr(1|t,n,i,r)}function $o(e,t){return Ml(8390656,8,e,t)}function fi(e,t){return Pl(2048,8,e,t)}function Bo(e,t){return Pl(4,2,e,t)}function Uo(e,t){return Pl(4,4,e,t)}function Vo(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ko(e,t,n){return n=n!=null?n.concat([e]):null,Pl(4,4,Vo.bind(null,t,e),n)}function mi(){}function Wo(e,t){var n=jt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&oi(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ho(e,t){var n=jt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&oi(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Qo(e,t,n){return(Cn&21)===0?(e.baseState&&(e.baseState=!1,ut=!0),e.memoizedState=n):(Ct(n,t)||(n=js(),Le.lanes|=n,En|=n,e.baseState=!0),t)}function zd(e,t){var n=ke;ke=n!==0&&4>n?n:4,e(!0);var r=si.transition;si.transition={};try{e(!1),t()}finally{ke=n,si.transition=r}}function Go(){return jt().memoizedState}function Md(e,t,n){var r=cn(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},qo(e))Yo(t,n);else if(n=Co(e,t,n,r),n!==null){var l=lt();Pt(n,e,r,l),Xo(n,t,r)}}function Pd(e,t,n){var r=cn(e),l={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(qo(e))Yo(t,l);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var s=t.lastRenderedState,u=i(s,n);if(l.hasEagerState=!0,l.eagerState=u,Ct(u,s)){var c=t.interleaved;c===null?(l.next=l,ti(t)):(l.next=c.next,c.next=l),t.interleaved=l;return}}catch{}finally{}n=Co(e,t,l,r),n!==null&&(l=lt(),Pt(n,e,r,l),Xo(n,t,r))}}function qo(e){var t=e.alternate;return e===Le||t!==null&&t===Le}function Yo(e,t){Pr=zl=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Xo(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ga(e,n)}}var Fl={readContext:kt,useCallback:et,useContext:et,useEffect:et,useImperativeHandle:et,useInsertionEffect:et,useLayoutEffect:et,useMemo:et,useReducer:et,useRef:et,useState:et,useDebugValue:et,useDeferredValue:et,useTransition:et,useMutableSource:et,useSyncExternalStore:et,useId:et,unstable_isNewReconciler:!1},Fd={readContext:kt,useCallback:function(e,t){return Rt().memoizedState=[e,t===void 0?null:t],e},useContext:kt,useEffect:$o,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ml(4194308,4,Vo.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ml(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ml(4,2,e,t)},useMemo:function(e,t){var n=Rt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Rt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Md.bind(null,Le,e),[r.memoizedState,e]},useRef:function(e){var t=Rt();return e={current:e},t.memoizedState=e},useState:Do,useDebugValue:mi,useDeferredValue:function(e){return Rt().memoizedState=e},useTransition:function(){var e=Do(!1),t=e[0];return e=zd.bind(null,e[1]),Rt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=Le,l=Rt();if(Me){if(n===void 0)throw Error(m(407));n=n()}else{if(n=t(),Qe===null)throw Error(m(349));(Cn&30)!==0||To(r,t,n)}l.memoizedState=n;var i={value:n,getSnapshot:t};return l.queue=i,$o(Io.bind(null,r,i,e),[e]),r.flags|=2048,Lr(9,Lo.bind(null,r,i,n,t),void 0,null),n},useId:function(){var e=Rt(),t=Qe.identifierPrefix;if(Me){var n=Bt,r=$t;n=(r&~(1<<32-bt(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Fr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=_d++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Td={readContext:kt,useCallback:Wo,useContext:kt,useEffect:fi,useImperativeHandle:Ko,useInsertionEffect:Bo,useLayoutEffect:Uo,useMemo:Ho,useReducer:di,useRef:Oo,useState:function(){return di(Tr)},useDebugValue:mi,useDeferredValue:function(e){var t=jt();return Qo(t,Ve.memoizedState,e)},useTransition:function(){var e=di(Tr)[0],t=jt().memoizedState;return[e,t]},useMutableSource:Po,useSyncExternalStore:Fo,useId:Go,unstable_isNewReconciler:!1},Ld={readContext:kt,useCallback:Wo,useContext:kt,useEffect:fi,useImperativeHandle:Ko,useInsertionEffect:Bo,useLayoutEffect:Uo,useMemo:Ho,useReducer:pi,useRef:Oo,useState:function(){return pi(Tr)},useDebugValue:mi,useDeferredValue:function(e){var t=jt();return Ve===null?t.memoizedState=e:Qo(t,Ve.memoizedState,e)},useTransition:function(){var e=pi(Tr)[0],t=jt().memoizedState;return[e,t]},useMutableSource:Po,useSyncExternalStore:Fo,useId:Go,unstable_isNewReconciler:!1};function _t(e,t){if(e&&e.defaultProps){t=p({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function hi(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Tl={isMounted:function(e){return(e=e._reactInternals)?yn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=lt(),l=cn(e),i=Vt(r,l);i.payload=t,n!=null&&(i.callback=n),t=an(e,i,l),t!==null&&(Pt(t,e,l,r),bl(t,e,l))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=lt(),l=cn(e),i=Vt(r,l);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=an(e,i,l),t!==null&&(Pt(t,e,l,r),bl(t,e,l))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=lt(),r=cn(e),l=Vt(n,r);l.tag=2,t!=null&&(l.callback=t),t=an(e,l,r),t!==null&&(Pt(t,e,r,n),bl(t,e,r))}};function Jo(e,t,n,r,l,i,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,i,s):t.prototype&&t.prototype.isPureReactComponent?!wr(n,r)||!wr(l,i):!0}function Zo(e,t,n){var r=!1,l=nn,i=t.contextType;return typeof i=="object"&&i!==null?i=kt(i):(l=ot(t)?kn:Ze.current,r=t.contextTypes,i=(r=r!=null)?Kn(e,l):nn),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Tl,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=l,e.__reactInternalMemoizedMaskedChildContext=i),t}function eu(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Tl.enqueueReplaceState(t,t.state,null)}function gi(e,t,n,r){var l=e.stateNode;l.props=n,l.state=e.memoizedState,l.refs={},ni(e);var i=t.contextType;typeof i=="object"&&i!==null?l.context=kt(i):(i=ot(t)?kn:Ze.current,l.context=Kn(e,i)),l.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(hi(e,t,i,n),l.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(t=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),t!==l.state&&Tl.enqueueReplaceState(l,l.state,null),Cl(e,n,l,r),l.state=e.memoizedState),typeof l.componentDidMount=="function"&&(e.flags|=4194308)}function Jn(e,t){try{var n="",r=t;do n+=T(r),r=r.return;while(r);var l=n}catch(i){l=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:l,digest:null}}function vi(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function xi(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Id=typeof WeakMap=="function"?WeakMap:Map;function tu(e,t,n){n=Vt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){$l||($l=!0,Ti=r),xi(e,t)},n}function nu(e,t,n){n=Vt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var l=t.value;n.payload=function(){return r(l)},n.callback=function(){xi(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){xi(e,t),typeof r!="function"&&(on===null?on=new Set([this]):on.add(this));var s=t.stack;this.componentDidCatch(t.value,{componentStack:s!==null?s:""})}),n}function ru(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Id;var l=new Set;r.set(t,l)}else l=r.get(t),l===void 0&&(l=new Set,r.set(t,l));l.has(n)||(l.add(n),e=qd.bind(null,e,t,n),t.then(e,e))}function lu(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function au(e,t,n,r,l){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Vt(-1,1),t.tag=2,an(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=l,e)}var Rd=Z.ReactCurrentOwner,ut=!1;function rt(e,t,n,r){t.child=e===null?bo(t,null,n,r):Gn(t,e.child,n,r)}function iu(e,t,n,r,l){n=n.render;var i=t.ref;return Yn(t,l),r=ui(e,t,n,r,i,l),n=ci(),e!==null&&!ut?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Kt(e,t,l)):(Me&&n&&Ha(t),t.flags|=1,rt(e,t,r,l),t.child)}function su(e,t,n,r,l){if(e===null){var i=n.type;return typeof i=="function"&&!$i(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,ou(e,t,i,r,l)):(e=Hl(n.type,null,r,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,(e.lanes&l)===0){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:wr,n(s,r)&&e.ref===t.ref)return Kt(e,t,l)}return t.flags|=1,e=pn(i,r),e.ref=t.ref,e.return=t,t.child=e}function ou(e,t,n,r,l){if(e!==null){var i=e.memoizedProps;if(wr(i,r)&&e.ref===t.ref)if(ut=!1,t.pendingProps=r=i,(e.lanes&l)!==0)(e.flags&131072)!==0&&(ut=!0);else return t.lanes=e.lanes,Kt(e,t,l)}return yi(e,t,n,r,l)}function uu(e,t,n){var r=t.pendingProps,l=r.children,i=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},be(er,gt),gt|=n;else{if((n&1073741824)===0)return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,be(er,gt),gt|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,be(er,gt),gt|=r}else i!==null?(r=i.baseLanes|n,t.memoizedState=null):r=n,be(er,gt),gt|=r;return rt(e,t,l,n),t.child}function cu(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function yi(e,t,n,r,l){var i=ot(n)?kn:Ze.current;return i=Kn(t,i),Yn(t,l),n=ui(e,t,n,r,i,l),r=ci(),e!==null&&!ut?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Kt(e,t,l)):(Me&&r&&Ha(t),t.flags|=1,rt(e,t,n,l),t.child)}function du(e,t,n,r,l){if(ot(n)){var i=!0;vl(t)}else i=!1;if(Yn(t,l),t.stateNode===null)Il(e,t),Zo(t,n,r),gi(t,n,r,l),r=!0;else if(e===null){var s=t.stateNode,u=t.memoizedProps;s.props=u;var c=s.context,x=n.contextType;typeof x=="object"&&x!==null?x=kt(x):(x=ot(n)?kn:Ze.current,x=Kn(t,x));var N=n.getDerivedStateFromProps,S=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function";S||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u!==r||c!==x)&&eu(t,s,r,x),ln=!1;var j=t.memoizedState;s.state=j,Cl(t,r,s,l),c=t.memoizedState,u!==r||j!==c||st.current||ln?(typeof N=="function"&&(hi(t,n,N,r),c=t.memoizedState),(u=ln||Jo(t,n,u,r,j,c,x))?(S||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=c),s.props=r,s.state=c,s.context=x,r=u):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{s=t.stateNode,Eo(e,t),u=t.memoizedProps,x=t.type===t.elementType?u:_t(t.type,u),s.props=x,S=t.pendingProps,j=s.context,c=n.contextType,typeof c=="object"&&c!==null?c=kt(c):(c=ot(n)?kn:Ze.current,c=Kn(t,c));var O=n.getDerivedStateFromProps;(N=typeof O=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u!==S||j!==c)&&eu(t,s,r,c),ln=!1,j=t.memoizedState,s.state=j,Cl(t,r,s,l);var K=t.memoizedState;u!==S||j!==K||st.current||ln?(typeof O=="function"&&(hi(t,n,O,r),K=t.memoizedState),(x=ln||Jo(t,n,x,r,j,K,c)||!1)?(N||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(r,K,c),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(r,K,c)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||u===e.memoizedProps&&j===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&j===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=K),s.props=r,s.state=K,s.context=c,r=x):(typeof s.componentDidUpdate!="function"||u===e.memoizedProps&&j===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&j===e.memoizedState||(t.flags|=1024),r=!1)}return wi(e,t,n,r,i,l)}function wi(e,t,n,r,l,i){cu(e,t);var s=(t.flags&128)!==0;if(!r&&!s)return l&&go(t,n,!1),Kt(e,t,i);r=t.stateNode,Rd.current=t;var u=s&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&s?(t.child=Gn(t,e.child,null,i),t.child=Gn(t,null,u,i)):rt(e,t,u,i),t.memoizedState=r.state,l&&go(t,n,!0),t.child}function pu(e){var t=e.stateNode;t.pendingContext?mo(e,t.pendingContext,t.pendingContext!==t.context):t.context&&mo(e,t.context,!1),ri(e,t.containerInfo)}function fu(e,t,n,r,l){return Qn(),Ya(l),t.flags|=256,rt(e,t,n,r),t.child}var ki={dehydrated:null,treeContext:null,retryLane:0};function ji(e){return{baseLanes:e,cachePool:null,transitions:null}}function mu(e,t,n){var r=t.pendingProps,l=Te.current,i=!1,s=(t.flags&128)!==0,u;if((u=s)||(u=e!==null&&e.memoizedState===null?!1:(l&2)!==0),u?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(l|=1),be(Te,l&1),e===null)return qa(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(s=r.children,e=r.fallback,i?(r=t.mode,i=t.child,s={mode:"hidden",children:s},(r&1)===0&&i!==null?(i.childLanes=0,i.pendingProps=s):i=Ql(s,r,0,null),e=Pn(e,r,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=ji(n),t.memoizedState=ki,e):Ni(t,s));if(l=e.memoizedState,l!==null&&(u=l.dehydrated,u!==null))return Ad(e,t,s,r,u,l,n);if(i){i=r.fallback,s=t.mode,l=e.child,u=l.sibling;var c={mode:"hidden",children:r.children};return(s&1)===0&&t.child!==l?(r=t.child,r.childLanes=0,r.pendingProps=c,t.deletions=null):(r=pn(l,c),r.subtreeFlags=l.subtreeFlags&14680064),u!==null?i=pn(u,i):(i=Pn(i,s,n,null),i.flags|=2),i.return=t,r.return=t,r.sibling=i,t.child=r,r=i,i=t.child,s=e.child.memoizedState,s=s===null?ji(n):{baseLanes:s.baseLanes|n,cachePool:null,transitions:s.transitions},i.memoizedState=s,i.childLanes=e.childLanes&~n,t.memoizedState=ki,r}return i=e.child,e=i.sibling,r=pn(i,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function Ni(e,t){return t=Ql({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Ll(e,t,n,r){return r!==null&&Ya(r),Gn(t,e.child,null,n),e=Ni(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Ad(e,t,n,r,l,i,s){if(n)return t.flags&256?(t.flags&=-257,r=vi(Error(m(422))),Ll(e,t,s,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=r.fallback,l=t.mode,r=Ql({mode:"visible",children:r.children},l,0,null),i=Pn(i,l,s,null),i.flags|=2,r.return=t,i.return=t,r.sibling=i,t.child=r,(t.mode&1)!==0&&Gn(t,e.child,null,s),t.child.memoizedState=ji(s),t.memoizedState=ki,i);if((t.mode&1)===0)return Ll(e,t,s,null);if(l.data==="$!"){if(r=l.nextSibling&&l.nextSibling.dataset,r)var u=r.dgst;return r=u,i=Error(m(419)),r=vi(i,r,void 0),Ll(e,t,s,r)}if(u=(s&e.childLanes)!==0,ut||u){if(r=Qe,r!==null){switch(s&-s){case 4:l=2;break;case 16:l=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:l=32;break;case 536870912:l=268435456;break;default:l=0}l=(l&(r.suspendedLanes|s))!==0?0:l,l!==0&&l!==i.retryLane&&(i.retryLane=l,Ut(e,l),Pt(r,e,l,-1))}return Oi(),r=vi(Error(m(421))),Ll(e,t,s,r)}return l.data==="$?"?(t.flags|=128,t.child=e.child,t=Yd.bind(null,e),l._reactRetry=t,null):(e=i.treeContext,ht=en(l.nextSibling),mt=t,Me=!0,Et=null,e!==null&&(yt[wt++]=$t,yt[wt++]=Bt,yt[wt++]=jn,$t=e.id,Bt=e.overflow,jn=t),t=Ni(t,r.children),t.flags|=4096,t)}function hu(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ei(e.return,t,n)}function Si(e,t,n,r,l){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:l}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=l)}function gu(e,t,n){var r=t.pendingProps,l=r.revealOrder,i=r.tail;if(rt(e,t,r.children,n),r=Te.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&hu(e,n,t);else if(e.tag===19)hu(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(be(Te,r),(t.mode&1)===0)t.memoizedState=null;else switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&El(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),Si(t,!1,l,n,i);break;case"backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&El(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}Si(t,!0,n,null,i);break;case"together":Si(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Il(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Kt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),En|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(m(153));if(t.child!==null){for(e=t.child,n=pn(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=pn(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Dd(e,t,n){switch(t.tag){case 3:pu(t),Qn();break;case 5:Mo(t);break;case 1:ot(t.type)&&vl(t);break;case 4:ri(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,l=t.memoizedProps.value;be(Nl,r._currentValue),r._currentValue=l;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(be(Te,Te.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?mu(e,t,n):(be(Te,Te.current&1),e=Kt(e,t,n),e!==null?e.sibling:null);be(Te,Te.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return gu(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),be(Te,Te.current),r)break;return null;case 22:case 23:return t.lanes=0,uu(e,t,n)}return Kt(e,t,n)}var vu,bi,xu,yu;vu=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},bi=function(){},xu=function(e,t,n,r){var l=e.memoizedProps;if(l!==r){e=t.stateNode,bn(It.current);var i=null;switch(n){case"input":l=ue(e,l),r=ue(e,r),i=[];break;case"select":l=p({},l,{value:void 0}),r=p({},r,{value:void 0}),i=[];break;case"textarea":l=mn(e,l),r=mn(e,r),i=[];break;default:typeof l.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=ml)}aa(n,r);var s;n=null;for(x in l)if(!r.hasOwnProperty(x)&&l.hasOwnProperty(x)&&l[x]!=null)if(x==="style"){var u=l[x];for(s in u)u.hasOwnProperty(s)&&(n||(n={}),n[s]="")}else x!=="dangerouslySetInnerHTML"&&x!=="children"&&x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&x!=="autoFocus"&&(I.hasOwnProperty(x)?i||(i=[]):(i=i||[]).push(x,null));for(x in r){var c=r[x];if(u=l!=null?l[x]:void 0,r.hasOwnProperty(x)&&c!==u&&(c!=null||u!=null))if(x==="style")if(u){for(s in u)!u.hasOwnProperty(s)||c&&c.hasOwnProperty(s)||(n||(n={}),n[s]="");for(s in c)c.hasOwnProperty(s)&&u[s]!==c[s]&&(n||(n={}),n[s]=c[s])}else n||(i||(i=[]),i.push(x,n)),n=c;else x==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,u=u?u.__html:void 0,c!=null&&u!==c&&(i=i||[]).push(x,c)):x==="children"?typeof c!="string"&&typeof c!="number"||(i=i||[]).push(x,""+c):x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&(I.hasOwnProperty(x)?(c!=null&&x==="onScroll"&&Ee("scroll",e),i||u===c||(i=[])):(i=i||[]).push(x,c))}n&&(i=i||[]).push("style",n);var x=i;(t.updateQueue=x)&&(t.flags|=4)}},yu=function(e,t,n,r){n!==r&&(t.flags|=4)};function Ir(e,t){if(!Me)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function tt(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags&14680064,r|=l.flags&14680064,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Od(e,t,n){var r=t.pendingProps;switch(Qa(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return tt(t),null;case 1:return ot(t.type)&&gl(),tt(t),null;case 3:return r=t.stateNode,Xn(),_e(st),_e(Ze),ii(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(kl(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Et!==null&&(Ri(Et),Et=null))),bi(e,t),tt(t),null;case 5:li(t);var l=bn(Mr.current);if(n=t.type,e!==null&&t.stateNode!=null)xu(e,t,n,r,l),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(m(166));return tt(t),null}if(e=bn(It.current),kl(t)){r=t.stateNode,n=t.type;var i=t.memoizedProps;switch(r[Lt]=t,r[br]=i,e=(t.mode&1)!==0,n){case"dialog":Ee("cancel",r),Ee("close",r);break;case"iframe":case"object":case"embed":Ee("load",r);break;case"video":case"audio":for(l=0;l<jr.length;l++)Ee(jr[l],r);break;case"source":Ee("error",r);break;case"img":case"image":case"link":Ee("error",r),Ee("load",r);break;case"details":Ee("toggle",r);break;case"input":Ue(r,i),Ee("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},Ee("invalid",r);break;case"textarea":Ht(r,i),Ee("invalid",r)}aa(n,i),l=null;for(var s in i)if(i.hasOwnProperty(s)){var u=i[s];s==="children"?typeof u=="string"?r.textContent!==u&&(i.suppressHydrationWarning!==!0&&fl(r.textContent,u,e),l=["children",u]):typeof u=="number"&&r.textContent!==""+u&&(i.suppressHydrationWarning!==!0&&fl(r.textContent,u,e),l=["children",""+u]):I.hasOwnProperty(s)&&u!=null&&s==="onScroll"&&Ee("scroll",r)}switch(n){case"input":de(r),Je(r,i,!0);break;case"textarea":de(r),Fn(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=ml)}r=l,t.updateQueue=r,r!==null&&(t.flags|=4)}else{s=l.nodeType===9?l:l.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=gn(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=s.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=s.createElement(n,{is:r.is}):(e=s.createElement(n),n==="select"&&(s=e,r.multiple?s.multiple=!0:r.size&&(s.size=r.size))):e=s.createElementNS(e,n),e[Lt]=t,e[br]=r,vu(e,t,!1,!1),t.stateNode=e;e:{switch(s=ia(n,r),n){case"dialog":Ee("cancel",e),Ee("close",e),l=r;break;case"iframe":case"object":case"embed":Ee("load",e),l=r;break;case"video":case"audio":for(l=0;l<jr.length;l++)Ee(jr[l],e);l=r;break;case"source":Ee("error",e),l=r;break;case"img":case"image":case"link":Ee("error",e),Ee("load",e),l=r;break;case"details":Ee("toggle",e),l=r;break;case"input":Ue(e,r),l=ue(e,r),Ee("invalid",e);break;case"option":l=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},l=p({},r,{value:void 0}),Ee("invalid",e);break;case"textarea":Ht(e,r),l=mn(e,r),Ee("invalid",e);break;default:l=r}aa(n,l),u=l;for(i in u)if(u.hasOwnProperty(i)){var c=u[i];i==="style"?ss(e,c):i==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,c!=null&&ze(e,c)):i==="children"?typeof c=="string"?(n!=="textarea"||c!=="")&&xt(e,c):typeof c=="number"&&xt(e,""+c):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(I.hasOwnProperty(i)?c!=null&&i==="onScroll"&&Ee("scroll",e):c!=null&&y(e,i,c,s))}switch(n){case"input":de(e),Je(e,r,!1);break;case"textarea":de(e),Fn(e);break;case"option":r.value!=null&&e.setAttribute("value",""+U(r.value));break;case"select":e.multiple=!!r.multiple,i=r.value,i!=null?vt(e,!!r.multiple,i,!1):r.defaultValue!=null&&vt(e,!!r.multiple,r.defaultValue,!0);break;default:typeof l.onClick=="function"&&(e.onclick=ml)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return tt(t),null;case 6:if(e&&t.stateNode!=null)yu(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(m(166));if(n=bn(Mr.current),bn(It.current),kl(t)){if(r=t.stateNode,n=t.memoizedProps,r[Lt]=t,(i=r.nodeValue!==n)&&(e=mt,e!==null))switch(e.tag){case 3:fl(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&fl(r.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Lt]=t,t.stateNode=r}return tt(t),null;case 13:if(_e(Te),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(Me&&ht!==null&&(t.mode&1)!==0&&(t.flags&128)===0)jo(),Qn(),t.flags|=98560,i=!1;else if(i=kl(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(m(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(m(317));i[Lt]=t}else Qn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;tt(t),i=!1}else Et!==null&&(Ri(Et),Et=null),i=!0;if(!i)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Te.current&1)!==0?Ke===0&&(Ke=3):Oi())),t.updateQueue!==null&&(t.flags|=4),tt(t),null);case 4:return Xn(),bi(e,t),e===null&&Nr(t.stateNode.containerInfo),tt(t),null;case 10:return Za(t.type._context),tt(t),null;case 17:return ot(t.type)&&gl(),tt(t),null;case 19:if(_e(Te),i=t.memoizedState,i===null)return tt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Ir(i,!1);else{if(Ke!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=El(e),s!==null){for(t.flags|=128,Ir(i,!1),r=s.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)i=n,e=r,i.flags&=14680066,s=i.alternate,s===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=s.childLanes,i.lanes=s.lanes,i.child=s.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=s.memoizedProps,i.memoizedState=s.memoizedState,i.updateQueue=s.updateQueue,i.type=s.type,e=s.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return be(Te,Te.current&1|2),t.child}e=e.sibling}i.tail!==null&&Re()>tr&&(t.flags|=128,r=!0,Ir(i,!1),t.lanes=4194304)}else{if(!r)if(e=El(s),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Ir(i,!0),i.tail===null&&i.tailMode==="hidden"&&!s.alternate&&!Me)return tt(t),null}else 2*Re()-i.renderingStartTime>tr&&n!==1073741824&&(t.flags|=128,r=!0,Ir(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(n=i.last,n!==null?n.sibling=s:t.child=s,i.last=s)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=Re(),t.sibling=null,n=Te.current,be(Te,r?n&1|2:n&1),t):(tt(t),null);case 22:case 23:return Di(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(gt&1073741824)!==0&&(tt(t),t.subtreeFlags&6&&(t.flags|=8192)):tt(t),null;case 24:return null;case 25:return null}throw Error(m(156,t.tag))}function $d(e,t){switch(Qa(t),t.tag){case 1:return ot(t.type)&&gl(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Xn(),_e(st),_e(Ze),ii(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return li(t),null;case 13:if(_e(Te),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(m(340));Qn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return _e(Te),null;case 4:return Xn(),null;case 10:return Za(t.type._context),null;case 22:case 23:return Di(),null;case 24:return null;default:return null}}var Rl=!1,nt=!1,Bd=typeof WeakSet=="function"?WeakSet:Set,V=null;function Zn(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ie(e,t,r)}else n.current=null}function Ci(e,t,n){try{n()}catch(r){Ie(e,t,r)}}var wu=!1;function Ud(e,t){if(Da=nl,e=Xs(),Ma(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var l=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,u=-1,c=-1,x=0,N=0,S=e,j=null;t:for(;;){for(var O;S!==n||l!==0&&S.nodeType!==3||(u=s+l),S!==i||r!==0&&S.nodeType!==3||(c=s+r),S.nodeType===3&&(s+=S.nodeValue.length),(O=S.firstChild)!==null;)j=S,S=O;for(;;){if(S===e)break t;if(j===n&&++x===l&&(u=s),j===i&&++N===r&&(c=s),(O=S.nextSibling)!==null)break;S=j,j=S.parentNode}S=O}n=u===-1||c===-1?null:{start:u,end:c}}else n=null}n=n||{start:0,end:0}}else n=null;for(Oa={focusedElem:e,selectionRange:n},nl=!1,V=t;V!==null;)if(t=V,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,V=e;else for(;V!==null;){t=V;try{var K=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(K!==null){var W=K.memoizedProps,Ae=K.memoizedState,h=t.stateNode,f=h.getSnapshotBeforeUpdate(t.elementType===t.type?W:_t(t.type,W),Ae);h.__reactInternalSnapshotBeforeUpdate=f}break;case 3:var v=t.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(m(163))}}catch(_){Ie(t,t.return,_)}if(e=t.sibling,e!==null){e.return=t.return,V=e;break}V=t.return}return K=wu,wu=!1,K}function Rr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&e)===e){var i=l.destroy;l.destroy=void 0,i!==void 0&&Ci(t,n,i)}l=l.next}while(l!==r)}}function Al(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function Ei(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function ku(e){var t=e.alternate;t!==null&&(e.alternate=null,ku(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Lt],delete t[br],delete t[Va],delete t[Sd],delete t[bd])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function ju(e){return e.tag===5||e.tag===3||e.tag===4}function Nu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||ju(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function _i(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=ml));else if(r!==4&&(e=e.child,e!==null))for(_i(e,t,n),e=e.sibling;e!==null;)_i(e,t,n),e=e.sibling}function zi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(zi(e,t,n),e=e.sibling;e!==null;)zi(e,t,n),e=e.sibling}var qe=null,zt=!1;function sn(e,t,n){for(n=n.child;n!==null;)Su(e,t,n),n=n.sibling}function Su(e,t,n){if(Tt&&typeof Tt.onCommitFiberUnmount=="function")try{Tt.onCommitFiberUnmount(Yr,n)}catch{}switch(n.tag){case 5:nt||Zn(n,t);case 6:var r=qe,l=zt;qe=null,sn(e,t,n),qe=r,zt=l,qe!==null&&(zt?(e=qe,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):qe.removeChild(n.stateNode));break;case 18:qe!==null&&(zt?(e=qe,n=n.stateNode,e.nodeType===8?Ua(e.parentNode,n):e.nodeType===1&&Ua(e,n),mr(e)):Ua(qe,n.stateNode));break;case 4:r=qe,l=zt,qe=n.stateNode.containerInfo,zt=!0,sn(e,t,n),qe=r,zt=l;break;case 0:case 11:case 14:case 15:if(!nt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){l=r=r.next;do{var i=l,s=i.destroy;i=i.tag,s!==void 0&&((i&2)!==0||(i&4)!==0)&&Ci(n,t,s),l=l.next}while(l!==r)}sn(e,t,n);break;case 1:if(!nt&&(Zn(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(u){Ie(n,t,u)}sn(e,t,n);break;case 21:sn(e,t,n);break;case 22:n.mode&1?(nt=(r=nt)||n.memoizedState!==null,sn(e,t,n),nt=r):sn(e,t,n);break;default:sn(e,t,n)}}function bu(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Bd),t.forEach(function(r){var l=Xd.bind(null,e,r);n.has(r)||(n.add(r),r.then(l,l))})}}function Mt(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var l=n[r];try{var i=e,s=t,u=s;e:for(;u!==null;){switch(u.tag){case 5:qe=u.stateNode,zt=!1;break e;case 3:qe=u.stateNode.containerInfo,zt=!0;break e;case 4:qe=u.stateNode.containerInfo,zt=!0;break e}u=u.return}if(qe===null)throw Error(m(160));Su(i,s,l),qe=null,zt=!1;var c=l.alternate;c!==null&&(c.return=null),l.return=null}catch(x){Ie(l,t,x)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Cu(t,e),t=t.sibling}function Cu(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Mt(t,e),At(e),r&4){try{Rr(3,e,e.return),Al(3,e)}catch(W){Ie(e,e.return,W)}try{Rr(5,e,e.return)}catch(W){Ie(e,e.return,W)}}break;case 1:Mt(t,e),At(e),r&512&&n!==null&&Zn(n,n.return);break;case 5:if(Mt(t,e),At(e),r&512&&n!==null&&Zn(n,n.return),e.flags&32){var l=e.stateNode;try{xt(l,"")}catch(W){Ie(e,e.return,W)}}if(r&4&&(l=e.stateNode,l!=null)){var i=e.memoizedProps,s=n!==null?n.memoizedProps:i,u=e.type,c=e.updateQueue;if(e.updateQueue=null,c!==null)try{u==="input"&&i.type==="radio"&&i.name!=null&&Xe(l,i),ia(u,s);var x=ia(u,i);for(s=0;s<c.length;s+=2){var N=c[s],S=c[s+1];N==="style"?ss(l,S):N==="dangerouslySetInnerHTML"?ze(l,S):N==="children"?xt(l,S):y(l,N,S,x)}switch(u){case"input":We(l,i);break;case"textarea":hn(l,i);break;case"select":var j=l._wrapperState.wasMultiple;l._wrapperState.wasMultiple=!!i.multiple;var O=i.value;O!=null?vt(l,!!i.multiple,O,!1):j!==!!i.multiple&&(i.defaultValue!=null?vt(l,!!i.multiple,i.defaultValue,!0):vt(l,!!i.multiple,i.multiple?[]:"",!1))}l[br]=i}catch(W){Ie(e,e.return,W)}}break;case 6:if(Mt(t,e),At(e),r&4){if(e.stateNode===null)throw Error(m(162));l=e.stateNode,i=e.memoizedProps;try{l.nodeValue=i}catch(W){Ie(e,e.return,W)}}break;case 3:if(Mt(t,e),At(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{mr(t.containerInfo)}catch(W){Ie(e,e.return,W)}break;case 4:Mt(t,e),At(e);break;case 13:Mt(t,e),At(e),l=e.child,l.flags&8192&&(i=l.memoizedState!==null,l.stateNode.isHidden=i,!i||l.alternate!==null&&l.alternate.memoizedState!==null||(Fi=Re())),r&4&&bu(e);break;case 22:if(N=n!==null&&n.memoizedState!==null,e.mode&1?(nt=(x=nt)||N,Mt(t,e),nt=x):Mt(t,e),At(e),r&8192){if(x=e.memoizedState!==null,(e.stateNode.isHidden=x)&&!N&&(e.mode&1)!==0)for(V=e,N=e.child;N!==null;){for(S=V=N;V!==null;){switch(j=V,O=j.child,j.tag){case 0:case 11:case 14:case 15:Rr(4,j,j.return);break;case 1:Zn(j,j.return);var K=j.stateNode;if(typeof K.componentWillUnmount=="function"){r=j,n=j.return;try{t=r,K.props=t.memoizedProps,K.state=t.memoizedState,K.componentWillUnmount()}catch(W){Ie(r,n,W)}}break;case 5:Zn(j,j.return);break;case 22:if(j.memoizedState!==null){zu(S);continue}}O!==null?(O.return=j,V=O):zu(S)}N=N.sibling}e:for(N=null,S=e;;){if(S.tag===5){if(N===null){N=S;try{l=S.stateNode,x?(i=l.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(u=S.stateNode,c=S.memoizedProps.style,s=c!=null&&c.hasOwnProperty("display")?c.display:null,u.style.display=xn("display",s))}catch(W){Ie(e,e.return,W)}}}else if(S.tag===6){if(N===null)try{S.stateNode.nodeValue=x?"":S.memoizedProps}catch(W){Ie(e,e.return,W)}}else if((S.tag!==22&&S.tag!==23||S.memoizedState===null||S===e)&&S.child!==null){S.child.return=S,S=S.child;continue}if(S===e)break e;for(;S.sibling===null;){if(S.return===null||S.return===e)break e;N===S&&(N=null),S=S.return}N===S&&(N=null),S.sibling.return=S.return,S=S.sibling}}break;case 19:Mt(t,e),At(e),r&4&&bu(e);break;case 21:break;default:Mt(t,e),At(e)}}function At(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(ju(n)){var r=n;break e}n=n.return}throw Error(m(160))}switch(r.tag){case 5:var l=r.stateNode;r.flags&32&&(xt(l,""),r.flags&=-33);var i=Nu(e);zi(e,i,l);break;case 3:case 4:var s=r.stateNode.containerInfo,u=Nu(e);_i(e,u,s);break;default:throw Error(m(161))}}catch(c){Ie(e,e.return,c)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Vd(e,t,n){V=e,Eu(e)}function Eu(e,t,n){for(var r=(e.mode&1)!==0;V!==null;){var l=V,i=l.child;if(l.tag===22&&r){var s=l.memoizedState!==null||Rl;if(!s){var u=l.alternate,c=u!==null&&u.memoizedState!==null||nt;u=Rl;var x=nt;if(Rl=s,(nt=c)&&!x)for(V=l;V!==null;)s=V,c=s.child,s.tag===22&&s.memoizedState!==null?Mu(l):c!==null?(c.return=s,V=c):Mu(l);for(;i!==null;)V=i,Eu(i),i=i.sibling;V=l,Rl=u,nt=x}_u(e)}else(l.subtreeFlags&8772)!==0&&i!==null?(i.return=l,V=i):_u(e)}}function _u(e){for(;V!==null;){var t=V;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:nt||Al(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!nt)if(n===null)r.componentDidMount();else{var l=t.elementType===t.type?n.memoizedProps:_t(t.type,n.memoizedProps);r.componentDidUpdate(l,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&zo(t,i,r);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}zo(t,s,n)}break;case 5:var u=t.stateNode;if(n===null&&t.flags&4){n=u;var c=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":c.autoFocus&&n.focus();break;case"img":c.src&&(n.src=c.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var x=t.alternate;if(x!==null){var N=x.memoizedState;if(N!==null){var S=N.dehydrated;S!==null&&mr(S)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(m(163))}nt||t.flags&512&&Ei(t)}catch(j){Ie(t,t.return,j)}}if(t===e){V=null;break}if(n=t.sibling,n!==null){n.return=t.return,V=n;break}V=t.return}}function zu(e){for(;V!==null;){var t=V;if(t===e){V=null;break}var n=t.sibling;if(n!==null){n.return=t.return,V=n;break}V=t.return}}function Mu(e){for(;V!==null;){var t=V;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Al(4,t)}catch(c){Ie(t,n,c)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var l=t.return;try{r.componentDidMount()}catch(c){Ie(t,l,c)}}var i=t.return;try{Ei(t)}catch(c){Ie(t,i,c)}break;case 5:var s=t.return;try{Ei(t)}catch(c){Ie(t,s,c)}}}catch(c){Ie(t,t.return,c)}if(t===e){V=null;break}var u=t.sibling;if(u!==null){u.return=t.return,V=u;break}V=t.return}}var Kd=Math.ceil,Dl=Z.ReactCurrentDispatcher,Mi=Z.ReactCurrentOwner,Nt=Z.ReactCurrentBatchConfig,ve=0,Qe=null,Be=null,Ye=0,gt=0,er=tn(0),Ke=0,Ar=null,En=0,Ol=0,Pi=0,Dr=null,ct=null,Fi=0,tr=1/0,Wt=null,$l=!1,Ti=null,on=null,Bl=!1,un=null,Ul=0,Or=0,Li=null,Vl=-1,Kl=0;function lt(){return(ve&6)!==0?Re():Vl!==-1?Vl:Vl=Re()}function cn(e){return(e.mode&1)===0?1:(ve&2)!==0&&Ye!==0?Ye&-Ye:Ed.transition!==null?(Kl===0&&(Kl=js()),Kl):(e=ke,e!==0||(e=window.event,e=e===void 0?16:Ps(e.type)),e)}function Pt(e,t,n,r){if(50<Or)throw Or=0,Li=null,Error(m(185));ur(e,n,r),((ve&2)===0||e!==Qe)&&(e===Qe&&((ve&2)===0&&(Ol|=n),Ke===4&&dn(e,Ye)),dt(e,r),n===1&&ve===0&&(t.mode&1)===0&&(tr=Re()+500,xl&&rn()))}function dt(e,t){var n=e.callbackNode;Ec(e,t);var r=Zr(e,e===Qe?Ye:0);if(r===0)n!==null&&ys(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&ys(n),t===1)e.tag===0?Cd(Fu.bind(null,e)):vo(Fu.bind(null,e)),jd(function(){(ve&6)===0&&rn()}),n=null;else{switch(Ns(r)){case 1:n=fa;break;case 4:n=ws;break;case 16:n=qr;break;case 536870912:n=ks;break;default:n=qr}n=$u(n,Pu.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Pu(e,t){if(Vl=-1,Kl=0,(ve&6)!==0)throw Error(m(327));var n=e.callbackNode;if(nr()&&e.callbackNode!==n)return null;var r=Zr(e,e===Qe?Ye:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=Wl(e,r);else{t=r;var l=ve;ve|=2;var i=Lu();(Qe!==e||Ye!==t)&&(Wt=null,tr=Re()+500,zn(e,t));do try{Qd();break}catch(u){Tu(e,u)}while(!0);Ja(),Dl.current=i,ve=l,Be!==null?t=0:(Qe=null,Ye=0,t=Ke)}if(t!==0){if(t===2&&(l=ma(e),l!==0&&(r=l,t=Ii(e,l))),t===1)throw n=Ar,zn(e,0),dn(e,r),dt(e,Re()),n;if(t===6)dn(e,r);else{if(l=e.current.alternate,(r&30)===0&&!Wd(l)&&(t=Wl(e,r),t===2&&(i=ma(e),i!==0&&(r=i,t=Ii(e,i))),t===1))throw n=Ar,zn(e,0),dn(e,r),dt(e,Re()),n;switch(e.finishedWork=l,e.finishedLanes=r,t){case 0:case 1:throw Error(m(345));case 2:Mn(e,ct,Wt);break;case 3:if(dn(e,r),(r&130023424)===r&&(t=Fi+500-Re(),10<t)){if(Zr(e,0)!==0)break;if(l=e.suspendedLanes,(l&r)!==r){lt(),e.pingedLanes|=e.suspendedLanes&l;break}e.timeoutHandle=Ba(Mn.bind(null,e,ct,Wt),t);break}Mn(e,ct,Wt);break;case 4:if(dn(e,r),(r&4194240)===r)break;for(t=e.eventTimes,l=-1;0<r;){var s=31-bt(r);i=1<<s,s=t[s],s>l&&(l=s),r&=~i}if(r=l,r=Re()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Kd(r/1960))-r,10<r){e.timeoutHandle=Ba(Mn.bind(null,e,ct,Wt),r);break}Mn(e,ct,Wt);break;case 5:Mn(e,ct,Wt);break;default:throw Error(m(329))}}}return dt(e,Re()),e.callbackNode===n?Pu.bind(null,e):null}function Ii(e,t){var n=Dr;return e.current.memoizedState.isDehydrated&&(zn(e,t).flags|=256),e=Wl(e,t),e!==2&&(t=ct,ct=n,t!==null&&Ri(t)),e}function Ri(e){ct===null?ct=e:ct.push.apply(ct,e)}function Wd(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var l=n[r],i=l.getSnapshot;l=l.value;try{if(!Ct(i(),l))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function dn(e,t){for(t&=~Pi,t&=~Ol,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-bt(t),r=1<<n;e[n]=-1,t&=~r}}function Fu(e){if((ve&6)!==0)throw Error(m(327));nr();var t=Zr(e,0);if((t&1)===0)return dt(e,Re()),null;var n=Wl(e,t);if(e.tag!==0&&n===2){var r=ma(e);r!==0&&(t=r,n=Ii(e,r))}if(n===1)throw n=Ar,zn(e,0),dn(e,t),dt(e,Re()),n;if(n===6)throw Error(m(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Mn(e,ct,Wt),dt(e,Re()),null}function Ai(e,t){var n=ve;ve|=1;try{return e(t)}finally{ve=n,ve===0&&(tr=Re()+500,xl&&rn())}}function _n(e){un!==null&&un.tag===0&&(ve&6)===0&&nr();var t=ve;ve|=1;var n=Nt.transition,r=ke;try{if(Nt.transition=null,ke=1,e)return e()}finally{ke=r,Nt.transition=n,ve=t,(ve&6)===0&&rn()}}function Di(){gt=er.current,_e(er)}function zn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,kd(n)),Be!==null)for(n=Be.return;n!==null;){var r=n;switch(Qa(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&gl();break;case 3:Xn(),_e(st),_e(Ze),ii();break;case 5:li(r);break;case 4:Xn();break;case 13:_e(Te);break;case 19:_e(Te);break;case 10:Za(r.type._context);break;case 22:case 23:Di()}n=n.return}if(Qe=e,Be=e=pn(e.current,null),Ye=gt=t,Ke=0,Ar=null,Pi=Ol=En=0,ct=Dr=null,Sn!==null){for(t=0;t<Sn.length;t++)if(n=Sn[t],r=n.interleaved,r!==null){n.interleaved=null;var l=r.next,i=n.pending;if(i!==null){var s=i.next;i.next=l,r.next=s}n.pending=r}Sn=null}return e}function Tu(e,t){do{var n=Be;try{if(Ja(),_l.current=Fl,zl){for(var r=Le.memoizedState;r!==null;){var l=r.queue;l!==null&&(l.pending=null),r=r.next}zl=!1}if(Cn=0,He=Ve=Le=null,Pr=!1,Fr=0,Mi.current=null,n===null||n.return===null){Ke=1,Ar=t,Be=null;break}e:{var i=e,s=n.return,u=n,c=t;if(t=Ye,u.flags|=32768,c!==null&&typeof c=="object"&&typeof c.then=="function"){var x=c,N=u,S=N.tag;if((N.mode&1)===0&&(S===0||S===11||S===15)){var j=N.alternate;j?(N.updateQueue=j.updateQueue,N.memoizedState=j.memoizedState,N.lanes=j.lanes):(N.updateQueue=null,N.memoizedState=null)}var O=lu(s);if(O!==null){O.flags&=-257,au(O,s,u,i,t),O.mode&1&&ru(i,x,t),t=O,c=x;var K=t.updateQueue;if(K===null){var W=new Set;W.add(c),t.updateQueue=W}else K.add(c);break e}else{if((t&1)===0){ru(i,x,t),Oi();break e}c=Error(m(426))}}else if(Me&&u.mode&1){var Ae=lu(s);if(Ae!==null){(Ae.flags&65536)===0&&(Ae.flags|=256),au(Ae,s,u,i,t),Ya(Jn(c,u));break e}}i=c=Jn(c,u),Ke!==4&&(Ke=2),Dr===null?Dr=[i]:Dr.push(i),i=s;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var h=tu(i,c,t);_o(i,h);break e;case 1:u=c;var f=i.type,v=i.stateNode;if((i.flags&128)===0&&(typeof f.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(on===null||!on.has(v)))){i.flags|=65536,t&=-t,i.lanes|=t;var _=nu(i,u,t);_o(i,_);break e}}i=i.return}while(i!==null)}Ru(n)}catch(H){t=H,Be===n&&n!==null&&(Be=n=n.return);continue}break}while(!0)}function Lu(){var e=Dl.current;return Dl.current=Fl,e===null?Fl:e}function Oi(){(Ke===0||Ke===3||Ke===2)&&(Ke=4),Qe===null||(En&268435455)===0&&(Ol&268435455)===0||dn(Qe,Ye)}function Wl(e,t){var n=ve;ve|=2;var r=Lu();(Qe!==e||Ye!==t)&&(Wt=null,zn(e,t));do try{Hd();break}catch(l){Tu(e,l)}while(!0);if(Ja(),ve=n,Dl.current=r,Be!==null)throw Error(m(261));return Qe=null,Ye=0,Ke}function Hd(){for(;Be!==null;)Iu(Be)}function Qd(){for(;Be!==null&&!xc();)Iu(Be)}function Iu(e){var t=Ou(e.alternate,e,gt);e.memoizedProps=e.pendingProps,t===null?Ru(e):Be=t,Mi.current=null}function Ru(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Od(n,t,gt),n!==null){Be=n;return}}else{if(n=$d(n,t),n!==null){n.flags&=32767,Be=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Ke=6,Be=null;return}}if(t=t.sibling,t!==null){Be=t;return}Be=t=e}while(t!==null);Ke===0&&(Ke=5)}function Mn(e,t,n){var r=ke,l=Nt.transition;try{Nt.transition=null,ke=1,Gd(e,t,n,r)}finally{Nt.transition=l,ke=r}return null}function Gd(e,t,n,r){do nr();while(un!==null);if((ve&6)!==0)throw Error(m(327));n=e.finishedWork;var l=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(m(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(_c(e,i),e===Qe&&(Be=Qe=null,Ye=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Bl||(Bl=!0,$u(qr,function(){return nr(),null})),i=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||i){i=Nt.transition,Nt.transition=null;var s=ke;ke=1;var u=ve;ve|=4,Mi.current=null,Ud(e,n),Cu(n,e),md(Oa),nl=!!Da,Oa=Da=null,e.current=n,Vd(n),yc(),ve=u,ke=s,Nt.transition=i}else e.current=n;if(Bl&&(Bl=!1,un=e,Ul=l),i=e.pendingLanes,i===0&&(on=null),jc(n.stateNode),dt(e,Re()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)l=t[n],r(l.value,{componentStack:l.stack,digest:l.digest});if($l)throw $l=!1,e=Ti,Ti=null,e;return(Ul&1)!==0&&e.tag!==0&&nr(),i=e.pendingLanes,(i&1)!==0?e===Li?Or++:(Or=0,Li=e):Or=0,rn(),null}function nr(){if(un!==null){var e=Ns(Ul),t=Nt.transition,n=ke;try{if(Nt.transition=null,ke=16>e?16:e,un===null)var r=!1;else{if(e=un,un=null,Ul=0,(ve&6)!==0)throw Error(m(331));var l=ve;for(ve|=4,V=e.current;V!==null;){var i=V,s=i.child;if((V.flags&16)!==0){var u=i.deletions;if(u!==null){for(var c=0;c<u.length;c++){var x=u[c];for(V=x;V!==null;){var N=V;switch(N.tag){case 0:case 11:case 15:Rr(8,N,i)}var S=N.child;if(S!==null)S.return=N,V=S;else for(;V!==null;){N=V;var j=N.sibling,O=N.return;if(ku(N),N===x){V=null;break}if(j!==null){j.return=O,V=j;break}V=O}}}var K=i.alternate;if(K!==null){var W=K.child;if(W!==null){K.child=null;do{var Ae=W.sibling;W.sibling=null,W=Ae}while(W!==null)}}V=i}}if((i.subtreeFlags&2064)!==0&&s!==null)s.return=i,V=s;else e:for(;V!==null;){if(i=V,(i.flags&2048)!==0)switch(i.tag){case 0:case 11:case 15:Rr(9,i,i.return)}var h=i.sibling;if(h!==null){h.return=i.return,V=h;break e}V=i.return}}var f=e.current;for(V=f;V!==null;){s=V;var v=s.child;if((s.subtreeFlags&2064)!==0&&v!==null)v.return=s,V=v;else e:for(s=f;V!==null;){if(u=V,(u.flags&2048)!==0)try{switch(u.tag){case 0:case 11:case 15:Al(9,u)}}catch(H){Ie(u,u.return,H)}if(u===s){V=null;break e}var _=u.sibling;if(_!==null){_.return=u.return,V=_;break e}V=u.return}}if(ve=l,rn(),Tt&&typeof Tt.onPostCommitFiberRoot=="function")try{Tt.onPostCommitFiberRoot(Yr,e)}catch{}r=!0}return r}finally{ke=n,Nt.transition=t}}return!1}function Au(e,t,n){t=Jn(n,t),t=tu(e,t,1),e=an(e,t,1),t=lt(),e!==null&&(ur(e,1,t),dt(e,t))}function Ie(e,t,n){if(e.tag===3)Au(e,e,n);else for(;t!==null;){if(t.tag===3){Au(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(on===null||!on.has(r))){e=Jn(n,e),e=nu(t,e,1),t=an(t,e,1),e=lt(),t!==null&&(ur(t,1,e),dt(t,e));break}}t=t.return}}function qd(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=lt(),e.pingedLanes|=e.suspendedLanes&n,Qe===e&&(Ye&n)===n&&(Ke===4||Ke===3&&(Ye&130023424)===Ye&&500>Re()-Fi?zn(e,0):Pi|=n),dt(e,t)}function Du(e,t){t===0&&((e.mode&1)===0?t=1:(t=Jr,Jr<<=1,(Jr&130023424)===0&&(Jr=4194304)));var n=lt();e=Ut(e,t),e!==null&&(ur(e,t,n),dt(e,n))}function Yd(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Du(e,n)}function Xd(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(m(314))}r!==null&&r.delete(t),Du(e,n)}var Ou;Ou=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||st.current)ut=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return ut=!1,Dd(e,t,n);ut=(e.flags&131072)!==0}else ut=!1,Me&&(t.flags&1048576)!==0&&xo(t,wl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Il(e,t),e=t.pendingProps;var l=Kn(t,Ze.current);Yn(t,n),l=ui(null,t,r,e,l,n);var i=ci();return t.flags|=1,typeof l=="object"&&l!==null&&typeof l.render=="function"&&l.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,ot(r)?(i=!0,vl(t)):i=!1,t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,ni(t),l.updater=Tl,t.stateNode=l,l._reactInternals=t,gi(t,r,e,n),t=wi(null,t,r,!0,i,n)):(t.tag=0,Me&&i&&Ha(t),rt(null,t,l,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Il(e,t),e=t.pendingProps,l=r._init,r=l(r._payload),t.type=r,l=t.tag=Zd(r),e=_t(r,e),l){case 0:t=yi(null,t,r,e,n);break e;case 1:t=du(null,t,r,e,n);break e;case 11:t=iu(null,t,r,e,n);break e;case 14:t=su(null,t,r,_t(r.type,e),n);break e}throw Error(m(306,r,""))}return t;case 0:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),yi(e,t,r,l,n);case 1:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),du(e,t,r,l,n);case 3:e:{if(pu(t),e===null)throw Error(m(387));r=t.pendingProps,i=t.memoizedState,l=i.element,Eo(e,t),Cl(t,r,null,n);var s=t.memoizedState;if(r=s.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){l=Jn(Error(m(423)),t),t=fu(e,t,r,n,l);break e}else if(r!==l){l=Jn(Error(m(424)),t),t=fu(e,t,r,n,l);break e}else for(ht=en(t.stateNode.containerInfo.firstChild),mt=t,Me=!0,Et=null,n=bo(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Qn(),r===l){t=Kt(e,t,n);break e}rt(e,t,r,n)}t=t.child}return t;case 5:return Mo(t),e===null&&qa(t),r=t.type,l=t.pendingProps,i=e!==null?e.memoizedProps:null,s=l.children,$a(r,l)?s=null:i!==null&&$a(r,i)&&(t.flags|=32),cu(e,t),rt(e,t,s,n),t.child;case 6:return e===null&&qa(t),null;case 13:return mu(e,t,n);case 4:return ri(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Gn(t,null,r,n):rt(e,t,r,n),t.child;case 11:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),iu(e,t,r,l,n);case 7:return rt(e,t,t.pendingProps,n),t.child;case 8:return rt(e,t,t.pendingProps.children,n),t.child;case 12:return rt(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,l=t.pendingProps,i=t.memoizedProps,s=l.value,be(Nl,r._currentValue),r._currentValue=s,i!==null)if(Ct(i.value,s)){if(i.children===l.children&&!st.current){t=Kt(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var u=i.dependencies;if(u!==null){s=i.child;for(var c=u.firstContext;c!==null;){if(c.context===r){if(i.tag===1){c=Vt(-1,n&-n),c.tag=2;var x=i.updateQueue;if(x!==null){x=x.shared;var N=x.pending;N===null?c.next=c:(c.next=N.next,N.next=c),x.pending=c}}i.lanes|=n,c=i.alternate,c!==null&&(c.lanes|=n),ei(i.return,n,t),u.lanes|=n;break}c=c.next}}else if(i.tag===10)s=i.type===t.type?null:i.child;else if(i.tag===18){if(s=i.return,s===null)throw Error(m(341));s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),ei(s,n,t),s=i.sibling}else s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===t){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}rt(e,t,l.children,n),t=t.child}return t;case 9:return l=t.type,r=t.pendingProps.children,Yn(t,n),l=kt(l),r=r(l),t.flags|=1,rt(e,t,r,n),t.child;case 14:return r=t.type,l=_t(r,t.pendingProps),l=_t(r.type,l),su(e,t,r,l,n);case 15:return ou(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),Il(e,t),t.tag=1,ot(r)?(e=!0,vl(t)):e=!1,Yn(t,n),Zo(t,r,l),gi(t,r,l,n),wi(null,t,r,!0,e,n);case 19:return gu(e,t,n);case 22:return uu(e,t,n)}throw Error(m(156,t.tag))};function $u(e,t){return xs(e,t)}function Jd(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function St(e,t,n,r){return new Jd(e,t,n,r)}function $i(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Zd(e){if(typeof e=="function")return $i(e)?1:0;if(e!=null){if(e=e.$$typeof,e===se)return 11;if(e===De)return 14}return 2}function pn(e,t){var n=e.alternate;return n===null?(n=St(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Hl(e,t,n,r,l,i){var s=2;if(r=e,typeof e=="function")$i(e)&&(s=1);else if(typeof e=="string")s=5;else e:switch(e){case xe:return Pn(n.children,l,i,t);case Ce:s=8,l|=8;break;case le:return e=St(12,n,t,l|2),e.elementType=le,e.lanes=i,e;case ge:return e=St(13,n,t,l),e.elementType=ge,e.lanes=i,e;case Fe:return e=St(19,n,t,l),e.elementType=Fe,e.lanes=i,e;case Se:return Ql(n,l,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case me:s=10;break e;case Pe:s=9;break e;case se:s=11;break e;case De:s=14;break e;case Oe:s=16,r=null;break e}throw Error(m(130,e==null?e:typeof e,""))}return t=St(s,n,t,l),t.elementType=e,t.type=r,t.lanes=i,t}function Pn(e,t,n,r){return e=St(7,e,r,t),e.lanes=n,e}function Ql(e,t,n,r){return e=St(22,e,r,t),e.elementType=Se,e.lanes=n,e.stateNode={isHidden:!1},e}function Bi(e,t,n){return e=St(6,e,null,t),e.lanes=n,e}function Ui(e,t,n){return t=St(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function ep(e,t,n,r,l){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ha(0),this.expirationTimes=ha(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ha(0),this.identifierPrefix=r,this.onRecoverableError=l,this.mutableSourceEagerHydrationData=null}function Vi(e,t,n,r,l,i,s,u,c){return e=new ep(e,t,n,u,c),t===1?(t=1,i===!0&&(t|=8)):t=0,i=St(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},ni(i),e}function tp(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:je,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Bu(e){if(!e)return nn;e=e._reactInternals;e:{if(yn(e)!==e||e.tag!==1)throw Error(m(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(ot(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(m(171))}if(e.tag===1){var n=e.type;if(ot(n))return ho(e,n,t)}return t}function Uu(e,t,n,r,l,i,s,u,c){return e=Vi(n,r,!0,e,l,i,s,u,c),e.context=Bu(null),n=e.current,r=lt(),l=cn(n),i=Vt(r,l),i.callback=t??null,an(n,i,l),e.current.lanes=l,ur(e,l,r),dt(e,r),e}function Gl(e,t,n,r){var l=t.current,i=lt(),s=cn(l);return n=Bu(n),t.context===null?t.context=n:t.pendingContext=n,t=Vt(i,s),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=an(l,t,s),e!==null&&(Pt(e,l,s,i),bl(e,l,s)),s}function ql(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Vu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Ki(e,t){Vu(e,t),(e=e.alternate)&&Vu(e,t)}function np(){return null}var Ku=typeof reportError=="function"?reportError:function(e){console.error(e)};function Wi(e){this._internalRoot=e}Yl.prototype.render=Wi.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(m(409));Gl(e,t,null,null)},Yl.prototype.unmount=Wi.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;_n(function(){Gl(null,e,null,null)}),t[Dt]=null}};function Yl(e){this._internalRoot=e}Yl.prototype.unstable_scheduleHydration=function(e){if(e){var t=Cs();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Xt.length&&t!==0&&t<Xt[n].priority;n++);Xt.splice(n,0,e),n===0&&zs(e)}};function Hi(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Xl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Wu(){}function rp(e,t,n,r,l){if(l){if(typeof r=="function"){var i=r;r=function(){var x=ql(s);i.call(x)}}var s=Uu(t,r,e,0,null,!1,!1,"",Wu);return e._reactRootContainer=s,e[Dt]=s.current,Nr(e.nodeType===8?e.parentNode:e),_n(),s}for(;l=e.lastChild;)e.removeChild(l);if(typeof r=="function"){var u=r;r=function(){var x=ql(c);u.call(x)}}var c=Vi(e,0,!1,null,null,!1,!1,"",Wu);return e._reactRootContainer=c,e[Dt]=c.current,Nr(e.nodeType===8?e.parentNode:e),_n(function(){Gl(t,c,n,r)}),c}function Jl(e,t,n,r,l){var i=n._reactRootContainer;if(i){var s=i;if(typeof l=="function"){var u=l;l=function(){var c=ql(s);u.call(c)}}Gl(t,s,e,l)}else s=rp(n,t,e,l,r);return ql(s)}Ss=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=or(t.pendingLanes);n!==0&&(ga(t,n|1),dt(t,Re()),(ve&6)===0&&(tr=Re()+500,rn()))}break;case 13:_n(function(){var r=Ut(e,1);if(r!==null){var l=lt();Pt(r,e,1,l)}}),Ki(e,1)}},va=function(e){if(e.tag===13){var t=Ut(e,134217728);if(t!==null){var n=lt();Pt(t,e,134217728,n)}Ki(e,134217728)}},bs=function(e){if(e.tag===13){var t=cn(e),n=Ut(e,t);if(n!==null){var r=lt();Pt(n,e,t,r)}Ki(e,t)}},Cs=function(){return ke},Es=function(e,t){var n=ke;try{return ke=e,t()}finally{ke=n}},ua=function(e,t,n){switch(t){case"input":if(We(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var l=hl(r);if(!l)throw Error(m(90));Ne(r),We(r,l)}}}break;case"textarea":hn(e,n);break;case"select":t=n.value,t!=null&&vt(e,!!n.multiple,t,!1)}},ds=Ai,ps=_n;var lp={usingClientEntryPoint:!1,Events:[Cr,Un,hl,us,cs,Ai]},$r={findFiberByHostInstance:wn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ap={bundleType:$r.bundleType,version:$r.version,rendererPackageName:$r.rendererPackageName,rendererConfig:$r.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Z.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=gs(e),e===null?null:e.stateNode},findFiberByHostInstance:$r.findFiberByHostInstance||np,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Zl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Zl.isDisabled&&Zl.supportsFiber)try{Yr=Zl.inject(ap),Tt=Zl}catch{}}return pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=lp,pt.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Hi(t))throw Error(m(200));return tp(e,t,null,n)},pt.createRoot=function(e,t){if(!Hi(e))throw Error(m(299));var n=!1,r="",l=Ku;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=Vi(e,1,!1,null,null,n,!1,r,l),e[Dt]=t.current,Nr(e.nodeType===8?e.parentNode:e),new Wi(t)},pt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(m(188)):(e=Object.keys(e).join(","),Error(m(268,e)));return e=gs(t),e=e===null?null:e.stateNode,e},pt.flushSync=function(e){return _n(e)},pt.hydrate=function(e,t,n){if(!Xl(t))throw Error(m(200));return Jl(null,e,t,!0,n)},pt.hydrateRoot=function(e,t,n){if(!Hi(e))throw Error(m(405));var r=n!=null&&n.hydratedSources||null,l=!1,i="",s=Ku;if(n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=Uu(t,null,e,1,n??null,l,!1,i,s),e[Dt]=t.current,Nr(e),r)for(e=0;e<r.length;e++)n=r[e],l=n._getVersion,l=l(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,l]:t.mutableSourceEagerHydrationData.push(n,l);return new Yl(t)},pt.render=function(e,t,n){if(!Xl(t))throw Error(m(200));return Jl(null,e,t,!1,n)},pt.unmountComponentAtNode=function(e){if(!Xl(e))throw Error(m(40));return e._reactRootContainer?(_n(function(){Jl(null,null,e,!1,function(){e._reactRootContainer=null,e[Dt]=null})}),!0):!1},pt.unstable_batchedUpdates=Ai,pt.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Xl(n))throw Error(m(200));if(e==null||e._reactInternals===void 0)throw Error(m(38));return Jl(e,t,n,!1,r)},pt.version="18.3.1-next-f1338f8080-20240426",pt}var Zu;function lc(){if(Zu)return qi.exports;Zu=1;function d(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(d)}catch(k){console.error(k)}}return d(),qi.exports=fp(),qi.exports}var ec;function mp(){if(ec)return ea;ec=1;var d=lc();return ea.createRoot=d.createRoot,ea.hydrateRoot=d.hydrateRoot,ea}var hp=mp();const gp=rc(hp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vp=d=>d.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ac=(...d)=>d.filter((k,m,b)=>!!k&&k.trim()!==""&&b.indexOf(k)===m).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var xp={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yp=P.forwardRef(({color:d="currentColor",size:k=24,strokeWidth:m=2,absoluteStrokeWidth:b,className:I="",children:R,iconNode:$,...Q},D)=>P.createElement("svg",{ref:D,...xp,width:k,height:k,stroke:d,strokeWidth:b?Number(m)*24/Number(k):m,className:ac("lucide",I),...Q},[...$.map(([q,G])=>P.createElement(q,G)),...Array.isArray(R)?R:[R]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=(d,k)=>{const m=P.forwardRef(({className:b,...I},R)=>P.createElement(yp,{ref:R,iconNode:k,className:ac(`lucide-${vp(d)}`,b),...I}));return m.displayName=`${d}`,m};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wp=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],kp=fe("ArrowLeftRight",wp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jp=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Zi=fe("Check",jp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Np=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],na=fe("CircleAlert",Np);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],rr=fe("CircleCheck",Sp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],tc=fe("Clock",bp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cp=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],ic=fe("Copy",Cp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ep=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],es=fe("Database",Ep);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _p=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],ns=fe("Download",_p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zp=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],Mp=fe("ExternalLink",zp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pp=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Fp=fe("Eye",Pp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tp=[["path",{d:"M10 12v-1",key:"v7bkov"}],["path",{d:"M10 18v-2",key:"1cjy8d"}],["path",{d:"M10 7V6",key:"dljcrl"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01",key:"gkbcor"}],["circle",{cx:"10",cy:"20",r:"2",key:"1xzdoj"}]],Lp=fe("FileArchive",Tp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ip=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],lr=fe("FileCode",Ip);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rp=[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]],Ap=fe("Filter",Rp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dp=[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]],Op=fe("Gauge",Dp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $p=[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M13 6h3a2 2 0 0 1 2 2v7",key:"1yeb86"}],["path",{d:"M11 18H8a2 2 0 0 1-2-2V9",key:"19pyzm"}]],ta=fe("GitCompare",$p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Up=fe("Info",Bp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vp=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],rs=fe("KeyRound",Vp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kp=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],Wp=fe("Layers",Kp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hp=[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]],Qp=fe("MessageSquare",Hp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gp=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],qp=fe("Pause",Gp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yp=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],Xp=fe("PenLine",Yp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jp=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],Zp=fe("Play",Jp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ef=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Ur=fe("Plus",ef);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tf=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],ra=fe("RefreshCw",tf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nf=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],rf=fe("RotateCcw",nf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lf=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],af=fe("Save",lf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sf=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],of=fe("Search",sf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uf=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],cf=fe("Settings",uf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const df=[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]],pf=fe("SlidersVertical",df);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ff=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],Vr=fe("Sparkles",ff);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mf=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],Ji=fe("Star",mf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hf=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],la=fe("Trash2",hf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gf=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],sc=fe("Volume2",gf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vf=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],xf=fe("VolumeX",vf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yf=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]],wf=fe("WandSparkles",yf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kf=[["path",{d:"M12.8 19.6A2 2 0 1 0 14 16H2",key:"148xed"}],["path",{d:"M17.5 8a2.5 2.5 0 1 1 2 4H2",key:"1u4tom"}],["path",{d:"M9.8 4.4A2 2 0 1 1 11 8H2",key:"75valh"}]],jf=fe("Wind",kf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nf=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ls=fe("X",Nf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sf=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],oc=fe("Zap",Sf),bf=({activeTab:d,onSelectTab:k,onOpenSettings:m,config:b,datasetCount:I})=>{var $,Q;const R=(b==null?void 0:b.poolSize)||(b!=null&&b.isKeyConfigured?1:0);return a.jsxs("header",{className:"navbar-root",children:[a.jsxs("div",{className:"navbar-container",children:[a.jsxs("div",{className:"navbar-brand",onClick:()=>k("api"),style:{cursor:"pointer"},children:[a.jsxs("div",{className:"brand-icon-wrapper",children:[a.jsx("span",{className:"brand-flag-badge",children:"Kurdish"}),a.jsx("div",{className:"brand-logo-icon",children:"🎙️"})]}),a.jsxs("div",{children:[a.jsxs("div",{className:"brand-title",children:[a.jsx("span",{className:"text-gradient",children:"Kurdish TTS"})," Studio"]}),a.jsx("div",{className:"brand-subtitle",children:"ElevenLabs Multi-Key Generator & Kurdish Dataset Engine"})]})]}),a.jsxs("nav",{className:"navbar-nav",children:[a.jsxs("button",{id:"nav-tab-api",className:`nav-tab-btn ${d==="api"?"active":""}`,onClick:()=>k("api"),children:[a.jsx(Vr,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Speech Generation"})]}),a.jsxs("button",{id:"nav-tab-dataset",className:`nav-tab-btn ${d==="dataset"?"active":""}`,onClick:()=>k("dataset"),children:[a.jsx(es,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Dataset Manager"}),I>0&&a.jsx("span",{className:"nav-count-badge",children:I})]}),a.jsxs("button",{id:"nav-tab-compare",className:`nav-tab-btn ${d==="compare"?"active":""}`,onClick:()=>k("compare"),children:[a.jsx(ta,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Compare & Evaluate"})]})]}),a.jsxs("div",{className:"navbar-actions",children:[a.jsx("button",{className:`api-status-pill ${b!=null&&b.keyValid?"status-valid":"status-warning"}`,onClick:m,title:b!=null&&b.keyValid?`Key Pool Active: ${R} keys configured with automatic failover`:"Configure ElevenLabs API Keys",children:b!=null&&b.keyValid?a.jsxs(a.Fragment,{children:[a.jsx(rr,{size:15,className:"status-icon"}),a.jsx("span",{className:"status-text",children:R>1?`${R} Keys (Failover On)`:`1 Key (${((Q=($=b.userInfo)==null?void 0:$.tier)==null?void 0:Q.toUpperCase())||"Ready"})`})]}):a.jsxs(a.Fragment,{children:[a.jsx(na,{size:15,className:"status-icon"}),a.jsx("span",{className:"status-text",children:"Add API Keys"})]})}),a.jsx("button",{id:"btn-open-settings",className:"btn btn-secondary btn-icon",onClick:m,title:"Multi-Key Pool & Settings",children:a.jsx(rs,{size:18})})]})]}),a.jsx("style",{children:`
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
      `})]})},Cf=({toasts:d,onDismiss:k})=>a.jsxs("div",{className:"toast-container",children:[d.map(m=>a.jsx(Ef,{toast:m,onDismiss:k},m.id)),a.jsx("style",{children:`
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
      `})]}),Ef=({toast:d,onDismiss:k})=>(P.useEffect(()=>{const m=setTimeout(()=>{k(d.id)},d.duration||4500);return()=>clearTimeout(m)},[d,k]),a.jsxs("div",{className:`toast-item toast-${d.type}`,children:[a.jsxs("div",{className:"toast-icon",children:[d.type==="success"&&a.jsx(rr,{size:18}),d.type==="error"&&a.jsx(na,{size:18}),d.type==="info"&&a.jsx(Up,{size:18})]}),a.jsxs("div",{className:"toast-content",children:[a.jsx("div",{className:"toast-title",children:d.title}),d.message&&a.jsx("div",{className:"toast-desc",children:d.message})]}),a.jsx("button",{className:"toast-close",onClick:()=>k(d.id),children:a.jsx(ls,{size:14})})]}));var uc=lc();const Ft="/api";async function cc(){const d=await fetch(`${Ft}/config`);if(!d.ok)throw new Error("Failed to fetch system configuration");return await d.json()}async function _f(){const d=await fetch(`${Ft}/config/keys`),k=await d.json();if(!d.ok)throw new Error(k.error||"Failed to fetch key pool");return k}async function dc(d){const k=await fetch(`${Ft}/config/keys`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:d})}),m=await k.json();if(!k.ok)throw new Error(m.error||"Failed to add key to pool");return m}async function zf(d){const k=await fetch(`${Ft}/config/keys/${d}`,{method:"DELETE"}),m=await k.json();if(!k.ok)throw new Error(m.error||"Failed to delete key");return m}async function Mf(){const d=await fetch(`${Ft}/voices`),k=await d.json();if(!d.ok)throw new Error(k.error||"Failed to fetch voices");return k.voices||[]}async function Pf(){const d=await fetch(`${Ft}/models`),k=await d.json();if(!d.ok)throw new Error(k.error||"Failed to fetch models");return k.models||[]}async function Ff(d){const k=await fetch(`${Ft}/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}),m=await k.json();if(!k.ok)throw new Error(m.error||"Failed to generate speech");return m}async function Tf(){const d=await fetch(`${Ft}/dataset`),k=await d.json();if(!d.ok)throw new Error(k.error||"Failed to fetch dataset");return k.samples||[]}async function Kr(d,k){const m=await fetch(`${Ft}/dataset/${encodeURIComponent(d)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(k)}),b=await m.json();if(!m.ok)throw new Error(b.error||"Failed to update sample");return b.sample}async function Lf(d){const k=await fetch(`${Ft}/dataset/${encodeURIComponent(d)}`,{method:"DELETE"}),m=await k.json();if(!k.ok)throw new Error(m.error||"Failed to delete sample")}function If(){return`${Ft}/dataset/export/zip`}const Rf=({config:d,onClose:k,onConfigUpdated:m})=>{const[b,I]=P.useState([]),[R,$]=P.useState(null),[Q,D]=P.useState(""),[q,G]=P.useState(!0),[C,L]=P.useState(!1),[re,he]=P.useState(null),[Y,w]=P.useState(null);P.useEffect(()=>{B()},[]);const B=async()=>{G(!0);try{const le=await _f();I(le.keys||[]),$(le);const me=await cc().catch(()=>null);me&&m(me)}catch(le){console.warn("Failed to load key pool:",le.message)}finally{G(!1)}},ie=async le=>{if(le.preventDefault(),!!Q.trim()){L(!0),w(null);try{const me=await dc(Q.trim());w({success:!0,message:me.message||"API key validated and added to pool!"}),D(""),await B()}catch(me){w({success:!1,message:me.message||"Invalid ElevenLabs API Key"})}finally{L(!1)}}},y=async le=>{he(le),w(null);try{await zf(le),await B()}catch(me){w({success:!1,message:me.message||"Failed to remove key"})}finally{he(null)}},Z=b.reduce((le,me)=>le+(me.characterLimit||0),0),we=b.reduce((le,me)=>le+(me.characterCount||0),0),je=(R==null?void 0:R.totalRemainingCharacters)??Math.max(0,Z-we),xe=Z>0?Math.min(100,Math.round(we/Z*100)):0,Ce=a.jsxs("div",{className:"modal-backdrop",onClick:k,children:[a.jsxs("div",{className:"modal-container settings-modal-box",onClick:le=>le.stopPropagation(),children:[a.jsxs("div",{className:"modal-header",children:[a.jsxs("div",{className:"modal-title-group",children:[a.jsx(rs,{size:22,className:"text-cyan"}),a.jsxs("div",{children:[a.jsx("div",{className:"modal-title",children:"Multi-API Key Pool & Failover"}),a.jsx("div",{className:"modal-subtitle",children:"Add multiple ElevenLabs accounts with automatic quota failover"})]})]}),a.jsx("button",{className:"btn-ghost btn-icon",onClick:k,title:"Close Settings",children:a.jsx(ls,{size:18})})]}),a.jsxs("div",{className:"settings-body",children:[a.jsxs("div",{className:"pool-summary-card",children:[a.jsxs("div",{className:"summary-left",children:[a.jsxs("div",{className:"summary-title-row",children:[a.jsx("span",{className:"summary-title",children:"Key Pool Health"}),a.jsxs("span",{className:"badge badge-emerald",children:[a.jsx(oc,{size:12}),a.jsx("span",{children:"Auto-Failover Active"})]})]}),a.jsxs("div",{className:"summary-stats",children:[a.jsxs("span",{children:[a.jsx("strong",{children:b.filter(le=>le.status==="ready").length})," of ",a.jsx("strong",{children:b.length})," keys ready"]}),a.jsx("span",{className:"stat-dot",children:"•"}),a.jsxs("span",{children:[a.jsx("strong",{children:je.toLocaleString()})," chars available"]})]})]}),a.jsxs("button",{className:"btn btn-secondary btn-sm refresh-pool-btn",onClick:B,disabled:q,title:"Refresh quota status for all keys",children:[a.jsx(ra,{size:13,className:q?"spin":""}),a.jsx("span",{children:"Refresh"})]})]}),b.length>0&&Z>0&&a.jsxs("div",{className:"quota-meter-box",children:[a.jsxs("div",{className:"quota-labels",children:[a.jsx("span",{children:"Combined Pool Quota"}),a.jsxs("span",{children:[xe,"% (",we.toLocaleString()," / ",Z.toLocaleString()," used)"]})]}),a.jsx("div",{className:"meter-track",children:a.jsx("div",{className:"meter-fill",style:{width:`${xe}%`}})})]}),a.jsxs("div",{className:"keys-section",children:[a.jsxs("div",{className:"section-label",children:["Configured API Keys in Pool (",b.length,")"]}),q?a.jsxs("div",{className:"loading-keys-state",children:[a.jsx(ra,{size:18,className:"spin text-cyan"}),a.jsx("span",{children:"Checking API key statuses and character quotas..."})]}):b.length===0?a.jsxs("div",{className:"empty-keys-box",children:[a.jsx(na,{size:24,className:"text-amber"}),a.jsxs("div",{children:[a.jsx("div",{className:"empty-title",children:"No API Keys Configured"}),a.jsx("div",{className:"empty-desc",children:"Add one or more ElevenLabs API keys below to enable speech generation."})]})]}):a.jsx("div",{className:"keys-list",children:b.map((le,me)=>{const Pe=le.characterCount||0,se=le.characterLimit||1e4,ge=se>0?Math.min(100,Math.round(Pe/se*100)):0,Fe=me===0;return a.jsxs("div",{className:`key-card ${le.status==="exhausted"?"key-exhausted":""}`,children:[a.jsxs("div",{className:"key-card-header",children:[a.jsxs("div",{className:"key-info-left",children:[a.jsxs("div",{className:"key-index-badge",children:["#",me+1]}),a.jsx("code",{className:"key-masked",children:le.maskedKey}),Fe&&a.jsx("span",{className:"badge badge-cyan",children:"Primary"}),a.jsx("span",{className:`badge ${le.isValid?"badge-emerald":"badge-rose"}`,children:le.tier?le.tier.toUpperCase():"KEY"})]}),a.jsxs("div",{className:"key-card-actions",children:[le.status==="exhausted"?a.jsx("span",{className:"badge badge-amber",children:"Exhausted (Auto-Skipped)"}):le.isValid?a.jsx("span",{className:"badge badge-emerald",children:"Ready"}):a.jsx("span",{className:"badge badge-rose",children:"Invalid"}),a.jsx("button",{type:"button",className:"btn-danger-icon",onClick:()=>y(me),disabled:re===me,title:"Remove this key from pool",children:a.jsx(la,{size:15})})]})]}),le.isValid&&a.jsxs("div",{className:"key-quota-row",children:[a.jsxs("div",{className:"key-quota-meta",children:[a.jsxs("span",{children:[le.remainingCharacters.toLocaleString()," chars remaining"]}),a.jsxs("span",{children:[Pe.toLocaleString()," / ",se.toLocaleString()]})]}),a.jsx("div",{className:"meter-track-mini",children:a.jsx("div",{className:`meter-fill ${ge>90?"meter-fill-warn":""}`,style:{width:`${ge}%`}})})]}),le.error&&a.jsx("div",{className:"key-error-msg",children:le.error})]},le.id||me)})})]}),a.jsxs("div",{className:"add-key-card",children:[a.jsxs("div",{className:"add-key-header",children:[a.jsx(Ur,{size:16,className:"text-cyan"}),a.jsx("span",{className:"add-key-title",children:"Add Another ElevenLabs API Key to Pool"})]}),a.jsxs("form",{onSubmit:ie,className:"add-key-form-inner",children:[a.jsxs("div",{className:"key-form-row",children:[a.jsx("input",{type:"password",className:"input-control key-input-field",placeholder:"Paste ElevenLabs xi-api-key here (e.g. sk_...)",value:Q,onChange:le=>D(le.target.value),id:"add-api-key-input",disabled:C}),a.jsxs("button",{type:"submit",className:"btn btn-primary add-key-submit-btn",disabled:C||!Q.trim(),children:[a.jsx(Ur,{size:16}),a.jsx("span",{children:C?"Validating...":"Add Key"})]})]}),Y&&a.jsxs("div",{className:`feedback-alert ${Y.success?"feedback-success":"feedback-error"}`,children:[Y.success?a.jsx(rr,{size:16}):a.jsx(na,{size:16}),a.jsx("span",{children:Y.message})]})]})]}),a.jsxs("div",{className:"tips-section",children:[a.jsx("div",{className:"tips-title",children:"⚡ How Multi-Key Auto-Failover Works:"}),a.jsxs("ul",{className:"tips-list",children:[a.jsx("li",{children:"You can add 2, 3, or more free/paid ElevenLabs accounts to this pool."}),a.jsxs("li",{children:["Generations automatically use the first ready key. If that key exhausts its quota (401/402/429), the engine ",a.jsx("strong",{children:"immediately switches to the next account"})," without failing your request."]}),a.jsxs("li",{children:["Keys are stored locally in your environment (",a.jsx("code",{children:".env"})," & ",a.jsx("code",{children:"keys.json"}),") and never exposed publicly."]})]})]})]}),a.jsxs("div",{className:"modal-footer",children:[a.jsxs("a",{href:"https://elevenlabs.io/app/settings/api-keys",target:"_blank",rel:"noreferrer",className:"btn btn-secondary btn-sm",children:[a.jsx("span",{children:"Get ElevenLabs Key"}),a.jsx(Mp,{size:13})]}),a.jsx("button",{className:"btn btn-primary btn-sm",onClick:k,children:"Done"})]})]}),a.jsx("style",{children:`
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
      `})]});return uc.createPortal(Ce,document.body)};var as={};(function d(k,m,b,I){var R=!!(k.Worker&&k.Blob&&k.Promise&&k.OffscreenCanvas&&k.OffscreenCanvasRenderingContext2D&&k.HTMLCanvasElement&&k.HTMLCanvasElement.prototype.transferControlToOffscreen&&k.URL&&k.URL.createObjectURL),$=typeof Path2D=="function"&&typeof DOMMatrix=="function",Q=(function(){if(!k.OffscreenCanvas)return!1;try{var p=new OffscreenCanvas(1,1),o=p.getContext("2d");o.fillRect(0,0,1,1);var g=p.transferToImageBitmap();o.createPattern(g,"no-repeat")}catch{return!1}return!0})();function D(){}function q(p){var o=m.exports.Promise,g=o!==void 0?o:k.Promise;return typeof g=="function"?new g(p):(p(D,D),null)}var G=(function(p,o){return{transform:function(g){if(p)return g;if(o.has(g))return o.get(g);var E=new OffscreenCanvas(g.width,g.height),z=E.getContext("2d");return z.drawImage(g,0,0),o.set(g,E),E},clear:function(){o.clear()}}})(Q,new Map),C=(function(){var p=Math.floor(16.666666666666668),o,g,E={},z=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(o=function(T){var A=Math.random();return E[A]=requestAnimationFrame(function M(U){z===U||z+p-1<U?(z=U,delete E[A],T()):E[A]=requestAnimationFrame(M)}),A},g=function(T){E[T]&&cancelAnimationFrame(E[T])}):(o=function(T){return setTimeout(T,p)},g=function(T){return clearTimeout(T)}),{frame:o,cancel:g}})(),L=(function(){var p,o,g={};function E(z){function T(A,M){z.postMessage({options:A||{},callback:M})}z.init=function(M){var U=M.transferControlToOffscreen();z.postMessage({canvas:U},[U])},z.fire=function(M,U,X){if(o)return T(M,null),o;var ce=Math.random().toString(36).slice(2);return o=q(function(de){function Ne(oe){oe.data.callback===ce&&(delete g[ce],z.removeEventListener("message",Ne),o=null,G.clear(),X(),de())}z.addEventListener("message",Ne),T(M,ce),g[ce]=Ne.bind(null,{data:{callback:ce}})}),o},z.reset=function(){z.postMessage({reset:!0});for(var M in g)g[M](),delete g[M]}}return function(){if(p)return p;if(!b&&R){var z=["var CONFETTI, SIZE = {}, module = {};","("+d.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{p=new Worker(URL.createObjectURL(new Blob([z])))}catch(T){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",T),null}E(p)}return p}})(),re={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function he(p,o){return o?o(p):p}function Y(p){return p!=null}function w(p,o,g){return he(p&&Y(p[o])?p[o]:re[o],g)}function B(p){return p<0?0:Math.floor(p)}function ie(p,o){return Math.floor(Math.random()*(o-p))+p}function y(p){return parseInt(p,16)}function Z(p){return p.map(we)}function we(p){var o=String(p).replace(/[^0-9a-f]/gi,"");return o.length<6&&(o=o[0]+o[0]+o[1]+o[1]+o[2]+o[2]),{r:y(o.substring(0,2)),g:y(o.substring(2,4)),b:y(o.substring(4,6))}}function je(p){var o=w(p,"origin",Object);return o.x=w(o,"x",Number),o.y=w(o,"y",Number),o}function xe(p){p.width=document.documentElement.clientWidth,p.height=document.documentElement.clientHeight}function Ce(p){var o=p.getBoundingClientRect();p.width=o.width,p.height=o.height}function le(p){var o=document.createElement("canvas");return o.style.position="fixed",o.style.top="0px",o.style.left="0px",o.style.pointerEvents="none",o.style.zIndex=p,o}function me(p,o,g,E,z,T,A,M,U){p.save(),p.translate(o,g),p.rotate(T),p.scale(E,z),p.arc(0,0,1,A,M,U),p.restore()}function Pe(p){var o=p.angle*(Math.PI/180),g=p.spread*(Math.PI/180);return{x:p.x,y:p.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:p.startVelocity*.5+Math.random()*p.startVelocity,angle2D:-o+(.5*g-Math.random()*g),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:p.color,shape:p.shape,tick:0,totalTicks:p.ticks,decay:p.decay,drift:p.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:p.gravity*3,ovalScalar:.6,scalar:p.scalar,flat:p.flat}}function se(p,o){o.x+=Math.cos(o.angle2D)*o.velocity+o.drift,o.y+=Math.sin(o.angle2D)*o.velocity+o.gravity,o.velocity*=o.decay,o.flat?(o.wobble=0,o.wobbleX=o.x+10*o.scalar,o.wobbleY=o.y+10*o.scalar,o.tiltSin=0,o.tiltCos=0,o.random=1):(o.wobble+=o.wobbleSpeed,o.wobbleX=o.x+10*o.scalar*Math.cos(o.wobble),o.wobbleY=o.y+10*o.scalar*Math.sin(o.wobble),o.tiltAngle+=.1,o.tiltSin=Math.sin(o.tiltAngle),o.tiltCos=Math.cos(o.tiltAngle),o.random=Math.random()+2);var g=o.tick++/o.totalTicks,E=o.x+o.random*o.tiltCos,z=o.y+o.random*o.tiltSin,T=o.wobbleX+o.random*o.tiltCos,A=o.wobbleY+o.random*o.tiltSin;if(p.fillStyle="rgba("+o.color.r+", "+o.color.g+", "+o.color.b+", "+(1-g)+")",p.beginPath(),$&&o.shape.type==="path"&&typeof o.shape.path=="string"&&Array.isArray(o.shape.matrix))p.fill(Se(o.shape.path,o.shape.matrix,o.x,o.y,Math.abs(T-E)*.1,Math.abs(A-z)*.1,Math.PI/10*o.wobble));else if(o.shape.type==="bitmap"){var M=Math.PI/10*o.wobble,U=Math.abs(T-E)*.1,X=Math.abs(A-z)*.1,ce=o.shape.bitmap.width*o.scalar,de=o.shape.bitmap.height*o.scalar,Ne=new DOMMatrix([Math.cos(M)*U,Math.sin(M)*U,-Math.sin(M)*X,Math.cos(M)*X,o.x,o.y]);Ne.multiplySelf(new DOMMatrix(o.shape.matrix));var oe=p.createPattern(G.transform(o.shape.bitmap),"no-repeat");oe.setTransform(Ne),p.globalAlpha=1-g,p.fillStyle=oe,p.fillRect(o.x-ce/2,o.y-de/2,ce,de),p.globalAlpha=1}else if(o.shape==="circle")p.ellipse?p.ellipse(o.x,o.y,Math.abs(T-E)*o.ovalScalar,Math.abs(A-z)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI):me(p,o.x,o.y,Math.abs(T-E)*o.ovalScalar,Math.abs(A-z)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI);else if(o.shape==="star")for(var ue=Math.PI/2*3,Ue=4*o.scalar,Xe=8*o.scalar,We=o.x,Je=o.y,at=5,$e=Math.PI/at;at--;)We=o.x+Math.cos(ue)*Xe,Je=o.y+Math.sin(ue)*Xe,p.lineTo(We,Je),ue+=$e,We=o.x+Math.cos(ue)*Ue,Je=o.y+Math.sin(ue)*Ue,p.lineTo(We,Je),ue+=$e;else p.moveTo(Math.floor(o.x),Math.floor(o.y)),p.lineTo(Math.floor(o.wobbleX),Math.floor(z)),p.lineTo(Math.floor(T),Math.floor(A)),p.lineTo(Math.floor(E),Math.floor(o.wobbleY));return p.closePath(),p.fill(),o.tick<o.totalTicks}function ge(p,o,g,E,z){var T=o.slice(),A=p.getContext("2d"),M,U,X=q(function(ce){function de(){M=U=null,A.clearRect(0,0,E.width,E.height),G.clear(),z(),ce()}function Ne(){b&&!(E.width===I.width&&E.height===I.height)&&(E.width=p.width=I.width,E.height=p.height=I.height),!E.width&&!E.height&&(g(p),E.width=p.width,E.height=p.height),A.clearRect(0,0,E.width,E.height),T=T.filter(function(oe){return se(A,oe)}),T.length?M=C.frame(Ne):de()}M=C.frame(Ne),U=de});return{addFettis:function(ce){return T=T.concat(ce),X},canvas:p,promise:X,reset:function(){M&&C.cancel(M),U&&U()}}}function Fe(p,o){var g=!p,E=!!w(o||{},"resize"),z=!1,T=w(o,"disableForReducedMotion",Boolean),A=R&&!!w(o||{},"useWorker"),M=A?L():null,U=g?xe:Ce,X=p&&M?!!p.__confetti_initialized:!1,ce=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,de;function Ne(ue,Ue,Xe){for(var We=w(ue,"particleCount",B),Je=w(ue,"angle",Number),at=w(ue,"spread",Number),$e=w(ue,"startVelocity",Number),vt=w(ue,"decay",Number),mn=w(ue,"gravity",Number),Ht=w(ue,"drift",Number),hn=w(ue,"colors",Z),Fn=w(ue,"ticks",Number),gn=w(ue,"shapes"),vn=w(ue,"scalar"),ee=!!w(ue,"flat"),ze=je(ue),xt=We,it=[],Qt=p.width*ze.x,xn=p.height*ze.y;xt--;)it.push(Pe({x:Qt,y:xn,angle:Je,spread:at,startVelocity:$e,color:hn[xt%hn.length],shape:gn[ie(0,gn.length)],ticks:Fn,decay:vt,gravity:mn,drift:Ht,scalar:vn,flat:ee}));return de?de.addFettis(it):(de=ge(p,it,U,Ue,Xe),de.promise)}function oe(ue){var Ue=T||w(ue,"disableForReducedMotion",Boolean),Xe=w(ue,"zIndex",Number);if(Ue&&ce)return q(function($e){$e()});g&&de?p=de.canvas:g&&!p&&(p=le(Xe),document.body.appendChild(p)),E&&!X&&U(p);var We={width:p.width,height:p.height};M&&!X&&M.init(p),X=!0,M&&(p.__confetti_initialized=!0);function Je(){if(M){var $e={getBoundingClientRect:function(){if(!g)return p.getBoundingClientRect()}};U($e),M.postMessage({resize:{width:$e.width,height:$e.height}});return}We.width=We.height=null}function at(){de=null,E&&(z=!1,k.removeEventListener("resize",Je)),g&&p&&(document.body.contains(p)&&document.body.removeChild(p),p=null,X=!1)}return E&&!z&&(z=!0,k.addEventListener("resize",Je,!1)),M?M.fire(ue,We,at):Ne(ue,We,at)}return oe.reset=function(){M&&M.reset(),de&&de.reset()},oe}var De;function Oe(){return De||(De=Fe(null,{useWorker:!0,resize:!0})),De}function Se(p,o,g,E,z,T,A){var M=new Path2D(p),U=new Path2D;U.addPath(M,new DOMMatrix(o));var X=new Path2D;return X.addPath(U,new DOMMatrix([Math.cos(A)*z,Math.sin(A)*z,-Math.sin(A)*T,Math.cos(A)*T,g,E])),X}function F(p){if(!$)throw new Error("path confetti are not supported in this browser");var o,g;typeof p=="string"?o=p:(o=p.path,g=p.matrix);var E=new Path2D(o),z=document.createElement("canvas"),T=z.getContext("2d");if(!g){for(var A=1e3,M=A,U=A,X=0,ce=0,de,Ne,oe=0;oe<A;oe+=2)for(var ue=0;ue<A;ue+=2)T.isPointInPath(E,oe,ue,"nonzero")&&(M=Math.min(M,oe),U=Math.min(U,ue),X=Math.max(X,oe),ce=Math.max(ce,ue));de=X-M,Ne=ce-U;var Ue=10,Xe=Math.min(Ue/de,Ue/Ne);g=[Xe,0,0,Xe,-Math.round(de/2+M)*Xe,-Math.round(Ne/2+U)*Xe]}return{type:"path",path:o,matrix:g}}function J(p){var o,g=1,E="#000000",z='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof p=="string"?o=p:(o=p.text,g="scalar"in p?p.scalar:g,z="fontFamily"in p?p.fontFamily:z,E="color"in p?p.color:E);var T=10*g,A=""+T+"px "+z,M=new OffscreenCanvas(T,T),U=M.getContext("2d");U.font=A;var X=U.measureText(o),ce=Math.ceil(X.actualBoundingBoxRight+X.actualBoundingBoxLeft),de=Math.ceil(X.actualBoundingBoxAscent+X.actualBoundingBoxDescent),Ne=2,oe=X.actualBoundingBoxLeft+Ne,ue=X.actualBoundingBoxAscent+Ne;ce+=Ne+Ne,de+=Ne+Ne,M=new OffscreenCanvas(ce,de),U=M.getContext("2d"),U.font=A,U.fillStyle=E,U.fillText(o,oe,ue);var Ue=1/g;return{type:"bitmap",bitmap:M.transferToImageBitmap(),matrix:[Ue,0,0,Ue,-ce*Ue/2,-de*Ue/2]}}m.exports=function(){return Oe().apply(this,arguments)},m.exports.reset=function(){Oe().reset()},m.exports.create=Fe,m.exports.shapeFromPath=F,m.exports.shapeFromText=J})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),as,!1);const Af=as.exports;as.exports.create;const Df=[{title:"Happy with Laughs",emotion:"laugh",text:"سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش ڕوویدا."},{title:"Whisper Secret",emotion:"whisper",text:"[whisper] گوێ بگرە، ئەمە نهێنییەکی زۆر گەورەیە."},{title:"Angry Question",emotion:"angry",text:"ئەمە چییە؟ [angry] بۆچی هەمیشە ئەمە ڕوودەدات؟"},{title:"Multi-Emotions",emotion:"mixed",text:"سڵاو! [laugh] ئەمە زۆر خۆشە بەڵام [whisper] دەبێت زۆر هێمن بین."},{title:"Simple Greeting",emotion:"neutral",text:"سڵاو! چۆنی؟"}],Of=[{char:"ێ",name:"Ye bi ser"},{char:"ڕ",name:"Re giran"},{char:"ڵ",name:"Lam giran"},{char:"ڤ",name:"Ve"},{char:"ۆ",name:"O"},{char:"ئ",name:"Hamza"},{char:"ک",name:"Kaf"},{char:"ی",name:"Ye"},{char:"ە",name:"He / Ae"}],$f=[{tag:"[laugh]",label:"Laugh"},{tag:"[whisper]",label:"Whisper"},{tag:"[sigh]",label:"Sigh"},{tag:"[gasp]",label:"Gasp"},{tag:"[crying]",label:"Crying"},{tag:"[shouting]",label:"Shout"},{tag:"[angry]",label:"Angry"},{tag:"[happy]",label:"Happy"},{tag:"[giggle]",label:"Giggle"},{tag:"[excited]",label:"Excited"},{tag:"[cough]",label:"Cough"}],Bf=({value:d,onChange:k,label:m="Kurdish Text (Unicode / RTL)",placeholder:b="دەقی کوردی لێرە بنووسە... (کلیک لەسەر تاگەکانی [laugh] یان [whisper] بکە بۆ دانانیان لەناو دێڕەکەدا)",disabled:I=!1,onSelectPreset:R,showInlineTagToolbar:$=!0})=>{const Q=P.useRef(null),[D,q]=P.useState(""),G=y=>{const Z=Q.current;if(!Z){k((d||"")+y);return}const we=Z.selectionStart??d.length,je=Z.selectionEnd??d.length,xe=d.substring(0,we),Ce=d.substring(je),le=xe.length>0&&!xe.endsWith(" ")&&!xe.endsWith(`
`),me=Ce.length>0&&!Ce.startsWith(" ")&&!Ce.startsWith(`
`),Pe=`${le?" ":""}${y} `,se=xe+Pe+Ce;k(se),setTimeout(()=>{Z.focus();const ge=we+Pe.length;Z.setSelectionRange(ge,ge)},10)},C=()=>{if(!D.trim())return;let y=D.trim();y.startsWith("[")||(y=`[${y}`),y.endsWith("]")||(y=`${y}]`),G(y),q("")},L=y=>{G(y)},re=()=>{d&&navigator.clipboard.writeText(d)},he=d.replace(/\[([a-zA-Z0-9_\s-]+)\]/g,"").replace(/\s+/g," ").trim(),Y=d.match(/\[([a-zA-Z0-9_\s-]+)\]/g)||[],w={};Y.forEach(y=>{w[y]=(w[y]||0)+1});const B=he?he.split(/\s+/).length:0,ie=he.length;return a.jsxs("div",{className:"kurdish-editor-container",children:[a.jsxs("div",{className:"editor-header",children:[a.jsxs("div",{className:"editor-label-group",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:m}),a.jsx("span",{className:"badge badge-cyan",children:"Sorani UTF-8"}),Y.length>0&&a.jsxs("span",{className:"badge badge-emerald",children:[Y.length," Tag",Y.length>1?"s":""," in Text"]})]}),a.jsx("div",{className:"editor-actions",children:d&&a.jsxs(a.Fragment,{children:[a.jsxs("button",{type:"button",className:"aux-btn",onClick:re,title:"Copy Kurdish text to clipboard",children:[a.jsx(ic,{size:13}),a.jsx("span",{children:"Copy"})]}),a.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>k(""),title:"Clear text",children:[a.jsx(la,{size:13}),a.jsx("span",{children:"Clear"})]})]})})]}),R&&a.jsxs("div",{className:"presets-bar",children:[a.jsxs("div",{className:"presets-title",children:[a.jsx(Vr,{size:12}),a.jsx("span",{children:"Presets:"})]}),a.jsx("div",{className:"presets-list",children:Df.map((y,Z)=>a.jsx("button",{type:"button",className:"preset-pill",onClick:()=>R(y.text,y.emotion),title:y.text,children:y.title},Z))})]}),$&&a.jsxs("div",{className:"inline-tags-bar",children:[a.jsxs("div",{className:"tags-bar-header",children:[a.jsx(wf,{size:13,className:"text-cyan"}),a.jsx("span",{children:"Click to Insert Audio Tag at Cursor:"})]}),a.jsxs("div",{className:"inline-tags-list",children:[$f.map(y=>a.jsx("button",{type:"button",className:"inline-tag-chip",onClick:()=>G(y.tag),title:`Click to insert ${y.tag} (click multiple times for repeated tags)`,disabled:I,children:a.jsx("code",{children:y.tag})},y.tag)),a.jsxs("div",{className:"custom-tag-mini-box",children:[a.jsx("input",{type:"text",className:"custom-tag-mini-input",placeholder:"custom tag...",value:D,onChange:y=>q(y.target.value),onKeyDown:y=>{y.key==="Enter"&&(y.preventDefault(),C())}}),a.jsx("button",{type:"button",className:"custom-tag-mini-btn",onClick:C,title:"Insert custom tag",disabled:!D.trim(),children:a.jsx(Ur,{size:12})})]})]})]}),a.jsx("div",{className:"textarea-wrapper",children:a.jsx("textarea",{ref:Q,dir:"rtl",lang:"ckb",className:"textarea-control textarea-kurdish",value:d,onChange:y=>k(y.target.value),placeholder:b,disabled:I,rows:4,id:"kurdish-text-input"})}),Y.length>0&&a.jsxs("div",{className:"tags-detected-banner",children:[a.jsxs("div",{className:"detected-chips-row",children:[a.jsx("span",{className:"detected-label",children:"Active Speech Tags:"}),Object.entries(w).map(([y,Z])=>a.jsxs("span",{className:"tag-count-pill",children:[a.jsx("code",{children:y}),Z>1&&a.jsxs("span",{className:"pill-count",children:["×",Z]})]},y))]}),a.jsxs("div",{className:"clean-transcript-row",dir:"rtl",children:[a.jsx("span",{className:"clean-label",children:"Saved in JSON (Clean Unicode):"}),a.jsx("span",{className:"kurdish-text clean-text-val",children:he||"(Empty)"})]})]}),a.jsxs("div",{className:"editor-footer",children:[a.jsxs("div",{className:"keyboard-helper",children:[a.jsx("span",{className:"helper-label",children:"Kurdish Chars:"}),a.jsx("div",{className:"char-buttons",children:Of.map(y=>a.jsx("button",{type:"button",className:"char-btn",onClick:()=>L(y.char),title:`Insert ${y.name} (${y.char})`,children:y.char},y.char))})]}),a.jsxs("div",{className:"editor-stats",children:[a.jsxs("span",{children:[B," words"]}),a.jsx("span",{className:"stats-divider",children:"•"}),a.jsxs("span",{children:[ie," clean chars"]})]})]}),a.jsx("style",{children:`
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
      `})]})},Wr=({src:d,sampleId:k,autoPlay:m=!1,onEnded:b,onTimeUpdate:I,showDownload:R=!0})=>{const $=P.useRef(null),[Q,D]=P.useState(!1),[q,G]=P.useState(0),[C,L]=P.useState(0),[re,he]=P.useState(1),[Y,w]=P.useState(!1),[B,ie]=P.useState(1);P.useEffect(()=>{$.current&&($.current.playbackRate=re)},[re]),P.useEffect(()=>{D(!1),G(0)},[d]);const y=()=>{$.current&&(Q?($.current.pause(),D(!1)):$.current.play().then(()=>{D(!0)}).catch(se=>{console.error("Audio play error:",se)}))},Z=()=>{if(!$.current)return;const se=$.current.currentTime;G(se),I&&I(se)},we=()=>{$.current&&L($.current.duration||0)},je=se=>{const ge=parseFloat(se.target.value);G(ge),$.current&&($.current.currentTime=ge)},xe=()=>{if(!$.current)return;const se=!Y;w(se),$.current.muted=se},Ce=()=>{const se=[.75,1,1.25,1.5],ge=(se.indexOf(re)+1)%se.length;he(se[ge])},le=()=>{$.current&&($.current.currentTime=0,G(0),$.current.play(),D(!0))},me=se=>{if(isNaN(se)||se<0)return"0:00";const ge=Math.floor(se/60),Fe=Math.floor(se%60);return`${ge}:${Fe<10?"0":""}${Fe}`},Pe=C>0?q/C*100:0;return a.jsxs("div",{className:"audio-player-card",children:[a.jsx("audio",{ref:$,src:d,autoPlay:m,onTimeUpdate:Z,onLoadedMetadata:we,onEnded:()=>{D(!1),b&&b()}}),a.jsxs("div",{className:"audio-player-main",children:[a.jsx("button",{className:`player-play-btn ${Q?"playing":""}`,onClick:y,"aria-label":Q?"Pause":"Play",children:Q?a.jsx(qp,{size:20}):a.jsx(Zp,{size:20,style:{marginLeft:2}})}),a.jsxs("div",{className:"player-track-container",children:[a.jsx("div",{className:"player-waveform-bg",children:Array.from({length:32}).map((se,ge)=>{const Fe=ge/32*100<=Pe,De=20+Math.sin(ge*.6)*15+Math.cos(ge*1.2)*10;return a.jsx("div",{className:`waveform-bar ${Fe?"active":""}`,style:{height:`${Math.max(15,De)}%`}},ge)})}),a.jsx("input",{type:"range",min:"0",max:C||100,step:"0.01",value:q,onChange:je,className:"player-seek-slider"})]}),a.jsxs("div",{className:"player-time-badge",children:[a.jsx("span",{children:me(q)}),a.jsx("span",{className:"time-separator",children:"/"}),a.jsx("span",{children:me(C)})]})]}),a.jsxs("div",{className:"audio-player-aux",children:[a.jsxs("div",{className:"aux-left",children:[a.jsx("button",{className:"aux-btn",onClick:le,title:"Replay from start",children:a.jsx(rf,{size:14})}),a.jsxs("button",{className:"aux-btn speed-badge",onClick:Ce,title:"Change Speed",children:[a.jsx(Op,{size:13}),a.jsxs("span",{children:[re,"x"]})]}),a.jsx("button",{className:"aux-btn",onClick:xe,title:Y?"Unmute":"Mute",children:Y?a.jsx(xf,{size:14}):a.jsx(sc,{size:14})})]}),R&&k&&a.jsxs("a",{href:`/api/dataset/${k}/download/wav`,download:`${k}.wav`,className:"aux-btn download-btn",title:"Download Audio (WAV)",children:[a.jsx(ns,{size:14}),a.jsx("span",{children:"WAV"})]})]}),a.jsx("style",{children:`
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
      `})]})},Uf=({alignment:d,currentTime:k=0,onSeekTime:m})=>{const[b,I]=P.useState("chars");if(!d||!d.characters||d.characters.length===0)return a.jsxs("div",{className:"alignment-empty-state",children:[a.jsx(tc,{size:16,className:"text-dim"}),a.jsx("span",{children:"No timing/alignment metadata returned for this generation."})]});const R=d.characters,$=d.character_start_times_seconds||[],Q=d.character_end_times_seconds||[];return a.jsxs("div",{className:"alignment-root",children:[a.jsxs("div",{className:"alignment-header",children:[a.jsxs("div",{className:"alignment-title",children:[a.jsx(tc,{size:15,className:"text-cyan"}),a.jsxs("span",{children:["ElevenLabs Character Alignment (",R.length," characters)"]})]}),a.jsxs("div",{className:"alignment-toggle",children:[a.jsxs("button",{className:`toggle-pill ${b==="chars"?"active":""}`,onClick:()=>I("chars"),children:[a.jsx(Fp,{size:12}),a.jsx("span",{children:"Interactive"})]}),a.jsxs("button",{className:`toggle-pill ${b==="table"?"active":""}`,onClick:()=>I("table"),children:[a.jsx(Wp,{size:12}),a.jsx("span",{children:"Data"})]})]})]}),b==="chars"?a.jsx("div",{className:"alignment-chars-stream",dir:"rtl",children:R.map((D,q)=>{const G=$[q]??0,C=Q[q]??G+.05,L=k>=G&&k<=C,re=k>C;return a.jsxs("span",{className:`align-char-chip ${L?"active":""} ${re?"passed":""}`,onClick:()=>m&&m(G),title:`${D} (${G.toFixed(2)}s - ${C.toFixed(2)}s)`,children:[D===" "?" ":D,a.jsxs("span",{className:"char-timestamp",children:[G.toFixed(2),"s"]})]},q)})}):a.jsx("div",{className:"alignment-table-wrapper",children:a.jsxs("table",{className:"alignment-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"#"}),a.jsx("th",{children:"Char"}),a.jsx("th",{children:"Start (s)"}),a.jsx("th",{children:"End (s)"}),a.jsx("th",{children:"Duration (ms)"})]})}),a.jsx("tbody",{children:R.map((D,q)=>{const G=$[q]??0,C=Q[q]??0,L=Math.round((C-G)*1e3);return a.jsxs("tr",{onClick:()=>m&&m(G),style:{cursor:"pointer"},children:[a.jsx("td",{children:q+1}),a.jsx("td",{className:"kurdish-cell",children:D}),a.jsx("td",{children:G.toFixed(3)}),a.jsx("td",{children:C.toFixed(3)}),a.jsxs("td",{children:[L,"ms"]})]},q)})})]})}),a.jsx("style",{children:`
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
      `})]})},Vf=[{key:"naturalness",label:"Naturalness",desc:"Human-like cadence, flow, and pacing"},{key:"emotion",label:"Emotion Expression",desc:"Accuracy of intended emotional delivery"},{key:"pronunciation",label:"Pronunciation",desc:"Accuracy of Kurdish Sorani vowels & consonants"},{key:"overall",label:"Overall Quality",desc:"Suitability for Kurdish TTS dataset"}],Hr=({ratings:d,onSaveRatings:k,compact:m=!1})=>{const[b,I]=P.useState({naturalness:(d==null?void 0:d.naturalness)||0,emotion:(d==null?void 0:d.emotion)||0,pronunciation:(d==null?void 0:d.pronunciation)||0,overall:(d==null?void 0:d.overall)||0,notes:(d==null?void 0:d.notes)||""}),[R,$]=P.useState(!1),[Q,D]=P.useState(!1),q=(C,L)=>{const re={...b,[C]:L};I(re),m&&k(re)},G=async()=>{$(!0);try{await k(b),D(!0),setTimeout(()=>D(!1),2500)}finally{$(!1)}};return m?a.jsxs("div",{className:"compact-rating-root",children:[a.jsxs("div",{className:"compact-stars-row",children:[a.jsx("span",{className:"compact-label",children:"Overall:"}),[1,2,3,4,5].map(C=>a.jsx("button",{type:"button",className:`star-btn ${C<=(b.overall||0)?"filled":""}`,onClick:()=>q("overall",C),title:`${C} / 5`,children:a.jsx(Ji,{size:14})},C)),b.overall>0&&a.jsxs("span",{className:"score-num",children:["(",b.overall,"/5)"]})]}),a.jsx("style",{children:`
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
        `})]}):a.jsxs("div",{className:"rating-card",children:[a.jsxs("div",{className:"rating-header",children:[a.jsxs("div",{className:"rating-title-group",children:[a.jsx(Ji,{size:16,className:"text-amber"}),a.jsx("span",{className:"rating-card-title",children:"Dataset Quality Rating (1–5)"})]}),Q&&a.jsxs("span",{className:"save-badge",children:[a.jsx(Zi,{size:13}),a.jsx("span",{children:"Ratings Saved"})]})]}),a.jsx("div",{className:"criteria-grid",children:Vf.map(C=>{const L=b[C.key]||0;return a.jsxs("div",{className:"criteria-item",children:[a.jsxs("div",{className:"criteria-info",children:[a.jsx("span",{className:"criteria-name",children:C.label}),a.jsx("span",{className:"criteria-desc",children:C.desc})]}),a.jsx("div",{className:"stars-selector",children:[1,2,3,4,5].map(re=>a.jsxs("button",{type:"button",className:`star-pill ${re<=L?"active":""}`,onClick:()=>q(C.key,re),title:`${C.label}: ${re} Star${re>1?"s":""}`,children:[a.jsx(Ji,{size:15,fill:re<=L?"currentColor":"none"}),a.jsx("span",{children:re})]},re))})]},C.key)})}),a.jsxs("div",{className:"rating-notes-box",children:[a.jsxs("div",{className:"notes-label",children:[a.jsx(Qp,{size:13}),a.jsx("span",{children:"Linguistic Notes & Pronunciation Feedback:"})]}),a.jsx("textarea",{className:"input-control notes-textarea",value:b.notes||"",onChange:C=>I({...b,notes:C.target.value}),placeholder:"e.g. Kurdish vowels 'ێ' and 'ۆ' sounded natural, slight robot tone on angry inflection...",rows:2})]}),a.jsx("div",{className:"rating-footer",children:a.jsx("button",{type:"button",className:"btn btn-primary btn-sm",onClick:G,disabled:R,children:R?a.jsx("span",{children:"Saving..."}):a.jsxs(a.Fragment,{children:[a.jsx(Zi,{size:14}),a.jsx("span",{children:"Save Evaluation to JSON"})]})})}),a.jsx("style",{children:`
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
      `})]})},is=({sample:d,onClose:k,onSampleUpdated:m})=>{const[b,I]=P.useState(!1),[R,$]=P.useState(!1),[Q,D]=P.useState(d.emotion||"neutral"),[q,G]=P.useState(d.notes||""),[C,L]=P.useState(!1),re=JSON.stringify(d,null,2),he=()=>{navigator.clipboard.writeText(re),I(!0),setTimeout(()=>I(!1),2e3)},Y=async()=>{L(!0);try{const B=await Kr(d.id,{emotion:Q,notes:q});m(B),$(!1)}catch(B){alert(`Failed to save changes: ${B.message}`)}finally{L(!1)}},w=a.jsxs("div",{className:"modal-backdrop",onClick:k,children:[a.jsxs("div",{className:"modal-container",onClick:B=>B.stopPropagation(),children:[a.jsxs("div",{className:"modal-header",children:[a.jsxs("div",{className:"modal-title-group",children:[a.jsx(lr,{size:20,className:"text-cyan"}),a.jsxs("div",{children:[a.jsxs("div",{className:"modal-title",children:["Sample Metadata: ",d.id]}),a.jsxs("div",{className:"modal-subtitle",children:[d.json_filename," • ",d.method==="elevenlabs_api"?"API Generation":"Normal Website Workflow"]})]})]}),a.jsxs("div",{className:"modal-header-actions",children:[a.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:()=>$(!R),children:[a.jsx(Xp,{size:14}),a.jsx("span",{children:R?"Cancel Edit":"Edit Metadata"})]}),a.jsx("button",{className:"btn-ghost btn-icon",onClick:k,children:a.jsx(ls,{size:18})})]})]}),a.jsxs("div",{className:"kurdish-spotlight-card",children:[a.jsxs("div",{className:"spotlight-header",children:[a.jsx("span",{className:"spotlight-label",children:"Authoritative Kurdish Transcript (Unicode UTF-8)"}),a.jsxs("span",{className:"badge badge-emerald",children:[d.language.toUpperCase()," • ",d.script]})]}),a.jsx("div",{className:"kurdish-text kurdish-spotlight-body",dir:"rtl",children:d.text})]}),R&&a.jsxs("div",{className:"edit-metadata-form",children:[a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Emotion"}),a.jsxs("select",{className:"select-control",value:Q,onChange:B=>D(B.target.value),children:[a.jsx("option",{value:"neutral",children:"Neutral"}),a.jsx("option",{value:"happy",children:"Happy"}),a.jsx("option",{value:"sad",children:"Sad"}),a.jsx("option",{value:"angry",children:"Angry"}),a.jsx("option",{value:"excited",children:"Excited"}),a.jsx("option",{value:"whisper",children:"Whisper"}),a.jsx("option",{value:"laughing",children:"Laughing"}),a.jsx("option",{value:"custom",children:"Custom"})]})]}),a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Notes & Feedback"}),a.jsx("textarea",{className:"textarea-control",value:q,onChange:B=>G(B.target.value),rows:2})]}),a.jsxs("button",{className:"btn btn-primary btn-sm",onClick:Y,disabled:C,children:[a.jsx(af,{size:14}),a.jsx("span",{children:C?"Saving...":"Save Changes"})]})]}),a.jsxs("div",{className:"json-viewer-wrapper",children:[a.jsxs("div",{className:"json-viewer-header",children:[a.jsx("span",{className:"json-title",children:"Raw JSON Payload"}),a.jsxs("div",{className:"json-actions",children:[a.jsxs("button",{className:"aux-btn",onClick:he,children:[b?a.jsx(Zi,{size:13,className:"text-emerald"}):a.jsx(ic,{size:13}),a.jsx("span",{children:b?"Copied":"Copy JSON"})]}),a.jsxs("a",{href:`/api/dataset/${d.id}/download/json`,download:d.json_filename,className:"aux-btn",children:[a.jsx(ns,{size:13}),a.jsx("span",{children:"Download JSON"})]})]})]}),a.jsx("pre",{className:"json-code-block",children:re})]}),a.jsxs("div",{className:"modal-footer",children:[a.jsxs("div",{className:"modal-created-info",children:["Created: ",new Date(d.created_at).toLocaleString()]}),a.jsx("button",{className:"btn btn-secondary btn-sm",onClick:k,children:"Close"})]})]}),a.jsx("style",{children:`
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
      `})]});return uc.createPortal(w,document.body)},nc=[{value:"neutral",label:"Neutral",tag:"",color:"neutral",desc:"Standard baseline tone"},{value:"laughing",label:"Laughing",tag:"[laugh]",color:"laughing",desc:"Native v3 laughter & cheerful delivery"},{value:"happy",label:"Happy",tag:"[happy]",color:"happy",desc:"Joyful & upbeat inflection"},{value:"whisper",label:"Whisper",tag:"[whisper]",color:"whisper",desc:"Soft breathy whisper"},{value:"angry",label:"Angry",tag:"[angry]",color:"angry",desc:"Sharp, aggressive intensity"},{value:"sad",label:"Sad",tag:"[sad]",color:"sad",desc:"Melancholic, slower cadence"},{value:"excited",label:"Excited",tag:"[excited]",color:"excited",desc:"Energetic, dynamic pitch"},{value:"custom",label:"Custom Tag",tag:"[laugh]",color:"custom",desc:"User-defined audio tag prompt"}],Kf=({config:d,onOpenSettings:k,onSampleCreated:m,addToast:b,onConfigUpdated:I})=>{const[R,$]=P.useState("سڵاو! [laugh] چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا."),[Q,D]=P.useState("laughing"),[q,G]=P.useState(["laughing"]),[C,L]=P.useState(""),[re,he]=P.useState(!0),[Y,w]=P.useState(!1),[B,ie]=P.useState(!1),[y,Z]=P.useState(""),[we,je]=P.useState(!1),[xe,Ce]=P.useState([]),[le,me]=P.useState([]),[Pe,se]=P.useState(""),[ge,Fe]=P.useState("eleven_v3"),[De,Oe]=P.useState(!1),[Se,F]=P.useState(""),[J,p]=P.useState(!1),[o,g]=P.useState(!1),[E,z]=P.useState(.5),[T,A]=P.useState(.75),[M,U]=P.useState(0),[X,ce]=P.useState(!0),[de,Ne]=P.useState(!1),[oe,ue]=P.useState(null),[Ue,Xe]=P.useState(0),[We,Je]=P.useState(null),at=P.useRef(null),$e=(d==null?void 0:d.poolSize)||(d!=null&&d.isKeyConfigured?1:0);P.useEffect(()=>{vt()},[d==null?void 0:d.keyValid]);const vt=async()=>{if(d!=null&&d.keyValid){p(!0);try{const[ee,ze]=await Promise.all([Mf().catch(()=>[]),Pf().catch(()=>[])]);Ce(ee),me(ze),ee.length>0&&!Pe&&se(ee[0].voice_id)}catch(ee){console.warn("Could not load voice catalog:",ee)}finally{p(!1)}}},mn=(ee,ze)=>{$(ee),ze&&nc.some(xt=>xt.value===ze)&&D(ze)},Ht=nc.find(ee=>ee.value===Q),hn=Q==="custom"?C:(Ht==null?void 0:Ht.tag)||"",Fn=async ee=>{if(ee.preventDefault(),!R.trim()){b({type:"error",title:"Input Error",message:"Please enter Kurdish text to generate speech."});return}if(!(d!=null&&d.keyValid)){b({type:"error",title:"API Key Missing",message:"Please add at least one ElevenLabs API Key in Settings."}),k();return}const ze=xe.find(it=>it.voice_id===Pe),xt=De?Se.trim()||"eleven_v3":ge;Ne(!0);try{const Qt=(await Ff({text:R.trim(),emotion:Q,emotions:q,emotionTag:hn,includeTagInPrompt:re,whisperEntire:Y,voiceId:Pe||"21m00Tcm4TlvDq8ikWAM",voiceName:ze?ze.name:void 0,modelId:xt,voiceSettings:{stability:Y?.35:E,similarity_boost:T,style:Y?.45:M,use_speaker_boost:X}})).sample;ue(Qt),m(Qt),setTimeout(()=>{var xn;(xn=at.current)==null||xn.scrollIntoView({behavior:"smooth",block:"center"})},150),Af({particleCount:50,spread:60,origin:{y:.7}}),b({type:"success",title:"Speech Generated Successfully!",message:`Sample saved as ${Qt.id}.wav and ${Qt.id}.json with clean Kurdish transcript.`})}catch(it){b({type:"error",title:"Speech Generation Failed",message:it.message||"ElevenLabs API returned an error."})}finally{Ne(!1)}},gn=async ee=>{if(oe)try{const ze=await Kr(oe.id,{ratings:ee});ue(ze),m(ze),b({type:"success",title:"Ratings Saved",message:"Evaluation saved to metadata JSON."})}catch(ze){b({type:"error",title:"Save Failed",message:ze.message})}},vn=async ee=>{if(ee.preventDefault(),!!y.trim()){je(!0);try{const ze=await dc(y.trim());b({type:"success",title:"API Key Added to Pool",message:ze.message||"Key validated and added to pool successfully."}),I&&I({status:"ok",isKeyConfigured:!0,keyValid:!0,poolSize:ze.pool.length,validationError:null,maskedKey:`${y.slice(0,4)}...${y.slice(-4)}`}),Z(""),ie(!1),vt()}catch(ze){b({type:"error",title:"Validation Failed",message:ze.message||"Invalid ElevenLabs API Key."})}finally{je(!1)}}};return a.jsxs("div",{className:"api-page-root",children:[a.jsx("div",{className:"page-header",children:a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(Vr,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"ElevenLabs Multi-Key Speech Generator"})]}),a.jsxs("p",{className:"page-description",children:["Synthesize Kurdish emotional speech with ElevenLabs v3. Supports multiple inline tags (",a.jsx("code",{children:"[laugh]"}),", ",a.jsx("code",{children:"[whisper]"}),", ",a.jsx("code",{children:"[sigh]"}),"), full continuous whispering, and ",a.jsx("strong",{children:"automatic multi-key quota failover"})," while preserving exact clean Unicode transcripts."]})]})}),a.jsxs("div",{className:`glass-card api-config-banner ${d!=null&&d.keyValid?"config-connected":"config-missing"}`,children:[a.jsxs("div",{className:"config-banner-left",children:[a.jsx("div",{className:"config-icon-badge",children:d!=null&&d.keyValid?a.jsx(oc,{size:20,className:"text-emerald"}):a.jsx(rs,{size:20,className:"text-amber"})}),a.jsxs("div",{className:"config-info",children:[a.jsxs("div",{className:"config-status-title",children:[a.jsx("span",{children:"ElevenLabs Multi-Key Pool:"}),d!=null&&d.keyValid?a.jsxs(a.Fragment,{children:[a.jsxs("span",{className:"badge badge-emerald",children:[$e," Key",$e>1?"s":""," Active"]}),a.jsx("span",{className:"badge badge-purple",children:"Auto-Failover On"})]}):a.jsx("span",{className:"badge badge-amber",children:"No Keys Configured"})]}),a.jsx("div",{className:"config-status-desc",children:d!=null&&d.keyValid?`Pool active with ${$e} account(s). If any key runs out of quota, generation automatically switches to the next available account.`:"Add one or more ElevenLabs API keys to enable synthesis. Multiple accounts will automatically failover."})]})]}),a.jsxs("div",{className:"config-banner-actions",children:[a.jsxs("button",{type:"button",className:"btn btn-secondary btn-sm",onClick:()=>ie(!B),children:[a.jsx(Ur,{size:14}),a.jsx("span",{children:B?"Cancel":"Quick Add Key"})]}),a.jsxs("button",{type:"button",className:"btn btn-primary btn-sm",onClick:k,children:[a.jsx(cf,{size:14}),a.jsx("span",{children:"Manage Key Pool"})]})]})]}),B&&a.jsxs("form",{onSubmit:vn,className:"inline-key-form-card glass-card",children:[a.jsxs("div",{className:"key-form-row",children:[a.jsx("input",{type:"password",className:"input-control",placeholder:"Paste xi-api-key here to add to pool (e.g. sk_...)",value:y,onChange:ee=>Z(ee.target.value),id:"inline-api-key-input"}),a.jsxs("button",{type:"submit",className:"btn btn-primary btn-sm",disabled:we||!y.trim(),children:[a.jsx(Ur,{size:14}),a.jsx("span",{children:we?"Validating...":"Add to Pool"})]})]}),a.jsxs("div",{className:"key-form-hint",children:["🔒 Key will be validated and added to the failover pool (",a.jsx("code",{children:".env"})," & ",a.jsx("code",{children:"keys.json"}),")."]})]}),a.jsxs("div",{className:"api-grid-layout",children:[a.jsxs("form",{onSubmit:Fn,className:"glass-card generator-form-card",children:[a.jsx("div",{className:"form-group",children:a.jsx(Bf,{value:R,onChange:$,onSelectPreset:mn,label:"Kurdish Transcript with Inline Tags",disabled:de,showInlineTagToolbar:!0})}),a.jsx("div",{className:"whisper-banner-card",children:a.jsxs("label",{className:"whisper-checkbox-row",children:[a.jsx("input",{type:"checkbox",checked:Y,onChange:ee=>w(ee.target.checked)}),a.jsxs("div",{className:"whisper-label-wrap",children:[a.jsxs("div",{className:"whisper-title",children:[a.jsx(jf,{size:16,className:"text-purple"}),a.jsx("span",{children:"💨 Whisper Throughout Entire Audio"}),a.jsx("span",{className:"badge badge-purple",children:"Continuous Mode"})]}),a.jsx("div",{className:"whisper-desc",children:"Instructs ElevenLabs v3 to maintain a continuous, soft whisper from the first word to the end of the audio track."})]})]})}),a.jsxs("div",{className:"grid-2 form-row-compact",children:[a.jsxs("div",{className:"form-group",children:[a.jsxs("div",{className:"form-label-row",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:"Voice ID / Preset"}),(d==null?void 0:d.keyValid)&&a.jsx("button",{type:"button",className:"reload-btn",onClick:vt,title:"Reload voices from ElevenLabs",children:a.jsx(ra,{size:12,className:J?"spin":""})})]}),xe.length>0?a.jsx("select",{className:"select-control",value:Pe,onChange:ee=>se(ee.target.value),disabled:de,children:xe.map(ee=>a.jsxs("option",{value:ee.voice_id,children:[ee.name," (",ee.category||"voice",")"]},ee.voice_id))}):a.jsx("input",{type:"text",className:"input-control",placeholder:"Enter ElevenLabs Voice ID (e.g. 21m00Tcm4TlvDq8ikWAM)",value:Pe,onChange:ee=>se(ee.target.value),disabled:de})]}),a.jsxs("div",{className:"form-group",children:[a.jsxs("div",{className:"form-label-row",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:"ElevenLabs Model"}),a.jsx("span",{className:"badge badge-emerald",children:"v3 Audio Tags"})]}),a.jsxs("select",{className:"select-control",value:De?"custom":ge,onChange:ee=>{ee.target.value==="custom"?Oe(!0):(Oe(!1),Fe(ee.target.value))},disabled:de,children:[a.jsx("option",{value:"eleven_v3",children:"ElevenLabs v3 (Recommended — Supports [laugh], [whisper], [sigh])"}),a.jsx("option",{value:"eleven_multilingual_v3",children:"Eleven Multilingual v3"}),a.jsx("option",{value:"eleven_turbo_v3",children:"Eleven Turbo v3"}),a.jsx("option",{value:"eleven_multilingual_v2",children:"Eleven Multilingual v2"}),a.jsx("option",{value:"eleven_turbo_v2_5",children:"Eleven Turbo v2.5 (Fast Multilingual)"}),a.jsx("option",{value:"eleven_flash_v2_5",children:"Eleven Flash v2.5 (Ultra Low Latency)"}),a.jsx("option",{value:"eleven_flash_v2",children:"Eleven Flash v2"}),a.jsx("option",{value:"eleven_monolingual_v1",children:"Eleven English v1"}),a.jsx("option",{value:"custom",children:"Custom Model ID..."})]}),De&&a.jsx("input",{type:"text",className:"input-control",style:{marginTop:6},placeholder:"Enter custom model ID (e.g. eleven_v3, eleven_multilingual_v3)",value:Se,onChange:ee=>F(ee.target.value),disabled:de})]})]}),a.jsx("div",{className:"advanced-settings-toggle",children:a.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>g(!o),children:[a.jsx(pf,{size:13}),a.jsx("span",{children:o?"Hide Advanced Parameters":"Advanced Parameters (Stability, Similarity Boost, Style)"})]})}),o&&a.jsxs("div",{className:"advanced-settings-panel",children:[a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Stability: ",E.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Higher = consistent / Lower = expressive"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:E,onChange:ee=>z(parseFloat(ee.target.value)),className:"range-slider"})]}),a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Similarity Boost: ",T.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Closeness to original speaker voice"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:T,onChange:ee=>A(parseFloat(ee.target.value)),className:"range-slider"})]}),a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Style Exaggeration: ",M.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Amplifies emotional delivery"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:M,onChange:ee=>U(parseFloat(ee.target.value)),className:"range-slider"})]}),a.jsxs("label",{className:"checkbox-label",style:{marginTop:6},children:[a.jsx("input",{type:"checkbox",checked:X,onChange:ee=>ce(ee.target.checked)}),a.jsx("span",{children:"Enable Speaker Boost (Improves clarity and volume)"})]})]}),a.jsx("div",{className:"form-submit-row",children:a.jsx("button",{type:"submit",className:"btn btn-primary btn-lg submit-btn pulse-glow",disabled:de||!R.trim(),id:"btn-generate-speech",children:de?a.jsxs(a.Fragment,{children:[a.jsx(ra,{size:18,className:"spin"}),a.jsx("span",{children:"Synthesizing Kurdish Audio with ElevenLabs v3..."})]}):a.jsxs(a.Fragment,{children:[a.jsx(Vr,{size:18}),a.jsx("span",{children:"Generate Kurdish Speech (API)"})]})})})]}),a.jsx("div",{ref:at,className:"generation-output-container sticky-output-panel",children:oe?a.jsxs("div",{className:"glass-card glass-card-glow output-card",children:[a.jsxs("div",{className:"output-card-header",children:[a.jsxs("div",{className:"output-badge-group",children:[a.jsxs("span",{className:"badge badge-cyan",children:["ID: ",oe.id]}),a.jsx("span",{className:`badge emotion-badge-${oe.emotion}`,children:oe.emotion.toUpperCase()}),a.jsx("span",{className:"badge badge-purple",children:oe.model_id})]}),a.jsx("div",{className:"output-header-actions",children:a.jsxs("button",{className:"aux-btn",onClick:()=>Je(oe),title:"Inspect full JSON metadata",children:[a.jsx(lr,{size:13}),a.jsx("span",{children:"Inspect JSON"})]})})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript (Clean Unicode)"}),a.jsx("span",{className:"badge badge-emerald",children:"Exact UTF-8"})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:oe.text})]}),a.jsx("div",{className:"output-audio-section",children:a.jsx(Wr,{src:oe.audioUrl||`/api/dataset/${oe.id}/audio`,sampleId:oe.id,autoPlay:!0,onTimeUpdate:Xe})}),oe.alignment&&a.jsx("div",{className:"output-alignment-section",children:a.jsx(Uf,{alignment:oe.alignment,currentTime:Ue})}),a.jsx("div",{className:"output-rating-section",children:a.jsx(Hr,{ratings:oe.ratings,onSaveRatings:gn})})]}):a.jsxs("div",{className:"glass-card empty-output-card",children:[a.jsx("div",{className:"empty-icon-wrap",children:a.jsx(sc,{size:36,className:"text-cyan"})}),a.jsx("div",{className:"empty-title",children:"Ready for Speech Generation"}),a.jsxs("p",{className:"empty-sub",children:["Enter your Kurdish text on the left, insert tags like ",a.jsx("code",{children:"[laugh]"})," or enable ",a.jsx("code",{children:"Continuous Whisper"}),", and press ",a.jsx("strong",{children:"Generate Kurdish Speech"}),"."]}),a.jsxs("div",{className:"empty-features-list",children:[a.jsxs("div",{className:"feature-item",children:[a.jsx(rr,{size:15,className:"text-emerald"}),a.jsx("span",{children:"Interactive result panel opens directly in view"})]}),a.jsxs("div",{className:"feature-item",children:[a.jsx(rr,{size:15,className:"text-emerald"}),a.jsxs("span",{children:["Preserves clean Kurdish text in ",a.jsx("code",{children:"001.json"})," stripping tags"]})]}),a.jsxs("div",{className:"feature-item",children:[a.jsx(rr,{size:15,className:"text-emerald"}),a.jsx("span",{children:"Supports multiple inline emotion tags & continuous whisper"})]})]})]})})]}),We&&a.jsx(is,{sample:We,onClose:()=>Je(null),onSampleUpdated:ee=>{Je(ee),(oe==null?void 0:oe.id)===ee.id&&ue(ee)}}),a.jsx("style",{children:`
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
      `})]})},Wf=({samples:d,onSampleUpdated:k,onSampleDeleted:m,addToast:b})=>{const[I,R]=P.useState(""),[$,Q]=P.useState("all"),[D,q]=P.useState("all"),[G,C]=P.useState(null),[L,re]=P.useState(null),[he,Y]=P.useState("cards"),w=d.filter(y=>{if(I.trim()){const Z=I.toLowerCase(),we=y.id.toLowerCase().includes(Z),je=y.text.toLowerCase().includes(Z),xe=(y.voice_name||y.voice_id||"").toLowerCase().includes(Z);if(!we&&!je&&!xe)return!1}return!($!=="all"&&y.emotion!==$||D!=="all"&&y.method!==D)}),B=async y=>{if(window.confirm(`Are you sure you want to delete sample "${y}" and its WAV/JSON files?`))try{await Lf(y),m(y),b({type:"info",title:"Sample Deleted",message:`Sample ${y} removed from dataset.`})}catch(Z){b({type:"error",title:"Delete Failed",message:Z.message})}},ie=async(y,Z)=>{try{const we=await Kr(y,{ratings:Z});k(we),b({type:"success",title:"Rating Saved",message:`Ratings updated for ${y}`})}catch(we){b({type:"error",title:"Rating Failed",message:we.message})}};return a.jsxs("div",{className:"dataset-page-root",children:[a.jsxs("div",{className:"dataset-page-header",children:[a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(es,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Kurdish Speech Dataset Manager"})]}),a.jsx("p",{className:"page-description",children:"Authoritative repository of all generated Kurdish WAV audio files and strictly preserved Unicode JSON metadata."})]}),a.jsx("div",{className:"header-actions",children:a.jsxs("a",{href:If(),download:"kurdish_tts_dataset.zip",className:"btn btn-accent btn-md",id:"btn-download-dataset-zip",children:[a.jsx(Lp,{size:18}),a.jsx("span",{children:"Download Dataset (ZIP)"})]})})]}),a.jsxs("div",{className:"glass-card filter-card",children:[a.jsxs("div",{className:"filter-grid",children:[a.jsxs("div",{className:"search-input-wrapper",children:[a.jsx(of,{size:16,className:"search-icon"}),a.jsx("input",{type:"text",className:"input-control search-input",placeholder:"Search by Kurdish text, ID (e.g. 001), or voice...",value:I,onChange:y=>R(y.target.value)})]}),a.jsxs("div",{className:"filter-select-group",children:[a.jsx(Ap,{size:15,className:"text-muted"}),a.jsxs("select",{className:"select-control filter-select",value:$,onChange:y=>Q(y.target.value),children:[a.jsx("option",{value:"all",children:"All Emotions"}),a.jsx("option",{value:"neutral",children:"Neutral"}),a.jsx("option",{value:"happy",children:"Happy"}),a.jsx("option",{value:"sad",children:"Sad"}),a.jsx("option",{value:"angry",children:"Angry"}),a.jsx("option",{value:"excited",children:"Excited"}),a.jsx("option",{value:"whisper",children:"Whisper"}),a.jsx("option",{value:"laughing",children:"Laughing"}),a.jsx("option",{value:"custom",children:"Custom"})]})]}),a.jsx("div",{className:"filter-select-group",children:a.jsxs("select",{className:"select-control filter-select",value:D,onChange:y=>q(y.target.value),children:[a.jsx("option",{value:"all",children:"All Methods"}),a.jsx("option",{value:"elevenlabs_api",children:"ElevenLabs API"}),a.jsx("option",{value:"elevenlabs_web",children:"Normal Web Workflow"})]})}),a.jsxs("div",{className:"view-mode-toggle",children:[a.jsx("button",{className:`view-btn ${he==="cards"?"active":""}`,onClick:()=>Y("cards"),children:"Cards"}),a.jsx("button",{className:`view-btn ${he==="table"?"active":""}`,onClick:()=>Y("table"),children:"Table"})]})]}),a.jsx("div",{className:"filter-stats-bar",children:a.jsxs("span",{className:"stats-count",children:["Showing ",a.jsx("strong",{children:w.length})," of ",a.jsx("strong",{children:d.length})," total samples"]})})]}),w.length===0?a.jsxs("div",{className:"glass-card empty-dataset-state",children:[a.jsx(es,{size:40,className:"text-dim"}),a.jsx("div",{className:"empty-title",children:"No Samples Found"}),a.jsx("p",{className:"empty-sub",children:d.length===0?"No audio samples have been generated yet. Use the API Generation or Normal Web Workflow tab to create your first Kurdish TTS sample!":"No samples matched your search or filter criteria."})]}):he==="cards"?a.jsx("div",{className:"samples-card-grid",children:w.map(y=>a.jsxs("div",{className:"glass-card sample-item-card",children:[a.jsxs("div",{className:"sample-card-header",children:[a.jsxs("div",{className:"sample-id-badge-group",children:[a.jsx("span",{className:"sample-id-pill",children:y.id}),a.jsx("span",{className:`badge emotion-badge-${y.emotion}`,children:y.emotion.toUpperCase()}),a.jsx("span",{className:`badge ${y.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:y.method==="elevenlabs_api"?"API":"Web"})]}),a.jsxs("div",{className:"sample-card-actions",children:[a.jsxs("button",{className:"aux-btn",onClick:()=>re(y),title:"Inspect & Edit Metadata JSON",children:[a.jsx(lr,{size:13}),a.jsx("span",{children:"JSON"})]}),a.jsx("button",{className:"aux-btn btn-danger",onClick:()=>B(y.id),title:"Delete Sample",children:a.jsx(la,{size:13})})]})]}),a.jsx("div",{className:"sample-kurdish-box",children:a.jsx("div",{className:"kurdish-text sample-kurdish-text",dir:"rtl",children:y.text})}),a.jsxs("div",{className:"sample-details-row",children:[a.jsxs("div",{className:"detail-item",children:[a.jsx("span",{className:"detail-label",children:"Voice:"}),a.jsx("span",{className:"detail-val",children:y.voice_name||y.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"detail-item",children:[a.jsx("span",{className:"detail-label",children:"Model:"}),a.jsx("span",{className:"detail-val",children:y.model_id||"Multilingual"})]})]}),a.jsx("div",{className:"sample-audio-wrap",children:a.jsx(Wr,{src:y.audioUrl||`/api/dataset/${y.id}/audio`,sampleId:y.id,showDownload:!0})}),a.jsx("div",{className:"sample-rating-wrap",children:a.jsx(Hr,{ratings:y.ratings,onSaveRatings:Z=>ie(y.id,Z),compact:!0})})]},y.id))}):a.jsx("div",{className:"glass-card table-view-card",children:a.jsx("div",{className:"dataset-table-container",children:a.jsxs("table",{className:"dataset-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"ID"}),a.jsx("th",{children:"Kurdish Transcript (RTL)"}),a.jsx("th",{children:"Emotion"}),a.jsx("th",{children:"Method"}),a.jsx("th",{children:"Voice / Model"}),a.jsx("th",{children:"Audio Playback"}),a.jsx("th",{children:"Rating"}),a.jsx("th",{children:"Date"}),a.jsx("th",{children:"Actions"})]})}),a.jsx("tbody",{children:w.map(y=>a.jsxs("tr",{children:[a.jsx("td",{children:a.jsx("span",{className:"sample-id-pill",children:y.id})}),a.jsx("td",{className:"kurdish-table-cell",dir:"rtl",children:y.text}),a.jsx("td",{children:a.jsx("span",{className:`badge emotion-badge-${y.emotion}`,children:y.emotion})}),a.jsx("td",{children:a.jsx("span",{className:`badge ${y.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:y.method==="elevenlabs_api"?"API":"Web"})}),a.jsxs("td",{className:"voice-cell",children:[a.jsx("div",{className:"voice-name",children:y.voice_name||"ElevenLabs"}),a.jsx("div",{className:"model-name",children:y.model_id||"v2"})]}),a.jsx("td",{style:{minWidth:260},children:a.jsx(Wr,{src:y.audioUrl||`/api/dataset/${y.id}/audio`,sampleId:y.id,showDownload:!1})}),a.jsx("td",{children:a.jsx(Hr,{ratings:y.ratings,onSaveRatings:Z=>ie(y.id,Z),compact:!0})}),a.jsx("td",{className:"date-cell",children:new Date(y.created_at).toLocaleDateString()}),a.jsx("td",{children:a.jsxs("div",{className:"table-actions",children:[a.jsx("button",{className:"aux-btn",onClick:()=>re(y),title:"Inspect Metadata",children:a.jsx(lr,{size:13})}),a.jsx("a",{href:`/api/dataset/${y.id}/download/wav`,download:`${y.id}.wav`,className:"aux-btn",title:"Download WAV",children:a.jsx(ns,{size:13})}),a.jsx("button",{className:"aux-btn btn-danger",onClick:()=>B(y.id),title:"Delete",children:a.jsx(la,{size:13})})]})})]},y.id))})]})})}),L&&a.jsx(is,{sample:L,onClose:()=>re(null),onSampleUpdated:y=>{re(y),k(y)}}),a.jsx("style",{children:`
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
      `})]})},Hf=({samples:d,onSampleUpdated:k,addToast:m})=>{const[b,I]=P.useState(""),[R,$]=P.useState(""),[Q,D]=P.useState(null),q=d.reduce((w,B)=>{const ie=B.text.trim();return w[ie]||(w[ie]=[]),w[ie].push(B),w},{}),G=Object.entries(q).filter(([w,B])=>B.length>=2),C=d.find(w=>w.id===b)||(d.length>0?d[0]:null),L=d.find(w=>w.id===R)||(d.length>1?d[1]:null),re=w=>{const B=w.find(y=>y.method==="elevenlabs_api")||w[0],ie=w.find(y=>y.method==="elevenlabs_web")||w[1]||w[0];I(B.id),$(ie.id)},he=async w=>{if(C)try{const B=await Kr(C.id,{ratings:w});k(B),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample A (${C.id})`})}catch(B){m({type:"error",title:"Save Failed",message:B.message})}},Y=async w=>{if(L)try{const B=await Kr(L.id,{ratings:w});k(B),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample B (${L.id})`})}catch(B){m({type:"error",title:"Save Failed",message:B.message})}};return d.length<2?a.jsxs("div",{className:"compare-page-root",children:[a.jsxs("div",{className:"page-header",children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(ta,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),a.jsx("p",{className:"page-description",children:"Side-by-side A/B evaluation of Kurdish speech naturalness, emotional inflection, and pronunciation."})]}),a.jsxs("div",{className:"glass-card empty-compare-card",children:[a.jsx(ta,{size:48,className:"text-dim"}),a.jsx("div",{className:"empty-title",children:"Need at least 2 Samples to Compare"}),a.jsxs("p",{className:"empty-sub",children:["Generate speech using both the ",a.jsx("strong",{children:"ElevenLabs API"})," and ",a.jsx("strong",{children:"Normal Web Workflow"})," tabs to compare them side-by-side!"]})]})]}):a.jsxs("div",{className:"compare-page-root",children:[a.jsx("div",{className:"page-header",children:a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(ta,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),a.jsx("p",{className:"page-description",children:"Side-by-side A/B benchmark of Kurdish speech quality, Kurdish vowel pronunciation, and emotional accuracy."})]})}),G.length>0&&a.jsxs("div",{className:"glass-card matching-pairs-card",children:[a.jsxs("div",{className:"pairs-title",children:[a.jsx(Vr,{size:15,className:"text-amber"}),a.jsxs("span",{children:["Found ",G.length," Matching Kurdish Text Group",G.length>1?"s":"",":"]})]}),a.jsx("div",{className:"pairs-list",children:G.map(([w,B],ie)=>a.jsxs("button",{className:"pair-select-btn",onClick:()=>re(B),title:w,children:[a.jsxs("span",{className:"pair-count-badge",children:[B.length," versions"]}),a.jsx("span",{className:"kurdish-text pair-text",dir:"rtl",children:w})]},ie))})]}),a.jsxs("div",{className:"glass-card selector-bar",children:[a.jsxs("div",{className:"selector-column",children:[a.jsx("label",{className:"form-label",children:"Sample A (Left)"}),a.jsx("select",{className:"select-control",value:(C==null?void 0:C.id)||"",onChange:w=>I(w.target.value),children:d.map(w=>a.jsxs("option",{value:w.id,children:[w.id," • [",w.method==="elevenlabs_api"?"API":"Web","] ",w.emotion," — ",w.text.slice(0,30),"..."]},w.id))})]}),a.jsx("div",{className:"compare-icon-wrap",children:a.jsx(kp,{size:20,className:"text-cyan"})}),a.jsxs("div",{className:"selector-column",children:[a.jsx("label",{className:"form-label",children:"Sample B (Right)"}),a.jsx("select",{className:"select-control",value:(L==null?void 0:L.id)||"",onChange:w=>$(w.target.value),children:d.map(w=>a.jsxs("option",{value:w.id,children:[w.id," • [",w.method==="elevenlabs_api"?"API":"Web","] ",w.emotion," — ",w.text.slice(0,30),"..."]},w.id))})]})]}),a.jsxs("div",{className:"grid-2 compare-grid",children:[C&&a.jsxs("div",{className:"glass-card compare-card card-a",children:[a.jsxs("div",{className:"compare-card-header",children:[a.jsxs("div",{className:"compare-card-title",children:[a.jsx("span",{className:"side-badge badge-a",children:"Sample A"}),a.jsx("span",{className:"sample-id-pill",children:C.id}),a.jsx("span",{className:`badge ${C.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:C.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),a.jsxs("button",{className:"aux-btn",onClick:()=>D(C),children:[a.jsx(lr,{size:13}),a.jsx("span",{children:"JSON"})]})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript"}),a.jsx("span",{className:`badge emotion-badge-${C.emotion}`,children:C.emotion})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:C.text})]}),a.jsxs("div",{className:"compare-meta-table",children:[a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Voice:"}),a.jsx("span",{className:"meta-v",children:C.voice_name||C.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Model:"}),a.jsx("span",{className:"meta-v",children:C.model_id||"Multilingual"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),a.jsx("span",{className:"meta-v",children:C.emotion_tag||"None"})]})]}),a.jsx(Wr,{src:C.audioUrl||`/api/dataset/${C.id}/audio`,sampleId:C.id}),a.jsx(Hr,{ratings:C.ratings,onSaveRatings:he})]}),L&&a.jsxs("div",{className:"glass-card compare-card card-b",children:[a.jsxs("div",{className:"compare-card-header",children:[a.jsxs("div",{className:"compare-card-title",children:[a.jsx("span",{className:"side-badge badge-b",children:"Sample B"}),a.jsx("span",{className:"sample-id-pill",children:L.id}),a.jsx("span",{className:`badge ${L.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:L.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),a.jsxs("button",{className:"aux-btn",onClick:()=>D(L),children:[a.jsx(lr,{size:13}),a.jsx("span",{children:"JSON"})]})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript"}),a.jsx("span",{className:`badge emotion-badge-${L.emotion}`,children:L.emotion})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:L.text})]}),a.jsxs("div",{className:"compare-meta-table",children:[a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Voice:"}),a.jsx("span",{className:"meta-v",children:L.voice_name||L.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Model:"}),a.jsx("span",{className:"meta-v",children:L.model_id||"Multilingual"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),a.jsx("span",{className:"meta-v",children:L.emotion_tag||"None"})]})]}),a.jsx(Wr,{src:L.audioUrl||`/api/dataset/${L.id}/audio`,sampleId:L.id}),a.jsx(Hr,{ratings:L.ratings,onSaveRatings:Y})]})]}),Q&&a.jsx(is,{sample:Q,onClose:()=>D(null),onSampleUpdated:w=>{D(w),k(w)}}),a.jsx("style",{children:`
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
      `})]})},Qf=()=>{const[d,k]=P.useState("api"),[m,b]=P.useState(null),[I,R]=P.useState([]),[$,Q]=P.useState(!1),[D,q]=P.useState([]),G=w=>{const B="toast_"+Math.random().toString(36).substring(2,9);q(ie=>[...ie,{...w,id:B}])},C=w=>{q(B=>B.filter(ie=>ie.id!==w))};P.useEffect(()=>{L()},[]);const L=async()=>{try{const[w,B]=await Promise.all([cc().catch(()=>({status:"ok",isKeyConfigured:!1,keyValid:!1})),Tf().catch(()=>[])]);b(w),R(B)}catch(w){console.warn("Initial data load warning:",w)}},re=w=>{R(B=>{const ie=B.findIndex(y=>y.id===w.id);if(ie!==-1){const y=[...B];return y[ie]=w,y}return[w,...B]})},he=w=>{R(B=>B.map(ie=>ie.id===w.id?w:ie))},Y=w=>{R(B=>B.filter(ie=>ie.id!==w))};return a.jsxs("div",{className:"app-root",children:[a.jsx(bf,{activeTab:d,onSelectTab:k,onOpenSettings:()=>Q(!0),config:m,datasetCount:I.length}),a.jsxs("main",{className:"app-container",children:[d==="api"&&a.jsx(Kf,{config:m,onOpenSettings:()=>Q(!0),onSampleCreated:re,addToast:G,onConfigUpdated:b}),d==="dataset"&&a.jsx(Wf,{samples:I,onSampleUpdated:he,onSampleDeleted:Y,addToast:G}),d==="compare"&&a.jsx(Hf,{samples:I,onSampleUpdated:he,addToast:G})]}),a.jsx("footer",{className:"app-footer",children:a.jsxs("div",{className:"footer-content",children:[a.jsxs("div",{className:"footer-brand",children:[a.jsx("span",{className:"footer-flag",children:"☀️"}),a.jsx("span",{children:"Kurdish TTS Dataset Studio"})]}),a.jsx("div",{className:"footer-info",children:"Strict UTF-8 Kurdish Sorani Unicode Preservation • Multi-Key ElevenLabs Engine"})]})}),$&&a.jsx(Rf,{config:m,onClose:()=>Q(!1),onConfigUpdated:w=>b(w)}),a.jsx(Cf,{toasts:D,onDismiss:C})]})};gp.createRoot(document.getElementById("root")).render(a.jsx(cp.StrictMode,{children:a.jsx(Qf,{})}));
