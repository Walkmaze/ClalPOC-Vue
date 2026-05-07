import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/domain/ClalPOC/presentation/views/DashboardView.vue"),
  },
  {
    path: "/executions",
    name: "executions",
    component: () => import("@/domain/ClalPOC/presentation/views/ExecutionsListView.vue"),
  },
  {
    path: "/executions/:id",
    name: "execution-detail",
    component: () => import("@/domain/ClalPOC/presentation/views/ExecutionDetailView.vue"),
  },
  {
    path: "/scenario",
    name: "scenario-builder",
    component: () => import("@/domain/ClalPOC/presentation/views/ScenarioBuilderView.vue"),
  },
  {
    path: "/regulations",
    name: "regulations",
    component: () => import("@/domain/ClalPOC/presentation/views/RegulationsManagementView.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/domain/ClalPOC/presentation/views/SettingsView.vue"),
  },
];

export default routes;
