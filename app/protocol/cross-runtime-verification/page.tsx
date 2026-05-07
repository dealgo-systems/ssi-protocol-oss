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
import { AlertTriangle, ArrowRight, CheckCircle, Code, GitBranch, XCircle } from "lucide-react";

export const metadata = {
  title: "Cross-Runtime Verification - SSI Protocol",
  description:
    "Independent runtime implementations reproducing the same integrity conclusions about the same artifact. Reproducibility, not truth certification.",
};

export default function CrossRuntimeVerificationPage() {
  return (
    <div className="bg-white">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>Critical distinction:</strong> Cross-runtime verification
            is <em>deterministic replay agreement</em> about an artifact.
            It is not consensus on truth, not certification of correctness,
            not adjudication of governance validity.
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-ssi-navy to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Cross-Runtime Verification
            </h1>
            <p className="text-xl text-white leading-relaxed">
              Independent runtime implementations of the same canonical-byte
              rule, given the same receipt bytes, reproduce the same
              integrity conclusions about the same artifact. Reproducibility
              is the property — not truth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-8">What this property is</h2>
          <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mb-12">
            A receipt produced by a conformant emitter can be verified by an
            independent runtime that consumes only the receipt bytes — no
            network call to the producer is required, no shared
            infrastructure is assumed. Two such runtimes implementing the same
            canonical-byte rule reach byte-identical results: the same chain
            hashes, the same bundle hash, the same VALID / INVALID / INCOMPLETE
            classification.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-600" size={28} />
                  <CardTitle className="text-xl">What it IS</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700 text-sm leading-relaxed">
                <ul className="list-disc list-inside space-y-2">
                  <li>Independent runtimes deriving byte-identical canonical bytes from the same input</li>
                  <li>Two verifiers reaching the same classification on the same bundle</li>
                  <li><code className="font-mono text-xs">compute_bundle_hash(bundle) == bundle["bundle_hash"]</code> holding in every conformant runtime</li>
                  <li>Deterministic replay agreement</li>
                  <li>Reproducibility of integrity conclusions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-rose-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <XCircle className="text-rose-600" size={28} />
                  <CardTitle className="text-xl">What it is NOT</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700 text-sm leading-relaxed">
                <ul className="list-disc list-inside space-y-2">
                  <li>Consensus on truth</li>
                  <li>Proof that the underlying decision was correct</li>
                  <li>Certification of the producer</li>
                  <li>Adjudication of governance validity</li>
                  <li>Adjudication of fairness, ethics, or substantive correctness</li>
                  <li>A "verified ✓" badge that means anything beyond byte reproducibility</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-semibold mb-8">Why this property matters</h2>
          <div className="text-gray-700 leading-relaxed max-w-4xl space-y-4">
            <p>
              Before cross-runtime verification, a receipt produced by a
              runtime could only be verified by that runtime (or one
              structurally identical to it). The verifier's interpretation
              was <strong>runtime-coupled</strong>; switching runtimes risked
              changing what "verified" meant; third parties had to trust the
              runtime that emitted the receipt; replay was bound to a single
              execution environment.
            </p>
            <p>
              After cross-runtime verification, a receipt becomes a portable
              continuity artifact. A holder of the JSON file plus any
              conformant verifier can re-derive every chain hash and the
              bundle hash without contacting the producer. Trust shifts from
              the runtime to the artifact — the bytes themselves carry the
              evidence, and the canonical-byte rule defines exactly what it
              means to verify them.
            </p>
            <p>
              This is similar to how a signed PDF or X.509 certificate is
              portable: a verifier with the right algorithm can re-derive
              the signature without trusting the issuer's infrastructure.
              The protocol-level analogue here is hash-chain integrity rather
              than asymmetric signature, but the trust-decoupling property
              is the same.
            </p>
          </div>

          <h2 className="text-3xl font-semibold mb-8 mt-16">How it's established operationally</h2>
          <p className="text-gray-700 leading-relaxed max-w-4xl mb-8">
            Two reference verifiers ship with this protocol. Both implement
            the same canonical-byte rule (RFC 8785-style) and consume the same
            golden vectors.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 hover:border-ssi-teal transition-all">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Code className="text-ssi-teal" size={24} />
                  TypeScript reference
                </CardTitle>
                <CardDescription className="text-sm">
                  <code className="font-mono">tools/ssi-verify</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                Node.js CLI. Verifies records, chains, and produces compliance
                reports against the golden vectors at <code className="font-mono text-xs">tests/vectors/rpx/</code>.
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-ssi-teal transition-all">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Code className="text-ssi-teal" size={24} />
                  Python sibling
                </CardTitle>
                <CardDescription className="text-sm">
                  <code className="font-mono">sdks/python/ssi_protocol/verify</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                Pure-stdlib (hashlib, json, dataclasses). Includes a{" "}
                <code className="font-mono text-xs">bundle.py</code> adapter
                that consumes the same{" "}
                <Link href="/protocol/receipt-bundle" className="text-ssi-teal hover:underline">ReceiptBundle</Link> the
                browser TS verifier validates.
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-semibold mb-6 mt-12">Two layers of evidence</h2>
          <div className="space-y-6 max-w-4xl">
            <div className="border-l-4 border-ssi-teal pl-5">
              <h3 className="font-semibold text-lg mb-2">Layer 1 — Synthetic vector parity</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                For every golden vector in <code className="font-mono">tests/vectors/rpx/</code>,
                both verifiers produce the same <code className="font-mono">integrity_status</code>{" "}
                and the same tamper-evidence count. Asserted by{" "}
                <code className="font-mono text-xs">sdks/python/tests/test_verifier_vectors.py</code>.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-5">
              <h3 className="font-semibold text-lg mb-2">Layer 2 — Real-artifact parity</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                For at least one real <code className="font-mono">ReceiptBundle</code> exported
                from a conformant emitter, the Python adapter's{" "}
                <code className="font-mono text-xs">compute_bundle_hash(real_bundle)</code> is
                byte-identical to the <code className="font-mono">bundle_hash</code> the producer
                wrote into the bundle. Asserted by{" "}
                <code className="font-mono text-xs">sdks/python/tests/test_real_export.py</code>{" "}
                — env-driven via <code className="font-mono">BUNDLE_PATH</code>; bundle data is
                never committed to this repo.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed mt-2">
                Real-artifact parity is the stronger assertion. Synthetic parity
                proves the algorithm. Real-artifact parity proves the actual
                emitted production artifact survives independent recomputation
                intact.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gray-50 rounded-lg p-8 border">
            <h2 className="text-xl font-semibold mb-3">What verification does not establish</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Saying it twice for clarity: cross-runtime verification proves
              that bytes are reproducible. It does <strong>not</strong> prove:
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>The decision recorded in the receipt was correct, fair, just, or ethical</li>
              <li>The producer's policy framework was sound</li>
              <li>The operator who approved the decision had legitimate authority</li>
              <li>The action documented in the receipt was authorized</li>
              <li>Compliance with any external regulatory standard</li>
            </ul>
            <p className="text-sm text-gray-700 leading-relaxed mt-4">
              The substantive content — what decision was made, by whom, under
              what policy, with what authority — is governed by separate
              properties (the policy framework, the producer's identity
              attestation, the chain of human approvals recorded inside the
              receipt's signed bytes). Verification is one input to evaluating
              those properties; it is not equivalent to them.
            </p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-4">
            <Link
              href="/protocol/receipt-bundle"
              className="inline-flex items-center gap-2 text-ssi-teal hover:underline font-medium"
            >
              <GitBranch size={16} />
              Receipt Bundle reference
              <ArrowRight size={16} />
            </Link>
            <Link
              href="https://github.com/dealgo-systems/ssi-protocol-oss/blob/main/docs/protocol/CROSS_RUNTIME_VERIFICATION.md"
              className="inline-flex items-center gap-2 text-ssi-teal hover:underline font-medium"
            >
              Full spec on GitHub
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
