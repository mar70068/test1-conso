import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react"; // Use allowed icon for download

// Update this to include "category"
const DIMENSIONS = [
  { key: "company", label: "Company" },
  { key: "account", label: "Account" },
  { key: "currency", label: "Currency" },
  { key: "category", label: "Category" }, // new!
];

// Add category property to each row
const data = [
  {
    company: "Acme Corp",
    account: "1001",
    label: "Cash US",
    amount: 102000,
    currency: "USD",
    category: "Current Assets",
  },
  {
    company: "Euro Manufacturing",
    account: "1001",
    label: "Cash EUR",
    amount: 90000,
    currency: "EUR",
    category: "Current Assets",
  },
  {
    company: "Acme Corp",
    account: "4000",
    label: "Revenue",
    amount: 410000,
    currency: "USD",
    category: "Income",
  },
  {
    company: "Euro Manufacturing",
    account: "4000",
    label: "Revenue",
    amount: 300000,
    currency: "EUR",
    category: "Income",
  },
];

// Helper: unique values in column
function uniqueValues(arr: any[], key: string) {
  return Array.from(new Set(arr.map(x => x[key])));
}

// Helper: label for account code
function accountLabel(account: string) {
  const row = data.find(r => r.account === account);
  return row?.label ?? "";
}

function exportCSV(matrix: { [rowVal: string]: { [colVal: string]: number } }, rowValues: string[], colValues: string[], rowDim: string, colDim: string) {
  let csv = `${DIMENSIONS.find(d => d.key === rowDim)?.label || rowDim},${colValues.join(",")},Row Total\n`;
  rowValues.forEach(rowVal => {
    csv += rowVal;
    colValues.forEach(colVal => {
      csv += `,${matrix[rowVal][colVal] ?? ""}`;
    });
    const rowTotal = colValues.reduce((acc, colVal) => acc + (matrix[rowVal][colVal] || 0), 0);
    csv += `,${rowTotal}\n`;
  });
  // Add col totals
  csv += "Col Total";
  colValues.forEach(colVal => {
    const colTotal = rowValues.reduce((acc, rowVal) => acc + (matrix[rowVal][colVal] || 0), 0);
    csv += `,${colTotal}`;
  });
  csv += ",\n";
  // Download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pivot-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function PivotPanel() {
  // By default: company in rows, account in columns
  const [rowDim, setRowDim] = useState("company");
  const [colDim, setColDim] = useState("account");
  const [valDim] = useState("amount"); // Only “amount” for now

  // Update availableRowDims and availableColDims to allow for the new dimension
  const availableRowDims = DIMENSIONS.filter(d => d.key !== colDim);
  const availableColDims = DIMENSIONS.filter(d => d.key !== rowDim);

  // Ensure users cannot pick the same dimension for both axes

  // Create the sets
  const rowValues = uniqueValues(data, rowDim);
  const colValues = uniqueValues(data, colDim);

  // Build a mapping: { [rowVal]: { [colVal]: aggValue } }
  const matrix: { [rowVal: string]: { [colVal: string]: number } } = {};
  rowValues.forEach(rowVal => {
    matrix[rowVal] = {};
    colValues.forEach(colVal => {
      // Sum (could aggregate in other ways later)
      const sum = data
        .filter(d => d[rowDim] === rowVal && d[colDim] === colVal)
        .reduce((acc, curr) => acc + (curr[valDim] as number), 0);
      matrix[rowVal][colVal] = sum;
    });
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Pivot Panel</CardTitle>
          <CardDescription>
            Choose which fields to show as rows and columns. Like a pivot table!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 mb-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Rows</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={rowDim}
                onChange={e => setRowDim(e.target.value)}
              >
                {availableRowDims.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Columns</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={colDim}
                onChange={e => setColDim(e.target.value)}
              >
                {availableColDims.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Values</label>
              <select className="border rounded px-2 py-1 text-sm" disabled>
                <option value="amount">Amount</option>
              </select>
            </div>
            <Button
              onClick={() => exportCSV(matrix, rowValues, colValues, rowDim, colDim)}
              variant="outline"
              className="ml-auto"
            >
              <Download className="w-4 h-4 mr-1" />
              Download CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">{DIMENSIONS.find(d => d.key === rowDim)?.label}</TableHead>
                {colValues.map(col => (
                  <TableHead key={col}>
                    {/* Show pretty account label if showing account */}
                    {colDim === "account" ? (
                      <span>
                        <span className="font-mono">{col}</span>
                        <span className="block text-xs text-muted-foreground">{accountLabel(col)}</span>
                      </span>
                    ) : col}
                  </TableHead>
                ))}
                <TableHead className="text-right">Row Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowValues.map(rowVal => (
                <TableRow key={rowVal}>
                  <TableCell className="font-semibold">{rowVal}</TableCell>
                  {colValues.map(colVal => (
                    <TableCell key={colVal} className="text-right">
                      {matrix[rowVal][colVal]
                        ? matrix[rowVal][colVal].toLocaleString()
                        : <span className="text-slate-400">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-slate-900">
                    {colValues.reduce((acc, colVal) => acc + (matrix[rowVal][colVal] || 0), 0).toLocaleString()}
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
