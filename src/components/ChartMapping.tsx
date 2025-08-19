
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Add category/epigraph to conso accounts
type ConsoAccount = {
  id: string;
  code: string;
  label: string;
  category: string; // new: epigraph/group/category for reporting
};

type CompanyAccount = {
  id: string;
  code: string;
  label: string;
};

const companyAccounts: CompanyAccount[] = [
  { id: "c1", code: "1001", label: "Cash US" },
  { id: "c2", code: "4000", label: "Revenue US" },
  { id: "c3", code: "2001", label: "Accounts Payable" },
];

// New: group/epigraphs for consolidated accounts
const consoAccounts: ConsoAccount[] = [
  { id: "co1", code: "CASH", label: "Cash and Cash Equivalents", category: "Current Assets" },
  { id: "co2", code: "REV", label: "Revenue", category: "Income" },
  { id: "co3", code: "AP", label: "Accounts Payable", category: "Current Liabilities" },
];

export function ChartMapping() {
  // mapping: { [companyAccountId]: consoAccountId }
  const [mapping, setMapping] = useState<{ [key: string]: string }>({
    "c1": "co1",
    "c2": "co2",
    "c3": "co3"
  });

  const handleSelect = (companyId: string, consoId: string) => {
    setMapping({ ...mapping, [companyId]: consoId });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts Mapping</CardTitle>
          <CardDescription>Map each company account to the group consolidated chart of accounts and its financial group/epigraph.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Account</TableHead>
                <TableHead>Map to / Consolidated Account (Category)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.code}</div>
                      <div className="text-slate-500 text-xs">{account.label}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={mapping[account.id]}
                      onChange={e => handleSelect(account.id, e.target.value)}
                    >
                      {consoAccounts.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.code} - {g.label} ({g.category})
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-6" variant="default" disabled>
            Save Mapping (Coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChartMapping;
