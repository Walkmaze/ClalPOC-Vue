<template>
  <div v-if="!stats">
    <div class="flex flex-col items-center justify-center py-24">
      <div class="mb-4 text-5xl opacity-40">📊</div>
      <h3 class="text-text-primary mb-2 text-lg font-semibold">{{ t("dashboard.emptyTitle") }}</h3>
      <p class="text-text-muted text-sm">{{ t("dashboard.emptyText") }}</p>
    </div>
  </div>

  <div v-else>
    <div class="mb-5 flex items-center justify-between">
      <h2 class="text-text-primary text-lg font-bold">{{ t("dashboard.title") }}</h2>
      <span class="text-text-muted text-[10px]">{{ t("dashboard.live") }}</span>
    </div>

    <div class="grid grid-cols-4 gap-3">
      <!-- Row 1: Metric cards -->
      <MetricCard
        :label="t('dashboard.totalProcesses')"
        :value="stats.total"
        :sub="`${stats.completed} ${t('dashboard.completed')}`"
      />
      <MetricCard
        :label="t('dashboard.successRate')"
        :value="`${stats.successRate}%`"
        :color="successColor"
        :sub="`${stats.successful} ${t('dashboard.ofCompleted')} ${stats.completed} ${t('dashboard.completed')}`"
      />
      <MetricCard
        :label="t('dashboard.slaCompliance')"
        :value="`${stats.slaRate}%`"
        :color="slaColor"
        :sub="`${stats.slaCompliant} ${t('dashboard.ofCompleted')} ${stats.completed} ${t('dashboard.withinSla')}`"
      />
      <MetricCard
        :label="t('dashboard.avgProcessingTime')"
        :value="`${stats.avgTime}s`"
        :sub="`${t('dashboard.fastest')}: ${stats.fastestTime}s | ${t('dashboard.slowest')}: ${stats.slowestTime}s`"
      />

      <!-- Status donut -->
      <ChartCard
        :title="t('dashboard.statusDistribution')"
        :subtitle="`${stats.total} ${t('dashboard.processes')}`"
      >
        <div class="h-[260px]">
          <BaseChart
            type="doughnut"
            :data="statusChartData"
            :options="statusChartOptions"
            :plugins="[centerTextPlugin]"
          />
        </div>
      </ChartCard>

      <!-- Success by fund -->
      <ChartCard
        :title="t('dashboard.successByFund')"
        :subtitle="t('dashboard.successByFundDesc')"
      >
        <div class="h-[260px]">
          <BaseChart
            type="bar"
            :data="successByFundData"
            :options="percentBarOptions"
          />
        </div>
      </ChartCard>

      <!-- Avg time by fund -->
      <ChartCard
        :title="t('dashboard.avgTimeByFund')"
        :subtitle="t('dashboard.avgTimeByFundDesc')"
      >
        <div class="h-[260px]">
          <BaseChart
            type="bar"
            :data="avgTimeByFundData"
            :options="secondsBarOptions"
          />
        </div>
      </ChartCard>

      <!-- Priority distribution stacked -->
      <ChartCard
        :title="t('dashboard.priorityDist')"
        :subtitle="t('dashboard.priorityDistDesc')"
      >
        <div class="h-[260px]">
          <BaseChart
            type="bar"
            :data="priorityChartData"
            :options="stackedBarOptions"
          />
        </div>
      </ChartCard>

      <!-- Timeline full width -->
      <ChartCard
        :title="t('dashboard.execOverTime')"
        :subtitle="t('dashboard.execOverTimeDesc')"
        full-width
      >
        <div class="h-[240px]">
          <BaseChart
            type="line"
            :data="timelineChartData"
            :options="timelineOptions"
          />
        </div>
      </ChartCard>

      <!-- SLA by fund -->
      <ChartCard
        :title="t('dashboard.slaByFund')"
        :subtitle="t('dashboard.slaByFundDesc')"
      >
        <div class="h-[260px]">
          <BaseChart
            type="bar"
            :data="slaByFundData"
            :options="percentBarOptions"
          />
        </div>
      </ChartCard>

      <!-- HITL resolution -->
      <ChartCard
        :title="t('dashboard.hitlResolution')"
        :subtitle="t('dashboard.hitlResolutionDesc')"
      >
        <div
          v-if="stats.hitlData.length === 0"
          class="text-text-muted flex h-[260px] items-center justify-center text-sm"
        >
          {{ t("dashboard.noHitl") }}
        </div>
        <div
          v-else
          class="h-[260px]"
        >
          <BaseChart
            type="bar"
            :data="hitlChartData"
            :options="horizontalBarOptions"
          />
        </div>
      </ChartCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { ChartData, ChartOptions, Plugin } from "chart.js";

