export interface Beneficiary {
  name: string;
  name_he?: string;
  id_number?: string;
  relation: string;
  relation_he?: string;
  percentage: number;
}

export interface MemberCore {
  member_id?: string;
  member_name?: string;
  member_name_he?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  account_number?: string;
  account_owner?: string;
  id_photo_confidence?: number;

  fund_type?: string;
  use_case?: string;

  balance?: number;
  total_balance?: number;
  transfer_balance?: number;
  general_track_balance?: number;
  stock_track_balance?: number;

  withdrawal_amount?: number;
  transfer_amount?: number;
  redemption_amount?: number;
  rebalance_amount?: number;

  start_date?: string;
  policy_minimum_holding_months?: number;
  liquidity_date?: string;
  early_withdrawal_allowed?: boolean;

  gender?: "male" | "female";
  employer?: string;

  source_track?: string;
  target_track?: string;
  transfer_percentage?: number;
  current_general_pct?: number;
  target_general_pct?: number;
  rebalance_direction?: string;

  current_employer?: string;
  new_employer?: string;
  employment_end_date?: string;
  new_employment_start_date?: string;
  gap_days?: number;
  severance_included?: boolean;
  employer_approval_received?: boolean;
  continuous_employment?: boolean;
  employer_notified?: boolean;

  redemption_reason?: string;
  supporting_documents?: boolean;
  tax_aware?: boolean;

  current_beneficiaries?: Beneficiary[];
  new_beneficiaries?: Beneficiary[];
  notary_verified?: boolean;
  beneficiary_consent_obtained?: boolean;
  change_reason?: string;
}

export type Member = MemberCore & Record<string, any>;
