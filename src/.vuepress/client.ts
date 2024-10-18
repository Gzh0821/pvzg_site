import { defineClientConfig } from "vuepress/client";
import Antd from 'ant-design-vue';

export default defineClientConfig({
  enhance: ({ app, router, siteData }) => {
    app.use(Antd);
  },
});