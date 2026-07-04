<template>
  <section class="download-panel" aria-labelledby="download-panel-title">
    <div class="download-hero">
      <div class="download-hero__copy">
        <h2 id="download-panel-title">{{ t.title }}</h2>

        <div class="download-facts" :aria-label="t.releaseInfo">
          <div v-if="gameInfo?.Version" class="download-fact">
            <span>{{ t.version }}</span>
            <strong>{{ gameInfo.Version }}</strong>
          </div>
          <div v-if="gameInfo?.Name" class="download-fact">
            <span>{{ t.buildName }}</span>
            <strong>{{ gameInfo.Name }}</strong>
          </div>
          <div v-if="gpNextInfo?.version" class="download-fact">
            <span>{{ t.gpNext }}</span>
            <strong>{{ gpNextInfo.version }}</strong>
          </div>
        </div>
      </div>

      <div class="download-quick" :aria-label="t.quickDownload">
        <template v-if="quickDownload">
          <a
            class="download-button download-button--primary"
            :href="quickDownload.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <VPIcon icon="download" />
            <span class="download-button__text">
              <span>{{ t.localDownload }}</span>
              <small class="download-button__system">
                <VPIcon :icon="quickDownload.osIcon" />
                <span>{{ quickDownload.osName }}</span>
              </small>
            </span>
          </a>
        </template>
        <a v-else class="download-button download-button--primary" href="#download-options">
          <VPIcon icon="computer" />
          <span>{{ t.choosePlatform }}</span>
        </a>
        <a v-if="quickDownload" class="download-button download-button--ghost" href="#download-options">
          <VPIcon icon="computer" />
          <span>{{ t.choosePlatform }}</span>
        </a>
      </div>
    </div>

    <div v-if="loading" class="download-state">{{ t.loading }}</div>
    <div v-else-if="error" class="download-state download-state--error">
      <strong>{{ t.loadFailed }}</strong>
      <span>{{ error }}</span>
    </div>

    <template v-else>
      <section class="download-changelog" :aria-labelledby="changelogHeadingId">
        <div class="download-section-head">
          <h3 :id="changelogHeadingId">{{ t.changelog }}</h3>
        </div>
        <ul v-if="changes.length">
          <li v-for="item in changes" :key="item">{{ item }}</li>
        </ul>
        <p v-else class="download-muted">{{ t.noChangelog }}</p>
      </section>

      <nav id="download-options" class="download-os-switch" :aria-label="t.choosePlatform">
        <button
          v-for="os in osTabs"
          :key="os.key"
          class="download-os-tab"
          :class="{ 'download-os-tab--active': activeOs === os.key }"
          type="button"
          :aria-pressed="activeOs === os.key"
          @click="activeOs = os.key"
        >
          <VPIcon :icon="os.icon" />
          <span>
            <strong>{{ os.label }}</strong>
          </span>
        </button>
      </nav>

      <section class="download-platform" :aria-labelledby="platformHeadingId">
        <div class="download-section-head">
          <h3 :id="platformHeadingId">{{ activePlatformTitle }}</h3>
        </div>

        <div v-if="activeOptions.length" class="download-option-grid">
          <a
            v-for="option in activeOptions"
            :key="option.title + option.href"
            class="download-option"
            :class="{ 'download-option--recommended': option.recommended }"
            :href="option.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="download-option__icon">
              <VPIcon :icon="option.icon" />
            </span>
            <span class="download-option__body">
              <strong>{{ option.title }}</strong>
              <small>{{ option.description }}</small>
            </span>
            <span class="download-option__action">{{ option.action }}</span>
          </a>
        </div>
        <p v-else class="download-muted">{{ t.noOptions }}</p>

        <div v-if="activeOs === 'mac'" class="download-note download-note--warning">
          <strong>{{ t.macNoticeTitle }}</strong>
          <p>{{ t.macNotice }}</p>
          <ol>
            <li>{{ t.macStepType }} <code>sudo xattr -r -d com.apple.quarantine </code></li>
            <li>{{ t.macStepDrag }}</li>
            <li>{{ t.macStepRun }}</li>
          </ol>
          <p>{{ t.macSecurity }}</p>
        </div>

        <div v-if="activeOs === 'linux'" class="download-note">
          <strong>{{ t.linuxNoticeTitle }}</strong>
          <p>{{ t.linuxNotice }}</p>
        </div>
      </section>

      <section v-if="gameInfo?.Hash?.MD5 || gameInfo?.Hash?.SHA256" class="download-hash" :aria-label="t.hashes">
        <div v-if="gameInfo?.Hash?.MD5">
          <span>MD5</span>
          <code>{{ gameInfo.Hash.MD5 }}</code>
        </div>
        <div v-if="gameInfo?.Hash?.SHA256">
          <span>SHA256</span>
          <code>{{ gameInfo.Hash.SHA256 }}</code>
        </div>
      </section>

      <div class="download-history">
        <VPIcon icon="clock-rotate-left" />
        <span>{{ t.historyText }}</span>
        <a :href="historyLink.href" target="_blank" rel="noopener noreferrer">{{ historyLink.label }}</a>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type LocaleKey = 'zh' | 'en' | 'es' | 'ru';
