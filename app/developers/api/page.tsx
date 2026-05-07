/*
 * Copyright 2025 Jtjr86
 *
 * Licensed under the Apache License, Version 2.0 (the \"License\");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an \"AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Code, Key, Shield } from "lucide-react";

export const metadata = {
  title: "API Reference - SSI Developers",
  description: "Complete API documentation for SSI Gateway, Kernel, and RPX Protocol",
};

export default function APIPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-white">API Reference</h1>
            <p className="text-xl text-white leading-relaxed">
              Complete documentation for SSI Gateway, Kernel, and RPX Protocol APIs
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <Key className="text-ssi-teal mb-4" size={32} />
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">API key management, OAuth flows, and session handling</p>
                <Button variant="outline" size="sm" className="w-full">View Docs</Button>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <Shield className="text-ssi-teal mb-4" size={32} />
                <CardTitle>Agent Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Register and manage agent identities</p>
                <Button variant="outline" size="sm" className="w-full">View Docs</Button>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <Code className="text-ssi-teal mb-4" size={32} />
                <CardTitle>RPX Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Request-Permission-Execution packet structure and flow</p>
                <Button variant="outline" size="sm" className="w-full">View Docs</Button>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <Book className="text-ssi-teal mb-4" size={32} />
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Query and analyze governance decision history</p>
                <Button variant="outline" size="sm" className="w-full">View Docs</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">Core API Endpoints</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-mono font-semibold">POST</span>
                  <code className="ml-3 text-lg font-mono">/v1/agents/register</code>
                </div>
              </div>
              <p className="text-gray-700 mb-4">Register a new autonomous agent with the SSI Gateway</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`{
  "name": "financial-analyzer",
  "type": "reasoning",
  "capabilities": ["data-analysis", "report-generation"],
  "version": "1.0.0"
}`}</pre>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-mono font-semibold">POST</span>
                  <code className="ml-3 text-lg font-mono">/v1/rpx/submit</code>
                </div>
              </div>
              <p className="text-gray-700 mb-4">Submit an RPX packet for governance evaluation</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`{
  "rpx_version": "1.0",
  "agent_ssid": "ssid://agent/...",
  "action": { "type": "data.query", ... },
  "context": { "domain": "finance", ... }
}`}</pre>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-mono font-semibold">GET</span>
                  <code className="ml-3 text-lg font-mono">/v1/audit/trail</code>
                </div>
              </div>
              <p className="text-gray-700 mb-4">Retrieve audit trail for an agent or action</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs">
                <pre>?agent_ssid=ssid://...&limit=50&offset=0</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-3">Python verifier API</h2>
          <p className="text-gray-700 mb-6 max-w-3xl leading-relaxed">
            The Python sibling at{" "}
            <code className="font-mono text-sm">sdks/python/ssi_protocol/verify</code>{" "}
            provides a pure-stdlib reference verifier for RPX records and
            ReceiptBundles. Same canonical-byte rule as the TypeScript reference;
            byte-identical hash output. See the{" "}
            <a href="/protocol/cross-runtime-verification" className="text-ssi-teal hover:underline">
              cross-runtime verification framing
            </a>{" "}
            for what this property does and does not establish.
          </p>
          <div className="bg-gray-900 text-gray-100 p-5 rounded font-mono text-xs overflow-x-auto">
            <pre>{`from ssi_protocol.verify import (
    verify_record,             # single RPX record
    verify_chain,              # full RPX chain walk
    verify_receipt_bundle,     # portal-emitted ReceiptBundle JSON
    compute_record_hash,
    compute_bundle_hash,
    compute_row_chain_hash,
)

# Verify an RPX chain
import json
records = [json.loads(l) for l in open("chain.jsonl") if l.strip()]
report = verify_chain(records)
print(report.integrity_status)         # VALID / INVALID / INCOMPLETE
print(len(report.tamper_evidence))     # finding count

# Verify a ReceiptBundle (portal-emitted /api/audit/receipt/<id>)
with open("receipt.json") as f:
    bundle = json.load(f)
print(verify_receipt_bundle(bundle).integrity_status)`}</pre>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            CLI distribution (<code className="font-mono">python -m ssi_protocol.verify --in</code>)
            and PyPI release of the verifier subpackage are deferred to a
            future release; today&apos;s distribution is via repository checkout.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Interactive API Explorer</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Try the API directly in your browser with our interactive documentation
          </p>
          <Button size="lg" className="bg-ssi-navy hover:bg-blue-900">
            Launch API Explorer
          </Button>
        </div>
      </section>
    </div>
  );
}
