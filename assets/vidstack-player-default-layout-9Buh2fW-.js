const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vidstack-CmqqnRgc-Bpdev3iS.js","assets/app-g0grUdIl.js"])))=>i.map(i=>d[i]);
var we=Object.getPrototypeOf;var ke=Reflect.get;var lt=(e,t,s)=>ke(we(e),s,t);import{S as b,T as Vt,U as E,V as Et,W as C,X as Ce,Y as G,Z as S,_ as Ae,$ as De,a0 as Me,a1 as x,a2 as Wt,a3 as Oe,a4 as F,a5 as W,a6 as Ie,a7 as Ht,a8 as h,a9 as Kt,aa as Pe,ab as _e,ac as Qt,ad as U,ae as $t,af as Ge,ag as Ut,ah as Ne,ai as Be,aj as Le,ak as Fe,al as O,am as Re,an as Ve,ao as zt,ap as rt,aq as Ee,ar as We,as as He,at as Ke,au as jt}from"./app-g0grUdIl.js";import{A as I,T as Qe,D as Nt,x as l,s as Ue,$ as ze,L as qt}from"./vidstack-D2YigfqZ-BLArkuQb.js";/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bt=e=>e??I;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const z={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},X=e=>(...t)=>({_$litDirective$:e,values:t});let gt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,n){this._$Ct=t,this._$AM=s,this._$Ci=n}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let pt=class extends gt{constructor(t){if(super(t),this.et=I,t.type!==z.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===I||t==null)return this.ft=void 0,this.et=t;if(t===Qe)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.et)return this.ft;this.et=t;const s=[t];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}};pt.directiveName="unsafeHTML",pt.resultType=1;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class mt extends pt{}mt.directiveName="unsafeSVG",mt.resultType=2;const je=X(mt);/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qe=e=>e.strings===void 0,Ze={},Ye=(e,t=Ze)=>e._$AH=t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const R=(e,t)=>{var s,n;const i=e._$AN;if(i===void 0)return!1;for(const o of i)(n=(s=o)._$AO)===null||n===void 0||n.call(s,t,!1),R(o,t);return!0},j=e=>{let t,s;do{if((t=e._$AM)===void 0)break;s=t._$AN,s.delete(e),e=t}while((s==null?void 0:s.size)===0)},Zt=e=>{for(let t;t=e._$AM;e=t){let s=t._$AN;if(s===void 0)t._$AN=s=new Set;else if(s.has(e))break;s.add(e),ts(t)}};function Xe(e){this._$AN!==void 0?(j(this),this._$AM=e,Zt(this)):this._$AM=e}function Je(e,t=!1,s=0){const n=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0)if(t)if(Array.isArray(n))for(let o=s;o<n.length;o++)R(n[o],!1),j(n[o]);else n!=null&&(R(n,!1),j(n));else R(this,e)}const ts=e=>{var t,s,n,i;e.type==z.CHILD&&((t=(n=e)._$AP)!==null&&t!==void 0||(n._$AP=Je),(s=(i=e)._$AQ)!==null&&s!==void 0||(i._$AQ=Xe))};class Yt extends gt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,s,n){super._$AT(t,s,n),Zt(this),this.isConnected=t._$AU}_$AO(t,s=!0){var n,i;t!==this.isConnected&&(this.isConnected=t,t?(n=this.reconnected)===null||n===void 0||n.call(this):(i=this.disconnected)===null||i===void 0||i.call(this)),s&&(R(this,t),j(this))}setValue(t){if(qe(this._$Ct))this._$Ct._$AI(t,this);else{const s=[...this._$Ct._$AH];s[this._$Ci]=t,this._$Ct._$AI(s,this,0)}}disconnected(){}reconnected(){}}class es extends Yt{constructor(t){super(t),this.h=null,this.w=!1,this.$=null,this.w=t.type===z.ATTRIBUTE||t.type===z.BOOLEAN_ATTRIBUTE}render(t){return t!==this.h&&(this.disconnected(),this.h=t,this.isConnected&&this.Gl()),this.h?this.x(Et(this.h)):I}reconnected(){this.Gl()}disconnected(){var t;(t=this.$)==null||t.call(this),this.$=null}Gl(){this.h&&(this.$=C(this.l.bind(this)))}x(t){return this.w?bt(t):t}y(t){this.setValue(this.x(t))}l(){var t;this.y((t=this.h)==null?void 0:t.call(this))}}function a(e){return X(es)(b(e))}class Xt{constructor(t,s){this._m=t,this.La=s,this.elements=new Set,this.Gc=Vt(this.Ha.bind(this))}connect(){this.Ha();const t=new MutationObserver(this.Gc);for(const s of this._m)t.observe(s,{childList:!0,subtree:!0});E(()=>t.disconnect()),E(this.disconnect.bind(this))}disconnect(){this.elements.clear()}assign(t,s){Ce(t)?(s.textContent="",s.append(t)):(Nt(null,s),Nt(t,s)),s.style.display||(s.style.display="contents");const n=s.firstElementChild;if(!n)return;const i=s.getAttribute("data-class");i&&n.classList.add(...i.split(" "))}Ha(t){if(t&&!t.some(i=>i.addedNodes.length))return;let s=!1,n=this._m.flatMap(i=>[...i.querySelectorAll("slot")]);for(const i of n)!i.hasAttribute("name")||this.elements.has(i)||(this.elements.add(i),s=!0);s&&this.La(this.elements)}}let ss=0,Q="data-slot-id";class Jt{constructor(t){this._m=t,this.Gc=Vt(this.Ha.bind(this)),this.slots=new Xt(t,this.Ha.bind(this))}connect(){this.slots.connect(),this.Ha();const t=new MutationObserver(this.Gc);for(const s of this._m)t.observe(s,{childList:!0});E(()=>t.disconnect())}Ha(){for(const t of this._m)for(const s of t.children){if(s.nodeType!==1)continue;const n=s.getAttribute("slot");if(!n)continue;s.style.display="none";let i=s.getAttribute(Q);i||s.setAttribute(Q,i=++ss+"");for(const o of this.slots.elements){if(o.getAttribute("name")!==n||o.getAttribute(Q)===i)continue;const r=document.importNode(s,!0);n.includes("-icon")&&r.classList.add("vds-icon"),r.style.display="",r.removeAttribute("slot"),this.slots.assign(r,o),o.setAttribute(Q,i)}}}}function ns({name:e,class:t,state:s,paths:n,viewBox:i="0 0 32 32"}){return l`<svg
    class="${"vds-icon"+(t?` ${t}`:"")}"
    viewBox="${i}"
    fill="none"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    data-icon=${bt(e??s)}
  >
    ${G(n)?je(n):a(n)}
  </svg>`}class is{constructor(t){this._m=t,this.dn={},this.gn=!1,this.slots=new Xt(t,this.hn.bind(this))}connect(){this.slots.connect()}load(){this.Pf().then(t=>{this.dn=t,this.gn=!0,this.hn()})}*jn(){for(const t of Object.keys(this.dn)){const s=`${t}-icon`;for(const n of this.slots.elements)n.name===s&&(yield{icon:this.dn[t],slot:n})}}hn(){if(this.gn)for(const{icon:t,slot:s}of this.jn())this.slots.assign(t,s)}}class as extends is{connect(){super.connect();const{player:t}=S();if(!t.el)return;let s,n=new IntersectionObserver(i=>{var o;(o=i[0])!=null&&o.isIntersecting&&(s==null||s(),s=void 0,this.load())});n.observe(t.el),s=E(()=>n.disconnect())}}const dt=new WeakMap,J=X(class extends Yt{render(e){return I}update(e,[t]){var s;const n=t!==this.G;return n&&this.G!==void 0&&this.ot(void 0),(n||this.rt!==this.lt)&&(this.G=t,this.dt=(s=e.options)===null||s===void 0?void 0:s.host,this.ot(this.lt=e.element)),I}ot(e){var t;if(typeof this.G=="function"){const s=(t=this.dt)!==null&&t!==void 0?t:globalThis;let n=dt.get(s);n===void 0&&(n=new WeakMap,dt.set(s,n)),n.get(this.G)!==void 0&&this.G.call(this.dt,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.dt,e)}else this.G.value=e}get rt(){var e,t,s;return typeof this.G=="function"?(t=dt.get((e=this.dt)!==null&&e!==void 0?e:globalThis))===null||t===void 0?void 0:t.get(this.G):(s=this.G)===null||s===void 0?void 0:s.value}disconnected(){this.rt===this.lt&&this.ot(void 0)}reconnected(){this.ot(this.lt)}}),te=Ie();function d(){return Ae(te)}const os={colorScheme:"system",download:null,customIcons:!1,disableTimeSlider:!1,menuContainer:null,menuGroup:"bottom",noAudioGain:!1,noGestures:!1,noKeyboardAnimations:!1,noModal:!1,noScrubGesture:!1,playbackRates:{min:0,max:2,step:.25},audioGains:{min:0,max:300,step:25},seekStep:10,sliderChaptersMinWidth:325,hideQualityBitrate:!1,smallWhen:!1,thumbnails:null,translations:null,when:!1};var ls=Object.defineProperty,rs=Object.getOwnPropertyDescriptor,ee=(e,t,s,n)=>{for(var i=rs(t,s),o=e.length-1,r;o>=0;o--)(r=e[o])&&(i=r(t,s,i)||i);return i&&ls(t,s,i),i};const Ot=class Ot extends De{constructor(){super(...arguments),this.cn=b(()=>{const t=this.$props.when();return this.fn(t)}),this.$m=b(()=>{const t=this.$props.smallWhen();return this.fn(t)})}get isMatch(){return this.cn()}get isSmallLayout(){return this.$m()}onSetup(){this.a=S(),this.setAttributes({"data-match":this.cn,"data-sm":()=>this.$m()?"":null,"data-lg":()=>this.$m()?null:"","data-size":()=>this.$m()?"sm":"lg","data-no-scrub-gesture":this.$props.noScrubGesture}),Me(te,{...this.$props,when:this.cn,smallWhen:this.$m,userPrefersAnnouncements:x(!0),userPrefersKeyboardAnimations:x(!0),menuPortal:x(null)})}onAttach(t){Wt(t,this.$props.colorScheme)}fn(t){return t!=="never"&&(Oe(t)?t:b(()=>t(this.a.player.state))())}};Ot.props=os;let N=Ot;ee([Ht],N.prototype,"isMatch");ee([Ht],N.prototype,"isSmallLayout");function se(e,t){C(()=>{const{player:s}=S(),n=s.el;return n&&F(n,"data-layout",t()&&e),()=>n==null?void 0:n.removeAttribute("data-layout")})}function T(e,t){var s;return((s=e())==null?void 0:s[t])??t}function yt(){return a(()=>{const{translations:e,userPrefersAnnouncements:t}=d();return t()?l`<media-announcer .translations=${a(e)}></media-announcer>`:null})}function w(e,t=""){return l`<slot
    name=${`${e}-icon`}
    data-class=${`vds-icon vds-${e}-icon${t?` ${t}`:""}`}
  ></slot>`}function H(e){return e.map(t=>w(t))}function u(e,t){return a(()=>T(e,t))}function xt({tooltip:e}){const{translations:t}=d(),{remotePlaybackState:s}=h(),n=a(()=>{const o=T(t,"AirPlay"),r=Kt(s());return`${o} ${r}`}),i=u(t,"AirPlay");return l`
    <media-tooltip class="vds-airplay-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-airplay-button class="vds-airplay-button vds-button" aria-label=${n}>
          ${w("airplay")}
        </media-airplay-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-airplay-tooltip-text">${i}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function ne({tooltip:e}){const{translations:t}=d(),{remotePlaybackState:s}=h(),n=a(()=>{const o=T(t,"Google Cast"),r=Kt(s());return`${o} ${r}`}),i=u(t,"Google Cast");return l`
    <media-tooltip class="vds-google-cast-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-google-cast-button class="vds-google-cast-button vds-button" aria-label=${n}>
          ${w("google-cast")}
        </media-google-cast-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-google-cast-tooltip-text">${i}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function tt({tooltip:e}){const{translations:t}=d(),s=u(t,"Play"),n=u(t,"Pause");return l`
    <media-tooltip class="vds-play-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-play-button
          class="vds-play-button vds-button"
          aria-label=${u(t,"Play")}
        >
          ${H(["play","pause","replay"])}
        </media-play-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-play-tooltip-text">${s}</span>
        <span class="vds-pause-tooltip-text">${n}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Bt({tooltip:e,ref:t=Be}){const{translations:s}=d(),n=u(s,"Mute"),i=u(s,"Unmute");return l`
    <media-tooltip class="vds-mute-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-mute-button
          class="vds-mute-button vds-button"
          aria-label=${u(s,"Mute")}
          ${J(t)}
        >
          ${H(["mute","volume-low","volume-high"])}
        </media-mute-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-mute-tooltip-text">${i}</span>
        <span class="vds-unmute-tooltip-text">${n}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Tt({tooltip:e}){const{translations:t}=d(),s=u(t,"Closed-Captions On"),n=u(t,"Closed-Captions Off");return l`
    <media-tooltip class="vds-caption-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-caption-button
          class="vds-caption-button vds-button"
          aria-label=${u(t,"Captions")}
        >
          ${H(["cc-on","cc-off"])}
        </media-caption-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-cc-on-tooltip-text">${n}</span>
        <span class="vds-cc-off-tooltip-text">${s}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function ds(){const{translations:e}=d(),t=u(e,"Enter PiP"),s=u(e,"Exit PiP");return l`
    <media-tooltip class="vds-pip-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-pip-button
          class="vds-pip-button vds-button"
          aria-label=${u(e,"PiP")}
        >
          ${H(["pip-enter","pip-exit"])}
        </media-pip-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content">
        <span class="vds-pip-enter-tooltip-text">${t}</span>
        <span class="vds-pip-exit-tooltip-text">${s}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function ie({tooltip:e}){const{translations:t}=d(),s=u(t,"Enter Fullscreen"),n=u(t,"Exit Fullscreen");return l`
    <media-tooltip class="vds-fullscreen-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-fullscreen-button
          class="vds-fullscreen-button vds-button"
          aria-label=${u(t,"Fullscreen")}
        >
          ${H(["fs-enter","fs-exit"])}
        </media-fullscreen-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${e}>
        <span class="vds-fs-enter-tooltip-text">${s}</span>
        <span class="vds-fs-exit-tooltip-text">${n}</span>
      </media-tooltip-content>
    </media-tooltip>
  `}function Lt({backward:e,tooltip:t}){const{translations:s,seekStep:n}=d(),i=e?"Seek Backward":"Seek Forward",o=u(s,i);return l`
    <media-tooltip class="vds-seek-tooltip vds-tooltip">
      <media-tooltip-trigger>
        <media-seek-button
          class="vds-seek-button vds-button"
          seconds=${a(()=>(e?-1:1)*n())}
          aria-label=${o}
        >
          ${w(e?"seek-backward":"seek-forward")}
        </media-seek-button>
      </media-tooltip-trigger>
      <media-tooltip-content class="vds-tooltip-content" placement=${t}>
        ${u(s,i)}
      </media-tooltip-content>
    </media-tooltip>
  `}function ae(){const{translations:e}=d(),{live:t}=h(),s=u(e,"Skip To Live"),n=u(e,"LIVE");return t()?l`
        <media-live-button class="vds-live-button" aria-label=${s}>
          <span class="vds-live-button-text">${n}</span>
        </media-live-button>
      `:null}function St(){return a(()=>{const{download:e,translations:t}=d(),s=e();if(Pe(s))return null;const{source:n,title:i}=h(),o=n(),r=_e({title:i(),src:o,download:s});return r?l`
          <media-tooltip class="vds-download-tooltip vds-tooltip">
            <media-tooltip-trigger>
              <a
                role="button"
                class="vds-download-button vds-button"
                aria-label=${u(t,"Download")}
                href=${r.url+`?download=${r.name}`}
                download=${r.name}
                target="_blank"
              >
                <slot name="download-icon" data-class="vds-icon" />
              </a>
            </media-tooltip-trigger>
            <media-tooltip-content class="vds-tooltip-content" placement="top">
              ${u(t,"Download")}
            </media-tooltip-content>
          </media-tooltip>
        `:null})}function wt(){const{translations:e}=d();return l`
    <media-captions
      class="vds-captions"
      .exampleText=${u(e,"Captions look like this")}
    ></media-captions>
  `}function A(){return l`<div class="vds-controls-spacer"></div>`}function oe(e,t){return l`
    <media-menu-portal .container=${a(e)} disabled="fullscreen">
      ${t}
    </media-menu-portal>
  `}function le(e,t,s,n){let i=G(t)?document.querySelector(t):t;i||(i=e==null?void 0:e.closest("dialog")),i||(i=document.body);const o=document.createElement("div");o.style.display="contents",o.classList.add(s),i.append(o),C(()=>{if(!o)return;const{viewType:p}=h(),c=n();F(o,"data-view-type",p()),F(o,"data-sm",c),F(o,"data-lg",!c),F(o,"data-size",c?"sm":"lg")});const{colorScheme:r}=d();return Wt(o,r),o}function re({placement:e,tooltip:t,portal:s}){const{textTracks:n}=S(),{viewType:i,clipStartTime:o,clipEndTime:r}=h(),{translations:p,thumbnails:c,menuPortal:$,noModal:v,menuGroup:m,smallWhen:f}=d();if(b(()=>{var _t;const Te=o(),Se=r()||1/0,Pt=x(null);Qt(n,"chapters",Pt.set);const ot=(_t=Pt())==null?void 0:_t.cues.filter(Gt=>Gt.startTime<=Se&&Gt.endTime>=Te);return!(ot!=null&&ot.length)})())return null;const y=b(()=>v()?U(e):f()?null:U(e)),B=b(()=>!f()&&m()==="bottom"&&i()==="video"?26:0),L=x(!1);function ye(){L.set(!0)}function xe(){L.set(!1)}const It=l`
    <media-menu-items
      class="vds-chapters-menu-items vds-menu-items"
      placement=${a(y)}
      offset=${a(B)}
    >
      ${a(()=>L()?l`
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
    <media-menu class="vds-chapters-menu vds-menu" @open=${ye} @close=${xe}>
      <media-tooltip class="vds-tooltip">
        <media-tooltip-trigger>
          <media-menu-button
            class="vds-menu-button vds-button"
            aria-label=${u(p,"Chapters")}
          >
            ${w("menu-chapters")}
          </media-menu-button>
        </media-tooltip-trigger>
        <media-tooltip-content
          class="vds-tooltip-content"
          placement=${$t(t)?a(t):t}
        >
          ${u(p,"Chapters")}
        </media-tooltip-content>
      </media-tooltip>
      ${s?oe($,It):It}
    </media-menu>
  `}function ut(e){const{style:t}=new Option;return t.color=e,t.color.match(/\((.*?)\)/)[1].replace(/,/g," ")}const kt={type:"color"},us={type:"radio",values:{"Monospaced Serif":"mono-serif","Proportional Serif":"pro-serif","Monospaced Sans-Serif":"mono-sans","Proportional Sans-Serif":"pro-sans",Casual:"casual",Cursive:"cursive","Small Capitals":"capitals"}},cs={type:"slider",min:0,max:400,step:25,upIcon:null,downIcon:null},ps={type:"slider",min:0,max:100,step:5,upIcon:null,downIcon:null},ms={type:"radio",values:["None","Drop Shadow","Raised","Depressed","Outline"]},q={fontFamily:"pro-sans",fontSize:"100%",textColor:"#ffffff",textOpacity:"100%",textShadow:"none",textBg:"#000000",textBgOpacity:"100%",displayBg:"#000000",displayBgOpacity:"0%"},P=Object.keys(q).reduce((e,t)=>({...e,[t]:x(q[t])}),{});for(const e of Object.keys(P)){const t=localStorage.getItem(`vds-player:${W(e)}`);G(t)&&P[e].set(t)}function vs(){for(const e of Object.keys(P)){const t=q[e];P[e].set(t)}}let Ft=!1,ct=new Set;function fs(){const{player:e}=S();ct.add(e),E(()=>ct.delete(e)),Ft||(Le(()=>{for(const t of Fe(P)){const s=P[t],n=q[t],i=`--media-user-${W(t)}`,o=`vds-player:${W(t)}`;C(()=>{var $;const r=s(),p=r===n,c=p?null:hs(e,t,r);for(const v of ct)($=v.el)==null||$.style.setProperty(i,c);p?localStorage.removeItem(o):localStorage.setItem(o,r)})}},null),Ft=!0)}function hs(e,t,s){var n;switch(t){case"fontFamily":const i=s==="capitals"?"small-caps":"";return(n=e.el)==null||n.style.setProperty("--media-user-font-variant",i),bs(s);case"fontSize":case"textOpacity":case"textBgOpacity":case"displayBgOpacity":return $s(s);case"textColor":return`rgb(${ut(s)} / var(--media-user-text-opacity, 1))`;case"textShadow":return gs(s);case"textBg":return`rgb(${ut(s)} / var(--media-user-text-bg-opacity, 1))`;case"displayBg":return`rgb(${ut(s)} / var(--media-user-display-bg-opacity, 1))`}}function $s(e){return(parseInt(e)/100).toString()}function bs(e){switch(e){case"mono-serif":return'"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace';case"mono-sans":return'"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace';case"pro-sans":return'Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif';case"casual":return'"Comic Sans MS", Impact, Handlee, fantasy';case"cursive":return'"Monotype Corsiva", "URW Chancery L", "Apple Chancery", "Dancing Script", cursive';case"capitals":return'"Arial Unicode Ms", Arial, Helvetica, Verdana, "Marcellus SC", sans-serif + font-variant=small-caps';default:return'"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif'}}function gs(e){switch(e){case"drop shadow":return"rgb(34, 34, 34) 1.86389px 1.86389px 2.79583px, rgb(34, 34, 34) 1.86389px 1.86389px 3.72778px, rgb(34, 34, 34) 1.86389px 1.86389px 4.65972px";case"raised":return"rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px";case"depressed":return"rgb(204, 204, 204) 1px 1px, rgb(34, 34, 34) -1px -1px";case"outline":return"rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px";default:return""}}let ys=0;function k({label:e="",value:t="",children:s}){if(!e)return l`
      <div class="vds-menu-section">
        <div class="vds-menu-section-body">${s}</div>
      </div>
    `;const n=`vds-menu-section-${++ys}`;return l`
    <section class="vds-menu-section" role="group" aria-labelledby=${n}>
      <div class="vds-menu-section-title">
        <header id=${n}>${e}</header>
        ${t?l`<div class="vds-menu-section-value">${t}</div>`:null}
      </div>
      <div class="vds-menu-section-body">${s}</div>
    </section>
  `}function K({label:e,children:t}){return l`
    <div class="vds-menu-item">
      <div class="vds-menu-item-label">${e}</div>
      ${t}
    </div>
  `}function _({label:e,icon:t,hint:s}){return l`
    <media-menu-button class="vds-menu-item">
      ${w("menu-arrow-left","vds-menu-close-icon")}
      ${t?w(t,"vds-menu-item-icon"):null}
      <span class="vds-menu-item-label">${a(e)}</span>
      <span class="vds-menu-item-hint" data-part="hint">${s?a(s):null} </span>
      ${w("menu-arrow-right","vds-menu-open-icon")}
    </media-menu-button>
  `}function xs({value:e=null,options:t,hideLabel:s=!1,children:n=null,onChange:i=null}){function o(r){const{value:p,label:c}=r;return l`
      <media-radio class="vds-radio" value=${p}>
        ${w("menu-radio-check")}
        ${s?null:l`
              <span class="vds-radio-label" data-part="label">
                ${G(c)?c:a(c)}
              </span>
            `}
        ${$t(n)?n(r):n}
      </media-radio>
    `}return l`
    <media-radio-group
      class="vds-radio-group"
      value=${G(e)?e:e?a(e):""}
      @change=${i}
    >
      ${O(t)?t.map(o):a(()=>t().map(o))}
    </media-radio-group>
  `}function Ts(e){return O(e)?e.map(t=>({label:t,value:t.toLowerCase()})):Object.keys(e).map(t=>({label:t,value:e[t]}))}function et(){return l`
    <div class="vds-slider-track"></div>
    <div class="vds-slider-track-fill vds-slider-track"></div>
    <div class="vds-slider-thumb"></div>
  `}function st(){return l`
    <media-slider-steps class="vds-slider-steps">
      <template>
        <div class="vds-slider-step"></div>
      </template>
    </media-slider-steps>
  `}function nt({label:e=null,value:t=null,upIcon:s="",downIcon:n="",children:i,isMin:o,isMax:r}){const p=e||t,c=[n?w(n,"down"):null,i,s?w(s,"up"):null];return l`
    <div
      class=${`vds-menu-item vds-menu-slider-item${p?" group":""}`}
      data-min=${a(()=>o()?"":null)}
      data-max=${a(()=>r()?"":null)}
    >
      ${p?l`
            <div class="vds-menu-slider-title">
              ${[e?l`<div>${e}</div>`:null,t?l`<div>${t}</div>`:null]}
            </div>
            <div class="vds-menu-slider-body">${c}</div>
          `:c}
    </div>
  `}const Ss={...cs,upIcon:"menu-opacity-up",downIcon:"menu-opacity-down"},Ct={...ps,upIcon:"menu-opacity-up",downIcon:"menu-opacity-down"};function ws(){return a(()=>{const{hasCaptions:e}=h(),{translations:t}=d();return e()?l`
      <media-menu class="vds-font-menu vds-menu">
        ${_({label:()=>T(t,"Caption Styles")})}
        <media-menu-items class="vds-menu-items">
          ${[k({label:u(t,"Font"),children:[ks(),Cs()]}),k({label:u(t,"Text"),children:[As(),Ms(),Ds()]}),k({label:u(t,"Text Background"),children:[Os(),Is()]}),k({label:u(t,"Display Background"),children:[Ps(),_s()]}),k({children:[Gs()]})]}
        </media-menu-items>
      </media-menu>
    `:null})}function ks(){return D({label:"Family",option:us,type:"fontFamily"})}function Cs(){return D({label:"Size",option:Ss,type:"fontSize"})}function As(){return D({label:"Color",option:kt,type:"textColor"})}function Ds(){return D({label:"Opacity",option:Ct,type:"textOpacity"})}function Ms(){return D({label:"Shadow",option:ms,type:"textShadow"})}function Os(){return D({label:"Color",option:kt,type:"textBg"})}function Is(){return D({label:"Opacity",option:Ct,type:"textBgOpacity"})}function Ps(){return D({label:"Color",option:kt,type:"displayBg"})}function _s(){return D({label:"Opacity",option:Ct,type:"displayBgOpacity"})}function Gs(){const{translations:e}=d();return l`
    <button class="vds-menu-item" role="menuitem" @click=${vs}>
      <span class="vds-menu-item-label">${a(()=>T(e,"Reset"))}</span>
    </button>
  `}function D({label:e,option:t,type:s}){const{player:n}=S(),{translations:i}=d(),o=P[s],r=()=>T(i,e);function p(){Ve(),n.dispatchEvent(new Event("vds-font-change"))}if(t.type==="color"){let v=function(m){o.set(m.target.value),p()};return K({label:a(r),children:l`
        <input
          class="vds-color-picker"
          type="color"
          .value=${a(o)}
          @input=${v}
        />
      `})}if(t.type==="slider"){let v=function(L){o.set(L.detail+"%"),p()};const{min:m,max:f,step:g,upIcon:y,downIcon:B}=t;return nt({label:a(r),value:a(o),upIcon:y,downIcon:B,isMin:()=>o()===m+"%",isMax:()=>o()===f+"%",children:l`
        <media-slider
          class="vds-slider"
          min=${m}
          max=${f}
          step=${g}
          key-step=${g}
          .value=${a(()=>parseInt(o()))}
          aria-label=${a(r)}
          @value-change=${v}
          @drag-value-change=${v}
        >
          ${et()}${st()}
        </media-slider>
      `})}const c=Ts(t.values),$=()=>{var f;const v=o(),m=((f=c.find(g=>g.value===v))==null?void 0:f.label)||"";return T(i,G(m)?m:m())};return l`
    <media-menu class=${`vds-${W(s)}-menu vds-menu`}>
      ${_({label:r,hint:$})}
      <media-menu-items class="vds-menu-items">
        ${xs({value:o,options:c,onChange({detail:v}){o.set(v),p()}})}
      </media-menu-items>
    </media-menu>
  `}function it({label:e,checked:t,defaultChecked:s=!1,storageKey:n,onChange:i}){const{translations:o}=d(),r=n?localStorage.getItem(n):null,p=x(!!(r??s)),c=x(!1),$=a(ze(p)),v=u(o,e);n&&i(Et(p)),t&&C(()=>void p.set(t()));function m(y){(y==null?void 0:y.button)!==1&&(p.set(B=>!B),n&&localStorage.setItem(n,p()?"1":""),i(p(),y),c.set(!1))}function f(y){Re(y)&&m()}function g(y){y.button===0&&c.set(!0)}return l`
    <div
      class="vds-menu-checkbox"
      role="menuitemcheckbox"
      tabindex="0"
      aria-label=${v}
      aria-checked=${$}
      data-active=${a(()=>c()?"":null)}
      @pointerup=${m}
      @pointerdown=${g}
      @keydown=${f}
    ></div>
  `}function Ns(){return a(()=>{const{translations:e}=d();return l`
      <media-menu class="vds-accessibility-menu vds-menu">
        ${_({label:()=>T(e,"Accessibility"),icon:"menu-accessibility"})}
        <media-menu-items class="vds-menu-items">
          ${[k({children:[Bs(),Ls()]}),k({children:[ws()]})]}
        </media-menu-items>
      </media-menu>
    `})}function Bs(){const{userPrefersAnnouncements:e,translations:t}=d(),s="Announcements";return K({label:u(t,s),children:it({label:s,storageKey:"vds-player::announcements",onChange(n){e.set(n)}})})}function Ls(){return a(()=>{const{translations:e,userPrefersKeyboardAnimations:t,noKeyboardAnimations:s}=d(),{viewType:n}=h();if(b(()=>n()!=="video"||s())())return null;const o="Keyboard Animations";return K({label:u(e,o),children:it({label:o,defaultChecked:!0,storageKey:"vds-player::keyboard-animations",onChange(r){t.set(r)}})})})}function Fs(){return a(()=>{const{noAudioGain:e,translations:t}=d(),{audioTracks:s,canSetAudioGain:n}=h();return b(()=>!(n()&&!e())&&s().length<=1)()?null:l`
      <media-menu class="vds-audio-menu vds-menu">
        ${_({label:()=>T(t,"Audio"),icon:"menu-audio"})}
        <media-menu-items class="vds-menu-items">
          ${[Rs(),Vs()]}
        </media-menu-items>
      </media-menu>
    `})}function Rs(){return a(()=>{const{translations:e}=d(),{audioTracks:t}=h(),s=u(e,"Default");return b(()=>t().length<=1)()?null:k({children:l`
        <media-menu class="vds-audio-tracks-menu vds-menu">
          ${_({label:()=>T(e,"Track")})}
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
      `})})}function Vs(){return a(()=>{const{noAudioGain:e,translations:t}=d(),{canSetAudioGain:s}=h();if(b(()=>!s()||e())())return null;const{audioGain:i}=h();return k({label:u(t,"Boost"),value:a(()=>Math.round(((i()??1)-1)*100)+"%"),children:[nt({upIcon:"menu-audio-boost-up",downIcon:"menu-audio-boost-down",children:Es(),isMin:()=>((i()??1)-1)*100<=de(),isMax:()=>((i()??1)-1)*100===ue()})]})})}function Es(){const{translations:e}=d(),t=u(e,"Boost"),s=de,n=ue,i=Ws;return l`
    <media-audio-gain-slider
      class="vds-audio-gain-slider vds-slider"
      aria-label=${t}
      min=${a(s)}
      max=${a(n)}
      step=${a(i)}
      key-step=${a(i)}
    >
      ${et()}${st()}
    </media-audio-gain-slider>
  `}function de(){const{audioGains:e}=d(),t=e();return O(t)?t[0]??0:t.min}function ue(){const{audioGains:e}=d(),t=e();return O(t)?t[t.length-1]??300:t.max}function Ws(){const{audioGains:e}=d(),t=e();return O(t)?t[1]-t[0]||25:t.step}function Hs(){return a(()=>{const{translations:e}=d(),{hasCaptions:t}=h(),s=u(e,"Off");return t()?l`
      <media-menu class="vds-captions-menu vds-menu">
        ${_({label:()=>T(e,"Captions"),icon:"menu-captions"})}
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
    `:null})}function Ks(){return a(()=>{const{translations:e}=d();return l`
      <media-menu class="vds-playback-menu vds-menu">
        ${_({label:()=>T(e,"Playback"),icon:"menu-playback"})}
        <media-menu-items class="vds-menu-items">
          ${[k({children:Qs()}),Us(),Zs()]}
        </media-menu-items>
      </media-menu>
    `})}function Qs(){const{remote:e}=S(),{translations:t}=d(),s="Loop";return K({label:u(t,s),children:it({label:s,storageKey:"vds-player::user-loop",onChange(n,i){e.userPrefersLoopChange(n,i)}})})}function Us(){return a(()=>{const{translations:e}=d(),{canSetPlaybackRate:t,playbackRate:s}=h();return t()?k({label:u(e,"Speed"),value:a(()=>s()===1?T(e,"Normal"):s()+"x"),children:[nt({upIcon:"menu-speed-up",downIcon:"menu-speed-down",children:js(),isMin:()=>s()===ce(),isMax:()=>s()===pe()})]}):null})}function ce(){const{playbackRates:e}=d(),t=e();return O(t)?t[0]??0:t.min}function pe(){const{playbackRates:e}=d(),t=e();return O(t)?t[t.length-1]??2:t.max}function zs(){const{playbackRates:e}=d(),t=e();return O(t)?t[1]-t[0]||.25:t.step}function js(){const{translations:e}=d(),t=u(e,"Speed"),s=ce,n=pe,i=zs;return l`
    <media-speed-slider
      class="vds-speed-slider vds-slider"
      aria-label=${t}
      min=${a(s)}
      max=${a(n)}
      step=${a(i)}
      key-step=${a(i)}
    >
      ${et()}${st()}
    </media-speed-slider>
  `}function qs(){const{remote:e,qualities:t}=S(),{autoQuality:s,canSetQuality:n,qualities:i}=h(),{translations:o}=d(),r="Auto";return b(()=>!n()||i().length<=1)()?null:K({label:u(o,r),children:it({label:r,checked:s,onChange(c,$){c?e.requestAutoQuality($):e.changeQuality(t.selectedIndex,$)}})})}function Zs(){return a(()=>{const{hideQualityBitrate:e,translations:t}=d(),{canSetQuality:s,qualities:n,quality:i}=h(),o=b(()=>!s()||n().length<=1),r=b(()=>Ue(n()));return o()?null:k({label:u(t,"Quality"),value:a(()=>{var m,f;const p=(m=i())==null?void 0:m.height,c=e()?null:(f=i())==null?void 0:f.bitrate,$=c&&c>0?`${(c/1e6).toFixed(2)} Mbps`:null,v=T(t,"Auto");return p?`${p}p${$?` (${$})`:""}`:v}),children:[nt({upIcon:"menu-quality-up",downIcon:"menu-quality-down",children:Ys(),isMin:()=>r()[0]===i(),isMax:()=>r().at(-1)===i()}),qs()]})})}function Ys(){const{translations:e}=d(),t=u(e,"Quality");return l`
    <media-quality-slider class="vds-quality-slider vds-slider" aria-label=${t}>
      ${et()}${st()}
    </media-quality-slider>
  `}function me({placement:e,portal:t,tooltip:s}){return a(()=>{const{viewType:n}=h(),{translations:i,menuPortal:o,noModal:r,menuGroup:p,smallWhen:c}=d(),$=b(()=>r()?U(e):c()?null:U(e)),v=b(()=>!c()&&p()==="bottom"&&n()==="video"?26:0),m=x(!1);fs();function f(){m.set(!0)}function g(){m.set(!1)}const y=l`
      <media-menu-items
        class="vds-settings-menu-items vds-menu-items"
        placement=${a($)}
        offset=${a(v)}
      >
        ${a(()=>m()?[Ks(),Ns(),Fs(),Hs()]:null)}
      </media-menu-items>
    `;return l`
      <media-menu class="vds-settings-menu vds-menu" @open=${f} @close=${g}>
        <media-tooltip class="vds-tooltip">
          <media-tooltip-trigger>
            <media-menu-button
              class="vds-menu-button vds-button"
              aria-label=${u(i,"Settings")}
            >
              ${w("menu-settings","vds-rotate-icon")}
            </media-menu-button>
          </media-tooltip-trigger>
          <media-tooltip-content
            class="vds-tooltip-content"
            placement=${$t(s)?a(s):s}
          >
            ${u(i,"Settings")}
          </media-tooltip-content>
        </media-tooltip>
        ${t?oe(o,y):y}
      </media-menu>
    `})}function At({orientation:e,tooltip:t}){return a(()=>{const{pointer:s,muted:n,canSetVolume:i}=h();if(s()==="coarse"&&!n())return null;if(!i())return Bt({tooltip:t});const o=x(void 0),r=Ge(o);return l`
      <div class="vds-volume" ?data-active=${a(r)} ${J(o.set)}>
        ${Bt({tooltip:t})}
        <div class="vds-volume-popup">${Xs({orientation:e})}</div>
      </div>
    `})}function Xs({orientation:e}={}){const{translations:t}=d(),s=u(t,"Volume");return l`
    <media-volume-slider
      class="vds-volume-slider vds-slider"
      aria-label=${s}
      orientation=${bt(e)}
    >
      <div class="vds-slider-track"></div>
      <div class="vds-slider-track-fill vds-slider-track"></div>
      <media-slider-preview class="vds-slider-preview" no-clamp>
        <media-slider-value class="vds-slider-value"></media-slider-value>
      </media-slider-preview>
      <div class="vds-slider-thumb"></div>
    </media-volume-slider>
  `}function Dt(){const e=x(void 0),t=x(0),{thumbnails:s,translations:n,sliderChaptersMinWidth:i,disableTimeSlider:o,seekStep:r,noScrubGesture:p}=d(),c=u(n,"Seek"),$=a(o),v=a(()=>t()<i()),m=a(s);return Ut(e,()=>{const f=e();f&&t.set(f.clientWidth)}),l`
    <media-time-slider
      class="vds-time-slider vds-slider"
      aria-label=${c}
      key-step=${a(r)}
      ?disabled=${$}
      ?no-swipe-gesture=${a(p)}
      ${J(e.set)}
    >
      <media-slider-chapters class="vds-slider-chapters" ?disabled=${v}>
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
          .src=${m}
        ></media-slider-thumbnail>
        <div class="vds-slider-chapter-title" data-part="chapter-title"></div>
        <media-slider-value class="vds-slider-value"></media-slider-value>
      </media-slider-preview>
    </media-time-slider>
  `}function Js(){return l`
    <div class="vds-time-group">
      ${a(()=>{const{duration:e}=h();return e()?[l`<media-time class="vds-time" type="current"></media-time>`,l`<div class="vds-time-divider">/</div>`,l`<media-time class="vds-time" type="duration"></media-time>`]:null})}
    </div>
  `}function tn(){return a(()=>{const{live:e,duration:t}=h();return e()?ae():t()?l`<media-time class="vds-time" type="current" toggle remainder></media-time>`:null})}function ve(){return a(()=>{const{live:e}=h();return e()?ae():Js()})}function fe(){return a(()=>{const{textTracks:e}=S(),{title:t,started:s}=h(),n=x(null);return Qt(e,"chapters",n.set),n()&&(s()||!t())?he():l`<media-title class="vds-chapter-title"></media-title>`})}function he(){return l`<media-chapter-title class="vds-chapter-title"></media-chapter-title>`}class $e extends as{async Pf(){const t=(await Ne(async()=>{const{icons:n}=await import("./vidstack-CmqqnRgc-Bpdev3iS.js");return{icons:n}},__vite__mapDeps([0,1]))).icons,s={};for(const n of Object.keys(t))s[n]=ns({name:n,paths:t[n]});return s}}var M;let en=(M=class extends N{},M.props={...lt(M,M,"props"),when:({viewType:t})=>t==="audio",smallWhen:({width:t})=>t<576},M);function sn(){return[yt(),wt(),l`
      <media-controls class="vds-controls">
        <media-controls-group class="vds-controls-group">
          ${[Lt({backward:!0,tooltip:"top start"}),tt({tooltip:"top"}),Lt({tooltip:"top"}),nn(),Dt(),tn(),At({orientation:"vertical",tooltip:"top"}),Tt({tooltip:"top"}),St(),xt({tooltip:"top"}),an()]}
        </media-controls-group>
      </media-controls>
    `]}function nn(){return a(()=>{let e=x(void 0),t=x(!1),s=S(),{title:n,started:i,currentTime:o,ended:r}=h(),{translations:p}=d(),c=We(e),$=()=>i()||o()>0;const v=()=>{const g=r()?"Replay":$()?"Continue":"Play";return`${T(p,g)}: ${n()}`};C(()=>{var g;c()&&document.activeElement===document.body&&((g=s.player.el)==null||g.focus())});function m(){const g=e(),y=!!g&&!c()&&g.clientWidth<g.children[0].clientWidth;g&&He(g,"vds-marquee",y),t.set(y)}function f(){return l`
        <span class="vds-title-text">
          ${a(v)}${a(()=>$()?he():null)}
        </span>
      `}return Ut(e,m),n()?l`
          <span class="vds-title" title=${a(v)} ${J(e.set)}>
            ${[f(),a(()=>t()&&!c()?f():null)]}
          </span>
        `:A()})}function an(){const e="top end";return[re({tooltip:"top",placement:e,portal:!0}),me({tooltip:"top end",placement:e,portal:!0})]}const Z=class Z extends zt(qt,en){constructor(){super(...arguments),this.en=x(!1)}onSetup(){this.forwardKeepAlive=!1,this.a=S(),this.classList.add("vds-audio-layout"),this.Fn()}onConnect(){se("audio",()=>this.isMatch),this.En()}render(){return a(this.Zm.bind(this))}Zm(){return this.isMatch?sn():null}En(){const{menuPortal:t}=d();C(()=>{if(!this.isMatch)return;const s=le(this,this.menuContainer,"vds-audio-layout",()=>this.isSmallLayout),n=s?[this,s]:[this];return(this.$props.customIcons()?new Jt(n):new $e(n)).connect(),t.set(s),()=>{s.remove(),t.set(null)}})}Fn(){const{pointer:t}=this.a.$state;C(()=>{t()==="coarse"&&C(this.rn.bind(this))})}rn(){if(!this.en()){rt(this,"pointerdown",this.sn.bind(this),{capture:!0});return}rt(this,"pointerdown",t=>t.stopPropagation()),rt(window,"pointerdown",this.tn.bind(this))}sn(t){const{target:s}=t;Ee(s)&&s.closest(".vds-time-slider")&&(t.stopImmediatePropagation(),this.setAttribute("data-scrubbing",""),this.en.set(!0))}tn(){this.en.set(!1),this.removeAttribute("data-scrubbing")}};Z.tagName="media-audio-layout",Z.attrs={smallWhen:{converter(t){return t!=="never"&&!!t}}};let vt=Z;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const on=X(class extends gt{constructor(){super(...arguments),this.key=I}render(e,t){return this.key=e,t}update(e,[t,s]){return t!==this.key&&(Ye(e),this.key=t),s}}),V=class V extends N{};V.props={...lt(V,V,"props"),when:({viewType:t})=>t==="video",smallWhen:({width:t,height:s})=>t<576||s<380};let ft=V;function be(){return a(()=>{const e=S(),{noKeyboardAnimations:t,userPrefersKeyboardAnimations:s}=d();if(b(()=>t()||!s())())return null;const i=x(!1),{lastKeyboardAction:o}=e.$state;C(()=>{i.set(!!o());const m=setTimeout(()=>i.set(!1),500);return()=>{i.set(!1),window.clearTimeout(m)}});const r=b(()=>{var f;const m=(f=o())==null?void 0:f.action;return m&&i()?W(m):null}),p=b(()=>`vds-kb-action${i()?"":" hidden"}`),c=b(ln),$=b(()=>{const m=rn();return m?Ke(m):null});function v(){const m=$();return m?l`
        <div class="vds-kb-bezel">
          <div class="vds-kb-icon">${m}</div>
        </div>
      `:null}return l`
      <div class=${a(p)} data-action=${a(r)}>
        <div class="vds-kb-text-wrapper">
          <div class="vds-kb-text">${a(c)}</div>
        </div>
        ${a(()=>on(o(),v()))}
      </div>
    `})}function ln(){var n;const{$state:e}=S(),t=(n=e.lastKeyboardAction())==null?void 0:n.action,s=e.audioGain()??1;switch(t){case"toggleMuted":return e.muted()?"0%":Rt(e.volume(),s);case"volumeUp":case"volumeDown":return Rt(e.volume(),s);default:return""}}function Rt(e,t){return`${Math.round(e*t*100)}%`}function rn(){var s;const{$state:e}=S();switch((s=e.lastKeyboardAction())==null?void 0:s.action){case"togglePaused":return e.paused()?"kb-pause-icon":"kb-play-icon";case"toggleMuted":return e.muted()||e.volume()===0?"kb-mute-icon":e.volume()>=.5?"kb-volume-up-icon":"kb-volume-down-icon";case"toggleFullscreen":return`kb-fs-${e.fullscreen()?"enter":"exit"}-icon`;case"togglePictureInPicture":return`kb-pip-${e.pictureInPicture()?"enter":"exit"}-icon`;case"toggleCaptions":return e.hasCaptions()?`kb-cc-${e.textTrack()?"on":"off"}-icon`:null;case"volumeUp":return"kb-volume-up-icon";case"volumeDown":return"kb-volume-down-icon";case"seekForward":return"kb-seek-forward-icon";case"seekBackward":return"kb-seek-backward-icon";default:return null}}function dn(){return[yt(),ge(),at(),be(),wt(),l`<div class="vds-scrim"></div>`,l`
      <media-controls class="vds-controls">
        ${[cn(),A(),l`<media-controls-group class="vds-controls-group"></media-controls-group>`,A(),l`
            <media-controls-group class="vds-controls-group">
              ${Dt()}
            </media-controls-group>
          `,l`
            <media-controls-group class="vds-controls-group">
              ${[tt({tooltip:"top start"}),At({orientation:"horizontal",tooltip:"top"}),ve(),fe(),Tt({tooltip:"top"}),un(),xt({tooltip:"top"}),ne({tooltip:"top"}),St(),ds(),ie({tooltip:"top end"})]}
            </media-controls-group>
          `]}
      </media-controls>
    `]}function un(){return a(()=>{const{menuGroup:e}=d();return e()==="bottom"?Mt():null})}function cn(){return l`
    <media-controls-group class="vds-controls-group">
      ${a(()=>{const{menuGroup:e}=d();return e()==="top"?[A(),Mt()]:null})}
    </media-controls-group>
  `}function pn(){return[yt(),ge(),at(),wt(),be(),l`<div class="vds-scrim"></div>`,l`
      <media-controls class="vds-controls">
        <media-controls-group class="vds-controls-group">
          ${[xt({tooltip:"top start"}),ne({tooltip:"bottom start"}),A(),Tt({tooltip:"bottom"}),St(),Mt(),At({orientation:"vertical",tooltip:"bottom end"})]}
        </media-controls-group>

        ${A()}

        <media-controls-group class="vds-controls-group" style="pointer-events: none;">
          ${[A(),tt({tooltip:"top"}),A()]}
        </media-controls-group>

        ${A()}

        <media-controls-group class="vds-controls-group">
          ${[ve(),fe(),ie({tooltip:"top end"})]}
        </media-controls-group>

        <media-controls-group class="vds-controls-group">
          ${Dt()}
        </media-controls-group>
      </media-controls>
    `,vn()]}function mn(){return l`
    <div class="vds-load-container">
      ${[at(),tt({tooltip:"top"})]}
    </div>
  `}function vn(){return a(()=>{const{duration:e}=h();return e()===0?null:l`
      <div class="vds-start-duration">
        <media-time class="vds-time" type="duration"></media-time>
      </div>
    `})}function at(){return l`
    <div class="vds-buffering-indicator">
      <media-spinner class="vds-buffering-spinner"></media-spinner>
    </div>
  `}function Mt(){const{menuGroup:e,smallWhen:t}=d(),s=()=>e()==="top"||t()?"bottom":"top",n=b(()=>`${s()} ${e()==="top"?"end":"center"}`),i=b(()=>`${s()} end`);return[re({tooltip:n,placement:i,portal:!0}),me({tooltip:n,placement:i,portal:!0})]}function ge(){return a(()=>{const{noGestures:e}=d();return e()?null:l`
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
    `})}const Y=class Y extends zt(qt,ft){onSetup(){this.forwardKeepAlive=!1,this.a=S(),this.classList.add("vds-video-layout")}onConnect(){se("video",()=>this.isMatch),this.En()}render(){return a(this.Zm.bind(this))}En(){const{menuPortal:t}=d();C(()=>{if(!this.isMatch)return;const s=le(this,this.menuContainer,"vds-video-layout",()=>this.isSmallLayout),n=s?[this,s]:[this];return(this.$props.customIcons()?new Jt(n):new $e(n)).connect(),t.set(s),()=>{s.remove(),t.set(null)}})}Zm(){const{load:t}=this.a.$props,{canLoad:s,streamType:n,nativeControls:i}=this.a.$state;return!i()&&this.isMatch?t()==="play"&&!s()?mn():n()==="unknown"?at():this.isSmallLayout?pn():dn():null}};Y.tagName="media-video-layout",Y.attrs={smallWhen:{converter(t){return t!=="never"&&!!t}}};let ht=Y;jt(vt);jt(ht);
