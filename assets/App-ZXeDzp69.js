import{v as z,S as K,y as G,n as E,z as J,H as M,e as j,o as v,g as a,r as t,k as o,l as f,x as w,h as c,t as r,f as N,F as L,m as T}from"./app-DSQE7OEZ.js";import{a as Z}from"./formatPlants-i0VKITDM.js";import{u as H}from"./useDarkMode-C1eEPxEJ.js";import{t as q}from"./index-B0XIbJxU.js";import{_ as Q}from"./plugin-vue_export-helper-DlAUqK2U.js";const X={title:"PvZ2 Gardendless 存档编辑器(测试版)","upload save":"上传存档","new save":"新建存档","clear save":"清空存档","save successfully":"保存成功","parse error":"文件解析失败","save to local":"保存到本地","empty description":"请上传存档或新建存档","old version warning":"警告：此存档可能为旧版本存档，请导入到最新版游戏后再导出最新存档",worldKey:"钥匙",gem:"钻石",coin:"金币","unlocked worlds":"已解锁世界","basic resources":"基础资源","edit plants":"植物编辑","plant id":"植物 ID",locked:"未解锁",available:"可使用",unlocked:"已解锁",delete:"删除",add:"添加","world unlock":"世界解锁","world 0":"世界选择器","world 1":"神秘埃及","world 2":"海盗海湾","world 3":"狂野西部","world 4":"遥远未来","world 5":"黑暗时代","world 6":"巨浪沙滩","world 7":"极寒冰窟","world 8":"遗落古城","world 9":"史诗关卡"},Y={title:"PvZ2 Gardendless Save Editor(Beta)","upload save":"Upload Save","new save":"New Save","clear save":"Clear Save","save successfully":"Save successfully","parse error":"Failed to parse file","save to local":"Save to local","empty description":"Please upload a save or create a new one","old version warning":"Warning: This save file may be from an old version. Please import it into the latest version of the game and then export the latest save file.",worldKey:"World Key",gem:"Gem",coin:"Coin","unlocked worlds":"Unlocked Worlds","basic resources":"Basic Resources","edit plants":"Edit Plants","plant id":"Plant ID",locked:"Locked",available:"Available",unlocked:"Unlocked",delete:"Delete",add:"Add","world unlock":"World Unlock","world 0":"World Chooser","world 1":"Ancient Egypt","world 2":"Pirate Seas","world 3":"Wild West","world 4":"Far Future","world 5":"Dark Ages","world 6":"Big Wave Beach","world 7":"Frostbite Caves","world 8":"Lost City","world 9":"Epic Levels"},$={zh:X,en:Y},I=10,U="0.2.7",ee=z({__name:"App",setup(R,{expose:n}){n();const S=H(),e=G("i18nLanguage","en"),O=Z(e),{t:x,locale:A}=K({locale:e,fallbackLocale:"en",messages:$});A.value=e;const s={worldkey:0,gem:0,coin:0,plantProps:{},worldProps:{...Object.fromEntries(Array.from({length:I},(p,i)=>[i,{unlocked:!1,wmx:0}])),currentWM:0,worldChooserPos:1},version:U};console.log(s);const d=E({}),y=E({}),B=E(0),u=E(""),k=p=>{const i=new FileReader;return i.onload=h=>{try{const m=JSON.parse(h.target.result);u.value=m.version,console.log(u),d.value={...s,...m},y.value=Object.fromEntries(Object.entries(m).filter(([l])=>!(l in s)))}catch{M.error(x("parse error"))}},i.readAsText(p),!1},g=()=>{d.value={...s},u.value=U,y.value={}},_=()=>{d.value={},y.value={}},P=J(()=>u.value?u.value!==U:!0),C={isDarkMode:S,i18nLanguage:e,plantMap:O,worldAmount:I,gameVersion:U,t:x,locale:A,defaultArchive:s,archiveData:d,otherData:y,selectPlantValue:B,uploadVersion:u,handleUpload:k,newArchive:g,clearArchive:_,isOldArchive:P,addPlant:p=>{d.value.plantProps||(d.value.plantProps={}),d.value.plantProps[p]||(d.value.plantProps[p]={progress:0,tutorialLevel:0,costume:-1,costumes:[]})},removePlant:p=>{var i;(i=d.value.plantProps)==null||delete i[p]},saveArchive:()=>{var l;(l=d.value.worldProgress)==null||l.sort((b,V)=>b.worldID-V.worldID);const p={...d.value,...y.value},i=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),h=URL.createObjectURL(i),m=document.createElement("a");m.href=h,m.download="pp.json",m.click(),URL.revokeObjectURL(h),M.success(x("save successfully"))},get theme(){return q}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}}),ae=["src"],oe={class:"plant-title"};function le(R,n,S,e,O,x){const A=t("a-config-provider"),s=t("a-button"),d=t("a-upload"),y=t("a-page-header"),B=t("a-alert"),u=t("a-divider"),k=t("a-input-number"),g=t("a-form-item"),_=t("a-col"),P=t("a-row"),D=t("a-flex"),F=t("a-select-option"),W=t("a-select"),C=t("a-checkbox"),p=t("a-form"),i=t("a-layout-content"),h=t("a-empty"),m=t("a-layout");return v(),j(L,null,[a(A,{theme:{token:{colorPrimary:"#aa6f42"},algorithm:e.isDarkMode?e.theme.darkAlgorithm:e.theme.defaultAlgorithm,components:{}}},null,8,["theme"]),a(m,null,{default:o(()=>[f(` <div style="
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
        </div> `),a(y,{title:e.t("title"),"sub-title":e.gameVersion,style:{"font-family":"'pvzgFont'"}},{extra:o(()=>[a(d,{"before-upload":e.handleUpload,accept:".json",showUploadList:!1},{default:o(()=>[a(s,{type:"primary"},{default:o(()=>[c(r(e.t("upload save")),1)]),_:1})]),_:1}),a(s,{onClick:e.newArchive},{default:o(()=>[c(r(e.t("new save")),1)]),_:1}),a(s,{onClick:e.clearArchive,danger:""},{default:o(()=>[c(r(e.t("clear save")),1)]),_:1})]),_:1},8,["title"]),Object.keys(e.archiveData).length?(v(),w(i,{key:0,style:{padding:"20px"}},{default:o(()=>[e.isOldArchive?(v(),w(B,{key:0,message:e.t("old version warning"),type:"warning"},null,8,["message"])):f("v-if",!0),a(p,{layout:"vertical"},{default:o(()=>[f(" 基础资源 "),a(u,{orientation:"left"},{default:o(()=>[c(r(e.t("basic resources")),1)]),_:1}),a(P,{gutter:16},{default:o(()=>[a(_,{span:8},{default:o(()=>[a(g,null,{default:o(()=>[a(k,{"addon-before":e.t("worldKey"),value:e.archiveData.worldkey,"onUpdate:value":n[0]||(n[0]=l=>e.archiveData.worldkey=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(_,{span:8},{default:o(()=>[a(g,null,{default:o(()=>[a(k,{"addon-before":e.t("gem"),value:e.archiveData.gem,"onUpdate:value":n[1]||(n[1]=l=>e.archiveData.gem=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1}),a(_,{span:8},{default:o(()=>[a(g,null,{default:o(()=>[a(k,{"addon-before":e.t("coin"),value:e.archiveData.coin,"onUpdate:value":n[2]||(n[2]=l=>e.archiveData.coin=l),min:0},null,8,["addon-before","value"])]),_:1})]),_:1})]),_:1}),f(" 世界进度 "),f(` <a-form-item label="已解锁世界">
                    <a-checkbox-group v-model:value="unlockedWorlds">
                        <a-checkbox v-for="world in archiveData.worldProgress" :key="world.worldID"
                            :value="world.worldID">
                            世界 {{ world.worldID }}
                        </a-checkbox>
                    </a-checkbox-group>
                </a-form-item> `),f(" 已获得植物 "),f(` <a-form-item>
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

                </a-form-item> `),a(u,{orientation:"left"},{default:o(()=>[c(r(e.t("edit plants")),1)]),_:1}),a(g,null,{default:o(()=>[a(D,{justify:"center"},{default:o(()=>[a(k,{"addon-before":e.t("plant id"),id:"inputNumber",value:e.selectPlantValue,"onUpdate:value":n[3]||(n[3]=l=>e.selectPlantValue=l),min:0},null,8,["addon-before","value"])]),_:1}),e.plantMap[e.selectPlantValue]?(v(),w(D,{key:0},{default:o(()=>[a(P,{gutter:16,align:"middle"},{default:o(()=>[a(_,{span:6},{default:o(()=>[N("img",{width:"900px",alt:"logo",src:"/assets/image/plants/plants_"+e.plantMap[e.selectPlantValue].codename+"_c.webp"},null,8,ae)]),_:1}),a(_,{span:12},{default:o(()=>[N("p",oe,r(e.plantMap[e.selectPlantValue].name),1)]),_:1}),a(_,{span:6},{default:o(()=>[e.archiveData.plantProps&&e.archiveData.plantProps[e.selectPlantValue]?(v(),w(D,{key:0,gap:"small",wrap:"wrap",justify:"center"},{default:o(()=>[a(W,{value:e.archiveData.plantProps[e.selectPlantValue].progress,"onUpdate:value":n[4]||(n[4]=l=>e.archiveData.plantProps[e.selectPlantValue].progress=l),style:{width:"100%"}},{default:o(()=>[a(F,{value:0},{default:o(()=>[c(r(e.t("locked")),1)]),_:1}),a(F,{value:1},{default:o(()=>[c(r(e.t("available")),1)]),_:1}),a(F,{value:2},{default:o(()=>[c(r(e.t("unlocked")),1)]),_:1})]),_:1},8,["value"]),a(s,{danger:"",onClick:n[5]||(n[5]=l=>e.removePlant(e.selectPlantValue))},{default:o(()=>[c(r(e.t("delete")),1)]),_:1})]),_:1})):(v(),w(D,{key:1,gap:"small",wrap:"wrap",justify:"center"},{default:o(()=>[a(s,{type:"primary",onClick:n[6]||(n[6]=l=>e.addPlant(e.selectPlantValue))},{default:o(()=>[c(r(e.t("add")),1)]),_:1})]),_:1}))]),_:1})]),_:1})]),_:1})):f("v-if",!0)]),_:1}),a(u,{orientation:"left"},{default:o(()=>[c(r(e.t("world unlock")),1)]),_:1}),e.archiveData.worldProps?(v(),w(P,{key:0},{default:o(()=>[(v(!0),j(L,null,T(e.archiveData.worldProps,(l,b)=>(v(),j(L,{key:b},[l.hasOwnProperty("unlocked")?(v(),w(_,{key:0,span:6},{default:o(()=>[a(C,{checked:e.archiveData.worldProps[b].unlocked,"onUpdate:checked":V=>e.archiveData.worldProps[b].unlocked=V},{default:o(()=>[c(r(e.t("world "+b)),1)]),_:2},1032,["checked","onUpdate:checked"])]),_:2},1024)):f("v-if",!0)],64))),128))]),_:1})):f("v-if",!0),a(g),a(u),a(s,{type:"primary",onClick:e.saveArchive},{default:o(()=>[c(r(e.t("save to local")),1)]),_:1})]),_:1})]),_:1})):(v(),w(i,{key:1},{default:o(()=>[a(h,{description:e.t("empty description")},null,8,["description"])]),_:1}))]),_:1})],64)}const se=Q(ee,[["render",le],["__scopeId","data-v-90ba2dae"],["__file","App.vue"]]);export{se as E};
