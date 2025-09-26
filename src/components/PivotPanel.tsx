import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import { useAppState } from "@/hooks/useAppState";

const DIMENSIONS = [
  { key: "company", label: "Company" },
  { key: "account", label: "Account" },
  { key: "category", label: "Category" },
  { key: "sourceCurrency", label: "Source currency" },
];

interface PivotRow {
  company: string;
  account: string;
  label: string;
  category: string;
  sourceCurrency: string;
  amount: number;
}

const uniqueValues = (rows: PivotRow[], key: keyof PivotRow) => {
  return Array.from(new Set(rows.map((row) => row[key])));
};

const accountLabel = (rows: PivotRow[], account: string) => {
  const row = rows.find((entry) => entry.account === account);
  return row?.label ?? "";
};

const exportCSV = (
  matrix: { [rowVal: string]: { [colVal: string]: number } },
  rowValues: string[],
  colValues: string[],
  rowDim: string,
  colDim: string,
  groupCurrency: string
) => {
  let csv = `${DIMENSIONS.find((dimension) => dimension.key === rowDim)?.label || rowDim},${colValues.join(",")},Row Total (${groupCurrency})\n`;
  rowValues.forEach((rowVal) => {
    csv += rowVal;
    colValues.forEach((colVal) => {
      csv += `,${matrix[rowVal][colVal] ?? ""}`;
    });
    const rowTotal = colValues.reduce((accumulator, colVal) => accumulator + (matrix[rowVal][colVal] || 0), 0);
    csv += `,${rowTotal}\n`;
  });
  csv += `Column Total (${groupCurrency})`;
  colValues.forEach((colVal) => {
    const colTotal = rowValues.reduce((accumulator, rowVal) => accumulator + (matrix[rowVal][colVal] || 0), 0);
    csv += `,${colTotal}`;
  });
  csv += ",\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = "pivot-report.csv";
  element.click();
  URL.revokeObjectURL(url);
};

export default function PivotPanel() {
  const { state, activeCompanies, getExchangeRate } = useAppState();
  const [rowDim, setRowDim] = useState("company");
  const [colDim, setColDim] = useState("account");
  const [valDim] = useState("amount");

  const availableRowDims = DIMENSIONS.filter((dimension) => dimension.key !== colDim);
  const availableColDims = DIMENSIONS.filter((dimension) => dimension.key !== rowDim);

  const periodId = state.currentPeriod?.id || "";
  const groupCurrency = state.currentPeriod?.currency || "";
  const companyIds = useMemo(() => new Set(activeCompanies.map((company) => company.id)), [activeCompanies]);

  const rows = useMemo<PivotRow[]>(() => {
    const mapping = new Map<string, string>();
    state.chartMappings.forEach((item) => {
      mapping.set(`${item.companyId}-${item.companyAccountCode}`, item.consolidatedAccountId);
    });

    const data: PivotRow[] = [];

    state.trialBalances
      .filter((entry) => entry.period === periodId && companyIds.has(entry.companyId))
      .forEach((entry) => {
        const mappedAccountId = mapping.get(`${entry.companyId}-${entry.accountCode}`);
        const account = mappedAccountId
          ? state.accounts.find((item) => item.id === mappedAccountId)
          : state.accounts.find((item) => item.code === entry.accountCode);
        const company = state.companies.find((item) => item.id === entry.companyId);
        const sourceCurrency = entry.currency || company?.currency || groupCurrency;
        const rate = getExchangeRate(sourceCurrency, groupCurrency, entry.period);
        const amount = (entry.debit - entry.credit) * rate;

        data.push({
          company: company?.name || "Unknown",
          account: account?.code || entry.accountCode,
          label: account?.label || entry.accountName,
          category: account?.category || "Unmapped",
          sourceCurrency,
          amount,
        });
      });

    state.adjustments
      .filter((adjustment) => adjustment.period === periodId)
      .forEach((adjustment) => {
        const company = state.companies.find((item) => item.id === adjustment.companyId);
        const account = state.accounts.find((item) => item.id === adjustment.accountId);
        data.push({
          company: company?.name || "Group",
          account: account?.code || adjustment.accountId,
          label: account?.label || "Adjustment",
          category: account?.category || "Adjustments",
          sourceCurrency: adjustment.sourceCurrency,
          amount: adjustment.groupAmount,
        });
      });

    return data;
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

  const rowValues = uniqueValues(rows, rowDim as keyof PivotRow);
  const colValues = uniqueValues(rows, colDim as keyof PivotRow);

  const matrix: { [rowVal: string]: { [colVal: string]: number } } = {};
  rowValues.forEach((rowVal) => {
    matrix[rowVal] = {};
    colValues.forEach((colVal) => {
      const sum = rows
        .filter((entry) => entry[rowDim as keyof PivotRow] === rowVal && entry[colDim as keyof PivotRow] === colVal)
        .reduce((accumulator, current) => accumulator + (current[valDim as keyof PivotRow] as number), 0);
      matrix[rowVal][colVal] = sum;
    });
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Pivot Panel</CardTitle>
          <CardDescription>
            Cross-analyse consolidated figures. Amounts are expressed in {groupCurrency}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1">Rows</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={rowDim}
                onChange={(event) => setRowDim(event.target.value)}
              >
                {availableRowDims.map((dimension) => (
                  <option key={dimension.key} value={dimension.key}>
                    {dimension.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Columns</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={colDim}
                onChange={(event) => setColDim(event.target.value)}
              >
                {availableColDims.map((dimension) => (
                  <option key={dimension.key} value={dimension.key}>
                    {dimension.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Measure</label>
              <select className="border rounded px-2 py-1 text-sm" disabled>
                <option value={valDim}>Amount ({groupCurrency})</option>
              </select>
            </div>
            <Button
              onClick={() => exportCSV(matrix, rowValues, colValues, rowDim, colDim, groupCurrency)}
              variant="outline"
              className="ml-auto"
              disabled={rowValues.length === 0 || colValues.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Download CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">
                  {DIMENSIONS.find((dimension) => dimension.key === rowDim)?.label}
                </TableHead>
                {colValues.map((col) => (
                  <TableHead key={col}>
                    {colDim === "account" ? (
                      <span>
                        <span className="font-mono">{col}</span>
                        <span className="block text-xs text-muted-foreground">
                          {accountLabel(rows, col)}
                        </span>
                      </span>
                    ) : (
                      col
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right">Row total ({groupCurrency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowValues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colValues.length + 2} className="py-6 text-center text-slate-500">
                    No data for the selected period.
                  </TableCell>
                </TableRow>
              )}
              {rowValues.map((rowVal) => (
                <TableRow key={rowVal}>
                  <TableCell className="font-semibold">{rowVal}</TableCell>
                  {colValues.map((colVal) => (
                    <TableCell key={colVal} className="text-right">
                      {matrix[rowVal][colVal]
                        ? matrix[rowVal][colVal].toLocaleString(undefined, {
                            style: "currency",
                            currency: groupCurrency,
                          })
                        : <span className="text-slate-400">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-slate-900">
                    {colValues
                      .reduce((accumulator, colVal) => accumulator + (matrix[rowVal][colVal] || 0), 0)
                      .toLocaleString(undefined, {
                        style: "currency",
                        currency: groupCurrency,
                      })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
