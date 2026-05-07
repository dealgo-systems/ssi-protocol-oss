/*
 * Copyright 2025 Jtjr86
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, FileCode, GitBranch, Layers, Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Receipt Bundle - SSI Protocol",
  description:
    "The per-decision continuity artifact: what a ReceiptBundle is, what it carries, and what verifying one does (and does not) establish.",
};

export default function ReceiptBundlePage() {
  return (
    <div className="bg-white">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>Protocol Surface Note:</strong> A ReceiptBundle is the
            per-decision continuity artifact. Verifying a bundle establishes
            that its bytes are reproducible and unaltered, not that the
            underlying decision was correct or compliant with any external
            standard.
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-white">Receipt Bundle</h1>
            <p className="text-xl text-white leading-relaxed">
              The per-decision continuity artifact. Composes a decision row,
              its approvals and webhook deliveries, the attached outcome, and
              every operator action linked to it — into a single deterministic
              JSON object verifiable byte-for-byte by any conformant runtime.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">What it carries</CardTitle>
                <CardDescription className="text-base">
                  Six artifact slots, each verifiable independently
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 leading-relaxed">
                <p>A ReceiptBundle is a JSON object with these top-level fields:</p>
                <ul className="space-y-1 text-sm">
                  <li><code className="font-mono">decision</code> — chain row + signed canonical bytes</li>
                  <li><code className="font-mono">approval</code> — escalation row, or <code>null</code></li>
                  <li><code className="font-mono">webhook_deliveries[]</code> — every delivery attempt</li>
                  <li><code className="font-mono">outcome</code> — attached outcome, or <code>null</code></li>
                  <li><code className="font-mono">operator_actions[]</code> — chain rows linked to this decision</li>
                  <li><code className="font-mono">bundle_hash</code> — sha256 over the deterministic JSON form of everything above</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-ssi-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch className="text-ssi-teal" size={32} />
                </div>
                <CardTitle className="text-2xl">How it verifies</CardTitle>
                <CardDescription className="text-base">
                  Two formulas, frozen across runtimes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 leading-relaxed">
                <p className="font-mono text-xs bg-gray-50 p-3 rounded border">
                  chain_hash = sha256(<br />
                  &nbsp;&nbsp;(previous_hash ?? "") + "\n" + canonical_bytes<br />
                  )
                </p>
                <p className="font-mono text-xs bg-gray-50 p-3 rounded border">
                  bundle_hash = sha256(<br />
                  &nbsp;&nbsp;canonical_json(bundle - bundle_hash)<br />
                  )
                </p>
                <p className="text-sm">
                  Independent runtimes implementing the same canonical-byte
                  rule reproduce the same hashes. See{" "}
                  <Link href="/protocol/cross-runtime-verification" className="text-ssi-teal hover:underline">
                    Cross-runtime verification
                  </Link>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-amber-400 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="text-amber-600" size={32} />
                </div>
                <CardTitle className="text-2xl">What verifying establishes</CardTitle>
                <CardDescription className="text-base">
                  Integrity and reproducibility — nothing more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 leading-relaxed">
                <p>A successfully verified bundle establishes:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>the bundle's bytes have not been altered after the fact</li>
                  <li>the chain links resolve consistently from row to row</li>
                  <li>independent runtimes derive the same hashes from the same bytes</li>
                </ul>
                <p className="text-sm font-semibold mt-3">
                  It does not establish that the decision was correct, fair,
                  authorized, or compliant. Those are separate properties
                  with separate evidence requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-rose-400 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-rose-50 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="text-rose-600" size={32} />
                </div>
                <CardTitle className="text-2xl">Preservation discipline</CardTitle>
                <CardDescription className="text-base">
                  The intermediary preservation rule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 leading-relaxed text-sm">
                <p>Conformant intermediaries (portals, transport layers, storage adapters) MUST:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>preserve unknown top-level fields byte-for-byte</li>
                  <li>preserve array order (chain order is signed)</li>
                  <li>preserve <code className="font-mono">null</code> as distinct from absent</li>
                  <li>never coerce types or normalize whitespace</li>
                  <li>treat per-row <code className="font-mono">canonical_bytes</code> as opaque — never re-canonicalize</li>
                </ul>
                <p>
                  Full rules:{" "}
                  <Link href="https://github.com/dealgo-systems/ssi-protocol-oss/blob/main/docs/protocol/RECEIPT_BUNDLE.md" className="text-ssi-teal hover:underline">
                    RECEIPT_BUNDLE.md (forensic discipline)
                  </Link>.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 border">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <FileCode className="text-ssi-teal" size={24} />
              Reference verifiers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Two reference implementations ship with this repository, both
              honoring the same canonical-byte rule and producing byte-identical
              hash output for the same input:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>TypeScript:</strong>{" "}
                <code className="font-mono">tools/ssi-verify</code> — Node.js
                CLI for chain + record + report verification.
              </li>
              <li>
                <strong>Python:</strong>{" "}
                <code className="font-mono">sdks/python/ssi_protocol/verify/bundle.py</code> — pure-stdlib
                ReceiptBundle adapter.{" "}
                <code className="font-mono">verify_receipt_bundle(bundle_dict)</code> returns the same
                VerificationReport shape as the RPX-side verifier.
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/protocol/cross-runtime-verification"
                className="inline-flex items-center gap-2 text-ssi-teal hover:underline font-medium"
              >
                Read the cross-runtime verification framing
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-4">Out of scope (deliberately)</h2>
          <ul className="text-gray-700 space-y-1 list-disc list-inside text-sm">
            <li>Verifying a bundle does not certify the producer.</li>
            <li>Verifying a bundle does not adjudicate governance authority.</li>
            <li>Verifying a bundle does not prove the decision was correct or authorized — those properties live in the bundle's signed bytes themselves and require separate evaluation.</li>
            <li>The protocol does not specify a streaming emission path; conformant emitters produce ReceiptBundles on their own schedule.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
