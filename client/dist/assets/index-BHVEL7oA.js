(function(){const w=document.createElement("link").relList;if(w&&w.supports&&w.supports("modulepreload"))return;for(const T of document.querySelectorAll('link[rel="modulepreload"]'))E(T);new MutationObserver(T=>{for(const A of T)if(A.type==="childList")for(const D of A.addedNodes)D.tagName==="LINK"&&D.rel==="modulepreload"&&E(D)}).observe(document,{childList:!0,subtree:!0});function m(T){const A={};return T.integrity&&(A.integrity=T.integrity),T.referrerPolicy&&(A.referrerPolicy=T.referrerPolicy),T.crossOrigin==="use-credentials"?A.credentials="include":T.crossOrigin==="anonymous"?A.credentials="omit":A.credentials="same-origin",A}function E(T){if(T.ep)return;T.ep=!0;const A=m(T);fetch(T.href,A)}})();function sc(d){return d&&d.__esModule&&Object.prototype.hasOwnProperty.call(d,"default")?d.default:d}var Yi={exports:{}},Yr={},qi={exports:{}},me={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Yu;function cp(){if(Yu)return me;Yu=1;var d=Symbol.for("react.element"),w=Symbol.for("react.portal"),m=Symbol.for("react.fragment"),E=Symbol.for("react.strict_mode"),T=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),D=Symbol.for("react.context"),X=Symbol.for("react.forward_ref"),F=Symbol.for("react.suspense"),G=Symbol.for("react.memo"),B=Symbol.for("react.lazy"),C=Symbol.iterator;function M(o){return o===null||typeof o!="object"?null:(o=C&&o[C]||o["@@iterator"],typeof o=="function"?o:null)}var Y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ie=Object.assign,q={};function k(o,g,S){this.props=o,this.context=g,this.refs=q,this.updater=S||Y}k.prototype.isReactComponent={},k.prototype.setState=function(o,g){if(typeof o!="object"&&typeof o!="function"&&o!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,o,g,"setState")},k.prototype.forceUpdate=function(o){this.updater.enqueueForceUpdate(this,o,"forceUpdate")};function U(){}U.prototype=k.prototype;function le(o,g,S){this.props=o,this.context=g,this.refs=q,this.updater=S||Y}var y=le.prototype=new U;y.constructor=le,ie(y,k.prototype),y.isPureReactComponent=!0;var Z=Array.isArray,ge=Object.prototype.hasOwnProperty,ye={current:null},se={key:!0,ref:!0,__self:!0,__source:!0};function Ne(o,g,S){var P,R={},O=null,L=null;if(g!=null)for(P in g.ref!==void 0&&(L=g.ref),g.key!==void 0&&(O=""+g.key),g)ge.call(g,P)&&!se.hasOwnProperty(P)&&(R[P]=g[P]);var V=arguments.length-2;if(V===1)R.children=S;else if(1<V){for(var ee=Array(V),pe=0;pe<V;pe++)ee[pe]=arguments[pe+2];R.children=ee}if(o&&o.defaultProps)for(P in V=o.defaultProps,V)R[P]===void 0&&(R[P]=V[P]);return{$$typeof:d,type:o,key:O,ref:L,props:R,_owner:ye.current}}function We(o,g){return{$$typeof:d,type:o.type,key:g,ref:o.ref,props:o.props,_owner:o._owner}}function Ie(o){return typeof o=="object"&&o!==null&&o.$$typeof===d}function Te(o){var g={"=":"=0",":":"=2"};return"$"+o.replace(/[=:]/g,function(S){return g[S]})}var oe=/\/+/g;function he(o,g){return typeof o=="object"&&o!==null&&o.key!=null?Te(""+o.key):g.toString(36)}function _e(o,g,S,P,R){var O=typeof o;(O==="undefined"||O==="boolean")&&(o=null);var L=!1;if(o===null)L=!0;else switch(O){case"string":case"number":L=!0;break;case"object":switch(o.$$typeof){case d:case w:L=!0}}if(L)return L=o,R=R(L),o=P===""?"."+he(L,0):P,Z(R)?(S="",o!=null&&(S=o.replace(oe,"$&/")+"/"),_e(R,g,S,"",function(pe){return pe})):R!=null&&(Ie(R)&&(R=We(R,S+(!R.key||L&&L.key===R.key?"":(""+R.key).replace(oe,"$&/")+"/")+o)),g.push(R)),1;if(L=0,P=P===""?".":P+":",Z(o))for(var V=0;V<o.length;V++){O=o[V];var ee=P+he(O,V);L+=_e(O,g,S,ee,R)}else if(ee=M(o),typeof ee=="function")for(o=ee.call(o),V=0;!(O=o.next()).done;)O=O.value,ee=P+he(O,V++),L+=_e(O,g,S,ee,R);else if(O==="object")throw g=String(o),Error("Objects are not valid as a React child (found: "+(g==="[object Object]"?"object with keys {"+Object.keys(o).join(", ")+"}":g)+"). If you meant to render a collection of children, use an array instead.");return L}function ze(o,g,S){if(o==null)return o;var P=[],R=0;return _e(o,P,"","",function(O){return g.call(S,O,R++)}),P}function Le(o){if(o._status===-1){var g=o._result;g=g(),g.then(function(S){(o._status===0||o._status===-1)&&(o._status=1,o._result=S)},function(S){(o._status===0||o._status===-1)&&(o._status=2,o._result=S)}),o._status===-1&&(o._status=0,o._result=g)}if(o._status===1)return o._result.default;throw o._result}var we={current:null},I={transition:null},J={ReactCurrentDispatcher:we,ReactCurrentBatchConfig:I,ReactCurrentOwner:ye};function u(){throw Error("act(...) is not supported in production builds of React.")}return me.Children={map:ze,forEach:function(o,g,S){ze(o,function(){g.apply(this,arguments)},S)},count:function(o){var g=0;return ze(o,function(){g++}),g},toArray:function(o){return ze(o,function(g){return g})||[]},only:function(o){if(!Ie(o))throw Error("React.Children.only expected to receive a single React element child.");return o}},me.Component=k,me.Fragment=m,me.Profiler=T,me.PureComponent=le,me.StrictMode=E,me.Suspense=F,me.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,me.act=u,me.cloneElement=function(o,g,S){if(o==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+o+".");var P=ie({},o.props),R=o.key,O=o.ref,L=o._owner;if(g!=null){if(g.ref!==void 0&&(O=g.ref,L=ye.current),g.key!==void 0&&(R=""+g.key),o.type&&o.type.defaultProps)var V=o.type.defaultProps;for(ee in g)ge.call(g,ee)&&!se.hasOwnProperty(ee)&&(P[ee]=g[ee]===void 0&&V!==void 0?V[ee]:g[ee])}var ee=arguments.length-2;if(ee===1)P.children=S;else if(1<ee){V=Array(ee);for(var pe=0;pe<ee;pe++)V[pe]=arguments[pe+2];P.children=V}return{$$typeof:d,type:o.type,key:R,ref:O,props:P,_owner:L}},me.createContext=function(o){return o={$$typeof:D,_currentValue:o,_currentValue2:o,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},o.Provider={$$typeof:A,_context:o},o.Consumer=o},me.createElement=Ne,me.createFactory=function(o){var g=Ne.bind(null,o);return g.type=o,g},me.createRef=function(){return{current:null}},me.forwardRef=function(o){return{$$typeof:X,render:o}},me.isValidElement=Ie,me.lazy=function(o){return{$$typeof:B,_payload:{_status:-1,_result:o},_init:Le}},me.memo=function(o,g){return{$$typeof:G,type:o,compare:g===void 0?null:g}},me.startTransition=function(o){var g=I.transition;I.transition={};try{o()}finally{I.transition=g}},me.unstable_act=u,me.useCallback=function(o,g){return we.current.useCallback(o,g)},me.useContext=function(o){return we.current.useContext(o)},me.useDebugValue=function(){},me.useDeferredValue=function(o){return we.current.useDeferredValue(o)},me.useEffect=function(o,g){return we.current.useEffect(o,g)},me.useId=function(){return we.current.useId()},me.useImperativeHandle=function(o,g,S){return we.current.useImperativeHandle(o,g,S)},me.useInsertionEffect=function(o,g){return we.current.useInsertionEffect(o,g)},me.useLayoutEffect=function(o,g){return we.current.useLayoutEffect(o,g)},me.useMemo=function(o,g){return we.current.useMemo(o,g)},me.useReducer=function(o,g,S){return we.current.useReducer(o,g,S)},me.useRef=function(o){return we.current.useRef(o)},me.useState=function(o){return we.current.useState(o)},me.useSyncExternalStore=function(o,g,S){return we.current.useSyncExternalStore(o,g,S)},me.useTransition=function(){return we.current.useTransition()},me.version="18.3.1",me}var qu;function as(){return qu||(qu=1,qi.exports=cp()),qi.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ju;function dp(){if(Ju)return Yr;Ju=1;var d=as(),w=Symbol.for("react.element"),m=Symbol.for("react.fragment"),E=Object.prototype.hasOwnProperty,T=d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,A={key:!0,ref:!0,__self:!0,__source:!0};function D(X,F,G){var B,C={},M=null,Y=null;G!==void 0&&(M=""+G),F.key!==void 0&&(M=""+F.key),F.ref!==void 0&&(Y=F.ref);for(B in F)E.call(F,B)&&!A.hasOwnProperty(B)&&(C[B]=F[B]);if(X&&X.defaultProps)for(B in F=X.defaultProps,F)C[B]===void 0&&(C[B]=F[B]);return{$$typeof:w,type:X,key:M,ref:Y,props:C,_owner:T.current}}return Yr.Fragment=m,Yr.jsx=D,Yr.jsxs=D,Yr}var Xu;function pp(){return Xu||(Xu=1,Yi.exports=dp()),Yi.exports}var a=pp(),z=as();const fp=sc(z);var al={},Ji={exports:{}},dt={},Xi={exports:{}},Zi={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zu;function mp(){return Zu||(Zu=1,(function(d){function w(I,J){var u=I.length;I.push(J);e:for(;0<u;){var o=u-1>>>1,g=I[o];if(0<T(g,J))I[o]=J,I[u]=g,u=o;else break e}}function m(I){return I.length===0?null:I[0]}function E(I){if(I.length===0)return null;var J=I[0],u=I.pop();if(u!==J){I[0]=u;e:for(var o=0,g=I.length,S=g>>>1;o<S;){var P=2*(o+1)-1,R=I[P],O=P+1,L=I[O];if(0>T(R,u))O<g&&0>T(L,R)?(I[o]=L,I[O]=u,o=O):(I[o]=R,I[P]=u,o=P);else if(O<g&&0>T(L,u))I[o]=L,I[O]=u,o=O;else break e}}return J}function T(I,J){var u=I.sortIndex-J.sortIndex;return u!==0?u:I.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var A=performance;d.unstable_now=function(){return A.now()}}else{var D=Date,X=D.now();d.unstable_now=function(){return D.now()-X}}var F=[],G=[],B=1,C=null,M=3,Y=!1,ie=!1,q=!1,k=typeof setTimeout=="function"?setTimeout:null,U=typeof clearTimeout=="function"?clearTimeout:null,le=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(I){for(var J=m(G);J!==null;){if(J.callback===null)E(G);else if(J.startTime<=I)E(G),J.sortIndex=J.expirationTime,w(F,J);else break;J=m(G)}}function Z(I){if(q=!1,y(I),!ie)if(m(F)!==null)ie=!0,Le(ge);else{var J=m(G);J!==null&&we(Z,J.startTime-I)}}function ge(I,J){ie=!1,q&&(q=!1,U(Ne),Ne=-1),Y=!0;var u=M;try{for(y(J),C=m(F);C!==null&&(!(C.expirationTime>J)||I&&!Te());){var o=C.callback;if(typeof o=="function"){C.callback=null,M=C.priorityLevel;var g=o(C.expirationTime<=J);J=d.unstable_now(),typeof g=="function"?C.callback=g:C===m(F)&&E(F),y(J)}else E(F);C=m(F)}if(C!==null)var S=!0;else{var P=m(G);P!==null&&we(Z,P.startTime-J),S=!1}return S}finally{C=null,M=u,Y=!1}}var ye=!1,se=null,Ne=-1,We=5,Ie=-1;function Te(){return!(d.unstable_now()-Ie<We)}function oe(){if(se!==null){var I=d.unstable_now();Ie=I;var J=!0;try{J=se(!0,I)}finally{J?he():(ye=!1,se=null)}}else ye=!1}var he;if(typeof le=="function")he=function(){le(oe)};else if(typeof MessageChannel<"u"){var _e=new MessageChannel,ze=_e.port2;_e.port1.onmessage=oe,he=function(){ze.postMessage(null)}}else he=function(){k(oe,0)};function Le(I){se=I,ye||(ye=!0,he())}function we(I,J){Ne=k(function(){I(d.unstable_now())},J)}d.unstable_IdlePriority=5,d.unstable_ImmediatePriority=1,d.unstable_LowPriority=4,d.unstable_NormalPriority=3,d.unstable_Profiling=null,d.unstable_UserBlockingPriority=2,d.unstable_cancelCallback=function(I){I.callback=null},d.unstable_continueExecution=function(){ie||Y||(ie=!0,Le(ge))},d.unstable_forceFrameRate=function(I){0>I||125<I?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):We=0<I?Math.floor(1e3/I):5},d.unstable_getCurrentPriorityLevel=function(){return M},d.unstable_getFirstCallbackNode=function(){return m(F)},d.unstable_next=function(I){switch(M){case 1:case 2:case 3:var J=3;break;default:J=M}var u=M;M=J;try{return I()}finally{M=u}},d.unstable_pauseExecution=function(){},d.unstable_requestPaint=function(){},d.unstable_runWithPriority=function(I,J){switch(I){case 1:case 2:case 3:case 4:case 5:break;default:I=3}var u=M;M=I;try{return J()}finally{M=u}},d.unstable_scheduleCallback=function(I,J,u){var o=d.unstable_now();switch(typeof u=="object"&&u!==null?(u=u.delay,u=typeof u=="number"&&0<u?o+u:o):u=o,I){case 1:var g=-1;break;case 2:g=250;break;case 5:g=1073741823;break;case 4:g=1e4;break;default:g=5e3}return g=u+g,I={id:B++,callback:J,priorityLevel:I,startTime:u,expirationTime:g,sortIndex:-1},u>o?(I.sortIndex=u,w(G,I),m(F)===null&&I===m(G)&&(q?(U(Ne),Ne=-1):q=!0,we(Z,u-o))):(I.sortIndex=g,w(F,I),ie||Y||(ie=!0,Le(ge))),I},d.unstable_shouldYield=Te,d.unstable_wrapCallback=function(I){var J=M;return function(){var u=M;M=J;try{return I.apply(this,arguments)}finally{M=u}}}})(Zi)),Zi}var ec;function hp(){return ec||(ec=1,Xi.exports=mp()),Xi.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var tc;function gp(){if(tc)return dt;tc=1;var d=as(),w=hp();function m(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var E=new Set,T={};function A(e,t){D(e,t),D(e+"Capture",t)}function D(e,t){for(T[e]=t,e=0;e<t.length;e++)E.add(t[e])}var X=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),F=Object.prototype.hasOwnProperty,G=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,B={},C={};function M(e){return F.call(C,e)?!0:F.call(B,e)?!1:G.test(e)?C[e]=!0:(B[e]=!0,!1)}function Y(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function ie(e,t,n,r){if(t===null||typeof t>"u"||Y(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function q(e,t,n,r,l,i,s){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=l,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=s}var k={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){k[e]=new q(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];k[t]=new q(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){k[e]=new q(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){k[e]=new q(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){k[e]=new q(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){k[e]=new q(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){k[e]=new q(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){k[e]=new q(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){k[e]=new q(e,5,!1,e.toLowerCase(),null,!1,!1)});var U=/[\-:]([a-z])/g;function le(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(U,le);k[t]=new q(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(U,le);k[t]=new q(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(U,le);k[t]=new q(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){k[e]=new q(e,1,!1,e.toLowerCase(),null,!1,!1)}),k.xlinkHref=new q("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){k[e]=new q(e,1,!1,e.toLowerCase(),null,!0,!0)});function y(e,t,n,r){var l=k.hasOwnProperty(t)?k[t]:null;(l!==null?l.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(ie(t,n,l,r)&&(n=null),r||l===null?M(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):l.mustUseProperty?e[l.propertyName]=n===null?l.type===3?!1:"":n:(t=l.attributeName,r=l.attributeNamespace,n===null?e.removeAttribute(t):(l=l.type,n=l===3||l===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Z=d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ge=Symbol.for("react.element"),ye=Symbol.for("react.portal"),se=Symbol.for("react.fragment"),Ne=Symbol.for("react.strict_mode"),We=Symbol.for("react.profiler"),Ie=Symbol.for("react.provider"),Te=Symbol.for("react.context"),oe=Symbol.for("react.forward_ref"),he=Symbol.for("react.suspense"),_e=Symbol.for("react.suspense_list"),ze=Symbol.for("react.memo"),Le=Symbol.for("react.lazy"),we=Symbol.for("react.offscreen"),I=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=I&&e[I]||e["@@iterator"],typeof e=="function"?e:null)}var u=Object.assign,o;function g(e){if(o===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);o=t&&t[1]||""}return`
`+o+e}var S=!1;function P(e,t){if(!e||S)return"";S=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(x){var r=x}Reflect.construct(e,[],t)}else{try{t.call()}catch(x){r=x}e.call(t.prototype)}else{try{throw Error()}catch(x){r=x}e()}}catch(x){if(x&&r&&typeof x.stack=="string"){for(var l=x.stack.split(`
`),i=r.stack.split(`
`),s=l.length-1,c=i.length-1;1<=s&&0<=c&&l[s]!==i[c];)c--;for(;1<=s&&0<=c;s--,c--)if(l[s]!==i[c]){if(s!==1||c!==1)do if(s--,c--,0>c||l[s]!==i[c]){var p=`
`+l[s].replace(" at new "," at ");return e.displayName&&p.includes("<anonymous>")&&(p=p.replace("<anonymous>",e.displayName)),p}while(1<=s&&0<=c);break}}}finally{S=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?g(e):""}function R(e){switch(e.tag){case 5:return g(e.type);case 16:return g("Lazy");case 13:return g("Suspense");case 19:return g("SuspenseList");case 0:case 2:case 15:return e=P(e.type,!1),e;case 11:return e=P(e.type.render,!1),e;case 1:return e=P(e.type,!0),e;default:return""}}function O(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case se:return"Fragment";case ye:return"Portal";case We:return"Profiler";case Ne:return"StrictMode";case he:return"Suspense";case _e:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Te:return(e.displayName||"Context")+".Consumer";case Ie:return(e._context.displayName||"Context")+".Provider";case oe:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case ze:return t=e.displayName||null,t!==null?t:O(e.type)||"Memo";case Le:t=e._payload,e=e._init;try{return O(e(t))}catch{}}return null}function L(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return O(t);case 8:return t===Ne?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function V(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ee(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function pe(e){var t=ee(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var l=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(s){r=""+s,i.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(s){r=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function fe(e){e._valueTracker||(e._valueTracker=pe(e))}function je(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=ee(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function ce(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function de(e,t){var n=t.checked;return u({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Ue(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=V(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Je(e,t){t=t.checked,t!=null&&y(e,"checked",t,!1)}function Ke(e,t){Je(e,t);var n=V(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?lt(e,t.type,n):t.hasOwnProperty("defaultValue")&&lt(e,t.type,V(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Xe(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function lt(e,t,n){(t!=="number"||ce(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var Oe=Array.isArray;function It(e,t,n,r){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&r&&(e[n].defaultSelected=!0)}else{for(n=""+V(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,r&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function Dt(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(m(91));return u({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ln(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(m(92));if(Oe(n)){if(1<n.length)throw Error(m(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:V(n)}}function xn(e,t){var n=V(t.value),r=V(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Fn(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function yn(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Gt(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?yn(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var Ot,Yt=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,l){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,l)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(Ot=Ot||document.createElement("div"),Ot.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=Ot.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function bt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var vt={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Rn=["Webkit","ms","Moz","O"];Object.keys(vt).forEach(function(e){Rn.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),vt[t]=vt[e]})});function re(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||vt.hasOwnProperty(e)&&vt[e]?(""+t).trim():t+"px"}function Re(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,l=re(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,l):e[n]=l}}var pr=u({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function qt(e,t){if(t){if(pr[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(m(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(m(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(m(61))}if(t.style!=null&&typeof t.style!="object")throw Error(m(62))}}function Jt(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var An=null;function cl(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var dl=null,Dn=null,On=null;function ds(e){if(e=Lr(e)){if(typeof dl!="function")throw Error(m(280));var t=e.stateNode;t&&(t=ya(t),dl(e.stateNode,e.type,t))}}function ps(e){Dn?On?On.push(e):On=[e]:Dn=e}function fs(){if(Dn){var e=Dn,t=On;if(On=Dn=null,ds(e),t)for(e=0;e<t.length;e++)ds(t[e])}}function ms(e,t){return e(t)}function hs(){}var pl=!1;function gs(e,t,n){if(pl)return e(t,n);pl=!0;try{return ms(e,t,n)}finally{pl=!1,(Dn!==null||On!==null)&&(hs(),fs())}}function fr(e,t){var n=e.stateNode;if(n===null)return null;var r=ya(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(m(231,t,typeof n));return n}var fl=!1;if(X)try{var mr={};Object.defineProperty(mr,"passive",{get:function(){fl=!0}}),window.addEventListener("test",mr,mr),window.removeEventListener("test",mr,mr)}catch{fl=!1}function gc(e,t,n,r,l,i,s,c,p){var x=Array.prototype.slice.call(arguments,3);try{t.apply(n,x)}catch(N){this.onError(N)}}var hr=!1,Jr=null,Xr=!1,ml=null,vc={onError:function(e){hr=!0,Jr=e}};function xc(e,t,n,r,l,i,s,c,p){hr=!1,Jr=null,gc.apply(vc,arguments)}function yc(e,t,n,r,l,i,s,c,p){if(xc.apply(this,arguments),hr){if(hr){var x=Jr;hr=!1,Jr=null}else throw Error(m(198));Xr||(Xr=!0,ml=x)}}function wn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function vs(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function xs(e){if(wn(e)!==e)throw Error(m(188))}function wc(e){var t=e.alternate;if(!t){if(t=wn(e),t===null)throw Error(m(188));return t!==e?null:e}for(var n=e,r=t;;){var l=n.return;if(l===null)break;var i=l.alternate;if(i===null){if(r=l.return,r!==null){n=r;continue}break}if(l.child===i.child){for(i=l.child;i;){if(i===n)return xs(l),e;if(i===r)return xs(l),t;i=i.sibling}throw Error(m(188))}if(n.return!==r.return)n=l,r=i;else{for(var s=!1,c=l.child;c;){if(c===n){s=!0,n=l,r=i;break}if(c===r){s=!0,r=l,n=i;break}c=c.sibling}if(!s){for(c=i.child;c;){if(c===n){s=!0,n=i,r=l;break}if(c===r){s=!0,r=i,n=l;break}c=c.sibling}if(!s)throw Error(m(189))}}if(n.alternate!==r)throw Error(m(190))}if(n.tag!==3)throw Error(m(188));return n.stateNode.current===n?e:t}function ys(e){return e=wc(e),e!==null?ws(e):null}function ws(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=ws(e);if(t!==null)return t;e=e.sibling}return null}var ks=w.unstable_scheduleCallback,js=w.unstable_cancelCallback,kc=w.unstable_shouldYield,jc=w.unstable_requestPaint,Ae=w.unstable_now,Nc=w.unstable_getCurrentPriorityLevel,hl=w.unstable_ImmediatePriority,Ns=w.unstable_UserBlockingPriority,Zr=w.unstable_NormalPriority,bc=w.unstable_LowPriority,bs=w.unstable_IdlePriority,ea=null,Tt=null;function Sc(e){if(Tt&&typeof Tt.onCommitFiberRoot=="function")try{Tt.onCommitFiberRoot(ea,e,void 0,(e.current.flags&128)===128)}catch{}}var St=Math.clz32?Math.clz32:_c,Cc=Math.log,Ec=Math.LN2;function _c(e){return e>>>=0,e===0?32:31-(Cc(e)/Ec|0)|0}var ta=64,na=4194304;function gr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function ra(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,l=e.suspendedLanes,i=e.pingedLanes,s=n&268435455;if(s!==0){var c=s&~l;c!==0?r=gr(c):(i&=s,i!==0&&(r=gr(i)))}else s=n&~l,s!==0?r=gr(s):i!==0&&(r=gr(i));if(r===0)return 0;if(t!==0&&t!==r&&(t&l)===0&&(l=r&-r,i=t&-t,l>=i||l===16&&(i&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-St(t),l=1<<n,r|=e[n],t&=~l;return r}function zc(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Pc(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,l=e.expirationTimes,i=e.pendingLanes;0<i;){var s=31-St(i),c=1<<s,p=l[s];p===-1?((c&n)===0||(c&r)!==0)&&(l[s]=zc(c,t)):p<=t&&(e.expiredLanes|=c),i&=~c}}function gl(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Ss(){var e=ta;return ta<<=1,(ta&4194240)===0&&(ta=64),e}function vl(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function vr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-St(t),e[t]=n}function Mc(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var l=31-St(n),i=1<<l;t[l]=0,r[l]=-1,e[l]=-1,n&=~i}}function xl(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-St(n),l=1<<r;l&t|e[r]&t&&(e[r]|=t),n&=~l}}var ke=0;function Cs(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Es,yl,_s,zs,Ps,wl=!1,aa=[],Xt=null,Zt=null,en=null,xr=new Map,yr=new Map,tn=[],Ic="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ms(e,t){switch(e){case"focusin":case"focusout":Xt=null;break;case"dragenter":case"dragleave":Zt=null;break;case"mouseover":case"mouseout":en=null;break;case"pointerover":case"pointerout":xr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":yr.delete(t.pointerId)}}function wr(e,t,n,r,l,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[l]},t!==null&&(t=Lr(t),t!==null&&yl(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function Tc(e,t,n,r,l){switch(t){case"focusin":return Xt=wr(Xt,e,t,n,r,l),!0;case"dragenter":return Zt=wr(Zt,e,t,n,r,l),!0;case"mouseover":return en=wr(en,e,t,n,r,l),!0;case"pointerover":var i=l.pointerId;return xr.set(i,wr(xr.get(i)||null,e,t,n,r,l)),!0;case"gotpointercapture":return i=l.pointerId,yr.set(i,wr(yr.get(i)||null,e,t,n,r,l)),!0}return!1}function Is(e){var t=kn(e.target);if(t!==null){var n=wn(t);if(n!==null){if(t=n.tag,t===13){if(t=vs(n),t!==null){e.blockedOn=t,Ps(e.priority,function(){_s(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function la(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=jl(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);An=r,n.target.dispatchEvent(r),An=null}else return t=Lr(n),t!==null&&yl(t),e.blockedOn=n,!1;t.shift()}return!0}function Ts(e,t,n){la(e)&&n.delete(t)}function Lc(){wl=!1,Xt!==null&&la(Xt)&&(Xt=null),Zt!==null&&la(Zt)&&(Zt=null),en!==null&&la(en)&&(en=null),xr.forEach(Ts),yr.forEach(Ts)}function kr(e,t){e.blockedOn===t&&(e.blockedOn=null,wl||(wl=!0,w.unstable_scheduleCallback(w.unstable_NormalPriority,Lc)))}function jr(e){function t(l){return kr(l,e)}if(0<aa.length){kr(aa[0],e);for(var n=1;n<aa.length;n++){var r=aa[n];r.blockedOn===e&&(r.blockedOn=null)}}for(Xt!==null&&kr(Xt,e),Zt!==null&&kr(Zt,e),en!==null&&kr(en,e),xr.forEach(t),yr.forEach(t),n=0;n<tn.length;n++)r=tn[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<tn.length&&(n=tn[0],n.blockedOn===null);)Is(n),n.blockedOn===null&&tn.shift()}var $n=Z.ReactCurrentBatchConfig,ia=!0;function Fc(e,t,n,r){var l=ke,i=$n.transition;$n.transition=null;try{ke=1,kl(e,t,n,r)}finally{ke=l,$n.transition=i}}function Rc(e,t,n,r){var l=ke,i=$n.transition;$n.transition=null;try{ke=4,kl(e,t,n,r)}finally{ke=l,$n.transition=i}}function kl(e,t,n,r){if(ia){var l=jl(e,t,n,r);if(l===null)Ol(e,t,r,sa,n),Ms(e,r);else if(Tc(l,e,t,n,r))r.stopPropagation();else if(Ms(e,r),t&4&&-1<Ic.indexOf(e)){for(;l!==null;){var i=Lr(l);if(i!==null&&Es(i),i=jl(e,t,n,r),i===null&&Ol(e,t,r,sa,n),i===l)break;l=i}l!==null&&r.stopPropagation()}else Ol(e,t,r,null,n)}}var sa=null;function jl(e,t,n,r){if(sa=null,e=cl(r),e=kn(e),e!==null)if(t=wn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=vs(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return sa=e,null}function Ls(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Nc()){case hl:return 1;case Ns:return 4;case Zr:case bc:return 16;case bs:return 536870912;default:return 16}default:return 16}}var nn=null,Nl=null,oa=null;function Fs(){if(oa)return oa;var e,t=Nl,n=t.length,r,l="value"in nn?nn.value:nn.textContent,i=l.length;for(e=0;e<n&&t[e]===l[e];e++);var s=n-e;for(r=1;r<=s&&t[n-r]===l[i-r];r++);return oa=l.slice(e,1<r?1-r:void 0)}function ua(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function ca(){return!0}function Rs(){return!1}function pt(e){function t(n,r,l,i,s){this._reactName=n,this._targetInst=l,this.type=r,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(n=e[c],this[c]=n?n(i):i[c]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?ca:Rs,this.isPropagationStopped=Rs,this}return u(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=ca)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=ca)},persist:function(){},isPersistent:ca}),t}var Un={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},bl=pt(Un),Nr=u({},Un,{view:0,detail:0}),Ac=pt(Nr),Sl,Cl,br,da=u({},Nr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:_l,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==br&&(br&&e.type==="mousemove"?(Sl=e.screenX-br.screenX,Cl=e.screenY-br.screenY):Cl=Sl=0,br=e),Sl)},movementY:function(e){return"movementY"in e?e.movementY:Cl}}),As=pt(da),Dc=u({},da,{dataTransfer:0}),Oc=pt(Dc),$c=u({},Nr,{relatedTarget:0}),El=pt($c),Uc=u({},Un,{animationName:0,elapsedTime:0,pseudoElement:0}),Vc=pt(Uc),Bc=u({},Un,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Wc=pt(Bc),Kc=u({},Un,{data:0}),Ds=pt(Kc),Hc={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Qc={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Gc={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Yc(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Gc[e])?!!t[e]:!1}function _l(){return Yc}var qc=u({},Nr,{key:function(e){if(e.key){var t=Hc[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=ua(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Qc[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:_l,charCode:function(e){return e.type==="keypress"?ua(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?ua(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Jc=pt(qc),Xc=u({},da,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Os=pt(Xc),Zc=u({},Nr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:_l}),ed=pt(Zc),td=u({},Un,{propertyName:0,elapsedTime:0,pseudoElement:0}),nd=pt(td),rd=u({},da,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),ad=pt(rd),ld=[9,13,27,32],zl=X&&"CompositionEvent"in window,Sr=null;X&&"documentMode"in document&&(Sr=document.documentMode);var id=X&&"TextEvent"in window&&!Sr,$s=X&&(!zl||Sr&&8<Sr&&11>=Sr),Us=" ",Vs=!1;function Bs(e,t){switch(e){case"keyup":return ld.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ws(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Vn=!1;function sd(e,t){switch(e){case"compositionend":return Ws(t);case"keypress":return t.which!==32?null:(Vs=!0,Us);case"textInput":return e=t.data,e===Us&&Vs?null:e;default:return null}}function od(e,t){if(Vn)return e==="compositionend"||!zl&&Bs(e,t)?(e=Fs(),oa=Nl=nn=null,Vn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return $s&&t.locale!=="ko"?null:t.data;default:return null}}var ud={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ks(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!ud[e.type]:t==="textarea"}function Hs(e,t,n,r){ps(r),t=ga(t,"onChange"),0<t.length&&(n=new bl("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Cr=null,Er=null;function cd(e){co(e,0)}function pa(e){var t=Qn(e);if(je(t))return e}function dd(e,t){if(e==="change")return t}var Qs=!1;if(X){var Pl;if(X){var Ml="oninput"in document;if(!Ml){var Gs=document.createElement("div");Gs.setAttribute("oninput","return;"),Ml=typeof Gs.oninput=="function"}Pl=Ml}else Pl=!1;Qs=Pl&&(!document.documentMode||9<document.documentMode)}function Ys(){Cr&&(Cr.detachEvent("onpropertychange",qs),Er=Cr=null)}function qs(e){if(e.propertyName==="value"&&pa(Er)){var t=[];Hs(t,Er,e,cl(e)),gs(cd,t)}}function pd(e,t,n){e==="focusin"?(Ys(),Cr=t,Er=n,Cr.attachEvent("onpropertychange",qs)):e==="focusout"&&Ys()}function fd(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return pa(Er)}function md(e,t){if(e==="click")return pa(t)}function hd(e,t){if(e==="input"||e==="change")return pa(t)}function gd(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ct=typeof Object.is=="function"?Object.is:gd;function _r(e,t){if(Ct(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var l=n[r];if(!F.call(t,l)||!Ct(e[l],t[l]))return!1}return!0}function Js(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Xs(e,t){var n=Js(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Js(n)}}function Zs(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Zs(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function eo(){for(var e=window,t=ce();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=ce(e.document)}return t}function Il(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function vd(e){var t=eo(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Zs(n.ownerDocument.documentElement,n)){if(r!==null&&Il(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var l=n.textContent.length,i=Math.min(r.start,l);r=r.end===void 0?i:Math.min(r.end,l),!e.extend&&i>r&&(l=r,r=i,i=l),l=Xs(n,i);var s=Xs(n,r);l&&s&&(e.rangeCount!==1||e.anchorNode!==l.node||e.anchorOffset!==l.offset||e.focusNode!==s.node||e.focusOffset!==s.offset)&&(t=t.createRange(),t.setStart(l.node,l.offset),e.removeAllRanges(),i>r?(e.addRange(t),e.extend(s.node,s.offset)):(t.setEnd(s.node,s.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var xd=X&&"documentMode"in document&&11>=document.documentMode,Bn=null,Tl=null,zr=null,Ll=!1;function to(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ll||Bn==null||Bn!==ce(r)||(r=Bn,"selectionStart"in r&&Il(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),zr&&_r(zr,r)||(zr=r,r=ga(Tl,"onSelect"),0<r.length&&(t=new bl("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Bn)))}function fa(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Wn={animationend:fa("Animation","AnimationEnd"),animationiteration:fa("Animation","AnimationIteration"),animationstart:fa("Animation","AnimationStart"),transitionend:fa("Transition","TransitionEnd")},Fl={},no={};X&&(no=document.createElement("div").style,"AnimationEvent"in window||(delete Wn.animationend.animation,delete Wn.animationiteration.animation,delete Wn.animationstart.animation),"TransitionEvent"in window||delete Wn.transitionend.transition);function ma(e){if(Fl[e])return Fl[e];if(!Wn[e])return e;var t=Wn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in no)return Fl[e]=t[n];return e}var ro=ma("animationend"),ao=ma("animationiteration"),lo=ma("animationstart"),io=ma("transitionend"),so=new Map,oo="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function rn(e,t){so.set(e,t),A(t,[e])}for(var Rl=0;Rl<oo.length;Rl++){var Al=oo[Rl],yd=Al.toLowerCase(),wd=Al[0].toUpperCase()+Al.slice(1);rn(yd,"on"+wd)}rn(ro,"onAnimationEnd"),rn(ao,"onAnimationIteration"),rn(lo,"onAnimationStart"),rn("dblclick","onDoubleClick"),rn("focusin","onFocus"),rn("focusout","onBlur"),rn(io,"onTransitionEnd"),D("onMouseEnter",["mouseout","mouseover"]),D("onMouseLeave",["mouseout","mouseover"]),D("onPointerEnter",["pointerout","pointerover"]),D("onPointerLeave",["pointerout","pointerover"]),A("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),A("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),A("onBeforeInput",["compositionend","keypress","textInput","paste"]),A("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),A("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),A("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Pr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),kd=new Set("cancel close invalid load scroll toggle".split(" ").concat(Pr));function uo(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,yc(r,t,void 0,e),e.currentTarget=null}function co(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],l=r.event;r=r.listeners;e:{var i=void 0;if(t)for(var s=r.length-1;0<=s;s--){var c=r[s],p=c.instance,x=c.currentTarget;if(c=c.listener,p!==i&&l.isPropagationStopped())break e;uo(l,c,x),i=p}else for(s=0;s<r.length;s++){if(c=r[s],p=c.instance,x=c.currentTarget,c=c.listener,p!==i&&l.isPropagationStopped())break e;uo(l,c,x),i=p}}}if(Xr)throw e=ml,Xr=!1,ml=null,e}function Se(e,t){var n=t[Kl];n===void 0&&(n=t[Kl]=new Set);var r=e+"__bubble";n.has(r)||(po(t,e,2,!1),n.add(r))}function Dl(e,t,n){var r=0;t&&(r|=4),po(n,e,r,t)}var ha="_reactListening"+Math.random().toString(36).slice(2);function Mr(e){if(!e[ha]){e[ha]=!0,E.forEach(function(n){n!=="selectionchange"&&(kd.has(n)||Dl(n,!1,e),Dl(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[ha]||(t[ha]=!0,Dl("selectionchange",!1,t))}}function po(e,t,n,r){switch(Ls(t)){case 1:var l=Fc;break;case 4:l=Rc;break;default:l=kl}n=l.bind(null,t,n,e),l=void 0,!fl||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),r?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function Ol(e,t,n,r,l){var i=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===l||c.nodeType===8&&c.parentNode===l)break;if(s===4)for(s=r.return;s!==null;){var p=s.tag;if((p===3||p===4)&&(p=s.stateNode.containerInfo,p===l||p.nodeType===8&&p.parentNode===l))return;s=s.return}for(;c!==null;){if(s=kn(c),s===null)return;if(p=s.tag,p===5||p===6){r=i=s;continue e}c=c.parentNode}}r=r.return}gs(function(){var x=i,N=cl(n),b=[];e:{var j=so.get(e);if(j!==void 0){var $=bl,K=e;switch(e){case"keypress":if(ua(n)===0)break e;case"keydown":case"keyup":$=Jc;break;case"focusin":K="focus",$=El;break;case"focusout":K="blur",$=El;break;case"beforeblur":case"afterblur":$=El;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":$=As;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":$=Oc;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":$=ed;break;case ro:case ao:case lo:$=Vc;break;case io:$=nd;break;case"scroll":$=Ac;break;case"wheel":$=ad;break;case"copy":case"cut":case"paste":$=Wc;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":$=Os}var H=(t&4)!==0,De=!H&&e==="scroll",h=H?j!==null?j+"Capture":null:j;H=[];for(var f=x,v;f!==null;){v=f;var _=v.stateNode;if(v.tag===5&&_!==null&&(v=_,h!==null&&(_=fr(f,h),_!=null&&H.push(Ir(f,_,v)))),De)break;f=f.return}0<H.length&&(j=new $(j,K,null,n,N),b.push({event:j,listeners:H}))}}if((t&7)===0){e:{if(j=e==="mouseover"||e==="pointerover",$=e==="mouseout"||e==="pointerout",j&&n!==An&&(K=n.relatedTarget||n.fromElement)&&(kn(K)||K[$t]))break e;if(($||j)&&(j=N.window===N?N:(j=N.ownerDocument)?j.defaultView||j.parentWindow:window,$?(K=n.relatedTarget||n.toElement,$=x,K=K?kn(K):null,K!==null&&(De=wn(K),K!==De||K.tag!==5&&K.tag!==6)&&(K=null)):($=null,K=x),$!==K)){if(H=As,_="onMouseLeave",h="onMouseEnter",f="mouse",(e==="pointerout"||e==="pointerover")&&(H=Os,_="onPointerLeave",h="onPointerEnter",f="pointer"),De=$==null?j:Qn($),v=K==null?j:Qn(K),j=new H(_,f+"leave",$,n,N),j.target=De,j.relatedTarget=v,_=null,kn(N)===x&&(H=new H(h,f+"enter",K,n,N),H.target=v,H.relatedTarget=De,_=H),De=_,$&&K)t:{for(H=$,h=K,f=0,v=H;v;v=Kn(v))f++;for(v=0,_=h;_;_=Kn(_))v++;for(;0<f-v;)H=Kn(H),f--;for(;0<v-f;)h=Kn(h),v--;for(;f--;){if(H===h||h!==null&&H===h.alternate)break t;H=Kn(H),h=Kn(h)}H=null}else H=null;$!==null&&fo(b,j,$,H,!1),K!==null&&De!==null&&fo(b,De,K,H,!0)}}e:{if(j=x?Qn(x):window,$=j.nodeName&&j.nodeName.toLowerCase(),$==="select"||$==="input"&&j.type==="file")var Q=dd;else if(Ks(j))if(Qs)Q=hd;else{Q=fd;var te=pd}else($=j.nodeName)&&$.toLowerCase()==="input"&&(j.type==="checkbox"||j.type==="radio")&&(Q=md);if(Q&&(Q=Q(e,x))){Hs(b,Q,n,N);break e}te&&te(e,j,x),e==="focusout"&&(te=j._wrapperState)&&te.controlled&&j.type==="number"&&lt(j,"number",j.value)}switch(te=x?Qn(x):window,e){case"focusin":(Ks(te)||te.contentEditable==="true")&&(Bn=te,Tl=x,zr=null);break;case"focusout":zr=Tl=Bn=null;break;case"mousedown":Ll=!0;break;case"contextmenu":case"mouseup":case"dragend":Ll=!1,to(b,n,N);break;case"selectionchange":if(xd)break;case"keydown":case"keyup":to(b,n,N)}var ne;if(zl)e:{switch(e){case"compositionstart":var ae="onCompositionStart";break e;case"compositionend":ae="onCompositionEnd";break e;case"compositionupdate":ae="onCompositionUpdate";break e}ae=void 0}else Vn?Bs(e,n)&&(ae="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(ae="onCompositionStart");ae&&($s&&n.locale!=="ko"&&(Vn||ae!=="onCompositionStart"?ae==="onCompositionEnd"&&Vn&&(ne=Fs()):(nn=N,Nl="value"in nn?nn.value:nn.textContent,Vn=!0)),te=ga(x,ae),0<te.length&&(ae=new Ds(ae,e,null,n,N),b.push({event:ae,listeners:te}),ne?ae.data=ne:(ne=Ws(n),ne!==null&&(ae.data=ne)))),(ne=id?sd(e,n):od(e,n))&&(x=ga(x,"onBeforeInput"),0<x.length&&(N=new Ds("onBeforeInput","beforeinput",null,n,N),b.push({event:N,listeners:x}),N.data=ne))}co(b,t)})}function Ir(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ga(e,t){for(var n=t+"Capture",r=[];e!==null;){var l=e,i=l.stateNode;l.tag===5&&i!==null&&(l=i,i=fr(e,n),i!=null&&r.unshift(Ir(e,i,l)),i=fr(e,t),i!=null&&r.push(Ir(e,i,l))),e=e.return}return r}function Kn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function fo(e,t,n,r,l){for(var i=t._reactName,s=[];n!==null&&n!==r;){var c=n,p=c.alternate,x=c.stateNode;if(p!==null&&p===r)break;c.tag===5&&x!==null&&(c=x,l?(p=fr(n,i),p!=null&&s.unshift(Ir(n,p,c))):l||(p=fr(n,i),p!=null&&s.push(Ir(n,p,c)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var jd=/\r\n?/g,Nd=/\u0000|\uFFFD/g;function mo(e){return(typeof e=="string"?e:""+e).replace(jd,`
`).replace(Nd,"")}function va(e,t,n){if(t=mo(t),mo(e)!==t&&n)throw Error(m(425))}function xa(){}var $l=null,Ul=null;function Vl(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Bl=typeof setTimeout=="function"?setTimeout:void 0,bd=typeof clearTimeout=="function"?clearTimeout:void 0,ho=typeof Promise=="function"?Promise:void 0,Sd=typeof queueMicrotask=="function"?queueMicrotask:typeof ho<"u"?function(e){return ho.resolve(null).then(e).catch(Cd)}:Bl;function Cd(e){setTimeout(function(){throw e})}function Wl(e,t){var n=t,r=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(r===0){e.removeChild(l),jr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=l}while(n);jr(t)}function an(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function go(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Hn=Math.random().toString(36).slice(2),Lt="__reactFiber$"+Hn,Tr="__reactProps$"+Hn,$t="__reactContainer$"+Hn,Kl="__reactEvents$"+Hn,Ed="__reactListeners$"+Hn,_d="__reactHandles$"+Hn;function kn(e){var t=e[Lt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[$t]||n[Lt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=go(e);e!==null;){if(n=e[Lt])return n;e=go(e)}return t}e=n,n=e.parentNode}return null}function Lr(e){return e=e[Lt]||e[$t],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Qn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(m(33))}function ya(e){return e[Tr]||null}var Hl=[],Gn=-1;function ln(e){return{current:e}}function Ce(e){0>Gn||(e.current=Hl[Gn],Hl[Gn]=null,Gn--)}function be(e,t){Gn++,Hl[Gn]=e.current,e.current=t}var sn={},Ze=ln(sn),it=ln(!1),jn=sn;function Yn(e,t){var n=e.type.contextTypes;if(!n)return sn;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var l={},i;for(i in n)l[i]=t[i];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=l),l}function st(e){return e=e.childContextTypes,e!=null}function wa(){Ce(it),Ce(Ze)}function vo(e,t,n){if(Ze.current!==sn)throw Error(m(168));be(Ze,t),be(it,n)}function xo(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var l in r)if(!(l in t))throw Error(m(108,L(e)||"Unknown",l));return u({},n,r)}function ka(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||sn,jn=Ze.current,be(Ze,e),be(it,it.current),!0}function yo(e,t,n){var r=e.stateNode;if(!r)throw Error(m(169));n?(e=xo(e,t,jn),r.__reactInternalMemoizedMergedChildContext=e,Ce(it),Ce(Ze),be(Ze,e)):Ce(it),be(it,n)}var Ut=null,ja=!1,Ql=!1;function wo(e){Ut===null?Ut=[e]:Ut.push(e)}function zd(e){ja=!0,wo(e)}function on(){if(!Ql&&Ut!==null){Ql=!0;var e=0,t=ke;try{var n=Ut;for(ke=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Ut=null,ja=!1}catch(l){throw Ut!==null&&(Ut=Ut.slice(e+1)),ks(hl,on),l}finally{ke=t,Ql=!1}}return null}var qn=[],Jn=0,Na=null,ba=0,xt=[],yt=0,Nn=null,Vt=1,Bt="";function bn(e,t){qn[Jn++]=ba,qn[Jn++]=Na,Na=e,ba=t}function ko(e,t,n){xt[yt++]=Vt,xt[yt++]=Bt,xt[yt++]=Nn,Nn=e;var r=Vt;e=Bt;var l=32-St(r)-1;r&=~(1<<l),n+=1;var i=32-St(t)+l;if(30<i){var s=l-l%5;i=(r&(1<<s)-1).toString(32),r>>=s,l-=s,Vt=1<<32-St(t)+l|n<<l|r,Bt=i+e}else Vt=1<<i|n<<l|r,Bt=e}function Gl(e){e.return!==null&&(bn(e,1),ko(e,1,0))}function Yl(e){for(;e===Na;)Na=qn[--Jn],qn[Jn]=null,ba=qn[--Jn],qn[Jn]=null;for(;e===Nn;)Nn=xt[--yt],xt[yt]=null,Bt=xt[--yt],xt[yt]=null,Vt=xt[--yt],xt[yt]=null}var ft=null,mt=null,Ee=!1,Et=null;function jo(e,t){var n=Nt(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function No(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,ft=e,mt=an(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,ft=e,mt=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=Nn!==null?{id:Vt,overflow:Bt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Nt(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,ft=e,mt=null,!0):!1;default:return!1}}function ql(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Jl(e){if(Ee){var t=mt;if(t){var n=t;if(!No(e,t)){if(ql(e))throw Error(m(418));t=an(n.nextSibling);var r=ft;t&&No(e,t)?jo(r,n):(e.flags=e.flags&-4097|2,Ee=!1,ft=e)}}else{if(ql(e))throw Error(m(418));e.flags=e.flags&-4097|2,Ee=!1,ft=e}}}function bo(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;ft=e}function Sa(e){if(e!==ft)return!1;if(!Ee)return bo(e),Ee=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Vl(e.type,e.memoizedProps)),t&&(t=mt)){if(ql(e))throw So(),Error(m(418));for(;t;)jo(e,t),t=an(t.nextSibling)}if(bo(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(m(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){mt=an(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}mt=null}}else mt=ft?an(e.stateNode.nextSibling):null;return!0}function So(){for(var e=mt;e;)e=an(e.nextSibling)}function Xn(){mt=ft=null,Ee=!1}function Xl(e){Et===null?Et=[e]:Et.push(e)}var Pd=Z.ReactCurrentBatchConfig;function Fr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(m(309));var r=n.stateNode}if(!r)throw Error(m(147,e));var l=r,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(s){var c=l.refs;s===null?delete c[i]:c[i]=s},t._stringRef=i,t)}if(typeof e!="string")throw Error(m(284));if(!n._owner)throw Error(m(290,e))}return e}function Ca(e,t){throw e=Object.prototype.toString.call(t),Error(m(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Co(e){var t=e._init;return t(e._payload)}function Eo(e){function t(h,f){if(e){var v=h.deletions;v===null?(h.deletions=[f],h.flags|=16):v.push(f)}}function n(h,f){if(!e)return null;for(;f!==null;)t(h,f),f=f.sibling;return null}function r(h,f){for(h=new Map;f!==null;)f.key!==null?h.set(f.key,f):h.set(f.index,f),f=f.sibling;return h}function l(h,f){return h=gn(h,f),h.index=0,h.sibling=null,h}function i(h,f,v){return h.index=v,e?(v=h.alternate,v!==null?(v=v.index,v<f?(h.flags|=2,f):v):(h.flags|=2,f)):(h.flags|=1048576,f)}function s(h){return e&&h.alternate===null&&(h.flags|=2),h}function c(h,f,v,_){return f===null||f.tag!==6?(f=Bi(v,h.mode,_),f.return=h,f):(f=l(f,v),f.return=h,f)}function p(h,f,v,_){var Q=v.type;return Q===se?N(h,f,v.props.children,_,v.key):f!==null&&(f.elementType===Q||typeof Q=="object"&&Q!==null&&Q.$$typeof===Le&&Co(Q)===f.type)?(_=l(f,v.props),_.ref=Fr(h,f,v),_.return=h,_):(_=qa(v.type,v.key,v.props,null,h.mode,_),_.ref=Fr(h,f,v),_.return=h,_)}function x(h,f,v,_){return f===null||f.tag!==4||f.stateNode.containerInfo!==v.containerInfo||f.stateNode.implementation!==v.implementation?(f=Wi(v,h.mode,_),f.return=h,f):(f=l(f,v.children||[]),f.return=h,f)}function N(h,f,v,_,Q){return f===null||f.tag!==7?(f=In(v,h.mode,_,Q),f.return=h,f):(f=l(f,v),f.return=h,f)}function b(h,f,v){if(typeof f=="string"&&f!==""||typeof f=="number")return f=Bi(""+f,h.mode,v),f.return=h,f;if(typeof f=="object"&&f!==null){switch(f.$$typeof){case ge:return v=qa(f.type,f.key,f.props,null,h.mode,v),v.ref=Fr(h,null,f),v.return=h,v;case ye:return f=Wi(f,h.mode,v),f.return=h,f;case Le:var _=f._init;return b(h,_(f._payload),v)}if(Oe(f)||J(f))return f=In(f,h.mode,v,null),f.return=h,f;Ca(h,f)}return null}function j(h,f,v,_){var Q=f!==null?f.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return Q!==null?null:c(h,f,""+v,_);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case ge:return v.key===Q?p(h,f,v,_):null;case ye:return v.key===Q?x(h,f,v,_):null;case Le:return Q=v._init,j(h,f,Q(v._payload),_)}if(Oe(v)||J(v))return Q!==null?null:N(h,f,v,_,null);Ca(h,v)}return null}function $(h,f,v,_,Q){if(typeof _=="string"&&_!==""||typeof _=="number")return h=h.get(v)||null,c(f,h,""+_,Q);if(typeof _=="object"&&_!==null){switch(_.$$typeof){case ge:return h=h.get(_.key===null?v:_.key)||null,p(f,h,_,Q);case ye:return h=h.get(_.key===null?v:_.key)||null,x(f,h,_,Q);case Le:var te=_._init;return $(h,f,v,te(_._payload),Q)}if(Oe(_)||J(_))return h=h.get(v)||null,N(f,h,_,Q,null);Ca(f,_)}return null}function K(h,f,v,_){for(var Q=null,te=null,ne=f,ae=f=0,Ge=null;ne!==null&&ae<v.length;ae++){ne.index>ae?(Ge=ne,ne=null):Ge=ne.sibling;var xe=j(h,ne,v[ae],_);if(xe===null){ne===null&&(ne=Ge);break}e&&ne&&xe.alternate===null&&t(h,ne),f=i(xe,f,ae),te===null?Q=xe:te.sibling=xe,te=xe,ne=Ge}if(ae===v.length)return n(h,ne),Ee&&bn(h,ae),Q;if(ne===null){for(;ae<v.length;ae++)ne=b(h,v[ae],_),ne!==null&&(f=i(ne,f,ae),te===null?Q=ne:te.sibling=ne,te=ne);return Ee&&bn(h,ae),Q}for(ne=r(h,ne);ae<v.length;ae++)Ge=$(ne,h,ae,v[ae],_),Ge!==null&&(e&&Ge.alternate!==null&&ne.delete(Ge.key===null?ae:Ge.key),f=i(Ge,f,ae),te===null?Q=Ge:te.sibling=Ge,te=Ge);return e&&ne.forEach(function(vn){return t(h,vn)}),Ee&&bn(h,ae),Q}function H(h,f,v,_){var Q=J(v);if(typeof Q!="function")throw Error(m(150));if(v=Q.call(v),v==null)throw Error(m(151));for(var te=Q=null,ne=f,ae=f=0,Ge=null,xe=v.next();ne!==null&&!xe.done;ae++,xe=v.next()){ne.index>ae?(Ge=ne,ne=null):Ge=ne.sibling;var vn=j(h,ne,xe.value,_);if(vn===null){ne===null&&(ne=Ge);break}e&&ne&&vn.alternate===null&&t(h,ne),f=i(vn,f,ae),te===null?Q=vn:te.sibling=vn,te=vn,ne=Ge}if(xe.done)return n(h,ne),Ee&&bn(h,ae),Q;if(ne===null){for(;!xe.done;ae++,xe=v.next())xe=b(h,xe.value,_),xe!==null&&(f=i(xe,f,ae),te===null?Q=xe:te.sibling=xe,te=xe);return Ee&&bn(h,ae),Q}for(ne=r(h,ne);!xe.done;ae++,xe=v.next())xe=$(ne,h,ae,xe.value,_),xe!==null&&(e&&xe.alternate!==null&&ne.delete(xe.key===null?ae:xe.key),f=i(xe,f,ae),te===null?Q=xe:te.sibling=xe,te=xe);return e&&ne.forEach(function(up){return t(h,up)}),Ee&&bn(h,ae),Q}function De(h,f,v,_){if(typeof v=="object"&&v!==null&&v.type===se&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case ge:e:{for(var Q=v.key,te=f;te!==null;){if(te.key===Q){if(Q=v.type,Q===se){if(te.tag===7){n(h,te.sibling),f=l(te,v.props.children),f.return=h,h=f;break e}}else if(te.elementType===Q||typeof Q=="object"&&Q!==null&&Q.$$typeof===Le&&Co(Q)===te.type){n(h,te.sibling),f=l(te,v.props),f.ref=Fr(h,te,v),f.return=h,h=f;break e}n(h,te);break}else t(h,te);te=te.sibling}v.type===se?(f=In(v.props.children,h.mode,_,v.key),f.return=h,h=f):(_=qa(v.type,v.key,v.props,null,h.mode,_),_.ref=Fr(h,f,v),_.return=h,h=_)}return s(h);case ye:e:{for(te=v.key;f!==null;){if(f.key===te)if(f.tag===4&&f.stateNode.containerInfo===v.containerInfo&&f.stateNode.implementation===v.implementation){n(h,f.sibling),f=l(f,v.children||[]),f.return=h,h=f;break e}else{n(h,f);break}else t(h,f);f=f.sibling}f=Wi(v,h.mode,_),f.return=h,h=f}return s(h);case Le:return te=v._init,De(h,f,te(v._payload),_)}if(Oe(v))return K(h,f,v,_);if(J(v))return H(h,f,v,_);Ca(h,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,f!==null&&f.tag===6?(n(h,f.sibling),f=l(f,v),f.return=h,h=f):(n(h,f),f=Bi(v,h.mode,_),f.return=h,h=f),s(h)):n(h,f)}return De}var Zn=Eo(!0),_o=Eo(!1),Ea=ln(null),_a=null,er=null,Zl=null;function ei(){Zl=er=_a=null}function ti(e){var t=Ea.current;Ce(Ea),e._currentValue=t}function ni(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function tr(e,t){_a=e,Zl=er=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(ot=!0),e.firstContext=null)}function wt(e){var t=e._currentValue;if(Zl!==e)if(e={context:e,memoizedValue:t,next:null},er===null){if(_a===null)throw Error(m(308));er=e,_a.dependencies={lanes:0,firstContext:e}}else er=er.next=e;return t}var Sn=null;function ri(e){Sn===null?Sn=[e]:Sn.push(e)}function zo(e,t,n,r){var l=t.interleaved;return l===null?(n.next=n,ri(t)):(n.next=l.next,l.next=n),t.interleaved=n,Wt(e,r)}function Wt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var un=!1;function ai(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Po(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Kt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function cn(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(ve&2)!==0){var l=r.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),r.pending=t,Wt(e,n)}return l=r.interleaved,l===null?(t.next=t,ri(r)):(t.next=l.next,l.next=t),r.interleaved=t,Wt(e,n)}function za(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,xl(e,n)}}function Mo(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var l=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?l=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?l=i=t:i=i.next=t}else l=i=t;n={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:i,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Pa(e,t,n,r){var l=e.updateQueue;un=!1;var i=l.firstBaseUpdate,s=l.lastBaseUpdate,c=l.shared.pending;if(c!==null){l.shared.pending=null;var p=c,x=p.next;p.next=null,s===null?i=x:s.next=x,s=p;var N=e.alternate;N!==null&&(N=N.updateQueue,c=N.lastBaseUpdate,c!==s&&(c===null?N.firstBaseUpdate=x:c.next=x,N.lastBaseUpdate=p))}if(i!==null){var b=l.baseState;s=0,N=x=p=null,c=i;do{var j=c.lane,$=c.eventTime;if((r&j)===j){N!==null&&(N=N.next={eventTime:$,lane:0,tag:c.tag,payload:c.payload,callback:c.callback,next:null});e:{var K=e,H=c;switch(j=t,$=n,H.tag){case 1:if(K=H.payload,typeof K=="function"){b=K.call($,b,j);break e}b=K;break e;case 3:K.flags=K.flags&-65537|128;case 0:if(K=H.payload,j=typeof K=="function"?K.call($,b,j):K,j==null)break e;b=u({},b,j);break e;case 2:un=!0}}c.callback!==null&&c.lane!==0&&(e.flags|=64,j=l.effects,j===null?l.effects=[c]:j.push(c))}else $={eventTime:$,lane:j,tag:c.tag,payload:c.payload,callback:c.callback,next:null},N===null?(x=N=$,p=b):N=N.next=$,s|=j;if(c=c.next,c===null){if(c=l.shared.pending,c===null)break;j=c,c=j.next,j.next=null,l.lastBaseUpdate=j,l.shared.pending=null}}while(!0);if(N===null&&(p=b),l.baseState=p,l.firstBaseUpdate=x,l.lastBaseUpdate=N,t=l.shared.interleaved,t!==null){l=t;do s|=l.lane,l=l.next;while(l!==t)}else i===null&&(l.shared.lanes=0);_n|=s,e.lanes=s,e.memoizedState=b}}function Io(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],l=r.callback;if(l!==null){if(r.callback=null,r=n,typeof l!="function")throw Error(m(191,l));l.call(r)}}}var Rr={},Ft=ln(Rr),Ar=ln(Rr),Dr=ln(Rr);function Cn(e){if(e===Rr)throw Error(m(174));return e}function li(e,t){switch(be(Dr,t),be(Ar,e),be(Ft,Rr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Gt(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Gt(t,e)}Ce(Ft),be(Ft,t)}function nr(){Ce(Ft),Ce(Ar),Ce(Dr)}function To(e){Cn(Dr.current);var t=Cn(Ft.current),n=Gt(t,e.type);t!==n&&(be(Ar,e),be(Ft,n))}function ii(e){Ar.current===e&&(Ce(Ft),Ce(Ar))}var Pe=ln(0);function Ma(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var si=[];function oi(){for(var e=0;e<si.length;e++)si[e]._workInProgressVersionPrimary=null;si.length=0}var Ia=Z.ReactCurrentDispatcher,ui=Z.ReactCurrentBatchConfig,En=0,Me=null,Ve=null,He=null,Ta=!1,Or=!1,$r=0,Md=0;function et(){throw Error(m(321))}function ci(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ct(e[n],t[n]))return!1;return!0}function di(e,t,n,r,l,i){if(En=i,Me=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Ia.current=e===null||e.memoizedState===null?Fd:Rd,e=n(r,l),Or){i=0;do{if(Or=!1,$r=0,25<=i)throw Error(m(301));i+=1,He=Ve=null,t.updateQueue=null,Ia.current=Ad,e=n(r,l)}while(Or)}if(Ia.current=Ra,t=Ve!==null&&Ve.next!==null,En=0,He=Ve=Me=null,Ta=!1,t)throw Error(m(300));return e}function pi(){var e=$r!==0;return $r=0,e}function Rt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return He===null?Me.memoizedState=He=e:He=He.next=e,He}function kt(){if(Ve===null){var e=Me.alternate;e=e!==null?e.memoizedState:null}else e=Ve.next;var t=He===null?Me.memoizedState:He.next;if(t!==null)He=t,Ve=e;else{if(e===null)throw Error(m(310));Ve=e,e={memoizedState:Ve.memoizedState,baseState:Ve.baseState,baseQueue:Ve.baseQueue,queue:Ve.queue,next:null},He===null?Me.memoizedState=He=e:He=He.next=e}return He}function Ur(e,t){return typeof t=="function"?t(e):t}function fi(e){var t=kt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=Ve,l=r.baseQueue,i=n.pending;if(i!==null){if(l!==null){var s=l.next;l.next=i.next,i.next=s}r.baseQueue=l=i,n.pending=null}if(l!==null){i=l.next,r=r.baseState;var c=s=null,p=null,x=i;do{var N=x.lane;if((En&N)===N)p!==null&&(p=p.next={lane:0,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null}),r=x.hasEagerState?x.eagerState:e(r,x.action);else{var b={lane:N,action:x.action,hasEagerState:x.hasEagerState,eagerState:x.eagerState,next:null};p===null?(c=p=b,s=r):p=p.next=b,Me.lanes|=N,_n|=N}x=x.next}while(x!==null&&x!==i);p===null?s=r:p.next=c,Ct(r,t.memoizedState)||(ot=!0),t.memoizedState=r,t.baseState=s,t.baseQueue=p,n.lastRenderedState=r}if(e=n.interleaved,e!==null){l=e;do i=l.lane,Me.lanes|=i,_n|=i,l=l.next;while(l!==e)}else l===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function mi(e){var t=kt(),n=t.queue;if(n===null)throw Error(m(311));n.lastRenderedReducer=e;var r=n.dispatch,l=n.pending,i=t.memoizedState;if(l!==null){n.pending=null;var s=l=l.next;do i=e(i,s.action),s=s.next;while(s!==l);Ct(i,t.memoizedState)||(ot=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,r]}function Lo(){}function Fo(e,t){var n=Me,r=kt(),l=t(),i=!Ct(r.memoizedState,l);if(i&&(r.memoizedState=l,ot=!0),r=r.queue,hi(Do.bind(null,n,r,e),[e]),r.getSnapshot!==t||i||He!==null&&He.memoizedState.tag&1){if(n.flags|=2048,Vr(9,Ao.bind(null,n,r,l,t),void 0,null),Qe===null)throw Error(m(349));(En&30)!==0||Ro(n,t,l)}return l}function Ro(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Me.updateQueue,t===null?(t={lastEffect:null,stores:null},Me.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ao(e,t,n,r){t.value=n,t.getSnapshot=r,Oo(t)&&$o(e)}function Do(e,t,n){return n(function(){Oo(t)&&$o(e)})}function Oo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ct(e,n)}catch{return!0}}function $o(e){var t=Wt(e,1);t!==null&&Mt(t,e,1,-1)}function Uo(e){var t=Rt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ur,lastRenderedState:e},t.queue=e,e=e.dispatch=Ld.bind(null,Me,e),[t.memoizedState,e]}function Vr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=Me.updateQueue,t===null?(t={lastEffect:null,stores:null},Me.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Vo(){return kt().memoizedState}function La(e,t,n,r){var l=Rt();Me.flags|=e,l.memoizedState=Vr(1|t,n,void 0,r===void 0?null:r)}function Fa(e,t,n,r){var l=kt();r=r===void 0?null:r;var i=void 0;if(Ve!==null){var s=Ve.memoizedState;if(i=s.destroy,r!==null&&ci(r,s.deps)){l.memoizedState=Vr(t,n,i,r);return}}Me.flags|=e,l.memoizedState=Vr(1|t,n,i,r)}function Bo(e,t){return La(8390656,8,e,t)}function hi(e,t){return Fa(2048,8,e,t)}function Wo(e,t){return Fa(4,2,e,t)}function Ko(e,t){return Fa(4,4,e,t)}function Ho(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Qo(e,t,n){return n=n!=null?n.concat([e]):null,Fa(4,4,Ho.bind(null,t,e),n)}function gi(){}function Go(e,t){var n=kt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ci(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Yo(e,t){var n=kt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ci(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function qo(e,t,n){return(En&21)===0?(e.baseState&&(e.baseState=!1,ot=!0),e.memoizedState=n):(Ct(n,t)||(n=Ss(),Me.lanes|=n,_n|=n,e.baseState=!0),t)}function Id(e,t){var n=ke;ke=n!==0&&4>n?n:4,e(!0);var r=ui.transition;ui.transition={};try{e(!1),t()}finally{ke=n,ui.transition=r}}function Jo(){return kt().memoizedState}function Td(e,t,n){var r=mn(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Xo(e))Zo(t,n);else if(n=zo(e,t,n,r),n!==null){var l=at();Mt(n,e,r,l),eu(n,t,r)}}function Ld(e,t,n){var r=mn(e),l={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Xo(e))Zo(t,l);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var s=t.lastRenderedState,c=i(s,n);if(l.hasEagerState=!0,l.eagerState=c,Ct(c,s)){var p=t.interleaved;p===null?(l.next=l,ri(t)):(l.next=p.next,p.next=l),t.interleaved=l;return}}catch{}finally{}n=zo(e,t,l,r),n!==null&&(l=at(),Mt(n,e,r,l),eu(n,t,r))}}function Xo(e){var t=e.alternate;return e===Me||t!==null&&t===Me}function Zo(e,t){Or=Ta=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function eu(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,xl(e,n)}}var Ra={readContext:wt,useCallback:et,useContext:et,useEffect:et,useImperativeHandle:et,useInsertionEffect:et,useLayoutEffect:et,useMemo:et,useReducer:et,useRef:et,useState:et,useDebugValue:et,useDeferredValue:et,useTransition:et,useMutableSource:et,useSyncExternalStore:et,useId:et,unstable_isNewReconciler:!1},Fd={readContext:wt,useCallback:function(e,t){return Rt().memoizedState=[e,t===void 0?null:t],e},useContext:wt,useEffect:Bo,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,La(4194308,4,Ho.bind(null,t,e),n)},useLayoutEffect:function(e,t){return La(4194308,4,e,t)},useInsertionEffect:function(e,t){return La(4,2,e,t)},useMemo:function(e,t){var n=Rt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Rt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Td.bind(null,Me,e),[r.memoizedState,e]},useRef:function(e){var t=Rt();return e={current:e},t.memoizedState=e},useState:Uo,useDebugValue:gi,useDeferredValue:function(e){return Rt().memoizedState=e},useTransition:function(){var e=Uo(!1),t=e[0];return e=Id.bind(null,e[1]),Rt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=Me,l=Rt();if(Ee){if(n===void 0)throw Error(m(407));n=n()}else{if(n=t(),Qe===null)throw Error(m(349));(En&30)!==0||Ro(r,t,n)}l.memoizedState=n;var i={value:n,getSnapshot:t};return l.queue=i,Bo(Do.bind(null,r,i,e),[e]),r.flags|=2048,Vr(9,Ao.bind(null,r,i,n,t),void 0,null),n},useId:function(){var e=Rt(),t=Qe.identifierPrefix;if(Ee){var n=Bt,r=Vt;n=(r&~(1<<32-St(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=$r++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Md++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Rd={readContext:wt,useCallback:Go,useContext:wt,useEffect:hi,useImperativeHandle:Qo,useInsertionEffect:Wo,useLayoutEffect:Ko,useMemo:Yo,useReducer:fi,useRef:Vo,useState:function(){return fi(Ur)},useDebugValue:gi,useDeferredValue:function(e){var t=kt();return qo(t,Ve.memoizedState,e)},useTransition:function(){var e=fi(Ur)[0],t=kt().memoizedState;return[e,t]},useMutableSource:Lo,useSyncExternalStore:Fo,useId:Jo,unstable_isNewReconciler:!1},Ad={readContext:wt,useCallback:Go,useContext:wt,useEffect:hi,useImperativeHandle:Qo,useInsertionEffect:Wo,useLayoutEffect:Ko,useMemo:Yo,useReducer:mi,useRef:Vo,useState:function(){return mi(Ur)},useDebugValue:gi,useDeferredValue:function(e){var t=kt();return Ve===null?t.memoizedState=e:qo(t,Ve.memoizedState,e)},useTransition:function(){var e=mi(Ur)[0],t=kt().memoizedState;return[e,t]},useMutableSource:Lo,useSyncExternalStore:Fo,useId:Jo,unstable_isNewReconciler:!1};function _t(e,t){if(e&&e.defaultProps){t=u({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function vi(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:u({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Aa={isMounted:function(e){return(e=e._reactInternals)?wn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=at(),l=mn(e),i=Kt(r,l);i.payload=t,n!=null&&(i.callback=n),t=cn(e,i,l),t!==null&&(Mt(t,e,l,r),za(t,e,l))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=at(),l=mn(e),i=Kt(r,l);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=cn(e,i,l),t!==null&&(Mt(t,e,l,r),za(t,e,l))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=at(),r=mn(e),l=Kt(n,r);l.tag=2,t!=null&&(l.callback=t),t=cn(e,l,r),t!==null&&(Mt(t,e,r,n),za(t,e,r))}};function tu(e,t,n,r,l,i,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,i,s):t.prototype&&t.prototype.isPureReactComponent?!_r(n,r)||!_r(l,i):!0}function nu(e,t,n){var r=!1,l=sn,i=t.contextType;return typeof i=="object"&&i!==null?i=wt(i):(l=st(t)?jn:Ze.current,r=t.contextTypes,i=(r=r!=null)?Yn(e,l):sn),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Aa,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=l,e.__reactInternalMemoizedMaskedChildContext=i),t}function ru(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Aa.enqueueReplaceState(t,t.state,null)}function xi(e,t,n,r){var l=e.stateNode;l.props=n,l.state=e.memoizedState,l.refs={},ai(e);var i=t.contextType;typeof i=="object"&&i!==null?l.context=wt(i):(i=st(t)?jn:Ze.current,l.context=Yn(e,i)),l.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(vi(e,t,i,n),l.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(t=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),t!==l.state&&Aa.enqueueReplaceState(l,l.state,null),Pa(e,n,l,r),l.state=e.memoizedState),typeof l.componentDidMount=="function"&&(e.flags|=4194308)}function rr(e,t){try{var n="",r=t;do n+=R(r),r=r.return;while(r);var l=n}catch(i){l=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:l,digest:null}}function yi(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function wi(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Dd=typeof WeakMap=="function"?WeakMap:Map;function au(e,t,n){n=Kt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){Wa||(Wa=!0,Fi=r),wi(e,t)},n}function lu(e,t,n){n=Kt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var l=t.value;n.payload=function(){return r(l)},n.callback=function(){wi(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){wi(e,t),typeof r!="function"&&(pn===null?pn=new Set([this]):pn.add(this));var s=t.stack;this.componentDidCatch(t.value,{componentStack:s!==null?s:""})}),n}function iu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Dd;var l=new Set;r.set(t,l)}else l=r.get(t),l===void 0&&(l=new Set,r.set(t,l));l.has(n)||(l.add(n),e=Xd.bind(null,e,t,n),t.then(e,e))}function su(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function ou(e,t,n,r,l){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Kt(-1,1),t.tag=2,cn(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=l,e)}var Od=Z.ReactCurrentOwner,ot=!1;function rt(e,t,n,r){t.child=e===null?_o(t,null,n,r):Zn(t,e.child,n,r)}function uu(e,t,n,r,l){n=n.render;var i=t.ref;return tr(t,l),r=di(e,t,n,r,i,l),n=pi(),e!==null&&!ot?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Ht(e,t,l)):(Ee&&n&&Gl(t),t.flags|=1,rt(e,t,r,l),t.child)}function cu(e,t,n,r,l){if(e===null){var i=n.type;return typeof i=="function"&&!Vi(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,du(e,t,i,r,l)):(e=qa(n.type,null,r,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,(e.lanes&l)===0){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:_r,n(s,r)&&e.ref===t.ref)return Ht(e,t,l)}return t.flags|=1,e=gn(i,r),e.ref=t.ref,e.return=t,t.child=e}function du(e,t,n,r,l){if(e!==null){var i=e.memoizedProps;if(_r(i,r)&&e.ref===t.ref)if(ot=!1,t.pendingProps=r=i,(e.lanes&l)!==0)(e.flags&131072)!==0&&(ot=!0);else return t.lanes=e.lanes,Ht(e,t,l)}return ki(e,t,n,r,l)}function pu(e,t,n){var r=t.pendingProps,l=r.children,i=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},be(lr,ht),ht|=n;else{if((n&1073741824)===0)return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,be(lr,ht),ht|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,be(lr,ht),ht|=r}else i!==null?(r=i.baseLanes|n,t.memoizedState=null):r=n,be(lr,ht),ht|=r;return rt(e,t,l,n),t.child}function fu(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ki(e,t,n,r,l){var i=st(n)?jn:Ze.current;return i=Yn(t,i),tr(t,l),n=di(e,t,n,r,i,l),r=pi(),e!==null&&!ot?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Ht(e,t,l)):(Ee&&r&&Gl(t),t.flags|=1,rt(e,t,n,l),t.child)}function mu(e,t,n,r,l){if(st(n)){var i=!0;ka(t)}else i=!1;if(tr(t,l),t.stateNode===null)Oa(e,t),nu(t,n,r),xi(t,n,r,l),r=!0;else if(e===null){var s=t.stateNode,c=t.memoizedProps;s.props=c;var p=s.context,x=n.contextType;typeof x=="object"&&x!==null?x=wt(x):(x=st(n)?jn:Ze.current,x=Yn(t,x));var N=n.getDerivedStateFromProps,b=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function";b||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==r||p!==x)&&ru(t,s,r,x),un=!1;var j=t.memoizedState;s.state=j,Pa(t,r,s,l),p=t.memoizedState,c!==r||j!==p||it.current||un?(typeof N=="function"&&(vi(t,n,N,r),p=t.memoizedState),(c=un||tu(t,n,c,r,j,p,x))?(b||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=p),s.props=r,s.state=p,s.context=x,r=c):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{s=t.stateNode,Po(e,t),c=t.memoizedProps,x=t.type===t.elementType?c:_t(t.type,c),s.props=x,b=t.pendingProps,j=s.context,p=n.contextType,typeof p=="object"&&p!==null?p=wt(p):(p=st(n)?jn:Ze.current,p=Yn(t,p));var $=n.getDerivedStateFromProps;(N=typeof $=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==b||j!==p)&&ru(t,s,r,p),un=!1,j=t.memoizedState,s.state=j,Pa(t,r,s,l);var K=t.memoizedState;c!==b||j!==K||it.current||un?(typeof $=="function"&&(vi(t,n,$,r),K=t.memoizedState),(x=un||tu(t,n,x,r,j,K,p)||!1)?(N||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(r,K,p),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(r,K,p)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&j===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&j===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=K),s.props=r,s.state=K,s.context=p,r=x):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&j===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&j===e.memoizedState||(t.flags|=1024),r=!1)}return ji(e,t,n,r,i,l)}function ji(e,t,n,r,l,i){fu(e,t);var s=(t.flags&128)!==0;if(!r&&!s)return l&&yo(t,n,!1),Ht(e,t,i);r=t.stateNode,Od.current=t;var c=s&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&s?(t.child=Zn(t,e.child,null,i),t.child=Zn(t,null,c,i)):rt(e,t,c,i),t.memoizedState=r.state,l&&yo(t,n,!0),t.child}function hu(e){var t=e.stateNode;t.pendingContext?vo(e,t.pendingContext,t.pendingContext!==t.context):t.context&&vo(e,t.context,!1),li(e,t.containerInfo)}function gu(e,t,n,r,l){return Xn(),Xl(l),t.flags|=256,rt(e,t,n,r),t.child}var Ni={dehydrated:null,treeContext:null,retryLane:0};function bi(e){return{baseLanes:e,cachePool:null,transitions:null}}function vu(e,t,n){var r=t.pendingProps,l=Pe.current,i=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(l&2)!==0),c?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(l|=1),be(Pe,l&1),e===null)return Jl(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(s=r.children,e=r.fallback,i?(r=t.mode,i=t.child,s={mode:"hidden",children:s},(r&1)===0&&i!==null?(i.childLanes=0,i.pendingProps=s):i=Ja(s,r,0,null),e=In(e,r,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=bi(n),t.memoizedState=Ni,e):Si(t,s));if(l=e.memoizedState,l!==null&&(c=l.dehydrated,c!==null))return $d(e,t,s,r,c,l,n);if(i){i=r.fallback,s=t.mode,l=e.child,c=l.sibling;var p={mode:"hidden",children:r.children};return(s&1)===0&&t.child!==l?(r=t.child,r.childLanes=0,r.pendingProps=p,t.deletions=null):(r=gn(l,p),r.subtreeFlags=l.subtreeFlags&14680064),c!==null?i=gn(c,i):(i=In(i,s,n,null),i.flags|=2),i.return=t,r.return=t,r.sibling=i,t.child=r,r=i,i=t.child,s=e.child.memoizedState,s=s===null?bi(n):{baseLanes:s.baseLanes|n,cachePool:null,transitions:s.transitions},i.memoizedState=s,i.childLanes=e.childLanes&~n,t.memoizedState=Ni,r}return i=e.child,e=i.sibling,r=gn(i,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function Si(e,t){return t=Ja({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Da(e,t,n,r){return r!==null&&Xl(r),Zn(t,e.child,null,n),e=Si(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function $d(e,t,n,r,l,i,s){if(n)return t.flags&256?(t.flags&=-257,r=yi(Error(m(422))),Da(e,t,s,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=r.fallback,l=t.mode,r=Ja({mode:"visible",children:r.children},l,0,null),i=In(i,l,s,null),i.flags|=2,r.return=t,i.return=t,r.sibling=i,t.child=r,(t.mode&1)!==0&&Zn(t,e.child,null,s),t.child.memoizedState=bi(s),t.memoizedState=Ni,i);if((t.mode&1)===0)return Da(e,t,s,null);if(l.data==="$!"){if(r=l.nextSibling&&l.nextSibling.dataset,r)var c=r.dgst;return r=c,i=Error(m(419)),r=yi(i,r,void 0),Da(e,t,s,r)}if(c=(s&e.childLanes)!==0,ot||c){if(r=Qe,r!==null){switch(s&-s){case 4:l=2;break;case 16:l=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:l=32;break;case 536870912:l=268435456;break;default:l=0}l=(l&(r.suspendedLanes|s))!==0?0:l,l!==0&&l!==i.retryLane&&(i.retryLane=l,Wt(e,l),Mt(r,e,l,-1))}return Ui(),r=yi(Error(m(421))),Da(e,t,s,r)}return l.data==="$?"?(t.flags|=128,t.child=e.child,t=Zd.bind(null,e),l._reactRetry=t,null):(e=i.treeContext,mt=an(l.nextSibling),ft=t,Ee=!0,Et=null,e!==null&&(xt[yt++]=Vt,xt[yt++]=Bt,xt[yt++]=Nn,Vt=e.id,Bt=e.overflow,Nn=t),t=Si(t,r.children),t.flags|=4096,t)}function xu(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ni(e.return,t,n)}function Ci(e,t,n,r,l){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:l}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=l)}function yu(e,t,n){var r=t.pendingProps,l=r.revealOrder,i=r.tail;if(rt(e,t,r.children,n),r=Pe.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&xu(e,n,t);else if(e.tag===19)xu(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(be(Pe,r),(t.mode&1)===0)t.memoizedState=null;else switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&Ma(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),Ci(t,!1,l,n,i);break;case"backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&Ma(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}Ci(t,!0,n,null,i);break;case"together":Ci(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Oa(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Ht(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),_n|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(m(153));if(t.child!==null){for(e=t.child,n=gn(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=gn(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Ud(e,t,n){switch(t.tag){case 3:hu(t),Xn();break;case 5:To(t);break;case 1:st(t.type)&&ka(t);break;case 4:li(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,l=t.memoizedProps.value;be(Ea,r._currentValue),r._currentValue=l;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(be(Pe,Pe.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?vu(e,t,n):(be(Pe,Pe.current&1),e=Ht(e,t,n),e!==null?e.sibling:null);be(Pe,Pe.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return yu(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),be(Pe,Pe.current),r)break;return null;case 22:case 23:return t.lanes=0,pu(e,t,n)}return Ht(e,t,n)}var wu,Ei,ku,ju;wu=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},Ei=function(){},ku=function(e,t,n,r){var l=e.memoizedProps;if(l!==r){e=t.stateNode,Cn(Ft.current);var i=null;switch(n){case"input":l=de(e,l),r=de(e,r),i=[];break;case"select":l=u({},l,{value:void 0}),r=u({},r,{value:void 0}),i=[];break;case"textarea":l=Dt(e,l),r=Dt(e,r),i=[];break;default:typeof l.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=xa)}qt(n,r);var s;n=null;for(x in l)if(!r.hasOwnProperty(x)&&l.hasOwnProperty(x)&&l[x]!=null)if(x==="style"){var c=l[x];for(s in c)c.hasOwnProperty(s)&&(n||(n={}),n[s]="")}else x!=="dangerouslySetInnerHTML"&&x!=="children"&&x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&x!=="autoFocus"&&(T.hasOwnProperty(x)?i||(i=[]):(i=i||[]).push(x,null));for(x in r){var p=r[x];if(c=l!=null?l[x]:void 0,r.hasOwnProperty(x)&&p!==c&&(p!=null||c!=null))if(x==="style")if(c){for(s in c)!c.hasOwnProperty(s)||p&&p.hasOwnProperty(s)||(n||(n={}),n[s]="");for(s in p)p.hasOwnProperty(s)&&c[s]!==p[s]&&(n||(n={}),n[s]=p[s])}else n||(i||(i=[]),i.push(x,n)),n=p;else x==="dangerouslySetInnerHTML"?(p=p?p.__html:void 0,c=c?c.__html:void 0,p!=null&&c!==p&&(i=i||[]).push(x,p)):x==="children"?typeof p!="string"&&typeof p!="number"||(i=i||[]).push(x,""+p):x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&(T.hasOwnProperty(x)?(p!=null&&x==="onScroll"&&Se("scroll",e),i||c===p||(i=[])):(i=i||[]).push(x,p))}n&&(i=i||[]).push("style",n);var x=i;(t.updateQueue=x)&&(t.flags|=4)}},ju=function(e,t,n,r){n!==r&&(t.flags|=4)};function Br(e,t){if(!Ee)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function tt(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags&14680064,r|=l.flags&14680064,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Vd(e,t,n){var r=t.pendingProps;switch(Yl(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return tt(t),null;case 1:return st(t.type)&&wa(),tt(t),null;case 3:return r=t.stateNode,nr(),Ce(it),Ce(Ze),oi(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Sa(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Et!==null&&(Di(Et),Et=null))),Ei(e,t),tt(t),null;case 5:ii(t);var l=Cn(Dr.current);if(n=t.type,e!==null&&t.stateNode!=null)ku(e,t,n,r,l),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(m(166));return tt(t),null}if(e=Cn(Ft.current),Sa(t)){r=t.stateNode,n=t.type;var i=t.memoizedProps;switch(r[Lt]=t,r[Tr]=i,e=(t.mode&1)!==0,n){case"dialog":Se("cancel",r),Se("close",r);break;case"iframe":case"object":case"embed":Se("load",r);break;case"video":case"audio":for(l=0;l<Pr.length;l++)Se(Pr[l],r);break;case"source":Se("error",r);break;case"img":case"image":case"link":Se("error",r),Se("load",r);break;case"details":Se("toggle",r);break;case"input":Ue(r,i),Se("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},Se("invalid",r);break;case"textarea":Ln(r,i),Se("invalid",r)}qt(n,i),l=null;for(var s in i)if(i.hasOwnProperty(s)){var c=i[s];s==="children"?typeof c=="string"?r.textContent!==c&&(i.suppressHydrationWarning!==!0&&va(r.textContent,c,e),l=["children",c]):typeof c=="number"&&r.textContent!==""+c&&(i.suppressHydrationWarning!==!0&&va(r.textContent,c,e),l=["children",""+c]):T.hasOwnProperty(s)&&c!=null&&s==="onScroll"&&Se("scroll",r)}switch(n){case"input":fe(r),Xe(r,i,!0);break;case"textarea":fe(r),Fn(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=xa)}r=l,t.updateQueue=r,r!==null&&(t.flags|=4)}else{s=l.nodeType===9?l:l.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=yn(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=s.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=s.createElement(n,{is:r.is}):(e=s.createElement(n),n==="select"&&(s=e,r.multiple?s.multiple=!0:r.size&&(s.size=r.size))):e=s.createElementNS(e,n),e[Lt]=t,e[Tr]=r,wu(e,t,!1,!1),t.stateNode=e;e:{switch(s=Jt(n,r),n){case"dialog":Se("cancel",e),Se("close",e),l=r;break;case"iframe":case"object":case"embed":Se("load",e),l=r;break;case"video":case"audio":for(l=0;l<Pr.length;l++)Se(Pr[l],e);l=r;break;case"source":Se("error",e),l=r;break;case"img":case"image":case"link":Se("error",e),Se("load",e),l=r;break;case"details":Se("toggle",e),l=r;break;case"input":Ue(e,r),l=de(e,r),Se("invalid",e);break;case"option":l=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},l=u({},r,{value:void 0}),Se("invalid",e);break;case"textarea":Ln(e,r),l=Dt(e,r),Se("invalid",e);break;default:l=r}qt(n,l),c=l;for(i in c)if(c.hasOwnProperty(i)){var p=c[i];i==="style"?Re(e,p):i==="dangerouslySetInnerHTML"?(p=p?p.__html:void 0,p!=null&&Yt(e,p)):i==="children"?typeof p=="string"?(n!=="textarea"||p!=="")&&bt(e,p):typeof p=="number"&&bt(e,""+p):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(T.hasOwnProperty(i)?p!=null&&i==="onScroll"&&Se("scroll",e):p!=null&&y(e,i,p,s))}switch(n){case"input":fe(e),Xe(e,r,!1);break;case"textarea":fe(e),Fn(e);break;case"option":r.value!=null&&e.setAttribute("value",""+V(r.value));break;case"select":e.multiple=!!r.multiple,i=r.value,i!=null?It(e,!!r.multiple,i,!1):r.defaultValue!=null&&It(e,!!r.multiple,r.defaultValue,!0);break;default:typeof l.onClick=="function"&&(e.onclick=xa)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return tt(t),null;case 6:if(e&&t.stateNode!=null)ju(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(m(166));if(n=Cn(Dr.current),Cn(Ft.current),Sa(t)){if(r=t.stateNode,n=t.memoizedProps,r[Lt]=t,(i=r.nodeValue!==n)&&(e=ft,e!==null))switch(e.tag){case 3:va(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&va(r.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Lt]=t,t.stateNode=r}return tt(t),null;case 13:if(Ce(Pe),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(Ee&&mt!==null&&(t.mode&1)!==0&&(t.flags&128)===0)So(),Xn(),t.flags|=98560,i=!1;else if(i=Sa(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(m(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(m(317));i[Lt]=t}else Xn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;tt(t),i=!1}else Et!==null&&(Di(Et),Et=null),i=!0;if(!i)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Pe.current&1)!==0?Be===0&&(Be=3):Ui())),t.updateQueue!==null&&(t.flags|=4),tt(t),null);case 4:return nr(),Ei(e,t),e===null&&Mr(t.stateNode.containerInfo),tt(t),null;case 10:return ti(t.type._context),tt(t),null;case 17:return st(t.type)&&wa(),tt(t),null;case 19:if(Ce(Pe),i=t.memoizedState,i===null)return tt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Br(i,!1);else{if(Be!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Ma(e),s!==null){for(t.flags|=128,Br(i,!1),r=s.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)i=n,e=r,i.flags&=14680066,s=i.alternate,s===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=s.childLanes,i.lanes=s.lanes,i.child=s.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=s.memoizedProps,i.memoizedState=s.memoizedState,i.updateQueue=s.updateQueue,i.type=s.type,e=s.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return be(Pe,Pe.current&1|2),t.child}e=e.sibling}i.tail!==null&&Ae()>ir&&(t.flags|=128,r=!0,Br(i,!1),t.lanes=4194304)}else{if(!r)if(e=Ma(s),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Br(i,!0),i.tail===null&&i.tailMode==="hidden"&&!s.alternate&&!Ee)return tt(t),null}else 2*Ae()-i.renderingStartTime>ir&&n!==1073741824&&(t.flags|=128,r=!0,Br(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(n=i.last,n!==null?n.sibling=s:t.child=s,i.last=s)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=Ae(),t.sibling=null,n=Pe.current,be(Pe,r?n&1|2:n&1),t):(tt(t),null);case 22:case 23:return $i(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(ht&1073741824)!==0&&(tt(t),t.subtreeFlags&6&&(t.flags|=8192)):tt(t),null;case 24:return null;case 25:return null}throw Error(m(156,t.tag))}function Bd(e,t){switch(Yl(t),t.tag){case 1:return st(t.type)&&wa(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return nr(),Ce(it),Ce(Ze),oi(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return ii(t),null;case 13:if(Ce(Pe),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(m(340));Xn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ce(Pe),null;case 4:return nr(),null;case 10:return ti(t.type._context),null;case 22:case 23:return $i(),null;case 24:return null;default:return null}}var $a=!1,nt=!1,Wd=typeof WeakSet=="function"?WeakSet:Set,W=null;function ar(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Fe(e,t,r)}else n.current=null}function _i(e,t,n){try{n()}catch(r){Fe(e,t,r)}}var Nu=!1;function Kd(e,t){if($l=ia,e=eo(),Il(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var l=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,c=-1,p=-1,x=0,N=0,b=e,j=null;t:for(;;){for(var $;b!==n||l!==0&&b.nodeType!==3||(c=s+l),b!==i||r!==0&&b.nodeType!==3||(p=s+r),b.nodeType===3&&(s+=b.nodeValue.length),($=b.firstChild)!==null;)j=b,b=$;for(;;){if(b===e)break t;if(j===n&&++x===l&&(c=s),j===i&&++N===r&&(p=s),($=b.nextSibling)!==null)break;b=j,j=b.parentNode}b=$}n=c===-1||p===-1?null:{start:c,end:p}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ul={focusedElem:e,selectionRange:n},ia=!1,W=t;W!==null;)if(t=W,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,W=e;else for(;W!==null;){t=W;try{var K=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(K!==null){var H=K.memoizedProps,De=K.memoizedState,h=t.stateNode,f=h.getSnapshotBeforeUpdate(t.elementType===t.type?H:_t(t.type,H),De);h.__reactInternalSnapshotBeforeUpdate=f}break;case 3:var v=t.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(m(163))}}catch(_){Fe(t,t.return,_)}if(e=t.sibling,e!==null){e.return=t.return,W=e;break}W=t.return}return K=Nu,Nu=!1,K}function Wr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&e)===e){var i=l.destroy;l.destroy=void 0,i!==void 0&&_i(t,n,i)}l=l.next}while(l!==r)}}function Ua(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function zi(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function bu(e){var t=e.alternate;t!==null&&(e.alternate=null,bu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Lt],delete t[Tr],delete t[Kl],delete t[Ed],delete t[_d])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Su(e){return e.tag===5||e.tag===3||e.tag===4}function Cu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Su(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Pi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=xa));else if(r!==4&&(e=e.child,e!==null))for(Pi(e,t,n),e=e.sibling;e!==null;)Pi(e,t,n),e=e.sibling}function Mi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Mi(e,t,n),e=e.sibling;e!==null;)Mi(e,t,n),e=e.sibling}var Ye=null,zt=!1;function dn(e,t,n){for(n=n.child;n!==null;)Eu(e,t,n),n=n.sibling}function Eu(e,t,n){if(Tt&&typeof Tt.onCommitFiberUnmount=="function")try{Tt.onCommitFiberUnmount(ea,n)}catch{}switch(n.tag){case 5:nt||ar(n,t);case 6:var r=Ye,l=zt;Ye=null,dn(e,t,n),Ye=r,zt=l,Ye!==null&&(zt?(e=Ye,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):Ye.removeChild(n.stateNode));break;case 18:Ye!==null&&(zt?(e=Ye,n=n.stateNode,e.nodeType===8?Wl(e.parentNode,n):e.nodeType===1&&Wl(e,n),jr(e)):Wl(Ye,n.stateNode));break;case 4:r=Ye,l=zt,Ye=n.stateNode.containerInfo,zt=!0,dn(e,t,n),Ye=r,zt=l;break;case 0:case 11:case 14:case 15:if(!nt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){l=r=r.next;do{var i=l,s=i.destroy;i=i.tag,s!==void 0&&((i&2)!==0||(i&4)!==0)&&_i(n,t,s),l=l.next}while(l!==r)}dn(e,t,n);break;case 1:if(!nt&&(ar(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(c){Fe(n,t,c)}dn(e,t,n);break;case 21:dn(e,t,n);break;case 22:n.mode&1?(nt=(r=nt)||n.memoizedState!==null,dn(e,t,n),nt=r):dn(e,t,n);break;default:dn(e,t,n)}}function _u(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Wd),t.forEach(function(r){var l=ep.bind(null,e,r);n.has(r)||(n.add(r),r.then(l,l))})}}function Pt(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var l=n[r];try{var i=e,s=t,c=s;e:for(;c!==null;){switch(c.tag){case 5:Ye=c.stateNode,zt=!1;break e;case 3:Ye=c.stateNode.containerInfo,zt=!0;break e;case 4:Ye=c.stateNode.containerInfo,zt=!0;break e}c=c.return}if(Ye===null)throw Error(m(160));Eu(i,s,l),Ye=null,zt=!1;var p=l.alternate;p!==null&&(p.return=null),l.return=null}catch(x){Fe(l,t,x)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)zu(t,e),t=t.sibling}function zu(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Pt(t,e),At(e),r&4){try{Wr(3,e,e.return),Ua(3,e)}catch(H){Fe(e,e.return,H)}try{Wr(5,e,e.return)}catch(H){Fe(e,e.return,H)}}break;case 1:Pt(t,e),At(e),r&512&&n!==null&&ar(n,n.return);break;case 5:if(Pt(t,e),At(e),r&512&&n!==null&&ar(n,n.return),e.flags&32){var l=e.stateNode;try{bt(l,"")}catch(H){Fe(e,e.return,H)}}if(r&4&&(l=e.stateNode,l!=null)){var i=e.memoizedProps,s=n!==null?n.memoizedProps:i,c=e.type,p=e.updateQueue;if(e.updateQueue=null,p!==null)try{c==="input"&&i.type==="radio"&&i.name!=null&&Je(l,i),Jt(c,s);var x=Jt(c,i);for(s=0;s<p.length;s+=2){var N=p[s],b=p[s+1];N==="style"?Re(l,b):N==="dangerouslySetInnerHTML"?Yt(l,b):N==="children"?bt(l,b):y(l,N,b,x)}switch(c){case"input":Ke(l,i);break;case"textarea":xn(l,i);break;case"select":var j=l._wrapperState.wasMultiple;l._wrapperState.wasMultiple=!!i.multiple;var $=i.value;$!=null?It(l,!!i.multiple,$,!1):j!==!!i.multiple&&(i.defaultValue!=null?It(l,!!i.multiple,i.defaultValue,!0):It(l,!!i.multiple,i.multiple?[]:"",!1))}l[Tr]=i}catch(H){Fe(e,e.return,H)}}break;case 6:if(Pt(t,e),At(e),r&4){if(e.stateNode===null)throw Error(m(162));l=e.stateNode,i=e.memoizedProps;try{l.nodeValue=i}catch(H){Fe(e,e.return,H)}}break;case 3:if(Pt(t,e),At(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{jr(t.containerInfo)}catch(H){Fe(e,e.return,H)}break;case 4:Pt(t,e),At(e);break;case 13:Pt(t,e),At(e),l=e.child,l.flags&8192&&(i=l.memoizedState!==null,l.stateNode.isHidden=i,!i||l.alternate!==null&&l.alternate.memoizedState!==null||(Li=Ae())),r&4&&_u(e);break;case 22:if(N=n!==null&&n.memoizedState!==null,e.mode&1?(nt=(x=nt)||N,Pt(t,e),nt=x):Pt(t,e),At(e),r&8192){if(x=e.memoizedState!==null,(e.stateNode.isHidden=x)&&!N&&(e.mode&1)!==0)for(W=e,N=e.child;N!==null;){for(b=W=N;W!==null;){switch(j=W,$=j.child,j.tag){case 0:case 11:case 14:case 15:Wr(4,j,j.return);break;case 1:ar(j,j.return);var K=j.stateNode;if(typeof K.componentWillUnmount=="function"){r=j,n=j.return;try{t=r,K.props=t.memoizedProps,K.state=t.memoizedState,K.componentWillUnmount()}catch(H){Fe(r,n,H)}}break;case 5:ar(j,j.return);break;case 22:if(j.memoizedState!==null){Iu(b);continue}}$!==null?($.return=j,W=$):Iu(b)}N=N.sibling}e:for(N=null,b=e;;){if(b.tag===5){if(N===null){N=b;try{l=b.stateNode,x?(i=l.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(c=b.stateNode,p=b.memoizedProps.style,s=p!=null&&p.hasOwnProperty("display")?p.display:null,c.style.display=re("display",s))}catch(H){Fe(e,e.return,H)}}}else if(b.tag===6){if(N===null)try{b.stateNode.nodeValue=x?"":b.memoizedProps}catch(H){Fe(e,e.return,H)}}else if((b.tag!==22&&b.tag!==23||b.memoizedState===null||b===e)&&b.child!==null){b.child.return=b,b=b.child;continue}if(b===e)break e;for(;b.sibling===null;){if(b.return===null||b.return===e)break e;N===b&&(N=null),b=b.return}N===b&&(N=null),b.sibling.return=b.return,b=b.sibling}}break;case 19:Pt(t,e),At(e),r&4&&_u(e);break;case 21:break;default:Pt(t,e),At(e)}}function At(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Su(n)){var r=n;break e}n=n.return}throw Error(m(160))}switch(r.tag){case 5:var l=r.stateNode;r.flags&32&&(bt(l,""),r.flags&=-33);var i=Cu(e);Mi(e,i,l);break;case 3:case 4:var s=r.stateNode.containerInfo,c=Cu(e);Pi(e,c,s);break;default:throw Error(m(161))}}catch(p){Fe(e,e.return,p)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Hd(e,t,n){W=e,Pu(e)}function Pu(e,t,n){for(var r=(e.mode&1)!==0;W!==null;){var l=W,i=l.child;if(l.tag===22&&r){var s=l.memoizedState!==null||$a;if(!s){var c=l.alternate,p=c!==null&&c.memoizedState!==null||nt;c=$a;var x=nt;if($a=s,(nt=p)&&!x)for(W=l;W!==null;)s=W,p=s.child,s.tag===22&&s.memoizedState!==null?Tu(l):p!==null?(p.return=s,W=p):Tu(l);for(;i!==null;)W=i,Pu(i),i=i.sibling;W=l,$a=c,nt=x}Mu(e)}else(l.subtreeFlags&8772)!==0&&i!==null?(i.return=l,W=i):Mu(e)}}function Mu(e){for(;W!==null;){var t=W;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:nt||Ua(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!nt)if(n===null)r.componentDidMount();else{var l=t.elementType===t.type?n.memoizedProps:_t(t.type,n.memoizedProps);r.componentDidUpdate(l,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&Io(t,i,r);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Io(t,s,n)}break;case 5:var c=t.stateNode;if(n===null&&t.flags&4){n=c;var p=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":p.autoFocus&&n.focus();break;case"img":p.src&&(n.src=p.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var x=t.alternate;if(x!==null){var N=x.memoizedState;if(N!==null){var b=N.dehydrated;b!==null&&jr(b)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(m(163))}nt||t.flags&512&&zi(t)}catch(j){Fe(t,t.return,j)}}if(t===e){W=null;break}if(n=t.sibling,n!==null){n.return=t.return,W=n;break}W=t.return}}function Iu(e){for(;W!==null;){var t=W;if(t===e){W=null;break}var n=t.sibling;if(n!==null){n.return=t.return,W=n;break}W=t.return}}function Tu(e){for(;W!==null;){var t=W;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Ua(4,t)}catch(p){Fe(t,n,p)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var l=t.return;try{r.componentDidMount()}catch(p){Fe(t,l,p)}}var i=t.return;try{zi(t)}catch(p){Fe(t,i,p)}break;case 5:var s=t.return;try{zi(t)}catch(p){Fe(t,s,p)}}}catch(p){Fe(t,t.return,p)}if(t===e){W=null;break}var c=t.sibling;if(c!==null){c.return=t.return,W=c;break}W=t.return}}var Qd=Math.ceil,Va=Z.ReactCurrentDispatcher,Ii=Z.ReactCurrentOwner,jt=Z.ReactCurrentBatchConfig,ve=0,Qe=null,$e=null,qe=0,ht=0,lr=ln(0),Be=0,Kr=null,_n=0,Ba=0,Ti=0,Hr=null,ut=null,Li=0,ir=1/0,Qt=null,Wa=!1,Fi=null,pn=null,Ka=!1,fn=null,Ha=0,Qr=0,Ri=null,Qa=-1,Ga=0;function at(){return(ve&6)!==0?Ae():Qa!==-1?Qa:Qa=Ae()}function mn(e){return(e.mode&1)===0?1:(ve&2)!==0&&qe!==0?qe&-qe:Pd.transition!==null?(Ga===0&&(Ga=Ss()),Ga):(e=ke,e!==0||(e=window.event,e=e===void 0?16:Ls(e.type)),e)}function Mt(e,t,n,r){if(50<Qr)throw Qr=0,Ri=null,Error(m(185));vr(e,n,r),((ve&2)===0||e!==Qe)&&(e===Qe&&((ve&2)===0&&(Ba|=n),Be===4&&hn(e,qe)),ct(e,r),n===1&&ve===0&&(t.mode&1)===0&&(ir=Ae()+500,ja&&on()))}function ct(e,t){var n=e.callbackNode;Pc(e,t);var r=ra(e,e===Qe?qe:0);if(r===0)n!==null&&js(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&js(n),t===1)e.tag===0?zd(Fu.bind(null,e)):wo(Fu.bind(null,e)),Sd(function(){(ve&6)===0&&on()}),n=null;else{switch(Cs(r)){case 1:n=hl;break;case 4:n=Ns;break;case 16:n=Zr;break;case 536870912:n=bs;break;default:n=Zr}n=Bu(n,Lu.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Lu(e,t){if(Qa=-1,Ga=0,(ve&6)!==0)throw Error(m(327));var n=e.callbackNode;if(sr()&&e.callbackNode!==n)return null;var r=ra(e,e===Qe?qe:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=Ya(e,r);else{t=r;var l=ve;ve|=2;var i=Au();(Qe!==e||qe!==t)&&(Qt=null,ir=Ae()+500,Pn(e,t));do try{qd();break}catch(c){Ru(e,c)}while(!0);ei(),Va.current=i,ve=l,$e!==null?t=0:(Qe=null,qe=0,t=Be)}if(t!==0){if(t===2&&(l=gl(e),l!==0&&(r=l,t=Ai(e,l))),t===1)throw n=Kr,Pn(e,0),hn(e,r),ct(e,Ae()),n;if(t===6)hn(e,r);else{if(l=e.current.alternate,(r&30)===0&&!Gd(l)&&(t=Ya(e,r),t===2&&(i=gl(e),i!==0&&(r=i,t=Ai(e,i))),t===1))throw n=Kr,Pn(e,0),hn(e,r),ct(e,Ae()),n;switch(e.finishedWork=l,e.finishedLanes=r,t){case 0:case 1:throw Error(m(345));case 2:Mn(e,ut,Qt);break;case 3:if(hn(e,r),(r&130023424)===r&&(t=Li+500-Ae(),10<t)){if(ra(e,0)!==0)break;if(l=e.suspendedLanes,(l&r)!==r){at(),e.pingedLanes|=e.suspendedLanes&l;break}e.timeoutHandle=Bl(Mn.bind(null,e,ut,Qt),t);break}Mn(e,ut,Qt);break;case 4:if(hn(e,r),(r&4194240)===r)break;for(t=e.eventTimes,l=-1;0<r;){var s=31-St(r);i=1<<s,s=t[s],s>l&&(l=s),r&=~i}if(r=l,r=Ae()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Qd(r/1960))-r,10<r){e.timeoutHandle=Bl(Mn.bind(null,e,ut,Qt),r);break}Mn(e,ut,Qt);break;case 5:Mn(e,ut,Qt);break;default:throw Error(m(329))}}}return ct(e,Ae()),e.callbackNode===n?Lu.bind(null,e):null}function Ai(e,t){var n=Hr;return e.current.memoizedState.isDehydrated&&(Pn(e,t).flags|=256),e=Ya(e,t),e!==2&&(t=ut,ut=n,t!==null&&Di(t)),e}function Di(e){ut===null?ut=e:ut.push.apply(ut,e)}function Gd(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var l=n[r],i=l.getSnapshot;l=l.value;try{if(!Ct(i(),l))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function hn(e,t){for(t&=~Ti,t&=~Ba,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-St(t),r=1<<n;e[n]=-1,t&=~r}}function Fu(e){if((ve&6)!==0)throw Error(m(327));sr();var t=ra(e,0);if((t&1)===0)return ct(e,Ae()),null;var n=Ya(e,t);if(e.tag!==0&&n===2){var r=gl(e);r!==0&&(t=r,n=Ai(e,r))}if(n===1)throw n=Kr,Pn(e,0),hn(e,t),ct(e,Ae()),n;if(n===6)throw Error(m(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Mn(e,ut,Qt),ct(e,Ae()),null}function Oi(e,t){var n=ve;ve|=1;try{return e(t)}finally{ve=n,ve===0&&(ir=Ae()+500,ja&&on())}}function zn(e){fn!==null&&fn.tag===0&&(ve&6)===0&&sr();var t=ve;ve|=1;var n=jt.transition,r=ke;try{if(jt.transition=null,ke=1,e)return e()}finally{ke=r,jt.transition=n,ve=t,(ve&6)===0&&on()}}function $i(){ht=lr.current,Ce(lr)}function Pn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,bd(n)),$e!==null)for(n=$e.return;n!==null;){var r=n;switch(Yl(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&wa();break;case 3:nr(),Ce(it),Ce(Ze),oi();break;case 5:ii(r);break;case 4:nr();break;case 13:Ce(Pe);break;case 19:Ce(Pe);break;case 10:ti(r.type._context);break;case 22:case 23:$i()}n=n.return}if(Qe=e,$e=e=gn(e.current,null),qe=ht=t,Be=0,Kr=null,Ti=Ba=_n=0,ut=Hr=null,Sn!==null){for(t=0;t<Sn.length;t++)if(n=Sn[t],r=n.interleaved,r!==null){n.interleaved=null;var l=r.next,i=n.pending;if(i!==null){var s=i.next;i.next=l,r.next=s}n.pending=r}Sn=null}return e}function Ru(e,t){do{var n=$e;try{if(ei(),Ia.current=Ra,Ta){for(var r=Me.memoizedState;r!==null;){var l=r.queue;l!==null&&(l.pending=null),r=r.next}Ta=!1}if(En=0,He=Ve=Me=null,Or=!1,$r=0,Ii.current=null,n===null||n.return===null){Be=1,Kr=t,$e=null;break}e:{var i=e,s=n.return,c=n,p=t;if(t=qe,c.flags|=32768,p!==null&&typeof p=="object"&&typeof p.then=="function"){var x=p,N=c,b=N.tag;if((N.mode&1)===0&&(b===0||b===11||b===15)){var j=N.alternate;j?(N.updateQueue=j.updateQueue,N.memoizedState=j.memoizedState,N.lanes=j.lanes):(N.updateQueue=null,N.memoizedState=null)}var $=su(s);if($!==null){$.flags&=-257,ou($,s,c,i,t),$.mode&1&&iu(i,x,t),t=$,p=x;var K=t.updateQueue;if(K===null){var H=new Set;H.add(p),t.updateQueue=H}else K.add(p);break e}else{if((t&1)===0){iu(i,x,t),Ui();break e}p=Error(m(426))}}else if(Ee&&c.mode&1){var De=su(s);if(De!==null){(De.flags&65536)===0&&(De.flags|=256),ou(De,s,c,i,t),Xl(rr(p,c));break e}}i=p=rr(p,c),Be!==4&&(Be=2),Hr===null?Hr=[i]:Hr.push(i),i=s;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var h=au(i,p,t);Mo(i,h);break e;case 1:c=p;var f=i.type,v=i.stateNode;if((i.flags&128)===0&&(typeof f.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(pn===null||!pn.has(v)))){i.flags|=65536,t&=-t,i.lanes|=t;var _=lu(i,c,t);Mo(i,_);break e}}i=i.return}while(i!==null)}Ou(n)}catch(Q){t=Q,$e===n&&n!==null&&($e=n=n.return);continue}break}while(!0)}function Au(){var e=Va.current;return Va.current=Ra,e===null?Ra:e}function Ui(){(Be===0||Be===3||Be===2)&&(Be=4),Qe===null||(_n&268435455)===0&&(Ba&268435455)===0||hn(Qe,qe)}function Ya(e,t){var n=ve;ve|=2;var r=Au();(Qe!==e||qe!==t)&&(Qt=null,Pn(e,t));do try{Yd();break}catch(l){Ru(e,l)}while(!0);if(ei(),ve=n,Va.current=r,$e!==null)throw Error(m(261));return Qe=null,qe=0,Be}function Yd(){for(;$e!==null;)Du($e)}function qd(){for(;$e!==null&&!kc();)Du($e)}function Du(e){var t=Vu(e.alternate,e,ht);e.memoizedProps=e.pendingProps,t===null?Ou(e):$e=t,Ii.current=null}function Ou(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Vd(n,t,ht),n!==null){$e=n;return}}else{if(n=Bd(n,t),n!==null){n.flags&=32767,$e=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Be=6,$e=null;return}}if(t=t.sibling,t!==null){$e=t;return}$e=t=e}while(t!==null);Be===0&&(Be=5)}function Mn(e,t,n){var r=ke,l=jt.transition;try{jt.transition=null,ke=1,Jd(e,t,n,r)}finally{jt.transition=l,ke=r}return null}function Jd(e,t,n,r){do sr();while(fn!==null);if((ve&6)!==0)throw Error(m(327));n=e.finishedWork;var l=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(m(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(Mc(e,i),e===Qe&&($e=Qe=null,qe=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Ka||(Ka=!0,Bu(Zr,function(){return sr(),null})),i=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||i){i=jt.transition,jt.transition=null;var s=ke;ke=1;var c=ve;ve|=4,Ii.current=null,Kd(e,n),zu(n,e),vd(Ul),ia=!!$l,Ul=$l=null,e.current=n,Hd(n),jc(),ve=c,ke=s,jt.transition=i}else e.current=n;if(Ka&&(Ka=!1,fn=e,Ha=l),i=e.pendingLanes,i===0&&(pn=null),Sc(n.stateNode),ct(e,Ae()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)l=t[n],r(l.value,{componentStack:l.stack,digest:l.digest});if(Wa)throw Wa=!1,e=Fi,Fi=null,e;return(Ha&1)!==0&&e.tag!==0&&sr(),i=e.pendingLanes,(i&1)!==0?e===Ri?Qr++:(Qr=0,Ri=e):Qr=0,on(),null}function sr(){if(fn!==null){var e=Cs(Ha),t=jt.transition,n=ke;try{if(jt.transition=null,ke=16>e?16:e,fn===null)var r=!1;else{if(e=fn,fn=null,Ha=0,(ve&6)!==0)throw Error(m(331));var l=ve;for(ve|=4,W=e.current;W!==null;){var i=W,s=i.child;if((W.flags&16)!==0){var c=i.deletions;if(c!==null){for(var p=0;p<c.length;p++){var x=c[p];for(W=x;W!==null;){var N=W;switch(N.tag){case 0:case 11:case 15:Wr(8,N,i)}var b=N.child;if(b!==null)b.return=N,W=b;else for(;W!==null;){N=W;var j=N.sibling,$=N.return;if(bu(N),N===x){W=null;break}if(j!==null){j.return=$,W=j;break}W=$}}}var K=i.alternate;if(K!==null){var H=K.child;if(H!==null){K.child=null;do{var De=H.sibling;H.sibling=null,H=De}while(H!==null)}}W=i}}if((i.subtreeFlags&2064)!==0&&s!==null)s.return=i,W=s;else e:for(;W!==null;){if(i=W,(i.flags&2048)!==0)switch(i.tag){case 0:case 11:case 15:Wr(9,i,i.return)}var h=i.sibling;if(h!==null){h.return=i.return,W=h;break e}W=i.return}}var f=e.current;for(W=f;W!==null;){s=W;var v=s.child;if((s.subtreeFlags&2064)!==0&&v!==null)v.return=s,W=v;else e:for(s=f;W!==null;){if(c=W,(c.flags&2048)!==0)try{switch(c.tag){case 0:case 11:case 15:Ua(9,c)}}catch(Q){Fe(c,c.return,Q)}if(c===s){W=null;break e}var _=c.sibling;if(_!==null){_.return=c.return,W=_;break e}W=c.return}}if(ve=l,on(),Tt&&typeof Tt.onPostCommitFiberRoot=="function")try{Tt.onPostCommitFiberRoot(ea,e)}catch{}r=!0}return r}finally{ke=n,jt.transition=t}}return!1}function $u(e,t,n){t=rr(n,t),t=au(e,t,1),e=cn(e,t,1),t=at(),e!==null&&(vr(e,1,t),ct(e,t))}function Fe(e,t,n){if(e.tag===3)$u(e,e,n);else for(;t!==null;){if(t.tag===3){$u(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(pn===null||!pn.has(r))){e=rr(n,e),e=lu(t,e,1),t=cn(t,e,1),e=at(),t!==null&&(vr(t,1,e),ct(t,e));break}}t=t.return}}function Xd(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=at(),e.pingedLanes|=e.suspendedLanes&n,Qe===e&&(qe&n)===n&&(Be===4||Be===3&&(qe&130023424)===qe&&500>Ae()-Li?Pn(e,0):Ti|=n),ct(e,t)}function Uu(e,t){t===0&&((e.mode&1)===0?t=1:(t=na,na<<=1,(na&130023424)===0&&(na=4194304)));var n=at();e=Wt(e,t),e!==null&&(vr(e,t,n),ct(e,n))}function Zd(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Uu(e,n)}function ep(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(m(314))}r!==null&&r.delete(t),Uu(e,n)}var Vu;Vu=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||it.current)ot=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return ot=!1,Ud(e,t,n);ot=(e.flags&131072)!==0}else ot=!1,Ee&&(t.flags&1048576)!==0&&ko(t,ba,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Oa(e,t),e=t.pendingProps;var l=Yn(t,Ze.current);tr(t,n),l=di(null,t,r,e,l,n);var i=pi();return t.flags|=1,typeof l=="object"&&l!==null&&typeof l.render=="function"&&l.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,st(r)?(i=!0,ka(t)):i=!1,t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,ai(t),l.updater=Aa,t.stateNode=l,l._reactInternals=t,xi(t,r,e,n),t=ji(null,t,r,!0,i,n)):(t.tag=0,Ee&&i&&Gl(t),rt(null,t,l,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Oa(e,t),e=t.pendingProps,l=r._init,r=l(r._payload),t.type=r,l=t.tag=np(r),e=_t(r,e),l){case 0:t=ki(null,t,r,e,n);break e;case 1:t=mu(null,t,r,e,n);break e;case 11:t=uu(null,t,r,e,n);break e;case 14:t=cu(null,t,r,_t(r.type,e),n);break e}throw Error(m(306,r,""))}return t;case 0:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),ki(e,t,r,l,n);case 1:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),mu(e,t,r,l,n);case 3:e:{if(hu(t),e===null)throw Error(m(387));r=t.pendingProps,i=t.memoizedState,l=i.element,Po(e,t),Pa(t,r,null,n);var s=t.memoizedState;if(r=s.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){l=rr(Error(m(423)),t),t=gu(e,t,r,n,l);break e}else if(r!==l){l=rr(Error(m(424)),t),t=gu(e,t,r,n,l);break e}else for(mt=an(t.stateNode.containerInfo.firstChild),ft=t,Ee=!0,Et=null,n=_o(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Xn(),r===l){t=Ht(e,t,n);break e}rt(e,t,r,n)}t=t.child}return t;case 5:return To(t),e===null&&Jl(t),r=t.type,l=t.pendingProps,i=e!==null?e.memoizedProps:null,s=l.children,Vl(r,l)?s=null:i!==null&&Vl(r,i)&&(t.flags|=32),fu(e,t),rt(e,t,s,n),t.child;case 6:return e===null&&Jl(t),null;case 13:return vu(e,t,n);case 4:return li(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Zn(t,null,r,n):rt(e,t,r,n),t.child;case 11:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),uu(e,t,r,l,n);case 7:return rt(e,t,t.pendingProps,n),t.child;case 8:return rt(e,t,t.pendingProps.children,n),t.child;case 12:return rt(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,l=t.pendingProps,i=t.memoizedProps,s=l.value,be(Ea,r._currentValue),r._currentValue=s,i!==null)if(Ct(i.value,s)){if(i.children===l.children&&!it.current){t=Ht(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var c=i.dependencies;if(c!==null){s=i.child;for(var p=c.firstContext;p!==null;){if(p.context===r){if(i.tag===1){p=Kt(-1,n&-n),p.tag=2;var x=i.updateQueue;if(x!==null){x=x.shared;var N=x.pending;N===null?p.next=p:(p.next=N.next,N.next=p),x.pending=p}}i.lanes|=n,p=i.alternate,p!==null&&(p.lanes|=n),ni(i.return,n,t),c.lanes|=n;break}p=p.next}}else if(i.tag===10)s=i.type===t.type?null:i.child;else if(i.tag===18){if(s=i.return,s===null)throw Error(m(341));s.lanes|=n,c=s.alternate,c!==null&&(c.lanes|=n),ni(s,n,t),s=i.sibling}else s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===t){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}rt(e,t,l.children,n),t=t.child}return t;case 9:return l=t.type,r=t.pendingProps.children,tr(t,n),l=wt(l),r=r(l),t.flags|=1,rt(e,t,r,n),t.child;case 14:return r=t.type,l=_t(r,t.pendingProps),l=_t(r.type,l),cu(e,t,r,l,n);case 15:return du(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:_t(r,l),Oa(e,t),t.tag=1,st(r)?(e=!0,ka(t)):e=!1,tr(t,n),nu(t,r,l),xi(t,r,l,n),ji(null,t,r,!0,e,n);case 19:return yu(e,t,n);case 22:return pu(e,t,n)}throw Error(m(156,t.tag))};function Bu(e,t){return ks(e,t)}function tp(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Nt(e,t,n,r){return new tp(e,t,n,r)}function Vi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function np(e){if(typeof e=="function")return Vi(e)?1:0;if(e!=null){if(e=e.$$typeof,e===oe)return 11;if(e===ze)return 14}return 2}function gn(e,t){var n=e.alternate;return n===null?(n=Nt(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function qa(e,t,n,r,l,i){var s=2;if(r=e,typeof e=="function")Vi(e)&&(s=1);else if(typeof e=="string")s=5;else e:switch(e){case se:return In(n.children,l,i,t);case Ne:s=8,l|=8;break;case We:return e=Nt(12,n,t,l|2),e.elementType=We,e.lanes=i,e;case he:return e=Nt(13,n,t,l),e.elementType=he,e.lanes=i,e;case _e:return e=Nt(19,n,t,l),e.elementType=_e,e.lanes=i,e;case we:return Ja(n,l,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ie:s=10;break e;case Te:s=9;break e;case oe:s=11;break e;case ze:s=14;break e;case Le:s=16,r=null;break e}throw Error(m(130,e==null?e:typeof e,""))}return t=Nt(s,n,t,l),t.elementType=e,t.type=r,t.lanes=i,t}function In(e,t,n,r){return e=Nt(7,e,r,t),e.lanes=n,e}function Ja(e,t,n,r){return e=Nt(22,e,r,t),e.elementType=we,e.lanes=n,e.stateNode={isHidden:!1},e}function Bi(e,t,n){return e=Nt(6,e,null,t),e.lanes=n,e}function Wi(e,t,n){return t=Nt(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function rp(e,t,n,r,l){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=vl(0),this.expirationTimes=vl(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=vl(0),this.identifierPrefix=r,this.onRecoverableError=l,this.mutableSourceEagerHydrationData=null}function Ki(e,t,n,r,l,i,s,c,p){return e=new rp(e,t,n,c,p),t===1?(t=1,i===!0&&(t|=8)):t=0,i=Nt(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},ai(i),e}function ap(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ye,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Wu(e){if(!e)return sn;e=e._reactInternals;e:{if(wn(e)!==e||e.tag!==1)throw Error(m(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(st(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(m(171))}if(e.tag===1){var n=e.type;if(st(n))return xo(e,n,t)}return t}function Ku(e,t,n,r,l,i,s,c,p){return e=Ki(n,r,!0,e,l,i,s,c,p),e.context=Wu(null),n=e.current,r=at(),l=mn(n),i=Kt(r,l),i.callback=t??null,cn(n,i,l),e.current.lanes=l,vr(e,l,r),ct(e,r),e}function Xa(e,t,n,r){var l=t.current,i=at(),s=mn(l);return n=Wu(n),t.context===null?t.context=n:t.pendingContext=n,t=Kt(i,s),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=cn(l,t,s),e!==null&&(Mt(e,l,s,i),za(e,l,s)),s}function Za(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Hu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Hi(e,t){Hu(e,t),(e=e.alternate)&&Hu(e,t)}function lp(){return null}var Qu=typeof reportError=="function"?reportError:function(e){console.error(e)};function Qi(e){this._internalRoot=e}el.prototype.render=Qi.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(m(409));Xa(e,t,null,null)},el.prototype.unmount=Qi.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;zn(function(){Xa(null,e,null,null)}),t[$t]=null}};function el(e){this._internalRoot=e}el.prototype.unstable_scheduleHydration=function(e){if(e){var t=zs();e={blockedOn:null,target:e,priority:t};for(var n=0;n<tn.length&&t!==0&&t<tn[n].priority;n++);tn.splice(n,0,e),n===0&&Is(e)}};function Gi(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function tl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Gu(){}function ip(e,t,n,r,l){if(l){if(typeof r=="function"){var i=r;r=function(){var x=Za(s);i.call(x)}}var s=Ku(t,r,e,0,null,!1,!1,"",Gu);return e._reactRootContainer=s,e[$t]=s.current,Mr(e.nodeType===8?e.parentNode:e),zn(),s}for(;l=e.lastChild;)e.removeChild(l);if(typeof r=="function"){var c=r;r=function(){var x=Za(p);c.call(x)}}var p=Ki(e,0,!1,null,null,!1,!1,"",Gu);return e._reactRootContainer=p,e[$t]=p.current,Mr(e.nodeType===8?e.parentNode:e),zn(function(){Xa(t,p,n,r)}),p}function nl(e,t,n,r,l){var i=n._reactRootContainer;if(i){var s=i;if(typeof l=="function"){var c=l;l=function(){var p=Za(s);c.call(p)}}Xa(t,s,e,l)}else s=ip(n,t,e,l,r);return Za(s)}Es=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=gr(t.pendingLanes);n!==0&&(xl(t,n|1),ct(t,Ae()),(ve&6)===0&&(ir=Ae()+500,on()))}break;case 13:zn(function(){var r=Wt(e,1);if(r!==null){var l=at();Mt(r,e,1,l)}}),Hi(e,1)}},yl=function(e){if(e.tag===13){var t=Wt(e,134217728);if(t!==null){var n=at();Mt(t,e,134217728,n)}Hi(e,134217728)}},_s=function(e){if(e.tag===13){var t=mn(e),n=Wt(e,t);if(n!==null){var r=at();Mt(n,e,t,r)}Hi(e,t)}},zs=function(){return ke},Ps=function(e,t){var n=ke;try{return ke=e,t()}finally{ke=n}},dl=function(e,t,n){switch(t){case"input":if(Ke(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var l=ya(r);if(!l)throw Error(m(90));je(r),Ke(r,l)}}}break;case"textarea":xn(e,n);break;case"select":t=n.value,t!=null&&It(e,!!n.multiple,t,!1)}},ms=Oi,hs=zn;var sp={usingClientEntryPoint:!1,Events:[Lr,Qn,ya,ps,fs,Oi]},Gr={findFiberByHostInstance:kn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},op={bundleType:Gr.bundleType,version:Gr.version,rendererPackageName:Gr.rendererPackageName,rendererConfig:Gr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Z.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=ys(e),e===null?null:e.stateNode},findFiberByHostInstance:Gr.findFiberByHostInstance||lp,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var rl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!rl.isDisabled&&rl.supportsFiber)try{ea=rl.inject(op),Tt=rl}catch{}}return dt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=sp,dt.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Gi(t))throw Error(m(200));return ap(e,t,null,n)},dt.createRoot=function(e,t){if(!Gi(e))throw Error(m(299));var n=!1,r="",l=Qu;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=Ki(e,1,!1,null,null,n,!1,r,l),e[$t]=t.current,Mr(e.nodeType===8?e.parentNode:e),new Qi(t)},dt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(m(188)):(e=Object.keys(e).join(","),Error(m(268,e)));return e=ys(t),e=e===null?null:e.stateNode,e},dt.flushSync=function(e){return zn(e)},dt.hydrate=function(e,t,n){if(!tl(t))throw Error(m(200));return nl(null,e,t,!0,n)},dt.hydrateRoot=function(e,t,n){if(!Gi(e))throw Error(m(405));var r=n!=null&&n.hydratedSources||null,l=!1,i="",s=Qu;if(n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=Ku(t,null,e,1,n??null,l,!1,i,s),e[$t]=t.current,Mr(e),r)for(e=0;e<r.length;e++)n=r[e],l=n._getVersion,l=l(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,l]:t.mutableSourceEagerHydrationData.push(n,l);return new el(t)},dt.render=function(e,t,n){if(!tl(t))throw Error(m(200));return nl(null,e,t,!1,n)},dt.unmountComponentAtNode=function(e){if(!tl(e))throw Error(m(40));return e._reactRootContainer?(zn(function(){nl(null,null,e,!1,function(){e._reactRootContainer=null,e[$t]=null})}),!0):!1},dt.unstable_batchedUpdates=Oi,dt.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!tl(n))throw Error(m(200));if(e==null||e._reactInternals===void 0)throw Error(m(38));return nl(e,t,n,!1,r)},dt.version="18.3.1-next-f1338f8080-20240426",dt}var nc;function oc(){if(nc)return Ji.exports;nc=1;function d(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(d)}catch(w){console.error(w)}}return d(),Ji.exports=gp(),Ji.exports}var rc;function vp(){if(rc)return al;rc=1;var d=oc();return al.createRoot=d.createRoot,al.hydrateRoot=d.hydrateRoot,al}var xp=vp();const yp=sc(xp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wp=d=>d.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),uc=(...d)=>d.filter((w,m,E)=>!!w&&w.trim()!==""&&E.indexOf(w)===m).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var kp={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jp=z.forwardRef(({color:d="currentColor",size:w=24,strokeWidth:m=2,absoluteStrokeWidth:E,className:T="",children:A,iconNode:D,...X},F)=>z.createElement("svg",{ref:F,...kp,width:w,height:w,stroke:d,strokeWidth:E?Number(m)*24/Number(w):m,className:uc("lucide",T),...X},[...D.map(([G,B])=>z.createElement(G,B)),...Array.isArray(A)?A:[A]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=(d,w)=>{const m=z.forwardRef(({className:E,...T},A)=>z.createElement(jp,{ref:A,iconNode:w,className:uc(`lucide-${wp(d)}`,E),...T}));return m.displayName=`${d}`,m};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Np=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],bp=ue("ArrowLeftRight",Np);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sp=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],es=ue("ArrowRight",Sp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cp=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ns=ue("Check",Cp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ep=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],il=ue("CircleAlert",Ep);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _p=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Tn=ue("CircleCheck",_p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],sl=ue("Clock",zp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pp=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],ls=ue("Copy",Pp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mp=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],rs=ue("Database",Mp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ip=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],is=ue("Download",Ip);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tp=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],cc=ue("ExternalLink",Tp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lp=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Fp=ue("Eye",Lp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rp=[["path",{d:"M10 12v-1",key:"v7bkov"}],["path",{d:"M10 18v-2",key:"1cjy8d"}],["path",{d:"M10 7V6",key:"dljcrl"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01",key:"gkbcor"}],["circle",{cx:"10",cy:"20",r:"2",key:"1xzdoj"}]],Ap=ue("FileArchive",Rp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dp=[["path",{d:"M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3",key:"rslqgf"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0",key:"9f7x3i"}]],Op=ue("FileAudio",Dp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $p=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],or=ue("FileCode",$p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Up=[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]],Vp=ue("Filter",Up);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bp=[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]],Wp=ue("Gauge",Bp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kp=[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M13 6h3a2 2 0 0 1 2 2v7",key:"1yeb86"}],["path",{d:"M11 18H8a2 2 0 0 1-2-2V9",key:"19pyzm"}]],ll=ue("GitCompare",Kp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hp=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Qp=ue("Info",Hp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gp=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],ac=ue("KeyRound",Gp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yp=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],ss=ue("Layers",Yp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qp=[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]],Jp=ue("MessageSquare",qp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xp=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],Zp=ue("Pause",Xp);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ef=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],tf=ue("PenLine",ef);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nf=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],rf=ue("Play",nf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const af=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],lf=ue("Plus",af);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sf=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],lc=ue("RefreshCw",sf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const of=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],uf=ue("RotateCcw",of);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cf=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],os=ue("Save",cf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const df=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],pf=ue("Search",df);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ff=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],mf=ue("Settings",ff);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hf=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],gf=ue("ShieldCheck",hf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vf=[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]],xf=ue("SlidersVertical",vf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yf=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],qr=ue("Sparkles",yf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wf=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],ts=ue("Star",wf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kf=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],ol=ue("Trash2",kf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jf=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Nf=ue("TriangleAlert",jf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bf=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]],Sf=ue("Upload",bf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cf=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],dc=ue("Volume2",Cf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ef=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],_f=ue("VolumeX",Ef);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zf=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]],Pf=ue("WandSparkles",zf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mf=[["path",{d:"M12.8 19.6A2 2 0 1 0 14 16H2",key:"148xed"}],["path",{d:"M17.5 8a2.5 2.5 0 1 1 2 4H2",key:"1u4tom"}],["path",{d:"M9.8 4.4A2 2 0 1 1 11 8H2",key:"75valh"}]],If=ue("Wind",Mf);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tf=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],us=ue("X",Tf),Lf=({activeTab:d,onSelectTab:w,onOpenSettings:m,config:E,datasetCount:T})=>{var A,D;return a.jsxs("header",{className:"navbar-root",children:[a.jsxs("div",{className:"navbar-container",children:[a.jsxs("div",{className:"navbar-brand",onClick:()=>w("api"),style:{cursor:"pointer"},children:[a.jsxs("div",{className:"brand-icon-wrapper",children:[a.jsx("span",{className:"brand-flag-badge",children:"Kurdish"}),a.jsx("div",{className:"brand-logo-icon",children:"🎙️"})]}),a.jsxs("div",{children:[a.jsxs("div",{className:"brand-title",children:[a.jsx("span",{className:"text-gradient",children:"Kurdish TTS"})," Studio"]}),a.jsx("div",{className:"brand-subtitle",children:"ElevenLabs Dataset Engine & A/B Benchmark"})]})]}),a.jsxs("nav",{className:"navbar-nav",children:[a.jsxs("button",{id:"nav-tab-api",className:`nav-tab-btn ${d==="api"?"active":""}`,onClick:()=>w("api"),children:[a.jsx(qr,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"API Generation"})]}),a.jsxs("button",{id:"nav-tab-normal",className:`nav-tab-btn ${d==="normal"?"active":""}`,onClick:()=>w("normal"),children:[a.jsx(ss,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Normal Web Workflow"})]}),a.jsxs("button",{id:"nav-tab-dataset",className:`nav-tab-btn ${d==="dataset"?"active":""}`,onClick:()=>w("dataset"),children:[a.jsx(rs,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Dataset Manager"}),T>0&&a.jsx("span",{className:"nav-count-badge",children:T})]}),a.jsxs("button",{id:"nav-tab-compare",className:`nav-tab-btn ${d==="compare"?"active":""}`,onClick:()=>w("compare"),children:[a.jsx(ll,{size:18,className:"nav-tab-icon"}),a.jsx("span",{children:"Compare A/B"})]})]}),a.jsxs("div",{className:"navbar-actions",children:[a.jsx("button",{className:`api-status-pill ${E!=null&&E.keyValid?"status-valid":"status-warning"}`,onClick:m,title:E!=null&&E.keyValid?`Connected to ElevenLabs (${((A=E.userInfo)==null?void 0:A.character_count)??0} chars used)`:"Configure ElevenLabs API Key",children:E!=null&&E.keyValid?a.jsxs(a.Fragment,{children:[a.jsx(Tn,{size:15,className:"status-icon"}),a.jsxs("span",{className:"status-text",children:["ElevenLabs: ",(D=E.userInfo)!=null&&D.tier?`${E.userInfo.tier.toUpperCase()}`:"Connected"]})]}):a.jsxs(a.Fragment,{children:[a.jsx(il,{size:15,className:"status-icon"}),a.jsx("span",{className:"status-text",children:"Configure API Key"})]})}),a.jsx("button",{id:"btn-open-settings",className:"btn btn-secondary btn-icon",onClick:m,title:"Settings & API Key",children:a.jsx(mf,{size:18})})]})]}),a.jsx("style",{children:`
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo-icon {
          font-size: 26px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-md);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.25);
        }

        .brand-flag-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #10B981, #F59E0B, #EF4444);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.7);
          padding: 4px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--text-muted);
          border: none;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-tab-btn.active {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15));
          color: #38BDF8;
          box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.35);
        }

        .nav-tab-icon {
          transition: transform var(--transition-fast);
        }

        .nav-tab-btn:hover .nav-tab-icon {
          transform: scale(1.1);
        }

        .nav-count-badge {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: var(--radius-full);
          margin-left: 2px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .api-status-pill.status-valid {
          background: rgba(16, 185, 129, 0.12);
          color: #34D399;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .api-status-pill.status-valid:hover {
          background: rgba(16, 185, 129, 0.22);
        }

        .api-status-pill.status-warning {
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .api-status-pill.status-warning:hover {
          background: rgba(245, 158, 11, 0.22);
        }

        .btn-icon {
          width: 38px;
          height: 38px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        @media (max-width: 960px) {
          .brand-subtitle, .status-text {
            display: none;
          }
          .nav-tab-btn span {
            display: none;
          }
          .nav-tab-btn {
            padding: 8px 12px;
          }
        }
      `})]})},Ff=({toasts:d,onDismiss:w})=>a.jsxs("div",{className:"toast-container",children:[d.map(m=>a.jsx(Rf,{toast:m,onDismiss:w},m.id)),a.jsx("style",{children:`
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
      `})]}),Rf=({toast:d,onDismiss:w})=>(z.useEffect(()=>{const m=setTimeout(()=>{w(d.id)},d.duration||4500);return()=>clearTimeout(m)},[d,w]),a.jsxs("div",{className:`toast-item toast-${d.type}`,children:[a.jsxs("div",{className:"toast-icon",children:[d.type==="success"&&a.jsx(Tn,{size:18}),d.type==="error"&&a.jsx(il,{size:18}),d.type==="info"&&a.jsx(Qp,{size:18})]}),a.jsxs("div",{className:"toast-content",children:[a.jsx("div",{className:"toast-title",children:d.title}),d.message&&a.jsx("div",{className:"toast-desc",children:d.message})]}),a.jsx("button",{className:"toast-close",onClick:()=>w(d.id),children:a.jsx(us,{size:14})})]}));var pc=oc();const gt="/api";async function Af(){const d=await fetch(`${gt}/config`);if(!d.ok)throw new Error("Failed to fetch system configuration");return await d.json()}async function fc(d){const w=await fetch(`${gt}/config/key`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:d})}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to update API key");return m}async function Df(){const d=await fetch(`${gt}/voices`),w=await d.json();if(!d.ok)throw new Error(w.error||"Failed to fetch voices");return w.voices||[]}async function Of(){const d=await fetch(`${gt}/models`),w=await d.json();if(!d.ok)throw new Error(w.error||"Failed to fetch models");return w.models||[]}async function $f(d){const w=await fetch(`${gt}/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to generate speech");return m}async function Uf(d){const w=await fetch(`${gt}/normal/prepare`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to prepare sample");return m}async function Vf(){const d=await fetch(`${gt}/normal/pending`),w=await d.json();if(!d.ok)throw new Error(w.error||"Failed to fetch pending items");return w.pending||[]}async function Bf(d){if(!(await fetch(`${gt}/normal/pending/${encodeURIComponent(d)}`,{method:"DELETE"})).ok)throw new Error("Failed to delete pending item")}async function Wf(d){const w=await fetch(`${gt}/normal/upload`,{method:"POST",body:d}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to upload WAV and match sample");return m}async function Kf(){const d=await fetch(`${gt}/dataset`),w=await d.json();if(!d.ok)throw new Error(w.error||"Failed to fetch dataset");return w.samples||[]}async function ur(d,w){const m=await fetch(`${gt}/dataset/${encodeURIComponent(d)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)}),E=await m.json();if(!m.ok)throw new Error(E.error||"Failed to update sample");return E.sample}async function Hf(d){const w=await fetch(`${gt}/dataset/${encodeURIComponent(d)}`,{method:"DELETE"}),m=await w.json();if(!w.ok)throw new Error(m.error||"Failed to delete sample")}function Qf(){return`${gt}/dataset/export/zip`}const Gf=({config:d,onClose:w,onConfigUpdated:m})=>{var k,U,le,y;const[E,T]=z.useState(""),[A,D]=z.useState(!1),[X,F]=z.useState(!1),[G,B]=z.useState(null),C=async Z=>{if(Z.preventDefault(),!!E.trim()){F(!0),B(null);try{const ge=await fc(E.trim());B({success:!0,message:ge.message||"API Key saved and validated!"}),m({status:"ok",isKeyConfigured:!0,keyValid:!0,validationError:null,maskedKey:`${E.slice(0,4)}...${E.slice(-4)}`,userInfo:ge.userInfo}),T("")}catch(ge){B({success:!1,message:ge.message||"Invalid API key"})}finally{F(!1)}}},M=((k=d==null?void 0:d.userInfo)==null?void 0:k.character_count)??0,Y=((U=d==null?void 0:d.userInfo)==null?void 0:U.character_limit)??1e4,ie=Y>0?Math.min(100,Math.round(M/Y*100)):0,q=a.jsxs("div",{className:"modal-backdrop",onClick:w,children:[a.jsxs("div",{className:"modal-container settings-modal-box",onClick:Z=>Z.stopPropagation(),children:[a.jsxs("div",{className:"modal-header",children:[a.jsxs("div",{className:"modal-title-group",children:[a.jsx(gf,{size:20,className:"text-cyan"}),a.jsxs("div",{children:[a.jsx("div",{className:"modal-title",children:"Settings & API Security"}),a.jsx("div",{className:"modal-subtitle",children:"ElevenLabs API credentials and engine configurations"})]})]}),a.jsx("button",{className:"btn-ghost btn-icon",onClick:w,title:"Close Settings",children:a.jsx(us,{size:18})})]}),a.jsxs("div",{className:"settings-body",children:[a.jsxs("div",{className:`status-banner ${d!=null&&d.keyValid?"banner-success":"banner-warning"}`,children:[a.jsx("div",{className:"banner-icon",children:d!=null&&d.keyValid?a.jsx(Tn,{size:18}):a.jsx(il,{size:18})}),a.jsxs("div",{className:"banner-text",children:[a.jsx("div",{className:"banner-heading",children:d!=null&&d.keyValid?"ElevenLabs API Connected":"API Key Required for API Workflow"}),a.jsx("div",{className:"banner-sub",children:d!=null&&d.keyValid?`Active Tier: ${((y=(le=d.userInfo)==null?void 0:le.tier)==null?void 0:y.toUpperCase())||"Standard"} • ${M.toLocaleString()} / ${Y.toLocaleString()} characters used.`:"You can generate samples without an API key using the Normal Web Workflow, or enter your API key below for direct API generation."})]})]}),(d==null?void 0:d.keyValid)&&a.jsxs("div",{className:"quota-meter-box",children:[a.jsxs("div",{className:"quota-labels",children:[a.jsx("span",{children:"Monthly Quota Usage"}),a.jsxs("span",{children:[ie,"% (",M.toLocaleString()," / ",Y.toLocaleString(),")"]})]}),a.jsx("div",{className:"meter-track",children:a.jsx("div",{className:"meter-fill",style:{width:`${ie}%`}})})]}),a.jsxs("form",{onSubmit:C,className:"settings-form",children:[a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"ElevenLabs API Key"}),a.jsxs("div",{className:"key-input-wrapper",children:[a.jsx("input",{type:A?"text":"password",className:"input-control",placeholder:d!=null&&d.maskedKey?`Configured (${d.maskedKey})`:"Paste xi-api-key here (e.g. sk_...)",value:E,onChange:Z=>T(Z.target.value),id:"settings-api-key-input"}),a.jsx("button",{type:"button",className:"show-key-toggle",onClick:()=>D(!A),children:A?"Hide":"Show"})]}),a.jsxs("div",{className:"key-security-hint",children:["🔒 Stored securely in local backend environment (",a.jsx("code",{children:".env"}),"). Never exposed to browser bundle."]})]}),G&&a.jsxs("div",{className:`feedback-alert ${G.success?"feedback-success":"feedback-error"}`,children:[G.success?a.jsx(Tn,{size:16}):a.jsx(il,{size:16}),a.jsx("span",{children:G.message})]}),a.jsxs("div",{className:"settings-actions",children:[a.jsxs("a",{href:"https://elevenlabs.io/app/settings/api-keys",target:"_blank",rel:"noreferrer",className:"btn btn-secondary btn-sm",children:[a.jsx("span",{children:"Get API Key"}),a.jsx(cc,{size:13})]}),a.jsxs("button",{type:"submit",className:"btn btn-primary btn-sm",disabled:X||!E.trim(),children:[a.jsx(os,{size:14}),a.jsx("span",{children:X?"Validating...":"Save & Validate Key"})]})]})]}),a.jsxs("div",{className:"tips-section",children:[a.jsx("div",{className:"tips-title",children:"💡 Pro Tips for Kurdish TTS Testing:"}),a.jsxs("ul",{className:"tips-list",children:[a.jsxs("li",{children:["Use ",a.jsx("strong",{children:"ElevenLabs v3"})," for expressive audio tags (",a.jsx("code",{children:"[laugh]"}),", ",a.jsx("code",{children:"[whisper]"}),", ",a.jsx("code",{children:"[sigh]"}),")."]}),a.jsxs("li",{children:["When testing audio tags, the engine automatically strips tags from the stored Unicode transcript in ",a.jsx("code",{children:"001.json"}),"."]}),a.jsxs("li",{children:["The ",a.jsx("strong",{children:"Normal Web Workflow"})," requires zero API key and lets you test ElevenLabs' web-exclusive features or models!"]})]})]})]}),a.jsx("div",{className:"modal-footer",children:a.jsx("button",{className:"btn btn-secondary btn-sm",onClick:w,children:"Done"})})]}),a.jsx("style",{children:`
        .settings-modal-box {
          max-width: 620px;
        }

        .settings-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-height: calc(85vh - 120px);
          overflow-y: auto;
        }

        .status-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
        }

        .banner-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34D399;
        }

        .banner-warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #FBBF24;
        }

        .banner-icon {
          margin-top: 2px;
        }

        .banner-heading {
          font-weight: 700;
          font-size: 0.92rem;
        }

        .banner-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.4;
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
          background: linear-gradient(90deg, #38BDF8, #818CF8);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .key-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .key-input-wrapper input {
          padding-right: 70px;
        }

        .show-key-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .show-key-toggle:hover {
          color: var(--text-main);
        }

        .key-security-hint {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 6px;
        }

        .feedback-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          margin-bottom: 14px;
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

        .settings-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
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
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .tips-list {
          padding-left: 18px;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
      `})]});return pc.createPortal(q,document.body)};var cs={};(function d(w,m,E,T){var A=!!(w.Worker&&w.Blob&&w.Promise&&w.OffscreenCanvas&&w.OffscreenCanvasRenderingContext2D&&w.HTMLCanvasElement&&w.HTMLCanvasElement.prototype.transferControlToOffscreen&&w.URL&&w.URL.createObjectURL),D=typeof Path2D=="function"&&typeof DOMMatrix=="function",X=(function(){if(!w.OffscreenCanvas)return!1;try{var u=new OffscreenCanvas(1,1),o=u.getContext("2d");o.fillRect(0,0,1,1);var g=u.transferToImageBitmap();o.createPattern(g,"no-repeat")}catch{return!1}return!0})();function F(){}function G(u){var o=m.exports.Promise,g=o!==void 0?o:w.Promise;return typeof g=="function"?new g(u):(u(F,F),null)}var B=(function(u,o){return{transform:function(g){if(u)return g;if(o.has(g))return o.get(g);var S=new OffscreenCanvas(g.width,g.height),P=S.getContext("2d");return P.drawImage(g,0,0),o.set(g,S),S},clear:function(){o.clear()}}})(X,new Map),C=(function(){var u=Math.floor(16.666666666666668),o,g,S={},P=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(o=function(R){var O=Math.random();return S[O]=requestAnimationFrame(function L(V){P===V||P+u-1<V?(P=V,delete S[O],R()):S[O]=requestAnimationFrame(L)}),O},g=function(R){S[R]&&cancelAnimationFrame(S[R])}):(o=function(R){return setTimeout(R,u)},g=function(R){return clearTimeout(R)}),{frame:o,cancel:g}})(),M=(function(){var u,o,g={};function S(P){function R(O,L){P.postMessage({options:O||{},callback:L})}P.init=function(L){var V=L.transferControlToOffscreen();P.postMessage({canvas:V},[V])},P.fire=function(L,V,ee){if(o)return R(L,null),o;var pe=Math.random().toString(36).slice(2);return o=G(function(fe){function je(ce){ce.data.callback===pe&&(delete g[pe],P.removeEventListener("message",je),o=null,B.clear(),ee(),fe())}P.addEventListener("message",je),R(L,pe),g[pe]=je.bind(null,{data:{callback:pe}})}),o},P.reset=function(){P.postMessage({reset:!0});for(var L in g)g[L](),delete g[L]}}return function(){if(u)return u;if(!E&&A){var P=["var CONFETTI, SIZE = {}, module = {};","("+d.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{u=new Worker(URL.createObjectURL(new Blob([P])))}catch(R){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",R),null}S(u)}return u}})(),Y={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function ie(u,o){return o?o(u):u}function q(u){return u!=null}function k(u,o,g){return ie(u&&q(u[o])?u[o]:Y[o],g)}function U(u){return u<0?0:Math.floor(u)}function le(u,o){return Math.floor(Math.random()*(o-u))+u}function y(u){return parseInt(u,16)}function Z(u){return u.map(ge)}function ge(u){var o=String(u).replace(/[^0-9a-f]/gi,"");return o.length<6&&(o=o[0]+o[0]+o[1]+o[1]+o[2]+o[2]),{r:y(o.substring(0,2)),g:y(o.substring(2,4)),b:y(o.substring(4,6))}}function ye(u){var o=k(u,"origin",Object);return o.x=k(o,"x",Number),o.y=k(o,"y",Number),o}function se(u){u.width=document.documentElement.clientWidth,u.height=document.documentElement.clientHeight}function Ne(u){var o=u.getBoundingClientRect();u.width=o.width,u.height=o.height}function We(u){var o=document.createElement("canvas");return o.style.position="fixed",o.style.top="0px",o.style.left="0px",o.style.pointerEvents="none",o.style.zIndex=u,o}function Ie(u,o,g,S,P,R,O,L,V){u.save(),u.translate(o,g),u.rotate(R),u.scale(S,P),u.arc(0,0,1,O,L,V),u.restore()}function Te(u){var o=u.angle*(Math.PI/180),g=u.spread*(Math.PI/180);return{x:u.x,y:u.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:u.startVelocity*.5+Math.random()*u.startVelocity,angle2D:-o+(.5*g-Math.random()*g),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:u.color,shape:u.shape,tick:0,totalTicks:u.ticks,decay:u.decay,drift:u.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:u.gravity*3,ovalScalar:.6,scalar:u.scalar,flat:u.flat}}function oe(u,o){o.x+=Math.cos(o.angle2D)*o.velocity+o.drift,o.y+=Math.sin(o.angle2D)*o.velocity+o.gravity,o.velocity*=o.decay,o.flat?(o.wobble=0,o.wobbleX=o.x+10*o.scalar,o.wobbleY=o.y+10*o.scalar,o.tiltSin=0,o.tiltCos=0,o.random=1):(o.wobble+=o.wobbleSpeed,o.wobbleX=o.x+10*o.scalar*Math.cos(o.wobble),o.wobbleY=o.y+10*o.scalar*Math.sin(o.wobble),o.tiltAngle+=.1,o.tiltSin=Math.sin(o.tiltAngle),o.tiltCos=Math.cos(o.tiltAngle),o.random=Math.random()+2);var g=o.tick++/o.totalTicks,S=o.x+o.random*o.tiltCos,P=o.y+o.random*o.tiltSin,R=o.wobbleX+o.random*o.tiltCos,O=o.wobbleY+o.random*o.tiltSin;if(u.fillStyle="rgba("+o.color.r+", "+o.color.g+", "+o.color.b+", "+(1-g)+")",u.beginPath(),D&&o.shape.type==="path"&&typeof o.shape.path=="string"&&Array.isArray(o.shape.matrix))u.fill(we(o.shape.path,o.shape.matrix,o.x,o.y,Math.abs(R-S)*.1,Math.abs(O-P)*.1,Math.PI/10*o.wobble));else if(o.shape.type==="bitmap"){var L=Math.PI/10*o.wobble,V=Math.abs(R-S)*.1,ee=Math.abs(O-P)*.1,pe=o.shape.bitmap.width*o.scalar,fe=o.shape.bitmap.height*o.scalar,je=new DOMMatrix([Math.cos(L)*V,Math.sin(L)*V,-Math.sin(L)*ee,Math.cos(L)*ee,o.x,o.y]);je.multiplySelf(new DOMMatrix(o.shape.matrix));var ce=u.createPattern(B.transform(o.shape.bitmap),"no-repeat");ce.setTransform(je),u.globalAlpha=1-g,u.fillStyle=ce,u.fillRect(o.x-pe/2,o.y-fe/2,pe,fe),u.globalAlpha=1}else if(o.shape==="circle")u.ellipse?u.ellipse(o.x,o.y,Math.abs(R-S)*o.ovalScalar,Math.abs(O-P)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI):Ie(u,o.x,o.y,Math.abs(R-S)*o.ovalScalar,Math.abs(O-P)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI);else if(o.shape==="star")for(var de=Math.PI/2*3,Ue=4*o.scalar,Je=8*o.scalar,Ke=o.x,Xe=o.y,lt=5,Oe=Math.PI/lt;lt--;)Ke=o.x+Math.cos(de)*Je,Xe=o.y+Math.sin(de)*Je,u.lineTo(Ke,Xe),de+=Oe,Ke=o.x+Math.cos(de)*Ue,Xe=o.y+Math.sin(de)*Ue,u.lineTo(Ke,Xe),de+=Oe;else u.moveTo(Math.floor(o.x),Math.floor(o.y)),u.lineTo(Math.floor(o.wobbleX),Math.floor(P)),u.lineTo(Math.floor(R),Math.floor(O)),u.lineTo(Math.floor(S),Math.floor(o.wobbleY));return u.closePath(),u.fill(),o.tick<o.totalTicks}function he(u,o,g,S,P){var R=o.slice(),O=u.getContext("2d"),L,V,ee=G(function(pe){function fe(){L=V=null,O.clearRect(0,0,S.width,S.height),B.clear(),P(),pe()}function je(){E&&!(S.width===T.width&&S.height===T.height)&&(S.width=u.width=T.width,S.height=u.height=T.height),!S.width&&!S.height&&(g(u),S.width=u.width,S.height=u.height),O.clearRect(0,0,S.width,S.height),R=R.filter(function(ce){return oe(O,ce)}),R.length?L=C.frame(je):fe()}L=C.frame(je),V=fe});return{addFettis:function(pe){return R=R.concat(pe),ee},canvas:u,promise:ee,reset:function(){L&&C.cancel(L),V&&V()}}}function _e(u,o){var g=!u,S=!!k(o||{},"resize"),P=!1,R=k(o,"disableForReducedMotion",Boolean),O=A&&!!k(o||{},"useWorker"),L=O?M():null,V=g?se:Ne,ee=u&&L?!!u.__confetti_initialized:!1,pe=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,fe;function je(de,Ue,Je){for(var Ke=k(de,"particleCount",U),Xe=k(de,"angle",Number),lt=k(de,"spread",Number),Oe=k(de,"startVelocity",Number),It=k(de,"decay",Number),Dt=k(de,"gravity",Number),Ln=k(de,"drift",Number),xn=k(de,"colors",Z),Fn=k(de,"ticks",Number),yn=k(de,"shapes"),Gt=k(de,"scalar"),Ot=!!k(de,"flat"),Yt=ye(de),bt=Ke,vt=[],Rn=u.width*Yt.x,re=u.height*Yt.y;bt--;)vt.push(Te({x:Rn,y:re,angle:Xe,spread:lt,startVelocity:Oe,color:xn[bt%xn.length],shape:yn[le(0,yn.length)],ticks:Fn,decay:It,gravity:Dt,drift:Ln,scalar:Gt,flat:Ot}));return fe?fe.addFettis(vt):(fe=he(u,vt,V,Ue,Je),fe.promise)}function ce(de){var Ue=R||k(de,"disableForReducedMotion",Boolean),Je=k(de,"zIndex",Number);if(Ue&&pe)return G(function(Oe){Oe()});g&&fe?u=fe.canvas:g&&!u&&(u=We(Je),document.body.appendChild(u)),S&&!ee&&V(u);var Ke={width:u.width,height:u.height};L&&!ee&&L.init(u),ee=!0,L&&(u.__confetti_initialized=!0);function Xe(){if(L){var Oe={getBoundingClientRect:function(){if(!g)return u.getBoundingClientRect()}};V(Oe),L.postMessage({resize:{width:Oe.width,height:Oe.height}});return}Ke.width=Ke.height=null}function lt(){fe=null,S&&(P=!1,w.removeEventListener("resize",Xe)),g&&u&&(document.body.contains(u)&&document.body.removeChild(u),u=null,ee=!1)}return S&&!P&&(P=!0,w.addEventListener("resize",Xe,!1)),L?L.fire(de,Ke,lt):je(de,Ke,lt)}return ce.reset=function(){L&&L.reset(),fe&&fe.reset()},ce}var ze;function Le(){return ze||(ze=_e(null,{useWorker:!0,resize:!0})),ze}function we(u,o,g,S,P,R,O){var L=new Path2D(u),V=new Path2D;V.addPath(L,new DOMMatrix(o));var ee=new Path2D;return ee.addPath(V,new DOMMatrix([Math.cos(O)*P,Math.sin(O)*P,-Math.sin(O)*R,Math.cos(O)*R,g,S])),ee}function I(u){if(!D)throw new Error("path confetti are not supported in this browser");var o,g;typeof u=="string"?o=u:(o=u.path,g=u.matrix);var S=new Path2D(o),P=document.createElement("canvas"),R=P.getContext("2d");if(!g){for(var O=1e3,L=O,V=O,ee=0,pe=0,fe,je,ce=0;ce<O;ce+=2)for(var de=0;de<O;de+=2)R.isPointInPath(S,ce,de,"nonzero")&&(L=Math.min(L,ce),V=Math.min(V,de),ee=Math.max(ee,ce),pe=Math.max(pe,de));fe=ee-L,je=pe-V;var Ue=10,Je=Math.min(Ue/fe,Ue/je);g=[Je,0,0,Je,-Math.round(fe/2+L)*Je,-Math.round(je/2+V)*Je]}return{type:"path",path:o,matrix:g}}function J(u){var o,g=1,S="#000000",P='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof u=="string"?o=u:(o=u.text,g="scalar"in u?u.scalar:g,P="fontFamily"in u?u.fontFamily:P,S="color"in u?u.color:S);var R=10*g,O=""+R+"px "+P,L=new OffscreenCanvas(R,R),V=L.getContext("2d");V.font=O;var ee=V.measureText(o),pe=Math.ceil(ee.actualBoundingBoxRight+ee.actualBoundingBoxLeft),fe=Math.ceil(ee.actualBoundingBoxAscent+ee.actualBoundingBoxDescent),je=2,ce=ee.actualBoundingBoxLeft+je,de=ee.actualBoundingBoxAscent+je;pe+=je+je,fe+=je+je,L=new OffscreenCanvas(pe,fe),V=L.getContext("2d"),V.font=O,V.fillStyle=S,V.fillText(o,ce,de);var Ue=1/g;return{type:"bitmap",bitmap:L.transferToImageBitmap(),matrix:[Ue,0,0,Ue,-pe*Ue/2,-fe*Ue/2]}}m.exports=function(){return Le().apply(this,arguments)},m.exports.reset=function(){Le().reset()},m.exports.create=_e,m.exports.shapeFromPath=I,m.exports.shapeFromText=J})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),cs,!1);const mc=cs.exports;cs.exports.create;const Yf=[{title:"Happy with Laughs",emotion:"laugh",text:"سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش ڕوویدا."},{title:"Whisper Secret",emotion:"whisper",text:"[whisper] گوێ بگرە، ئەمە نهێنییەکی زۆر گەورەیە."},{title:"Angry Question",emotion:"angry",text:"ئەمە چییە؟ [angry] بۆچی هەمیشە ئەمە ڕوودەدات؟"},{title:"Multi-Emotions",emotion:"mixed",text:"سڵاو! [laugh] ئەمە زۆر خۆشە بەڵام [whisper] دەبێت زۆر هێمن بین."},{title:"Simple Greeting",emotion:"neutral",text:"سڵاو! چۆنی؟"}],qf=[{char:"ێ",name:"Ye bi ser"},{char:"ڕ",name:"Re giran"},{char:"ڵ",name:"Lam giran"},{char:"ڤ",name:"Ve"},{char:"ۆ",name:"O"},{char:"ئ",name:"Hamza"},{char:"ک",name:"Kaf"},{char:"ی",name:"Ye"},{char:"ە",name:"He / Ae"}],Jf=[{tag:"[laugh]",label:"Laugh"},{tag:"[whisper]",label:"Whisper"},{tag:"[sigh]",label:"Sigh"},{tag:"[gasp]",label:"Gasp"},{tag:"[crying]",label:"Crying"},{tag:"[shouting]",label:"Shout"},{tag:"[angry]",label:"Angry"},{tag:"[happy]",label:"Happy"},{tag:"[giggle]",label:"Giggle"},{tag:"[excited]",label:"Excited"},{tag:"[cough]",label:"Cough"}],hc=({value:d,onChange:w,label:m="Kurdish Text (Unicode / RTL)",placeholder:E="دەقی کوردی لێرە بنووسە... (کلیک لەسەر تاگەکانی [laugh] یان [whisper] بکە بۆ دانانیان لەناو دێڕەکەدا)",disabled:T=!1,onSelectPreset:A,showInlineTagToolbar:D=!0})=>{const X=z.useRef(null),[F,G]=z.useState(""),B=y=>{const Z=X.current;if(!Z){w((d||"")+y);return}const ge=Z.selectionStart??d.length,ye=Z.selectionEnd??d.length,se=d.substring(0,ge),Ne=d.substring(ye),We=se.length>0&&!se.endsWith(" ")&&!se.endsWith(`
`),Ie=Ne.length>0&&!Ne.startsWith(" ")&&!Ne.startsWith(`
`),Te=`${We?" ":""}${y} `,oe=se+Te+Ne;w(oe),setTimeout(()=>{Z.focus();const he=ge+Te.length;Z.setSelectionRange(he,he)},10)},C=()=>{if(!F.trim())return;let y=F.trim();y.startsWith("[")||(y=`[${y}`),y.endsWith("]")||(y=`${y}]`),B(y),G("")},M=y=>{B(y)},Y=()=>{d&&navigator.clipboard.writeText(d)},ie=d.replace(/\[([a-zA-Z0-9_\s-]+)\]/g,"").replace(/\s+/g," ").trim(),q=d.match(/\[([a-zA-Z0-9_\s-]+)\]/g)||[],k={};q.forEach(y=>{k[y]=(k[y]||0)+1});const U=ie?ie.split(/\s+/).length:0,le=ie.length;return a.jsxs("div",{className:"kurdish-editor-container",children:[a.jsxs("div",{className:"editor-header",children:[a.jsxs("div",{className:"editor-label-group",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:m}),a.jsx("span",{className:"badge badge-cyan",children:"Sorani UTF-8"}),q.length>0&&a.jsxs("span",{className:"badge badge-emerald",children:[q.length," Tag",q.length>1?"s":""," in Text"]})]}),a.jsx("div",{className:"editor-actions",children:d&&a.jsxs(a.Fragment,{children:[a.jsxs("button",{type:"button",className:"aux-btn",onClick:Y,title:"Copy Kurdish text to clipboard",children:[a.jsx(ls,{size:13}),a.jsx("span",{children:"Copy"})]}),a.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>w(""),title:"Clear text",children:[a.jsx(ol,{size:13}),a.jsx("span",{children:"Clear"})]})]})})]}),A&&a.jsxs("div",{className:"presets-bar",children:[a.jsxs("div",{className:"presets-title",children:[a.jsx(qr,{size:12}),a.jsx("span",{children:"Presets:"})]}),a.jsx("div",{className:"presets-list",children:Yf.map((y,Z)=>a.jsx("button",{type:"button",className:"preset-pill",onClick:()=>A(y.text,y.emotion),title:y.text,children:y.title},Z))})]}),D&&a.jsxs("div",{className:"inline-tags-bar",children:[a.jsxs("div",{className:"tags-bar-header",children:[a.jsx(Pf,{size:13,className:"text-cyan"}),a.jsx("span",{children:"Click to Insert Audio Tag at Cursor:"})]}),a.jsxs("div",{className:"inline-tags-list",children:[Jf.map(y=>a.jsx("button",{type:"button",className:"inline-tag-chip",onClick:()=>B(y.tag),title:`Click to insert ${y.tag} (click multiple times for repeated tags)`,disabled:T,children:a.jsx("code",{children:y.tag})},y.tag)),a.jsxs("div",{className:"custom-tag-mini-box",children:[a.jsx("input",{type:"text",className:"custom-tag-mini-input",placeholder:"custom tag...",value:F,onChange:y=>G(y.target.value),onKeyDown:y=>{y.key==="Enter"&&(y.preventDefault(),C())}}),a.jsx("button",{type:"button",className:"custom-tag-mini-btn",onClick:C,title:"Insert custom tag",disabled:!F.trim(),children:a.jsx(lf,{size:12})})]})]})]}),a.jsx("div",{className:"textarea-wrapper",children:a.jsx("textarea",{ref:X,dir:"rtl",lang:"ckb",className:"textarea-control textarea-kurdish",value:d,onChange:y=>w(y.target.value),placeholder:E,disabled:T,rows:4,id:"kurdish-text-input"})}),q.length>0&&a.jsxs("div",{className:"tags-detected-banner",children:[a.jsxs("div",{className:"detected-chips-row",children:[a.jsx("span",{className:"detected-label",children:"Active Speech Tags:"}),Object.entries(k).map(([y,Z])=>a.jsxs("span",{className:"tag-count-pill",children:[a.jsx("code",{children:y}),Z>1&&a.jsxs("span",{className:"pill-count",children:["×",Z]})]},y))]}),a.jsxs("div",{className:"clean-transcript-row",dir:"rtl",children:[a.jsx("span",{className:"clean-label",children:"Saved in JSON (Clean Unicode):"}),a.jsx("span",{className:"kurdish-text clean-text-val",children:ie||"(Empty)"})]})]}),a.jsxs("div",{className:"editor-footer",children:[a.jsxs("div",{className:"keyboard-helper",children:[a.jsx("span",{className:"helper-label",children:"Kurdish Chars:"}),a.jsx("div",{className:"char-buttons",children:qf.map(y=>a.jsx("button",{type:"button",className:"char-btn",onClick:()=>M(y.char),title:`Insert ${y.name} (${y.char})`,children:y.char},y.char))})]}),a.jsxs("div",{className:"editor-stats",children:[a.jsxs("span",{children:[U," words"]}),a.jsx("span",{className:"stats-divider",children:"•"}),a.jsxs("span",{children:[le," clean chars"]})]})]}),a.jsx("style",{children:`
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
      `})]})},cr=({src:d,sampleId:w,autoPlay:m=!1,onEnded:E,onTimeUpdate:T,showDownload:A=!0})=>{const D=z.useRef(null),[X,F]=z.useState(!1),[G,B]=z.useState(0),[C,M]=z.useState(0),[Y,ie]=z.useState(1),[q,k]=z.useState(!1),[U,le]=z.useState(1);z.useEffect(()=>{D.current&&(D.current.playbackRate=Y)},[Y]),z.useEffect(()=>{F(!1),B(0)},[d]);const y=()=>{D.current&&(X?(D.current.pause(),F(!1)):D.current.play().then(()=>{F(!0)}).catch(oe=>{console.error("Audio play error:",oe)}))},Z=()=>{if(!D.current)return;const oe=D.current.currentTime;B(oe),T&&T(oe)},ge=()=>{D.current&&M(D.current.duration||0)},ye=oe=>{const he=parseFloat(oe.target.value);B(he),D.current&&(D.current.currentTime=he)},se=()=>{if(!D.current)return;const oe=!q;k(oe),D.current.muted=oe},Ne=()=>{const oe=[.75,1,1.25,1.5],he=(oe.indexOf(Y)+1)%oe.length;ie(oe[he])},We=()=>{D.current&&(D.current.currentTime=0,B(0),D.current.play(),F(!0))},Ie=oe=>{if(isNaN(oe)||oe<0)return"0:00";const he=Math.floor(oe/60),_e=Math.floor(oe%60);return`${he}:${_e<10?"0":""}${_e}`},Te=C>0?G/C*100:0;return a.jsxs("div",{className:"audio-player-card",children:[a.jsx("audio",{ref:D,src:d,autoPlay:m,onTimeUpdate:Z,onLoadedMetadata:ge,onEnded:()=>{F(!1),E&&E()}}),a.jsxs("div",{className:"audio-player-main",children:[a.jsx("button",{className:`player-play-btn ${X?"playing":""}`,onClick:y,"aria-label":X?"Pause":"Play",children:X?a.jsx(Zp,{size:20}):a.jsx(rf,{size:20,style:{marginLeft:2}})}),a.jsxs("div",{className:"player-track-container",children:[a.jsx("div",{className:"player-waveform-bg",children:Array.from({length:32}).map((oe,he)=>{const _e=he/32*100<=Te,ze=20+Math.sin(he*.6)*15+Math.cos(he*1.2)*10;return a.jsx("div",{className:`waveform-bar ${_e?"active":""}`,style:{height:`${Math.max(15,ze)}%`}},he)})}),a.jsx("input",{type:"range",min:"0",max:C||100,step:"0.01",value:G,onChange:ye,className:"player-seek-slider"})]}),a.jsxs("div",{className:"player-time-badge",children:[a.jsx("span",{children:Ie(G)}),a.jsx("span",{className:"time-separator",children:"/"}),a.jsx("span",{children:Ie(C)})]})]}),a.jsxs("div",{className:"audio-player-aux",children:[a.jsxs("div",{className:"aux-left",children:[a.jsx("button",{className:"aux-btn",onClick:We,title:"Replay from start",children:a.jsx(uf,{size:14})}),a.jsxs("button",{className:"aux-btn speed-badge",onClick:Ne,title:"Change Speed",children:[a.jsx(Wp,{size:13}),a.jsxs("span",{children:[Y,"x"]})]}),a.jsx("button",{className:"aux-btn",onClick:se,title:q?"Unmute":"Mute",children:q?a.jsx(_f,{size:14}):a.jsx(dc,{size:14})})]}),A&&w&&a.jsxs("a",{href:`/api/dataset/${w}/download/wav`,download:`${w}.wav`,className:"aux-btn download-btn",title:"Download Audio (WAV)",children:[a.jsx(is,{size:14}),a.jsx("span",{children:"WAV"})]})]}),a.jsx("style",{children:`
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
      `})]})},Xf=({alignment:d,currentTime:w=0,onSeekTime:m})=>{const[E,T]=z.useState("chars");if(!d||!d.characters||d.characters.length===0)return a.jsxs("div",{className:"alignment-empty-state",children:[a.jsx(sl,{size:16,className:"text-dim"}),a.jsx("span",{children:"No timing/alignment metadata returned for this generation."})]});const A=d.characters,D=d.character_start_times_seconds||[],X=d.character_end_times_seconds||[];return a.jsxs("div",{className:"alignment-root",children:[a.jsxs("div",{className:"alignment-header",children:[a.jsxs("div",{className:"alignment-title",children:[a.jsx(sl,{size:15,className:"text-cyan"}),a.jsxs("span",{children:["ElevenLabs Character Alignment (",A.length," characters)"]})]}),a.jsxs("div",{className:"alignment-toggle",children:[a.jsxs("button",{className:`toggle-pill ${E==="chars"?"active":""}`,onClick:()=>T("chars"),children:[a.jsx(Fp,{size:12}),a.jsx("span",{children:"Interactive"})]}),a.jsxs("button",{className:`toggle-pill ${E==="table"?"active":""}`,onClick:()=>T("table"),children:[a.jsx(ss,{size:12}),a.jsx("span",{children:"Data"})]})]})]}),E==="chars"?a.jsx("div",{className:"alignment-chars-stream",dir:"rtl",children:A.map((F,G)=>{const B=D[G]??0,C=X[G]??B+.05,M=w>=B&&w<=C,Y=w>C;return a.jsxs("span",{className:`align-char-chip ${M?"active":""} ${Y?"passed":""}`,onClick:()=>m&&m(B),title:`${F} (${B.toFixed(2)}s - ${C.toFixed(2)}s)`,children:[F===" "?" ":F,a.jsxs("span",{className:"char-timestamp",children:[B.toFixed(2),"s"]})]},G)})}):a.jsx("div",{className:"alignment-table-wrapper",children:a.jsxs("table",{className:"alignment-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"#"}),a.jsx("th",{children:"Char"}),a.jsx("th",{children:"Start (s)"}),a.jsx("th",{children:"End (s)"}),a.jsx("th",{children:"Duration (ms)"})]})}),a.jsx("tbody",{children:A.map((F,G)=>{const B=D[G]??0,C=X[G]??0,M=Math.round((C-B)*1e3);return a.jsxs("tr",{onClick:()=>m&&m(B),style:{cursor:"pointer"},children:[a.jsx("td",{children:G+1}),a.jsx("td",{className:"kurdish-cell",children:F}),a.jsx("td",{children:B.toFixed(3)}),a.jsx("td",{children:C.toFixed(3)}),a.jsxs("td",{children:[M,"ms"]})]},G)})})]})}),a.jsx("style",{children:`
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
      `})]})},Zf=[{key:"naturalness",label:"Naturalness",desc:"Human-like cadence, flow, and pacing"},{key:"emotion",label:"Emotion Expression",desc:"Accuracy of intended emotional delivery"},{key:"pronunciation",label:"Pronunciation",desc:"Accuracy of Kurdish Sorani vowels & consonants"},{key:"overall",label:"Overall Quality",desc:"Suitability for Kurdish TTS dataset"}],dr=({ratings:d,onSaveRatings:w,compact:m=!1})=>{const[E,T]=z.useState({naturalness:(d==null?void 0:d.naturalness)||0,emotion:(d==null?void 0:d.emotion)||0,pronunciation:(d==null?void 0:d.pronunciation)||0,overall:(d==null?void 0:d.overall)||0,notes:(d==null?void 0:d.notes)||""}),[A,D]=z.useState(!1),[X,F]=z.useState(!1),G=(C,M)=>{const Y={...E,[C]:M};T(Y),m&&w(Y)},B=async()=>{D(!0);try{await w(E),F(!0),setTimeout(()=>F(!1),2500)}finally{D(!1)}};return m?a.jsxs("div",{className:"compact-rating-root",children:[a.jsxs("div",{className:"compact-stars-row",children:[a.jsx("span",{className:"compact-label",children:"Overall:"}),[1,2,3,4,5].map(C=>a.jsx("button",{type:"button",className:`star-btn ${C<=(E.overall||0)?"filled":""}`,onClick:()=>G("overall",C),title:`${C} / 5`,children:a.jsx(ts,{size:14})},C)),E.overall>0&&a.jsxs("span",{className:"score-num",children:["(",E.overall,"/5)"]})]}),a.jsx("style",{children:`
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
        `})]}):a.jsxs("div",{className:"rating-card",children:[a.jsxs("div",{className:"rating-header",children:[a.jsxs("div",{className:"rating-title-group",children:[a.jsx(ts,{size:16,className:"text-amber"}),a.jsx("span",{className:"rating-card-title",children:"Dataset Quality Rating (1–5)"})]}),X&&a.jsxs("span",{className:"save-badge",children:[a.jsx(ns,{size:13}),a.jsx("span",{children:"Ratings Saved"})]})]}),a.jsx("div",{className:"criteria-grid",children:Zf.map(C=>{const M=E[C.key]||0;return a.jsxs("div",{className:"criteria-item",children:[a.jsxs("div",{className:"criteria-info",children:[a.jsx("span",{className:"criteria-name",children:C.label}),a.jsx("span",{className:"criteria-desc",children:C.desc})]}),a.jsx("div",{className:"stars-selector",children:[1,2,3,4,5].map(Y=>a.jsxs("button",{type:"button",className:`star-pill ${Y<=M?"active":""}`,onClick:()=>G(C.key,Y),title:`${C.label}: ${Y} Star${Y>1?"s":""}`,children:[a.jsx(ts,{size:15,fill:Y<=M?"currentColor":"none"}),a.jsx("span",{children:Y})]},Y))})]},C.key)})}),a.jsxs("div",{className:"rating-notes-box",children:[a.jsxs("div",{className:"notes-label",children:[a.jsx(Jp,{size:13}),a.jsx("span",{children:"Linguistic Notes & Pronunciation Feedback:"})]}),a.jsx("textarea",{className:"input-control notes-textarea",value:E.notes||"",onChange:C=>T({...E,notes:C.target.value}),placeholder:"e.g. Kurdish vowels 'ێ' and 'ۆ' sounded natural, slight robot tone on angry inflection...",rows:2})]}),a.jsx("div",{className:"rating-footer",children:a.jsx("button",{type:"button",className:"btn btn-primary btn-sm",onClick:B,disabled:A,children:A?a.jsx("span",{children:"Saving..."}):a.jsxs(a.Fragment,{children:[a.jsx(ns,{size:14}),a.jsx("span",{children:"Save Evaluation to JSON"})]})})}),a.jsx("style",{children:`
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
      `})]})},ul=({sample:d,onClose:w,onSampleUpdated:m})=>{const[E,T]=z.useState(!1),[A,D]=z.useState(!1),[X,F]=z.useState(d.emotion||"neutral"),[G,B]=z.useState(d.notes||""),[C,M]=z.useState(!1),Y=JSON.stringify(d,null,2),ie=()=>{navigator.clipboard.writeText(Y),T(!0),setTimeout(()=>T(!1),2e3)},q=async()=>{M(!0);try{const U=await ur(d.id,{emotion:X,notes:G});m(U),D(!1)}catch(U){alert(`Failed to save changes: ${U.message}`)}finally{M(!1)}},k=a.jsxs("div",{className:"modal-backdrop",onClick:w,children:[a.jsxs("div",{className:"modal-container",onClick:U=>U.stopPropagation(),children:[a.jsxs("div",{className:"modal-header",children:[a.jsxs("div",{className:"modal-title-group",children:[a.jsx(or,{size:20,className:"text-cyan"}),a.jsxs("div",{children:[a.jsxs("div",{className:"modal-title",children:["Sample Metadata: ",d.id]}),a.jsxs("div",{className:"modal-subtitle",children:[d.json_filename," • ",d.method==="elevenlabs_api"?"API Generation":"Normal Website Workflow"]})]})]}),a.jsxs("div",{className:"modal-header-actions",children:[a.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:()=>D(!A),children:[a.jsx(tf,{size:14}),a.jsx("span",{children:A?"Cancel Edit":"Edit Metadata"})]}),a.jsx("button",{className:"btn-ghost btn-icon",onClick:w,children:a.jsx(us,{size:18})})]})]}),a.jsxs("div",{className:"kurdish-spotlight-card",children:[a.jsxs("div",{className:"spotlight-header",children:[a.jsx("span",{className:"spotlight-label",children:"Authoritative Kurdish Transcript (Unicode UTF-8)"}),a.jsxs("span",{className:"badge badge-emerald",children:[d.language.toUpperCase()," • ",d.script]})]}),a.jsx("div",{className:"kurdish-text kurdish-spotlight-body",dir:"rtl",children:d.text})]}),A&&a.jsxs("div",{className:"edit-metadata-form",children:[a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Emotion"}),a.jsxs("select",{className:"select-control",value:X,onChange:U=>F(U.target.value),children:[a.jsx("option",{value:"neutral",children:"Neutral"}),a.jsx("option",{value:"happy",children:"Happy"}),a.jsx("option",{value:"sad",children:"Sad"}),a.jsx("option",{value:"angry",children:"Angry"}),a.jsx("option",{value:"excited",children:"Excited"}),a.jsx("option",{value:"whisper",children:"Whisper"}),a.jsx("option",{value:"laughing",children:"Laughing"}),a.jsx("option",{value:"custom",children:"Custom"})]})]}),a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Notes & Feedback"}),a.jsx("textarea",{className:"textarea-control",value:G,onChange:U=>B(U.target.value),rows:2})]}),a.jsxs("button",{className:"btn btn-primary btn-sm",onClick:q,disabled:C,children:[a.jsx(os,{size:14}),a.jsx("span",{children:C?"Saving...":"Save Changes"})]})]}),a.jsxs("div",{className:"json-viewer-wrapper",children:[a.jsxs("div",{className:"json-viewer-header",children:[a.jsx("span",{className:"json-title",children:"Raw JSON Payload"}),a.jsxs("div",{className:"json-actions",children:[a.jsxs("button",{className:"aux-btn",onClick:ie,children:[E?a.jsx(ns,{size:13,className:"text-emerald"}):a.jsx(ls,{size:13}),a.jsx("span",{children:E?"Copied":"Copy JSON"})]}),a.jsxs("a",{href:`/api/dataset/${d.id}/download/json`,download:d.json_filename,className:"aux-btn",children:[a.jsx(is,{size:13}),a.jsx("span",{children:"Download JSON"})]})]})]}),a.jsx("pre",{className:"json-code-block",children:Y})]}),a.jsxs("div",{className:"modal-footer",children:[a.jsxs("div",{className:"modal-created-info",children:["Created: ",new Date(d.created_at).toLocaleString()]}),a.jsx("button",{className:"btn btn-secondary btn-sm",onClick:w,children:"Close"})]})]}),a.jsx("style",{children:`
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
      `})]});return pc.createPortal(k,document.body)},ic=[{value:"neutral",label:"Neutral",tag:"",color:"neutral",desc:"Standard baseline tone"},{value:"laughing",label:"Laughing",tag:"[laugh]",color:"laughing",desc:"Native v3 laughter & cheerful delivery"},{value:"happy",label:"Happy",tag:"[happy]",color:"happy",desc:"Joyful & upbeat inflection"},{value:"whisper",label:"Whisper",tag:"[whisper]",color:"whisper",desc:"Soft breathy whisper"},{value:"angry",label:"Angry",tag:"[angry]",color:"angry",desc:"Sharp, aggressive intensity"},{value:"sad",label:"Sad",tag:"[sad]",color:"sad",desc:"Melancholic, slower cadence"},{value:"excited",label:"Excited",tag:"[excited]",color:"excited",desc:"Energetic, dynamic pitch"},{value:"custom",label:"Custom Tag",tag:"[laugh]",color:"custom",desc:"User-defined audio tag prompt"}],em=({config:d,onOpenSettings:w,onSampleCreated:m,addToast:E,onConfigUpdated:T})=>{var Gt,Ot,Yt,bt,vt,Rn;const[A,D]=z.useState("سڵاو! [laugh] چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا."),[X,F]=z.useState("laughing"),[G,B]=z.useState(["laughing"]),[C,M]=z.useState(""),[Y,ie]=z.useState(!0),[q,k]=z.useState(!1),[U,le]=z.useState(!1),[y,Z]=z.useState(""),[ge,ye]=z.useState(!1),[se,Ne]=z.useState([]),[We,Ie]=z.useState([]),[Te,oe]=z.useState(""),[he,_e]=z.useState("eleven_v3"),[ze,Le]=z.useState(!1),[we,I]=z.useState(""),[J,u]=z.useState(!1),[o,g]=z.useState(!1),[S,P]=z.useState(.5),[R,O]=z.useState(.75),[L,V]=z.useState(0),[ee,pe]=z.useState(!0),[fe,je]=z.useState(!1),[ce,de]=z.useState(null),[Ue,Je]=z.useState(0),[Ke,Xe]=z.useState(null),lt=z.useRef(null);z.useEffect(()=>{Oe()},[d==null?void 0:d.keyValid]);const Oe=async()=>{if(d!=null&&d.keyValid){u(!0);try{const[re,Re]=await Promise.all([Df().catch(()=>[]),Of().catch(()=>[])]);Ne(re),Ie(Re),re.length>0&&!Te&&oe(re[0].voice_id)}catch(re){console.warn("Could not load voice catalog:",re)}finally{u(!1)}}},It=(re,Re)=>{D(re),Re&&ic.some(pr=>pr.value===Re)&&F(Re)},Dt=ic.find(re=>re.value===X),Ln=X==="custom"?C:(Dt==null?void 0:Dt.tag)||"",xn=async re=>{if(re.preventDefault(),!A.trim()){E({type:"error",title:"Input Error",message:"Please enter Kurdish text to generate speech."});return}if(!(d!=null&&d.keyValid)){E({type:"error",title:"API Key Missing",message:"Please configure your ElevenLabs API Key in Settings."}),w();return}const Re=se.find(qt=>qt.voice_id===Te),pr=ze?we.trim()||"eleven_v3":he;je(!0);try{const Jt=(await $f({text:A.trim(),emotion:X,emotions:G,emotionTag:Ln,includeTagInPrompt:Y,whisperEntire:q,voiceId:Te||"21m00Tcm4TlvDq8ikWAM",voiceName:Re?Re.name:void 0,modelId:pr,voiceSettings:{stability:q?.35:S,similarity_boost:R,style:q?.45:L,use_speaker_boost:ee}})).sample;de(Jt),m(Jt),setTimeout(()=>{var An;(An=lt.current)==null||An.scrollIntoView({behavior:"smooth",block:"center"})},150),mc({particleCount:50,spread:60,origin:{y:.7}}),E({type:"success",title:"Speech Generated Successfully!",message:`Sample saved as ${Jt.id}.wav and ${Jt.id}.json with clean Kurdish transcript.`})}catch(qt){E({type:"error",title:"Speech Generation Failed",message:qt.message||"ElevenLabs API returned an error."})}finally{je(!1)}},Fn=async re=>{if(ce)try{const Re=await ur(ce.id,{ratings:re});de(Re),m(Re),E({type:"success",title:"Ratings Saved",message:"Evaluation saved to metadata JSON."})}catch(Re){E({type:"error",title:"Save Failed",message:Re.message})}},yn=async re=>{if(re.preventDefault(),!!y.trim()){ye(!0);try{const Re=await fc(y.trim());E({type:"success",title:"API Key Connected",message:Re.message||"ElevenLabs API connected successfully."}),T&&T({status:"ok",isKeyConfigured:!0,keyValid:!0,validationError:null,maskedKey:`${y.slice(0,4)}...${y.slice(-4)}`,userInfo:Re.userInfo}),Z(""),le(!1),Oe()}catch(Re){E({type:"error",title:"Connection Failed",message:Re.message||"Invalid ElevenLabs API Key."})}finally{ye(!1)}}};return a.jsxs("div",{className:"api-page-root",children:[a.jsx("div",{className:"page-header",children:a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(qr,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"ElevenLabs API Speech Generator"})]}),a.jsxs("p",{className:"page-description",children:["Synthesize Kurdish emotional speech with ElevenLabs v3. Supports multiple inline tags (",a.jsx("code",{children:"[laugh]"}),", ",a.jsx("code",{children:"[whisper]"}),", ",a.jsx("code",{children:"[sigh]"}),") and full-audio persistent whispering while strictly preserving the clean Unicode transcript."]})]})}),a.jsxs("div",{className:`glass-card api-config-banner ${d!=null&&d.keyValid?"config-connected":"config-missing"}`,children:[a.jsxs("div",{className:"config-banner-left",children:[a.jsx("div",{className:"config-icon-badge",children:a.jsx(ac,{size:20,className:d!=null&&d.keyValid?"text-emerald":"text-amber"})}),a.jsxs("div",{className:"config-info",children:[a.jsxs("div",{className:"config-status-title",children:[a.jsx("span",{children:"ElevenLabs Engine Connection:"}),d!=null&&d.keyValid?a.jsxs("span",{className:"badge badge-emerald",children:["Active (",((Ot=(Gt=d.userInfo)==null?void 0:Gt.tier)==null?void 0:Ot.toUpperCase())||"Connected",")"]}):a.jsx("span",{className:"badge badge-amber",children:"API Key Required"})]}),a.jsx("div",{className:"config-status-desc",children:d!=null&&d.keyValid?`Key configured (${d.maskedKey||"••••••••"}). ${((bt=(Yt=d.userInfo)==null?void 0:Yt.character_count)==null?void 0:bt.toLocaleString())||0} / ${((Rn=(vt=d.userInfo)==null?void 0:vt.character_limit)==null?void 0:Rn.toLocaleString())||1e4} characters used.`:"Enter your ElevenLabs API Key (xi-api-key) below to enable direct speech synthesis with audio tags."})]})]}),a.jsx("div",{className:"config-banner-actions",children:a.jsxs("button",{type:"button",className:"btn btn-secondary btn-sm",onClick:()=>le(!U),children:[a.jsx(ac,{size:14}),a.jsx("span",{children:U?"Hide Key Input":d!=null&&d.keyValid?"Change API Key":"Enter API Key"})]})})]}),U&&a.jsxs("form",{onSubmit:yn,className:"inline-key-form-card glass-card",children:[a.jsxs("div",{className:"key-form-row",children:[a.jsx("input",{type:"password",className:"input-control",placeholder:"Paste xi-api-key here (e.g. sk_...)",value:y,onChange:re=>Z(re.target.value),id:"inline-api-key-input"}),a.jsxs("button",{type:"submit",className:"btn btn-primary btn-sm",disabled:ge||!y.trim(),children:[a.jsx(os,{size:14}),a.jsx("span",{children:ge?"Validating...":"Save & Connect"})]})]}),a.jsxs("div",{className:"key-form-hint",children:["🔒 Saved directly to local backend environment (",a.jsx("code",{children:".env"}),")."]})]}),a.jsxs("div",{className:"api-grid-layout",children:[a.jsxs("form",{onSubmit:xn,className:"glass-card generator-form-card",children:[a.jsx("div",{className:"form-group",children:a.jsx(hc,{value:A,onChange:D,onSelectPreset:It,label:"Kurdish Transcript with Inline Tags",disabled:fe,showInlineTagToolbar:!0})}),a.jsx("div",{className:"whisper-banner-card",children:a.jsxs("label",{className:"whisper-checkbox-row",children:[a.jsx("input",{type:"checkbox",checked:q,onChange:re=>k(re.target.checked)}),a.jsxs("div",{className:"whisper-label-wrap",children:[a.jsxs("div",{className:"whisper-title",children:[a.jsx(If,{size:16,className:"text-purple"}),a.jsx("span",{children:"💨 Whisper Throughout Entire Audio"}),a.jsx("span",{className:"badge badge-purple",children:"Continuous Mode"})]}),a.jsx("div",{className:"whisper-desc",children:"Instructs ElevenLabs v3 to maintain a continuous, soft whisper from the first word to the end of the audio track."})]})]})}),a.jsxs("div",{className:"grid-2 form-row-compact",children:[a.jsxs("div",{className:"form-group",children:[a.jsxs("div",{className:"form-label-row",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:"Voice ID / Preset"}),(d==null?void 0:d.keyValid)&&a.jsx("button",{type:"button",className:"reload-btn",onClick:Oe,title:"Reload voices from ElevenLabs",children:a.jsx(lc,{size:12,className:J?"spin":""})})]}),se.length>0?a.jsx("select",{className:"select-control",value:Te,onChange:re=>oe(re.target.value),disabled:fe,children:se.map(re=>a.jsxs("option",{value:re.voice_id,children:[re.name," (",re.category||"voice",")"]},re.voice_id))}):a.jsx("input",{type:"text",className:"input-control",placeholder:"Enter ElevenLabs Voice ID (e.g. 21m00Tcm4TlvDq8ikWAM)",value:Te,onChange:re=>oe(re.target.value),disabled:fe})]}),a.jsxs("div",{className:"form-group",children:[a.jsxs("div",{className:"form-label-row",children:[a.jsx("label",{className:"form-label",style:{marginBottom:0},children:"ElevenLabs Model"}),a.jsx("span",{className:"badge badge-emerald",children:"v3 Audio Tags"})]}),a.jsxs("select",{className:"select-control",value:ze?"custom":he,onChange:re=>{re.target.value==="custom"?Le(!0):(Le(!1),_e(re.target.value))},disabled:fe,children:[a.jsx("option",{value:"eleven_v3",children:"ElevenLabs v3 (Recommended — Supports [laugh], [whisper], [sigh])"}),a.jsx("option",{value:"eleven_multilingual_v3",children:"Eleven Multilingual v3"}),a.jsx("option",{value:"eleven_turbo_v3",children:"Eleven Turbo v3"}),a.jsx("option",{value:"eleven_multilingual_v2",children:"Eleven Multilingual v2"}),a.jsx("option",{value:"eleven_turbo_v2_5",children:"Eleven Turbo v2.5 (Fast Multilingual)"}),a.jsx("option",{value:"eleven_flash_v2_5",children:"Eleven Flash v2.5 (Ultra Low Latency)"}),a.jsx("option",{value:"eleven_flash_v2",children:"Eleven Flash v2"}),a.jsx("option",{value:"eleven_monolingual_v1",children:"Eleven English v1"}),a.jsx("option",{value:"custom",children:"Custom Model ID..."})]}),ze&&a.jsx("input",{type:"text",className:"input-control",style:{marginTop:6},placeholder:"Enter custom model ID (e.g. eleven_v3, eleven_multilingual_v3)",value:we,onChange:re=>I(re.target.value),disabled:fe})]})]}),a.jsx("div",{className:"advanced-settings-toggle",children:a.jsxs("button",{type:"button",className:"aux-btn",onClick:()=>g(!o),children:[a.jsx(xf,{size:13}),a.jsx("span",{children:o?"Hide Advanced Parameters":"Advanced Parameters (Stability, Similarity Boost, Style)"})]})}),o&&a.jsxs("div",{className:"advanced-settings-panel",children:[a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Stability: ",S.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Higher = consistent / Lower = expressive"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:S,onChange:re=>P(parseFloat(re.target.value)),className:"range-slider"})]}),a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Similarity Boost: ",R.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Closeness to original speaker voice"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:R,onChange:re=>O(parseFloat(re.target.value)),className:"range-slider"})]}),a.jsxs("div",{className:"slider-group",children:[a.jsxs("div",{className:"slider-label-row",children:[a.jsxs("span",{children:["Style Exaggeration: ",L.toFixed(2)]}),a.jsx("span",{className:"slider-desc",children:"Amplifies emotional delivery"})]}),a.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:L,onChange:re=>V(parseFloat(re.target.value)),className:"range-slider"})]}),a.jsxs("label",{className:"checkbox-label",style:{marginTop:6},children:[a.jsx("input",{type:"checkbox",checked:ee,onChange:re=>pe(re.target.checked)}),a.jsx("span",{children:"Enable Speaker Boost (Improves clarity and volume)"})]})]}),a.jsx("div",{className:"form-submit-row",children:a.jsx("button",{type:"submit",className:"btn btn-primary btn-lg submit-btn pulse-glow",disabled:fe||!A.trim(),id:"btn-generate-speech",children:fe?a.jsxs(a.Fragment,{children:[a.jsx(lc,{size:18,className:"spin"}),a.jsx("span",{children:"Synthesizing Kurdish Audio with ElevenLabs v3..."})]}):a.jsxs(a.Fragment,{children:[a.jsx(qr,{size:18}),a.jsx("span",{children:"Generate Kurdish Speech (API)"})]})})})]}),a.jsx("div",{ref:lt,className:"generation-output-container sticky-output-panel",children:ce?a.jsxs("div",{className:"glass-card glass-card-glow output-card",children:[a.jsxs("div",{className:"output-card-header",children:[a.jsxs("div",{className:"output-badge-group",children:[a.jsxs("span",{className:"badge badge-cyan",children:["ID: ",ce.id]}),a.jsx("span",{className:`badge emotion-badge-${ce.emotion}`,children:ce.emotion.toUpperCase()}),a.jsx("span",{className:"badge badge-purple",children:ce.model_id})]}),a.jsx("div",{className:"output-header-actions",children:a.jsxs("button",{className:"aux-btn",onClick:()=>Xe(ce),title:"Inspect full JSON metadata",children:[a.jsx(or,{size:13}),a.jsx("span",{children:"Inspect JSON"})]})})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript (Clean Unicode)"}),a.jsx("span",{className:"badge badge-emerald",children:"Exact UTF-8"})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:ce.text})]}),a.jsx("div",{className:"output-audio-section",children:a.jsx(cr,{src:ce.audioUrl||`/api/dataset/${ce.id}/audio`,sampleId:ce.id,autoPlay:!0,onTimeUpdate:Je})}),ce.alignment&&a.jsx("div",{className:"output-alignment-section",children:a.jsx(Xf,{alignment:ce.alignment,currentTime:Ue})}),a.jsx("div",{className:"output-rating-section",children:a.jsx(dr,{ratings:ce.ratings,onSaveRatings:Fn})})]}):a.jsxs("div",{className:"glass-card empty-output-card",children:[a.jsx("div",{className:"empty-icon-wrap",children:a.jsx(dc,{size:36,className:"text-cyan"})}),a.jsx("div",{className:"empty-title",children:"Ready for Speech Generation"}),a.jsxs("p",{className:"empty-sub",children:["Enter your Kurdish text on the left, insert tags like ",a.jsx("code",{children:"[laugh]"})," or enable ",a.jsx("code",{children:"Continuous Whisper"}),", and press ",a.jsx("strong",{children:"Generate Kurdish Speech"}),"."]}),a.jsxs("div",{className:"empty-features-list",children:[a.jsxs("div",{className:"feature-item",children:[a.jsx(Tn,{size:15,className:"text-emerald"}),a.jsx("span",{children:"Interactive result panel opens directly in view"})]}),a.jsxs("div",{className:"feature-item",children:[a.jsx(Tn,{size:15,className:"text-emerald"}),a.jsxs("span",{children:["Preserves clean Kurdish text in ",a.jsx("code",{children:"001.json"})," stripping tags"]})]}),a.jsxs("div",{className:"feature-item",children:[a.jsx(Tn,{size:15,className:"text-emerald"}),a.jsx("span",{children:"Supports multiple inline emotion tags & continuous whisper"})]})]})]})})]}),Ke&&a.jsx(ul,{sample:Ke,onClose:()=>Xe(null),onSampleUpdated:re=>{Xe(re),(ce==null?void 0:ce.id)===re.id&&de(re)}}),a.jsx("style",{children:`
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
      `})]})},tm=[{value:"neutral",label:"Neutral",tag:"",color:"neutral"},{value:"laughing",label:"Laughing",tag:"[laugh]",color:"laughing"},{value:"happy",label:"Happy",tag:"[happy]",color:"happy"},{value:"whisper",label:"Whisper",tag:"[whisper]",color:"whisper"},{value:"angry",label:"Angry",tag:"[angry]",color:"angry"},{value:"sad",label:"Sad",tag:"[sad]",color:"sad"},{value:"excited",label:"Excited",tag:"[excited]",color:"excited"},{value:"custom",label:"Custom",tag:"[laugh]",color:"custom"}],nm=({onSampleCreated:d,addToast:w})=>{var I,J;const[m,E]=z.useState("سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا."),[T,A]=z.useState("happy"),[D,X]=z.useState(!1),[F,G]=z.useState(""),[B,C]=z.useState(""),[M,Y]=z.useState([]),[ie,q]=z.useState(null),[k,U]=z.useState(!1),[le,y]=z.useState(!1),[Z,ge]=z.useState(!1),ye=z.useRef(null),[se,Ne]=z.useState(null),[We,Ie]=z.useState(null);z.useEffect(()=>{Te()},[]);const Te=async()=>{try{const u=await Vf();Y(u),u.length>0&&!ie&&q(u[0].pendingId)}catch(u){console.warn("Error loading pending queue:",u)}},oe=tm.find(u=>u.value===T),he=(oe==null?void 0:oe.tag)||"",_e=async()=>{if(!m.trim()){w({type:"error",title:"Empty Input",message:"Please enter Kurdish text before preparing."});return}U(!0);try{let u=m.trim();D&&he&&(u=`${he} ${u}`),await navigator.clipboard.writeText(u);const o=await Uf({text:m.trim(),emotion:T,emotionTag:he,voiceName:F.trim()||void 0,notes:B.trim()||void 0});Y(o.allPending),q(o.pendingItem.pendingId),w({type:"success",title:"Text Copied & Sample Prepared!",message:"Kurdish text is in your clipboard. Now generate in ElevenLabs and drop the WAV here!"})}catch(u){w({type:"error",title:"Preparation Failed",message:u.message})}finally{U(!1)}},ze=async u=>{if(u){if(!u.name.toLowerCase().endsWith(".wav")&&!u.name.toLowerCase().endsWith(".mp3")){w({type:"error",title:"Invalid File",message:"Please upload a WAV audio file downloaded from ElevenLabs."});return}ge(!0);try{const o=new FormData;o.append("audio",u),ie?o.append("pendingId",ie):(o.append("text",m.trim()),o.append("emotion",T)),F&&o.append("voiceName",F),B&&o.append("notes",B);const g=await Wf(o),S=g.sample;Ne(S),d(S);const P=g.remainingPending||[];Y(P),P.length>0?q(P[0].pendingId):q(null),mc({particleCount:50,spread:60,origin:{y:.7}}),w({type:"success",title:"Audio Paired Automatically!",message:`Saved as ${S.id}.wav & ${S.id}.json with zero transcript retyping!`})}catch(o){w({type:"error",title:"Upload Failed",message:o.message||"Could not pair audio."})}finally{ge(!1)}}},Le=async u=>{try{await Bf(u),Y(o=>o.filter(g=>g.pendingId!==u)),ie===u&&q(null),w({type:"info",title:"Item Removed",message:"Pending sample removed from queue."})}catch(o){w({type:"error",title:"Failed",message:o.message})}},we=async u=>{if(se)try{const o=await ur(se.id,{ratings:u});Ne(o),d(o),w({type:"success",title:"Ratings Saved",message:"Evaluation saved to metadata JSON."})}catch(o){w({type:"error",title:"Save Failed",message:o.message})}};return a.jsxs("div",{className:"normal-page-root",children:[a.jsx("div",{className:"page-header",children:a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(ss,{size:24,className:"text-emerald inline-icon"}),a.jsx("span",{children:"Normal ElevenLabs Website Workflow"})]}),a.jsxs("p",{className:"page-description",children:["Generate speech using ElevenLabs' official web interface and download the WAV. The application preserves your exact Kurdish transcript and automatically pairs it with your dropped WAV file — ",a.jsx("strong",{children:"never retype transcripts"}),"."]})]})}),a.jsxs("div",{className:"workflow-steps-banner",children:[a.jsxs("div",{className:"step-card",children:[a.jsx("div",{className:"step-number",children:"1"}),a.jsxs("div",{className:"step-content",children:[a.jsx("div",{className:"step-title",children:"Enter Kurdish Text"}),a.jsx("div",{className:"step-sub",children:"Type or paste text once into this app"})]})]}),a.jsx(es,{size:18,className:"step-arrow"}),a.jsxs("div",{className:"step-card",children:[a.jsx("div",{className:"step-number",children:"2"}),a.jsxs("div",{className:"step-content",children:[a.jsx("div",{className:"step-title",children:"Copy & Prepare"}),a.jsx("div",{className:"step-sub",children:"Saves Unicode text & puts it in clipboard"})]})]}),a.jsx(es,{size:18,className:"step-arrow"}),a.jsxs("div",{className:"step-card",children:[a.jsx("div",{className:"step-number",children:"3"}),a.jsxs("div",{className:"step-content",children:[a.jsx("div",{className:"step-title",children:"Generate in Web UI"}),a.jsx("div",{className:"step-sub",children:"Paste into ElevenLabs & download WAV"})]})]}),a.jsx(es,{size:18,className:"step-arrow"}),a.jsxs("div",{className:"step-card",children:[a.jsx("div",{className:"step-number",children:"4"}),a.jsxs("div",{className:"step-content",children:[a.jsx("div",{className:"step-title",children:"Drop WAV Here"}),a.jsxs("div",{className:"step-sub",children:["Auto-pairs as ",a.jsx("code",{children:"normal_001.wav/json"})]})]})]})]}),a.jsxs("div",{className:"normal-grid-layout",children:[a.jsxs("div",{className:"glass-card prepare-card",children:[a.jsxs("div",{className:"card-section-title",children:[a.jsx("span",{className:"step-badge",children:"Step 1 & 2"}),a.jsx("span",{children:"Prepare Kurdish Sample"})]}),a.jsx("div",{className:"form-group",children:a.jsx(hc,{value:m,onChange:E,label:"Kurdish Transcript with Inline Tags",onSelectPreset:u=>{E(u)},showInlineTagToolbar:!0})}),a.jsxs("div",{className:"grid-2 form-row-compact",children:[a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Voice Used (Optional)"}),a.jsx("input",{type:"text",className:"input-control",placeholder:"e.g. Adam, Rachel, Nicole",value:F,onChange:u=>G(u.target.value)})]}),a.jsxs("div",{className:"form-group",children:[a.jsx("label",{className:"form-label",children:"Notes (Optional)"}),a.jsx("input",{type:"text",className:"input-control",placeholder:"e.g. ElevenLabs website v3 model test",value:B,onChange:u=>C(u.target.value)})]})]}),a.jsxs("div",{className:"prepare-actions",children:[a.jsxs("button",{type:"button",className:"btn btn-accent btn-lg pulse-glow",onClick:_e,disabled:k||!m.trim(),id:"btn-copy-prepare",style:{width:"100%"},children:[a.jsx(ls,{size:18}),a.jsx("span",{children:"Copy Text & Prepare Sample"})]}),a.jsxs("a",{href:"https://elevenlabs.io/app/speech-synthesis/text-to-speech",target:"_blank",rel:"noreferrer",className:"btn btn-secondary btn-md",style:{width:"100%"},children:[a.jsx("span",{children:"Open ElevenLabs Text to Speech"}),a.jsx(cc,{size:15})]})]})]}),a.jsxs("div",{className:"dropzone-column",children:[a.jsxs("div",{className:"glass-card dropzone-card",children:[a.jsxs("div",{className:"card-section-title",children:[a.jsx("span",{className:"step-badge",children:"Step 3 & 4"}),a.jsx("span",{children:"Drop ElevenLabs Audio (WAV)"})]}),ie?a.jsxs("div",{className:"active-pairing-target",children:[a.jsxs("div",{className:"target-label",children:[a.jsx(sl,{size:14,className:"text-cyan"}),a.jsx("span",{children:"Matching to Prepared Sample:"})]}),a.jsx("div",{className:"kurdish-text target-kurdish-preview",dir:"rtl",children:(I=M.find(u=>u.pendingId===ie))==null?void 0:I.text}),a.jsxs("div",{className:"target-meta",children:[a.jsx("span",{className:"badge badge-emerald",children:(J=M.find(u=>u.pendingId===ie))==null?void 0:J.emotion.toUpperCase()}),a.jsx("span",{className:"badge badge-dim",children:"Ready for WAV drop"})]})]}):a.jsxs("div",{className:"no-target-warning",children:[a.jsx(Nf,{size:15,className:"text-amber"}),a.jsx("span",{children:'No active sample prepared yet. Click "Copy Text & Prepare Sample" first!'})]}),a.jsxs("div",{className:`drop-area ${le?"dragging":""} ${Z?"uploading":""}`,onDragOver:u=>{u.preventDefault(),y(!0)},onDragLeave:()=>y(!1),onDrop:u=>{u.preventDefault(),y(!1),u.dataTransfer.files&&u.dataTransfer.files.length>0&&ze(u.dataTransfer.files[0])},onClick:()=>{var u;return(u=ye.current)==null?void 0:u.click()},children:[a.jsx("input",{ref:ye,type:"file",accept:".wav,audio/wav,audio/x-wav,.mp3,audio/mpeg",style:{display:"none"},onChange:u=>{u.target.files&&u.target.files.length>0&&ze(u.target.files[0])}}),a.jsx("div",{className:"drop-icon-wrap",children:a.jsx(Sf,{size:32,className:"text-cyan"})}),a.jsx("div",{className:"drop-text-main",children:Z?"Saving & Associating Audio...":"Drag & Drop Downloaded WAV Here"}),a.jsx("div",{className:"drop-text-sub",children:"or click to browse from your computer"}),a.jsxs("div",{className:"drop-badge",children:[a.jsx(Op,{size:12}),a.jsx("span",{children:"Accepts .wav / .mp3 from ElevenLabs"})]})]}),a.jsxs("div",{className:"kurdish-safe-banner",children:[a.jsx("div",{className:"safe-banner-title",children:"✨ Kurdish Unicode Protection Guarantee"}),a.jsxs("div",{className:"safe-banner-text",children:["ElevenLabs' website video sharing may show ",a.jsx("code",{children:"□□□□"})," boxes due to web font issues. This tool completely bypasses that problem by taking the exact Unicode transcript stored in Step 2 and pairing it directly with your clean audio!"]})]})]}),M.length>0&&a.jsxs("div",{className:"glass-card pending-queue-card",children:[a.jsxs("div",{className:"card-section-title",children:[a.jsx(sl,{size:16,className:"text-cyan"}),a.jsxs("span",{children:["Pending Prepared Samples (",M.length,")"]})]}),a.jsx("div",{className:"pending-items-list",children:M.map(u=>a.jsxs("div",{className:`pending-item ${ie===u.pendingId?"active-item":""}`,onClick:()=>q(u.pendingId),children:[a.jsxs("div",{className:"pending-item-content",children:[a.jsx("div",{className:"kurdish-text pending-item-text",dir:"rtl",children:u.text}),a.jsxs("div",{className:"pending-item-meta",children:[a.jsx("span",{className:`badge emotion-badge-${u.emotion}`,children:u.emotion}),a.jsx("span",{className:"pending-time",children:new Date(u.createdAt).toLocaleTimeString()})]})]}),a.jsx("button",{type:"button",className:"btn-ghost btn-icon btn-sm",onClick:o=>{o.stopPropagation(),Le(u.pendingId)},title:"Remove from queue",children:a.jsx(ol,{size:13})})]},u.pendingId))})]}),se&&a.jsxs("div",{className:"glass-card glass-card-glow paired-sample-card",children:[a.jsxs("div",{className:"output-card-header",children:[a.jsxs("div",{className:"output-badge-group",children:[a.jsx("span",{className:"badge badge-emerald",children:"Successfully Created"}),a.jsxs("span",{className:"badge badge-cyan",children:["ID: ",se.id]}),a.jsx("span",{className:`badge emotion-badge-${se.emotion}`,children:se.emotion.toUpperCase()})]}),a.jsx("button",{className:"aux-btn",onClick:()=>Ie(se),children:"Inspect JSON"})]}),a.jsx("div",{className:"output-kurdish-box",children:a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:se.text})}),a.jsx(cr,{src:se.audioUrl||`/api/dataset/${se.id}/audio`,sampleId:se.id,autoPlay:!0}),a.jsx(dr,{ratings:se.ratings,onSaveRatings:we})]})]})]}),We&&a.jsx(ul,{sample:We,onClose:()=>Ie(null),onSampleUpdated:u=>{Ie(u),(se==null?void 0:se.id)===u.id&&Ne(u)}}),a.jsx("style",{children:`
        .normal-page-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workflow-steps-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 16px 24px;
          gap: 12px;
          overflow-x: auto;
        }

        .step-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .step-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-main);
        }

        .step-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .step-arrow {
          color: var(--text-dim);
          flex-shrink: 0;
        }

        .normal-grid-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .normal-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .card-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
        }

        .step-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .prepare-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .dropzone-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-pairing-target {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .target-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .target-kurdish-preview {
          font-size: 1.15rem;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .target-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .no-target-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          font-size: 0.8rem;
          color: #FBBF24;
          margin-bottom: 16px;
        }

        .drop-area {
          border: 2px dashed rgba(56, 189, 248, 0.35);
          border-radius: var(--radius-lg);
          background: rgba(15, 23, 42, 0.5);
          padding: 36px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .drop-area:hover, .drop-area.dragging {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.2);
        }

        .drop-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .drop-text-main {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .drop-text-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .drop-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          margin-top: 14px;
        }

        .kurdish-safe-banner {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-top: 16px;
        }

        .safe-banner-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #34D399;
          margin-bottom: 4px;
        }

        .safe-banner-text {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .pending-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }

        .pending-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pending-item:hover {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.8);
        }

        .pending-item.active-item {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
        }

        .pending-item-content {
          flex: 1;
        }

        .pending-item-text {
          font-size: 0.95rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }

        .pending-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .pending-time {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .paired-sample-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      `})]})},rm=({samples:d,onSampleUpdated:w,onSampleDeleted:m,addToast:E})=>{const[T,A]=z.useState(""),[D,X]=z.useState("all"),[F,G]=z.useState("all"),[B,C]=z.useState(null),[M,Y]=z.useState(null),[ie,q]=z.useState("cards"),k=d.filter(y=>{if(T.trim()){const Z=T.toLowerCase(),ge=y.id.toLowerCase().includes(Z),ye=y.text.toLowerCase().includes(Z),se=(y.voice_name||y.voice_id||"").toLowerCase().includes(Z);if(!ge&&!ye&&!se)return!1}return!(D!=="all"&&y.emotion!==D||F!=="all"&&y.method!==F)}),U=async y=>{if(window.confirm(`Are you sure you want to delete sample "${y}" and its WAV/JSON files?`))try{await Hf(y),m(y),E({type:"info",title:"Sample Deleted",message:`Sample ${y} removed from dataset.`})}catch(Z){E({type:"error",title:"Delete Failed",message:Z.message})}},le=async(y,Z)=>{try{const ge=await ur(y,{ratings:Z});w(ge),E({type:"success",title:"Rating Saved",message:`Ratings updated for ${y}`})}catch(ge){E({type:"error",title:"Rating Failed",message:ge.message})}};return a.jsxs("div",{className:"dataset-page-root",children:[a.jsxs("div",{className:"dataset-page-header",children:[a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(rs,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Kurdish Speech Dataset Manager"})]}),a.jsx("p",{className:"page-description",children:"Authoritative repository of all generated Kurdish WAV audio files and strictly preserved Unicode JSON metadata."})]}),a.jsx("div",{className:"header-actions",children:a.jsxs("a",{href:Qf(),download:"kurdish_tts_dataset.zip",className:"btn btn-accent btn-md",id:"btn-download-dataset-zip",children:[a.jsx(Ap,{size:18}),a.jsx("span",{children:"Download Dataset (ZIP)"})]})})]}),a.jsxs("div",{className:"glass-card filter-card",children:[a.jsxs("div",{className:"filter-grid",children:[a.jsxs("div",{className:"search-input-wrapper",children:[a.jsx(pf,{size:16,className:"search-icon"}),a.jsx("input",{type:"text",className:"input-control search-input",placeholder:"Search by Kurdish text, ID (e.g. 001), or voice...",value:T,onChange:y=>A(y.target.value)})]}),a.jsxs("div",{className:"filter-select-group",children:[a.jsx(Vp,{size:15,className:"text-muted"}),a.jsxs("select",{className:"select-control filter-select",value:D,onChange:y=>X(y.target.value),children:[a.jsx("option",{value:"all",children:"All Emotions"}),a.jsx("option",{value:"neutral",children:"Neutral"}),a.jsx("option",{value:"happy",children:"Happy"}),a.jsx("option",{value:"sad",children:"Sad"}),a.jsx("option",{value:"angry",children:"Angry"}),a.jsx("option",{value:"excited",children:"Excited"}),a.jsx("option",{value:"whisper",children:"Whisper"}),a.jsx("option",{value:"laughing",children:"Laughing"}),a.jsx("option",{value:"custom",children:"Custom"})]})]}),a.jsx("div",{className:"filter-select-group",children:a.jsxs("select",{className:"select-control filter-select",value:F,onChange:y=>G(y.target.value),children:[a.jsx("option",{value:"all",children:"All Methods"}),a.jsx("option",{value:"elevenlabs_api",children:"ElevenLabs API"}),a.jsx("option",{value:"elevenlabs_web",children:"Normal Web Workflow"})]})}),a.jsxs("div",{className:"view-mode-toggle",children:[a.jsx("button",{className:`view-btn ${ie==="cards"?"active":""}`,onClick:()=>q("cards"),children:"Cards"}),a.jsx("button",{className:`view-btn ${ie==="table"?"active":""}`,onClick:()=>q("table"),children:"Table"})]})]}),a.jsx("div",{className:"filter-stats-bar",children:a.jsxs("span",{className:"stats-count",children:["Showing ",a.jsx("strong",{children:k.length})," of ",a.jsx("strong",{children:d.length})," total samples"]})})]}),k.length===0?a.jsxs("div",{className:"glass-card empty-dataset-state",children:[a.jsx(rs,{size:40,className:"text-dim"}),a.jsx("div",{className:"empty-title",children:"No Samples Found"}),a.jsx("p",{className:"empty-sub",children:d.length===0?"No audio samples have been generated yet. Use the API Generation or Normal Web Workflow tab to create your first Kurdish TTS sample!":"No samples matched your search or filter criteria."})]}):ie==="cards"?a.jsx("div",{className:"samples-card-grid",children:k.map(y=>a.jsxs("div",{className:"glass-card sample-item-card",children:[a.jsxs("div",{className:"sample-card-header",children:[a.jsxs("div",{className:"sample-id-badge-group",children:[a.jsx("span",{className:"sample-id-pill",children:y.id}),a.jsx("span",{className:`badge emotion-badge-${y.emotion}`,children:y.emotion.toUpperCase()}),a.jsx("span",{className:`badge ${y.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:y.method==="elevenlabs_api"?"API":"Web"})]}),a.jsxs("div",{className:"sample-card-actions",children:[a.jsxs("button",{className:"aux-btn",onClick:()=>Y(y),title:"Inspect & Edit Metadata JSON",children:[a.jsx(or,{size:13}),a.jsx("span",{children:"JSON"})]}),a.jsx("button",{className:"aux-btn btn-danger",onClick:()=>U(y.id),title:"Delete Sample",children:a.jsx(ol,{size:13})})]})]}),a.jsx("div",{className:"sample-kurdish-box",children:a.jsx("div",{className:"kurdish-text sample-kurdish-text",dir:"rtl",children:y.text})}),a.jsxs("div",{className:"sample-details-row",children:[a.jsxs("div",{className:"detail-item",children:[a.jsx("span",{className:"detail-label",children:"Voice:"}),a.jsx("span",{className:"detail-val",children:y.voice_name||y.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"detail-item",children:[a.jsx("span",{className:"detail-label",children:"Model:"}),a.jsx("span",{className:"detail-val",children:y.model_id||"Multilingual"})]})]}),a.jsx("div",{className:"sample-audio-wrap",children:a.jsx(cr,{src:y.audioUrl||`/api/dataset/${y.id}/audio`,sampleId:y.id,showDownload:!0})}),a.jsx("div",{className:"sample-rating-wrap",children:a.jsx(dr,{ratings:y.ratings,onSaveRatings:Z=>le(y.id,Z),compact:!0})})]},y.id))}):a.jsx("div",{className:"glass-card table-view-card",children:a.jsx("div",{className:"dataset-table-container",children:a.jsxs("table",{className:"dataset-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"ID"}),a.jsx("th",{children:"Kurdish Transcript (RTL)"}),a.jsx("th",{children:"Emotion"}),a.jsx("th",{children:"Method"}),a.jsx("th",{children:"Voice / Model"}),a.jsx("th",{children:"Audio Playback"}),a.jsx("th",{children:"Rating"}),a.jsx("th",{children:"Date"}),a.jsx("th",{children:"Actions"})]})}),a.jsx("tbody",{children:k.map(y=>a.jsxs("tr",{children:[a.jsx("td",{children:a.jsx("span",{className:"sample-id-pill",children:y.id})}),a.jsx("td",{className:"kurdish-table-cell",dir:"rtl",children:y.text}),a.jsx("td",{children:a.jsx("span",{className:`badge emotion-badge-${y.emotion}`,children:y.emotion})}),a.jsx("td",{children:a.jsx("span",{className:`badge ${y.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:y.method==="elevenlabs_api"?"API":"Web"})}),a.jsxs("td",{className:"voice-cell",children:[a.jsx("div",{className:"voice-name",children:y.voice_name||"ElevenLabs"}),a.jsx("div",{className:"model-name",children:y.model_id||"v2"})]}),a.jsx("td",{style:{minWidth:260},children:a.jsx(cr,{src:y.audioUrl||`/api/dataset/${y.id}/audio`,sampleId:y.id,showDownload:!1})}),a.jsx("td",{children:a.jsx(dr,{ratings:y.ratings,onSaveRatings:Z=>le(y.id,Z),compact:!0})}),a.jsx("td",{className:"date-cell",children:new Date(y.created_at).toLocaleDateString()}),a.jsx("td",{children:a.jsxs("div",{className:"table-actions",children:[a.jsx("button",{className:"aux-btn",onClick:()=>Y(y),title:"Inspect Metadata",children:a.jsx(or,{size:13})}),a.jsx("a",{href:`/api/dataset/${y.id}/download/wav`,download:`${y.id}.wav`,className:"aux-btn",title:"Download WAV",children:a.jsx(is,{size:13})}),a.jsx("button",{className:"aux-btn btn-danger",onClick:()=>U(y.id),title:"Delete",children:a.jsx(ol,{size:13})})]})})]},y.id))})]})})}),M&&a.jsx(ul,{sample:M,onClose:()=>Y(null),onSampleUpdated:y=>{Y(y),w(y)}}),a.jsx("style",{children:`
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
      `})]})},am=({samples:d,onSampleUpdated:w,addToast:m})=>{const[E,T]=z.useState(""),[A,D]=z.useState(""),[X,F]=z.useState(null),G=d.reduce((k,U)=>{const le=U.text.trim();return k[le]||(k[le]=[]),k[le].push(U),k},{}),B=Object.entries(G).filter(([k,U])=>U.length>=2),C=d.find(k=>k.id===E)||(d.length>0?d[0]:null),M=d.find(k=>k.id===A)||(d.length>1?d[1]:null),Y=k=>{const U=k.find(y=>y.method==="elevenlabs_api")||k[0],le=k.find(y=>y.method==="elevenlabs_web")||k[1]||k[0];T(U.id),D(le.id)},ie=async k=>{if(C)try{const U=await ur(C.id,{ratings:k});w(U),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample A (${C.id})`})}catch(U){m({type:"error",title:"Save Failed",message:U.message})}},q=async k=>{if(M)try{const U=await ur(M.id,{ratings:k});w(U),m({type:"success",title:"Ratings Saved",message:`Ratings saved for Sample B (${M.id})`})}catch(U){m({type:"error",title:"Save Failed",message:U.message})}};return d.length<2?a.jsxs("div",{className:"compare-page-root",children:[a.jsxs("div",{className:"page-header",children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(ll,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),a.jsx("p",{className:"page-description",children:"Side-by-side A/B evaluation of Kurdish speech naturalness, emotional inflection, and pronunciation."})]}),a.jsxs("div",{className:"glass-card empty-compare-card",children:[a.jsx(ll,{size:48,className:"text-dim"}),a.jsx("div",{className:"empty-title",children:"Need at least 2 Samples to Compare"}),a.jsxs("p",{className:"empty-sub",children:["Generate speech using both the ",a.jsx("strong",{children:"ElevenLabs API"})," and ",a.jsx("strong",{children:"Normal Web Workflow"})," tabs to compare them side-by-side!"]})]})]}):a.jsxs("div",{className:"compare-page-root",children:[a.jsx("div",{className:"page-header",children:a.jsxs("div",{children:[a.jsxs("h1",{className:"page-title",children:[a.jsx(ll,{size:24,className:"text-cyan inline-icon"}),a.jsx("span",{children:"Compare API vs Normal Web Workflow"})]}),a.jsx("p",{className:"page-description",children:"Side-by-side A/B benchmark of Kurdish speech quality, Kurdish vowel pronunciation, and emotional accuracy."})]})}),B.length>0&&a.jsxs("div",{className:"glass-card matching-pairs-card",children:[a.jsxs("div",{className:"pairs-title",children:[a.jsx(qr,{size:15,className:"text-amber"}),a.jsxs("span",{children:["Found ",B.length," Matching Kurdish Text Group",B.length>1?"s":"",":"]})]}),a.jsx("div",{className:"pairs-list",children:B.map(([k,U],le)=>a.jsxs("button",{className:"pair-select-btn",onClick:()=>Y(U),title:k,children:[a.jsxs("span",{className:"pair-count-badge",children:[U.length," versions"]}),a.jsx("span",{className:"kurdish-text pair-text",dir:"rtl",children:k})]},le))})]}),a.jsxs("div",{className:"glass-card selector-bar",children:[a.jsxs("div",{className:"selector-column",children:[a.jsx("label",{className:"form-label",children:"Sample A (Left)"}),a.jsx("select",{className:"select-control",value:(C==null?void 0:C.id)||"",onChange:k=>T(k.target.value),children:d.map(k=>a.jsxs("option",{value:k.id,children:[k.id," • [",k.method==="elevenlabs_api"?"API":"Web","] ",k.emotion," — ",k.text.slice(0,30),"..."]},k.id))})]}),a.jsx("div",{className:"compare-icon-wrap",children:a.jsx(bp,{size:20,className:"text-cyan"})}),a.jsxs("div",{className:"selector-column",children:[a.jsx("label",{className:"form-label",children:"Sample B (Right)"}),a.jsx("select",{className:"select-control",value:(M==null?void 0:M.id)||"",onChange:k=>D(k.target.value),children:d.map(k=>a.jsxs("option",{value:k.id,children:[k.id," • [",k.method==="elevenlabs_api"?"API":"Web","] ",k.emotion," — ",k.text.slice(0,30),"..."]},k.id))})]})]}),a.jsxs("div",{className:"grid-2 compare-grid",children:[C&&a.jsxs("div",{className:"glass-card compare-card card-a",children:[a.jsxs("div",{className:"compare-card-header",children:[a.jsxs("div",{className:"compare-card-title",children:[a.jsx("span",{className:"side-badge badge-a",children:"Sample A"}),a.jsx("span",{className:"sample-id-pill",children:C.id}),a.jsx("span",{className:`badge ${C.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:C.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),a.jsxs("button",{className:"aux-btn",onClick:()=>F(C),children:[a.jsx(or,{size:13}),a.jsx("span",{children:"JSON"})]})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript"}),a.jsx("span",{className:`badge emotion-badge-${C.emotion}`,children:C.emotion})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:C.text})]}),a.jsxs("div",{className:"compare-meta-table",children:[a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Voice:"}),a.jsx("span",{className:"meta-v",children:C.voice_name||C.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Model:"}),a.jsx("span",{className:"meta-v",children:C.model_id||"Multilingual"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),a.jsx("span",{className:"meta-v",children:C.emotion_tag||"None"})]})]}),a.jsx(cr,{src:C.audioUrl||`/api/dataset/${C.id}/audio`,sampleId:C.id}),a.jsx(dr,{ratings:C.ratings,onSaveRatings:ie})]}),M&&a.jsxs("div",{className:"glass-card compare-card card-b",children:[a.jsxs("div",{className:"compare-card-header",children:[a.jsxs("div",{className:"compare-card-title",children:[a.jsx("span",{className:"side-badge badge-b",children:"Sample B"}),a.jsx("span",{className:"sample-id-pill",children:M.id}),a.jsx("span",{className:`badge ${M.method==="elevenlabs_api"?"badge-cyan":"badge-emerald"}`,children:M.method==="elevenlabs_api"?"ElevenLabs API":"Normal Website"})]}),a.jsxs("button",{className:"aux-btn",onClick:()=>F(M),children:[a.jsx(or,{size:13}),a.jsx("span",{children:"JSON"})]})]}),a.jsxs("div",{className:"output-kurdish-box",children:[a.jsxs("div",{className:"output-kurdish-label",children:[a.jsx("span",{children:"Preserved Kurdish Transcript"}),a.jsx("span",{className:`badge emotion-badge-${M.emotion}`,children:M.emotion})]}),a.jsx("div",{className:"kurdish-text output-kurdish-text",dir:"rtl",children:M.text})]}),a.jsxs("div",{className:"compare-meta-table",children:[a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Voice:"}),a.jsx("span",{className:"meta-v",children:M.voice_name||M.voice_id||"ElevenLabs Voice"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Model:"}),a.jsx("span",{className:"meta-v",children:M.model_id||"Multilingual"})]}),a.jsxs("div",{className:"meta-row",children:[a.jsx("span",{className:"meta-k",children:"Prompt Tag:"}),a.jsx("span",{className:"meta-v",children:M.emotion_tag||"None"})]})]}),a.jsx(cr,{src:M.audioUrl||`/api/dataset/${M.id}/audio`,sampleId:M.id}),a.jsx(dr,{ratings:M.ratings,onSaveRatings:q})]})]}),X&&a.jsx(ul,{sample:X,onClose:()=>F(null),onSampleUpdated:k=>{F(k),w(k)}}),a.jsx("style",{children:`
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
      `})]})},lm=()=>{const[d,w]=z.useState("api"),[m,E]=z.useState(null),[T,A]=z.useState([]),[D,X]=z.useState(!1),[F,G]=z.useState([]),B=k=>{const U="toast_"+Math.random().toString(36).substring(2,9);G(le=>[...le,{...k,id:U}])},C=k=>{G(U=>U.filter(le=>le.id!==k))};z.useEffect(()=>{M()},[]);const M=async()=>{try{const[k,U]=await Promise.all([Af().catch(()=>({status:"ok",isKeyConfigured:!1,keyValid:!1})),Kf().catch(()=>[])]);E(k),A(U)}catch(k){console.warn("Initial data load warning:",k)}},Y=k=>{A(U=>{const le=U.findIndex(y=>y.id===k.id);if(le!==-1){const y=[...U];return y[le]=k,y}return[k,...U]})},ie=k=>{A(U=>U.map(le=>le.id===k.id?k:le))},q=k=>{A(U=>U.filter(le=>le.id!==k))};return a.jsxs("div",{className:"app-root",children:[a.jsx(Lf,{activeTab:d,onSelectTab:w,onOpenSettings:()=>X(!0),config:m,datasetCount:T.length}),a.jsxs("main",{className:"app-container",children:[d==="api"&&a.jsx(em,{config:m,onOpenSettings:()=>X(!0),onSampleCreated:Y,addToast:B,onConfigUpdated:E}),d==="normal"&&a.jsx(nm,{onSampleCreated:Y,addToast:B}),d==="dataset"&&a.jsx(rm,{samples:T,onSampleUpdated:ie,onSampleDeleted:q,addToast:B}),d==="compare"&&a.jsx(am,{samples:T,onSampleUpdated:ie,addToast:B})]}),a.jsx("footer",{className:"app-footer",children:a.jsxs("div",{className:"footer-content",children:[a.jsxs("div",{className:"footer-brand",children:[a.jsx("span",{className:"footer-flag",children:"☀️"}),a.jsx("span",{children:"Kurdish TTS Dataset Studio"})]}),a.jsx("div",{className:"footer-info",children:"Strict UTF-8 Kurdish Sorani Unicode Preservation • ElevenLabs Audio Engine"})]})}),D&&a.jsx(Gf,{config:m,onClose:()=>X(!1),onConfigUpdated:k=>E(k)}),a.jsx(Ff,{toasts:F,onDismiss:C}),a.jsx("style",{children:`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-footer {
          border-top: 1px solid var(--border-subtle);
          background: rgba(11, 15, 23, 0.9);
          padding: 16px 24px;
          margin-top: 40px;
        }

        .footer-content {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-dim);
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .footer-flag {
          font-size: 1rem;
        }

        .footer-info {
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
      `})]})};yp.createRoot(document.getElementById("root")).render(a.jsx(fp.StrictMode,{children:a.jsx(lm,{})}));
