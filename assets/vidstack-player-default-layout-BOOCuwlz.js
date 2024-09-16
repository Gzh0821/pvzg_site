var $s=Object.getPrototypeOf;var bs=Reflect.get;var pe=e=>{throw TypeError(e)};var Bt=(e,t,s)=>t.has(e)||pe("Cannot "+s);var v=(e,t,s)=>(Bt(e,t,"read from private field"),s?s.call(e):t.get(e)),b=(e,t,s)=>t.has(e)?pe("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),T=(e,t,s,i)=>(Bt(e,t,"write to private field"),i?i.call(e,s):t.set(e,s),s),$=(e,t,s)=>(Bt(e,t,"access private method"),s);var Et=(e,t,s)=>bs($s(e),s,t);import{aT as g,t as ot,aO as Ae,bt as fs,L as st,aH as C,A as Se,F as G,aS as gs,Y as nt,bu as f,bv as Ce,p as ys,aG as xs,aL as ws,R as A,n as ks,aU as me,b1 as ve,r as lt,b4 as As,bw as Te,a3 as Ss,bx as Cs,aX as Me,by as yt,E as Vt,bz as Ts,bA as Ie,bB as Ms,a as Is,q as Ps,I as R,bC as _s,a_ as Gs,bl as Pe,s as Nt,b3 as Os,bD as Ls,bE as Bs,bF as Es,bq as _e}from"./app-kG4rV9oe.js";import{A as F,T as Ns,D as he,x as l,a as Ds,l as Rs,t as Ge}from"./vidstack-X3U7UG6U-B9xcI1mI.js";/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ws=e=>e.strings===void 0,Ks={},qs=(e,t=Ks)=>e._$AH=t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ct=e=>(...t)=>({_$litDirective$:e,values:t});let jt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,i){this._$Ct=t,this._$AM=s,this._$Ci=i}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const at=(e,t)=>{var s,i;const n=e._$AN;if(n===void 0)return!1;for(const o of n)(i=(s=o)._$AO)===null||i===void 0||i.call(s,t,!1),at(o,t);return!0},wt=e=>{let t,s;do{if((t=e._$AM)===void 0)break;s=t._$AN,s.delete(e),e=t}while((s==null?void 0:s.size)===0)},Oe=e=>{for(let t;t=e._$AM;e=t){let s=t._$AN;if(s===void 0)t._$AN=s=new Set;else if(s.has(e))break;s.add(e),Hs(t)}};function Fs(e){this._$AN!==void 0?(wt(this),this._$AM=e,Oe(this)):this._$AM=e}function Us(e,t=!1,s=0){const i=this._$AH,n=this._$AN;if(n!==void 0&&n.size!==0)if(t)if(Array.isArray(i))for(let o=s;o<i.length;o++)at(i[o],!1),wt(i[o]);else i!=null&&(at(i,!1),wt(i));else at(this,e)}const Hs=e=>{var t,s,i,n;e.type==xt.CHILD&&((t=(i=e)._$AP)!==null&&t!==void 0||(i._$AP=Us),(s=(n=e)._$AQ)!==null&&s!==void 0||(n._$AQ=Fs))};class Le extends jt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,s,i){super._$AT(t,s,i),Oe(this),this.isConnected=t._$AU}_$AO(t,s=!0){var i,n;t!==this.isConnected&&(this.isConnected=t,t?(i=this.reconnected)===null||i===void 0||i.call(this):(n=this.disconnected)===null||n===void 0||n.call(this)),s&&(at(this,t),wt(this))}setValue(t){if(Ws(this._$Ct))this._$Ct._$AI(t,this);else{const s=[...this._$Ct._$AH];s[this._$Ci]=t,this._$Ct._$AI(s,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xt=e=>e??F;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Kt extends jt{constructor(t){if(super(t),this.et=F,t.type!==xt.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===F||t==null)return this.ft=void 0,this.et=t;if(t===Ns)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.et)return this.ft;this.et=t;const s=[t];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}}Kt.directiveName="unsafeHTML",Kt.resultType=1;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class qt extends Kt{}qt.directiveName="unsafeSVG",qt.resultType=2;const zs=Ct(qt);var O,rt,Q,_,Ft,Ut,Be,Ee,ye,Qs=(ye=class extends Le{constructor(s){super(s);b(this,_);b(this,O,null);b(this,rt,!1);b(this,Q,null);T(this,rt,s.type===xt.ATTRIBUTE||s.type===xt.BOOLEAN_ATTRIBUTE)}render(s){return s!==v(this,O)&&(this.disconnected(),T(this,O,s),this.isConnected&&$(this,_,Ft).call(this)),v(this,O)?$(this,_,Ut).call(this,Se(v(this,O))):F}reconnected(){$(this,_,Ft).call(this)}disconnected(){var s;(s=v(this,Q))==null||s.call(this),T(this,Q,null)}},O=new WeakMap,rt=new WeakMap,Q=new WeakMap,_=new WeakSet,Ft=function(){v(this,O)&&T(this,Q,G($(this,_,Ee).bind(this)))},Ut=function(s){return v(this,rt)?Xt(s):s},Be=function(s){this.setValue($(this,_,Ut).call(this,s))},Ee=function(){var s;$(this,_,Be).call(this,(s=v(this,O))==null?void 0:s.call(this))},ye);function a(e){return Ct(Qs)(g(e))}var V,dt,ut,ct,Ht,xe,Ne=(xe=class{constructor(t,s){b(this,ct);b(this,V);b(this,dt);b(this,ut);this.elements=new Set,T(this,ut,Ae($(this,ct,Ht).bind(this))),T(this,V,t),T(this,dt,s)}connect(){$(this,ct,Ht).call(this);let t=new MutationObserver(v(this,ut));for(let s of v(this,V))t.observe(s,{childList:!0,subtree:!0});ot(()=>t.disconnect()),ot(this.disconnect.bind(this))}disconnect(){this.elements.clear()}assign(t,s){fs(t)?(s.textContent="",s.append(t)):(he(null,s),he(t,s)),s.style.display||(s.style.display="contents");let i=s.firstElementChild;if(!i)return;let n=s.getAttribute("data-class");n&&i.classList.add(...n.split(" "))}},V=new WeakMap,dt=new WeakMap,ut=new WeakMap,ct=new WeakSet,Ht=function(t){if(t&&!t.some(n=>n.addedNodes.length))return;let s=!1,i=v(this,V).flatMap(n=>[...n.querySelectorAll("slot")]);for(let n of i)!n.hasAttribute("name")||this.elements.has(n)||(this.elements.add(n),s=!0);s&&v(this,dt).call(this,this.elements)},xe),Vs=0,ft="data-slot-id",j,St,X,gt,we,De=(we=class{constructor(t){b(this,X);b(this,j);b(this,St,Ae($(this,X,gt).bind(this)));T(this,j,t),this.slots=new Ne(t,$(this,X,gt).bind(this))}connect(){this.slots.connect(),$(this,X,gt).call(this);let t=new MutationObserver(v(this,St));for(let s of v(this,j))t.observe(s,{childList:!0});ot(()=>t.disconnect())}},j=new WeakMap,St=new WeakMap,X=new WeakSet,gt=function(){for(let t of v(this,j))for(let s of t.children){if(s.nodeType!==1)continue;let i=s.getAttribute("slot");if(!i)continue;s.style.display="none";let n=s.getAttribute(ft);n||s.setAttribute(ft,n=++Vs+"");for(let o of this.slots.elements){if(o.getAttribute("name")!==i||o.getAttribute(ft)===n)continue;let d=document.importNode(s,!0);i.includes("-icon")&&d.classList.add("vds-icon"),d.style.display="",d.removeAttribute("slot"),this.slots.assign(d,o),o.setAttribute(ft,n)}}},we);function js({name:e,class:t,state:s,paths:i,viewBox:n="0 0 32 32"}){return l`<svg
    class="${"vds-icon"+(t?` ${t}`:"")}"
    viewBox="${n}"
    fill="none"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    data-icon=${Xt(e??s)}
  >
    ${st(i)?zs(i):a(i)}
  </svg>`}var Y,pt,H,Re,zt,ke,Xs=(ke=class{constructor(t){b(this,H);b(this,Y,{});b(this,pt,!1);this.slots=new Ne(t,$(this,H,zt).bind(this))}connect(){this.slots.connect()}load(){this.loadIcons().then(t=>{T(this,Y,t),T(this,pt,!0),$(this,H,zt).call(this)})}},Y=new WeakMap,pt=new WeakMap,H=new WeakSet,Re=function*(){for(let t of Object.keys(v(this,Y))){let s=`${t}-icon`;for(let i of this.slots.elements)i.name===s&&(yield{icon:v(this,Y)[t],slot:i})}},zt=function(){if(v(this,pt))for(let{icon:t,slot:s}of $(this,H,Re).call(this))this.slots.assign(t,s)},ke),Ys=class extends Xs{connect(){super.connect();let{player:t}=C();if(!t.el)return;let s,i=new IntersectionObserver(n=>{var o;(o=n[0])!=null&&o.isIntersecting&&(s==null||s(),s=void 0,this.load())});i.observe(t.el),s=ot(()=>i.disconnect())}};const Dt=new WeakMap,Tt=Ct(class extends Le{render(e){return F}update(e,[t]){var s;const i=t!==this.G;return i&&this.G!==void 0&&this.ot(void 0),(i||this.rt!==this.lt)&&(this.G=t,this.dt=(s=e.options)===null||s===void 0?void 0:s.host,this.ot(this.lt=e.element)),F}ot(e){var t;if(typeof this.G=="function"){const s=(t=this.dt)!==null&&t!==void 0?t:globalThis;let i=Dt.get(s);i===void 0&&(i=new WeakMap,Dt.set(s,i)),i.get(this.G)!==void 0&&this.G.call(this.dt,void 0),i.set(this.G,e),e!==void 0&&this.G.call(this.dt,e)}else this.G.value=e}get rt(){var e,t,s;return typeof this.G=="function"?(t=Dt.get((e=this.dt)!==null&&e!==void 0?e:globalThis))===null||t===void 0?void 0:t.get(this.G):(s=this.G)===null||s===void 0?void 0:s.value}disconnected(){this.rt===this.lt&&this.ot(void 0)}reconnected(){this.ot(this.lt)}});var We=As();function r(){return gs(We)}function Ke(e,t){G(()=>{let{player:s}=C(),i=s.el;return i&&nt(i,"data-layout",t()&&e),()=>i==null?void 0:i.removeAttribute("data-layout")})}function qe(e,t){return l`
    <media-menu-portal .container=${a(e)} disabled="fullscreen">
      ${t}
    </media-menu-portal>
  `}function Fe(e,t,s,i){let n=st(t)?document.querySelector(t):t;n||(n=e==null?void 0:e.closest("dialog")),n||(n=document.body);let o=document.createElement("div");o.style.display="contents",o.classList.add(s),n.append(o),G(()=>{if(!o)return;let{viewType:p}=f(),c=i();nt(o,"data-view-type",p()),nt(o,"data-sm",c),nt(o,"data-lg",!c),nt(o,"data-size",c?"sm":"lg")});let{colorScheme:d}=r();return Ce(o,d),o}var Ue=class extends Ys{async loadIcons(){let e=(await ys(async()=>{const{icons:s}=await import("./vidstack-OENSM7UP-CgQ6r6vs.js");return{icons:s}},[])).icons,t={};for(let s of Object.keys(e))t[s]=js({name:s,paths:e[s]});return t}},Js={colorScheme:"system",download:null,customIcons:!1,disableTimeSlider:!1,menuContainer:null,menuGroup:"bottom",noAudioGain:!1,noGestures:!1,noKeyboardAnimations:!1,noModal:!1,noScrubGesture:!1,playbackRates:{min:0,max:2,step:.25},audioGains:{min:0,max:300,step:25},seekStep:10,sliderChaptersMinWidth:325,hideQualityBitrate:!1,smallWhen:!1,thumbnails:null,translations:null,when:!1},mt,J,E,vt,Qt,Z,kt=(Z=class extends xs{constructor(){super(...arguments);b(this,vt);b(this,mt);b(this,J,g(()=>{let s=this.$props.when();return $(this,vt,Qt).call(this,s)}));b(this,E,g(()=>{let s=this.$props.smallWhen();return $(this,vt,Qt).call(this,s)}))}get isMatch(){return v(this,J).call(this)}get isSmallLayout(){return v(this,E).call(this)}onSetup(){T(this,mt,C()),this.setAttributes({"data-match":v(this,J),"data-sm":()=>v(this,E).call(this)?"":null,"data-lg":()=>v(this,E).call(this)?null:"","data-size":()=>v(this,E).call(this)?"sm":"lg","data-no-scrub-gesture":this.$props.noScrubGesture}),ws(We,{...this.$props,when:v(this,J),smallWhen:v(this,E),userPrefersAnnouncements:A(!0),userPrefersKeyboardAnimations:A(!0),menuPortal:A(null)})}onAttach(s){Ce(s,this.$props.colorScheme)}},mt=new WeakMap,J=new WeakMap,E=new WeakMap,vt=new WeakSet,Qt=function(s){return s!=="never"&&(ks(s)?s:g(()=>s(v(this,mt).player.state))())},Z.props=Js,Z);me([ve],kt.prototype,"isMatch",1),me([ve],kt.prototype,"isSmallLayout",1);function S(e,t){var s;return((s=e())==null?void 0:s[t])??t}function Yt(){return a(()=>{let{translations:e,userPrefersAnnouncements:t}=r();return t()?l`<media-announcer .translations=${a(e)}></media-announcer>`:null})}function I(e,t=""){return l`<slot
    name=${`${e}-icon`}
    data-class=${`vds-icon vds-${e}-icon${t?` ${t}`:""}`}
  ></slot>`}function $t(e){return e.map(t=>I(t))}function u(e,t){return a(()=>S(e,t))}function Jt({tooltip:e}){let{translations:t}=r(),{remotePlaybackState:s}=f(),i=a(()=>{let o=S(t,"AirPlay"),d=Te(s());return`${o} ${d}`}),n=u(t,"AirPlay");return l`
    <media-tooltip class="vds-airplay-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-airplay-button class="vds-airplay-button vds-button" aria-label=${i}>
          ${I("airplay")}
        </media-airplay-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-airplay-tooltip-text">${n}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function He({tooltip:e}){let{translations:t}=r(),{remotePlaybackState:s}=f(),i=a(()=>{let o=S(t,"Google Cast"),d=Te(s());return`${o} ${d}`}),n=u(t,"Google Cast");return l`
    <media-tooltip class="vds-google-cast-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-google-cast-button class="vds-google-cast-button vds-button" aria-label=${i}>
          ${I("google-cast")}
        </media-google-cast-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-google-cast-tooltip-text">${n}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Mt({tooltip:e}){let{translations:t}=r(),s=u(t,"Play"),i=u(t,"Pause");return l`
    <media-tooltip class="vds-play-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-play-button
          class="vds-play-button vds-button"
          aria-label=${u(t,"Play")}
        >
          ${$t(["play","pause","replay"])}
        </media-play-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-play-tooltip-text">${s}</span>
        <span class="vds-pause-tooltip-text">${i}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function $e({tooltip:e,ref:t=Ms}){let{translations:s}=r(),i=u(s,"Mute"),n=u(s,"Unmute");return l`
    <media-tooltip class="vds-mute-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-mute-button
          class="vds-mute-button vds-button"
          aria-label=${u(s,"Mute")}
          ${Tt(t)}
        >
          ${$t(["mute","volume-low","volume-high"])}
        </media-mute-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-mute-tooltip-text">${n}</span>
        <span class="vds-unmute-tooltip-text">${i}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Zt({tooltip:e}){let{translations:t}=r(),s=u(t,"Closed-Captions On"),i=u(t,"Closed-Captions Off");return l`
    <media-tooltip class="vds-caption-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-caption-button
          class="vds-caption-button vds-button"
          aria-label=${u(t,"Captions")}
        >
          ${$t(["cc-on","cc-off"])}
        </media-caption-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-cc-on-tooltip-text">${i}</span>
        <span class="vds-cc-off-tooltip-text">${s}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Zs(){let{translations:e}=r(),t=u(e,"Enter PiP"),s=u(e,"Exit PiP");return l`
    <media-tooltip class="vds-pip-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-pip-button
          class="vds-pip-button vds-button"
          aria-label=${u(e,"PiP")}
        >
          ${$t(["pip-enter","pip-exit"])}
        </media-pip-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content">
        <span class="vds-pip-enter-tooltip-text">${t}</span>
        <span class="vds-pip-exit-tooltip-text">${s}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function ze({tooltip:e}){let{translations:t}=r(),s=u(t,"Enter Fullscreen"),i=u(t,"Exit Fullscreen");return l`
    <media-tooltip class="vds-fullscreen-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-fullscreen-button
          class="vds-fullscreen-button vds-button"
          aria-label=${u(t,"Fullscreen")}
        >
          ${$t(["fs-enter","fs-exit"])}
        </media-fullscreen-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-fs-enter-tooltip-text">${s}</span>
        <span class="vds-fs-exit-tooltip-text">${i}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function be({backward:e,tooltip:t}){let{translations:s,seekStep:i}=r(),n=e?"Seek Backward":"Seek Forward",o=u(s,n);return l`
    <media-tooltip class="vds-seek-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-seek-button
          class="vds-seek-button vds-button"
          seconds=${a(()=>(e?-1:1)*i())}
          aria-label=${o}
        >
          ${I(e?"seek-backward":"seek-forward")}
        </media-seek-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${t}>
        ${u(s,n)}
      </media-tooltip-content>
    </media-tooltip>
  `}function Qe(){let{translations:e}=r(),{live:t}=f(),s=u(e,"Skip To Live"),i=u(e,"LIVE");return t()?l`
        <media-live-button class="vds-live-button" aria-label=${s}>
          <span class="vds-live-button-text">${i}</span>
        </media-live-button>
      `:null}function te(){return a(()=>{let{download:e,translations:t}=r(),s=e();if(Ss(s))return null;let{source:i,title:n}=f(),o=i(),d=Cs({title:n(),src:o,download:s});return d?l`
          <media-tooltip class="vds-download-tooltip vds-tooltip">
            <media-tooltip-trigger>
              <a
                role="button"
                class="vds-download-button vds-button"
                aria-label=${u(t,"Download")}
                href=${d.url+`?download=${d.name}`}
                download=${d.name}
                target="_blank"
              >
                <slot name="download-icon" data-class="vds-icon" />
              </a>
            </media-tooltip-trigger>
            <media-tooltip-content class="vds-tooltip-content" placement="top">
              ${u(t,"Download")}
            </media-tooltip-content>
          </media-tooltip>
        `:null})}function ee(){let{translations:e}=r();return l`
    <media-captions
      class="vds-captions"
      .exampleText=${u(e,"Captions look like this")}
    ></media-captions>
  `}function L(){return l`<div class="vds-controls-spacer"></div>`}function Ve({placement:e,tooltip:t,portal:s}){let{textTracks:i}=C(),{viewType:n,clipStartTime:o,clipEndTime:d}=f(),{translations:p,thumbnails:c,menuPortal:w,noModal:m,menuGroup:h,smallWhen:y}=r();if(g(()=>{var de,ue;let vs=o(),hs=d()||1/0,re=A(null);return Me(i,"chapters",re.set),!((ue=(de=re())==null?void 0:de.cues.filter(ce=>ce.startTime<=hs&&ce.endTime>=vs))!=null&&ue.length)})())return null;let x=g(()=>m()?yt(e):y()?null:yt(e)),k=g(()=>!y()&&h()==="bottom"&&n()==="video"?26:0),W=A(!1);function Lt(){W.set(!0)}function ms(){W.set(!1)}let le=l`
    <media-menu-items
      class="vds-chapters-menu-items vds-menu-items"
      placement=${a(x)}
      offset=${a(k)}
    >
      ${a(()=>W()?l`
          <media-chapters-radio-group
            class="vds-chapters-radio-group vds-radio-group"
            .thumbnails=${a(c)}
          >
            <template>
              <media-radio class="vds-chapter-radio vds-radio">
                <media-thumbnail class="vds-thumbnail"></media-thumbnail>
                <div class="vds-chapter-radio-content">
                  <span class="vds-chapter-radio-label" data-part="label"></span>
                  <span class="vds-chapter-radio-start-time" data-part="start-time"></span>
                  <span class="vds-chapter-radio-duration" data-part="duration"></span>
                </div>
              </media-radio>
            </template>
          </media-chapters-radio-group>
        `:null)}
    </media-menu-items>
  `;return l`
    <media-menu class="vds-chapters-menu vds-menu" @open=${Lt} @close=${ms}>
      <media-tooltip class="vds-tooltip">
        <media-tooltip-trigger>
          <media-menu-button
            class="vds-menu-button vds-button"
            aria-label=${u(p,"Chapters")}
          >
            ${I("menu-chapters")}
          </media-menu-button>
        </media-tooltip-trigger>
        <media-tooltip-content
          class="vds-tooltip-content"
          placement=${Vt(t)?a(t):t}
        >
          ${u(p,"Chapters")}
        </media-tooltip-content>
      </media-tooltip>
      ${s?qe(w,le):le}
    </media-menu>
  `}function Rt(e){let{style:t}=new Option;return t.color=e,t.color.match(/\((.*?)\)/)[1].replace(/,/g," ")}var se={type:"color"},ti={type:"radio",values:{"Monospaced Serif":"mono-serif","Proportional Serif":"pro-serif","Monospaced Sans-Serif":"mono-sans","Proportional Sans-Serif":"pro-sans",Casual:"casual",Cursive:"cursive","Small Capitals":"capitals"}},ei={type:"slider",min:0,max:400,step:25,upIcon:null,downIcon:null},si={type:"slider",min:0,max:100,step:5,upIcon:null,downIcon:null},ii={type:"radio",values:["None","Drop Shadow","Raised","Depressed","Outline"]},At={fontFamily:"pro-sans",fontSize:"100%",textColor:"#ffffff",textOpacity:"100%",textShadow:"none",textBg:"#000000",textBgOpacity:"100%",displayBg:"#000000",displayBgOpacity:"0%"},U=Object.keys(At).reduce((e,t)=>({...e,[t]:A(At[t])}),{});for(let e of Object.keys(U)){let t=localStorage.getItem(`vds-player:${lt(e)}`);st(t)&&U[e].set(t)}function ni(){for(let e of Object.keys(U)){let t=At[e];U[e].set(t)}}var fe=!1,Wt=new Set;function ai(){let{player:e}=C();Wt.add(e),ot(()=>Wt.delete(e)),fe||(Is(()=>{for(let t of Ps(U)){let s=U[t],i=At[t],n=`--media-user-${lt(t)}`,o=`vds-player:${lt(t)}`;G(()=>{var w;let d=s(),p=d===i,c=p?null:oi(e,t,d);for(let m of Wt)(w=m.el)==null||w.style.setProperty(n,c);p?localStorage.removeItem(o):localStorage.setItem(o,d)})}},null),fe=!0)}function oi(e,t,s){var i;switch(t){case"fontFamily":let n=s==="capitals"?"small-caps":"";return(i=e.el)==null||i.style.setProperty("--media-user-font-variant",n),ri(s);case"fontSize":case"textOpacity":case"textBgOpacity":case"displayBgOpacity":return li(s);case"textColor":return`rgb(${Rt(s)} / var(--media-user-text-opacity, 1))`;case"textShadow":return di(s);case"textBg":return`rgb(${Rt(s)} / var(--media-user-text-bg-opacity, 1))`;case"displayBg":return`rgb(${Rt(s)} / var(--media-user-display-bg-opacity, 1))`}}function li(e){return(parseInt(e)/100).toString()}function ri(e){switch(e){case"mono-serif":return'"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace';case"mono-sans":return'"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace';case"pro-sans":return'Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif';case"casual":return'"Comic Sans MS", Impact, Handlee, fantasy';case"cursive":return'"Monotype Corsiva", "URW Chancery L", "Apple Chancery", "Dancing Script", cursive';case"capitals":return'"Arial Unicode Ms", Arial, Helvetica, Verdana, "Marcellus SC", sans-serif + font-variant=small-caps';default:return'"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif'}}function di(e){switch(e){case"drop shadow":return"rgb(34, 34, 34) 1.86389px 1.86389px 2.79583px, rgb(34, 34, 34) 1.86389px 1.86389px 3.72778px, rgb(34, 34, 34) 1.86389px 1.86389px 4.65972px";case"raised":return"rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px";case"depressed":return"rgb(204, 204, 204) 1px 1px, rgb(34, 34, 34) -1px -1px";case"outline":return"rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px";default:return""}}var ui=0;function P({label:e="",value:t="",children:s}){if(!e)return l`
      <div class="vds-menu-section">
        <div class="vds-menu-section-body">${s}</div>
      </div>
    `;let i=`vds-menu-section-${++ui}`;return l`
    <section class="vds-menu-section" role="group" aria-labelledby=${i}>
      <div class="vds-menu-section-title">
        <header id=${i}>${e}</header>
        ${t?l`<div class="vds-menu-section-value">${t}</div>`:null}
      </div>
      <div class="vds-menu-section-body">${s}</div>
    </section>
  `}function bt({label:e,children:t}){return l`
    <div class="vds-menu-item">
      <div class="vds-menu-item-label">${e}</div>
      ${t}
    </div>
  `}function z({label:e,icon:t,hint:s}){return l`
    <media-menu-button class="vds-menu-item">
      ${I("menu-arrow-left","vds-menu-close-icon")}
      ${t?I(t,"vds-menu-item-icon"):null}
      <span class="vds-menu-item-label">${a(e)}</span>
      <span class="vds-menu-item-hint" data-part="hint">${s?a(s):null} </span>
      ${I("menu-arrow-right","vds-menu-open-icon")}
    </media-menu-button>
  `}function ci({value:e=null,options:t,hideLabel:s=!1,children:i=null,onChange:n=null}){function o(d){let{value:p,label:c}=d;return l`
      <media-radio class="vds-radio" value=${p}>
        ${I("menu-radio-check")}
        ${s?null:l`
              <span class="vds-radio-label" data-part="label">
                ${st(c)?c:a(c)}
              </span>
            `}
        ${Vt(i)?i(d):i}
      </media-radio>
    `}return l`
    <media-radio-group
      class="vds-radio-group"
      value=${st(e)?e:e?a(e):""}
      @change=${n}
    >
      ${R(t)?t.map(o):a(()=>t().map(o))}
    </media-radio-group>
  `}function pi(e){return R(e)?e.map(t=>({label:t,value:t.toLowerCase()})):Object.keys(e).map(t=>({label:t,value:e[t]}))}function It(){return l`
    <div class="vds-slider-track"></div>
    <div class="vds-slider-track-fill vds-slider-track"></div>
    <div class="vds-slider-thumb"></div>
  `}function Pt(){return l`
    <media-slider-steps class="vds-slider-steps">
      <template>
        <div class="vds-slider-step"></div>
      </template>
    </media-slider-steps>
  `}function _t({label:e=null,value:t=null,upIcon:s="",downIcon:i="",children:n,isMin:o,isMax:d}){let p=e||t,c=[i?I(i,"down"):null,n,s?I(s,"up"):null];return l`
    <div
      class=${`vds-menu-item vds-menu-slider-item${p?" group":""}`}
      data-min=${a(()=>o()?"":null)}
      data-max=${a(()=>d()?"":null)}
    >
      ${p?l`
            <div class="vds-menu-slider-title">
              ${[e?l`<div>${e}</div>`:null,t?l`<div>${t}</div>`:null]}
            </div>
            <div class="vds-menu-slider-body">${c}</div>
          `:c}
    </div>
  `}var mi={...ei,upIcon:"menu-opacity-up",downIcon:"menu-opacity-down"},ie={...si,upIcon:"menu-opacity-up",downIcon:"menu-opacity-down"};function vi(){return a(()=>{let{hasCaptions:e}=f(),{translations:t}=r();return e()?l`
      <media-menu class="vds-font-menu vds-menu">
        ${z({label:()=>S(t,"Caption Styles")})}
        <media-menu-items class="vds-menu-items">
          ${[P({label:u(t,"Font"),children:[hi(),$i()]}),P({label:u(t,"Text"),children:[bi(),gi(),fi()]}),P({label:u(t,"Text Background"),children:[yi(),xi()]}),P({label:u(t,"Display Background"),children:[wi(),ki()]}),P({children:[Ai()]})]}
        </media-menu-items>
      </media-menu>
    `:null})}function hi(){return B({label:"Family",option:ti,type:"fontFamily"})}function $i(){return B({label:"Size",option:mi,type:"fontSize"})}function bi(){return B({label:"Color",option:se,type:"textColor"})}function fi(){return B({label:"Opacity",option:ie,type:"textOpacity"})}function gi(){return B({label:"Shadow",option:ii,type:"textShadow"})}function yi(){return B({label:"Color",option:se,type:"textBg"})}function xi(){return B({label:"Opacity",option:ie,type:"textBgOpacity"})}function wi(){return B({label:"Color",option:se,type:"displayBg"})}function ki(){return B({label:"Opacity",option:ie,type:"displayBgOpacity"})}function Ai(){let{translations:e}=r();return l`
    <button class="vds-menu-item" role="menuitem" @click=${ni}>
      <span class="vds-menu-item-label">${a(()=>S(e,"Reset"))}</span>
    </button>
  `}function B({label:e,option:t,type:s}){let{player:i}=C(),{translations:n}=r(),o=U[s],d=()=>S(n,e);function p(){Gs(),i.dispatchEvent(new Event("vds-font-change"))}if(t.type==="color"){let m=function(h){o.set(h.target.value),p()};return bt({label:a(d),children:l`
        <input
          class="vds-color-picker"
          type="color"
          .value=${a(o)}
          @input=${m}
        />
      `})}if(t.type==="slider"){let m=function(Lt){o.set(Lt.detail+"%"),p()},{min:h,max:y,step:x,upIcon:k,downIcon:W}=t;return _t({label:a(d),value:a(o),upIcon:k,downIcon:W,isMin:()=>o()===h+"%",isMax:()=>o()===y+"%",children:l`
        <media-slider
          class="vds-slider"
          min=${h}
          max=${y}
          step=${x}
          key-step=${x}
          .value=${a(()=>parseInt(o()))}
          aria-label=${a(d)}
          @value-change=${m}
          @drag-value-change=${m}
        >
          ${It()}${Pt()}
        </media-slider>
      `})}let c=pi(t.values),w=()=>{var y;let m=o(),h=((y=c.find(x=>x.value===m))==null?void 0:y.label)||"";return S(n,st(h)?h:h())};return l`
    <media-menu class=${`vds-${lt(s)}-menu vds-menu`}>
      ${z({label:d,hint:w})}
      <media-menu-items class="vds-menu-items">
        ${ci({value:o,options:c,onChange({detail:m}){o.set(m),p()}})}
      </media-menu-items>
    </media-menu>
  `}function Gt({label:e,checked:t,defaultChecked:s=!1,storageKey:i,onChange:n}){let{translations:o}=r(),d=i?localStorage.getItem(i):null,p=A(!!(d??s)),c=A(!1),w=a(Rs(p)),m=u(o,e);i&&n(Se(p)),t&&G(()=>void p.set(t()));function h(k){(k==null?void 0:k.button)!==1&&(p.set(W=>!W),i&&localStorage.setItem(i,p()?"1":""),n(p(),k),c.set(!1))}function y(k){_s(k)&&h()}function x(k){k.button===0&&c.set(!0)}return l`
    <div
      class="vds-menu-checkbox"
      role="menuitemcheckbox"
      tabindex="0"
      aria-label=${m}
      aria-checked=${w}
      data-active=${a(()=>c()?"":null)}
      @pointerup=${h}
      @pointerdown=${x}
      @keydown=${y}
    ></div>
  `}function Si(){return a(()=>{let{translations:e}=r();return l`
      <media-menu class="vds-accessibility-menu vds-menu">
        ${z({label:()=>S(e,"Accessibility"),icon:"menu-accessibility"})}
        <media-menu-items class="vds-menu-items">
          ${[P({children:[Ci(),Ti()]}),P({children:[vi()]})]}
        </media-menu-items>
      </media-menu>
    `})}function Ci(){let{userPrefersAnnouncements:e,translations:t}=r(),s="Announcements";return bt({label:u(t,s),children:Gt({label:s,storageKey:"vds-player::announcements",onChange(i){e.set(i)}})})}function Ti(){return a(()=>{let{translations:e,userPrefersKeyboardAnimations:t,noKeyboardAnimations:s}=r(),{viewType:i}=f();if(g(()=>i()!=="video"||s())())return null;let n="Keyboard Animations";return bt({label:u(e,n),children:Gt({label:n,defaultChecked:!0,storageKey:"vds-player::keyboard-animations",onChange(o){t.set(o)}})})})}function Mi(){return a(()=>{let{noAudioGain:e,translations:t}=r(),{audioTracks:s,canSetAudioGain:i}=f();return g(()=>!(i()&&!e())&&s().length<=1)()?null:l`
      <media-menu class="vds-audio-menu vds-menu">
        ${z({label:()=>S(t,"Audio"),icon:"menu-audio"})}
        <media-menu-items class="vds-menu-items">
          ${[Ii(),Pi()]}
        </media-menu-items>
      </media-menu>
    `})}function Ii(){return a(()=>{let{translations:e}=r(),{audioTracks:t}=f(),s=u(e,"Default");return g(()=>t().length<=1)()?null:P({children:l`
        <media-menu class="vds-audio-tracks-menu vds-menu">
          ${z({label:()=>S(e,"Track")})}
          <media-menu-items class="vds-menu-items">
            <media-audio-radio-group
              class="vds-audio-track-radio-group vds-radio-group"
              empty-label=${s}
            >
              <template>
                <media-radio class="vds-audio-track-radio vds-radio">
                  <slot name="menu-radio-check-icon" data-class="vds-icon"></slot>
                  <span class="vds-radio-label" data-part="label"></span>
                </media-radio>
              </template>
            </media-audio-radio-group>
          </media-menu-items>
        </media-menu>
      `})})}function Pi(){return a(()=>{let{noAudioGain:e,translations:t}=r(),{canSetAudioGain:s}=f();if(g(()=>!s()||e())())return null;let{audioGain:i}=f();return P({label:u(t,"Boost"),value:a(()=>Math.round(((i()??1)-1)*100)+"%"),children:[_t({upIcon:"menu-audio-boost-up",downIcon:"menu-audio-boost-down",children:_i(),isMin:()=>((i()??1)-1)*100<=je(),isMax:()=>((i()??1)-1)*100===Xe()})]})})}function _i(){let{translations:e}=r(),t=u(e,"Boost"),s=je,i=Xe,n=Gi;return l`
    <media-audio-gain-slider
      class="vds-audio-gain-slider vds-slider"
      aria-label=${t}
      min=${a(s)}
      max=${a(i)}
      step=${a(n)}
      key-step=${a(n)}
    >
      ${It()}${Pt()}
    </media-audio-gain-slider>
  `}function je(){let{audioGains:e}=r(),t=e();return R(t)?t[0]??0:t.min}function Xe(){let{audioGains:e}=r(),t=e();return R(t)?t[t.length-1]??300:t.max}function Gi(){let{audioGains:e}=r(),t=e();return R(t)?t[1]-t[0]||25:t.step}function Oi(){return a(()=>{let{translations:e}=r(),{hasCaptions:t}=f(),s=u(e,"Off");return t()?l`
      <media-menu class="vds-captions-menu vds-menu">
        ${z({label:()=>S(e,"Captions"),icon:"menu-captions"})}
        <media-menu-items class="vds-menu-items">
          <media-captions-radio-group
            class="vds-captions-radio-group vds-radio-group"
            off-label=${s}
          >
            <template>
              <media-radio class="vds-caption-radio vds-radio">
                <slot name="menu-radio-check-icon" data-class="vds-icon"></slot>
                <span class="vds-radio-label" data-part="label"></span>
              </media-radio>
            </template>
          </media-captions-radio-group>
        </media-menu-items>
      </media-menu>
    `:null})}function Li(){return a(()=>{let{translations:e}=r();return l`
      <media-menu class="vds-playback-menu vds-menu">
        ${z({label:()=>S(e,"Playback"),icon:"menu-playback"})}
        <media-menu-items class="vds-menu-items">
          ${[P({children:Bi()}),Ei(),Wi()]}
        </media-menu-items>
      </media-menu>
    `})}function Bi(){let{remote:e}=C(),{translations:t}=r(),s="Loop";return bt({label:u(t,s),children:Gt({label:s,storageKey:"vds-player::user-loop",onChange(i,n){e.userPrefersLoopChange(i,n)}})})}function Ei(){return a(()=>{let{translations:e}=r(),{canSetPlaybackRate:t,playbackRate:s}=f();return t()?P({label:u(e,"Speed"),value:a(()=>s()===1?S(e,"Normal"):s()+"x"),children:[_t({upIcon:"menu-speed-up",downIcon:"menu-speed-down",children:Di(),isMin:()=>s()===Ye(),isMax:()=>s()===Je()})]}):null})}function Ye(){let{playbackRates:e}=r(),t=e();return R(t)?t[0]??0:t.min}function Je(){let{playbackRates:e}=r(),t=e();return R(t)?t[t.length-1]??2:t.max}function Ni(){let{playbackRates:e}=r(),t=e();return R(t)?t[1]-t[0]||.25:t.step}function Di(){let{translations:e}=r(),t=u(e,"Speed"),s=Ye,i=Je,n=Ni;return l`
    <media-speed-slider
      class="vds-speed-slider vds-slider"
      aria-label=${t}
      min=${a(s)}
      max=${a(i)}
      step=${a(n)}
      key-step=${a(n)}
    >
      ${It()}${Pt()}
    </media-speed-slider>
  `}function Ri(){let{remote:e,qualities:t}=C(),{autoQuality:s,canSetQuality:i,qualities:n}=f(),{translations:o}=r(),d="Auto";return g(()=>!i()||n().length<=1)()?null:bt({label:u(o,d),children:Gt({label:d,checked:s,onChange(p,c){p?e.requestAutoQuality(c):e.changeQuality(t.selectedIndex,c)}})})}function Wi(){return a(()=>{let{hideQualityBitrate:e,translations:t}=r(),{canSetQuality:s,qualities:i,quality:n}=f(),o=g(()=>!s()||i().length<=1),d=g(()=>Ds(i()));return o()?null:P({label:u(t,"Quality"),value:a(()=>{var h,y;let p=(h=n())==null?void 0:h.height,c=e()?null:(y=n())==null?void 0:y.bitrate,w=c&&c>0?`${(c/1e6).toFixed(2)} Mbps`:null,m=S(t,"Auto");return p?`${p}p${w?` (${w})`:""}`:m}),children:[_t({upIcon:"menu-quality-up",downIcon:"menu-quality-down",children:Ki(),isMin:()=>d()[0]===n(),isMax:()=>d().at(-1)===n()}),Ri()]})})}function Ki(){let{translations:e}=r(),t=u(e,"Quality");return l`
    <media-quality-slider class="vds-quality-slider vds-slider" aria-label=${t}>
      ${It()}${Pt()}
    </media-quality-slider>
  `}function Ze({placement:e,portal:t,tooltip:s}){return a(()=>{let{viewType:i}=f(),{translations:n,menuPortal:o,noModal:d,menuGroup:p,smallWhen:c}=r(),w=g(()=>d()?yt(e):c()?null:yt(e)),m=g(()=>!c()&&p()==="bottom"&&i()==="video"?26:0),h=A(!1);ai();function y(){h.set(!0)}function x(){h.set(!1)}let k=l`
      <media-menu-items
        class="vds-settings-menu-items vds-menu-items"
        placement=${a(w)}
        offset=${a(m)}
      >
        ${a(()=>h()?[Li(),Si(),Mi(),Oi()]:null)}
      </media-menu-items>
    `;return l`
      <media-menu class="vds-settings-menu vds-menu" @open=${y} @close=${x}>
        <media-tooltip class="vds-tooltip">
          <media-tooltip-trigger>
            <media-menu-button
              class="vds-menu-button vds-button"
              aria-label=${u(n,"Settings")}
            >
              ${I("menu-settings","vds-rotate-icon")}
            </media-menu-button>
          </media-tooltip-trigger>
          <media-tooltip-content
            class="vds-tooltip-content"
            placement=${Vt(s)?a(s):s}
          >
            ${u(n,"Settings")}
          </media-tooltip-content>
        </media-tooltip>
        ${t?qe(o,k):k}
      </media-menu>
    `})}function ne({orientation:e,tooltip:t}){return a(()=>{let{pointer:s,muted:i,canSetVolume:n}=f();if(s()==="coarse"&&!i())return null;if(!n())return $e({tooltip:t});let o=A(void 0),d=Ts(o);return l`
      <div class="vds-volume" ?data-active=${a(d)} ${Tt(o.set)}>
        ${$e({tooltip:t})}
        <div class="vds-volume-popup">${qi({orientation:e})}</div>
      </div>
    `})}function qi({orientation:e}={}){let{translations:t}=r(),s=u(t,"Volume");return l`
    <media-volume-slider
      class="vds-volume-slider vds-slider"
      aria-label=${s}
      orientation=${Xt(e)}
    >
      <div class="vds-slider-track"></div>
      <div class="vds-slider-track-fill vds-slider-track"></div>
      <media-slider-preview class="vds-slider-preview" no-clamp>
        <media-slider-value class="vds-slider-value"></media-slider-value>
      </media-slider-preview>
      <div class="vds-slider-thumb"></div>
    </media-volume-slider>
  `}function ae(){let e=A(void 0),t=A(0),{thumbnails:s,translations:i,sliderChaptersMinWidth:n,disableTimeSlider:o,seekStep:d,noScrubGesture:p}=r(),c=u(i,"Seek"),w=a(o),m=a(()=>t()<n()),h=a(s);return Ie(e,()=>{let y=e();y&&t.set(y.clientWidth)}),l`
    <media-time-slider
      class="vds-time-slider vds-slider"
      aria-label=${c}
      key-step=${a(d)}
      ?disabled=${w}
      ?no-swipe-gesture=${a(p)}
      ${Tt(e.set)}
    >
      <media-slider-chapters class="vds-slider-chapters" ?disabled=${m}>
        <template>
          <div class="vds-slider-chapter">
            <div class="vds-slider-track"></div>
            <div class="vds-slider-track-fill vds-slider-track"></div>
            <div class="vds-slider-progress vds-slider-track"></div>
          </div>
        </template>
      </media-slider-chapters>
      <div class="vds-slider-thumb"></div>
      <media-slider-preview class="vds-slider-preview">
        <media-slider-thumbnail
          class="vds-slider-thumbnail vds-thumbnail"
          .src=${h}
        ></media-slider-thumbnail>
        <div class="vds-slider-chapter-title" data-part="chapter-title"></div>
        <media-slider-value class="vds-slider-value"></media-slider-value>
      </media-slider-preview>
    </media-time-slider>
  `}function Fi(){return l`
    <div class="vds-time-group">
      ${a(()=>{let{duration:e}=f();return e()?[l`<media-time class="vds-time" type="current"></media-time>`,l`<div class="vds-time-divider">/</div>`,l`<media-time class="vds-time" type="duration"></media-time>`]:null})}
    </div>
  `}function Ui(){return a(()=>{let{live:e,duration:t}=f();return e()?Qe():t()?l`<media-time class="vds-time" type="current" toggle remainder></media-time>`:null})}function ts(){return a(()=>{let{live:e}=f();return e()?Qe():Fi()})}function es(){return a(()=>{let{textTracks:e}=C(),{title:t,started:s}=f(),i=A(null);return Me(e,"chapters",i.set),i()&&(s()||!t())?ss():l`<media-title class="vds-chapter-title"></media-title>`})}function ss(){return l`<media-chapter-title class="vds-chapter-title"></media-chapter-title>`}var N,Hi=(N=class extends kt{},N.props={...Et(N,N,"props"),when:({viewType:t})=>t==="audio",smallWhen:({width:t})=>t<576},N);function zi(){return[Yt(),ee(),l`
      <media-controls class="vds-controls">
        <media-controls-group class="vds-controls-group">
          ${[be({backward:!0,tooltip:"top start"}),Mt({tooltip:"top"}),be({tooltip:"top"}),Qi(),ae(),Ui(),ne({orientation:"vertical",tooltip:"top"}),Zt({tooltip:"top"}),te(),Jt({tooltip:"top"}),Vi()]}
        </media-controls-group>
      </media-controls>
    `]}function Qi(){return a(()=>{let e=A(void 0),t=A(!1),s=C(),{title:i,started:n,currentTime:o,ended:d}=f(),{translations:p}=r(),c=Ls(e),w=()=>n()||o()>0,m=()=>{let x=d()?"Replay":w()?"Continue":"Play";return`${S(p,x)}: ${i()}`};G(()=>{var x;c()&&document.activeElement===document.body&&((x=s.player.el)==null||x.focus({preventScroll:!0}))});function h(){let x=e(),k=!!x&&!c()&&x.clientWidth<x.children[0].clientWidth;x&&Bs(x,"vds-marquee",k),t.set(k)}function y(){return l`
        <span class="vds-title-text">
          ${a(m)}${a(()=>w()?ss():null)}
        </span>
      `}return Ie(e,h),i()?l`
          <span class="vds-title" title=${a(m)} ${Tt(e.set)}>
            ${[y(),a(()=>t()&&!c()?y():null)]}
          </span>
        `:L()})}function Vi(){let e="top end";return[Ve({tooltip:"top",placement:e,portal:!0}),Ze({tooltip:"top end",placement:e,portal:!0})]}var ht,tt,M,is,ns,as,os,ls,rs,K,ji=(K=class extends Pe(Ge,Hi){constructor(){super(...arguments);b(this,M);b(this,ht);b(this,tt,A(!1))}onSetup(){this.forwardKeepAlive=!1,T(this,ht,C()),this.classList.add("vds-audio-layout"),$(this,M,as).call(this)}onConnect(){Ke("audio",()=>this.isMatch),$(this,M,ns).call(this)}render(){return a($(this,M,is).bind(this))}},ht=new WeakMap,tt=new WeakMap,M=new WeakSet,is=function(){return this.isMatch?zi():null},ns=function(){let{menuPortal:s}=r();G(()=>{if(!this.isMatch)return;let i=Fe(this,this.menuContainer,"vds-audio-layout",()=>this.isSmallLayout),n=i?[this,i]:[this];return(this.$props.customIcons()?new De(n):new Ue(n)).connect(),s.set(i),()=>{i.remove(),s.set(null)}})},as=function(){let{pointer:s}=v(this,ht).$state;G(()=>{s()==="coarse"&&G($(this,M,os).bind(this))})},os=function(){if(!v(this,tt).call(this)){Nt(this,"pointerdown",$(this,M,ls).bind(this),{capture:!0});return}Nt(this,"pointerdown",s=>s.stopPropagation()),Nt(window,"pointerdown",$(this,M,rs).bind(this))},ls=function(s){let{target:i}=s;Os(i)&&i.closest(".vds-time-slider")&&(s.stopImmediatePropagation(),this.setAttribute("data-scrubbing",""),v(this,tt).set(!0))},rs=function(){v(this,tt).set(!1),this.removeAttribute("data-scrubbing")},K.tagName="media-audio-layout",K.attrs={smallWhen:{converter(s){return s!=="never"&&!!s}}},K);/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xi=Ct(class extends jt{constructor(){super(...arguments),this.key=F}render(e,t){return this.key=e,t}update(e,[t,s]){return t!==this.key&&(qs(e),this.key=t),s}});var D,Yi=(D=class extends kt{},D.props={...Et(D,D,"props"),when:({viewType:t})=>t==="video",smallWhen:({width:t,height:s})=>t<576||s<380},D);function ds(){return a(()=>{let e=C(),{noKeyboardAnimations:t,userPrefersKeyboardAnimations:s}=r();if(g(()=>t()||!s())())return null;let i=A(!1),{lastKeyboardAction:n}=e.$state;G(()=>{i.set(!!n());let m=setTimeout(()=>i.set(!1),500);return()=>{i.set(!1),window.clearTimeout(m)}});let o=g(()=>{var h;let m=(h=n())==null?void 0:h.action;return m&&i()?lt(m):null}),d=g(()=>`vds-kb-action${i()?"":" hidden"}`),p=g(Ji),c=g(()=>{let m=Zi();return m?Es(m):null});function w(){let m=c();return m?l`
        <div class="vds-kb-bezel">
          <div class="vds-kb-icon">${m}</div>
        </div>
      `:null}return l`
      <div class=${a(d)} data-action=${a(o)}>
        <div class="vds-kb-text-wrapper">
          <div class="vds-kb-text">${a(p)}</div>
        </div>
        ${a(()=>Xi(n(),w()))}
      </div>
    `})}function Ji(){var i;let{$state:e}=C(),t=(i=e.lastKeyboardAction())==null?void 0:i.action,s=e.audioGain()??1;switch(t){case"toggleMuted":return e.muted()?"0%":ge(e.volume(),s);case"volumeUp":case"volumeDown":return ge(e.volume(),s);default:return""}}function ge(e,t){return`${Math.round(e*t*100)}%`}function Zi(){var t;let{$state:e}=C();switch((t=e.lastKeyboardAction())==null?void 0:t.action){case"togglePaused":return e.paused()?"kb-pause-icon":"kb-play-icon";case"toggleMuted":return e.muted()||e.volume()===0?"kb-mute-icon":e.volume()>=.5?"kb-volume-up-icon":"kb-volume-down-icon";case"toggleFullscreen":return`kb-fs-${e.fullscreen()?"enter":"exit"}-icon`;case"togglePictureInPicture":return`kb-pip-${e.pictureInPicture()?"enter":"exit"}-icon`;case"toggleCaptions":return e.hasCaptions()?`kb-cc-${e.textTrack()?"on":"off"}-icon`:null;case"volumeUp":return"kb-volume-up-icon";case"volumeDown":return"kb-volume-down-icon";case"seekForward":return"kb-seek-forward-icon";case"seekBackward":return"kb-seek-backward-icon";default:return null}}function tn(){return[Yt(),us(),Ot(),ds(),ee(),l`<div class="vds-scrim"></div>`,l`
      <media-controls class="vds-controls">
        ${[sn(),L(),l`<media-controls-group class="vds-controls-group"></media-controls-group>`,L(),l`
            <media-controls-group class="vds-controls-group">
              ${ae()}
            </media-controls-group>
          `,l`
            <media-controls-group class="vds-controls-group">
              ${[Mt({tooltip:"top start"}),ne({orientation:"horizontal",tooltip:"top"}),ts(),es(),Zt({tooltip:"top"}),en(),Jt({tooltip:"top"}),He({tooltip:"top"}),te(),Zs(),ze({tooltip:"top end"})]}
            </media-controls-group>
          `]}
      </media-controls>
    `]}function en(){return a(()=>{let{menuGroup:e}=r();return e()==="bottom"?oe():null})}function sn(){return l`
    <media-controls-group class="vds-controls-group">
      ${a(()=>{let{menuGroup:e}=r();return e()==="top"?[L(),oe()]:null})}
    </media-controls-group>
  `}function nn(){return[Yt(),us(),Ot(),ee(),ds(),l`<div class="vds-scrim"></div>`,l`
      <media-controls class="vds-controls">
        <media-controls-group class="vds-controls-group">
          ${[Jt({tooltip:"top start"}),He({tooltip:"bottom start"}),L(),Zt({tooltip:"bottom"}),te(),oe(),ne({orientation:"vertical",tooltip:"bottom end"})]}
        </media-controls-group>

        ${L()}

        <media-controls-group class="vds-controls-group" style="pointer-events: none;">
          ${[L(),Mt({tooltip:"top"}),L()]}
        </media-controls-group>

        ${L()}

        <media-controls-group class="vds-controls-group">
          ${[ts(),es(),ze({tooltip:"top end"})]}
        </media-controls-group>

        <media-controls-group class="vds-controls-group">
          ${ae()}
        </media-controls-group>
      </media-controls>
    `,on()]}function an(){return l`
    <div class="vds-load-container">
      ${[Ot(),Mt({tooltip:"top"})]}
    </div>
  `}function on(){return a(()=>{let{duration:e}=f();return e()===0?null:l`
      <div class="vds-start-duration">
        <media-time class="vds-time" type="duration"></media-time>
      </div>
    `})}function Ot(){return l`
    <div class="vds-buffering-indicator">
      <media-spinner class="vds-buffering-spinner"></media-spinner>
    </div>
  `}function oe(){let{menuGroup:e,smallWhen:t}=r(),s=()=>e()==="top"||t()?"bottom":"top",i=g(()=>`${s()} ${e()==="top"?"end":"center"}`),n=g(()=>`${s()} end`);return[Ve({tooltip:i,placement:n,portal:!0}),Ze({tooltip:i,placement:n,portal:!0})]}function us(){return a(()=>{let{noGestures:e}=r();return e()?null:l`
      <div class="vds-gestures">
        <media-gesture class="vds-gesture" event="pointerup" action="toggle:paused"></media-gesture>
        <media-gesture
          class="vds-gesture"
          event="pointerup"
          action="toggle:controls"
        ></media-gesture>
        <media-gesture
          class="vds-gesture"
          event="dblpointerup"
          action="toggle:fullscreen"
        ></media-gesture>
        <media-gesture class="vds-gesture" event="dblpointerup" action="seek:-10"></media-gesture>
        <media-gesture class="vds-gesture" event="dblpointerup" action="seek:10"></media-gesture>
      </div>
    `})}var et,it,cs,ps,q,ln=(q=class extends Pe(Ge,Yi){constructor(){super(...arguments);b(this,it);b(this,et)}onSetup(){this.forwardKeepAlive=!1,T(this,et,C()),this.classList.add("vds-video-layout")}onConnect(){Ke("video",()=>this.isMatch),$(this,it,cs).call(this)}render(){return a($(this,it,ps).bind(this))}},et=new WeakMap,it=new WeakSet,cs=function(){let{menuPortal:s}=r();G(()=>{if(!this.isMatch)return;let i=Fe(this,this.menuContainer,"vds-video-layout",()=>this.isSmallLayout),n=i?[this,i]:[this];return(this.$props.customIcons()?new De(n):new Ue(n)).connect(),s.set(i),()=>{i.remove(),s.set(null)}})},ps=function(){let{load:s}=v(this,et).$props,{canLoad:i,streamType:n,nativeControls:o}=v(this,et).$state;return!o()&&this.isMatch?s()==="play"&&!i()?an():n()==="unknown"?Ot():this.isSmallLayout?nn():tn():null},q.tagName="media-video-layout",q.attrs={smallWhen:{converter(s){return s!=="never"&&!!s}}},q);_e(ji);_e(ln);