type OsKey = 'windows' | 'mac' | 'linux';
type DetectedOs = OsKey | 'unknown';

type ProviderLinks = {
  Github?: string;
  Storage?: string;
  Quark?: string;
  QuarkZip?: string;
  Baidu?: string;
  Pan123?: string;
};

type GameInfo = {
  Name?: string;
  Version?: string;
  NewFeatures?: string[];
  EnNewFeatures?: string[];
  Hash?: {
    MD5?: string;
    SHA256?: string;
  };
  Download?: ProviderLinks;
  MacOSDownload?: {
    Storage?: string;
  };
};

type GpNextInfo = {
  version?: string;
};

type DownloadOption = {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: string;
  recommended?: boolean;
};

const props = withDefaults(defineProps<{ locale?: LocaleKey }>(), {
  locale: 'en'
});

const copy = {
  zh: {
    title: 'PvZ2 Gardendless 官方下载',
    releaseInfo: '版本信息',
    version: '游戏版本',
    buildName: '版本名称',
    gpNext: 'GP-Next',
    quickDownload: '下载操作',
    localDownload: '本地下载',
    loading: '正在读取下载信息...',
    loadFailed: '无法读取下载信息',
    changelog: '更新日志',
    noChangelog: '暂无更新说明',
    choosePlatform: '选择平台',
    windowsTitle: 'Windows 下载',
    macTitle: 'macOS 下载',
    linuxTitle: 'Linux / 其它系统',
    localTitle: '本地下载',
    localDescription: '官方直链，推荐优先使用。',
    githubTitle: 'GitHub Release',
    githubDescription: '发布页、历史版本与资源文件。',
    quarkTitle: '夸克网盘',
    quarkZipTitle: '夸克 ZIP 包',
    quarkDescription: '备用网盘下载渠道。',
    baiduTitle: '百度网盘',
    baiduDescription: '备用网盘下载渠道，链接含提取码。',
    pan123Title: '123 网盘',
    pan123Description: '备用网盘下载渠道。',
    dockerTitle: 'Docker Hub',
    dockerDescription: '用于本地部署 Web 版本。',
    open: '打开',
    download: '下载',
    noOptions: '当前没有可用下载项。',
    macNoticeTitle: 'macOS 首次启动提示',
    macNotice: 'macOS 版本仅支持 Apple Silicon (arm64)，系统版本需为 macOS 11.0 或以上。首次启动如提示应用已损坏，可按以下步骤移除隔离属性：',
    macStepType: '先在终端输入（不要立即执行）：',
    macStepDrag: '将游戏程序拖拽到终端窗口，让系统自动补全应用路径。',
    macStepRun: '确认路径无误后按回车执行。',
    macSecurity: '若仍无法打开，可在“系统设置 > 隐私与安全性”中允许该应用后再试。',
    linuxNoticeTitle: 'Linux 说明',
    linuxNotice: '目前提供 Docker 镜像，适用于 x86_64 (amd64) 架构的 Linux 和其它可运行 Docker 的系统。',
    hashes: '校验值',
    historyText: '历史版本与资源文件：',
    historyLabel: 'GitHub Release'
  },
  en: {
    title: 'PvZ2 Gardendless official download',
    releaseInfo: 'Release information',
    version: 'Game version',
    buildName: 'Build name',
    gpNext: 'GP-Next',
    quickDownload: 'Download actions',
    localDownload: 'Local download',
    loading: 'Loading download information...',
    loadFailed: 'Download information unavailable',
    changelog: 'Changelog',
    noChangelog: 'No changelog available',
    choosePlatform: 'Choose platform',
    windowsTitle: 'Windows download',
    macTitle: 'macOS download',
    linuxTitle: 'Linux / other systems',
    localTitle: 'Local download',
    localDescription: 'Official direct link, recommended first.',
    githubTitle: 'GitHub Release',
    githubDescription: 'Release page, historical packages, and resource files.',
    quarkTitle: 'Quark Netdisk',
    quarkZipTitle: 'Quark ZIP package',
    quarkDescription: 'Alternative netdisk download channel.',
    baiduTitle: 'Baidu Netdisk',
    baiduDescription: 'Alternative netdisk channel with extraction code in the link.',
    pan123Title: '123Pan',
    pan123Description: 'Alternative netdisk download channel.',
    dockerTitle: 'Docker Hub',
    dockerDescription: 'For local deployment of the web version.',
    open: 'Open',
    download: 'Download',
    noOptions: 'No download option is available right now.',
    macNoticeTitle: 'macOS first launch',
    macNotice: 'The macOS build supports Apple Silicon (arm64) and requires macOS 11.0 or later. If the system reports that the app is damaged on first launch, remove the quarantine attribute with these steps:',
    macStepType: 'Type this in Terminal first, without running it yet:',
    macStepDrag: 'Drag the game app into the Terminal window so the path is completed.',
    macStepRun: 'Check the path, then press Enter to run it.',
    macSecurity: 'If it still cannot open, allow the app in System Settings > Privacy & Security and try again.',
    linuxNoticeTitle: 'Linux note',
    linuxNotice: 'A Docker image is provided for x86_64 (amd64) Linux and other systems that can run Docker.',
    hashes: 'Checksums',
    historyText: 'Historical versions and resources:',
    historyLabel: 'GitHub Release'
  },
  es: {
    title: 'Descarga oficial de PvZ2 Gardendless',
    releaseInfo: 'Información de versión',
    version: 'Versión del juego',
    buildName: 'Nombre de versión',
    gpNext: 'GP-Next',
    quickDownload: 'Acciones de descarga',
    localDownload: 'Descarga local',
    loading: 'Cargando información de descarga...',
    loadFailed: 'No se pudo cargar la información de descarga',
    changelog: 'Registro de cambios',
    noChangelog: 'Sin registro de cambios',
    choosePlatform: 'Elegir plataforma',
    windowsTitle: 'Descarga para Windows',
    macTitle: 'Descarga para macOS',
    linuxTitle: 'Linux / otros sistemas',
    localTitle: 'Descarga local',
    localDescription: 'Enlace directo oficial, recomendado primero.',
    githubTitle: 'GitHub Release',
    githubDescription: 'Página de versiones, paquetes históricos y recursos.',
    quarkTitle: 'Quark Netdisk',
    quarkZipTitle: 'Paquete ZIP de Quark',
    quarkDescription: 'Canal alternativo de descarga por netdisk.',
    baiduTitle: 'Baidu Netdisk',
    baiduDescription: 'Canal alternativo con código de extracción en el enlace.',
    pan123Title: '123 Pan',
    pan123Description: 'Canal alternativo de descarga por netdisk.',
    dockerTitle: 'Docker Hub',
    dockerDescription: 'Para desplegar localmente la versión web.',
    open: 'Abrir',
    download: 'Descargar',
    noOptions: 'No hay opciones de descarga disponibles.',
    macNoticeTitle: 'Primer inicio en macOS',
    macNotice: 'La versión para macOS requiere Apple Silicon (arm64) y macOS 11.0 o posterior. Si el sistema indica que la app está dañada en el primer inicio, elimina el atributo de cuarentena con estos pasos:',
    macStepType: 'Escribe esto en Terminal primero, sin ejecutarlo todavía:',
    macStepDrag: 'Arrastra la app del juego a la ventana de Terminal para completar la ruta.',
    macStepRun: 'Verifica la ruta y pulsa Enter.',
    macSecurity: 'Si aún no abre, permite la app en Configuración del sistema > Privacidad y seguridad.',
    linuxNoticeTitle: 'Nota para Linux',
    linuxNotice: 'Se proporciona una imagen Docker para Linux x86_64 (amd64) y otros sistemas compatibles con Docker.',
    hashes: 'Checksums',
    historyText: 'Versiones históricas y recursos:',
    historyLabel: 'GE Drive'
  },
  ru: {
    title: 'Официальная загрузка PvZ2 Gardendless',
    releaseInfo: 'Информация о версии',
    version: 'Версия игры',
    buildName: 'Название сборки',
    gpNext: 'GP-Next',
    quickDownload: 'Действия загрузки',
    localDownload: 'Локальная загрузка',
    loading: 'Загрузка информации...',
    loadFailed: 'Информация о загрузке недоступна',
    changelog: 'Журнал изменений',
    noChangelog: 'Журнал изменений недоступен',
    choosePlatform: 'Выбрать платформу',
    windowsTitle: 'Загрузка для Windows',
    macTitle: 'Загрузка для macOS',
    linuxTitle: 'Linux / другие системы',
    localTitle: 'Локальная загрузка',
    localDescription: 'Официальная прямая ссылка, рекомендуется в первую очередь.',
    githubTitle: 'GitHub Release',
    githubDescription: 'Страница релизов, старые пакеты и файлы ресурсов.',
    quarkTitle: 'Quark Netdisk',
    quarkZipTitle: 'Quark ZIP',
    quarkDescription: 'Альтернативный канал загрузки через netdisk.',
    baiduTitle: 'Baidu Netdisk',
    baiduDescription: 'Альтернативный канал, код указан в ссылке.',
    pan123Title: '123 Pan',
    pan123Description: 'Альтернативный канал загрузки через netdisk.',
    dockerTitle: 'Docker Hub',
    dockerDescription: 'Для локального развертывания web-версии.',
    open: 'Открыть',
    download: 'Скачать',
    noOptions: 'Сейчас нет доступных вариантов загрузки.',
    macNoticeTitle: 'Первый запуск на macOS',
    macNotice: 'Сборка для macOS поддерживает Apple Silicon (arm64) и требует macOS 11.0 или новее. Если при первом запуске система сообщает, что приложение повреждено, удалите атрибут карантина:',
    macStepType: 'Сначала введите в Terminal, пока не выполняя:',
    macStepDrag: 'Перетащите приложение игры в окно Terminal, чтобы путь подставился автоматически.',
    macStepRun: 'Проверьте путь и нажмите Enter.',
    macSecurity: 'Если приложение все еще не открывается, разрешите его в System Settings > Privacy & Security.',
    linuxNoticeTitle: 'Заметка для Linux',
    linuxNotice: 'Docker-образ предоставляется для Linux x86_64 (amd64) и других систем с поддержкой Docker.',
    hashes: 'Контрольные суммы',
    historyText: 'Исторические версии и ресурсы:',
    historyLabel: 'GE Drive'
  }
} as const;

