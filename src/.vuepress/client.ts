import { defineClientConfig } from "vuepress/client";
import Antd from 'ant-design-vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
})

export default defineClientConfig({
  enhance: ({ app, router, siteData }) => {
    app.use(Antd).use(i18n);
  },
});