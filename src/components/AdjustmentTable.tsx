import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

import { useAppState } from "@/hooks/useAppState";

const adjustmentTypes = [
  { value: "manual", label: "Manual" },
  { value: "elimination", label: "Elimination" },
  { value: "reclassification", label: "Reclassification" },
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "posted", label: "Posted" },
];

export default function AdjustmentTable() {
  const { state, activeCompanies, actions, getExchangeRate } = useAppState();
  const [form, setForm] = useState({
    type: "manual",
    companyId: activeCompanies[0]?.id || "",
    accountId: state.accounts[0]?.id || "",
    sourceAmount: "",
    sourceCurrency:
      (activeCompanies[0] && activeCompanies[0].currency) || state.currentPeriod?.currency || "",
    status: "draft",
    description: "",
    reference: "",
  });

  const periodId = state.currentPeriod?.id || "";
  const groupCurrency = state.currentPeriod?.currency || "";

  const adjustments = useMemo(
    () => state.adjustments.filter((adjustment) => adjustment.period === periodId),
    [state.adjustments, periodId]
  );

  const totalGroupAmount = useMemo(
    () => adjustments.reduce((sum, adjustment) => sum + adjustment.groupAmount, 0),
    [adjustments]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.accountId || !form.sourceAmount || !periodId) {
      return;
    }

    const amount = Number(form.sourceAmount);

    actions.addAdjustment({
      type: form.type as typeof form.type,
      companyId: form.companyId || null,
      accountId: form.accountId,
      period: periodId,
      sourceAmount: amount,
      sourceCurrency: form.sourceCurrency || groupCurrency,
      description: form.description,
      reference: form.reference || undefined,
      createdBy: "Consolidation Manager",
      status: form.status as typeof form.status,
    });

    setForm((prev) => ({
      ...prev,
      sourceAmount: "",
      description: "",
      reference: "",
    }));
  };

  const sourceCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    activeCompanies.forEach((company) => currencies.add(company.currency));
    currencies.add(groupCurrency);
    return Array.from(currencies);
  }, [activeCompanies, groupCurrency]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Create adjustment</CardTitle>
          <CardDescription>
            Adjustments are stored in both the originating currency and the group currency automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      companyId: value,
                      sourceCurrency:
                        value === ""
                          ? groupCurrency
                          : state.companies.find((company) => company.id === value)?.currency || groupCurrency,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Group adjustment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Group / Consolidation</SelectItem>
                    {state.companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Consolidated account</Label>
                <Select
                  value={form.accountId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, accountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} – {account.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Source amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form.sourceAmount}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sourceAmount: event.target.value }))
                    }
                    placeholder="e.g. -15000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Source currency</Label>
                  <Select
                    value={form.sourceCurrency}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, sourceCurrency: value }))}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Describe the adjustment"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference (optional)</Label>
                <Input
                  id="reference"
                  value={form.reference}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reference: event.target.value }))
                  }
                  placeholder="Ticket number, journal reference..."
                />
              </div>

              <Button type="submit" className="w-full">
                Store adjustment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Adjustments ({periodId})</CardTitle>
          <CardDescription>
            All amounts converted to {groupCurrency} using maintained rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Source amount</TableHead>
                  <TableHead className="text-right">Group amount ({groupCurrency})</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => {
                  const company = state.companies.find((item) => item.id === adjustment.companyId);
                  const account = state.accounts.find((item) => item.id === adjustment.accountId);
                  const effectiveRate = getExchangeRate(
                    adjustment.sourceCurrency,
                    groupCurrency,
                    adjustment.period
                  );
                  return (
                    <TableRow key={adjustment.id}>
                      <TableCell>{new Date(adjustment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{adjustment.type}</TableCell>
                      <TableCell>{company ? company.name : "Group"}</TableCell>
                      <TableCell>
                        {account?.code} – {account?.label}
                      </TableCell>
                      <TableCell className="text-right">
                        {adjustment.sourceAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: adjustment.sourceCurrency,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {adjustment.groupAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: adjustment.groupCurrency,
                        })}
                        <div className="text-xs text-slate-500">Rate {effectiveRate.toFixed(4)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {adjustment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-slate-600">
                        <div>{adjustment.description}</div>
                        {adjustment.reference && (
                          <div className="text-xs text-slate-500">Ref: {adjustment.reference}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => actions.deleteAdjustment(adjustment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {adjustments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-slate-500">
                      No adjustments recorded for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Net impact: {totalGroupAmount.toLocaleString(undefined, {
              style: "currency",
              currency: groupCurrency,
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
