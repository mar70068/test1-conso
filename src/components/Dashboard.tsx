import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowDown
} from "lucide-react";

// Types for props
interface DashboardProps {
  subconso: string;
  setSubconso?: (group: string) => void;
}

// Example subconso groups
const subconsoGroups = [
  "Global",
  "Europe",
  "Asia-Pacific"
];

const companies = [
  { name: "Acme Corp", country: "US", status: "completed", progress: 100, lastUpdate: "2 hours ago" },
  { name: "Global Tech Ltd", country: "UK", status: "processing", progress: 75, lastUpdate: "1 day ago" },
  { name: "Euro Manufacturing", country: "DE", status: "pending", progress: 0, lastUpdate: "3 days ago" },
  { name: "Asia Pacific Inc", country: "SG", status: "completed", progress: 100, lastUpdate: "5 hours ago" },
];

const recentConsolidations = [
  { name: "Q4 2024 Full Consolidation", date: "Dec 15, 2024", companies: 12, status: "completed" },
  { name: "November Flash Report", date: "Dec 1, 2024", companies: 8, status: "completed" },
  { name: "Q3 2024 Interim", date: "Oct 15, 2024", companies: 12, status: "completed" },
];

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

export function Dashboard({ subconso, setSubconso }: DashboardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Subconso Selector */}
      <div className="flex items-center justify-between pb-2">
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="font-semibold">{subconso} Group</span>
            <ArrowDown className="w-4 h-4" />
          </Button>
          {dropdownOpen && setSubconso && (
            <div className="absolute left-0 z-20 mt-2 w-44 rounded-lg border bg-white shadow-lg">
              {subconsoGroups.map(group => (
                <button
                  key={group}
                  className={`block w-full px-4 py-2 text-left hover:bg-slate-100 ${
                    subconso === group ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                  onClick={() => {
                    setSubconso(group);
                    setDropdownOpen(false);
                  }}
                >
                  {group}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-slate-400 text-sm">Select your consolidation perimeter</span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Periods</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Q4 2024, Nov 2024, Oct 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Consolidated Value</p>
                <p className="text-2xl font-bold text-slate-900">$2.4B</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-emerald-600 mt-2">+12.5% YoY growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">87%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">21 of 24 companies</p>
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
                <CardDescription>Latest data upload status for December 2024</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={company.status} />
                  <div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.country} • {company.lastUpdate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20">
                    <Progress value={company.progress} className="h-2" />
                  </div>
                  <StatusBadge status={company.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Consolidations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Consolidations</CardTitle>
                <CardDescription>Your latest consolidation reports</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentConsolidations.map((consolidation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-slate-900 mb-1">{consolidation.name}</p>
                  <p className="text-sm text-slate-500">{consolidation.date} • {consolidation.companies} companies</p>
                </div>
                <StatusBadge status={consolidation.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Upload className="w-6 h-6" />
              <span>Upload Trial Balance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Building2 className="w-6 h-6" />
              <span>Add New Company</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
