import { useState } from "react";
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

// Add consoAccounts definition to match ChartMapping, including the category
const consoAccounts = [
  { id: "co1", code: "CASH", label: "Cash and Cash Equivalents", category: "Current Assets" },
  { id: "co2", code: "REV", label: "Revenue", category: "Income" },
  { id: "co3", code: "AP", label: "Accounts Payable", category: "Current Liabilities" },
];

// Create mock amounts per company account, conso account, etc.
// This array connects company to consoAccount with an amount
const mockBalances = [
  // companyId, accountId, consoAccountId, amount
  { companyId: "1", companyAccount: "1001", consoAccountId: "co1", amount: 100000 },
  { companyId: "1", companyAccount: "4000", consoAccountId: "co2", amount: 400000 },
  { companyId: "2", companyAccount: "1001", consoAccountId: "co1", amount: 20000 },
  { companyId: "2", companyAccount: "4000", consoAccountId: "co2", amount: 10000 },
  { companyId: "3", companyAccount: "2001", consoAccountId: "co3", amount: 9000 },
  { companyId: "3", companyAccount: "4000", consoAccountId: "co2", amount: 200000 },
  { companyId: "4", companyAccount: "1001", consoAccountId: "co1", amount: 85000 },
  { companyId: "4", companyAccount: "2001", consoAccountId: "co3", amount: 4000 },
];

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { state, activeSubconso, activeCompanies, actions } = useAppState();

  // Helper: get companies in active subconso
  const subconsoCompanies = activeCompanies;
  // Group balances by category for the report
  const balanceSheet: { [category: string]: { accounts: { code: string, label: string, amount: number }[], total: number } } = {};

  subconsoCompanies.forEach(company => {
    // For each company, get balances that match companyId
    mockBalances.filter(b => b.companyId === company.id).forEach(entry => {
      const conso = consoAccounts.find(ca => ca.id === entry.consoAccountId);
      if (!conso) return;
      if (!balanceSheet[conso.category]) {
        balanceSheet[conso.category] = { accounts: [], total: 0 };
      }
      // Aggregate at account level under this category
      let acct = balanceSheet[conso.category].accounts.find(a => a.code === conso.code);
      if (!acct) {
        acct = { code: conso.code, label: conso.label, amount: 0 };
        balanceSheet[conso.category].accounts.push(acct);
      }
      acct.amount += entry.amount;
      balanceSheet[conso.category].total += entry.amount;
    });
  });

  // For export: flatten as CSV
  function exportCSV() {
    let csv = "Category,Account Code,Account Label,Amount\n";
    Object.keys(balanceSheet).forEach(cat => {
      balanceSheet[cat].accounts.forEach(a => {
        csv += `${cat},${a.code},${a.label},${a.amount}\n`;
      });
    });
    csv += `,,Total,${Object.values(balanceSheet).reduce((acc, cur) => acc + cur.total, 0)}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeSubconso.name + "-balance-sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
      case "upload":
        return <DataUpload />;
      case "config":
        return <GroupConfiguration
          companies={state.companies}
          setCompanies={(companies) => {
            // This would need to be refactored to use individual company updates
            console.log("Bulk company update not implemented yet");
          }}
          subconsos={state.subconsos}
          setSubconsos={(subconsos) => {
            // This would need to be refactored to use individual subconso updates
            console.log("Bulk subconso update not implemented yet");
          }}
        />;
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
                onChange={e => actions.setActiveSubconso(e.target.value)}
              >
                {state.subconsos.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-white shadow border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{activeSubconso.name} Balance Sheet (By Category)</h3>
              <table className="w-full table-auto border">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 text-sm">
                    <th className="py-1 px-2 border">Category</th>
                    <th className="py-1 px-2 border">Account</th>
                    <th className="py-1 px-2 border">Label</th>
                    <th className="py-1 px-2 border text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(balanceSheet).map(category => (
                    <>
                      {balanceSheet[category].accounts.map((acct, idx) => (
                        <tr key={category + '_' + acct.code}>
                          {idx === 0 && (
                            <td className="border px-2 py-1" rowSpan={balanceSheet[category].accounts.length}>
                              <span className="font-bold">{category}</span>
                            </td>
                          )}
                          <td className="border px-2 py-1">{acct.code}</td>
                          <td className="border px-2 py-1">{acct.label}</td>
                          <td className="border px-2 py-1 text-right">{acct.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="border px-2 py-1 bg-slate-50 text-right" colSpan={3}>
                          <span className="font-semibold">Subtotal {category}</span>
                        </td>
                        <td className="border px-2 py-1 text-right bg-slate-50 font-semibold">
                          {balanceSheet[category].total.toLocaleString()}
                        </td>
                      </tr>
                    </>
                  ))}
                  <tr className="font-bold bg-slate-200">
                    <td colSpan={3} className="border px-2 py-1 text-right">Total</td>
                    <td className="border px-2 py-1 text-right">
                      {Object.values(balanceSheet).reduce((acc, cur) => acc + cur.total, 0).toLocaleString()}
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