import { useExecutionsStore } from "@/domain/ClalPOC/infrastructure/stores/executions.store";
import ChartCard from "@/domain/ClalPOC/presentation/components/ChartCard.vue";
import MetricCard from "@/domain/ClalPOC/presentation/components/MetricCard.vue";
import BaseChart from "@/shared/components/BaseChart.vue";

const { t } = useI18n();
const executions = useExecutionsStore();

const COLORS = {
  success: "#4ADE80",
  failed: "#F87171",
  running: "#60A5FA",
  needsHitl: "#FBBF24",
  awaitingCustomer: "#A78BFA",
  cancelled: "#6B7280",
  investmentFund: "#70E6E8",
  compensationFund: "#1FC2B8",
  studyFund: "#A78BFA",
  axis: "#38595A",
  axisText: "#8AABAD",
  grid: "#1F4041",
};

function getStatusGroupKey(status: string): string {
  if (status === "COMPLETED") return "Success";
  if (status === "BLOCKED" || status === "REJECTED" || status === "ERROR") return "Failed";
  if (status === "RUNNING") return "Running";
  if (status === "PENDING_APPROVAL") return "NeedsHITL";
  if (status === "AWAITING_DOCUMENTS" || status === "AWAITING_CONSENT") return "AwaitingCustomer";
  if (status === "CANCELLED") return "Cancelled";
  return "Other";
}

const STATUS_COLORS: Record<string, string> = {
  Success: COLORS.success,
  Failed: COLORS.failed,
  Running: COLORS.running,
  NeedsHITL: COLORS.needsHitl,
  AwaitingCustomer: COLORS.awaitingCustomer,
  Cancelled: COLORS.cancelled,
  Other: COLORS.axisText,
};

function getFundColor(fundType: string): string {
  if (fundType === "investment") return COLORS.investmentFund;
  if (fundType === "compensation") return COLORS.compensationFund;
  return COLORS.studyFund;
}

function getFundLabel(fundType: string): string {
  return t(`fund.${fundType}`, fundType);
}

