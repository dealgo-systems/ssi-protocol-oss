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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Code, FileCode, GitBranch, Lock, ArrowRight, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "RPX Protocol - Request-Permission-Execution",
  description: "Standardized communication protocol for safe, auditable autonomous agent actions",
};

export default function RPXPage() {
  return (
    <div className="bg-white">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>Protocol Status Note:</strong> RPX defines a message-level protocol for permission-based decision flows. It does not establish an approval authority, identity registry, compliance regime, or runtime control system. All enforcement, execution, and responsibility remain with implementers.
          </p>
        </div>
      </div>
      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-ssi-teal" size={48} />
              <h1 className="text-5xl font-bold text-white">RPX Protocol</h1>
            </div>
            <p className="text-xl text-white leading-relaxed mb-4">
              The Request-Permission-Execution protocol ensures all autonomous agent actions follow a structured, auditable flow with explicit policy-based permission decisions.
            </p>
            <p className="text-lg text-white/90 leading-relaxed">
              RPX is the fundamental communication protocol of SSI, designed for safety, transparency, and accountability in agent-to-infrastructure interactions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Protocol Flow</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three-phase process ensuring every action is validated before execution
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-lg border-2 border-ssi-teal">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-2xl">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3">Request Phase</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Agent constructs an RPX packet containing the proposed action, contextual metadata, parameters, and expected outcomes. The packet is submitted to an SSI Gateway instance (reference implementation supports optional cryptographic signatures). Agent identifiers are operator-defined; SSI does not operate a global identity registry.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="font-semibold text-sm mb-1">Required Fields</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Agent identifier</li>
                        <li>• Action type & parameters</li>
                        <li>• Context metadata</li>
                        <li>• Timestamp & signature</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="font-semibold text-sm mb-1">Optional Fields</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Priority level</li>
                        <li>• Timeout duration</li>
                        <li>• Callback URLs</li>
                        <li>• Custom headers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-2 border-ssi-teal">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-2xl">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3">Permission Phase</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The Gateway routes the request to the Kernel, which evaluates it against applicable governance envelopes. The Kernel returns a permission decision: PERMIT (with execution token), DENY (with explanation), or ADVISORY (permitted with warnings).
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="font-semibold text-sm mb-1 text-green-700">PERMIT</p>
                      <p className="text-xs text-gray-600">Action approved, execution token issued</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="font-semibold text-sm mb-1 text-red-700">DENY</p>
                      <p className="text-xs text-gray-600">Action blocked, reason provided</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-yellow-200">
                      <p className="font-semibold text-sm mb-1 text-yellow-700">ADVISORY</p>
                      <p className="text-xs text-gray-600">Permitted with warnings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-2 border-ssi-teal">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-2xl">
                  X
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3">Execution Phase</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If permitted, the agent executes the approved action. The SSI protocol does not observe or control execution; result submission is voluntary and implementation-defined. When logged, events are stored with hash-based integrity verification.
                  </p>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="font-semibold text-sm mb-2">Execution Logging</p>
                    <p className="text-sm text-gray-600">
                      Execution results are logged to create a complete audit trail. The pre-execution permission decision defines approved parameters; post-execution logging records actual outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Packet Structure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Standardized JSON format for reliable agent-infrastructure communication
            </p>
          </div>

          <div className="bg-ssi-navy text-white p-8 rounded-lg font-mono text-sm overflow-x-auto mb-8">
            <pre>{`{
  "rpx_version": "1.0",
  "packet_id": "rpx_7f3e8d9c1b2a4e5f",
  "timestamp": "2024-12-11T10:30:00Z",
  "agent": {
    "id": "operator-defined-agent-id",
    "type": "reasoning",
    "version": "2.1.0",
    "capabilities": ["data-analysis", "report-generation"]
  },
  "action": {
    "type": "data.query",
    "domain": "finance",
    "description": "Analyze Q4 financial transactions",
    "parameters": {
      "query": "SELECT * FROM transactions WHERE quarter = 'Q4'",
      "sensitivity": "high",
      "retention": "90d"
    },
    "expected_outcome": {
      "type": "report",
      "format": "pdf",
      "max_size": "10MB"
    }
  },
  "context": {
    "jurisdiction": "US",
    "user_consent": true,
    "business_purpose": "quarterly-audit",
    "risk_level": "medium"
  },
  "signature": {
    "algorithm": "ES256",
    "value": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`}</pre>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Core Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">rpx_version:</span> Protocol version for compatibility checking
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">packet_id:</span> Unique identifier for tracking and correlation
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">agent:</span> Complete agent identity and capability information
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">action:</span> Detailed description of proposed action
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Security Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Lock className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">timestamp:</span> ISO 8601 timestamp for replay attack prevention
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">signature:</span> Optional signature field for integrity verification (implementation-defined)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">context.jurisdiction:</span> Jurisdictional context provided by operator for policy selection
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="text-ssi-teal flex-shrink-0 mt-1" size={20} />
                    <div>
                      <span className="font-semibold">context.risk_level:</span> Self-assessed risk for prioritization
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Protocol Integration Pattern</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HTTP request/response pattern for RPX message exchange (SDK examples available in developer documentation)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileCode className="text-ssi-teal" size={28} />
                  <CardTitle className="text-xl">HTTP Request Example</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto font-mono">
                  <pre>{`POST /v1/decisions HTTP/1.1
Host: your-gateway.example.com
Content-Type: application/json

{
  "client_id": "operator-defined-client",
  "system_id": "operator-defined-system",
  "action": {
    "type": "data.query",
    "payload": {
      "query": "SELECT * FROM users",
      "sensitivity": "high"
    }
  },
  "context": {
    "domain": "healthcare",
    "jurisdiction": "US"
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="text-ssi-teal" size={28} />
                  <CardTitle className="text-xl">HTTP Response Example</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto font-mono">
                  <pre>{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "decision": {
    "decision": "ALLOW",
    "reason": "Request approved",
    "details": {
      "envelope_id": "env_123",
      "rules_evaluated": 3
    }
  },
  "rpx_id": "rpx_7f3e8d9c1b2a4e5f"
}

// Or DENY response:
{
  "success": false,
  "decision": {
    "decision": "DENY",
    "reason": "Exceeds notional limit"
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Protocol Versioning</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Backward compatibility and evolution strategy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="text-ssi-teal" size={32} />
                <h3 className="text-xl font-bold">Current: v1.0</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Initial stable release with core RPX functionality, agent registration, and basic governance integration.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-ssi-teal" />
                  Request-Permission-Execution flow
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-ssi-teal" />
                  Optional signature support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-ssi-teal" />
                  Basic context fields
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="text-ssi-teal" size={32} />
                <h3 className="text-xl font-bold">Planned: v2.0</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Enhanced features including multi-agent coordination primitives and extended metadata support.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Agent-to-agent communication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Batch request handling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Extended telemetry
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="text-ssi-teal" size={32} />
                <h3 className="text-xl font-bold">Future: v3.0</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Advanced capabilities for federated governance and cross-protocol interoperability.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Federated policy evaluation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Protocol bridges
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  Enhanced signature options
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-2">Versioning Approach</h4>
            <p className="text-gray-700 leading-relaxed mb-3">
              The protocol uses semantic versioning. Implementations may choose their own compatibility strategies based on operational requirements.
            </p>
            <p className="text-sm text-gray-600 italic">
              Version roadmap reflects current design exploration and may change based on implementer feedback.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-3">Related: continuity envelope and runtime portability</h2>
          <p className="text-gray-700 max-w-3xl mb-4 leading-relaxed">
            RPX defines the constitutional decision artifact. The{" "}
            <Link href="/protocol/receipt-bundle" className="text-ssi-teal hover:underline">
              Receipt Bundle
            </Link>{" "}
            composes an RPX-shaped decision plus its surrounding continuity
            (approvals, webhook deliveries, outcomes, operator actions) into a
            single deterministic JSON object.{" "}
            <Link href="/protocol/cross-runtime-verification" className="text-ssi-teal hover:underline">
              Cross-runtime verification
            </Link>{" "}
            is the property that independent runtimes reproduce the same
            integrity conclusions about the same artifact — deterministic
            replay agreement, not truth certification.
          </p>
        </div>
      </section>

      <section className="py-20 bg-ssi-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Start Building with RPX</h2>
          <p className="text-xl text-white mb-8 leading-relaxed">
            Explore the full API reference and integration guides
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-ssi-teal hover:bg-teal-600 text-white">
              <Link href="/developers/api">
                API Reference <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ssi-navy bg-transparent">
              <Link href="/developers/quickstart">
                Quick Start Guide
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