const gameInfo = ref<GameInfo | null>(null);
const gpNextInfo = ref<GpNextInfo | null>(null);
const loading = ref(true);
const error = ref('');
const detectedOs = ref<DetectedOs>('unknown');
const activeOs = ref<OsKey>('windows');

const locale = computed<LocaleKey>(() => {
  return props.locale && props.locale in copy ? props.locale : 'en';
});

const t = computed(() => copy[locale.value]).value;
const changelogHeadingId = computed(() => `download-changelog-${locale.value}`);
const platformHeadingId = computed(() => `download-platform-${locale.value}`);

const osTabs = computed(() => [
  { key: 'windows' as const, icon: 'brands:windows', label: 'Windows' },
  { key: 'mac' as const, icon: 'brands:apple', label: 'macOS' },
  { key: 'linux' as const, icon: 'brands:linux', label: 'Linux' }
]);

const activePlatformTitle = computed(() => {
  const texts = copy[locale.value];
  if (activeOs.value === 'mac') {
    return texts.macTitle;
  }
  if (activeOs.value === 'linux') {
    return texts.linuxTitle;
  }
  return texts.windowsTitle;
});

const quickDownload = computed(() => {
  if (detectedOs.value !== 'windows' && detectedOs.value !== 'mac') {
    return null;
  }
  const href = localDownloadHref(detectedOs.value);
  if (!href) {
    return null;
  }
  return {
    href,
    ...downloadOsMeta(detectedOs.value)
  };
});

