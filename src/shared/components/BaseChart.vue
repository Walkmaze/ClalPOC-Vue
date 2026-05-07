<template>
  <div class="relative h-full w-full">
    <canvas ref="canvasEl" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

import { Chart, registerables, type ChartConfiguration, type ChartOptions, type Plugin } from "chart.js";

Chart.register(...registerables);

const props = defineProps<{
  type: ChartConfiguration["type"];
  data: ChartConfiguration["data"];
  options?: ChartOptions;
  plugins?: Plugin[];
}>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

onMounted(() => {
  if (!canvasEl.value) return;
  chart = new Chart(canvasEl.value, {
    type: props.type,
    data: props.data,
    options: props.options,
    plugins: props.plugins || [],
  });
});

watch(
  () => [props.data, props.options],
  () => {
    if (!chart) return;
    chart.data = props.data as any;
    if (props.options) chart.options = props.options as any;
    chart.update();
  },
  { deep: true }
);

onUnmounted(() => {
  chart?.destroy();
  chart = null;
});
</script>
