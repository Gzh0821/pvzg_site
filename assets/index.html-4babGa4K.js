import{a as q}from"./axios-CCb-kr4I.js";import{_ as j}from"./plugin-vue_export-helper-DlAUqK2U.js";import{g as z,h as C,c as l,a as n,b as o,d as a,f,i as d,t as p,F as s,j as Q,r as M,o as r}from"./app-CY2gCv-M.js";const E={__name:"index.html",setup(O,{expose:e}){e();const g=z(null);C(()=>{q.get("/jsons/gameinfo.json").then(h=>{g.value=h.data})});const t={gameInfoData:g,get axios(){return q},ref:z,onBeforeMount:C};return Object.defineProperty(t,"__isScriptSetup",{enumerable:!1,value:!0}),t}},H={class:"hint-container important"},V={class:"hint-container warning"},Z={key:0},U={key:0},Y={key:0},J={key:0},W={key:0},K={id:"github",tabindex:"-1"},X={class:"header-anchor",href:"#github"},$=["href"],ee={id:"onedrive-link",tabindex:"-1"},ne={class:"header-anchor",href:"#onedrive-link"},te=["href"],oe={id:"mega-link",tabindex:"-1"},ae={class:"header-anchor",href:"#mega-link"},ie=["href"],le={id:"tmplink",tabindex:"-1"},re={class:"header-anchor",href:"#tmplink"},de=["href"],se={id:"baidu-netdisk",tabindex:"-1"},pe={class:"header-anchor",href:"#baidu-netdisk"},ge=["href"],me={id:"_123pan",tabindex:"-1"},fe={class:"header-anchor",href:"#_123pan"},he=["href"],ue={id:"quark",tabindex:"-1"},ke={class:"header-anchor",href:"#quark"},we=["href"],ye={id:"littleplane",tabindex:"-1"},De={class:"header-anchor",href:"#littleplane"},ve=["href"];function ce(O,e,g,t,h,xe){var u,k,w,y,D,v,c,x,_,b,I,L,N,B,P,T,A,F,R;const m=M("RouteLink"),i=M("Badge");return r(),l("div",null,[n("div",H,[e[4]||(e[4]=n("p",{class:"hint-container-title"},"Importante",-1)),n("p",null,[e[2]||(e[2]=o("For FAQs related to downloading and playing, please see ")),a(m,{to:"/pt-BR/guide/FAQ.html"},{default:f(()=>e[0]||(e[0]=[o("here")])),_:1}),e[3]||(e[3]=o(", and for system requirements and recommended configurations, please see ")),a(m,{to:"/pt-BR/guide/requirement.html"},{default:f(()=>e[1]||(e[1]=[o("here")])),_:1})])]),n("div",V,[e[7]||(e[7]=n("p",{class:"hint-container-title"},"Avisos",-1)),e[8]||(e[8]=n("p",null,"Please note: The download link provided on this page is for learning and communication purposes only and may not be used for commercial purposes. Please delete it within 24 hours after downloading.",-1)),e[9]||(e[9]=n("p",null,"Downloading or playing online means that you have read and agreed to the following agreements and statements:",-1)),e[10]||(e[10]=n("ul",null,[n("li",null,'"PvZ2 Gardendless" Usage Agreement'),n("li",null,'Disclaimer and Copyright Notice for "PvZ2 Gardendless"')],-1)),n("p",null,[e[6]||(e[6]=o("For the details of the above agreement and statement, please see ")),a(m,{to:"/pt-BR/instructions/"},{default:f(()=>e[5]||(e[5]=[o("here")])),_:1})])]),d(` 当前游戏有两种游玩方式：

- 下载游戏客户端压缩包游玩，仅支持 \`Windows 10/11\`系统。
- 在线游玩：[点击进入](https://pvz2-test.gaozih.com)

> [!info]
> 由于游戏资源文件较多，在线游玩可能会有加载速度较慢及卡顿现象，若需要快速加载，请选择下载游戏客户端压缩包游玩。 `),n("p",null,[e[11]||(e[11]=o("This site only provides the latest official version download link")),(u=t.gameInfoData)!=null&&u.Version?(r(),l("span",Z,", The latest game version is "+p(t.gameInfoData.Version),1)):d("v-if",!0),e[12]||(e[12]=o("."))]),n("p",null,[(k=t.gameInfoData)!=null&&k.Name?(r(),l("span",U,"The game version name: "+p(t.gameInfoData.Name),1)):d("v-if",!0)]),n("p",null,[(y=(w=t.gameInfoData)==null?void 0:w.Hash)!=null&&y.MD5?(r(),l("span",Y,[e[13]||(e[13]=o("MD5: ")),n("code",null,p((v=(D=t.gameInfoData)==null?void 0:D.Hash)==null?void 0:v.MD5),1)])):d("v-if",!0)]),n("p",null,[(x=(c=t.gameInfoData)==null?void 0:c.Hash)!=null&&x.SHA256?(r(),l("span",J,[e[14]||(e[14]=o("SHA256: ")),n("code",null,p((b=(_=t.gameInfoData)==null?void 0:_.Hash)==null?void 0:b.SHA256),1)])):d("v-if",!0)]),e[31]||(e[31]=n("h2",{id:"changelog",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#changelog"},[n("span",null,"Changelog")])],-1)),(I=t.gameInfoData)!=null&&I.EnNewFeatures?(r(),l("ul",W,[n("li",null,[(r(!0),l(s,null,Q(t.gameInfoData.EnNewFeatures,(G,S)=>(r(),l("li",{key:S},p(G),1))),128))])])):(r(),l(s,{key:1},[o("None")],64)),(L=t.gameInfoData)!=null&&L.Download.Github?(r(),l(s,{key:2},[n("h2",K,[n("a",X,[n("span",null,[e[15]||(e[15]=o("Github ")),a(i,{text:"No login required",type:"info"}),a(i,{text:"high-speed",type:"tip"}),a(i,{text:"global",type:"warning"})])])]),n("p",null,[e[16]||(e[16]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Github},"click to enter",8,$)])],64)):d("v-if",!0),(N=t.gameInfoData)!=null&&N.Download.Onedrive?(r(),l(s,{key:3},[n("h2",ee,[n("a",ne,[n("span",null,[e[17]||(e[17]=o("Onedrive Link ")),a(i,{text:"No login required",type:"info"}),a(i,{text:"high-speed",type:"tip"}),a(i,{text:"global",type:"warning"})])])]),n("p",null,[e[18]||(e[18]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Onedrive},"click to enter",8,te)])],64)):d("v-if",!0),(B=t.gameInfoData)!=null&&B.Download.Mega?(r(),l(s,{key:4},[n("h2",oe,[n("a",ae,[n("span",null,[e[19]||(e[19]=o("MEGA Link ")),a(i,{text:"No login required",type:"info"}),a(i,{text:"high-speed",type:"tip"}),a(i,{text:"global",type:"warning"})])])]),n("p",null,[e[20]||(e[20]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Mega},"click to enter",8,ie)])],64)):d("v-if",!0),(P=t.gameInfoData)!=null&&P.Download.TmpLink?(r(),l(s,{key:5},[n("h2",le,[n("a",re,[n("span",null,[e[21]||(e[21]=o("TmpLink ")),a(i,{text:"Only in Chinese",type:"danger"}),a(i,{text:"No login required",type:"info"}),a(i,{text:"high-speed",type:"tip"})])])]),n("p",null,[e[22]||(e[22]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.TmpLink},"click to enter",8,de)])],64)):d("v-if",!0),(T=t.gameInfoData)!=null&&T.Download.Baidu?(r(),l(s,{key:6},[n("h2",se,[n("a",pe,[n("span",null,[e[23]||(e[23]=o("Baidu Netdisk")),a(i,{text:"Only in Chinese",type:"danger"})])])]),n("p",null,[e[24]||(e[24]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Baidu},"click to enter",8,ge)])],64)):d("v-if",!0),(A=t.gameInfoData)!=null&&A.Download.Pan123?(r(),l(s,{key:7},[n("h2",me,[n("a",fe,[n("span",null,[e[25]||(e[25]=o("123Pan ")),a(i,{text:"Only in Chinese",type:"danger"})])])]),n("p",null,[e[26]||(e[26]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Pan123},"click to enter",8,he)])],64)):d("v-if",!0),(F=t.gameInfoData)!=null&&F.Download.Quark?(r(),l(s,{key:8},[n("h2",ue,[n("a",ke,[n("span",null,[e[27]||(e[27]=o("Quark ")),a(i,{text:"Only in Chinese",type:"danger"})])])]),n("p",null,[e[28]||(e[28]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Quark},"click to enter",8,we)])],64)):d("v-if",!0),(R=t.gameInfoData)!=null&&R.Download.Feijipan?(r(),l(s,{key:9},[n("h2",ye,[n("a",De,[n("span",null,[e[29]||(e[29]=o("LittlePlane ")),a(i,{text:"Only in Chinese",type:"danger"}),a(i,{text:"No login required",type:"info"})])])]),n("p",null,[e[30]||(e[30]=o("Download Link: ")),n("a",{href:t.gameInfoData.Download.Feijipan},"click to enter",8,ve)])],64)):d("v-if",!0)])}const Le=j(E,[["render",ce],["__file","index.html.vue"]]),Ne=JSON.parse('{"path":"/pt-BR/download/","title":"Download","lang":"pt-BR","frontmatter":{"title":"Download","index":false,"icon":"download","pageInfo":false,"breadcrumb":false,"sidebar":false,"comment":false,"category":["Download"],"description":"Importante For FAQs related to downloading and playing, please see , and for system requirements and recommended configurations, please see Avisos Please note: The download link...","head":[["link",{"rel":"alternate","hreflang":"en-us","href":"https://www.pvzge.com/en/download/"}],["link",{"rel":"alternate","hreflang":"ru-ru","href":"https://www.pvzge.com/ru-RU/download/"}],["link",{"rel":"alternate","hreflang":"zh-cn","href":"https://www.pvzge.com/download/"}],["meta",{"property":"og:url","content":"https://www.pvzge.com/pt-BR/download/"}],["meta",{"property":"og:site_name","content":"Site oficial do PvZ2 Gardendless | Uma experiência PVZ2 completamente remasterizada"}],["meta",{"property":"og:title","content":"Download"}],["meta",{"property":"og:description","content":"Importante For FAQs related to downloading and playing, please see , and for system requirements and recommended configurations, please see Avisos Please note: The download link..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"pt-BR"}],["meta",{"property":"og:locale:alternate","content":"en-US"}],["meta",{"property":"og:locale:alternate","content":"ru-RU"}],["meta",{"property":"og:locale:alternate","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-09-25T15:25:57.000Z"}],["meta",{"property":"article:modified_time","content":"2024-09-25T15:25:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Download\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-09-25T15:25:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"LMYY\\",\\"url\\":\\"https://gaozih.com\\"}]}"]]},"headers":[{"level":2,"title":"Changelog","slug":"changelog","link":"#changelog","children":[]},{"level":2,"title":"Github","slug":"github","link":"#github","children":[]},{"level":2,"title":"Onedrive Link","slug":"onedrive-link","link":"#onedrive-link","children":[]},{"level":2,"title":"MEGA Link","slug":"mega-link","link":"#mega-link","children":[]},{"level":2,"title":"TmpLink","slug":"tmplink","link":"#tmplink","children":[]},{"level":2,"title":"Baidu Netdisk","slug":"baidu-netdisk","link":"#baidu-netdisk","children":[]},{"level":2,"title":"123Pan","slug":"_123pan","link":"#_123pan","children":[]},{"level":2,"title":"Quark","slug":"quark","link":"#quark","children":[]},{"level":2,"title":"LittlePlane","slug":"littleplane","link":"#littleplane","children":[]}],"git":{"createdTime":1720715796000,"updatedTime":1727277957000,"contributors":[{"name":"Gzh0821","email":"gaozih0821@outlook.com","commits":1}]},"readingTime":{"minutes":1.97,"words":592},"filePathRelative":"pt-BR/download/README.md","localizedDate":"11 de julho de 2024","autoDesc":true}');export{Le as comp,Ne as data};