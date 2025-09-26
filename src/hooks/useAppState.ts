import { useState, useCallback } from 'react';
import {
  AppState,
  Company,
  Subconso,
  Account,
  TrialBalance,
  ChartMapping,
  Adjustment,
  ExchangeRate,
} from '@/types';
import { toast } from '@/components/ui/sonner';

const iso = () => new Date().toISOString();

const resolveRate = (
  rates: ExchangeRate[],
  period: string,
  fromCurrency: string,
  toCurrency: string
) => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
    return 1;
  }

  const rateRecord = rates.find(
    (rate) =>
      rate.period === period &&
      rate.fromCurrency === fromCurrency &&
      rate.toCurrency === toCurrency
  );

  return rateRecord?.rate ?? 1;
};

const initialCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corp',
    code: 'ACME',
    country: 'US',
    currency: 'USD',
    ownership: 100,
    status: 'active',
    lastUpdated: iso(),
  },
  {
    id: '2',
    name: 'Global Tech Ltd',
    code: 'GTECH',
    country: 'UK',
    currency: 'GBP',
    ownership: 75,
    status: 'active',
    lastUpdated: iso(),
  },
  {
    id: '3',
    name: 'Euro Manufacturing',
    code: 'EURO',
    country: 'DE',
    currency: 'EUR',
    ownership: 60,
    status: 'active',
    lastUpdated: iso(),
  },
  {
    id: '4',
    name: 'Asia Pacific Inc',
    code: 'APAC',
    country: 'SG',
    currency: 'SGD',
    ownership: 80,
    status: 'active',
    lastUpdated: iso(),
  },
];

const initialSubconsos: Subconso[] = [
  {
    id: 'subconso-global',
    name: 'Global',
    companyIds: ['1', '2', '3', '4'],
    description: 'Full global consolidation',
    createdAt: iso(),
  },
  {
    id: 'subconso-europe',
    name: 'Europe',
    companyIds: ['2', '3'],
    description: 'European operations only',
    createdAt: iso(),
  },
  {
    id: 'subconso-asia',
    name: 'Asia-Pacific',
    companyIds: ['4'],
    description: 'Asia-Pacific operations',
    createdAt: iso(),
  },
];

const initialAccounts: Account[] = [
  { id: 'co1', code: '1000', label: 'Cash and Cash Equivalents', category: 'Current Assets', type: 'asset' },
  { id: 'co2', code: '4000', label: 'Revenue', category: 'Income', type: 'income' },
  { id: 'co3', code: '2000', label: 'Accounts Payable', category: 'Current Liabilities', type: 'liability' },
  { id: 'co4', code: '5000', label: 'Cost of Sales', category: 'Cost of Sales', type: 'expense' },
  { id: 'co5', code: '3000', label: 'Share Capital', category: 'Equity', type: 'equity' },
];

const initialTrialBalances: TrialBalance[] = [
  {
    id: 'tb-1',
    companyId: '1',
    accountCode: '1000',
    accountName: 'Cash and Cash Equivalents',
    debit: 180000,
    credit: 0,
    period: '2024-12',
    currency: 'USD',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-2',
    companyId: '1',
    accountCode: '4000',
    accountName: 'Revenue',
    debit: 0,
    credit: 420000,
    period: '2024-12',
    currency: 'USD',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-3',
    companyId: '2',
    accountCode: '1000',
    accountName: 'Cash and Cash Equivalents',
    debit: 125000,
    credit: 0,
    period: '2024-12',
    currency: 'GBP',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-4',
    companyId: '2',
    accountCode: '4000',
    accountName: 'Revenue',
    debit: 0,
    credit: 240000,
    period: '2024-12',
    currency: 'GBP',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-5',
    companyId: '3',
    accountCode: '1000',
    accountName: 'Cash and Cash Equivalents',
    debit: 95000,
    credit: 0,
    period: '2024-12',
    currency: 'EUR',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-6',
    companyId: '3',
    accountCode: '2000',
    accountName: 'Accounts Payable',
    debit: 0,
    credit: 30500,
    period: '2024-12',
    currency: 'EUR',
    uploadedAt: iso(),
    status: 'processed',
  },
  {
    id: 'tb-7',
    companyId: '4',
    accountCode: '1000',
    accountName: 'Cash and Cash Equivalents',
    debit: 65000,
    credit: 0,
    period: '2024-12',
    currency: 'SGD',
    uploadedAt: iso(),
    status: 'processed',
  },
];

const initialExchangeRates: ExchangeRate[] = [
  {
    id: 'fx-usd-usd',
    period: '2024-12',
    fromCurrency: 'USD',
    toCurrency: 'USD',
    rate: 1,
    updatedAt: iso(),
  },
  {
    id: 'fx-gbp-usd',
    period: '2024-12',
    fromCurrency: 'GBP',
    toCurrency: 'USD',
    rate: 1.27,
    updatedAt: iso(),
  },
  {
    id: 'fx-eur-usd',
    period: '2024-12',
    fromCurrency: 'EUR',
    toCurrency: 'USD',
    rate: 1.08,
    updatedAt: iso(),
  },
  {
    id: 'fx-sgd-usd',
    period: '2024-12',
    fromCurrency: 'SGD',
    toCurrency: 'USD',
    rate: 0.74,
    updatedAt: iso(),
  },
];

