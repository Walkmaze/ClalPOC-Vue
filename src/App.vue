<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";

import AppLayout from "@/shared/layout/AppLayout.vue";
</script>