const changes = computed(() => {
  if (!gameInfo.value) {
    return [];
  }
  if (locale.value === 'zh') {
    return gameInfo.value.NewFeatures || gameInfo.value.EnNewFeatures || [];
  }
  return gameInfo.value.EnNewFeatures || gameInfo.value.NewFeatures || [];
});

const activeOptions = computed<DownloadOption[]>(() => {
  if (!gameInfo.value) {
    return [];
  }

  if (activeOs.value === 'mac') {
    return compact([
      optionFromHref({
        title: copy[locale.value].localTitle,
        description: copy[locale.value].localDescription,
        action: copy[locale.value].download,
        href: gameInfo.value.MacOSDownload?.Storage,
        icon: 'download',
        recommended: true
      })
    ]);
  }

  if (activeOs.value === 'linux') {
    return [
      {
        title: copy[locale.value].dockerTitle,
        description: copy[locale.value].dockerDescription,
        action: copy[locale.value].open,
        href: 'https://hub.docker.com/r/gaozih/pvzge',
        icon: 'brands:docker',
        recommended: true
      }
    ];
  }

  const links = gameInfo.value.Download || {};
  return compact([
    optionFromHref({
      title: copy[locale.value].localTitle,
      description: copy[locale.value].localDescription,
      action: copy[locale.value].download,
      href: links.Storage,
      icon: 'download',
      recommended: true
    }),
    optionFromHref({
      title: copy[locale.value].githubTitle,
      description: copy[locale.value].githubDescription,
      action: copy[locale.value].open,
      href: links.Github,
      icon: 'brands:github'
    }),
    optionFromHref({
      title: copy[locale.value].quarkTitle,
      description: copy[locale.value].quarkDescription,
      action: copy[locale.value].open,
      href: links.Quark,
      icon: 'cloud'
    }),
    optionFromHref({
      title: copy[locale.value].quarkZipTitle,
      description: copy[locale.value].quarkDescription,
      action: copy[locale.value].download,
      href: links.QuarkZip,
      icon: 'file-zipper'
    }),
    optionFromHref({
      title: copy[locale.value].baiduTitle,
      description: copy[locale.value].baiduDescription,
      action: copy[locale.value].open,
      href: links.Baidu,
      icon: 'cloud'
    }),
    optionFromHref({
      title: copy[locale.value].pan123Title,
      description: copy[locale.value].pan123Description,
      action: copy[locale.value].open,
      href: links.Pan123,
      icon: 'cloud'
    })
  ]);
});

