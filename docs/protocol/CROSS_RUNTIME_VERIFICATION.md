# Cross-Runtime Verification

**Status:** v1.1.x — load-bearing protocol property.
**Companion documents:** [`RECEIPT_BUNDLE.md`](RECEIPT_BUNDLE.md), [`RECEIPT_EVOLUTION.md`](RECEIPT_EVOLUTION.md), [`AUDIT.md`](../../AUDIT.md).

---

## What "cross-runtime verification" means here

Cross-runtime verification is the property that **independent runtime implementations** of the same canonical-byte rule, given the same receipt bytes, **reproduce the same integrity conclusions** about the same artifact.

That's it. It is one specific, narrow property — and pinning it precisely matters, because near-synonyms turn it into something it is not.

| What cross-runtime verification IS | What it is NOT |
|---|---|
| Independent runtimes deriving byte-identical canonical bytes from the same input | Consensus on truth |
| Two verifiers reaching the same `VALID` / `INVALID` / `INCOMPLETE` classification on the same bundle | Proof that the underlying decision was correct |
| `compute_bundle_hash(bundle) == bundle["bundle_hash"]` holding in every conformant runtime | Certification of the producer |
| Deterministic replay agreement | Adjudication of governance validity |
| Reproducibility of integrity conclusions | Adjudication of fairness, ethics, or substantive correctness |

The point of pinning the language here is that "the verifiers agreed" is *easy* to misread as "the system is correct." It is not. Two verifiers running the same canonical-byte rule will always agree about the bytes; that says nothing about whether the bytes encode a good decision.

## Why this property matters

Before cross-runtime verification, a receipt produced by a runtime could only be verified by that runtime (or one structurally identical to it). That meant:

- the verifier's interpretation was **runtime-coupled** — switching runtimes risked changing what "verified" meant
- third parties had to trust the runtime that emitted the receipt
- replay was bound to a single execution environment

After cross-runtime verification, a receipt becomes a portable continuity artifact:

- a holder of the JSON file plus *any* conformant verifier can re-derive every chain hash and the bundle hash without contacting the producer
- runtime-coupled trust shifts to artifact-coupled trust — the bytes themselves carry the evidence, and the canonical-byte rule defines exactly what it means to verify them
- the producer is no longer the privileged interpreter of its own emissions

This is similar to the way an X.509 certificate or a signed PDF is portable: a verifier with the right algorithm can re-derive the signature without trusting the issuer's infrastructure. The protocol-level analogue here is hash-chain integrity rather than asymmetric signature, but the trust-decoupling property is the same.

## How the property is established (operationally)

The protocol ships two reference verifiers:

| Implementation | Path | Runtime |
|---|---|---|
| TypeScript reference | [`tools/ssi-verify`](../../tools/ssi-verify/) | Node.js |
| Python sibling | [`sdks/python/ssi_protocol/verify`](../../sdks/python/ssi_protocol/verify/) | Python ≥ 3.8, stdlib only |

Both implement the same canonical-byte rule (RFC 8785-style: alphabetical key order at every depth, no whitespace, UTF-8 with non-ASCII as raw bytes, exclude `record_hash` and `metadata`). Both consume the same golden vectors at [`tests/vectors/rpx/`](../../tests/vectors/rpx/). The Python sibling additionally includes a `bundle.py` adapter that consumes the `ReceiptBundle` shape (see [`RECEIPT_BUNDLE.md`](RECEIPT_BUNDLE.md)).

The reproducibility property is asserted in two layers:

### Layer 1 — Synthetic vector parity

For every golden vector in `tests/vectors/rpx/`, both verifiers produce the same `integrity_status` and the same tamper-evidence count. This is asserted in [`sdks/python/tests/test_verifier_vectors.py`](../../sdks/python/tests/test_verifier_vectors.py), parametrized over the full vector set.

### Layer 2 — Real-artifact parity

