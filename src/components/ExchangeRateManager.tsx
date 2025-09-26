import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

import { useAppState } from "@/hooks/useAppState";

export function ExchangeRateManager() {
  const { state, activeCompanies, actions } = useAppState();
  const [fromCurrency, setFromCurrency] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [source, setSource] = useState<string>("");

  const periodId = state.currentPeriod?.id || "";
  const toCurrency = state.currentPeriod?.currency || "";

  const currenciesInScope = useMemo(() => {
    const unique = new Set<string>();
    activeCompanies.forEach((company) => unique.add(company.currency));
    return Array.from(unique);
  }, [activeCompanies]);

  const periodRates = useMemo(
    () =>
      state.exchangeRates
        .filter((rateItem) => rateItem.period === periodId)
        .sort((a, b) => a.fromCurrency.localeCompare(b.fromCurrency)),
    [state.exchangeRates, periodId]
  );

  const coverage = useMemo(() => {
    const covered = new Set(periodRates.map((item) => item.fromCurrency));
    const missing = currenciesInScope.filter(
      (currency) => currency !== toCurrency && !covered.has(currency)
    );
    return { covered: covered.size, missing };
  }, [periodRates, currenciesInScope, toCurrency]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fromCurrency || !rate || !periodId || !toCurrency) {
      return;
    }

    actions.upsertExchangeRate({
      period: periodId,
      fromCurrency,
      toCurrency,
      rate: Number(rate),
      source: source || undefined,
    });

    setRate("");
    setSource("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Exchange Rates</CardTitle>
        <CardDescription>
          Maintain conversion factors towards {toCurrency} for the active period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="from-currency">Source currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currenciesInScope.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target currency</Label>
              <Input value={toCurrency} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rate">Conversion rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                min="0"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="e.g. 1.25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source (optional)</Label>
              <Input
                id="source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="Bloomberg, ECB..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save rate for {periodId}
          </Button>
        </form>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            Coverage: {coverage.covered} of {Math.max(currenciesInScope.length - 1, 0)} currencies translated
          </span>
          {coverage.missing.length > 0 && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Missing: {coverage.missing.join(", ")}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {periodRates.length === 0 && (
            <p className="text-sm text-slate-500">No exchange rates captured for this period.</p>
          )}

          {periodRates.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-900">
                  1 {item.fromCurrency} = {item.rate.toFixed(4)} {item.toCurrency}
                </p>
                <p className="text-xs text-slate-500">
                  Updated {new Date(item.updatedAt).toLocaleString()}
                  {item.source ? ` • Source: ${item.source}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.deleteExchangeRate(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
