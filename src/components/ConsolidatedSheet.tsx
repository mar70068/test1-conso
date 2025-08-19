
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

// Dummy data: account entries for multiple companies
const data = [
  {
    company: "Acme Corp",
    account: "1001",
    label: "Cash US",
    amount: 102000,
    currency: "USD",
  },
  {
    company: "Euro Manufacturing",
    account: "1001",
    label: "Cash EUR",
    amount: 90000,
    currency: "EUR",
  },
  {
    company: "Acme Corp",
    account: "4000",
    label: "Revenue",
    amount: 410000,
    currency: "USD",
  },
  {
    company: "Euro Manufacturing",
    account: "4000",
    label: "Revenue",
    amount: 300000,
    currency: "EUR",
  },
];

// Helper: Find all unique companies and unique accounts
const companies = Array.from(new Set(data.map(d => d.company)));
const accounts = Array.from(
  new Map(
    data.map(item => [item.account, { account: item.account, label: item.label }])
  ).values()
);

// Map: { [account]: { [company]: { amount, currency } } }
const accountCompanyMap: { [account: string]: { [company: string]: { amount: number, currency: string } | null } } = {};
accounts.forEach(acc => {
  accountCompanyMap[acc.account] = {};
  companies.forEach(co => {
    const match = data.find(d => d.account === acc.account && d.company === co);
    accountCompanyMap[acc.account][co] = match
      ? { amount: match.amount, currency: match.currency }
      : null;
  });
});

export function ConsolidatedSheet() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Consolidated Sheet</CardTitle>
          <CardDescription>Accounts as rows, companies as columns (pivoted sheet).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Account #</TableHead>
                <TableHead className="w-56">Description</TableHead>
                {companies.map(company => (
                  <TableHead key={company}>{company}</TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => (
                <TableRow key={acc.account}>
                  <TableCell className="font-medium">{acc.account}</TableCell>
                  <TableCell>{acc.label}</TableCell>
                  {companies.map(company => (
                    <TableCell key={company} className="text-right">
                      {accountCompanyMap[acc.account][company]
                        ? accountCompanyMap[acc.account][company]!.amount.toLocaleString() + " " + accountCompanyMap[acc.account][company]!.currency
                        : <span className="text-slate-400">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-slate-900">
                    {/* Show the sum total for this account (across all companies, different currencies will simply sum numbers for demo purposes) */}
                    {companies
                      .map(company =>
                        accountCompanyMap[acc.account][company]?.amount || 0
                      )
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
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

export default ConsolidatedSheet;

