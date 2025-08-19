import { useState } from "react";
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
  Activity
} from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { Company } from "@/types";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-amber-600" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4 text-slate-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-50 text-slate-600 border-slate-200"
  };
  
  return (
    <Badge className={`${variants[status as keyof typeof variants]} border capitalize`}>
      {status}
    </Badge>
  );
};

interface EnhancedDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const { state, activeSubconso, activeCompanies, actions } = useAppState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock company statuses for demo
  const getCompanyStatus = (company: Company) => {
    const statuses = ['completed', 'processing', 'pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getCompanyProgress = (company: Company) => {
    const status = getCompanyStatus(company);
    return status === 'completed' ? 100 : status === 'processing' ? 75 : 0;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const completedCompanies = activeCompanies.filter(c => getCompanyStatus(c) === 'completed').length;
  const totalValue = activeCompanies.reduce((sum, company) => {
    // Mock calculation based on ownership
    return sum + (company.ownership * 1000000);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header with Subconso Selector */}
      <div className="flex items-center justify-between pb-2">
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="font-semibold">{activeSubconso?.name} Group</span>
            <ArrowDown className="w-4 h-4" />
          </Button>
          {dropdownOpen && (
            <div className="absolute left-0 z-20 mt-2 w-44 rounded-lg border bg-white shadow-lg">
              {state.subconsos.map(group => (
                <button
                  key={group.id}
                  className={`block w-full px-4 py-2 text-left hover:bg-slate-100 ${
                    state.activeSubconsoId === group.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <span className="text-slate-400 text-sm">
            {activeCompanies.length} companies in scope
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900">{activeCompanies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {activeCompanies.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Period</p>
                <p className="text-2xl font-bold text-slate-900">{state.currentPeriod?.name}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Status: {state.currentPeriod?.status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              Weighted by ownership
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round((completedCompanies / activeCompanies.length) * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {completedCompanies} of {activeCompanies.length} companies
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Company Status</CardTitle>
                <CardDescription>
                  Latest data upload status for {state.currentPeriod?.name}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate('upload')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCompanies.map((company) => {
              const status = getCompanyStatus(company);
              const progress = getCompanyProgress(company);
              return (
                <div key={company.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon status={status} />
                    <div>
                      <p className="font-medium text-slate-900">{company.name}</p>
                      <p className="text-sm text-slate-500">
                        {company.country} • {company.ownership}% ownership • {company.lastUpdated ? new Date(company.lastUpdated).toLocaleDateString() : 'No data'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate('reports')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Consolidation group "{activeSubconso?.name}" updated
                </p>
                <p className="text-xs text-slate-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Chart mapping completed for {activeCompanies[0]?.name}
                </p>
                <p className="text-xs text-slate-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <Upload className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Trial balance uploaded for {activeCompanies[1]?.name}
                </p>
                <p className="text-xs text-slate-500">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks to streamline your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('upload')}
            >
              <Upload className="w-6 h-6" />
              <span>Upload Trial Balance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('config')}
            >
              <Building2 className="w-6 h-6" />
              <span>Manage Companies</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('reports')}
            >
              <TrendingUp className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}