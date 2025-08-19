import { useState, useCallback, useEffect } from 'react';
import { AppState, Company, Subconso, Account, TrialBalance, ChartMapping, Adjustment } from '@/types';
import { toast } from '@/components/ui/sonner';

// Mock data - in real app, this would come from API
const initialCompanies: Company[] = [
  { 
    id: "1", 
    name: "Acme Corp", 
    code: "ACME", 
    country: "US", 
    currency: "USD", 
    ownership: 100,
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
  { 
    id: "2", 
    name: "Global Tech Ltd", 
    code: "GTECH", 
    country: "UK", 
    currency: "GBP", 
    ownership: 75,
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
  { 
    id: "3", 
    name: "Euro Manufacturing", 
    code: "EURO", 
    country: "DE", 
    currency: "EUR", 
    ownership: 60,
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
  { 
    id: "4", 
    name: "Asia Pacific Inc", 
    code: "APAC", 
    country: "SG", 
    currency: "SGD", 
    ownership: 80,
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
];

const initialSubconsos: Subconso[] = [
  { 
    id: "subconso-global", 
    name: "Global", 
    companyIds: ["1", "2", "3", "4"],
    description: "Full global consolidation",
    createdAt: new Date().toISOString()
  },
  { 
    id: "subconso-europe", 
    name: "Europe", 
    companyIds: ["2", "3"],
    description: "European operations only",
    createdAt: new Date().toISOString()
  },
  { 
    id: "subconso-asia", 
    name: "Asia-Pacific", 
    companyIds: ["4"],
    description: "Asia-Pacific operations",
    createdAt: new Date().toISOString()
  },
];

const initialAccounts: Account[] = [
  { id: "co1", code: "1000", label: "Cash and Cash Equivalents", category: "Current Assets", type: "asset" },
  { id: "co2", code: "4000", label: "Revenue", category: "Income", type: "income" },
  { id: "co3", code: "2000", label: "Accounts Payable", category: "Current Liabilities", type: "liability" },
  { id: "co4", code: "5000", label: "Cost of Sales", category: "Cost of Sales", type: "expense" },
  { id: "co5", code: "3000", label: "Share Capital", category: "Equity", type: "equity" },
];

export function useAppState() {
  const [state, setState] = useState<AppState>({
    companies: initialCompanies,
    subconsos: initialSubconsos,
    accounts: initialAccounts,
    trialBalances: [],
    chartMappings: [],
    adjustments: [],
    currentPeriod: {
      id: "2024-12",
      name: "December 2024",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      status: "open",
      currency: "USD"
    },
    activeSubconsoId: "subconso-global",
    loading: false,
    error: null,
  });

  // Companies
  const updateCompany = useCallback((companyId: string, updates: Partial<Company>) => {
    setState(prev => ({
      ...prev,
      companies: prev.companies.map(company =>
        company.id === companyId 
          ? { ...company, ...updates, lastUpdated: new Date().toISOString() }
          : company
      )
    }));
    toast.success("Company updated successfully");
  }, []);

  const addCompany = useCallback((company: Omit<Company, 'id' | 'lastUpdated'>) => {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany]
    }));
    toast.success("Company added successfully");
  }, []);

  // Subconsos
  const updateSubconso = useCallback((subconsoId: string, updates: Partial<Subconso>) => {
    setState(prev => ({
      ...prev,
      subconsos: prev.subconsos.map(subconso =>
        subconso.id === subconsoId 
          ? { ...subconso, ...updates, updatedAt: new Date().toISOString() }
          : subconso
      )
    }));
    toast.success("Consolidation group updated");
  }, []);

  const addSubconso = useCallback((subconso: Omit<Subconso, 'id' | 'createdAt'>) => {
    const newSubconso: Subconso = {
      ...subconso,
      id: `subconso-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      subconsos: [...prev.subconsos, newSubconso]
    }));
    toast.success("Consolidation group created");
  }, []);

  const deleteSubconso = useCallback((subconsoId: string) => {
    setState(prev => ({
      ...prev,
      subconsos: prev.subconsos.filter(s => s.id !== subconsoId),
      activeSubconsoId: prev.activeSubconsoId === subconsoId 
        ? prev.subconsos.find(s => s.id !== subconsoId)?.id || prev.subconsos[0]?.id
        : prev.activeSubconsoId
    }));
    toast.success("Consolidation group deleted");
  }, []);

  // Chart Mappings
  const saveChartMapping = useCallback((mapping: Omit<ChartMapping, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMapping: ChartMapping = {
      ...mapping,
      id: `mapping-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      chartMappings: [...prev.chartMappings.filter(m => 
        !(m.companyAccountCode === mapping.companyAccountCode && m.companyId === mapping.companyId)
      ), newMapping]
    }));
    toast.success("Chart mapping saved");
  }, []);

  // Adjustments
  const addAdjustment = useCallback((adjustment: Omit<Adjustment, 'id' | 'createdAt'>) => {
    const newAdjustment: Adjustment = {
      ...adjustment,
      id: `adj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      adjustments: [...prev.adjustments, newAdjustment]
    }));
    toast.success("Adjustment created");
  }, []);

  const updateAdjustment = useCallback((adjustmentId: string, updates: Partial<Adjustment>) => {
    setState(prev => ({
      ...prev,
      adjustments: prev.adjustments.map(adj =>
        adj.id === adjustmentId ? { ...adj, ...updates } : adj
      )
    }));
    toast.success("Adjustment updated");
  }, []);

  const deleteAdjustment = useCallback((adjustmentId: string) => {
    setState(prev => ({
      ...prev,
      adjustments: prev.adjustments.filter(adj => adj.id !== adjustmentId)
    }));
    toast.success("Adjustment deleted");
  }, []);

  // General
  const setActiveSubconso = useCallback((subconsoId: string) => {
    setState(prev => ({ ...prev, activeSubconsoId: subconsoId }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
    if (error) {
      toast.error(error);
    }
  }, []);

  // Computed values
  const activeSubconso = state.subconsos.find(s => s.id === state.activeSubconsoId) || state.subconsos[0];
  const activeCompanies = state.companies.filter(c => activeSubconso?.companyIds.includes(c.id));

  return {
    state,
    activeSubconso,
    activeCompanies,
    actions: {
      updateCompany,
      addCompany,
      updateSubconso,
      addSubconso,
      deleteSubconso,
      saveChartMapping,
      addAdjustment,
      updateAdjustment,
      deleteAdjustment,
      setActiveSubconso,
      setLoading,
      setError,
    }
  };
}