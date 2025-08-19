
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Calendar,
  DollarSign,
  Plus,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Trash2,
  Edit
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
  country: string;
  currency: string;
  ownership: number;
}

interface Subconso {
  id: string;
  name: string;
  companyIds: string[]; // company ids belonging to this subconso
}

interface GroupConfigurationProps {
  companies: Company[];
  setCompanies: (c: Company[]) => void;
  subconsos: Subconso[];
  setSubconsos: (s: Subconso[]) => void;
}

export function GroupConfiguration({
  companies,
  setCompanies,
  subconsos,
  setSubconsos
}: GroupConfigurationProps) {
  // Last used id for subconso list; for new ones
  const [newSubconsoName, setNewSubconsoName] = useState("");
  const [selectedSubconsoId, setSelectedSubconsoId] = useState(subconsos[0]?.id || "");
  const [editingSubconsoName, setEditingSubconsoName] = useState("");

  // Get the currently selected subconso group
  const selectedSubconso = subconsos.find(s => s.id === selectedSubconsoId) || subconsos[0];

  // HANDLERS

  // Add a subconso
  const handleAddSubconso = () => {
    if (!newSubconsoName.trim()) return;
    // Simple id strategy: new Date().getTime()
    const newId = "subconso-" + Date.now().toString();
    setSubconsos([...subconsos, { id: newId, name: newSubconsoName.trim(), companyIds: [] }]);
    setSelectedSubconsoId(newId);
    setNewSubconsoName("");
  };

  // Remove a subconso
  const handleRemoveSubconso = (id: string) => {
    const rest = subconsos.filter(s => s.id !== id);
    setSubconsos(rest);
    if (selectedSubconsoId === id && rest.length > 0) {
      setSelectedSubconsoId(rest[0].id);
    }
  };

  // Rename a subconso
  const handleRenameSubconso = (id: string, newName: string) => {
    setSubconsos(subconsos.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  // Switch to subconso group when selected
  const handleSelectSubconso = (id: string) => {
    setSelectedSubconsoId(id);
    setEditingSubconsoName("");
  };

  // Add/remove company to the selected subconso group
  const toggleCompanyInclusion = (companyId: string) => {
    if (!selectedSubconso) return;
    const alreadyIncluded = selectedSubconso.companyIds.includes(companyId);
    setSubconsos(subconsos.map(s =>
      s.id !== selectedSubconso.id
        ? s
        : {
            ...s,
            companyIds: alreadyIncluded
              ? s.companyIds.filter(id => id !== companyId)
              : [...s.companyIds, companyId]
          }
    ));
  };

  // Set ownership for a company
  const updateOwnership = (companyId: string, ownership: number) => {
    setCompanies(
      companies.map(company => company.id === companyId
        ? { ...company, ownership }
        : company
      )
    );
  };

  // UI: Subconso List
  // ------------------------------------------

  return (
    <div className="space-y-8">
      {/* Subconso groups manager */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Manage Subconsolidations</CardTitle>
          <CardDescription>
            Create, rename, and manage different consolidation groups ("subconsos").
            Companies can belong to multiple subconsos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* List subconso groups */}
            <div className="flex flex-wrap gap-2 mb-4">
              {subconsos.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center px-3 py-1 rounded-lg mr-2 ${selectedSubconsoId === s.id ? "bg-blue-100 border border-blue-600" : "bg-slate-100"}`}
                >
                  {editingSubconsoName && selectedSubconsoId === s.id ? (
                    <input
                      type="text"
                      className="w-32 border px-2 py-1 mr-2 rounded"
                      value={editingSubconsoName}
                      onChange={e => setEditingSubconsoName(e.target.value)}
                      onBlur={() => {
                        if (editingSubconsoName.trim()) {
                          handleRenameSubconso(s.id, editingSubconsoName.trim())
                        }
                        setEditingSubconsoName("");
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && editingSubconsoName.trim()) {
                          handleRenameSubconso(s.id, editingSubconsoName.trim())
                          setEditingSubconsoName("");
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <button className="font-semibold text-blue-900 mr-1 hover:underline"
                        onClick={() => handleSelectSubconso(s.id)}
                      >{s.name}</button>
                      <button onClick={() => setEditingSubconsoName(s.name)}>
                        <Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                      </button>
                    </>
                  )}
                  {subconsos.length > 1 && (
                    <button className="ml-1" onClick={() => handleRemoveSubconso(s.id)}>
                      <Trash2 className="w-4 h-4 text-rose-400 hover:text-red-700" />
                    </button>
                  )}
                </div>
              ))}
              <input
                type="text"
                value={newSubconsoName}
                onChange={e => setNewSubconsoName(e.target.value)}
                placeholder="New subconso name"
                className="px-2 py-1 border rounded w-36 text-sm"
                onKeyDown={e => { if (e.key === "Enter") handleAddSubconso(); }}
              />
              <Button variant="outline" size="sm" onClick={handleAddSubconso}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Settings + Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Group Configuration</CardTitle>
              <CardDescription>
                Define settings and companies for the selected subconsolidation group.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Selection for Subconso */}
              <div>
                <Label className="block mb-2 text-base">Companies in <span className="font-semibold">{selectedSubconso?.name}</span></Label>
                <div className="space-y-4">
                  {companies.map((company) => {
                    const included = selectedSubconso?.companyIds.includes(company.id);
                    return (
                      <div key={company.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Switch
                            checked={included}
                            onCheckedChange={() => toggleCompanyInclusion(company.id)}
                          />
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900">{company.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <span>{company.code}</span>
                                <span>•</span>
                                <Globe className="w-3 h-3" />
                                <span>{company.country}</span>
                                <span>•</span>
                                <DollarSign className="w-3 h-3" />
                                <span>{company.currency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Label className="text-xs text-slate-500">Ownership %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={company.ownership}
                              onChange={(e) => updateOwnership(company.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                              disabled={!included}
                            />
                          </div>
                          {included && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Included
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Subconso Group</span>
                  <span className="text-sm font-medium">{selectedSubconso?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Companies</span>
                  <span className="text-sm font-medium">{selectedSubconso?.companyIds.length} of {companies.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Ownership</span>
                  <span className="text-sm font-medium">
                    {selectedSubconso?.companyIds.length
                      ? Math.round(selectedSubconso.companyIds
                          .map(cid => companies.find(c => c.id === cid)?.ownership || 0)
                          .reduce((a, b) => a + b, 0) / selectedSubconso.companyIds.length
                        ) + '%'
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
        <div className="flex items-center space-x-3">
          <Button variant="outline">Save as Template</Button>
          <Button>Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}