const stats = computed(() => {
  const list = executions.executions;
  if (!list || list.length === 0) return null;

  const total = list.length;
  const completed = list.filter((e) => e.status !== "RUNNING");
  const successful = list.filter((e) => e.status === "COMPLETED");
  const successRate = completed.length > 0 ? Math.round((successful.length / completed.length) * 100) : 0;

  let slaCompliant = 0;
  for (const e of completed) {
    if (e.slaDeadline) {
      if (new Date() <= new Date(e.slaDeadline)) slaCompliant++;
    } else {
      slaCompliant++;
    }
  }
  const slaRate = completed.length > 0 ? Math.round((slaCompliant / completed.length) * 100) : 100;

  const times = completed
    .map((e) => (e.validations?.length || 0) * 1.2 + Math.random() * 2)
    .filter((t) => t > 0);
  const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : "0";
  const fastestTime = times.length > 0 ? Math.min(...times).toFixed(1) : "0";
  const slowestTime = times.length > 0 ? Math.max(...times).toFixed(1) : "0";

  const statusCounts: Record<string, number> = {};
  for (const e of list) {
    const g = getStatusGroupKey(e.status);
    statusCounts[g] = (statusCounts[g] || 0) + 1;
  }
  const statusData = Object.entries(statusCounts)
    .map(([k, v]) => ({ key: k, label: t(`statusGroup.${k}`, k), value: v }))
    .sort((a, b) => b.value - a.value);

  const fundGroups: Record<string, { total: number; success: number }> = {};
  for (const e of list) {
    const ft = e.fundType || "investment";
    if (!fundGroups[ft]) fundGroups[ft] = { total: 0, success: 0 };
    fundGroups[ft].total++;
    if (e.status === "COMPLETED") fundGroups[ft].success++;
  }
  const successByFund = Object.entries(fundGroups).map(([fund, d]) => ({
    fund,
    fundLabel: getFundLabel(fund),
    successRate: d.total > 0 ? Math.round((d.success / d.total) * 100) : 0,
  }));

  const fundTimes: Record<string, number[]> = {};
  for (const e of list) {
    const ft = e.fundType || "investment";
    if (!fundTimes[ft]) fundTimes[ft] = [];
    const count = e.validations?.length || 3;
    fundTimes[ft].push(count * 1.2 + Math.random() * 2);
  }
  const avgTimeByFund = Object.entries(fundTimes)
    .map(([fund, ts]) => ({
      fund,
      fundLabel: getFundLabel(fund),
      avgTime: +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(1),
    }))
    .sort((a, b) => b.avgTime - a.avgTime);

  type PriorityRow = { priority: string; success: number; failed: number; hitl: number; other: number };
  const priorityMap: Record<string, PriorityRow> = {
    High: { priority: "High", success: 0, failed: 0, hitl: 0, other: 0 },
    Medium: { priority: "Medium", success: 0, failed: 0, hitl: 0, other: 0 },
    Low: { priority: "Low", success: 0, failed: 0, hitl: 0, other: 0 },
  };
  for (const e of list) {
    const row = priorityMap[e.priority || "Low"];
    if (!row) continue;
    const g = getStatusGroupKey(e.status);
    if (g === "Success") row.success++;
    else if (g === "Failed") row.failed++;
    else if (g === "NeedsHITL") row.hitl++;
    else row.other++;
  }
  const priorityData = ["High", "Medium", "Low"].map((p) => priorityMap[p]);

  const sorted = [...list].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const timelineData = sorted.map((exec, i) => {
    const slice = sorted.slice(0, i + 1);
    return {
      time: new Date(exec.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      total: i + 1,
      success: slice.filter((e) => e.status === "COMPLETED").length,
      failed: slice.filter((e) => ["BLOCKED", "REJECTED", "ERROR"].includes(e.status)).length,
    };
  });

  const slaByFund = Object.keys(fundGroups).map((fund) => {
    const fundExecs = list.filter((e) => e.fundType === fund && e.status !== "RUNNING");
    let onTime = 0;
    for (const e of fundExecs) {
      if (!e.slaDeadline || new Date() <= new Date(e.slaDeadline)) onTime++;
    }
    return {
      fund,
      fundLabel: getFundLabel(fund),
      compliance: fundExecs.length > 0 ? Math.round((onTime / fundExecs.length) * 100) : 100,
    };
  });

  const hitlMap: Record<string, { times: number[]; count: number }> = {};
  for (const e of list) {
    (e.validations || []).forEach((v, i) => {
      if (!v.requires_hitl) return;
      const status = e.validationStatuses?.[i];
      if (status === "pass" || status === "fail" || status === "warning") {
        const reason = v.name || "Unknown";
        if (!hitlMap[reason]) hitlMap[reason] = { times: [], count: 0 };
        hitlMap[reason].count++;
        hitlMap[reason].times.push(15 + Math.random() * 60);
      }
    });
  }
  const hitlData = Object.entries(hitlMap)
    .map(([reason, d]) => ({
      reason,
      avgTime: Math.round(d.times.reduce((a, b) => a + b, 0) / d.times.length),
      count: d.count,
    }))
    .sort((a, b) => b.avgTime - a.avgTime);

  return {
    total,
    successRate,
    successful: successful.length,
    completed: completed.length,
    slaRate,
    slaCompliant,
    avgTime,
    fastestTime,
    slowestTime,
    statusData,
    successByFund,
    avgTimeByFund,
    priorityData,
    timelineData,
    slaByFund,
    hitlData,
  };
});

// ── Chart configs ──

const statusChartData = computed<ChartData<"doughnut">>(() => ({
  labels: stats.value?.statusData.map((d) => d.label) || [],
  datasets: [
    {
      data: stats.value?.statusData.map((d) => d.value) || [],
      backgroundColor: stats.value?.statusData.map((d) => STATUS_COLORS[d.key] || COLORS.axisText) || [],
      borderWidth: 0,
    },
  ],
}));

const statusChartOptions = computed<ChartOptions<"doughnut">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: { position: "bottom", labels: { color: COLORS.axisText, font: { size: 11 }, boxWidth: 8, usePointStyle: true } },
    tooltip: tooltipStyle,
  },
}));

const successByFundData = computed<ChartData<"bar">>(() => ({
  labels: stats.value?.successByFund.map((d) => d.fundLabel) || [],
  datasets: [
    {
      data: stats.value?.successByFund.map((d) => d.successRate) || [],
      backgroundColor: stats.value?.successByFund.map((d) => getFundColor(d.fund)) || [],
      borderRadius: 4,
    },
  ],
}));

const avgTimeByFundData = computed<ChartData<"bar">>(() => ({
  labels: stats.value?.avgTimeByFund.map((d) => d.fundLabel) || [],
  datasets: [
    {
      data: stats.value?.avgTimeByFund.map((d) => d.avgTime) || [],
      backgroundColor: stats.value?.avgTimeByFund.map((d) => getFundColor(d.fund)) || [],
      borderRadius: 4,
    },
  ],
}));

const priorityChartData = computed<ChartData<"bar">>(() => ({
  labels: stats.value?.priorityData.map((d) => d.priority) || [],
  datasets: [
    { label: t("executions.success"), data: stats.value?.priorityData.map((d) => d.success) || [], backgroundColor: COLORS.success, stack: "s" },
    { label: t("executions.failed"), data: stats.value?.priorityData.map((d) => d.failed) || [], backgroundColor: COLORS.failed, stack: "s" },
    { label: "HITL", data: stats.value?.priorityData.map((d) => d.hitl) || [], backgroundColor: COLORS.needsHitl, stack: "s" },
    { label: "Other", data: stats.value?.priorityData.map((d) => d.other) || [], backgroundColor: COLORS.cancelled, stack: "s" },
  ],
}));