const historyLink = computed(() => {
  if (locale.value === 'zh' || locale.value === 'en') {
    return {
      href: 'https://github.com/Gzh0821/pvzg_site/releases',
      label: copy[locale.value].historyLabel
    };
  }
  return {
    href: 'https://drive.pvzge.com/',
    label: copy[locale.value].historyLabel
  };
});

onMounted(() => {
  const os = detectOs();
  detectedOs.value = os;
  if (os !== 'unknown') {
    activeOs.value = os;
  }

  void loadDownloadInfo();
});

function localDownloadHref(os: OsKey) {
  if (os === 'mac') {
    return gameInfo.value?.MacOSDownload?.Storage || '';
  }
  if (os === 'windows') {
    return gameInfo.value?.Download?.Storage || '';
  }
  return '';
}

function downloadOsMeta(os: OsKey) {
  if (os === 'mac') {
    return {
      osIcon: 'brands:apple',
      osName: 'macOS'
    };
  }
  return {
    osIcon: 'brands:windows',
    osName: 'Windows'
  };
}

function optionFromHref(option: Omit<DownloadOption, 'href'> & { href?: string }): DownloadOption | null {
  if (!option.href) {
    return null;
  }
  return {
    title: option.title,
    description: option.description,
    action: option.action,
    href: option.href,
    icon: option.icon,
    recommended: option.recommended
  };
}

