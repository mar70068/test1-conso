// Core data types for the consolidation application
export interface Company {
  id: string;
  name: string;
  code: string;
  country: string;
  currency: string;
  ownership: number;
  status: 'active' | 'inactive';
  lastUpdated?: string;
}

export interface Subconso {
  id: string;
  name: string;
  companyIds: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  code: string;
  label: string;
  category: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: string;
}

export interface TrialBalance {
  id: string;
  companyId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  period: string;
  currency: string;
  uploadedAt: string;
  status: 'pending' | 'processed' | 'error';
}

export interface ChartMapping {
  id: string;
  companyAccountCode: string;
  consolidatedAccountId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Adjustment {
  id: string;
  type: 'manual' | 'elimination' | 'reclassification';
  companyId: string | null;
  accountId: string;
  period: string;
  sourceAmount: number;
  sourceCurrency: string;
  groupAmount: number;
  groupCurrency: string;
  description: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'posted';
}

export interface ConsolidationPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'locked';
  currency: string;
}

export interface ExchangeRate {
  id: string;
  period: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source?: string;
  updatedAt: string;
}

export interface AppState {
  companies: Company[];
  subconsos: Subconso[];
  accounts: Account[];
  trialBalances: TrialBalance[];
  chartMappings: ChartMapping[];
  adjustments: Adjustment[];
  exchangeRates: ExchangeRate[];
  currentPeriod: ConsolidationPeriod | null;
  activeSubconsoId: string;
  loading: boolean;
  error: string | null;
}