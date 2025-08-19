
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Upload, FileText, Building2, Calendar, CheckCircle2, AlertCircle, X, Plus } from "lucide-react";

import { useCompanies } from "@/hooks/useSupabaseData";

const mockCompanies = [
  { id: "1", name: "Acme Corp", code: "ACME" },
  { id: "2", name: "Global Tech Ltd", code: "GTECH" },
  { id: "3", name: "Euro Manufacturing", code: "EURO" },
];

const uploadedFiles = [
  { 
    name: "ACME_TB_Dec2024.csv", 
    company: "Acme Corp", 
    period: "Dec 2024", 
    status: "processed",
    size: "2.3 MB",
    uploadedAt: "2 hours ago"
  },
  { 
    name: "GTECH_TrialBalance_Dec2024.xlsx", 
    company: "Global Tech Ltd", 
    period: "Dec 2024", 
    status: "processing",
    size: "1.8 MB",
    uploadedAt: "1 day ago"
  },
];

export function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("Files dropped:", e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload
      console.log("Files selected:", e.target.files);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upload Trial Balance</CardTitle>
              <CardDescription>
                Drag and drop your CSV or Excel files, or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Drop your files here
                </h3>
                <p className="text-slate-600 mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </label>
                <p className="text-xs text-slate-500 mt-3">
                  Supports CSV, Excel files up to 10MB
                </p>
              </div>

              {/* Company and Period Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-12">December 2024</SelectItem>
                      <SelectItem value="2024-11">November 2024</SelectItem>
                      <SelectItem value="2024-10">October 2024</SelectItem>
                      <SelectItem value="2024-09">September 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Connect ERP
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Guidelines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">File Format</p>
                    <p className="text-xs text-slate-600">CSV, Excel (.xlsx, .xls)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Required Columns</p>
                    <p className="text-xs text-slate-600">Account Code, Account Name, Debit, Credit</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">File Size</p>
                    <p className="text-xs text-slate-600">Maximum 10MB per file</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Naming Convention</p>
                    <p className="text-xs text-slate-600">CompanyCode_TB_Period.ext</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Uploads</CardTitle>
          <CardDescription>
            Track the status of your uploaded trial balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>{file.company}</span>
                      <span>•</span>
                      <span>{file.period}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {file.status === 'processed' ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Processed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Processing
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {uploadedFiles.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No files uploaded yet</p>
              <p className="text-sm text-slate-500">Upload your first trial balance to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
