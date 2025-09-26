import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import { useAppState } from "@/hooks/useAppState";
import { ExchangeRateManager } from "./ExchangeRateManager";

const statusStyles: Record<string, string> = {
  processed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export function DataUpload() {
  const { state, activeCompanies, actions } = useAppState();
  const [selectedCompany, setSelectedCompany] = useState<string>(
    activeCompanies[0]?.id || state.companies[0]?.id || ""
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    state.currentPeriod?.id || ""
  );
  const [formValues, setFormValues] = useState({
    accountCode: "",
    accountName: "",
    debit: "",
    credit: "",
  });

  useEffect(() => {
    if (activeCompanies.length > 0) {
      setSelectedCompany((prev) =>
        activeCompanies.some((company) => company.id === prev)
          ? prev
          : activeCompanies[0].id
      );
    }
  }, [activeCompanies]);

  useEffect(() => {
    if (state.currentPeriod?.id) {
      setSelectedPeriod(state.currentPeriod.id);
    }
  }, [state.currentPeriod?.id]);

  const companyCurrency = useMemo(() => {
    return state.companies.find((company) => company.id === selectedCompany)?.currency || state.currentPeriod?.currency || "";
  }, [selectedCompany, state.companies, state.currentPeriod?.currency]);

  const companyEntries = useMemo(
    () =>
      state.trialBalances.filter(
        (entry) =>
          (!selectedCompany || entry.companyId === selectedCompany) &&
          (!selectedPeriod || entry.period === selectedPeriod)
      ),
    [state.trialBalances, selectedCompany, selectedPeriod]
  );

  const totals = useMemo(() => {
    return companyEntries.reduce(
      (acc, entry) => {
        acc.debit += entry.debit;
        acc.credit += entry.credit;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [companyEntries]);

  const uploadHistory = useMemo(
    () =>
      [...state.trialBalances]
        .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
        .slice(0, 6),
    [state.trialBalances]
  );

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCompany || !selectedPeriod) {
      return;
    }

    const debit = Number(formValues.debit || 0);
    const credit = Number(formValues.credit || 0);

    actions.addTrialBalanceEntry({
      companyId: selectedCompany,
      accountCode: formValues.accountCode,
      accountName: formValues.accountName,
      debit,
      credit,
      period: selectedPeriod,
      currency: companyCurrency,
    });

    setFormValues({ accountCode: "", accountName: "", debit: "", credit: "" });
  };

  const handleDelete = (id: string) => {
    actions.deleteTrialBalance(id);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manual Trial Balance Entry
              </CardTitle>
              <CardDescription>
                Capture summarized balances per account, company and period.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select
                      value={selectedCompany}
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <Select
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.currentPeriod && (
                          <SelectItem value={state.currentPeriod.id}>
                            {state.currentPeriod.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountCode">Account Code</Label>
                    <Input
                      id="accountCode"
                      value={formValues.accountCode}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          accountCode: event.target.value,
                        }))
                      }
                      placeholder="e.g. 1000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={formValues.accountName}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          accountName: event.target.value,
                        }))
                      }
                      placeholder="Cash and Cash Equivalents"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debit">Debit ({companyCurrency})</Label>
                    <Input
                      id="debit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formValues.debit}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          debit: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit">Credit ({companyCurrency})</Label>
                    <Input
                      id="credit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formValues.credit}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          credit: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Currency inferred from company: <strong>{companyCurrency}</strong>
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Store Entry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {selectedPeriod ? `${selectedPeriod} ` : ""}Balances for Selected Company
              </CardTitle>
              <CardDescription>
                Overview of stored trial balance lines for the current selection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {state.companies.find((company) => company.id === selectedCompany)?.name || "All companies"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {state.currentPeriod?.name}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {companyEntries.length} entries
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Account</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyEntries.map((entry) => (
                      <tr key={entry.id} className="border-t">
                        <td className="px-3 py-2 font-mono text-slate-700">{entry.accountCode}</td>
                        <td className="px-3 py-2">{entry.accountName}</td>
                        <td className="px-3 py-2 text-right">
                          {entry.debit.toLocaleString(undefined, {
                            style: "currency",
                            currency: entry.currency,
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {entry.credit.toLocaleString(undefined, {
                            style: "currency",
                            currency: entry.currency,
                          })}
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`${statusStyles[entry.status]} border`}>{entry.status}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {companyEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                          No trial balance entries captured for this selection yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 text-slate-700">
                    <tr>
                      <td className="px-3 py-2 font-semibold" colSpan={2}>
                        Totals
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {totals.debit.toLocaleString(undefined, {
                          style: "currency",
                          currency: companyCurrency,
                        })}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {totals.credit.toLocaleString(undefined, {
                          style: "currency",
                          currency: companyCurrency,
                        })}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Accepted Formats</p>
                <p>CSV or Excel with columns: Account Code, Account Name, Debit, Credit.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Currencies</p>
                <p>
                  Company currency is defaulted automatically. Maintain exchange rates below to
                  consolidate in {state.currentPeriod?.currency}.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Validation</p>
                <p>
                  Debits and credits are stored as provided; validation of totals happens in the
                  consolidated reports.
                </p>
              </div>
            </CardContent>
          </Card>

          <ExchangeRateManager />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription>
            Latest stored entries across all companies and periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadHistory.map((entry) => {
              const company = state.companies.find((item) => item.id === entry.companyId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {entry.accountCode} – {entry.accountName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{company?.name}</span>
                        <span>•</span>
                        <span>{entry.period}</span>
                        <span>•</span>
                        <span>
                          {(entry.debit - entry.credit).toLocaleString(undefined, {
                            style: "currency",
                            currency: entry.currency,
                          })}
                        </span>
                        <span>•</span>
                        <span>{new Date(entry.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusStyles[entry.status]} border capitalize`}>
                    {entry.status}
                  </Badge>
                </div>
              );
            })}

            {uploadHistory.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No entries stored yet</p>
                <p className="text-sm text-slate-500">
                  Capture your first trial balance line using the form above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
