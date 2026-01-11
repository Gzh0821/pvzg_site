// @ts-nocheck
import { BaseDirectory, exists as t_exists, readTextFile as t_readTextFile, readDir as t_readDir } from "@tauri-apps/plugin-fs"
import { merge } from "lodash"
import { appLocalDataDir } from "@tauri-apps/api/path"
import JSON5 from "json5"
import { updateActivity } from "./tmpPatch"
import { openUrl as s_open } from "@tauri-apps/plugin-opener";
import { save as t_save } from "@tauri-apps/plugin-dialog";
import cloudSaver from "./cloudSavePatcher"

const gameVersion = import.meta.env.__APP_VERSION__
const patchBaseDir = BaseDirectory.AppLocalData
const gePatcher = {
    version: "0.3.2",
    _originalData: {},  // 存储原版JSON数据的备份
    _plantFeaturesPath: "patches\\jsons\\features\\PlantFeatures.json",
    _plantAlmanacPath: "patches\\jsons\\features\\PlantAlmanac.json",
    _plantPropsPath: "patches\\jsons\\features\\PlantProps.json",
    _plantTypesPath: "patches\\jsons\\features\\PlantTypes.json",

    _zombieFeaturesPath: "patches\\jsons\\features\\ZombieFeatures.json",
    _zombieAlmanacPath: "patches\\jsons\\features\\ZombieAlmanac.json",
    _zombiePropsPath: "patches\\jsons\\features\\ZombieProps.json",
    _zombieTypesPath: "patches\\jsons\\features\\ZombieTypes.json",

    _boardGridMapsPath: "patches\\jsons\\features\\BoardGridMaps.json",
    _gridItemPropsPath: "patches\\jsons\\features\\GridItemProps.json",
    _gridItemTypesPath: "patches\\jsons\\features\\GridItemTypes.json",

    _projectilePropsPath: "patches\\jsons\\features\\ProjectileProps.json",
    _projectileTypesPath: "patches\\jsons\\features\\ProjectileTypes.json",

    _upgradeFeaturesPath: "patches\\jsons\\features\\UpgradeFeatures.json",

    _propertySheetsPath: "patches\\jsons\\features\\PropertySheets.json",
    _narrativeListPath: "patches\\jsons\\features\\NarrativeList.json",

    _storePath: "patches\\jsons\\features\\StoreCommodityFeatures.json",
    _levelsPath: "patches\\jsons\\levels",

    async _checkKeys() {
        return true
    },
    async initBase() {
        if (!await this._checkKeys())
            return false

        if (!window.cc) {
            console.error("[GE Patcher] Failed to link the game engine!")
            return false
        }

        this._cc = window.cc
        this._assets = window.cc.assetManager.assets
        if (this._assets.count < 1000) {
            console.warn("[GE Patcher] Please wait for the game to load completely and retry!")
            return false
        }
        console.log("[GE Patcher] Assets number: " + this._assets.count)

        this._jsonAssetsList = Object.values(this._assets._map).filter(item =>
            typeof item === "object" && item.json)

        console.log("[GE Patcher] PvZ2 Gardendless patcher system loading...")
        console.log("[GE Patcher] Game Version: " + gameVersion)
        console.log("[GE Patcher] Patcher System Version: " + this.version)
        console.log("[GE Patcher] Run gePatcher.help() for more information")
    },
    async initPatchs() {
        await this._initFeatures(this._plantFeaturesPath, 'PlantFeatures', 'PLANTS');
        await this._initProps(this._plantAlmanacPath, 'PlantAlmanac')
        await this._initProps(this._plantPropsPath, 'PlantProps')
        await this._initProps(this._plantTypesPath, 'PlantTypes')

        await this._initFeatures(this._zombieFeaturesPath, 'ZombieFeatures', 'ZOMBIES');
        await this._initProps(this._zombieAlmanacPath, 'ZombieAlmanac')
        await this._initProps(this._zombiePropsPath, 'ZombieProps')
        await this._initProps(this._zombieTypesPath, 'ZombieTypes')

        await this._initProps(this._boardGridMapsPath, 'BoardGridMaps')
        if (await this._initProps(this._gridItemPropsPath, '_GridItemProps')) {
            console.warn("[GE Patcher] Warning: _GridItemProps is deprecated.")
        }

        if (await this._initProps(this._gridItemTypesPath, 'GridItemTypes')) {
            console.warn("[GE Patcher] Warning: GridItemTypes is deprecated.")
        }
        await this._initProps(this._projectilePropsPath, 'ProjectileProps')
        await this._initProps(this._projectileTypesPath, 'ProjectileTypes')

        await this._initFeatures(this._upgradeFeaturesPath, 'UpgradeFeatures', 'UPGRADES');

        await this._initProps(this._propertySheetsPath, 'PropertySheets')

        await this._initProps(this._narrativeListPath, 'NarrativeList')

        await this._initStore()
        await this._initLevels()

        await updateActivity("Using GE patcher " + this.version, "Playing version " + gameVersion)
        console.log("[GE Patcher] All patch file loaded successfully!")
    },
    async init() {
        await this.initBase()
        await this.initPatchs()
    },
    async _initFeatures(featuresPath, featureType, featureKey) {
        // 先检查game assets中是否存在该类型
        const originalFeaturesAsset = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == featureType))[0]
        if (!originalFeaturesAsset || !originalFeaturesAsset.json) {
            console.warn(`[GE Patcher] ${featureType} not found in game assets! Game may not be fully loaded.`);
            return;
        }

        // 备份原版数据（仅首次调用时）
        if (!this._originalData[featureType]) {
            this._originalData[featureType] = structuredClone(originalFeaturesAsset.json);
            console.log(`[GE Patcher] Saved original ${featureType} data`);
        }

        // 检查是否有mod文件
        if (await t_exists(featuresPath, { baseDir: patchBaseDir })) {
            console.log(`[GE Patcher] Start loading ${featureType}...`);
            try {
                const modFeatures = await t_readTextFile(featuresPath,
                    { baseDir: patchBaseDir });
                this[`_mod${featureType}Data`] = JSON5.parse(modFeatures);
            } catch (e) {
                console.error(`[GE Patcher] Failed to load ${featureType}, error: ` + e);
                return;
            }

            const originalFeatures = originalFeaturesAsset.json
            const modFeaturesData = this[`_mod${featureType}Data`];

            if (originalFeatures && modFeaturesData[featureKey]) {
                for (const feature of modFeaturesData[featureKey]) {
                    if (feature['CODENAME']) {
                        const index = originalFeatures[featureKey].findIndex(item => item?.['CODENAME'] === feature['CODENAME']);
                        if (index !== -1) {
                            originalFeatures[featureKey][index] = merge(originalFeatures[featureKey][index], feature);
                        } else {
                            originalFeatures[featureKey].push(feature);
                        }
                    }
                }
            }
            const additionalKeys = ['SEEDCHOOSERDEFAULTORDER', 'ALMANACHIDDENORDER', 'BASEUNLOCKLIST', 'SANDBOX'];
            for (const key of additionalKeys) {
                if (originalFeatures && modFeaturesData[key]) {
                    originalFeatures[key] = modFeaturesData[key];
                }
            }

            console.log(`[GE Patcher] ${featureType} loaded successfully!`);
        }
        else {
            console.log(`[GE Patcher] ${featureType} patch file not found, skipping...`);
        }
    },
    async _initProps(Path, Type) {
        // 先检查game assets中是否存在该类型
        const originalPropsAsset = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == Type))[0]
        if (!originalPropsAsset || !originalPropsAsset.json) {
            console.warn(`[GE Patcher] ${Type} not found in game assets! Game may not be fully loaded.`);
            return;
        }

        // 备份原版数据（仅首次调用时）
        if (!this._originalData[Type]) {
            this._originalData[Type] = structuredClone(originalPropsAsset.json);
            console.log(`[GE Patcher] Saved original ${Type} data`);
        }

        // 检查是否有mod文件
        if (await t_exists(Path, { baseDir: patchBaseDir })) {
            console.log(`[GE Patcher] Start loading ${Type}...`);
            try {
                const modProps = await t_readTextFile(Path,
                    { baseDir: patchBaseDir });
                this[`_mod${Type}Data`] = JSON5.parse(modProps);
            } catch (e) {
                console.error(`[GE Patcher] Failed to load ${Type}, error: ` + e);
                return;
            }

            const originalProps = originalPropsAsset.json
            const modPropsData = this[`_mod${Type}Data`];
            if (originalProps && modPropsData['objects']) {
                for (const obj of modPropsData['objects']) {
                    if (obj?.['aliases']?.[0]) {
                        const index = originalProps['objects'].findIndex(item => item?.['aliases']?.[0] === obj['aliases'][0]);
                        if (index !== -1) {
                            originalProps['objects'][index] = merge(originalProps['objects'][index], obj);
                        } else {
                            originalProps['objects'].push(obj);
                        }
                    }
                }
            }
            console.log(`[GE Patcher] ${Type} loaded successfully!`);
            return 1;
        }
        else {
            console.log(`[GE Patcher] ${Type} patch file not found, skipping...`);
            return 0;
        }
    },
    async setPropsData(Type, aliase, ...args) {
        if (this._jsonAssetsList == null) {
            console.error("[GE Patcher] Game assets not loaded! Please run gePatcher.init() first!")
            return;
        }
        const originalProps = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == Type))[0].json
        if (originalProps?.['objects']) {
            const index = originalProps['objects'].findIndex(item => item?.['aliases']?.[0] === aliase);
            if (index !== -1 && originalProps['objects'][index].objdata) {
                if (args.length == 2 && typeof args[0] === "string") {
                    originalProps['objects'][index].objdata[args[0]] = args[1];
                    console.log(`[GE Patcher] Set ${Type} ${aliase} ${args[0]} to ${args[1]}`);
                }
                else if (args.length == 1 && typeof args[0] === "object") {
                    originalProps['objects'][index].objdata = merge(originalProps['objects'][index].objdata, args[0]);
                    console.log(`[GE Patcher] Merged ${Type} ${aliase} objdata with ${JSON.stringify(args[0])}`);
                }
            }
        }
    },
    async _initStore() {
        // 先检查game assets中是否存在StoreCommodityFeatures
        const originalStore = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == 'StoreCommodityFeatures'))[0]
        if (!originalStore || !originalStore.json) {
            console.warn(`[GE Patcher] StoreCommodityFeatures not found in game assets! Game may not be fully loaded.`);
            return;
        }

        // 备份原版数据（仅首次调用时）
        if (!this._originalData['StoreCommodityFeatures']) {
            this._originalData['StoreCommodityFeatures'] = structuredClone(originalStore.json);
            console.log(`[GE Patcher] Saved original StoreCommodityFeatures data`);
        }

        // 检查是否有mod文件
        if (await t_exists(this._storePath, { baseDir: patchBaseDir })) {
            console.log(`[GE Patcher] Start loading store...`);
            try {
                const modFeatures = await t_readTextFile(this._storePath,
                    { baseDir: patchBaseDir });
                this[`_modStoreData`] = JSON5.parse(modFeatures);
            } catch (e) {
                console.error(`[GE Patcher] Failed to load Store, error: ` + e);
                return;
            }

            const modStoreData = this[`_modStoreData`];
            if (originalStore.json && modStoreData) {
                originalStore.json = { ...originalStore.json, ...modStoreData };
            }
            console.log(`[GE Patcher] Store load successfully!`);
        }
        else {
            console.log(`[GE Patcher] Store patch file not found, skipping...`);
        }
    },
    async _initLevels() {
        this._levelList = this._jsonAssetsList.filter(e => {
            return Array.isArray(e.json?.['objects']) &&
                e.json?.['objects'].find(e => e.objclass == 'LevelDefinition')
        })
        if (await t_exists(this._levelsPath, { baseDir: BaseDirectory.AppLocalData })) {
            let modLevelEntries;

            try {
                modLevelEntries = await t_readDir(this._levelsPath, { baseDir: BaseDirectory.AppLocalData });
                if (modLevelEntries.length == 0) {
                    console.log("[GE Patcher] No level files found in the levels folder!")
                    return false
                }
            }
            catch (e) {
                console.error("[GE Patcher] Failed to load levels, error: " + e);
                return false;
            }

            for (const modLevelFile of modLevelEntries) {
                if (!modLevelFile.isFile)
                    continue
                const modLevelName = modLevelFile.name
                const level = this._levelList.find(e => {
                    const tmp = e._name.toLowerCase()
                    return (tmp.endsWith('.json') ? tmp : tmp + '.json') == modLevelName.toLowerCase()
                })
                if (!level) {
                    console.log("[GE Patcher] Level file " + modLevelName + " not found in the game!")
                    continue
                }
                const modLevelPath = this._levelsPath + "\\" + modLevelName
                console.log("[GE Patcher] Start loading level " + modLevelName + "...")

                try {
                    const modLevelData = await t_readTextFile(modLevelPath,
                        { baseDir: patchBaseDir });
                    level.json = JSON5.parse(modLevelData);
                    console.log("[GE Patcher] Level " + modLevelName + " loaded successfully!")
                }
                catch (e) {
                    console.error("[GE Patcher] Failed to load level " + modLevelName + ", error: " + e);
                }
            }
            console.log("[GE Patcher] Levels loaded successfully!")
        }
    },
    async help() {
        if (!await this._checkKeys())
            return false

        const appLocalDataDirPath = await appLocalDataDir()
        
        console.log("[GE Patcher] ========================================")
        console.log("[GE Patcher] PvZ2 Gardendless Patcher v" + this.version)
        console.log("[GE Patcher] Game Version: " + gameVersion)
        console.log("[GE Patcher] ========================================")
        console.log("")
        console.log("[GE Patcher] Base Directory:")
        console.log("[GE Patcher]   " + appLocalDataDirPath + "\\patches")
        console.log("[GE Patcher]   Documentation: https://pvzge.com/en/guide/mod/")
        console.log("")
        console.log("[GE Patcher] BASIC COMMANDS:")
        console.log("[GE Patcher]   .init()                    - Initialize and load all patches")
        console.log("[GE Patcher]   .help()                    - Show this help")
        console.log("")
        console.log("[GE Patcher] GAME FUNCTIONS:")
        console.log("[GE Patcher]   .showLevels()              - List all level names")
        console.log("[GE Patcher]   .setFrameRate(fps)         - Change game frame rate")
        console.log("[GE Patcher]   .setPropsData(Type, alias, key, val)")
        console.log("[GE Patcher]   .setPropsData(Type, alias, {key: val, ...})")
        console.log("")
        console.log("[GE Patcher] DATA MANAGEMENT:")
        console.log("[GE Patcher]   .listOrigins()             - List saved original data")
        console.log("[GE Patcher]   .hasOrigin(Type)           - Check if backup exists")
        console.log("[GE Patcher]   .exportJson(Type, useOriginal, autoDownload)")
        console.log("[GE Patcher]   .restoreOriginal(Type)     - Restore one type")
        console.log("[GE Patcher]   .restoreAll()              - Restore all types")
        console.log("")
        console.log("[GE Patcher] SUPPORTED TYPES:")
        console.log("[GE Patcher]   PlantFeatures, PlantAlmanac, PlantProps, PlantTypes")
        console.log("[GE Patcher]   ZombieFeatures, ZombieAlmanac, ZombieProps, ZombieTypes")
        console.log("[GE Patcher]   BoardGridMaps, ProjectileProps, ProjectileTypes")
        console.log("[GE Patcher]   UpgradeFeatures, PropertySheets, NarrativeList, StoreCommodityFeatures")
        console.log("")
        console.log("[GE Patcher] USAGE EXAMPLES:")
        console.log("[GE Patcher]   gePatcher.init()")
        console.log("[GE Patcher]   gePatcher.setFrameRate(120)")
        console.log("[GE Patcher]   gePatcher.setPropsData('PlantProps', 'peashooter', 'PlantCost', 50)")
        console.log("[GE Patcher]   gePatcher.exportJson('PlantFeatures', true)")
        console.log("[GE Patcher]   gePatcher.restoreOriginal('PlantFeatures')")
        console.log("")
        console.log("[GE PATCHER] NOTES:")
        console.log("[GE Patcher]   - Original data auto-saved on first load")
        console.log("[GE Patcher]   - Level files: patches\\jsons\\levels\\")
        console.log("[GE Patcher]   - Feature files: patches\\jsons\\features\\")
        console.log("[GE Patcher]   - Beta version - features may change")
    },
    async showLevels() {
        if (!await this._checkKeys())
            return false
        if (!this._levelList) {
            console.log("[GE Patcher] Game Levels not loaded! Please run gePatcher.init() first!")
            return
        }
        const levels = this._levelList.map(e => e._name)
        console.log("[GE Patcher] Levels:" + levels)
    },
    async _hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },
    async setFrameRate(fps) {
        console.warn("[GE Patcher] Warning: Setting a custom frame rate may cause performance issues or crashes on some devices. Use with caution!")
        if (this._cc && this._cc.game && typeof fps === "number" && fps > 0) {
            this._cc.game.setFrameRate(fps)
            console.log("[GE Patcher] Set frame rate to " + fps)
        }
    },
    async listOrigins() {
        if (!await this._checkKeys())
            return false
        
        const originTypes = Object.keys(this._originalData);
        if (originTypes.length === 0) {
            console.log("[GE Patcher] No original data available. Run gePatcher.initPatchs() first.");
            return;
        }
        console.log("[GE Patcher] Saved original data types:");
        originTypes.forEach(type => {
            console.log("  - " + type);
        });
        console.log(`[GE Patcher] Total: ${originTypes.length} types saved`);
    },
    async hasOrigin(Type) {
        if (!await this._checkKeys())
            return false
        
        return !!this._originalData[Type];
    },
    async exportJson(Type, useOriginal = false, autoDownload = true) {
        if (!await this._checkKeys())
            return false
        
        if (!this._jsonAssetsList) {
            console.error("[GE Patcher] Game assets not loaded! Please run gePatcher.init() first!");
            return;
        }

        let jsonData;
        
        if (useOriginal) {
            // 导出原版数据
            if (!this._originalData[Type]) {
                console.error(`[GE Patcher] No original data found for ${Type}. It may not have been loaded yet.`);
                return;
            }
            jsonData = this._originalData[Type];
            console.log(`[GE Patcher] Exporting original ${Type} data...`);
        } else {
            // 导出当前数据
            const assetName = Type === 'StoreCommodityFeatures' ? 'StoreCommodityFeatures' : Type;
            const asset = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == assetName))[0];
            
            if (!asset || !asset.json) {
                console.error(`[GE Patcher] ${Type} not found in game assets!`);
                return;
            }
            jsonData = asset.json;
            console.log(`[GE Patcher] Exporting current ${Type} data...`);
        }

        // 格式化JSON字符串
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        if (autoDownload) {
            // 使用save对话框让用户下载
            try {
                const fileName = useOriginal ? `${Type}_original.json` : `${Type}.json`;
                const filePath = await t_save({
                    defaultPath: fileName,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                });
                
                if (filePath) {
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                    console.log(`[GE Patcher] ${Type} exported successfully to ${fileName}! (${jsonString.length} characters)`);
                } else {
                    console.log(`[GE Patcher] Export cancelled by user.`);
                }
            } catch (e) {
                console.error(`[GE Patcher] Failed to save file: ` + e);
                console.log("[GE Patcher] Falling back to console output...");
                console.log("[GE Patcher] ===== JSON Data Start =====");
                console.log(jsonString);
                console.log("[GE Patcher] ===== JSON Data End =====");
            }
        } else {
            // 仅输出到控制台
            console.log("[GE Patcher] ===== JSON Data Start =====");
            console.log(jsonString);
            console.log("[GE Patcher] ===== JSON Data End =====");
            console.log(`[GE Patcher] ${Type} data output to console! (${jsonString.length} characters)`);
        }
        
        return jsonString;
    },
    async restoreOriginal(Type) {
        if (!await this._checkKeys())
            return false
        
        if (!this._jsonAssetsList) {
            console.error("[GE Patcher] Game assets not loaded! Please run gePatcher.init() first!");
            return;
        }

        if (!this._originalData[Type]) {
            console.error(`[GE Patcher] No original data found for ${Type}. It may not have been loaded yet.`);
            return false;
        }

        // 查找对应的资源对象
        const assetName = Type === 'StoreCommodityFeatures' ? 'StoreCommodityFeatures' : Type;
        const asset = this._jsonAssetsList.filter((item => typeof item === "object" && item._name == assetName))[0];
        
        if (!asset) {
            console.error(`[GE Patcher] ${Type} not found in game assets!`);
            return false;
        }

        // 还原数据
        asset.json = structuredClone(this._originalData[Type]);
        console.log(`[GE Patcher] ${Type} restored to original data successfully!`);
        return true;
    },
    async restoreAll() {
        if (!await this._checkKeys())
            return false
        
        const originTypes = Object.keys(this._originalData);
        if (originTypes.length === 0) {
            console.log("[GE Patcher] No original data available to restore.");
            return;
        }

        console.log(`[GE Patcher] Restoring all original data (${originTypes.length} types)...`);
        let successCount = 0;
        let failCount = 0;

        for (const type of originTypes) {
            const result = await this.restoreOriginal(type);
            if (result) {
                successCount++;
            } else {
                failCount++;
            }
        }

        console.log(`[GE Patcher] Restore complete: ${successCount} succeeded, ${failCount} failed`);
    },
}

console.log("[GE Patcher] BaseDir: " + await appLocalDataDir())
console.log("[GE Patcher] For patcher system help, run gePatcher.help()")

window.gePatcher = gePatcher;

(async () => {
    try {
        await cloudSaver.init();
        
        // 挂载到全局
        window.cloudSaver = cloudSaver;
        
        console.log("[Cloud Saver] [OK] Cloud save module ready");
    } catch (error) {
        console.error("[Cloud Saver] [X] Initialization failed:", error);
    }
})();