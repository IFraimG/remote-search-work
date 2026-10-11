import { createApp } from 'vue';
import App from '@/app/App.vue';
import { router } from '@/app/router/index.js';

const app = createApp(App);
app.use(router);
app.mount('#app');
