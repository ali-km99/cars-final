import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "@/core/router";
import vuetify from "@/core/plugins/vuetify";
import { setupMotion } from "@/core/plugins/motion";
import VueApexCharts from "vue3-apexcharts";
import "@/assets/styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
setupMotion(app);
app.use(VueApexCharts);
app.mount("#app");
