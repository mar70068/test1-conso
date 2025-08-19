import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useAdjustments } from "@/hooks/useSupabaseData";

/**
 * Muestra la lista de ajustes financieros obtenidos desde Supabase.
 */
export default function AdjustmentTable() {
  const { data: adjustments = [], isLoading, error } = useAdjustments();

  // Mensajes de estado
  if (isLoading) {
    return <div>Loading adjustments…</div>;
  }
  if (error) {
    return <div>Error loading adjustments</div>;
  }

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
            <TableHead>Currency</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adj) => (
            <TableRow key={adj.id}>
              <TableCell>{(adj as any).created_at ? String((adj as any).created_at).slice(0, 10) : ""}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    adj.type === "elimination" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {adj.type}
                </span>
              </TableCell>
              <TableCell>{(adj as any).company_id ?? ""}</TableCell>
              <TableCell>{(adj as any).account_id ?? ""}</TableCell>
              <TableCell>
                {typeof adj.amount === "number"
                  ? adj.amount.toLocaleString(undefined, { style: "currency", currency: (adj as any).currency })
                  : ""}
              </TableCell>
              <TableCell>{(adj as any).currency}</TableCell>
              <TableCell>{(adj as any).description}</TableCell>
              <TableCell>{(adj as any).created_by}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" className="mr-2" disabled>
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
