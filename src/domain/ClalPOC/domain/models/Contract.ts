export type ClauseConsequence =
  | "block"
  | "require_approval"
  | "require_hitl"
  | "apply_fee"
  | "notify";

export interface ClauseCondition {
  field?: string;
  operator?: string;
  value?: string | number | boolean;
  description?: string;
  descriptionHe?: string;
}

export interface ContractClause {
  clause_id: string;
  category: string;
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  conditions?: ClauseCondition[];
  consequence?: ClauseConsequence;
  sla_business_days?: number;
  sla_complex_business_days?: number;
  [key: string]: any;
}

export interface Contract {
  contract_id: string;
  customer_name: string;
  customer_name_he?: string;
  insurance_company?: string;
  effective_date?: string;
  expiry_date?: string;
  fund_type?: string;
  clauses: ContractClause[];
  [key: string]: any;
}
