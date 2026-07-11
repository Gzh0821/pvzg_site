import { defineClientConfig } from "vuepress/client";
import { onBeforeUnmount, onMounted } from "vue";
import Antd from 'ant-design-vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
})

const SECOND_MATCH_DISPLAY_AT = Date.parse("2026-07-12T08:00:00+08:00");

const NORWAY_ENGLAND_TITLE_GRADIENT = `linear-gradient(90deg,
  #ba0c2f 0% 16.666%,
  #ffffff 16.666% 33.332%,
  #00205b 33.332% 50%,
  #ffffff 50% 66.666%,
  #ce1124 66.666% 83.332%,
  #ffffff 83.332% 100%)`;

const ARGENTINA_SWITZERLAND_TITLE_GRADIENT = `linear-gradient(90deg,
  #74acdf 0% 16.666%,
  #ffffff 16.666% 33.332%,
  #74acdf 33.332% 50%,
  #da291c 50% 66.666%,
  #ffffff 66.666% 83.332%,
  #da291c 83.332% 100%)`;

export default defineClientConfig({
  enhance: ({ app, router, siteData }) => {
    app.use(Antd).use(i18n);
  },
  setup: () => {
    let switchTimer: number | undefined;

    const applyScheduledMatchup = () => {
      const now = Date.now();
      const gradient = now < SECOND_MATCH_DISPLAY_AT
        ? NORWAY_ENGLAND_TITLE_GRADIENT
        : ARGENTINA_SWITZERLAND_TITLE_GRADIENT;

      document.documentElement.style.setProperty("--wc26-title-gradient", gradient);

      if (now < SECOND_MATCH_DISPLAY_AT) {
        switchTimer = window.setTimeout(
          applyScheduledMatchup,
          SECOND_MATCH_DISPLAY_AT - now + 50,
        );
      }
    };

    onMounted(applyScheduledMatchup);
    onBeforeUnmount(() => {
      if (switchTimer !== undefined) window.clearTimeout(switchTimer);
      document.documentElement.style.removeProperty("--wc26-title-gradient");
    });
  },
});
