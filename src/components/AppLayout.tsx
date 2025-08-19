import { useState } from "react";
import { 
  Building2, 
  Upload, 
  Settings, 
  BarChart3, 
  FileText, 
  Calculator,
  Home,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  { name: "Dashboard", id: "dashboard", icon: Home },
  { name: "Data Upload", id: "upload", icon: Upload },
  { name: "Group Config", id: "config", icon: Settings },
  { name: "Chart Mapping", id: "mapping", icon: BarChart3 },
  { name: "Consolidated Sheet", id: "sheet", icon: FileText },
  { name: "Pivot Panel", id: "pivot", icon: Calculator },
  { name: "Adjustments", id: "adjustments", icon: Calculator },
  { name: "Reports", id: "reports", icon: Building2 },
];

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Clarynt Conso</h1>
              <p className="text-xs text-slate-500">Consolidation Studio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-slate-900 capitalize">
                {navigation.find(item => item.id === currentPage)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Quick Upload
            </Button>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
