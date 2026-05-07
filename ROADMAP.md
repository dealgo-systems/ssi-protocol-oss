# SSI Protocol - Roadmap

SSI Protocol evolves slowly. Stability is a feature, not a bug.

**This roadmap is indicative (non-normative)** and does not override the constitutional documents.

---

## Current: v1.0.0-invariant (Constitutional Foundation)

✅ Core invariants defined (SPEC.md)
✅ Decision ontology established (DECISIONS.md)
✅ Verification procedures documented (AUDIT.md)
✅ Fail-closed semantics formalized (FAILURE.md)
✅ Certification framework published (COMPLIANCE.md)

---

## Shipped (v1.1.x — Compliance Tooling and Receipt Evolution)

The following items have shipped on `main` and are evidenced by merged PRs and passing tests. This roadmap is updated as items move from "Next" to "Shipped".

### Verification tooling

✅ **TypeScript reference verifier** (`tools/ssi-verify`) — chain + record + report verification CLI.
✅ **Python sibling verifier** (`sdks/python/ssi_protocol/verify`) — independent implementation; consumes the same RPX golden vectors as `tools/ssi-verify`. See PR #125.
✅ **Cross-runtime golden-vector parity** — both verifiers classify all 7 vectors identically, with byte-identical canonical-byte output. See `tools/ssi-verify/src/test-vectors.mjs` and `sdks/python/tests/test_verifier_vectors.py`.

### Receipt schema

✅ **RPX record schemas (v2.1)** — JSON Schema at `schemas/rpx-record.schema.json`. Adds optional `receipt_version`, `signing_key_id`, `policy_snapshot_fingerprint`, `payload_hash`, `signature` fields under additive-only evolution rules. See PR #124.
✅ **Receipt evolution rules** formalized at [`docs/protocol/RECEIPT_EVOLUTION.md`](docs/protocol/RECEIPT_EVOLUTION.md): additive-only fields, schema-version semantics, canonical-byte preservation, deprecation never deletion, verifier backward compatibility, producer key rotation as a chained event, intermediary preservation rule.

### Cross-runtime artifact convergence

✅ **ReceiptBundle adapter (Path ii)** — Python adapter at `sdks/python/ssi_protocol/verify/bundle.py` consumes the portal-emitted `ReceiptBundle` JSON format and produces byte-identical chain-hash and bundle-hash recomputation to the existing TypeScript reference verifier. See PR #126.
✅ **Real-artifact byte-identity** — independent runtimes reproduce the same integrity conclusions about the same artifact (see `sdks/python/tests/test_real_export.py` and PR #126 acceptance bar #2).

### Forensic explorer

✅ **Reference public Explorer** at `app/explorer/page.tsx` — runtime-independent forensic continuity observatory. Read-only, no enforcement, no mutation.
✅ Conceptual surfaces added: tamper evidence, replay traceability, lineage visualization, continuity navigation, cross-runtime verifier comparison, policy snapshot inspection. (The same surfaces also exist in the reference operator portal as separate authorized work.)

---

## Next: v1.2.0 (Conformance and Distribution Hardening)

**Target:** indicative; depends on RFC outcomes and ecosystem signals.

- [ ] Compliance test suite (automated verification harness across implementations)
- [ ] Reference policy examples (governance envelopes for common decision classes)
- [ ] Auditor self-assessment program (no certification authority is established by this work)
- [ ] CLI distribution: `python -m ssi_protocol.verify --in <file>` (the Python adapter currently exposes a programmatic API; CLI ergonomics are deferred until interfaces stabilize)
- [ ] PyPI release of `ssi-protocol` Python package including the verifier subpackage
- [ ] Multi-language verifier siblings beyond TypeScript and Python (Rust / Go) — gated on RFC and contributor capacity

---

## Future: v2.0.0 (Ecosystem Standardization)

**Target:** 2027+ (indicative)

- [ ] ISO/IEC standards alignment
- [ ] Compliance badge assertion format
- [ ] Distributed ledger integration (optional)
- [ ] Multi-stakeholder standards-body transition

---

## Deferred (intentionally — not in scope until separately authorized)

These are *not* on the roadmap because they have not been authorized as future work, not because they are forbidden. They are listed here for transparency about what the substrate deliberately does not yet do:

- **Active governance mutation** (any surface that lets a system act on its own decisions rather than recording them)
- **Live receipt auto-emission** (receipts are produced by conformant implementations on their own schedule; the protocol does not specify a streaming emission path)
- **Enforcement orchestration** (the protocol records and verifies; it does not enforce)
- **Runtime remediation systems** (any "auto-repair" of broken chains)
- **Truth certification** — verification proves *integrity* (the artifact is internally consistent and reproducible) and *replayability* (independent runtimes reach the same integrity conclusions). It does not prove the underlying decisions were correct, just, or compliant with any external standard.

---

## Governance Philosophy

**SSI changes require:**
- RFC process (public proposal, multi-stakeholder review)
- Backward compatibility (invariants cannot be weakened)
- Transition periods (12-24 months for ecosystem adaptation)

**Version numbering:**
- **Major versions:** Constitutional changes (rare, RFC-gated)
- **Minor versions:** Tooling, documentation, reference implementations
- **Patch versions:** Bug fixes, clarifications

---

## Timeline Disclaimer

Timelines are **indicative estimates** based on current resources and community feedback. Actual releases depend on:
- RFC process outcomes
- Ecosystem adoption signals
- Regulatory guidance
- Community contributions

**SSI prioritizes correctness over speed.** Rushing constitutional changes would undermine the protocol's stability guarantees.

---

**Roadmap is non-normative. Actual releases follow RFC process and governance framework.**
