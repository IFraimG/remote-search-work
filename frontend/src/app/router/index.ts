import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/serbia',
  },
  {
    path: '/serbia',
    name: 'Serbia',
    component: () => import('@/pages/serbia/SerbiaPage.vue'),
    meta: { title: 'Вакансии в Сербии — RemoteSearchWork' },
  },
  {
    path: '/armenia',
    name: 'Armenia',
    component: () => import('@/pages/armenia/ArmeniaPage.vue'),
    meta: { title: 'Вакансии в Армении — RemoteSearchWork' },
  },
  {
    path: '/remote',
    name: 'GlobalRemote',
    component: () => import('@/pages/remote/GlobalRemotePage.vue'),
    meta: { title: 'Удаленная работа (Европа, США, СНГ) — RemoteSearchWork' },
  },
  {
    path: '/courier',
    name: 'Courier',
    component: () => import('@/pages/courier/CourierPage.vue'),
    meta: { title: 'Вакансии курьеров (Сербия & Армения) — RemoteSearchWork' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/not-found/NotFoundPage.vue'),
    meta: { title: 'Страница не найдена — RemoteSearchWork' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = String(to.meta.title);
  }
  next();
});
