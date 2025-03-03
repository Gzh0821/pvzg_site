import{c as F,o as m,b as a,r as n,g as t,h as g,n as h,d,t as r,a as E,F as N,i as G,J as O,q as z,j as C,u as W,K as T,z as S}from"./app-COGmRoa0.js";import{a as M}from"./formatPlants-DxR24t5O.js";import{_ as Z}from"./plugin-vue_export-helper-DlAUqK2U.js";import{t as q}from"./index-DDNJ5sBJ.js";const H={title:"PvZ2 Gardendless 存档编辑器(测试版)","upload save":"上传存档","new save":"新建存档","clear save":"清空存档","save successfully":"保存成功","parse error":"文件解析失败","save to local":"保存到本地","empty description":"请上传存档或新建存档",worldKey:"钥匙",gem:"钻石",coin:"金币","unlocked worlds":"已解锁世界","basic resources":"基础资源","edit plants":"植物编辑","plant id":"植物 ID",locked:"未解锁",available:"可使用",unlocked:"已解锁",delete:"删除",add:"添加","world unlock":"世界解锁","world 1":"神秘埃及","world 2":"海盗海湾","world 3":"狂野西部","world 4":"遥远未来","world 5":"黑暗时代","world 6":"巨浪沙滩","world 7":"极寒冰窟","world 8":"遗落古城"},Q={title:"PvZ2 Gardendless Save Editor(Beta)","upload save":"Upload Save","new save":"New Save","clear save":"Clear Save","save successfully":"Save successfully","parse error":"Failed to parse file","save to local":"Save to local","empty description":"Please upload a save or create a new one",worldKey:"World Key",gem:"Gem",coin:"Coin","unlocked worlds":"Unlocked Worlds","basic resources":"Basic Resources","edit plants":"Edit Plants","plant id":"Plant ID",locked:"Locked",available:"Available",unlocked:"Unlocked",delete:"Delete",add:"Add","world unlock":"World Unlock","world 1":"Ancient Egypt","world 2":"Pirate Seas","world 3":"Wild West","world 4":"Far Future","world 5":"Dark Ages","world 6":"Big Wave Beach","world 7":"Frostbite Caves","world 8":"Lost City"},R={zh:H,en:Q},J=8,X={__name:"App",setup(L,{expose:o}){o();const P=z("i18nLanguage","en"),e=M(P),V={pageSize:8,showSizeChanger:!1},{t:I,locale:A}=O({locale:P,fallbackLocale:"en",messages:R});A.value=P;const i={worldkey:0,gem:0,coin:0,obtainedPlants:[],worldProgress:Array.from({length:J},(s,p)=>({worldID:p+1,unlocked:!1}))},c=C({}),f=C({}),_=C(0),y=s=>{const p=new FileReader;return p.onload=b=>{try{const v=JSON.parse(b.target.result);c.value={...i,...v},f.value=Object.fromEntries(Object.entries(v).filter(([l])=>!(l in i)))}catch{S.error(I("parse error"))}},p.readAsText(s),!1},w=()=>{c.value={...i},f.value={}},u=()=>{c.value={},f.value={}},x=W(()=>c.value.obtainedPlants.findIndex(s=>s.plantID===_.value)),j={i18nLanguage:P,plantMap:e,pagination:V,worldAmount:J,t:I,locale:A,defaultArchive:i,archiveData:c,otherData:f,selectPlantValue:_,handleUpload:y,newArchive:w,clearArchive:u,selectPlantIndex:x,addPlant:s=>{c.value.obtainedPlants.push({plantID:s,progress:0})},removePlant:s=>{c.value.obtainedPlants.splice(s,1)},saveArchive:()=>{c.value.obtainedPlants.sort((l,k)=>l.plantID-k.plantID),c.value.worldProgress.sort((l,k)=>l.worldID-k.worldID);const s={...c.value,...f.value},p=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),b=URL.createObjectURL(p),v=document.createElement("a");v.href=b,v.download="pp.json",v.click(),URL.revokeObjectURL(b),S.success(I("save successfully"))},ref:C,reactive:T,computed:W,inject:z,get message(){return S},get theme(){return q},get useI18n(){return O},get getPlantIdMap(){return M},get i18nJson(){return R}};return Object.defineProperty(j,"__isScriptSetup",{enumerable:!1,value:!0}),j}},Y=["src"],$={class:"plant-title"};function ee(L,o,P,e,V,I){const A=n("a-config-provider"),i=n("a-button"),c=n("a-upload"),f=n("a-page-header"),_=n("a-divider"),y=n("a-input-number"),w=n("a-form-item"),u=n("a-col"),x=n("a-row"),D=n("a-flex"),U=n("a-select-option"),B=n("a-select"),j=n("a-checkbox"),s=n("a-form"),p=n("a-layout-content"),b=n("a-empty"),v=n("a-layout");return m(),F(N,null,[a(A,{theme:{token:{colorPrimary:"#aa6f42"},algorithm:L.$isDarkmode?e.theme.darkAlgorithm:e.theme.defaultAlgorithm,components:{}}},null,8,["theme"]),a(v,null,{default:t(()=>[g(` <div style="
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
        </div> `),a(f,{title:e.t("title"),style:{"font-family":"'pvzgFont'"}},{extra:t(()=>[a(c,{"before-upload":e.handleUpload,accept:".json",showUploadList:!1},{default:t(()=>[a(i,{type:"primary"},{default:t(()=>[d(r(e.t("upload save")),1)]),_:1})]),_:1}),a(i,{onClick:e.newArchive},{default:t(()=>[d(r(e.t("new save")),1)]),_:1}),a(i,{onClick:e.clearArchive,danger:""},{default:t(()=>[d(r(e.t("clear save")),1)]),_:1})]),_:1},8,["title"]),Object.keys(e.archiveData).length?(m(),h(p,{key:0,style:{padding:"20px"}},{default:t(()=>[a(s,{layout:"vertical"},{default:t(()=>[g(" 基础资源 "),a(_,{orientation:"left"},{default:t(()=>[d(r(e.t("basic resources")),1)]),_:1}),a(x,{gutter:16},{default:t(()=>[a(u,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(y,{"addon-before":e.t("worldKey"),value:e.archiveData.worldkey,"onUpdate:value":o[0]||(o[0]=l=>e.archiveData.worldkey=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(u,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(y,{"addon-before":e.t("gem"),value:e.archiveData.gem,"onUpdate:value":o[1]||(o[1]=l=>e.archiveData.gem=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(u,{span:8},{default:t(()=>[a(w,null,{default:t(()=>[a(y,{"addon-before":e.t("coin"),value:e.archiveData.coin,"onUpdate:value":o[2]||(o[2]=l=>e.archiveData.coin=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1})]),_:1}),g(" 世界进度 "),g(` <a-form-item label="已解锁世界">
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

                </a-form-item> `),a(_,{orientation:"left"},{default:t(()=>[d(r(e.t("edit plants")),1)]),_:1}),a(w,null,{default:t(()=>[a(D,{justify:"center"},{default:t(()=>[a(y,{"addon-before":e.t("plant id"),id:"inputNumber",value:e.selectPlantValue,"onUpdate:value":o[3]||(o[3]=l=>e.selectPlantValue=l),min:0},null,8,["addon-before","value"])]),_:1}),e.plantMap[e.selectPlantValue]?(m(),h(D,{key:0},{default:t(()=>[a(x,{gutter:16,align:"middle"},{default:t(()=>[a(u,{span:6},{default:t(()=>[E("img",{width:"900px",alt:"logo",src:"/assets/image/plants/plants_"+e.plantMap[e.selectPlantValue].codename+"_c.webp"},null,8,Y)]),_:1}),a(u,{span:12},{default:t(()=>[E("p",$,r(e.plantMap[e.selectPlantValue].name),1)]),_:1}),a(u,{span:6},{default:t(()=>[e.selectPlantIndex>=0?(m(),h(D,{key:0,gap:"small",wrap:"wrap",justify:"center"},{default:t(()=>[a(B,{value:e.archiveData.obtainedPlants[e.selectPlantIndex].progress,"onUpdate:value":o[4]||(o[4]=l=>e.archiveData.obtainedPlants[e.selectPlantIndex].progress=l),style:{width:"100%"}},{default:t(()=>[a(U,{value:0},{default:t(()=>[d(r(e.t("locked")),1)]),_:1}),a(U,{value:1},{default:t(()=>[d(r(e.t("available")),1)]),_:1}),a(U,{value:2},{default:t(()=>[d(r(e.t("unlocked")),1)]),_:1})]),_:1},8,["value"]),a(i,{danger:"",onClick:o[5]||(o[5]=l=>e.removePlant(e.selectPlantIndex))},{default:t(()=>[d(r(e.t("delete")),1)]),_:1})]),_:1})):(m(),h(D,{key:1,gap:"small",wrap:"wrap",justify:"center"},{default:t(()=>[a(i,{type:"primary",onClick:o[6]||(o[6]=l=>e.addPlant(e.selectPlantValue))},{default:t(()=>[d(r(e.t("add")),1)]),_:1})]),_:1}))]),_:1})]),_:1})]),_:1})):g("v-if",!0)]),_:1}),a(_,{orientation:"left"},{default:t(()=>[d(r(e.t("world unlock")),1)]),_:1}),a(x,null,{default:t(()=>[(m(!0),F(N,null,G(e.archiveData.worldProgress,(l,k)=>(m(),h(u,{key:l.worldID,span:6},{default:t(()=>[a(j,{checked:e.archiveData.worldProgress[k].unlocked,"onUpdate:checked":K=>e.archiveData.worldProgress[k].unlocked=K},{default:t(()=>[d(r(e.t("world "+l.worldID)),1)]),_:2},1032,["checked","onUpdate:checked"])]),_:2},1024))),128))]),_:1}),a(w),a(_),a(i,{type:"primary",onClick:e.saveArchive},{default:t(()=>[d(r(e.t("save to local")),1)]),_:1})]),_:1})]),_:1})):(m(),h(p,{key:1},{default:t(()=>[a(b,{description:e.t("empty description")},null,8,["description"])]),_:1}))]),_:1})],64)}const oe=Z(X,[["render",ee],["__scopeId","data-v-9062c724"],["__file","App.vue"]]);export{oe as E};
