<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#aa6f42'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }"></a-config-provider>
    <div class="keybind-editor-container">
        <a-typography-title :level="2" class="title">{{ t('title') }}</a-typography-title>
        <a-typography-title :level="5">{{ t('gameVersion', { version: gameVersion }) }}</a-typography-title>
        <a-typography-paragraph>
            <span v-html="t('instructions')"></span>
        </a-typography-paragraph>

        <a-form :model="keybinds" layout="vertical">
            <a-form-item>
                <a-space wrap>
                    <a-button type="primary" size="large" @click="saveKeybinds">
                        <template #icon><save-outlined /></template>
                        {{ t('saveConfig') }}
                    </a-button>
                    <a-button size="large" @click="uploadKeybinds">
                        <template #icon><upload-outlined /></template>
                        {{ t('uploadKeybinds') }}
                    </a-button>
                    <a-button size="large" @click="newDefaultKeybinds">
                        <template #icon><file-add-outlined /></template>
                        {{ t('newDefaultKeybinds') }}
                    </a-button>
                    <a-button size="large" @click="revertChanges">
                        <template #icon><undo-outlined /></template>
                        {{ t('revertChanges') }}
                    </a-button>
                </a-space>
            </a-form-item>
            <a-divider />
            <a-row :gutter="[16, 24]">
                <a-col v-for="(_value, action) in displayableKeybinds" :key="action" :xs="24" :sm="12" :md="8">
                    <a-form-item :label="formatActionName(action)">
                        <a-input-group compact style="display: flex;">
                            <a-input :value="getFriendlyKeyCode(keybinds[action])" :placeholder="t('restoreDefault')"
                                read-only @click="startBinding(action)" :class="{
                                    'binding-active': bindingAction === action,
                                    'keybind-modified': isKeybindModified(action)
                                }" class="keybind-input" />
                            <a-button @click.stop="resetToDefault(action)" :title="t('restoreDefault')">
                                <template #icon><delete-outlined /></template>
                            </a-button>
                        </a-input-group>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>

        <a-modal v-model:open="isBinding" :title="t('pressKeyPrompt')" :closable="false" :footer="null"
            @cancel="cancelBinding" centered width="300px">
            <div class="binding-modal-content">
                <p>{{ t('bindingNewKeyFor', { action: formatActionName(bindingAction) }) }}</p>
                <p class="key-prompt">{{ t('pressAnyKey') }}</p>
                <p><small>{{ t('pressEscToCancel') }}</small></p>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, reactive, inject, watch } from 'vue';
