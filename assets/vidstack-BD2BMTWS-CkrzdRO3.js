var x=e=>{throw TypeError(e)};var O=(e,h,t)=>h.has(e)||x("Cannot "+t);var n=(e,h,t)=>(O(e,h,"read from private field"),t?t.call(e):h.get(e)),u=(e,h,t)=>h.has(e)?x("Cannot add the same private member more than once"):h instanceof WeakSet?h.add(e):h.set(e,t),v=(e,h,t,i)=>(O(e,h,"write to private field"),i?i.call(e,t):h.set(e,t),t),r=(e,h,t)=>(O(e,h,"access private method"),t);import{aE as j,aN as B,aF as H,F as d,aO as T,g as U,V as b,U as V,bj as k}from"./app-C24URzT6.js";var o,s,y,C,P,f,A,m,E,F,L,M,N,S,$,q=($=class extends j{constructor(){super(...arguments);u(this,s);u(this,o);u(this,m,"")}onSetup(){v(this,o,H()),r(this,s,E).call(this),r(this,s,F).call(this),r(this,s,L).call(this),r(this,s,P).call(this)}onAttach(t){t.style.setProperty("pointer-events","none"),d(r(this,s,A).bind(this)),d(r(this,s,E).bind(this)),d(r(this,s,F).bind(this)),d(r(this,s,L).bind(this)),d(r(this,s,P).bind(this));let{started:i}=n(this,o).$state;this.setAttributes({"data-visible":()=>!i()&&!this.$state.hidden(),"data-loading":r(this,s,f).bind(this),"data-error":r(this,s,y).bind(this),"data-hidden":this.$state.hidden})}onConnect(t){d(r(this,s,C).bind(this)),d(r(this,s,M).bind(this))}},o=new WeakMap,s=new WeakSet,y=function(){let{error:t}=this.$state;return!T(t())},C=function(){let{canLoadPoster:t,poster:i}=n(this,o).$state;!t()&&i()&&U(i(),"preconnect")},P=function(){let{src:t}=this.$props,{poster:i,nativeControls:a}=n(this,o).$state;this.el&&b(this.el,"display",a()?"none":null),this.$state.hidden.set(r(this,s,y).call(this)||!(t()||i())||a())},f=function(){let{loading:t,hidden:i}=this.$state;return!i()&&t()},A=function(){let t=this.$state.img();t&&(new V(t).add("load",r(this,s,N).bind(this)).add("error",r(this,s,S).bind(this)),t.complete&&r(this,s,N).call(this))},m=new WeakMap,E=function(){let{poster:t}=n(this,o).$props,{canLoadPoster:i,providedPoster:a,inferredPoster:p}=n(this,o).$state,c=this.$props.src()||"",w=c||t()||p();n(this,m)===a()&&a.set(c),this.$state.src.set(i()&&w.length?w:null),v(this,m,c)},F=function(){let{src:t}=this.$props,{alt:i}=this.$state,{poster:a}=n(this,o).$state;i.set(t()||a()?this.$props.alt():null)},L=function(){let{crossOrigin:t}=this.$props,{crossOrigin:i}=this.$state,{crossOrigin:a,poster:p}=n(this,o).$state,c=t()!==null?t():a();i.set(/ytimg\.com|vimeo/.test(p()||"")?null:c===!0?"anonymous":c)},M=function(){let{loading:t,error:i}=this.$state,{canLoadPoster:a,poster:p}=n(this,o).$state;t.set(a()&&!!p()),i.set(null)},N=function(){let{loading:t,error:i}=this.$state;t.set(!1),i.set(null)},S=function(t){let{loading:i,error:a}=this.$state;i.set(!1),a.set(t)},$.props={src:null,alt:null,crossOrigin:null},$.state=new B({img:null,src:null,alt:null,crossOrigin:null,loading:!0,error:null,hidden:!1}),$),l,g,G=(g=class extends k(HTMLElement,q){constructor(){super(...arguments);u(this,l,document.createElement("img"))}onSetup(){this.$state.img.set(n(this,l))}onConnect(){let{src:t,alt:i,crossOrigin:a}=this.$state;d(()=>{let{loading:p,hidden:c}=this.$state;n(this,l).style.display=p()||c()?"none":""}),d(()=>{b(n(this,l),"alt",i()),b(n(this,l),"crossorigin",a()),b(n(this,l),"src",t())}),n(this,l).parentNode!==this&&this.prepend(n(this,l))}},l=new WeakMap,g.tagName="media-poster",g.attrs={crossOrigin:"crossorigin"},g);export{G as MediaPosterElement};