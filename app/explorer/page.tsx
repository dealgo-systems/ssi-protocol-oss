/*
 * Copyright 2025 Jtjr86
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { FileUploadZone } from "@/components/explorer/FileUploadZone";
import { StatusBanner } from "@/components/explorer/StatusBanner";
import { ChainTimeline } from "@/components/explorer/ChainTimeline";
import { RecordDetailPanel } from "@/components/explorer/RecordDetailPanel";
import { TamperEvidencePanel } from "@/components/explorer/TamperEvidencePanel";
import { ExportButton } from "@/components/explorer/ExportButton";

export default function ExplorerPage() {
  const [verificationReport, setVerificationReport] = useState<any>(null);
  const [chainData, setChainData] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileUpload = (files: { report?: any; chain?: any[]; raw: any[] }) => {
    if (files.report) {
      setVerificationReport(files.report);
    }
    if (files.chain) {
      setChainData(files.chain);
    }
    setUploadedFiles(files.raw);
  };

  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-white/70 mb-3">
              Runtime-independent forensic continuity observatory
            </p>
            <h1 className="text-5xl font-bold mb-6 text-white">SSI Chain Explorer</h1>
            <p className="text-xl text-white leading-relaxed">
              Read-only inspection of RPX decision chains and ReceiptBundle
              artifacts. Upload an audit log or a receipt bundle to inspect
              integrity, replay per-row chain hashes, and surface tamper
              evidence — all in the browser, without a server round-trip.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mt-4 max-w-3xl">
              The Explorer is observability, not governance. It surfaces what
              the artifact records and reproducibly verifies it; it does not
              enforce, mutate, or adjudicate. Visible uncertainty is forensic
              transparency, not a failure indicator.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Upload Zone */}
          {!verificationReport && !chainData.length && (
            <div className="mb-8">
              <FileUploadZone onUpload={handleFileUpload} />
            </div>
          )}

          {/* Status Banner */}
          {verificationReport && (
            <div className="mb-8">
              <StatusBanner report={verificationReport} />
            </div>
          )}

          {/* Main Grid: Timeline + Detail */}
          {chainData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <ChainTimeline 
                  records={chainData}
                  onRecordClick={handleRecordClick}
                  selectedRecord={selectedRecord}
                />
              </div>
              <div className="lg:col-span-1">
                <RecordDetailPanel 
                  record={selectedRecord}
                  verificationReport={verificationReport}
                />
              </div>
            </div>
          )}

          {/* Tamper Evidence Panel */}
          {verificationReport?.findings && verificationReport.findings.length > 0 && (
            <div className="mb-8">
              <TamperEvidencePanel 
                findings={verificationReport.findings}
                onFindingClick={(recordIndex: number) => {
                  const record = chainData.find((r, idx) => idx === recordIndex);
                  if (record) setSelectedRecord(record);
                }}
              />
            </div>
          )}

          {/* Export Controls */}
          {(verificationReport || chainData.length > 0) && (
            <div className="flex justify-end gap-4">
              <ExportButton 
                report={verificationReport}
                chain={chainData}
                uploadedFiles={uploadedFiles}
              />
              <button
                onClick={() => {
                  setVerificationReport(null);
                  setChainData([]);
                  setSelectedRecord(null);
                  setUploadedFiles([]);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
              >
                Clear & Upload New
              </button>
            </div>
          )}

          {/* Info Footer */}
          {!verificationReport && !chainData.length && (
            <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <Info className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">What you can upload:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>RPX Chain</strong> (.jsonl): Decision chain audit log</li>
                    <li><strong>Verification Report</strong> (verification-report.json): Output from ssi-verify CLI</li>
                    <li><strong>Chain Proof</strong> (chain-proof.json): Integrity proof bundle</li>
                  </ul>
                  <p className="mt-4 font-semibold">This tool performs NO verification logic.</p>
                  <p className="mt-1">All integrity computations must be done by ssi-verify CLI. This UI only visualizes pre-verified results.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
