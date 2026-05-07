import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import clalPocRoutes from "@/domain/ClalPOC/presentation/routes/clalPoc.routes";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  ...clalPocRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
