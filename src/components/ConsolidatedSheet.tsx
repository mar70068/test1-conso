import { Fragment, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

import { useAppState } from "@/hooks/useAppState";

interface CompanyValue {
  local: number;
  currency: string;
  group: number;
}

interface AggregatedAccount {
  key: string;
  code: string;
  label: string;
  category: string;
  values: Record<string, CompanyValue>;
  adjustmentsGroup: number;
}

export default function ConsolidatedSheet() {
  const { state, activeCompanies, getExchangeRate } = useAppState();
  const periodId = state.currentPeriod?.id || "";
  const groupCurrency = state.currentPeriod?.currency || "";
  const companyIds = useMemo(() => new Set(activeCompanies.map((company) => company.id)), [activeCompanies]);

  const accountData = useMemo(() => {
    const mapping = new Map<string, string>();
    state.chartMappings.forEach((item) => {
      mapping.set(`${item.companyId}-${item.companyAccountCode}`, item.consolidatedAccountId);
    });

    const aggregate = new Map<string, AggregatedAccount>();

    const ensureAccount = (
      accountId: string,
      fallbackCode: string,
      fallbackLabel: string,
      category: string
    ) => {
      if (!aggregate.has(accountId)) {
        aggregate.set(accountId, {
          key: accountId,
          code: fallbackCode,
          label: fallbackLabel,
          category,
          values: {},
          adjustmentsGroup: 0,
        });
      }
      return aggregate.get(accountId)!;
    };

    state.trialBalances
      .filter((entry) => entry.period === periodId && companyIds.has(entry.companyId))
      .forEach((entry) => {
        const mappedAccountId = mapping.get(`${entry.companyId}-${entry.accountCode}`);
        const consolidatedAccount = mappedAccountId
          ? state.accounts.find((account) => account.id === mappedAccountId)
          : state.accounts.find((account) => account.code === entry.accountCode);

        const accountKey = consolidatedAccount?.id || `unmapped-${entry.accountCode}`;
        const accountLabel = consolidatedAccount?.label || entry.accountName || entry.accountCode;
        const category = consolidatedAccount?.category || "Unmapped";
        const accountRecord = ensureAccount(accountKey, entry.accountCode, accountLabel, category);

        const net = entry.debit - entry.credit;
        const company = state.companies.find((item) => item.id === entry.companyId);
        const currency = entry.currency || company?.currency || groupCurrency;
        const rate = getExchangeRate(currency, groupCurrency, entry.period);
        const groupAmount = net * rate;

        const existing = accountRecord.values[entry.companyId] || {
          local: 0,
          currency,
          group: 0,
        };

        accountRecord.values[entry.companyId] = {
          local: existing.local + net,
          currency,
          group: existing.group + groupAmount,
        };
      });

    state.adjustments
      .filter(
        (adjustment) =>
          adjustment.period === periodId &&
          (adjustment.companyId === null || companyIds.has(adjustment.companyId))
      )
      .forEach((adjustment) => {
        const account = state.accounts.find((item) => item.id === adjustment.accountId);
        const accountKey = account?.id || adjustment.accountId;
        const accountRecord = ensureAccount(
          accountKey,
          account?.code || adjustment.accountId,
          account?.label || "Adjustment",
          account?.category || "Adjustments"
        );

        if (adjustment.companyId) {
          const existing = accountRecord.values[adjustment.companyId] || {
            local: 0,
            currency: adjustment.sourceCurrency,
            group: 0,
          };
          accountRecord.values[adjustment.companyId] = {
            local: existing.local + adjustment.sourceAmount,
            currency: adjustment.sourceCurrency,
            group: existing.group + adjustment.groupAmount,
          };
        }

        accountRecord.adjustmentsGroup += adjustment.groupAmount;
      });

    return Array.from(aggregate.values()).sort((a, b) => {
      if (a.category === b.category) {
        return a.code.localeCompare(b.code);
      }
      return a.category.localeCompare(b.category);
    });
  }, [
    state.trialBalances,
    state.chartMappings,
    state.accounts,
    state.adjustments,
    state.companies,
    periodId,
    companyIds,
    getExchangeRate,
    groupCurrency,
  ]);

  const categories = useMemo(() => {
    const grouped = new Map<string, AggregatedAccount[]>();
    accountData.forEach((account) => {
      const list = grouped.get(account.category) || [];
      list.push(account);
      grouped.set(account.category, list);
    });
    return grouped;
  }, [accountData]);

  const totals = useMemo(() => {
    let total = 0;
    accountData.forEach((account) => {
      const companySum = Object.values(account.values).reduce((sum, value) => sum + value.group, 0);
      total += companySum + account.adjustmentsGroup;
    });
    return total;
  }, [accountData]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Consolidated Trial Balance</CardTitle>
          <CardDescription>
            Converted to {groupCurrency} using maintained exchange rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                {activeCompanies.map((company) => (
                  <TableHead key={company.id} className="text-right">
                    {company.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total ({groupCurrency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(categories.entries()).map(([category, accounts]) => (
                <Fragment key={category}>
                  {accounts.map((account, index) => {
                    const totalGroup = Object.values(account.values).reduce(
                      (sum, value) => sum + value.group,
                      0
                    );
                    const totalWithAdjustments = totalGroup + account.adjustmentsGroup;
                    return (
                      <TableRow key={account.key}>
                        <TableCell className="align-top font-medium">
                          {index === 0 ? category : ""}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="font-semibold text-slate-900">
                            {account.code}
                          </div>
                          <div className="text-xs text-slate-500">{account.label}</div>
                          {account.adjustmentsGroup !== 0 && (
                            <div className="text-xs text-amber-600">Adj: {account.adjustmentsGroup.toLocaleString(undefined, {
                              style: "currency",
                              currency: groupCurrency,
                            })}</div>
                          )}
                        </TableCell>
                        {activeCompanies.map((company) => {
                          const value = account.values[company.id];
                          if (!value) {
                            return (
                              <TableCell key={company.id} className="text-right text-slate-300">
                                —
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={company.id} className="text-right text-sm">
                              <div>
                                {value.local.toLocaleString(undefined, {
                                  style: "currency",
                                  currency: value.currency,
                                })}
                              </div>
                              {value.currency !== groupCurrency && (
                                <div className="text-xs text-slate-500">
                                  {value.group.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: groupCurrency,
                                  })}
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-semibold text-slate-900">
                          {totalWithAdjustments.toLocaleString(undefined, {
                            style: "currency",
                            currency: groupCurrency,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-slate-50" key={`${category}-subtotal`}>
                    <TableCell colSpan={activeCompanies.length + 1} className="text-right font-semibold">
                      Subtotal {category}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {accounts
                        .reduce((sum, account) => {
                          const companySum = Object.values(account.values).reduce(
                            (subtotal, value) => subtotal + value.group,
                            0
                          );
                          return sum + companySum + account.adjustmentsGroup;
                        }, 0)
                        .toLocaleString(undefined, {
                          style: "currency",
                          currency: groupCurrency,
                        })}
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
              <TableRow className="bg-slate-200">
                <TableCell colSpan={activeCompanies.length + 1} className="text-right font-bold">
                  Consolidated total
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {totals.toLocaleString(undefined, {
                    style: "currency",
                    currency: groupCurrency,
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