import { message, theme } from 'ant-design-vue';
import { DeleteOutlined, SaveOutlined, ReloadOutlined, UploadOutlined, FileAddOutlined, UndoOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';

import initialKeybindsFromFile from './KeyBinds.json';
import versionJson from '../version.json';

// 动态导入所有语言文件
const messages = Object.fromEntries(
    Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
        .map(([key, value]) => {
            const match = key.match(/\/([a-zA-Z-]+)\.json$/);
            if (!match) return [null, null];
            const locale = match[1];
            return [locale, (value as any).default];
        })
        .filter(([locale]) => locale)
);

const i18nLanguage = inject('i18nLanguage', 'en');
const gameVersion = versionJson.gameVersion;

const emptyKeybinds = initialKeybindsFromFile
// Store the original uploaded file content if a file is uploaded
const uploadedKeybindsContent = ref<Record<string, string> | null>(null);
// Store the state of keybinds at the beginning of the session or after an upload/new
const sessionInitialKeybinds = reactive<Record<string, string>>({ ...initialKeybindsFromFile });

const keybinds = reactive<Record<string, string>>({ ...initialKeybindsFromFile });
const bindingAction = ref<string | null>(null);
const isBinding = ref(false);

const { t, locale } = useI18n({
    locale: i18nLanguage,
    fallbackLocale: 'en',
    messages
});
locale.value = i18nLanguage;

// displayableKeybinds will only contain keys present in initialKeybindsFromFile (KeyBinds.json)
const displayableKeybinds = computed(() => {
    const filtered: Record<string, string> = {};
    for (const key in initialKeybindsFromFile) {
        if (key !== '__KeyCodeList__') {
            filtered[key] = keybinds[key] || ''; // Ensure the key exists in current keybinds
        }
    }
    return filtered;
});

// Watch for changes in initialKeybindsFromFile to update sessionInitialKeybinds if needed,
// though initialKeybindsFromFile itself is static after import.
// More importantly, update sessionInitialKeybinds upon explicit actions like upload or new.

// watch(initialKeybindsFromFile, (newInitial) => {
//     Object.keys(sessionInitialKeybinds).forEach(key => delete sessionInitialKeybinds[key]);
//     Object.assign(sessionInitialKeybinds, newInitial);
// }, { deep: true, immediate: true });


const formatActionName = (action: string | null): string | undefined => {
    // return action?.replace(/_/g, ' ');
    return t(`actions.${action}`, action ? action.replace(/_/g, ' ') : '');
};

const getFriendlyKeyCode = (keyCode: string): string => {
    if (!keyCode) return '';
    return t(`keybinds.${keyCode}`, keyCode);
};

const getCocosKeyCode = (event: KeyboardEvent): string => {
    if (['Meta', 'Control', 'Shift', 'Alt'].includes(event.key)) {
        return '';
    }
    if (event.code.startsWith('Key')) return `KEY_${event.code.slice(3)}`;
    if (event.code.startsWith('Digit')) return `DIGIT_${event.code.slice(5)}`;
    if (event.code.startsWith('Arrow')) return `ARROW_${event.key.replace('Arrow', '').toUpperCase()}`;
    if (event.code.startsWith('Numpad')) {
        if (event.code === 'NumpadEnter') return 'NUM_ENTER';
        if (event.code === 'NumpadMultiply') return 'NUM_MULTIPLY';
        if (event.code === 'NumpadAdd') return 'NUM_PLUS';
        if (event.code === 'NumpadSubtract') return 'NUM_SUBTRACT';
        if (event.code === 'NumpadDecimal') return 'NUM_DECIMAL';
        if (event.code === 'NumpadDivide') return 'NUM_DIVIDE';
        const numMatch = event.code.match(/Numpad(\d)/);
        if (numMatch && numMatch[1]) {
            return `NUM_${numMatch[1]}`;
        }
    }
    const specialKeys: Record<string, string> = {
        'Space': 'SPACE', 'Enter': 'ENTER', 'Backspace': 'BACKSPACE',
        'Tab': 'TAB', 'Backquote': 'BACK_QUOTE', 'AltLeft': 'ALT_LEFT',
        'AltRight': 'ALT_RIGHT', 'ShiftLeft': 'SHIFT_LEFT', 'ShiftRight': 'SHIFT_RIGHT',
        'ControlLeft': 'CONTROL_LEFT', 'ControlRight': 'CONTROL_RIGHT', 'Escape': 'ESCAPE',
        'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
        'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
        'Pause': 'PAUSE', 'CapsLock': 'CAPS_LOCK', 'PageUp': 'PAGE_UP', 'PageDown': 'PAGE_DOWN',
        'End': 'END', 'Home': 'HOME', 'Insert': 'INSERT', 'Delete': 'DELETE',
        'NumLock': 'NUM_LOCK', 'ScrollLock': 'SCROLL_LOCK',
        'Semicolon': 'SEMICOLON', 'Equal': 'EQUAL', 'Comma': 'COMMA', 'Minus': 'DASH',
        'Period': 'PERIOD', 'Slash': 'SLASH', 'BracketLeft': 'BRACKET_LEFT',
        'Backslash': 'BACKSLASH', 'BracketRight': 'BRACKET_RIGHT', 'Quote': 'QUOTE'
    };
    return specialKeys[event.code] || event.code.toUpperCase();
}

const isKeybindModified = (action: string): boolean => {
    // Compare with initialKeybindsFromFile (KeyBinds.json)
    return initialKeybindsFromFile[action as keyof typeof initialKeybindsFromFile] !== keybinds[action];
};

const handleKeyDown = (event: KeyboardEvent) => {
    if (!bindingAction.value) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') {
        cancelBinding();
        return;
    }
    const newKeyCode = getCocosKeyCode(event);
    if (!newKeyCode) {
        message.warning(t('cannotBindModifier'));
        return;
    }
    for (const action in displayableKeybinds.value) {
        if (keybinds[action] === newKeyCode && action !== bindingAction.value) {
            message.warning(t('keyAlreadyBound', { key: getFriendlyKeyCode(newKeyCode), action: formatActionName(action) }));
        }
    }
    keybinds[bindingAction.value] = newKeyCode;
    bindingAction.value = null;
    isBinding.value = false;
};