const initialAdjustments: Adjustment[] = [
  {
    id: 'adj-1',
    type: 'elimination',
    companyId: null,
    accountId: 'co2',
    period: '2024-12',
    sourceAmount: -50000,
    sourceCurrency: 'USD',
    groupAmount: -50000,
    groupCurrency: 'USD',
    description: 'Intercompany revenue elimination',
    reference: 'IC-001',
    createdBy: 'System',
    createdAt: iso(),
    status: 'posted',
  },
];

export function useAppState() {
  const [state, setState] = useState<AppState>({
    companies: initialCompanies,
    subconsos: initialSubconsos,
    accounts: initialAccounts,
    trialBalances: initialTrialBalances,
    chartMappings: [],
    adjustments: initialAdjustments,
    exchangeRates: initialExchangeRates,
    currentPeriod: {
      id: '2024-12',
      name: 'December 2024',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'open',
      currency: 'USD',
    },
    activeSubconsoId: 'subconso-global',
    loading: false,
    error: null,
  });

  const updateCompany = useCallback((companyId: string, updates: Partial<Company>) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === companyId
          ? { ...company, ...updates, lastUpdated: iso() }
          : company
      ),
    }));
    toast.success('Company updated successfully');
  }, []);

  const addCompany = useCallback((company: Omit<Company, 'id' | 'lastUpdated'>) => {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
      lastUpdated: iso(),
    };
    setState((prev) => ({
      ...prev,
      companies: [...prev.companies, newCompany],
    }));
    toast.success('Company added successfully');
  }, []);

  const updateSubconso = useCallback((subconsoId: string, updates: Partial<Subconso>) => {
    setState((prev) => ({
      ...prev,
      subconsos: prev.subconsos.map((subconso) =>
        subconso.id === subconsoId
          ? { ...subconso, ...updates, updatedAt: iso() }
          : subconso
      ),
    }));
    toast.success('Consolidation group updated');
  }, []);

  const addSubconso = useCallback((subconso: Omit<Subconso, 'id' | 'createdAt'>) => {
    const newSubconso: Subconso = {
      ...subconso,
      id: `subconso-${Date.now()}`,
      createdAt: iso(),
    };
    setState((prev) => ({
      ...prev,
      subconsos: [...prev.subconsos, newSubconso],
    }));
    toast.success('Consolidation group created');
  }, []);

  const deleteSubconso = useCallback((subconsoId: string) => {
    setState((prev) => ({
      ...prev,
      subconsos: prev.subconsos.filter((s) => s.id !== subconsoId),
      activeSubconsoId:
        prev.activeSubconsoId === subconsoId
          ? prev.subconsos.find((s) => s.id !== subconsoId)?.id || prev.subconsos[0]?.id || 'subconso-global'
          : prev.activeSubconsoId,
    }));
    toast.success('Consolidation group deleted');
  }, []);

  const saveChartMapping = useCallback(
    (mapping: Omit<ChartMapping, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newMapping: ChartMapping = {
        ...mapping,
        id: `mapping-${Date.now()}`,
        createdAt: iso(),
        updatedAt: iso(),
      };
      setState((prev) => ({
        ...prev,
        chartMappings: [
          ...prev.chartMappings.filter(
            (m) => !(m.companyAccountCode === mapping.companyAccountCode && m.companyId === mapping.companyId)
          ),
          newMapping,
        ],
      }));
      toast.success('Chart mapping saved');
    },
    []
  );

  const addTrialBalanceEntry = useCallback(
    (
      entry: Omit<TrialBalance, 'id' | 'uploadedAt' | 'status'> & {
        status?: TrialBalance['status'];
      }
    ) => {
      const newEntry: TrialBalance = {
        ...entry,
        id: `tb-${Date.now()}`,
        uploadedAt: iso(),
        status: entry.status ?? 'processed',
      };

      setState((prev) => ({
        ...prev,
        trialBalances: [...prev.trialBalances, newEntry],
      }));
      toast.success('Trial balance entry stored');
    },
    []
  );

  const updateTrialBalance = useCallback((trialBalanceId: string, updates: Partial<TrialBalance>) => {
    setState((prev) => ({
      ...prev,
      trialBalances: prev.trialBalances.map((entry) =>
        entry.id === trialBalanceId ? { ...entry, ...updates } : entry
      ),
    }));
    toast.success('Trial balance updated');
  }, []);

  const deleteTrialBalance = useCallback((trialBalanceId: string) => {
    setState((prev) => ({
      ...prev,
      trialBalances: prev.trialBalances.filter((entry) => entry.id !== trialBalanceId),
    }));
    toast.success('Trial balance removed');
  }, []);

  const addAdjustment = useCallback(
    (
      adjustment: Omit<Adjustment, 'id' | 'createdAt' | 'groupAmount' | 'groupCurrency'> & {
        groupCurrency?: string;
        groupAmount?: number;
      }
    ) => {
      setState((prev) => {
        const targetCurrency =
          adjustment.groupCurrency || prev.currentPeriod?.currency || adjustment.sourceCurrency;
        const rate = resolveRate(prev.exchangeRates, adjustment.period, adjustment.sourceCurrency, targetCurrency);
        const groupAmount =
          adjustment.groupAmount !== undefined
            ? adjustment.groupAmount
            : adjustment.sourceAmount * rate;

        const newAdjustment: Adjustment = {
          ...adjustment,
          id: `adj-${Date.now()}`,
          createdAt: iso(),
          groupCurrency: targetCurrency,
          groupAmount,
        };

        return {
          ...prev,
          adjustments: [...prev.adjustments, newAdjustment],
        };
      });
      toast.success('Adjustment created');
    },
    []
  );

  const updateAdjustment = useCallback((adjustmentId: string, updates: Partial<Adjustment>) => {
    setState((prev) => {
      const nextAdjustments = prev.adjustments.map((adj) => {
        if (adj.id !== adjustmentId) {
          return adj;
        }

        const updated: Adjustment = { ...adj, ...updates };
        const shouldRecalculate =
          updates.sourceAmount !== undefined ||
          updates.sourceCurrency !== undefined ||
          updates.groupCurrency !== undefined ||
          updates.period !== undefined;

        if (shouldRecalculate) {
          const targetCurrency =
            updates.groupCurrency || prev.currentPeriod?.currency || updated.groupCurrency || updated.sourceCurrency;
          const rate = resolveRate(
            prev.exchangeRates,
            updates.period || updated.period,
            updates.sourceCurrency || updated.sourceCurrency,
            targetCurrency
          );
          updated.groupCurrency = targetCurrency;
          updated.groupAmount = updated.sourceAmount * rate;
        } else if (updates.groupAmount !== undefined) {
          updated.groupAmount = updates.groupAmount;
        }

        return updated;
      });

      return {
        ...prev,
        adjustments: nextAdjustments,
      };
    });
    toast.success('Adjustment updated');
  }, []);

  const deleteAdjustment = useCallback((adjustmentId: string) => {
    setState((prev) => ({
      ...prev,
      adjustments: prev.adjustments.filter((adj) => adj.id !== adjustmentId),
    }));
    toast.success('Adjustment deleted');
  }, []);

  const upsertExchangeRate = useCallback(
    (rate: Omit<ExchangeRate, 'id' | 'updatedAt'> & { id?: string }) => {
      setState((prev) => {
        const record: ExchangeRate = {
          ...rate,
          id:
            rate.id ||
            prev.exchangeRates.find(
              (fx) =>
                fx.period === rate.period &&
                fx.fromCurrency === rate.fromCurrency &&
                fx.toCurrency === rate.toCurrency
            )?.id ||
            `fx-${Date.now()}`,
          updatedAt: iso(),
        };

        const withoutOld = prev.exchangeRates.filter((fx) => fx.id !== record.id);

        return {
          ...prev,
          exchangeRates: [...withoutOld, record],
        };
      });
      toast.success('Exchange rate saved');
    },
    []
  );

  const deleteExchangeRate = useCallback((exchangeRateId: string) => {
    setState((prev) => ({
      ...prev,
      exchangeRates: prev.exchangeRates.filter((rate) => rate.id !== exchangeRateId),
    }));
    toast.success('Exchange rate removed');
  }, []);

  const setActiveSubconso = useCallback((subconsoId: string) => {
    setState((prev) => ({ ...prev, activeSubconsoId: subconsoId }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
    if (error) {
      toast.error(error);
    }
  }, []);

  const getExchangeRate = useCallback(
    (fromCurrency: string, toCurrency: string, period?: string) => {
      const effectivePeriod = period || state.currentPeriod?.id || '';
      return resolveRate(state.exchangeRates, effectivePeriod, fromCurrency, toCurrency);
    },
    [state.exchangeRates, state.currentPeriod]
  );

  const activeSubconso =
    state.subconsos.find((s) => s.id === state.activeSubconsoId) || state.subconsos[0];
  const activeCompanies = state.companies.filter((c) => activeSubconso?.companyIds.includes(c.id));

  return {
    state,
    activeSubconso,
    activeCompanies,
    getExchangeRate,
    actions: {
      updateCompany,
      addCompany,
      updateSubconso,
      addSubconso,
      deleteSubconso,
      saveChartMapping,
      addTrialBalanceEntry,
      updateTrialBalance,
      deleteTrialBalance,
      addAdjustment,
      updateAdjustment,
      deleteAdjustment,
      upsertExchangeRate,
      deleteExchangeRate,
      setActiveSubconso,
      setLoading,
      setError,
    },
  };
}
