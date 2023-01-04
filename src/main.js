import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import App from './App.vue';
import router from './router';
import './assets/global.scss';
import { createVuetify } from "vuetify";
import { VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
});

app.use(VueQueryPlugin);
app.use(createPinia());
app.use(vuetify);
app.use(router);

app.mount('#app');