For at least one real `ReceiptBundle` exported from a conformant emitter (in the reference deployment, that's `/api/audit/receipt/<id>` from the operator portal), the Python adapter's `compute_bundle_hash(real_bundle)` is byte-identical to the `bundle_hash` the producer wrote into the bundle. This is asserted in [`sdks/python/tests/test_real_export.py`](../../sdks/python/tests/test_real_export.py) — env-driven via `BUNDLE_PATH`, never with committed customer data.

Real-artifact parity is the stronger assertion. Synthetic parity proves the algorithm. Real-artifact parity proves the *actual emitted production artifact* survives independent recomputation intact.

## Acceptance bar for a new runtime sibling

If you build a third verifier in (say) Rust or Go, the bar for calling it conformant cross-runtime is:

1. Implement the canonical-byte rule per [`AUDIT.md`](../../AUDIT.md) §3.2 and [`RECEIPT_BUNDLE.md`](RECEIPT_BUNDLE.md) §"Hash formulas".
2. Run your verifier against every golden vector in `tests/vectors/rpx/`. It must classify each one identically to the existing reference verifiers.
3. For VALID vectors, every record's stored `record_hash` must equal your runtime's `compute_record_hash` output, byte-identically.
4. Recompute `bundle_hash` for at least one real `ReceiptBundle` export. Your runtime's value must equal the bundle's stored `bundle_hash`.
5. Honor every preservation rule in [`RECEIPT_BUNDLE.md`](RECEIPT_BUNDLE.md) §"Forensic discipline" — your runtime must not mutate the input, must preserve unknown fields, must preserve null vs absent, must not re-canonicalize per-row `canonical_bytes`.

Any runtime that meets these criteria can claim cross-runtime conformance. No certification authority is required for the claim itself — the evidence is the test fixtures and the byte-identical hash output.

## What this property does NOT establish

This is the load-bearing distinction. Saying it twice for clarity:

- It does **not** prove the decision recorded in the receipt was correct, fair, just, or ethical.
- It does **not** prove the producer's policy framework was sound.
- It does **not** prove the operator who approved the decision had legitimate authority.
- It does **not** establish governance validity.
- It does **not** function as a certification of the producer.
- It does **not** authorize the action documented in the receipt — authorization (if any) is recorded *within* the receipt's signed bytes; verification confirms those bytes are reproducible, not that the authorization was valid.

Cross-runtime verification is **deterministic replay agreement** about an artifact. The substantive content of the artifact — what decision was made, by whom, under what policy, with what authority — is a separate question, governed by a separate set of properties (the policy framework, the producer's identity attestation, the chain of human approvals recorded in the bundle). Verification is one input to evaluating those properties; it is not equivalent to them.

## Relationship to other protocol properties

| Property | What it establishes |
|---|---|
| **Integrity** (this document) | The artifact's bytes are reproducible from the canonical-byte rule. |
| **Authenticity** (Ed25519 signatures, see [`AUDIT.md`](../../AUDIT.md)) | The artifact was produced by the holder of a specific key. |
| **Authority** (governance envelopes, operator chain) | The decision was approved by an entity with the right to approve it under the active policy. |
| **Compliance** (out of scope for the protocol; see [`COMPLIANCE.md`](../../COMPLIANCE.md)) | The decision satisfies an external regulatory standard. |

Cross-runtime verification gives you the first row only. The other rows require additional inputs and are governed by different parts of the substrate.

## Reference test commands

```bash
# Run the TypeScript reference verifier against the golden vectors
cd tools/ssi-verify
npm test

# Run the Python sibling against the same golden vectors
cd ../../sdks/python
python -m pytest tests/test_verifier_vectors.py -v

# Run the Python ReceiptBundle adapter against synthetic fixtures
python -m pytest tests/test_receipt_bundle_adapter.py -v

# Run the Python ReceiptBundle adapter against a real portal export
# (BUNDLE_PATH points to a file you exported yourself; never committed)
BUNDLE_PATH=/path/to/your/receipt.json python -m pytest tests/test_real_export.py -v
```

If all four run clean, your environment confirms the cross-runtime verification property holds for the artifacts available to you.
