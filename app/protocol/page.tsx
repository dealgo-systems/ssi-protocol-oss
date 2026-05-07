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
import { Shield, Network, BookOpen, Scale, ArrowRight, Layers, GitBranch, Lock, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Protocol Architecture - SSI",
  description: "Comprehensive architecture overview of the Sovereign Synthetic Intelligence Protocol",
};

export default function ProtocolPage() {
  return (
    <div className="bg-white">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>Protocol Specification:</strong> This document defines an open protocol specification. It does not establish a certification authority, regulatory compliance framework, or managed service offering. Organizations implement this protocol independently according to their own operational requirements.
          </p>
        </div>
      </div>
      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-white">SSI Protocol Specification</h1>
            <p className="text-xl text-white leading-relaxed">
              Open standard for AI system governance defining message formats, decision flows, and protocol conformance rules. Built for interoperability and vendor independence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Protocol Specification</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Core protocol elements defining standardized AI governance interfaces, message formats, and protocol conformance rules
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">Governance Envelopes</CardTitle>
                <CardDescription className="text-base">
                  Policy Definition Format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Standardized JSON format for defining AI governance policies, rules, and constraints. Versioned with optional signature support (reference implementation provides hot-reload).
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Pre-execution policy evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Multi-dimensional safety constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Framework-agnostic policy authoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Audit trail generation</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/protocol/kernel">
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Network className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">Decision Requests</CardTitle>
                <CardDescription className="text-base">
                  Standardized Message Format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  JSON schema defining how AI systems request governance decisions, including action context, system identification, and execution parameters.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>System identification format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Action payload specification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Context metadata requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Timestamp and tracing fields</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/protocol/gateway">
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">Conformance Testing</CardTitle>
                <CardDescription className="text-base">
                  Self-Executable Test Suite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Example test suite demonstrating protocol conformance patterns for interoperability with SSI Protocol specification. These tests do not confer certification or approval.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Structured action request format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Permission evaluation and granting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Event logging format specifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Hash-based integrity verification (reference implementation)</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/protocol/rpx">
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">Governance Envelopes</CardTitle>
                <CardDescription className="text-base">
                  Policy & Constraint Containers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Governance Envelopes are structured policy containers that define boundaries, permissions, and safety constraints for autonomous agent operations.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Hierarchical policy structures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Contextual constraint application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Dynamic policy updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ssi-teal rounded-full mt-2"></div>
                    <span>Cross-domain policy composition</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/protocol/governance-envelopes">
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Protocol Principles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Core design principles guiding SSI architecture and implementation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <div className="w-12 h-12 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="text-ssi-teal" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Safety by Default</h3>
              <p className="text-gray-600 leading-relaxed">
                All agent actions are validated against safety policies before execution. No action proceeds without explicit permission and boundary verification.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <div className="w-12 h-12 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="text-ssi-teal" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Layered Defense</h3>
              <p className="text-gray-600 leading-relaxed">
                Multiple validation layers ensure comprehensive safety coverage. Each layer provides independent verification of agent behavior and intent.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <div className="w-12 h-12 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="text-ssi-teal" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Interoperability First</h3>
              <p className="text-gray-600 leading-relaxed">
                Built on open standards with protocol translation capabilities. Works with existing frameworks and enables seamless multi-agent coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">System Flow</h2>
            <p className="text-xl text-gray-600">
              How SSI components work together to ensure safe agent operations
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="w-10 h-10 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Agent Connection</h3>
                <p className="text-gray-600">
                  Autonomous agents connect to an SSI Gateway instance, providing identity credentials and capability declarations using operator-defined identifiers and authentication methods.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="w-10 h-10 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Action Request (RPX)</h3>
                <p className="text-gray-600">
                  When an agent intends to perform an action, it constructs an RPX packet containing the action details, context, and required parameters. This packet is submitted to the SSI Gateway.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="w-10 h-10 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Policy Evaluation (Kernel)</h3>
                <p className="text-gray-600">
                  The SSI Kernel evaluates the request against applicable Governance Envelopes, checking safety constraints, capability permissions, resource limits, and custom policy rules defined in loaded envelopes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="w-10 h-10 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Permission Grant or Deny</h3>
                <p className="text-gray-600">
                  Based on policy evaluation, the Kernel returns a permission decision with detailed feedback. If approved, the agent receives an execution token. If denied, the agent receives explanation and guidance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="w-10 h-10 bg-ssi-teal text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Execution and Logging</h3>
                <p className="text-gray-600">
                  The agent executes the approved action. Execution events may be logged according to operator-defined audit policies using hash-based integrity verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">SSI Runtime - Reference Implementation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reference implementation demonstrating protocol capabilities including example policy workflow patterns
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-ssi-teal">
              <CardHeader>
                <CardTitle className="text-xl">SSI Kernel & Gateway</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">Reference runtime components implementing the SSI Protocol with example features like policy feedback patterns and operator-supervised governance workflows.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/protocol/kernel">View Implementation Guide</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Production Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">Example governance workflows and demonstration features available through the reference implementation and protocol specification.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/developers">Implementation Guide</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Continuity Artifacts (v1.1.x)</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Per-decision continuity envelopes and the cross-runtime verification property
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 hover:border-ssi-teal transition-all">
              <CardHeader>
                <CardTitle className="text-xl">Receipt Bundle</CardTitle>
                <CardDescription>The per-decision continuity artifact</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Composes a decision row, its approvals and webhook deliveries,
                  the attached outcome, and every operator action linked to it
                  into a single deterministic JSON object verifiable byte-for-byte
                  by any conformant runtime.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/protocol/receipt-bundle">View Receipt Bundle Reference</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all">
              <CardHeader>
                <CardTitle className="text-xl">Cross-Runtime Verification</CardTitle>
                <CardDescription>Independent runtimes, same artifact, same hashes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Independent runtime implementations of the same canonical-byte
                  rule reproduce the same integrity conclusions about the same
                  artifact. This is deterministic replay agreement, not truth
                  certification.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/protocol/cross-runtime-verification">Read the Framing</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-ssi-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Build on the SSI Protocol</h2>
          <p className="text-xl text-white mb-8 leading-relaxed">
            Implement the open standard in your AI systems or deploy our reference runtime for immediate capabilities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-ssi-teal hover:bg-teal-600 text-white">
              <Link href="/developers">
                Protocol Implementation <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ssi-navy bg-transparent">
              <Link href="/developers">
                Runtime Deployment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