function compact<T>(items: Array<T | null | undefined>): T[] {
  return items.filter(Boolean) as T[];
}

async function loadDownloadInfo() {
  loading.value = true;
  error.value = '';
  try {
    const [gameInfoResponse, gpNextInfoResponse] = await Promise.all([
      fetch('/jsons/gameinfo.json'),
      fetch('/jsons/gp-next-info.json')
    ]);

    if (!gameInfoResponse.ok) {
      throw new Error(`gameinfo.json ${gameInfoResponse.status}`);
    }

    gameInfo.value = await gameInfoResponse.json();
    if (gpNextInfoResponse.ok) {
      gpNextInfo.value = await gpNextInfoResponse.json();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

function detectOs(): DetectedOs {
  const userAgentData = navigator.userAgentData as { platform?: string } | undefined;
  const platform = `${userAgentData?.platform || navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();

  if (platform.includes('win')) {
    return 'windows';
  }
  if (platform.includes('mac')) {
    return 'mac';
  }
  if (platform.includes('linux') || platform.includes('x11')) {
    return 'linux';
  }
  return 'unknown';
}
</script>

<style scoped>
.download-panel {
  --download-accent: var(--vp-c-accent, var(--vp-c-brand-1, #3eaf7c));
  --download-accent-text: var(--vp-c-accent-text, #ffffff);
  --download-text: var(--vp-c-text);
  --download-muted: var(--vp-c-text-mute);
  --download-surface: var(--vp-c-bg);
  --download-soft: var(--vp-c-bg-alt);
  --download-line: color-mix(in srgb, var(--vp-c-border) 72%, transparent);
  --download-danger: var(--vp-c-danger, #d5393e);
  --download-shadow: color-mix(in srgb, var(--vp-c-text) 10%, transparent);
  color: var(--download-text);
  display: grid;
  gap: 1.15rem;
  margin: 1.5rem 0 2rem;
}

.download-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 0.36fr);
  gap: 1rem;
  align-items: stretch;
  padding: 1.25rem;
  border: 1px solid var(--download-line);
  border-radius: 8px;
  background: var(--download-surface);
  box-shadow: 0 16px 36px var(--download-shadow);
}

.download-hero h2,
.download-section-head h3 {
  margin: 0;
  border: 0;
  color: var(--download-text);
  font-family: "pvzgeFontEN", "pvzgFont", "Noto Sans SC", sans-serif;
  letter-spacing: 0;
}

.download-hero h2 {
  font-size: 1.9rem;
  line-height: 1.15;
}

.download-muted {
  margin: 0.65rem 0 0;
  color: var(--download-muted);
}

.download-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.download-fact {
  min-width: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--download-line);
  border-radius: 8px;
  background: var(--download-soft);
}

.download-fact span,
.download-option small {
  display: block;
  color: var(--download-muted);
  font-size: 0.78rem;
  line-height: 1.35;
}

.download-fact strong {
  display: block;
  overflow-wrap: anywhere;
  margin-top: 0.15rem;
}

.download-quick {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.65rem;
  min-width: 0;
  padding-inline-start: 1rem;
  border-inline-start: 1px dashed var(--download-line);
}

.download-button,
.download-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 42px;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.download-button:focus-visible,
.download-option:focus-visible,
.download-os-tab:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--download-accent) 32%, transparent);
  outline-offset: 2px;
}

.download-button--primary {
  border: 1px solid var(--download-accent);
  background: var(--download-accent);
  color: var(--download-accent-text);
}

.download-button__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  line-height: 1.15;
}

.download-button__system {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: currentColor;
  font-size: 0.76rem;
  font-weight: 600;
  opacity: 0.78;
}

.download-button__system :deep(.vp-icon) {
  font-size: 0.82rem;
}

.download-button--primary:hover,
.download-option:hover {
  transform: translateY(-1px);
}

.download-button--primary:disabled {
  cursor: not-allowed;
  border-color: var(--download-line);
  background: var(--download-muted);
}

.download-button--ghost {
  border: 1px solid var(--download-line);
  background: transparent;
  color: var(--download-accent);
}

.download-state,
.download-changelog,
.download-platform,
.download-hash,
.download-history {
  padding: 1rem;
  border: 1px solid var(--download-line);
  border-radius: 8px;
  background: var(--download-surface);
}

.download-state--error {
  border-color: color-mix(in srgb, var(--download-danger) 36%, transparent);
  color: var(--download-danger);
}

.download-state--error span {
  display: block;
  margin-top: 0.25rem;
}

.download-changelog ul {
  margin: 0.75rem 0 0;
  padding-inline-start: 1.2rem;
}

.download-changelog li + li {
  margin-top: 0.3rem;
}

.download-os-switch {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.download-os-tab {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  min-height: 64px;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--download-line);
  border-radius: 8px;
  background: var(--download-soft);
  color: var(--download-text);
  cursor: pointer;
  text-align: start;
}

.download-os-tab :deep(.vp-icon) {
  flex: none;
  color: var(--download-accent);
  font-size: 1.35rem;
}

.download-os-tab span {
  min-width: 0;
}

.download-os-tab strong {
  display: block;
}

.download-os-tab--active {
  border-color: var(--download-accent);
  background: color-mix(in srgb, var(--download-accent) 8%, var(--download-surface));
  box-shadow: inset 4px 0 0 var(--download-accent);
}

.download-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.download-option {
  justify-content: flex-start;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--download-line);
  background: var(--download-soft);
  color: var(--download-text);
}

.download-option--recommended {
  border-color: color-mix(in srgb, var(--download-accent) 58%, var(--download-line));
  background: color-mix(in srgb, var(--download-accent) 8%, var(--download-surface));
}

.download-option__icon {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--download-accent) 12%, transparent);
  color: var(--download-accent);
}

.download-option__body {
  min-width: 0;
  flex: 1;
}

.download-option__body strong,
.download-option__body small {
  overflow-wrap: anywhere;
}

.download-option__action {
  flex: none;
  color: var(--download-accent);
  font-size: 0.86rem;
  font-weight: 700;
}

.download-note {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--download-line);
  border-radius: 8px;
  background: var(--download-soft);
}

.download-note--warning {
  border-color: color-mix(in srgb, var(--download-danger) 28%, var(--download-line));
  background: color-mix(in srgb, var(--download-danger) 8%, var(--download-surface));
}

.download-note p,
.download-note ol {
  margin: 0.45rem 0 0;
}

.download-hash {
  display: grid;
  gap: 0.55rem;
}

.download-hash div {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: center;
}

.download-hash span {
  color: var(--download-muted);
  font-weight: 700;
}

.download-hash code {
  overflow-wrap: anywhere;
  white-space: normal;
}

.download-history {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.download-history :deep(.vp-icon) {
  color: var(--download-accent);
}

.download-history a {
  font-weight: 700;
}

@media (max-width: 820px) {
  .download-hero {
    grid-template-columns: 1fr;
  }

  .download-quick {
    padding-inline-start: 0;
    padding-top: 1rem;
    border-inline-start: 0;
    border-top: 1px dashed var(--download-line);
  }

  .download-facts,
  .download-os-switch,
  .download-option-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .download-hero,
  .download-state,
  .download-changelog,
  .download-platform,
  .download-hash,
  .download-history {
    padding: 0.85rem;
  }

  .download-hero h2 {
    font-size: 1.55rem;
  }

  .download-option {
    align-items: flex-start;
  }

  .download-option__action {
    margin-inline-start: auto;
  }

  .download-hash div {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .download-button,
  .download-option {
    transition: none;
  }

  .download-button--primary:hover,
  .download-option:hover {
    transform: none;
  }
}
</style>