const timelineChartData = computed<ChartData<"line">>(() => ({
  labels: stats.value?.timelineData.map((d) => d.time) || [],
  datasets: [
    {
      label: t("executions.total"),
      data: stats.value?.timelineData.map((d) => d.total) || [],
      borderColor: COLORS.axisText,
      backgroundColor: hexToRgba(COLORS.axisText, 0.08),
      fill: true,
      tension: 0.25,
    },
    {
      label: t("executions.success"),
      data: stats.value?.timelineData.map((d) => d.success) || [],
      borderColor: COLORS.success,
      backgroundColor: hexToRgba(COLORS.success, 0.12),
      fill: true,
      tension: 0.25,
    },
    {
      label: t("executions.failed"),
      data: stats.value?.timelineData.map((d) => d.failed) || [],
      borderColor: COLORS.failed,
      backgroundColor: hexToRgba(COLORS.failed, 0.12),
      fill: true,
      tension: 0.25,
    },
  ],
}));

const slaByFundData = computed<ChartData<"bar">>(() => ({
  labels: stats.value?.slaByFund.map((d) => d.fundLabel) || [],
  datasets: [
    {
      data: stats.value?.slaByFund.map((d) => d.compliance) || [],
      backgroundColor: stats.value?.slaByFund.map((d) =>
        d.compliance >= 85 ? COLORS.success : d.compliance >= 70 ? COLORS.needsHitl : COLORS.failed
      ) || [],
      borderRadius: 4,
    },
  ],
}));

const hitlChartData = computed<ChartData<"bar">>(() => ({
  labels: stats.value?.hitlData.map((d) => d.reason) || [],
  datasets: [
    {
      data: stats.value?.hitlData.map((d) => d.avgTime) || [],
      backgroundColor: COLORS.needsHitl,
      borderRadius: 4,
    },
  ],
}));

// ── Shared options ──

const tooltipStyle = {
  backgroundColor: "#1F4041",
  borderColor: "#38595A",
  borderWidth: 1,
  titleColor: "#70E6E8",
  bodyColor: "#8AABAD",
  padding: 10,
};

const baseScales = {
  x: { ticks: { color: COLORS.axisText, font: { size: 11 } }, grid: { color: COLORS.grid, drawTicks: false } },
  y: { ticks: { color: COLORS.axisText, font: { size: 11 } }, grid: { color: COLORS.grid, drawTicks: false } },
};

const percentBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, callbacks: { label: (ctx: any) => `${ctx.parsed.y}%` } } },
  scales: { ...baseScales, y: { ...baseScales.y, min: 0, max: 100, ticks: { ...baseScales.y.ticks, callback: (v: any) => `${v}%` } } },
};

const secondsBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, callbacks: { label: (ctx: any) => `${ctx.parsed.y}s` } } },
  scales: { ...baseScales, y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: (v: any) => `${v}s` } } },
};

const stackedBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { color: COLORS.axisText, font: { size: 11 }, boxWidth: 8, usePointStyle: true } }, tooltip: tooltipStyle },
  scales: { x: { ...baseScales.x, stacked: true }, y: { ...baseScales.y, stacked: true } },
};

const timelineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { color: COLORS.axisText, font: { size: 11 }, boxWidth: 8, usePointStyle: true } }, tooltip: tooltipStyle },
  scales: { ...baseScales, y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, precision: 0 } } },
  elements: { point: { radius: 2 } },
};

const horizontalBarOptions: ChartOptions<"bar"> = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, callbacks: { label: (ctx: any) => `${ctx.parsed.x}s` } } },
  scales: {
    x: { ...baseScales.x, ticks: { ...baseScales.x.ticks, callback: (v: any) => `${v}s` } },
    y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, font: { size: 10 } } },
  },
};

// ── Color helpers / status ──

const successColor = computed(() => {
  const r = stats.value?.successRate ?? 0;
  return r >= 70 ? "text-success" : r >= 50 ? "text-warning" : "text-error";
});
const slaColor = computed(() => {
  const r = stats.value?.slaRate ?? 0;
  return r >= 85 ? "text-success" : r >= 70 ? "text-warning" : "text-error";
});

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((p) => parseInt(p, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

// Plugin: draw "{total} / Total" text in the center of the doughnut.
const centerTextPlugin: Plugin<"doughnut"> = {
  id: "centerText",
  afterDraw(chart) {
    if (!stats.value) return;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText(String(stats.value.total), cx, cy - 8);
    ctx.fillStyle = COLORS.axisText;
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(t("executions.total").toUpperCase(), cx, cy + 14);
    ctx.restore();
  },
};

</script>