const startBinding = (action: string) => {
    bindingAction.value = action;
    isBinding.value = true;
};

const cancelBinding = () => {
    bindingAction.value = null;
    isBinding.value = false;
};

const resetToDefault = (action: string) => {
    if (bindingAction.value === action) {
        cancelBinding();
    }
    // Reset to the value from the original KeyBinds.json
    keybinds[action] = initialKeybindsFromFile[action as keyof typeof initialKeybindsFromFile] || '';
    // message.success(t('restoredToDefault', { action: formatActionName(action) }));
};

const revertChanges = () => {
    // Revert to sessionInitialKeybinds
    Object.keys(keybinds).forEach(key => delete keybinds[key]);
    Object.assign(keybinds, sessionInitialKeybinds);
    // If there was an uploaded file, also restore its full content to uploadedKeybindsContent
    // This is important if saveKeybinds needs to preserve non-displayed items from original upload
    if (uploadedKeybindsContent.value) {
        // This step might be redundant if sessionInitialKeybinds already correctly reflects the uploaded state for displayable items
        // and saveKeybinds handles merging correctly.
        // However, to be safe and ensure "revert" truly means "back to last explicit load state":
        Object.assign(keybinds, uploadedKeybindsContent.value);
        // then ensure displayable items are correctly set from this potentially larger set
        for (const action in displayableKeybinds.value) {
            keybinds[action] = uploadedKeybindsContent.value[action] || initialKeybindsFromFile[action as keyof typeof initialKeybindsFromFile] || '';
        }
        if (uploadedKeybindsContent.value.__KeyCodeList__) {
            keybinds.__KeyCodeList__ = uploadedKeybindsContent.value.__KeyCodeList__;
        }

    }


    message.success(t('changesReverted'), 1);
};


const saveKeybinds = () => {
    let keybindsToSave: Record<string, string> = {};

    if (uploadedKeybindsContent.value) {
        // If a file was uploaded, use its structure as a base
        keybindsToSave = { ...uploadedKeybindsContent.value };
        // Then update with current values for displayable actions
        for (const action in displayableKeybinds.value) {
            keybindsToSave[action] = keybinds[action];
        }
    } else {
        // Otherwise, save based on initialKeybindsFromFile structure
        keybindsToSave = { ...initialKeybindsFromFile }; // Start with all original keys
        for (const action in displayableKeybinds.value) {
            keybindsToSave[action] = keybinds[action];
        }
        // Ensure __KeyCodeList__ from original file is preserved if not uploaded
        if (initialKeybindsFromFile.__KeyCodeList__ && !keybindsToSave.__KeyCodeList__) {
            keybindsToSave.__KeyCodeList__ = initialKeybindsFromFile.__KeyCodeList__;
        }
    }
    // Ensure __KeyCodeList__ is always present if it was in the original or uploaded file
    if (keybinds.__KeyCodeList__) {
        keybindsToSave.__KeyCodeList__ = keybinds.__KeyCodeList__;
    }


    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keybindsToSave, null, "\t"));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "KeyBinds.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    message.success(t('configSavedSuccess'), 1);
};

