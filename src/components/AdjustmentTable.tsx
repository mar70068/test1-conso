
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

// Mock data for demonstration
const adjustmentData = [
  {
    id: 1,
    date: "2025-06-14",
    type: "Manual",
    company: "Alpha Ltd",
    account: "1000 - Cash",
    amount: 1500,
    currency: "USD",
    description: "True-up adjustment",
    createdBy: "Jane Doe",
  },
  {
    id: 2,
    date: "2025-06-15",
    type: "Elimination",
    company: "Beta Spa",
    account: "2000 - IC Receivable",
    amount: -2500,
    currency: "EUR",
    description: "Intercompany elimination",
    createdBy: "John Smith",
  },
];

export default function AdjustmentTable() {
  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Adjustments</h2>
        <Button size="sm" variant="default" disabled>
          + Add Adjustment
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustmentData.map((adj) => (
            <TableRow key={adj.id}>
              <TableCell>{adj.date}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  adj.type === "Elimination" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                }`}>
                  {adj.type}
                </span>
              </TableCell>
              <TableCell>{adj.company}</TableCell>
              <TableCell>{adj.account}</TableCell>
              <TableCell>
                {adj.amount.toLocaleString(undefined, { style: "currency", currency: adj.currency })}
              </TableCell>
              <TableCell>{adj.description}</TableCell>
              <TableCell>{adj.createdBy}</TableCell>
              <TableCell className="flex gap-1 justify-end">
                <Button variant="outline" size="icon" disabled>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
