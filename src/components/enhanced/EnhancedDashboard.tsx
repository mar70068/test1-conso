import { ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowDown,
  RefreshCw,
  Activity,
} from "lucide-react";

import { useAppState } from "@/hooks/useAppState";

const statusMeta: Record<string, { label: string; badge: string; progress: number; icon: ReactNode }> = {
  completed: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    progress: 100,
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  processing: {
    label: "Processing",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    progress: 70,
    icon: <Clock className="w-4 h-4 text-amber-600" />,
  },
  "fx-missing": {
    label: "FX required",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    progress: 40,
    icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
  },
  missing: {
    label: "Pending upload",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    progress: 10,
    icon: <AlertCircle className="w-4 h-4 text-slate-500" />,
  },
  error: {
    label: "Error",
    badge: "bg-red-50 text-red-700 border-red-200",
    progress: 20,
    icon: <AlertCircle className="w-4 h-4 text-red-600" />,
  },
};

interface EnhancedDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const { state, activeSubconso, activeCompanies, actions, getExchangeRate } = useAppState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const periodId = state.currentPeriod?.id || "";
  const groupCurrency = state.currentPeriod?.currency || "";

  const companyStatuses = useMemo(() => {
    return activeCompanies.map((company) => {
      const entries = state.trialBalances.filter(
        (entry) => entry.companyId === company.id && entry.period === periodId
      );
      const fxAvailable =
        company.currency === groupCurrency ||
        state.exchangeRates.some(
          (rate) =>
            rate.period === periodId &&
            rate.fromCurrency === company.currency &&
            rate.toCurrency === groupCurrency
        );

      if (entries.length === 0) {
        return { company, status: "missing" };
      }

      if (entries.some((entry) => entry.status === "error")) {
        return { company, status: "error" };
      }

      if (!fxAvailable) {
        return { company, status: "fx-missing" };
      }

      if (entries.some((entry) => entry.status !== "processed")) {
        return { company, status: "processing" };
      }

      return { company, status: "completed" };
    });
  }, [activeCompanies, state.trialBalances, periodId, state.exchangeRates, groupCurrency]);

  const completionRate = useMemo(() => {
    if (companyStatuses.length === 0) {
      return 0;
    }
    const completed = companyStatuses.filter((item) => item.status === "completed").length;
    return Math.round((completed / companyStatuses.length) * 100);
  }, [companyStatuses]);

  const totalGroupValue = useMemo(() => {
    const trialBalanceImpact = state.trialBalances
      .filter((entry) => entry.period === periodId && activeSubconso.companyIds.includes(entry.companyId))
      .reduce((sum, entry) => {
        const rate = getExchangeRate(entry.currency, groupCurrency, entry.period);
        return sum + (entry.debit - entry.credit) * rate;
      }, 0);
    const adjustmentImpact = state.adjustments
      .filter(
        (adjustment) =>
          adjustment.period === periodId &&
          (adjustment.companyId === null || activeSubconso.companyIds.includes(adjustment.companyId))
      )
      .reduce((sum, adjustment) => sum + adjustment.groupAmount, 0);
    return trialBalanceImpact + adjustmentImpact;
  }, [
    state.trialBalances,
    state.adjustments,
    periodId,
    activeSubconso.companyIds,
    getExchangeRate,
    groupCurrency,
  ]);

  const fxCoverage = useMemo(() => {
    const currencies = new Set(activeCompanies.map((company) => company.currency));
    currencies.delete(groupCurrency);
    if (currencies.size === 0) {
      return 100;
    }
    const covered = Array.from(currencies).filter((currency) =>
      state.exchangeRates.some(
        (rate) =>
          rate.period === periodId && rate.fromCurrency === currency && rate.toCurrency === groupCurrency
      )
    ).length;
    return Math.round((covered / currencies.size) * 100);
  }, [activeCompanies, state.exchangeRates, periodId, groupCurrency]);

  const recentActivity = useMemo(() => {
    const activity: Array<{ id: string; title: string; time: string; detail: string; tone: "info" | "success" | "warning" }> = [];

    state.trialBalances
      .filter((entry) => entry.period === periodId)
      .slice(-10)
      .forEach((entry) => {
        const company = state.companies.find((item) => item.id === entry.companyId);
        activity.push({
          id: `tb-${entry.id}`,
          title: `Trial balance line captured for ${company?.name || "Unknown"}`,
          time: entry.uploadedAt,
          detail: `${entry.accountCode} · ${(entry.debit - entry.credit).toLocaleString(undefined, {
            style: "currency",
            currency: entry.currency,
          })}`,
          tone: "success",
        });
      });

    state.exchangeRates
      .filter((rate) => rate.period === periodId)
      .forEach((rate) => {
        activity.push({
          id: `fx-${rate.id}`,
          title: `Exchange rate ${rate.fromCurrency}/${rate.toCurrency} updated`,
          time: rate.updatedAt,
          detail: `Rate ${rate.rate.toFixed(4)}${rate.source ? ` · ${rate.source}` : ""}`,
          tone: "info",
        });
      });

    state.adjustments
      .filter((adjustment) => adjustment.period === periodId)
      .forEach((adjustment) => {
        const company = state.companies.find((item) => item.id === adjustment.companyId);
        activity.push({
          id: `adj-${adjustment.id}`,
          title: `Adjustment ${adjustment.type} ${company ? `(${company.name})` : "(Group)"}`,
          time: adjustment.createdAt,
          detail: `${adjustment.groupAmount.toLocaleString(undefined, {
            style: "currency",
            currency: adjustment.groupCurrency,
          })} · ${adjustment.status}`,
          tone: adjustment.status === "posted" ? "success" : "warning",
        });
      });

    return activity
      .sort((a, b) => (a.time < b.time ? 1 : -1))
      .slice(0, 5);
  }, [state.trialBalances, state.exchangeRates, state.adjustments, state.companies, periodId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2">
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setDropdownOpen((value) => !value)}
          >
            <span className="font-semibold">{activeSubconso?.name} Group</span>
            <ArrowDown className="w-4 h-4" />
          </Button>
          {dropdownOpen && (
            <div className="absolute left-0 z-20 mt-2 w-48 rounded-lg border bg-white shadow-lg">
              {state.subconsos.map((group) => (
                <button
                  key={group.id}
                  className={`block w-full px-4 py-2 text-left hover:bg-slate-100 ${
                    state.activeSubconsoId === group.id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700"
                  }`}
                  onClick={() => {
                    actions.setActiveSubconso(group.id);
                    setDropdownOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className="text-xs text-slate-500">{group.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <span className="text-slate-400 text-sm">{activeCompanies.length} companies in scope</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total companies</p>
                <p className="text-2xl font-bold text-slate-900">{activeCompanies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {activeCompanies.filter((company) => company.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current period</p>
                <p className="text-2xl font-bold text-slate-900">{state.currentPeriod?.name}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Status: {state.currentPeriod?.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Consolidated value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(totalGroupValue / 1_000_000).toFixed(2)}M {groupCurrency}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Includes posted adjustments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion rate</p>
                <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{companyStatuses.filter((item) => item.status === "completed").length} of {companyStatuses.length} companies ready</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Company readiness</CardTitle>
                <CardDescription>Monitoring for {state.currentPeriod?.name}</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate("upload")}>
                <Upload className="w-4 h-4 mr-2" />
                Upload data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyStatuses.map(({ company, status }) => (
              <div
                key={company.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center space-x-3">
                  {statusMeta[status].icon}
                  <div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                    <p className="text-sm text-slate-500">
                      {company.country} • {company.ownership}% ownership • {company.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24">
                    <Progress value={statusMeta[status].progress} className="h-2" />
                  </div>
                  <Badge className={`${statusMeta[status].badge} border`}>{statusMeta[status].label}</Badge>
                </div>
              </div>
            ))}
            {companyStatuses.length === 0 && (
              <div className="text-sm text-slate-500">No companies configured in this subconsolidation.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent activity</CardTitle>
                <CardDescription>Latest consolidation events</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate("reports")}>
                View reports
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 rounded-lg p-3 ${
                  item.tone === "success"
                    ? "bg-emerald-50"
                    : item.tone === "warning"
                    ? "bg-amber-50"
                    : "bg-blue-50"
                }`}
              >
                <Activity className="w-5 h-5 text-slate-700" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{new Date(item.time).toLocaleString()}</p>
                  <p className="text-xs text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-sm text-slate-500">No activity recorded for this period yet.</div>
            )}
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
              FX coverage: {fxCoverage}% of currencies have rates to {groupCurrency}.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
          <CardDescription>Accelerate the period close</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => onNavigate("upload")}>
              <Upload className="w-6 h-6" />
              <span>Upload trial balance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => onNavigate("config")}>
              <Building2 className="w-6 h-6" />
              <span>Manage companies</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => onNavigate("reports")}>
              <TrendingUp className="w-6 h-6" />
              <span>Generate report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
