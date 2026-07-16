import { defineClientConfig } from "vuepress/client";
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
})

export default defineClientConfig({
  enhance: ({ app }) => {
    app.use(i18n);
  },
});
