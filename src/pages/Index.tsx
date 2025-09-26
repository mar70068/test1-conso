import { Fragment, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { EnhancedDashboard } from "@/components/enhanced/EnhancedDashboard";
import { DataUpload } from "@/components/DataUpload";
import { GroupConfiguration } from "@/components/GroupConfiguration";
import ChartMapping from "@/components/ChartMapping";
import ConsolidatedSheet from "@/components/ConsolidatedSheet";
import PivotPanel from "@/components/PivotPanel";
import AdjustmentTable from "@/components/AdjustmentTable";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAppState } from "@/hooks/useAppState";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { state, activeSubconso, activeCompanies, actions, getExchangeRate } = useAppState();
  const periodId = state.currentPeriod?.id || "";
  const groupCurrency = state.currentPeriod?.currency || "";

  const balanceData = useMemo(() => {
    const mapping = new Map<string, string>();
    state.chartMappings.forEach((item) => {
      mapping.set(`${item.companyId}-${item.companyAccountCode}`, item.consolidatedAccountId);
    });

    const categories = new Map<
      string,
      {
        accounts: Array<{ code: string; label: string; localBreakdown: Record<string, number>; groupAmount: number }>;
        subtotal: number;
      }
    >();

    const ensureAccount = (category: string, code: string, label: string) => {
      const categoryRecord = categories.get(category) || { accounts: [], subtotal: 0 };
      if (!categories.has(category)) {
        categories.set(category, categoryRecord);
      }
      let accountRecord = categoryRecord.accounts.find((account) => account.code === code);
      if (!accountRecord) {
        accountRecord = { code, label, localBreakdown: {}, groupAmount: 0 };
        categoryRecord.accounts.push(accountRecord);
      }
      return { categoryRecord, accountRecord };
    };

    const addAmount = (
      category: string,
      code: string,
      label: string,
      currency: string,
      local: number,
      group: number
    ) => {
      const { categoryRecord, accountRecord } = ensureAccount(category, code, label);
      accountRecord.localBreakdown[currency] = (accountRecord.localBreakdown[currency] || 0) + local;
      accountRecord.groupAmount += group;
      categoryRecord.subtotal += group;
    };

    state.trialBalances
      .filter(
        (entry) =>
          entry.period === periodId &&
          activeSubconso.companyIds.includes(entry.companyId)
      )
      .forEach((entry) => {
        const mappedAccountId = mapping.get(`${entry.companyId}-${entry.accountCode}`);
        const account = mappedAccountId
          ? state.accounts.find((item) => item.id === mappedAccountId)
          : state.accounts.find((item) => item.code === entry.accountCode);
        const accountCode = account?.code || entry.accountCode;
        const accountLabel = account?.label || entry.accountName;
        const category = account?.category || "Unmapped";
        const currency = entry.currency;
        const rate = getExchangeRate(currency, groupCurrency, entry.period);
        const net = entry.debit - entry.credit;
        addAmount(category, accountCode, accountLabel, currency, net, net * rate);
      });

    state.adjustments
      .filter(
        (adjustment) =>
          adjustment.period === periodId &&
          (adjustment.companyId === null || activeSubconso.companyIds.includes(adjustment.companyId))
      )
      .forEach((adjustment) => {
        const account = state.accounts.find((item) => item.id === adjustment.accountId);
        const accountCode = account?.code || adjustment.accountId;
        const accountLabel = account?.label || "Adjustment";
        const category = account?.category || "Adjustments";
        addAmount(
          category,
          accountCode,
          accountLabel,
          adjustment.sourceCurrency,
          adjustment.sourceAmount,
          adjustment.groupAmount
        );
      });

    const ordered = Array.from(categories.entries()).map(([category, value]) => ({
      category,
      accounts: value.accounts,
      subtotal: value.subtotal,
    }));

    ordered.sort((a, b) => (a.category === b.category ? 0 : a.category.localeCompare(b.category)));

    const total = ordered.reduce((sum, item) => sum + item.subtotal, 0);

    return { categories: ordered, total };
  }, [
    state.chartMappings,
    state.accounts,
    state.trialBalances,
    state.adjustments,
    activeSubconso,
    periodId,
    getExchangeRate,
    groupCurrency,
  ]);

  const exportCSV = () => {
    let csv = "Category,Account Code,Account Label,Local Amounts,Group Amount";
    csv += ` (${groupCurrency})\n`;
    balanceData.categories.forEach((category) => {
      category.accounts.forEach((account) => {
        const localSummary = Object.entries(account.localBreakdown)
          .map(([currency, amount]) => `${currency} ${amount}`)
          .join(" | ");
        csv += `${category.category},${account.code},${account.label},${localSummary},${account.groupAmount}\n`;
      });
    });
    csv += `,,,Total,${balanceData.total}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeSubconso.name + "-balance-sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
      case "upload":
        return <DataUpload />;
      case "config":
        return (
          <GroupConfiguration
            companies={state.companies}
            setCompanies={(companies) => {
              console.log("Bulk company update not implemented yet");
            }}
            subconsos={state.subconsos}
            setSubconsos={(subconsos) => {
              console.log("Bulk subconso update not implemented yet");
            }}
          />
        );
      case "mapping":
        return <ChartMapping />;
      case "sheet":
        return <ConsolidatedSheet />;
      case "pivot":
        return <PivotPanel />;
      case "adjustments":
        return <AdjustmentTable />;
      case "reports":
        return (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Extract Consolidated Data</h2>
              <p className="text-slate-600 mb-2">
                Select a subconsolidation group to view its consolidated data and export as needed.
              </p>
              <select
                className="border rounded px-3 py-2 text-base"
                value={state.activeSubconsoId}
                onChange={(event) => actions.setActiveSubconso(event.target.value)}
              >
                {state.subconsos.map((subconso) => (
                  <option key={subconso.id} value={subconso.id}>
                    {subconso.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white shadow border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                {activeSubconso.name} Balance Sheet ({state.currentPeriod?.name})
              </h3>
              <table className="w-full table-auto border">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 text-sm">
                    <th className="py-1 px-2 border">Category</th>
                    <th className="py-1 px-2 border">Account</th>
                    <th className="py-1 px-2 border">Local amounts</th>
                    <th className="py-1 px-2 border text-right">Group amount ({groupCurrency})</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.categories.map((category) => (
                    <Fragment key={category.category}>
                      {category.accounts.map((account, index) => (
                        <tr key={`${category.category}-${account.code}`}>
                          {index === 0 && (
                            <td className="border px-2 py-1" rowSpan={category.accounts.length}>
                              <span className="font-bold">{category.category}</span>
                            </td>
                          )}
                          <td className="border px-2 py-1">
                            <div className="font-medium text-slate-900">{account.code}</div>
                            <div className="text-xs text-slate-500">{account.label}</div>
                          </td>
                          <td className="border px-2 py-1">
                            {Object.entries(account.localBreakdown).map(([currency, amount]) => (
                              <div key={currency} className="text-xs text-slate-600">
                                {currency} {amount.toLocaleString()}
                              </div>
                            ))}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {account.groupAmount.toLocaleString(undefined, {
                              style: "currency",
                              currency: groupCurrency,
                            })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="border px-2 py-1 text-right" colSpan={3}>
                          <span className="font-semibold">Subtotal {category.category}</span>
                        </td>
                        <td className="border px-2 py-1 text-right font-semibold">
                          {category.subtotal.toLocaleString(undefined, {
                            style: "currency",
                            currency: groupCurrency,
                          })}
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                  <tr className="font-bold bg-slate-200">
                    <td colSpan={3} className="border px-2 py-1 text-right">
                      Total
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {balanceData.total.toLocaleString(undefined, {
                        style: "currency",
                        currency: groupCurrency,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                onClick={exportCSV}
              >
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        );
      default:
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ErrorBoundary>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderCurrentPage()}
      </AppLayout>
    </ErrorBoundary>
  );
};

export default Index;
