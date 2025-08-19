// useSupabaseData.ts
//
// This module defines reusable React Query hooks to fetch data from
// Supabase tables that match the core interfaces used in the
// consolidation application. Each hook encapsulates the query logic
// so that components can simply call the hook and receive typed
// results and loading/error states.

import { useQuery } from '@tanstack/react-query';
import supabase from '../supabaseClient';
import type {
  Company,
  Subconso,
  Account,
  TrialBalance,
  ChartMapping,
  Adjustment,
  ConsolidationPeriod,
} from '../types';

/**
 * Fetch all companies from the `companies` table.
 *
 * Returns an array of Company objects on success. Errors thrown by
 * Supabase are surfaced through the query's `error` field.
 */
export function useCompanies() {
  return useQuery<Company[], Error>({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*');
      if (error) throw error;
      // The Supabase client returns camelCased columns by default when
      // using JavaScript, which matches our Company interface. If you
      // prefer to control casing manually, adjust this mapping.
      return (data ?? []) as Company[];
    },
  });
}

/**
 * Fetch all subconsolidations (subconsos) from the `subconsos` table.
 *
 * Supabase returns column names exactly as defined in your table. This
 * hook maps the snake_case column names (e.g. `company_ids`) to the
 * camelCase fields expected by the Subconso interface. Adjust the
 * mapping if your schema differs.
 */
export function useSubconsos() {
  return useQuery<Subconso[], Error>({
    queryKey: ['subconsos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subconsos').select('*');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        companyIds: row.company_ids ?? [],
        createdAt: row.created_at ?? undefined,
        updatedAt: row.updated_at ?? undefined,
      })) as Subconso[];
    },
  });
}

/**
 * Fetch the chart of accounts from the `accounts` table. This hook
 * assumes your table columns align with the Account interface. If
 * column names differ, adjust the property names accordingly.
 */
export function useAccounts() {
  return useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounts').select('*');
      if (error) throw error;
      return (data ?? []) as Account[];
    },
  });
}

/**
 * Fetch trial balance records from the `trial_balances` table. The
 * returned rows are mapped to match the TrialBalance interface used
 * in the application. Adjust the mapping for your schema as needed.
 */
export function useTrialBalances() {
  return useQuery<TrialBalance[], Error>({
    queryKey: ['trialBalances'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trial_balances').select('*');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        accountCode: row.account_code,
        accountName: row.account_name,
        debit: row.debit,
        credit: row.credit,
        period: row.period,
        currency: row.currency,
        uploadedAt: row.uploaded_at,
        status: row.status,
      })) as TrialBalance[];
    },
  });
}

/**
 * Fetch all chart mappings from the `chart_mappings` table. The
 * mapping between database column names and the ChartMapping
 * interface is applied here. Adjust as needed for your schema.
 */
export function useChartMappings() {
  return useQuery<ChartMapping[], Error>({
    queryKey: ['chartMappings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('chart_mappings').select('*');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        companyAccountCode: row.company_account_code,
        consolidatedAccountId: row.consolidated_account_id,
        companyId: row.company_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) as ChartMapping[];
    },
  });
}

/**
 * Fetch all adjustments from the `adjustments` table. The mapping
 * here ensures column names are converted to match the Adjustment
 * interface. Adjust the mapping if your table schema differs.
 */
export function useAdjustments() {
  return useQuery<Adjustment[], Error>({
    queryKey: ['adjustments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('adjustments').select('*');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        type: row.type,
        companyId: row.company_id,
        accountId: row.account_id,
        amount: row.amount,
        currency: row.currency,
        description: row.description,
        reference: row.reference ?? undefined,
        createdBy: row.created_by,
        createdAt: row.created_at,
        status: row.status,
      })) as Adjustment[];
    },
  });
}

/**
 * Fetch all consolidation periods from the `consolidation_periods` table.
 */
export function useConsolidationPeriods() {
  return useQuery<ConsolidationPeriod[], Error>({
    queryKey: ['consolidationPeriods'],
    queryFn: async () => {
      const { data, error } = await supabase.from('consolidation_periods').select('*');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        currency: row.currency,
      })) as ConsolidationPeriod[];
    },
  });
}
