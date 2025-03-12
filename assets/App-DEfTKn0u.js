import{v as z,S as R,y as K,n as B,z as G,H as I,e as L,o as u,g as a,r as o,k as l,l as m,x as _,h as c,t as d,f as O,F as M,m as J}from"./app-DyLk2yOl.js";import{a as T}from"./formatPlants-DxR24t5O.js";import{u as Z}from"./useDarkMode-BlU3pyjv.js";import{t as H}from"./index-yNp6j-ib.js";import{_ as q}from"./plugin-vue_export-helper-DlAUqK2U.js";const Q={title:"PvZ2 Gardendless 存档编辑器(测试版)","upload save":"上传存档","new save":"新建存档","clear save":"清空存档","save successfully":"保存成功","parse error":"文件解析失败","save to local":"保存到本地","empty description":"请上传存档或新建存档","old version warning":"警告：此存档可能为旧版本存档，请导入到最新版游戏后再导出最新存档",worldKey:"钥匙",gem:"钻石",coin:"金币","unlocked worlds":"已解锁世界","basic resources":"基础资源","edit plants":"植物编辑","plant id":"植物 ID",locked:"未解锁",available:"可使用",unlocked:"已解锁",delete:"删除",add:"添加","world unlock":"世界解锁","world 1":"神秘埃及","world 2":"海盗海湾","world 3":"狂野西部","world 4":"遥远未来","world 5":"黑暗时代","world 6":"巨浪沙滩","world 7":"极寒冰窟","world 8":"遗落古城"},X={title:"PvZ2 Gardendless Save Editor(Beta)","upload save":"Upload Save","new save":"New Save","clear save":"Clear Save","save successfully":"Save successfully","parse error":"Failed to parse file","save to local":"Save to local","empty description":"Please upload a save or create a new one","old version warning":"Warning: This save file may be from an old version. Please import it into the latest version of the game and then export the latest save file.",worldKey:"World Key",gem:"Gem",coin:"Coin","unlocked worlds":"Unlocked Worlds","basic resources":"Basic Resources","edit plants":"Edit Plants","plant id":"Plant ID",locked:"Locked",available:"Available",unlocked:"Unlocked",delete:"Delete",add:"Add","world unlock":"World Unlock","world 1":"Ancient Egypt","world 2":"Pirate Seas","world 3":"Wild West","world 4":"Far Future","world 5":"Dark Ages","world 6":"Big Wave Beach","world 7":"Frostbite Caves","world 8":"Lost City"},Y={zh:Q,en:X},N=8,$=z({__name:"App",setup(W,{expose:n}){n();const E=Z(),e=K("i18nLanguage","en"),j=T(e),S={pageSize:8,showSizeChanger:!1},{t:P,locale:p}=R({locale:e,fallbackLocale:"en",messages:Y});p.value=e;const y={worldkey:0,gem:0,coin:0,plantProps:{},worldProgress:Array.from({length:N},(i,s)=>({worldID:s+1,unlocked:!1}))},r=B({}),w=B({}),h=B(0),k=i=>{const s=new FileReader;return s.onload=b=>{try{const f=JSON.parse(b.target.result);r.value={...y,...f},w.value=Object.fromEntries(Object.entries(f).filter(([t])=>!(t in y)))}catch{I.error(P("parse error"))}},s.readAsText(i),!1},g=()=>{r.value={...y},w.value={}},v=()=>{r.value={},w.value={}},D=G(()=>r.value.obtainedPlants&&r.value.obtainedPlants.length>0),F={isDarkMode:E,i18nLanguage:e,plantMap:j,pagination:S,worldAmount:N,t:P,locale:p,defaultArchive:y,archiveData:r,otherData:w,selectPlantValue:h,handleUpload:k,newArchive:g,clearArchive:v,isOldArchive:D,addPlant:i=>{r.value.plantProps||(r.value.plantProps={}),r.value.plantProps[i]||(r.value.plantProps[i]={progress:0,tutorialLevel:0})},removePlant:i=>{var s;(s=r.value.plantProps)==null||delete s[i]},saveArchive:()=>{var t;(t=r.value.worldProgress)==null||t.sort((U,C)=>U.worldID-C.worldID);const i={...r.value,...w.value},s=new Blob([JSON.stringify(i,null,2)],{type:"application/json"}),b=URL.createObjectURL(s),f=document.createElement("a");f.href=b,f.download="pp.json",f.click(),URL.revokeObjectURL(b),I.success(P("save successfully"))},get theme(){return H}};return Object.defineProperty(F,"__isScriptSetup",{enumerable:!1,value:!0}),F}}),ee=["src"],ae={class:"plant-title"};function le(W,n,E,e,j,S){const P=o("a-config-provider"),p=o("a-button"),y=o("a-upload"),r=o("a-page-header"),w=o("a-alert"),h=o("a-divider"),k=o("a-input-number"),g=o("a-form-item"),v=o("a-col"),D=o("a-row"),x=o("a-flex"),A=o("a-select-option"),V=o("a-select"),F=o("a-checkbox"),i=o("a-form"),s=o("a-layout-content"),b=o("a-empty"),f=o("a-layout");return u(),L(M,null,[a(P,{theme:{token:{colorPrimary:"#aa6f42"},algorithm:e.isDarkMode?e.theme.darkAlgorithm:e.theme.defaultAlgorithm,components:{}}},null,8,["theme"]),a(f,null,{default:l(()=>[m(` <div style="
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
        </div> `),a(r,{title:e.t("title"),style:{"font-family":"'pvzgFont'"}},{extra:l(()=>[a(y,{"before-upload":e.handleUpload,accept:".json",showUploadList:!1},{default:l(()=>[a(p,{type:"primary"},{default:l(()=>[c(d(e.t("upload save")),1)]),_:1})]),_:1}),a(p,{onClick:e.newArchive},{default:l(()=>[c(d(e.t("new save")),1)]),_:1}),a(p,{onClick:e.clearArchive,danger:""},{default:l(()=>[c(d(e.t("clear save")),1)]),_:1})]),_:1},8,["title"]),Object.keys(e.archiveData).length?(u(),_(s,{key:0,style:{padding:"20px"}},{default:l(()=>[e.isOldArchive?(u(),_(w,{key:0,message:e.t("old version warning"),type:"warning"},null,8,["message"])):m("v-if",!0),a(i,{layout:"vertical"},{default:l(()=>[m(" 基础资源 "),a(h,{orientation:"left"},{default:l(()=>[c(d(e.t("basic resources")),1)]),_:1}),a(D,{gutter:16},{default:l(()=>[a(v,{span:8},{default:l(()=>[a(g,null,{default:l(()=>[a(k,{"addon-before":e.t("worldKey"),value:e.archiveData.worldkey,"onUpdate:value":n[0]||(n[0]=t=>e.archiveData.worldkey=t),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(v,{span:8},{default:l(()=>[a(g,null,{default:l(()=>[a(k,{"addon-before":e.t("gem"),value:e.archiveData.gem,"onUpdate:value":n[1]||(n[1]=t=>e.archiveData.gem=t),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(v,{span:8},{default:l(()=>[a(g,null,{default:l(()=>[a(k,{"addon-before":e.t("coin"),value:e.archiveData.coin,"onUpdate:value":n[2]||(n[2]=t=>e.archiveData.coin=t),min:0},null,8,["addon-before","value"])]),_:1})]),_:1})]),_:1}),m(" 世界进度 "),m(` <a-form-item label="已解锁世界">
                    <a-checkbox-group v-model:value="unlockedWorlds">
                        <a-checkbox v-for="world in archiveData.worldProgress" :key="world.worldID"
                            :value="world.worldID">
                            世界 {{ world.worldID }}
                        </a-checkbox>
                    </a-checkbox-group>
                </a-form-item> `),m(" 已获得植物 "),m(` <a-form-item>
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

                </a-form-item> `),a(h,{orientation:"left"},{default:l(()=>[c(d(e.t("edit plants")),1)]),_:1}),a(g,null,{default:l(()=>[a(x,{justify:"center"},{default:l(()=>[a(k,{"addon-before":e.t("plant id"),id:"inputNumber",value:e.selectPlantValue,"onUpdate:value":n[3]||(n[3]=t=>e.selectPlantValue=t),min:0},null,8,["addon-before","value"])]),_:1}),e.plantMap[e.selectPlantValue]?(u(),_(x,{key:0},{default:l(()=>[a(D,{gutter:16,align:"middle"},{default:l(()=>[a(v,{span:6},{default:l(()=>[O("img",{width:"900px",alt:"logo",src:"/assets/image/plants/plants_"+e.plantMap[e.selectPlantValue].codename+"_c.webp"},null,8,ee)]),_:1}),a(v,{span:12},{default:l(()=>[O("p",ae,d(e.plantMap[e.selectPlantValue].name),1)]),_:1}),a(v,{span:6},{default:l(()=>[e.archiveData.plantProps&&e.archiveData.plantProps[e.selectPlantValue]?(u(),_(x,{key:0,gap:"small",wrap:"wrap",justify:"center"},{default:l(()=>[a(V,{value:e.archiveData.plantProps[e.selectPlantValue].progress,"onUpdate:value":n[4]||(n[4]=t=>e.archiveData.plantProps[e.selectPlantValue].progress=t),style:{width:"100%"}},{default:l(()=>[a(A,{value:0},{default:l(()=>[c(d(e.t("locked")),1)]),_:1}),a(A,{value:1},{default:l(()=>[c(d(e.t("available")),1)]),_:1}),a(A,{value:2},{default:l(()=>[c(d(e.t("unlocked")),1)]),_:1})]),_:1},8,["value"]),a(p,{danger:"",onClick:n[5]||(n[5]=t=>e.removePlant(e.selectPlantValue))},{default:l(()=>[c(d(e.t("delete")),1)]),_:1})]),_:1})):(u(),_(x,{key:1,gap:"small",wrap:"wrap",justify:"center"},{default:l(()=>[a(p,{type:"primary",onClick:n[6]||(n[6]=t=>e.addPlant(e.selectPlantValue))},{default:l(()=>[c(d(e.t("add")),1)]),_:1})]),_:1}))]),_:1})]),_:1})]),_:1})):m("v-if",!0)]),_:1}),a(h,{orientation:"left"},{default:l(()=>[c(d(e.t("world unlock")),1)]),_:1}),e.archiveData.worldProgress?(u(),_(D,{key:0},{default:l(()=>[(u(!0),L(M,null,J(e.archiveData.worldProgress,(t,U)=>(u(),_(v,{key:t.worldID,span:6},{default:l(()=>[a(F,{checked:e.archiveData.worldProgress[U].unlocked,"onUpdate:checked":C=>e.archiveData.worldProgress[U].unlocked=C},{default:l(()=>[c(d(e.t("world "+t.worldID)),1)]),_:2},1032,["checked","onUpdate:checked"])]),_:2},1024))),128))]),_:1})):m("v-if",!0),a(g),a(h),a(p,{type:"primary",onClick:e.saveArchive},{default:l(()=>[c(d(e.t("save to local")),1)]),_:1})]),_:1})]),_:1})):(u(),_(s,{key:1},{default:l(()=>[a(b,{description:e.t("empty description")},null,8,["description"])]),_:1}))]),_:1})],64)}const ce=q($,[["render",le],["__scopeId","data-v-668af82f"],["__file","App.vue"]]);export{ce as E};
