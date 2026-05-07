<template>
  <div
    v-if="outcome"
    :class="['animate-scale-in mt-4 rounded-xl border-2 p-5', typeStyles.bg, typeStyles.border]"
  >
    <div class="mb-3 flex items-center gap-3">
      <span class="text-2xl">{{ outcomeConfig.icon }}</span>
      <h3 class="text-text-primary text-lg font-bold">{{ t(outcomeConfig.tKey) }}</h3>
    </div>
    <p class="text-text-muted mb-4 text-sm">{{ outcome.message }}</p>

    <!-- Eligible date for blocked outcomes -->
    <div
      v-if="outcome.type === 'blocked' && outcome.eligibleDate"
      class="bg-bg-primary mb-4 rounded-lg p-3 text-xs"
    >
      <div class="flex items-center gap-2">
        <span class="text-warning">📅</span>
        <span class="text-text-primary">
          {{ t("flow.eligibleDate") }}
          <span class="text-accent ms-1 font-mono">{{ outcome.eligibleDate }}</span>
        </span>
      </div>
    </div>

    <!-- Tax breakdown -->
    <div
      v-if="outcome.type === 'tax_consent' && outcome.breakdown"
      class="bg-bg-primary mb-4 space-y-2 rounded-lg p-4"
    >
      <div class="flex justify-between text-sm">
        <span class="text-text-muted">{{ t("flow.grossAmount") }}</span>
        <span class="text-text-primary font-mono">₪{{ outcome.breakdown.gross.toLocaleString() }}</span>
      </div>
      <div
        v-if="outcome.breakdown.tax > 0"
        class="flex justify-between text-sm"
      >
        <span class="text-error">
          {{ uc === "early_redemption" ? t("flow.capitalGainsTax") : t("flow.incomeTax") }} ({{ outcome.breakdown.taxRate }}%)
        </span>
        <span class="text-error font-mono">-₪{{ outcome.breakdown.tax.toLocaleString() }}</span>
      </div>
      <div
        v-if="outcome.breakdown.fee > 0"
        class="flex justify-between text-sm"
      >
        <span class="text-warning">{{ t("flow.earlyWithdrawalFee") }} ({{ outcome.breakdown.feeRate }}%)</span>
        <span class="text-warning font-mono">-₪{{ outcome.breakdown.fee.toLocaleString() }}</span>
      </div>
      <hr class="border-border" />
      <div class="flex justify-between text-sm font-bold">
        <span class="text-success">{{ t("flow.netAmount") }}</span>
        <span class="text-success font-mono">₪{{ outcome.breakdown.net.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Track allocation for study fund withdrawal -->
    <div
      v-if="showTrackAllocation"
      class="bg-bg-primary mb-4 space-y-2 rounded-lg p-4"
    >
      <p class="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">{{ t("flow.trackAllocation") }}</p>
      <div class="flex justify-between text-sm">
        <span class="text-text-muted">{{ t("flow.totalBalance") }}</span>
        <span class="text-text-primary font-mono">₪{{ trackBreakdown.total.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-blue-300">{{ t("flow.generalTrack") }} ({{ trackBreakdown.generalPct }}%)</span>
        <span class="font-mono text-blue-300">₪{{ trackBreakdown.generalWithdraw.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-purple-300">{{ t("flow.stockTrack") }} ({{ trackBreakdown.stockPct }}%)</span>
        <span class="font-mono text-purple-300">₪{{ trackBreakdown.stockWithdraw.toLocaleString() }}</span>
      </div>
      <hr class="border-border" />
      <div class="flex justify-between text-sm font-bold">
        <span class="text-success">{{ t("flow.totalWithdrawal") }}</span>
        <span class="text-success font-mono">₪{{ trackBreakdown.amount.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Approved — execution mock + SMS -->
    <div
      v-if="outcome.type === 'approved'"
      class="space-y-2 text-xs"
    >
      <div class="bg-bg-primary text-success rounded-lg p-3 font-mono">
        <p>→ POST {{ endpoint }}</p>
        <pre
          v-if="studyApprovedPayload"
          class="text-text-muted mt-1 whitespace-pre-wrap"
        >{{ studyApprovedPayload }}</pre>
        <p class="text-text-muted mt-1">{{ t("flow.txnConfirmed") }}</p>
      </div>
      <div class="bg-bg-primary rounded-lg p-3">
        <p class="text-text-muted mb-1">{{ t("flow.smsSent") }}</p>
        <p
          class="text-text-primary"
          dir="rtl"
        >
          {{ smsText }}
        </p>
      </div>
    </div>

    <!-- Customer action -->
    <div
      v-if="outcome.type === 'customer_action'"
      class="space-y-2 text-xs"
    >
      <div class="bg-bg-primary rounded-lg p-3">
        <p class="text-text-muted mb-1">{{ t("flow.smsSent") }}</p>
        <p
          class="text-text-primary"
          dir="rtl"
        >
          {{ smsText }}
        </p>
      </div>
      <div
        v-if="outcome.subtype === 'id_photo'"
        class="bg-bg-primary rounded-lg p-3"
      >
        <p class="text-text-muted mb-1">{{ t("flow.emailSent") }}</p>
        <ul class="text-text-muted list-inside list-disc space-y-0.5">
          <li>{{ t("flow.photoGuidelines") }}</li>
          <li>
            {{ t("flow.secureUploadLink") }}
            <span class="text-accent ms-1 font-mono">secure.insurer.co.il/upload-id</span>
          </li>
          <li>{{ t("flow.futureTrigger") }}</li>
        </ul>
      </div>
      <div class="bg-bg-primary text-warning rounded-lg p-3 font-mono">
        <p>{{ t("flow.awaitingDocs") }}</p>
        <p class="text-text-muted mt-1">{{ t("flow.processCompleted") }}</p>
      </div>
    </div>

    <!-- Blocked -->
    <div
      v-if="outcome.type === 'blocked'"
      class="bg-bg-primary rounded-lg p-3 text-xs"
    >
      <p class="text-text-muted mb-1">{{ t("flow.notificationSent") }}</p>
      <p
        class="text-text-primary"
        dir="rtl"
      >
        {{ smsText }}
      </p>
    </div>

    <!-- Tax consent -->
    <div
      v-if="outcome.type === 'tax_consent'"
      class="bg-bg-primary mb-4 rounded-lg p-3 text-xs"
    >
      <p class="text-text-muted mb-1">{{ t("flow.consentMessage") }}</p>
      <p
        class="text-text-primary"
        dir="rtl"
      >
        {{ smsText }}
      </p>
    </div>

    <div
      v-if="outcome.type === 'tax_consent'"
      class="mt-4 flex gap-3"
    >
      <button
        class="bg-success text-bg-primary flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-success/80"
        @click="emit('approve')"
      >
        {{ t("flow.acceptProceed") }}
      </button>
      <button
        class="bg-error text-bg-primary flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-error/80"
        @click="emit('reject')"
      >
        {{ t("flow.cancel") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import type { Outcome, OutcomeType } from "@/domain/ClalPOC/domain/models/Outcome";

const props = defineProps<{
  outcome: Outcome | null;
  useCase: string;
  memberData: Member | null;
}>();

const emit = defineEmits<{
  (event: "approve"): void;
  (event: "reject"): void;
}>();

const { t } = useI18n();

const TYPE_STYLES: Record<string, { border: string; bg: string }> = {
  approved: { border: "border-success", bg: "bg-success/10" },
  blocked: { border: "border-error", bg: "bg-error/10" },
  customer_action: { border: "border-error", bg: "bg-error/10" },
  tax_consent: { border: "border-warning", bg: "bg-warning/10" },
  approval: { border: "border-warning", bg: "bg-warning/10" },
};

const OUTCOME_CONFIGS: Record<string, Record<string, { icon: string; tKey: string }>> = {
  withdrawal: {
    approved: { icon: "✅", tKey: "flow.outcome.withdrawalApproved" },
    blocked: { icon: "🚫", tKey: "flow.outcome.withdrawalBlocked" },
    customer_action: { icon: "📋", tKey: "flow.outcome.customerAction" },
    tax_consent: { icon: "💰", tKey: "flow.outcome.earlyWithdrawalTax" },
  },
  fund_transfer: {
    approved: { icon: "✅", tKey: "flow.outcome.fundTransferApproved" },
    blocked: { icon: "🚫", tKey: "flow.outcome.fundTransferBlocked" },
    customer_action: { icon: "📋", tKey: "flow.outcome.customerAction" },
    tax_consent: { icon: "💰", tKey: "flow.outcome.transferFees" },
    approval: { icon: "👤", tKey: "flow.outcome.transferApproval" },
  },
  beneficiary_update: {
    approved: { icon: "✅", tKey: "flow.outcome.beneficiaryApproved" },
    blocked: { icon: "🚫", tKey: "flow.outcome.beneficiaryBlocked" },
    customer_action: { icon: "📋", tKey: "flow.outcome.docsRequired" },
    tax_consent: { icon: "💰", tKey: "flow.outcome.transferFees" },
    approval: { icon: "👤", tKey: "flow.outcome.beneficiaryApproved" },
  },
  employer_change: {
    approved: { icon: "✅", tKey: "flow.outcome.employerApproved" },
    blocked: { icon: "🚫", tKey: "flow.outcome.employerBlocked" },
    customer_action: { icon: "📋", tKey: "flow.outcome.employerApprovalRequired" },
    tax_consent: { icon: "💰", tKey: "flow.outcome.transferFees" },
    approval: { icon: "👤", tKey: "flow.outcome.employerApproved" },
  },
  early_redemption: {
    approved: { icon: "✅", tKey: "flow.outcome.earlyRedemptionApproved" },
    blocked: { icon: "🚫", tKey: "flow.outcome.earlyRedemptionBlocked" },
    customer_action: { icon: "📋", tKey: "flow.outcome.docsRequired" },
    tax_consent: { icon: "💰", tKey: "flow.outcome.earlyRedemptionTax" },
    approval: { icon: "👤", tKey: "flow.outcome.redemptionApproval" },
  },
};

const API_ENDPOINTS: Record<string, string | Record<string, string>> = {
  withdrawal: {
    investment: "/api/providentfund/withdraw",
    compensation: "/api/providentfund/withdraw",
    study: "/api/studyfund/withdraw",
  },
  fund_transfer: "/api/transfers/execute",
  beneficiary_update: "/api/beneficiaries/update",
  employer_change: "/api/employers/transfer",
  early_redemption: "/api/redemptions/execute",
};

const uc = computed(() => props.useCase || props.outcome?.useCase || "withdrawal");
const fundType = computed(() => props.memberData?.fund_type || "investment");

const outcomeConfig = computed(() => {
  const ucMap = OUTCOME_CONFIGS[uc.value] || OUTCOME_CONFIGS.withdrawal;
  const t = (props.outcome?.type as OutcomeType) || "blocked";
  return ucMap[t] || ucMap.blocked || { icon: "❓", tKey: "flow.outcome.withdrawalBlocked" };
});

const typeStyles = computed(() => {
  const t = (props.outcome?.type as string) || "blocked";
  return TYPE_STYLES[t] || TYPE_STYLES.blocked;
});

const endpoint = computed(() => {
  if (uc.value === "withdrawal") {
    const map = API_ENDPOINTS.withdrawal as Record<string, string>;
    return map[fundType.value] || "/api/process/execute";
  }
  return (API_ENDPOINTS[uc.value] as string) || "/api/process/execute";
});

const trackBreakdown = computed(() => {
  const md = props.memberData;
  const general = md?.general_track_balance || 0;
  const stock = md?.stock_track_balance || 0;
  const total = general + stock;
  const amount = md?.withdrawal_amount || 0;
  const generalRatio = total > 0 ? general / total : 0;
  const stockRatio = total > 0 ? stock / total : 0;
  return {
    total,
    amount,
    generalPct: Math.round(generalRatio * 100),
    stockPct: Math.round(stockRatio * 100),
    generalWithdraw: Math.round(amount * generalRatio),
    stockWithdraw: Math.round(amount * stockRatio),
  };
});

const showTrackAllocation = computed(
  () =>
    props.outcome?.type === "approved" &&
    fundType.value === "study" &&
    uc.value === "withdrawal" &&
    !!props.memberData?.general_track_balance &&
    !!props.memberData?.stock_track_balance
);

const studyApprovedPayload = computed(() => {
  if (!showTrackAllocation.value || !props.memberData) return null;
  return `{
  "account_number": "${props.memberData.account_number}",
  "withdraw_amount": ${trackBreakdown.value.amount},
  "general_track_withdrawal": ${trackBreakdown.value.generalWithdraw},
  "stock_track_withdrawal": ${trackBreakdown.value.stockWithdraw}
}`;
});

const txnId = `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Hebrew SMS templates per fund type and outcome — these stay as inline content (not i18n keys)
function buildSms(): string {
  if (!props.outcome) return "";
  const type = props.outcome.type;
  const md = props.memberData || ({} as any);

  if (uc.value === "withdrawal") {
    if (fundType.value === "investment") {
      if (type === "approved") {
        return `בקשת המשיכה מקופת הגמל להשקעה אושרה. סכום משיכה: ${md.withdrawal_amount?.toLocaleString() || "—"} ₪ הכסף יועבר לחשבונך תוך 3 ימי עסקים. מספר אסמכתא: ${txnId}`;
      }
      if (type === "blocked") {
        if (props.outcome.message?.includes("holding period")) {
          const eligible = props.outcome.eligibleDate ? new Date(props.outcome.eligibleDate).toLocaleDateString("he-IL") : null;
          return `בקשת המשיכה מקופת הגמל להשקעה התקבלה, אך לא ניתן לבצע משיכה בשלב זה. על פי תנאי הפוליסה נדרש להחזיק את הכספים לפחות ${md.policy_minimum_holding_months || 12} חודשים לפני משיכה.${eligible ? ` תוכל להגיש בקשה מחדש לאחר ${eligible}.` : ""}`;
        }
        return "בקשת המשיכה מקופת הגמל להשקעה נדחתה. לפרטים נוספים אנא פנה/י לשירות הלקוחות.";
      }
      if (type === "customer_action") {
        if (props.outcome.subtype === "bank_account") {
          return "בקשת המשיכה שלך התקבלה, אך חשבון הבנק שהוזן אינו רשום על שמך. אנא עדכן את פרטי חשבון הבנק.";
        }
        return "בקשת המשיכה שלך התקבלה, אך צילום תעודת הזהות אינו תקין. אנא העלה צילום ברור של תעודת הזהות. קישור: secure.insurer.co.il/upload-id";
      }
    }
    if (fundType.value === "compensation") {
      if (type === "approved") {
        return `בקשת המשיכה מקופת גמל לפיצויים אושרה. סכום ברוטו: ${md.withdrawal_amount?.toLocaleString() || "—"} ₪ הכסף יועבר לחשבונך תוך 3 ימי עסקים. מספר אסמכתא: ${txnId}`;
      }
      if (type === "blocked" && props.outcome.message?.includes("retirement")) {
        return `בקשת המשיכה מקופת גמל לפיצויים התקבלה, אך לא ניתן לבצע משיכה בשלב זה. על פי תקנות הקרן ניתן למשוך כספים רק לאחר גיל הפרישה. ${md.gender === "female" ? "לנשים: גיל 62" : "לגברים: גיל 67"}`;
      }
      if (type === "blocked") {
        return "בקשת המשיכה מקופת גמל לפיצויים נדחתה. לפרטים נוספים אנא פנה/י לשירות הלקוחות.";
      }
      if (type === "tax_consent" && props.outcome.breakdown) {
        const b = props.outcome.breakdown;
        return `בקשת המשיכה שלך מקופת גמל לפיצויים התקבלה. מאחר ולא הגעת לגיל פרישה, המשיכה כרוכה בתשלום מס ודמי משיכה מוקדמת. סכום המשיכה: ${b.gross.toLocaleString()} ₪ מס: ${b.tax.toLocaleString()} ₪ עמלה מיוחדת: ${b.fee.toLocaleString()} ₪ סכום נטו: ${b.net.toLocaleString()} ₪ האם לאשר את המשיכה?`;
      }
      if (type === "customer_action") {
        if (props.outcome.subtype === "bank_account") {
          return "בקשת המשיכה שלך התקבלה, אך חשבון הבנק שהוזן אינו רשום על שמך. אנא עדכן את פרטי חשבון הבנק.";
        }
        return "בקשת המשיכה שלך התקבלה, אך צילום תעודת הזהות אינו תקין. אנא העלה צילום ברור של תעודת הזהות. קישור: secure.insurer.co.il/upload-id";
      }
    }
    if (fundType.value === "study") {
      if (type === "approved") {
        return `בקשת המשיכה מקרן ההשתלמות אושרה. סכום המשיכה: ${md.withdrawal_amount?.toLocaleString() || "—"} ₪ הכספים יועברו לחשבונך תוך 3 ימי עסקים. מספר אסמכתא: ${txnId}`;
      }
      if (type === "blocked" && props.outcome.message?.includes("liquidity")) {
        const liq = md.liquidity_date ? new Date(md.liquidity_date).toLocaleDateString("he-IL") : "—";
        return `בקשת המשיכה מקרן ההשתלמות התקבלה. על פי תנאי הקרן ניתן למשוך כספים רק לאחר תאריך הנזילות: ${liq}. תוכל להגיש בקשה מחדש לאחר מועד זה.`;
      }
      if (type === "blocked") {
        return "בקשת המשיכה מקרן ההשתלמות נדחתה. לפרטים נוספים אנא פנה/י לשירות הלקוחות.";
      }
      if (type === "customer_action") {
        if (props.outcome.subtype === "bank_account") {
          return "בקשת המשיכה שלך התקבלה, אך חשבון הבנק שהוזן אינו רשום על שמך. אנא עדכן את פרטי חשבון הבנק.";
        }
        return "בקשת המשיכה שלך התקבלה, אך צילום תעודת הזהות אינו תקין. אנא העלה צילום ברור של תעודת הזהות. קישור: secure.insurer.co.il/upload-id";
      }
    }
  }

  // Other use cases
  const ucSms: Record<string, Record<string, string>> = {
    fund_transfer: {
      approved: `בקשת ההעברה בין מסלולים אושרה ותתבצע בתוך 2 ימי עסקים. מספר אסמכתא: ${txnId}`,
      customer_action: "לא הצלחנו לאמת את זהותך באופן דיגיטלי. אנא פנה/י לשירות הלקוחות להשלמת בקשת ההעברה.",
    },
    beneficiary_update: {
      approved: `עדכון המוטבים שלך אושר. השינויים ייכנסו לתוקף בתוך 14 ימי עסקים. מספר אסמכתא: ${txnId}`,
      customer_action: "נדרשת הגשת מסמכים נוספים לצורך עדכון המוטבים. אנא פנה/י לשירות הלקוחות.",
    },
    employer_change: {
      approved: `בקשת החלפת המעסיק אושרה. העברת הכספים תתבצע בתוך 5 ימי עסקים. מספר אסמכתא: ${txnId}`,
      customer_action: "נדרש אישור מהמעסיק הקודם להשלמת תהליך ההעברה. אנא פנה/י לשירות הלקוחות.",
    },
    early_redemption: {
      approved: `בקשת הפדיון המוקדם אושרה. הכספים יועברו לחשבונך בתוך 5 ימי עסקים. מספר אסמכתא: ${txnId}`,
      customer_action: "נדרשת הגשת מסמכים תומכים לצורך פדיון מוקדם. אנא פנה/י לשירות הלקוחות.",
    },
  };
  return ucSms[uc.value]?.[type] || `בקשתך התקבלה. מספר אסמכתא: ${txnId}`;
}

const smsText = computed(() => buildSms());
</script>
