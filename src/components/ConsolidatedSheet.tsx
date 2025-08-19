import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useCompanies, useAccounts, useTrialBalances } from "@/hooks/useSupabaseData";

export default function ConsolidatedSheet() {
  // Fetch companies, accounts, and trial balances from Supabase
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useCompanies();
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useAccounts();
  const { data: trialBalances = [], isLoading: trialBalancesLoading, error: trialBalancesError } = useTrialBalances();

  if (companiesLoading || accountsLoading || trialBalancesLoading) {
    return <div>Loading...</div>;
  }

  if (companiesError || accountsError || trialBalancesError) {
    return <div>Error loading consolidated sheet data.</div>;
  }

  // Prepare company names
  const companyNames = companies.map(c => c.name);
  // Prepare account objects with code and label
  const accountList = accounts.map(acc => ({
    account: acc.code,
    label: acc.label,
  }));

  // Build account-company mapping: accountList -> companyNames -> { amount, currency } | null
  const accountCompanyMap: { [account: string]: { [company: string]: { amount: number; currency: string } | null } } = {};
  accountList.forEach(acc => {
    accountCompanyMap[acc.account] = {};
    companyNames.forEach(companyName => {
      const company = companies.find(c => c.name === companyName);
      const trials = trialBalances.filter(
        tb => tb.accountCode === acc.account && tb.companyId === (company?.id ?? "")
      );
      if (trials.length > 0) {
        // Sum debit minus credit to get net amount
        const totalAmount = trials.reduce((sum, tb) => sum + (tb.debit - tb.credit), 0);
        accountCompanyMap[acc.account][companyName] = {
          amount: totalAmount,
          currency: company?.currency ?? "",
        };
      } else {
        accountCompanyMap[acc.account][companyName] = null;
      }
    });
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Consolidated Trial Balance</CardTitle>
          <CardDescription>
            View accounts and balances across all companies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Label</TableHead>
                {companyNames.map(company => (
                  <TableHead key={company} className="text-right">
                    {company}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountList.map(acc => (
                <TableRow key={acc.account}>
                  <TableCell className="font-medium">{acc.account}</TableCell>
                  <TableCell>{acc.label}</TableCell>
                  {companyNames.map(company => {
                    const cellData = accountCompanyMap[acc.account][company];
                    return (
                      <TableCell key={company} className="text-right">
                        {cellData ? (
                          `${cellData.amount.toLocaleString()} ${cellData.currency}`
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold text-slate-900">
                    {companyNames
                      .map(company => accountCompanyMap[acc.account][company]?.amount || 0)
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
