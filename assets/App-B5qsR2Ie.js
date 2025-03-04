import{e as B,o as f,g as a,r as n,k as t,l as g,x as h,h as c,t as r,f as F,F as E,m as T,S as N,y as O,n as A,z,U as Z,H as j}from"./app-JXFumixX.js";import{a as W}from"./formatPlants-DxR24t5O.js";import{u as R}from"./useDarkMode-_4eR6nnO.js";import{_ as H}from"./plugin-vue_export-helper-DlAUqK2U.js";import{t as q}from"./index-GI-35Kxc.js";const Q={title:"PvZ2 Gardendless 存档编辑器(测试版)","upload save":"上传存档","new save":"新建存档","clear save":"清空存档","save successfully":"保存成功","parse error":"文件解析失败","save to local":"保存到本地","empty description":"请上传存档或新建存档",worldKey:"钥匙",gem:"钻石",coin:"金币","unlocked worlds":"已解锁世界","basic resources":"基础资源","edit plants":"植物编辑","plant id":"植物 ID",locked:"未解锁",available:"可使用",unlocked:"已解锁",delete:"删除",add:"添加","world unlock":"世界解锁","world 1":"神秘埃及","world 2":"海盗海湾","world 3":"狂野西部","world 4":"遥远未来","world 5":"黑暗时代","world 6":"巨浪沙滩","world 7":"极寒冰窟","world 8":"遗落古城"},X={title:"PvZ2 Gardendless Save Editor(Beta)","upload save":"Upload Save","new save":"New Save","clear save":"Clear Save","save successfully":"Save successfully","parse error":"Failed to parse file","save to local":"Save to local","empty description":"Please upload a save or create a new one",worldKey:"World Key",gem:"Gem",coin:"Coin","unlocked worlds":"Unlocked Worlds","basic resources":"Basic Resources","edit plants":"Edit Plants","plant id":"Plant ID",locked:"Locked",available:"Available",unlocked:"Unlocked",delete:"Delete",add:"Add","world unlock":"World Unlock","world 1":"Ancient Egypt","world 2":"Pirate Seas","world 3":"Wild West","world 4":"Far Future","world 5":"Dark Ages","world 6":"Big Wave Beach","world 7":"Frostbite Caves","world 8":"Lost City"},J={zh:Q,en:X},K=8,Y={__name:"App",setup(G,{expose:o}){o();const S=R(),e=O("i18nLanguage","en"),C=W(e),L={pageSize:8,showSizeChanger:!1},{t:P,locale:u}=N({locale:e,fallbackLocale:"en",messages:J});u.value=e;const y={worldkey:0,gem:0,coin:0,obtainedPlants:[],worldProgress:Array.from({length:K},(d,v)=>({worldID:v+1,unlocked:!1}))},s=A({}),i=A({}),_=A(0),w=d=>{const v=new FileReader;return v.onload=k=>{try{const l=JSON.parse(k.target.result);s.value={...y,...l},i.value=Object.fromEntries(Object.entries(l).filter(([m])=>!(m in y)))}catch{j.error(P("parse error"))}},v.readAsText(d),!1},p=()=>{s.value={...y},i.value={}},x=()=>{s.value={},i.value={}},b=z(()=>s.value.obtainedPlants.findIndex(d=>d.plantID===_.value)),U={isDarkMode:S,i18nLanguage:e,plantMap:C,pagination:L,worldAmount:K,t:P,locale:u,defaultArchive:y,archiveData:s,otherData:i,selectPlantValue:_,handleUpload:w,newArchive:p,clearArchive:x,selectPlantIndex:b,addPlant:d=>{s.value.obtainedPlants.push({plantID:d,progress:0})},removePlant:d=>{s.value.obtainedPlants.splice(d,1)},saveArchive:()=>{s.value.obtainedPlants.sort((m,D)=>m.plantID-D.plantID),s.value.worldProgress.sort((m,D)=>m.worldID-D.worldID);const d={...s.value,...i.value},v=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),k=URL.createObjectURL(v),l=document.createElement("a");l.href=k,l.download="pp.json",l.click(),URL.revokeObjectURL(k),j.success(P("save successfully"))},ref:A,reactive:Z,computed:z,inject:O,get message(){return j},get theme(){return q},get useI18n(){return N},get getPlantIdMap(){return W},get useDarkMode(){return R},get i18nJson(){return J}};return Object.defineProperty(U,"__isScriptSetup",{enumerable:!1,value:!0}),U}},$=["src"],ee={class:"plant-title"};function ae(G,o,S,e,C,L){const P=n("a-config-provider"),u=n("a-button"),y=n("a-upload"),s=n("a-page-header"),i=n("a-divider"),_=n("a-input-number"),w=n("a-form-item"),p=n("a-col"),x=n("a-row"),b=n("a-flex"),I=n("a-select-option"),V=n("a-select"),M=n("a-checkbox"),U=n("a-form"),d=n("a-layout-content"),v=n("a-empty"),k=n("a-layout");return f(),B(E,null,[a(P,{theme:{token:{colorPrimary:"#aa6f42"},algorithm:e.isDarkMode?e.theme.darkAlgorithm:e.theme.defaultAlgorithm,components:{}}},null,8,["theme"]),a(k,null,{default:t(()=>[g(` <div style="
        display: flex;
        background-color: #ede5c4;
        border: 5px solid #432b1a;
        border-radius: 5px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      ">
            <p style="
          display: flex;
          font-family: 'pvzgFont';
          color: #432b1a;
          font-size: 24px;
          flex: auto;
          text-align: center;
          width: 100%;
          justify-content: center;
        ">
                存档编辑器
            </p>
            <div style="display: flex; gap: 10px; width: 100%;justify-content: center; margin: 10px;">
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary"> <upload-outlined /> 上传存档 </a-button>
                </a-upload>
                <a-button @click="newArchive">新建存档</a-button>
            </div>
        </div> `),a(s,{title:e.t("title"),style:{"font-family":"'pvzgFont'"}},{extra:t(()=>[a(y,{"before-upload":e.handleUpload,accept:".json",showUploadList:!1},{default:t(()=>[a(u,{type:"primary"},{default:t(()=>[c(r(e.t("upload save")),1)]),_:1})]),_:1}),a(u,{onClick:e.newArchive},{default:t(()=>[c(r(e.t("new save")),1)]),_:1}),a(u,{onClick:e.clearArchive,danger:""},{default:t(()=>[c(r(e.t("clear save")),1)]),_:1})]),_:1},8,["title"]),Object.keys(e.archiveData).length?(f(),h(d,{key:0,style:{padding:"20px"}},{default:t(()=>[a(U,{layout:"vertical"},{default:t(()=>[g(" 基础资源 "),a(i,{orientation:"left"},{default:t(()=>[c(r(e.t("basic resources")),1)]),_:1}),a(x,{gutter:16},{default:t(()=>[a(p,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(_,{"addon-before":e.t("worldKey"),value:e.archiveData.worldkey,"onUpdate:value":o[0]||(o[0]=l=>e.archiveData.worldkey=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(p,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(_,{"addon-before":e.t("gem"),value:e.archiveData.gem,"onUpdate:value":o[1]||(o[1]=l=>e.archiveData.gem=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(p,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(_,{"addon-before":e.t("coin"),value:e.archiveData.coin,"onUpdate:value":o[2]||(o[2]=l=>e.archiveData.coin=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1})]),_:1}),g(" 世界进度 "),g(` <a-form-item label="已解锁世界">
                    <a-checkbox-group v-model:value="unlockedWorlds">
                        <a-checkbox v-for="world in archiveData.worldProgress" :key="world.worldID"
                            :value="world.worldID">
                            世界 {{ world.worldID }}
                        </a-checkbox>
                    </a-checkbox-group>
                </a-form-item> `),g(" 已获得植物 "),g(` <a-form-item>
                    <a-table :dataSource="archiveData.obtainedPlants" :columns="plantColumns" bordered style="flex: 1;">
                            <template #bodyCell="{ column, record, index }">
                                <template v-if="column.key === 'progress'">
                                    <a-select v-model:value="record.progress" style="width: 100%">
                                        <a-select-option :value="0">未获得</a-select-option>
                                        <a-select-option :value="1">已获得未解锁</a-select-option>
                                        <a-select-option :value="2">已解锁</a-select-option>
                                    </a-select>
                                </template>
                                <template v-if="column.key === 'action'">
                                    <a-button danger @click="removePlant(index)">删除</a-button>
                                </template>
                            </template>
                    </a-table>
                    <a-button @click="addPlant" style="margin-top: 10px">
                        添加植物
                    </a-button>

                </a-form-item> `),a(i,{orientation:"left"},{default:t(()=>[c(r(e.t("edit plants")),1)]),_:1}),a(w,null,{default:t(()=>[a(b,{justify:"center"},{default:t(()=>[a(_,{"addon-before":e.t("plant id"),id:"inputNumber",value:e.selectPlantValue,"onUpdate:value":o[3]||(o[3]=l=>e.selectPlantValue=l),min:0},null,8,["addon-before","value"])]),_:1}),e.plantMap[e.selectPlantValue]?(f(),h(b,{key:0},{default:t(()=>[a(x,{gutter:16,align:"middle"},{default:t(()=>[a(p,{span:6},{default:t(()=>[F("img",{width:"900px",alt:"logo",src:"/assets/image/plants/plants_"+e.plantMap[e.selectPlantValue].codename+"_c.webp"},null,8,$)]),_:1}),a(p,{span:12},{default:t(()=>[F("p",ee,r(e.plantMap[e.selectPlantValue].name),1)]),_:1}),a(p,{span:6},{default:t(()=>[e.selectPlantIndex>=0?(f(),h(b,{key:0,gap:"small",wrap:"wrap",justify:"center"},{default:t(()=>[a(V,{value:e.archiveData.obtainedPlants[e.selectPlantIndex].progress,"onUpdate:value":o[4]||(o[4]=l=>e.archiveData.obtainedPlants[e.selectPlantIndex].progress=l),style:{width:"100%"}},{default:t(()=>[a(I,{value:0},{default:t(()=>[c(r(e.t("locked")),1)]),_:1}),a(I,{value:1},{default:t(()=>[c(r(e.t("available")),1)]),_:1}),a(I,{value:2},{default:t(()=>[c(r(e.t("unlocked")),1)]),_:1})]),_:1},8,["value"]),a(u,{danger:"",onClick:o[5]||(o[5]=l=>e.removePlant(e.selectPlantIndex))},{default:t(()=>[c(r(e.t("delete")),1)]),_:1})]),_:1})):(f(),h(b,{key:1,gap:"small",wrap:"wrap",justify:"center"},{default:t(()=>[a(u,{type:"primary",onClick:o[6]||(o[6]=l=>e.addPlant(e.selectPlantValue))},{default:t(()=>[c(r(e.t("add")),1)]),_:1})]),_:1}))]),_:1})]),_:1})]),_:1})):g("v-if",!0)]),_:1}),a(i,{orientation:"left"},{default:t(()=>[c(r(e.t("world unlock")),1)]),_:1}),a(x,null,{default:t(()=>[(f(!0),B(E,null,T(e.archiveData.worldProgress,(l,m)=>(f(),h(p,{key:l.worldID,span:6},{default:t(()=>[a(M,{checked:e.archiveData.worldProgress[m].unlocked,"onUpdate:checked":D=>e.archiveData.worldProgress[m].unlocked=D},{default:t(()=>[c(r(e.t("world "+l.worldID)),1)]),_:2},1032,["checked","onUpdate:checked"])]),_:2},1024))),128))]),_:1}),a(w),a(i),a(u,{type:"primary",onClick:e.saveArchive},{default:t(()=>[c(r(e.t("save to local")),1)]),_:1})]),_:1})]),_:1})):(f(),h(d,{key:1},{default:t(()=>[a(v,{description:e.t("empty description")},null,8,["description"])]),_:1}))]),_:1})],64)}const de=H(Y,[["render",ae],["__scopeId","data-v-19f546ce"],["__file","App.vue"]]);export{de as E};
