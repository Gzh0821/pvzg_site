import{a as M}from"./axios-upsvKRUO.js";import{T as R,z as $,A as H,_ as c,B as T,C as U,D as G,E as P,G as V,H as X,m as E,h as j,q as O,u as Q,i as q,I as F,r as v,o as z,c as C,j as k,e as i,g as y,d as I,t as L,b as N,F as J}from"./app-BarjM_FT.js";import{_ as Z}from"./plugin-vue_export-helper-DlAUqK2U.js";const u=(n,e)=>new R(n).setAlpha(e).toRgbString(),S=(n,e)=>new R(n).lighten(e).toHexString(),W=n=>{const e=$(n,{theme:"dark"});return{1:e[0],2:e[1],3:e[2],4:e[3],5:e[6],6:e[5],7:e[4],8:e[6],9:e[5],10:e[4]}},Y=(n,e)=>{const t=n||"#000",o=e||"#fff";return{colorBgBase:t,colorTextBase:o,colorText:u(o,.85),colorTextSecondary:u(o,.65),colorTextTertiary:u(o,.45),colorTextQuaternary:u(o,.25),colorFill:u(o,.18),colorFillSecondary:u(o,.12),colorFillTertiary:u(o,.08),colorFillQuaternary:u(o,.04),colorBgElevated:S(t,12),colorBgContainer:S(t,8),colorBgLayout:S(t,0),colorBgSpotlight:S(t,26),colorBorder:S(t,26),colorBorderSecondary:S(t,19)}},K=(n,e)=>{const t=Object.keys(H).map(r=>{const p=$(n[r],{theme:"dark"});return new Array(10).fill(1).reduce((h,f,_)=>(h[`${r}-${_+1}`]=p[_],h),{})}).reduce((r,p)=>(r=c(c({},r),p),r),{}),o=e??T(n);return c(c(c({},o),t),U(n,{generateColorPalettes:W,generateNeutralColorPalettes:Y}))};function ee(n){const{sizeUnit:e,sizeStep:t}=n,o=t-2;return{sizeXXL:e*(o+10),sizeXL:e*(o+6),sizeLG:e*(o+2),sizeMD:e*(o+2),sizeMS:e*(o+1),size:e*o,sizeSM:e*o,sizeXS:e*(o-1),sizeXXS:e*(o-1)}}const oe=(n,e)=>{const t=e??T(n),o=t.fontSizeSM,r=t.controlHeight-4;return c(c(c(c(c({},t),ee(e??n)),G(o)),{controlHeight:r}),P(c(c({},t),{controlHeight:r})))};function te(){const[n,e,t]=X();return{theme:n,token:e,hashId:t}}const ne={defaultConfig:V,defaultSeed:V.token,useToken:te,defaultAlgorithm:T,darkAlgorithm:K,compactAlgorithm:oe},ae=E({__name:"App",props:{authorGroup:{}},setup(n,{expose:e}){e();const t=n,o=j([]),r=O("i18nLanguage","en"),p=j(""),h=async l=>{try{const a=(await M.get("https://levelapi.pvzge.com/links.json")).data[l];for(const A in a){const d=a[A].location,x=(await M.get(`https://levelapi.pvzge.com${d}`)).data,D=x.authorInfo,w=x.author;x.levelList.forEach(g=>{if(typeof g=="string")o.value.push({name:g,author:w,introduction:D,url:`https://levelapi.pvzge.com/official/${w}/levels/${g}`});else if(g.fileName&&g.Information){const s=g.Information;o.value.push({name:typeof s.name=="string"?s.name:s.name[r]??s.name.en,introduction:typeof s.Introduction=="string"?s.Introduction:s.Introduction[r]??s.Introduction.en,author:w,gameVersion:s.GameVersion,version:s.Version,createdAt:s.CreatedAt,updatedAt:s.UpdatedAt,difficulty:s.Difficulty,category:s.Category,url:`https://levelapi.pvzge.com/official/${w}/levels/${g.fileName}`})}})}}catch(m){F.error("Failed to load levels: "+m.message)}},f=async l=>{try{const a=(await M.get(l.url)).data,A=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),d=document.createElement("a");d.href=URL.createObjectURL(A),d.setAttribute("download",l.name),document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(d.href)}catch(m){F.error("Failed to download level: "+m.message)}},_={pageSize:6},B=Q(()=>o.value.filter(l=>l.name.toLowerCase().includes(p.value.toLowerCase())));q(()=>{h(t.authorGroup)});const b={props:t,levels:o,i18nLanguage:r,searchValue:p,fetchLevels:h,downloadLevel:f,pagination:_,filteredLevels:B,get theme(){return ne}};return Object.defineProperty(b,"__isScriptSetup",{enumerable:!1,value:!0}),b}}),re={key:0},se={key:1},ce={key:2},ie={key:3},le=["onClick"],de={class:"author-name"};function ue(n,e,t,o,r,p){const h=v("a-input-search"),f=v("HopeIcon"),_=v("a-list-item-meta"),B=v("a-list-item"),b=v("a-list"),l=v("a-space"),m=v("a-config-provider");return z(),C(J,null,[k(` <a-row :gutter="[16, 24]">
        <a-col :span="8" v-for="level in paginatedLevels" :key="level.name">
            <a-card :title="level.name" @click="downloadLevel(level)" hoverable>
                <p v-if="level.author">Author: {{ level.author }}</p>
                <p v-if="level.introduction">Introduction: {{ level.introduction }}</p>
            </a-card>
        </a-col>
    </a-row>
 `),i(m,{theme:{algorithm:n.$isDarkmode?o.theme.darkAlgorithm:o.theme.defaultAlgorithm}},{default:y(()=>[i(l,{direction:"vertical",size:"middle",style:{width:"100%"},theme:"dark"},{default:y(()=>[i(h,{value:o.searchValue,"onUpdate:value":e[0]||(e[0]=a=>o.searchValue=a),valueModifiers:{lazy:!0},placeholder:"Search level...","enter-button":""},null,8,["value"]),i(b,{"item-layout":"vertical","data-source":o.filteredLevels,size:"middle",header:"PvZ2 Gardendless Levels",pagination:o.pagination,bordered:""},{renderItem:y(({item:a})=>[i(B,null,{actions:y(()=>[a.version?(z(),C("span",re,[i(f,{icon:"code-branch"}),I(" "+L(a.version),1)])):k("v-if",!0),a.difficulty?(z(),C("span",se,[i(f,{icon:"fire"}),I(" "+L(a.difficulty),1)])):k("v-if",!0),a.category?(z(),C("span",ce,[i(f,{icon:"tag"}),I(" "+L(a.category),1)])):k("v-if",!0),a.updatedAt?(z(),C("span",ie,[i(f,{icon:"clock"}),I(" "+L(a.updatedAt),1)])):k("v-if",!0)]),default:y(()=>[i(_,{description:a.introduction},{title:y(()=>[N("a",{onClick:A=>o.downloadLevel(a)},L(a.name),9,le),N("span",de," by "+L(a.author),1)]),_:2},1032,["description"])]),_:2},1024)]),_:1},8,["data-source"])]),_:1})]),_:1},8,["theme"])],2112)}const ge=Z(ae,[["render",ue],["__scopeId","data-v-18ad0eb9"],["__file","App.vue"]]);export{ge as L};