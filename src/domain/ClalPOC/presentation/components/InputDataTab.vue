<template>
  <div
    v-if="!memberData"
    class="text-text-muted flex items-center justify-center py-16 text-sm italic"
  >
    {{ t("dataTabs.generateToSeeContract") }}
  </div>
  <div
    v-else
    class="animate-fade-in-up space-y-4"
  >
    <div class="mb-2 flex items-center gap-2">
      <span class="bg-accent/20 text-accent rounded-full px-2 py-0.5 text-xs font-medium">
        {{ memberData.fund_type_he }}
      </span>
      <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', ucBadgeColor]">
        {{ ucBadgeHe }} — {{ ucBadgeEn }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <InputField
        v-for="[labelKey, field, type] in COMMON_FIELDS"
        :key="field"
        :label="t(labelKey)"
        :model-value="memberData[field]"
        :type="type"
        @update:model-value="(v) => update(field, v)"
      />
    </div>

    <hr class="border-[var(--color-border)]" />
    <h4 class="text-text-muted text-xs tracking-wider uppercase">{{ t("dataTabs.fundData") }}</h4>

    <div class="grid grid-cols-2 gap-3">
      <InputField
        v-for="[labelKey, field, type] in fundFields"
        :key="field"
        :label="t(labelKey)"
        :model-value="memberData[field]"
        :type="type"
        @update:model-value="(v) => update(field, v)"
      />
    </div>

    <hr class="border-[var(--color-border)]" />
    <h4 class="text-text-muted text-xs tracking-wider uppercase">
      {{ t(UC_DATA_KEYS[memberData.use_case || "withdrawal"] || "dataTabs.withdrawalData") }}
    </h4>

    <div class="grid grid-cols-2 gap-3">
      <template
        v-for="[labelKey, field, type] in useCaseFields"
        :key="field"
      >
        <div v-if="BOOLEAN_FIELDS.includes(field)">
          <label class="text-text-muted mb-1 block text-xs">{{ t(labelKey) }}</label>
          <select
            :value="String(memberData[field])"
            class="bg-bg-primary text-text-primary w-full rounded border border-[var(--color-border)] px-3 py-1.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            @change="update(field, ($event.target as HTMLSelectElement).value === 'true')"
          >
            <option value="true">{{ t("dataTabs.yes") }}</option>
            <option value="false">{{ t("dataTabs.no") }}</option>
          </select>
        </div>
        <InputField
          v-else
          :label="t(labelKey)"
          :model-value="memberData[field]"
          :type="type"
          @update:model-value="(v) => update(field, v)"
        />
      </template>
    </div>

    <BeneficiaryList
      v-if="memberData.current_beneficiaries"
      :label="t('dataTabs.currentBeneficiaries')"
      :beneficiaries="memberData.current_beneficiaries"
    />
    <BeneficiaryList
      v-if="memberData.new_beneficiaries"
      :label="t('dataTabs.newBeneficiaries')"
      :beneficiaries="memberData.new_beneficiaries"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import BeneficiaryList from "@/domain/ClalPOC/presentation/components/BeneficiaryList.vue";
import InputField from "@/domain/ClalPOC/presentation/components/InputField.vue";

type FieldDef = [labelKey: string, field: string, type?: string];

const props = defineProps<{
  memberData: Member | null;
}>();

const emit = defineEmits<{
  (event: "update:memberData", patch: Partial<Member>): void;
}>();

const { t } = useI18n();

const COMMON_FIELDS: FieldDef[] = [
  ["dataTabs.memberId", "member_id"],
  ["dataTabs.memberName", "member_name"],
  ["dataTabs.birthDate", "birth_date", "date"],
  ["dataTabs.phone", "phone"],
  ["dataTabs.email", "email"],
  ["dataTabs.accountNumber", "account_number"],
  ["dataTabs.accountOwner", "account_owner"],
  ["dataTabs.idPhotoConfidence", "id_photo_confidence", "number"],
];

const FUND_FIELDS: Record<string, FieldDef[]> = {
  investment: [["dataTabs.balance", "balance", "number"]],
  compensation: [
    ["dataTabs.gender", "gender"],
    ["dataTabs.employer", "employer"],
    ["dataTabs.balance", "balance", "number"],
  ],
  study: [
    ["dataTabs.generalTrackBalance", "general_track_balance", "number"],
    ["dataTabs.stockTrackBalance", "stock_track_balance", "number"],
    ["dataTabs.totalBalance", "total_balance", "number"],
  ],
};

const USE_CASE_FIELDS: Record<string, FieldDef[]> = {
  investment_withdrawal: [
    ["dataTabs.withdrawalAmount", "withdrawal_amount", "number"],
    ["dataTabs.startDate", "start_date", "date"],
    ["dataTabs.minHoldingMonths", "policy_minimum_holding_months", "number"],
  ],
  investment_fund_transfer: [
    ["dataTabs.sourceTrack", "source_track"],
    ["dataTabs.targetTrack", "target_track"],
    ["dataTabs.sourceTrackBalance", "source_track_balance", "number"],
    ["dataTabs.transferAmount", "transfer_amount", "number"],
    ["dataTabs.transferPercentage", "transfer_percentage", "number"],
  ],
  investment_beneficiary_update: [
    ["dataTabs.changeReason", "change_reason"],
    ["dataTabs.notaryVerified", "notary_verified"],
    ["dataTabs.consentObtained", "beneficiary_consent_obtained"],
  ],
  compensation_withdrawal: [
    ["dataTabs.withdrawalAmount", "withdrawal_amount", "number"],
    ["dataTabs.earlyWithdrawalAllowed", "early_withdrawal_allowed"],
  ],
  compensation_employer_change: [
    ["dataTabs.currentEmployer", "current_employer"],
    ["dataTabs.newEmployer", "new_employer"],
    ["dataTabs.employmentEndDate", "employment_end_date", "date"],
    ["dataTabs.newEmploymentStartDate", "new_employment_start_date", "date"],
    ["dataTabs.transferBalance", "transfer_balance", "number"],
    ["dataTabs.gapDays", "gap_days", "number"],
    ["dataTabs.severanceIncluded", "severance_included"],
    ["dataTabs.employerApproval", "employer_approval_received"],
    ["dataTabs.continuousEmployment", "continuous_employment"],
  ],
  compensation_beneficiary_update: [
    ["dataTabs.changeReason", "change_reason"],
    ["dataTabs.notaryVerified", "notary_verified"],
    ["dataTabs.consentObtained", "beneficiary_consent_obtained"],
    ["dataTabs.employerNotified", "employer_notified"],
  ],
  study_withdrawal: [
    ["dataTabs.withdrawalAmount", "withdrawal_amount", "number"],
    ["dataTabs.liquidityDate", "liquidity_date", "date"],
  ],
  study_fund_transfer: [
    ["dataTabs.currentGeneralTrack", "current_general_pct", "number"],
    ["dataTabs.currentStockTrack", "current_stock_pct", "number"],
    ["dataTabs.targetGeneralTrack", "target_general_pct", "number"],
    ["dataTabs.targetStockTrack", "target_stock_pct", "number"],
    ["dataTabs.rebalanceAmount", "rebalance_amount", "number"],
    ["dataTabs.rebalanceDirection", "rebalance_direction"],
  ],
  study_early_redemption: [
    ["dataTabs.redemptionAmount", "redemption_amount", "number"],
    ["dataTabs.redemptionReason", "redemption_reason"],
    ["dataTabs.supportingDocuments", "supporting_documents"],
    ["dataTabs.taxAware", "tax_aware"],
    ["dataTabs.employerNotified", "employer_notified"],
    ["dataTabs.liquidityDate", "liquidity_date", "date"],
  ],
};

const BOOLEAN_FIELDS = [
  "early_withdrawal_allowed",
  "notary_verified",
  "beneficiary_consent_obtained",
  "employer_approval_received",
  "employer_notified",
  "continuous_employment",
  "severance_included",
  "supporting_documents",
  "tax_aware",
];

const UC_DATA_KEYS: Record<string, string> = {
  withdrawal: "dataTabs.withdrawalData",
  fund_transfer: "dataTabs.fundTransferData",
  beneficiary_update: "dataTabs.beneficiaryData",
  employer_change: "dataTabs.employerData",
  early_redemption: "dataTabs.earlyRedemptionData",
};

const USE_CASE_BADGES: Record<string, { label: string; labelHe: string; color: string }> = {
  withdrawal: { label: "Withdrawal", labelHe: "משיכה", color: "bg-amber-500/20 text-amber-300" },
  fund_transfer: { label: "Fund Transfer", labelHe: "העברה בין מסלולים", color: "bg-blue-500/20 text-blue-300" },
  beneficiary_update: { label: "Beneficiary Update", labelHe: "עדכון מוטבים", color: "bg-purple-500/20 text-purple-300" },
  employer_change: { label: "Employer Change", labelHe: "החלפת מעסיק", color: "bg-emerald-500/20 text-emerald-300" },
  early_redemption: { label: "Early Redemption", labelHe: "פדיון מוקדם", color: "bg-red-500/20 text-red-300" },
};

const fundFields = computed<FieldDef[]>(() => {
  const ft = props.memberData?.fund_type;
  return ft ? FUND_FIELDS[ft] || [] : [];
});

const useCaseFields = computed<FieldDef[]>(() => {
  const ft = props.memberData?.fund_type;
  const uc = props.memberData?.use_case || "withdrawal";
  if (!ft) return [];
  return USE_CASE_FIELDS[`${ft}_${uc}`] || [];
});

const ucBadge = computed(() => {
  const uc = props.memberData?.use_case || "withdrawal";
  return USE_CASE_BADGES[uc] || USE_CASE_BADGES.withdrawal;
});
const ucBadgeEn = computed(() => ucBadge.value.label);
const ucBadgeHe = computed(() => ucBadge.value.labelHe);
const ucBadgeColor = computed(() => ucBadge.value.color);

function update(field: string, value: any) {
  emit("update:memberData", { [field]: value });
}
</script>