const uploadKeybinds = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsedContent = JSON.parse(content);
                    if (typeof parsedContent === 'object' && parsedContent !== null) {
                        uploadedKeybindsContent.value = { ...parsedContent }; // Store the full uploaded content

                        // Update current keybinds state (keybinds) based on displayable actions
                        // and the uploaded file.
                        const newKeybindsState: Record<string, string> = {};
                        for (const action in initialKeybindsFromFile) { // Iterate known actions from KeyBinds.json
                            if (action !== '__KeyCodeList__') {
                                // Use uploaded value if present, otherwise fallback to initial default for that action
                                newKeybindsState[action] = parsedContent[action] || initialKeybindsFromFile[action as keyof typeof initialKeybindsFromFile] || '';
                            }
                        }

                        Object.keys(keybinds).forEach(key => delete keybinds[key]); // Clear current
                        Object.assign(keybinds, newKeybindsState); // Assign new state

                        // Preserve __KeyCodeList__ from the uploaded file if it exists
                        if (parsedContent.__KeyCodeList__) {
                            keybinds.__KeyCodeList__ = parsedContent.__KeyCodeList__;
                        } else if (initialKeybindsFromFile.__KeyCodeList__ && !keybinds.__KeyCodeList__) {
                            // Fallback to KeyCodeList from initial file if not in uploaded
                            keybinds.__KeyCodeList__ = initialKeybindsFromFile.__KeyCodeList__;
                        }

                        // Update sessionInitialKeybinds to this new state
                        Object.keys(sessionInitialKeybinds).forEach(key => delete sessionInitialKeybinds[key]);
                        Object.assign(sessionInitialKeybinds, keybinds); // Reflects the state after upload

                        message.success(t('uploadSuccess'), 1);
                    } else {
                        message.error(t('invalidFileFormat'));
                    }
                } catch (error) {
                    message.error(t('errorReadingFile'));
                    console.error("Error reading or parsing file:", error);
                }
            };
            reader.onerror = () => {
                message.error(t('errorReadingFile'));
            };
            reader.readAsText(file);
        }
    };
    input.click();
};

const newDefaultKeybinds = () => {
    uploadedKeybindsContent.value = null; // Clear any previously uploaded content reference

    const newKeybindsState: Record<string, string> = {};
    // Base on initialKeybindsFromFile to ensure all official actions are covered
    for (const action in initialKeybindsFromFile) {
        if (action !== '__KeyCodeList__') {
            // Apply from emptyKeybinds if present, otherwise keep it as per initial (or empty if not in emptyKeybinds)
            newKeybindsState[action] = emptyKeybinds[action as keyof typeof emptyKeybinds] || initialKeybindsFromFile[action as keyof typeof initialKeybindsFromFile] || '';
        }
    }
    // Specifically apply emptyKeybinds values, overriding if necessary
    for (const action in emptyKeybinds) {
        if (action !== '__KeyCodeList__') {
            newKeybindsState[action] = emptyKeybinds[action as keyof typeof emptyKeybinds];
        }
    }


    Object.keys(keybinds).forEach(key => delete keybinds[key]);
    Object.assign(keybinds, newKeybindsState);

    if (emptyKeybinds.__KeyCodeList__) { // Prefer KeyCodeList from empty if defined
        keybinds.__KeyCodeList__ = emptyKeybinds.__KeyCodeList__;
    } else if (initialKeybindsFromFile.__KeyCodeList__) { // Fallback to initial
        keybinds.__KeyCodeList__ = initialKeybindsFromFile.__KeyCodeList__;
    }

    // Update sessionInitialKeybinds to this new "empty/default" state
    Object.keys(sessionInitialKeybinds).forEach(key => delete sessionInitialKeybinds[key]);
    Object.assign(sessionInitialKeybinds, keybinds);

    // message.success(t('newDefaultKeybindsSuccess'));
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    // Initialize sessionInitialKeybinds with a deep copy of the initially loaded keybinds
    Object.keys(sessionInitialKeybinds).forEach(key => delete sessionInitialKeybinds[key]);
    Object.assign(sessionInitialKeybinds, JSON.parse(JSON.stringify(initialKeybindsFromFile)));
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown, true);
});
</script>

<style scoped>
.title {
    font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', 'Noto Sans', sans-serif;
}

.keybind-editor-container {
    max-width: 960px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans SC', 'Noto Sans', 'Segoe UI', Roboto,
        sans-serif, 'Apple Color Emoji', 'Noto Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

.keybind-input {
    cursor: pointer;
    transition: all 0.3s;
}

.keybind-input:hover {
    border-color: #40a9ff;
}

.binding-active {
    background-color: #e6f7ff !important;
    border-color: #1890ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.keybind-modified {
    font-weight: bold;
    font-style: italic;
    /* Or use a color, e.g., color: #1890ff; */
}

.binding-modal-content {
    text-align: center;
    padding: 24px 0;
}

.binding-modal-content .key-prompt {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1890ff;
    margin: 1rem 0;
    padding: 0.5rem;
    border: 1px dashed #91d5ff;
    border-radius: 4px;
    background-color: #e6f7ff;
}

:deep(.ant-form-item-label > label) {
    font-weight: 500;
}
</style>
