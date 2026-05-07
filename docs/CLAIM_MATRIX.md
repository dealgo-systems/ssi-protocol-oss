# Claim Matrix: What We Can (and Cannot) Say

**Version:** 0.3.1  
**Last Updated:** December 14, 2025  
**Purpose:** Internal truth table for sales, marketing, legal, and compliance

---

## How to Use This Document

This matrix defines the **boundary between proof and promise**.

- **PROVEN**: Backed by passing tests (EXIT 0) and committed code
- **PLANNED**: Specified but not yet implemented
- **FORBIDDEN**: Actively disproven or architecturally impossible

### Rules:
1. **Never claim PLANNED as PROVEN** (even if "almost done")
2. **Never ignore FORBIDDEN** (even if customers ask for it)
3. **Update this doc before any external claim** (blog, sales deck, pitch)

---

## 🟢 PROVEN Claims (Test-Locked Evidence)

These claims are **mathematically defensible**. You can say these in legal docs, compliance reviews, or customer contracts.

### Core Cryptography (Track A/A+)

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "Every decision is linked to the previous one via SHA-256 hash chain" | `hash_chain_test.ts` | `testHashChainIntegrity` | EXIT 0 |
| "Tampering with a decision breaks the chain and is detectable" | `hash_chain_test.ts` | `testImpossibleToBreakChainIntegrity` | EXIT 0 |
| "Every decision is signed with Ed25519 digital signature" | `hash_chain_test.ts` | `testSignatureVerification` | EXIT 0 |
| "Chain verification detects missing or reordered records" | `hash_chain_test.ts` | `testChainVerification` | EXIT 0 |
| "Genesis blocks anchor each tenant's audit trail cryptographically" | `hash_chain_test.ts` | `testGenesisBlock` | EXIT 0 |

**Forbidden Inverse**:
- ❌ "Audit trails can be modified without detection" → **Disproven by `testImpossibleToBreakChainIntegrity`**

---

### Multi-Tenant Isolation (Track B1)

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "Tenants cannot access each other's audit trails" | `tenant_isolation_test.ts` | `testTenantIsolation` | EXIT 0 |
| "Each tenant has a cryptographically isolated chain" | `tenant_isolation_test.ts` | `testTenantSpecificChains` | EXIT 0 |
| "Cross-tenant hash pollution is impossible" | `tenant_isolation_test.ts` | `testNoHashLeakage` | EXIT 0 |
| "Tenant context is enforced at the database and API layer" | `tenant_isolation_test.ts` | `testTenantContextEnforcement` | EXIT 0 |
| "Default tenant fallback works for dev/test environments" | `tenant_isolation_test.ts` | `testDefaultTenant` | EXIT 0 |

**Forbidden Inverse**:
- ❌ "Multi-tenancy is enforced by application logic only" → **Disproven by database-level isolation**

---

### API Key Authentication (Track B2.1)

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "API keys are bcrypt-hashed (never stored in plaintext)" | `auth_api_key_test.ts` | `testAPIKeyHashedStorage` | EXIT 0 |
| "API keys are prefix-indexed for fast lookup without hash collision" | `auth_api_key_test.ts` | `testPrefixIndexing` | EXIT 0 |
| "API keys are tenant-scoped (cannot be reused across tenants)" | `auth_api_key_test.ts` | `testTenantScopedKeys` | EXIT 0 |
| "Invalid API keys return 401 Unauthorized" | `auth_api_key_test.ts` | `testInvalidAPIKey` | EXIT 0 |
| "API key authentication bypasses JWT requirement" | `auth_api_key_test.ts` | `testAPIKeyBypassesJWT` | EXIT 0 |

**Forbidden Inverse**:
- ❌ "Plaintext API keys are supported for ease of use" → **Disproven by bcrypt enforcement**

---

### JWT Authentication (Track B2.2)

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "JWT signatures are verified before granting access (RS256/ES256)" | `jwt_auth_test.ts` | `testJWTSignatureVerification` | EXIT 0 |
| "Expired JWTs are rejected automatically" | `jwt_auth_test.ts` | `testExpiredJWT` | EXIT 0 |
| "JWT claims include user role for RBAC enforcement" | `jwt_auth_test.ts` | `testJWTRoleClaims` | EXIT 0 |
| "JWTs override API key authentication when both are present" | `jwt_auth_test.ts` | `testJWTPrecedence` | EXIT 0 |
| "Unsigned or malformed JWTs return 401 Unauthorized" | `jwt_auth_test.ts` | `testMalformedJWT` | EXIT 0 |

**Forbidden Inverse**:
- ❌ "Unsigned tokens work if role claim is present" → **Disproven by signature verification**

---

### Role-Based Access Control (Track B2.3)

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "Viewers can verify decisions but cannot write new ones" | `rbac_test.ts` | `testViewerDeniedWrite` | EXIT 0 |
| "Auditors can verify chain integrity but cannot write decisions" | `rbac_test.ts` | `testAuditorAllowedChainVerification` | EXIT 0 |
| "Admins can write decisions and perform all operations" | `rbac_test.ts` | `testAdminAllowedWrite` | EXIT 0 |
| "Insufficient permissions return 403 Forbidden (not 401)" | `rbac_test.ts` | `testViewerDeniedChainVerification` | EXIT 0 |
| "Role hierarchy is enforced: viewer < auditor < admin" | `rbac_test.ts` | All tests | EXIT 0 |
| "Dev mode bypass allows unauthenticated access (dev only)" | `rbac_test.ts` | `testDevModeBypass` | EXIT 0 |

**Forbidden Inverse**:
- ❌ "All authenticated users can write decisions" → **Disproven by `testViewerDeniedWrite`**

---

### Integration & Regression

| **Claim** | **Evidence** | **Test File** | **Exit Code** |
|---|---|---|---|
| "All 26 tests pass with zero regressions" | All test files | `npm test` | EXIT 0 |
| "New features do not break existing security guarantees" | Regression suite | All tests | EXIT 0 |

---

### RPX Record Schema v2.1 (Phase X Gate 3a — PR #124)

| **Claim** | **Evidence** | **Test File** |
|---|---|---|
| "RPX records evolve under additive-only rules: new optional fields never invalidate prior records" | `tests/vectors/generate-v2-1-vectors.mjs` + `valid-chain-3-v2.1.jsonl` | `tools/ssi-verify` test-vectors |
| "Verifiers MUST accept unknown top-level fields and MUST hash-include them" | `unknown-field-passthrough.jsonl` golden vector | `tools/ssi-verify` test-vectors |
| "Latest verifier verifies all prior receipt versions still in chain" | `valid-chain-3-v2.1.jsonl` mixes v1 + v2.1 records on the same chain | `tools/ssi-verify` test-vectors |

**Forbidden Inverse**:
- ❌ "Adding a new optional field invalidates older receipts" → **Disproven by `valid-chain-3-v2.1` mixed-version vector**

---

### Cross-Runtime Verifier Convergence (Phase X Gate 4 — PR #125)

| **Claim** | **Evidence** | **Test File** |
|---|---|---|
| "Independent runtime verifiers reproduce the same integrity conclusions about the same artifact" | TS verifier (`tools/ssi-verify`) and Python sibling (`sdks/python/ssi_protocol/verify`) classify all 7 golden vectors identically | `sdks/python/tests/test_verifier_vectors.py` |
| "Canonical-byte rule (RFC 8785-style) is implementation-portable across TypeScript and Python" | `compute_record_hash()` produces byte-identical SHA-256 hex for all 14 records across the 3 VALID vectors | `test_valid_vectors_recomputed_record_hash_equals_stored` |
| "The Python sibling does not import any TypeScript output, dist artifacts, or Node tooling" | `sdks/python/ssi_protocol/verify/` has zero dependencies on the JS toolchain | source inspection (no Node imports) |

**Forbidden Inverse**:
- ❌ "Cross-runtime verifier convergence requires shared runtime infrastructure" → **Disproven by independent stdlib-only Python implementation**

---

### ReceiptBundle Adapter (Path ii — PR #126)

| **Claim** | **Evidence** | **Test File** |
|---|---|---|
| "Python verifies the same `ReceiptBundle` JSON the TypeScript browser verifier validates, with byte-identical chain-hash and bundle-hash recomputation" | `verify_receipt_bundle()` in `sdks/python/ssi_protocol/verify/bundle.py` | `sdks/python/tests/test_receipt_bundle_adapter.py` |
| "The adapter never re-canonicalizes per-row `canonical_bytes` (the producer is authoritative)" | `compute_row_chain_hash()` treats `canonical_bytes` as an opaque string | `TestCanonicalization.test_compute_bundle_hash_is_deterministic` |
| "The adapter never mutates the input bundle" | JSON snapshot comparison before/after verification | `TestEdgeCases.test_input_is_never_mutated` |
| "Real portal-emitted artifacts verify byte-identically against the Python adapter" | Real `/api/audit/receipt/<id>` export passes `compute_bundle_hash(real_bundle) == real_bundle["bundle_hash"]` | `sdks/python/tests/test_real_export.py` (env-driven; bundle data not committed per PUBLIC_PROTOCOL_CHECKLIST.md) |

**Forbidden Inverse**:
- ❌ "Receipt verification requires the portal that emitted the receipt" → **Disproven by stdlib-only Python adapter against real exports**

---

### Forensic Continuity Observatory (Explorer hardening — PRs #98, #100)

The reference Explorer at `app/explorer/page.tsx` is a *read-only* observatory. The following claims describe what it does — and, critically, what it deliberately does not do.

| **Claim** | **Evidence** |
|---|---|
| "The Explorer surfaces tamper evidence categorized by severity (VALID / INCOMPLETE / INVALID), with INVALID dominating INCOMPLETE" | `lib/tamper-forensics.ts` (in the reference operator portal repo); test `test-tamper-evidence.mts` |
| "Per-row replay shows verbatim canonical bytes alongside the recomputed chain hash; the viewer never re-canonicalizes" | replay route `app/audit/replay/[decision_id]/`; test `test-replay-trace.mts` |
| "Lineage visualization renders only edges that are explicitly evidenced by stored fields; speculative edges are surfaced as `omissions`, not rendered" | `lib/lineage-graph.ts` 5-rule evidence allowlist; test `test-lineage-graph.mts` |
| "The continuity index never reorders rows by hash linkage; uncertainty is shown, not repaired" | `lib/continuity-index.ts` four-category uncertainty taxonomy; test `test-continuity-index.mts` |
| "Cross-runtime consensus is reported as `not_evaluated` whenever both runtimes have not actually run against the same artifact" | `lib/python-verifier-instruction.ts` `computeConsensus()`; test `test-verifier-comparison.mts` |
| "Policy snapshot inspection refuses to speculate when the portal has not ingested a fingerprint" | `lib/policy-snapshot-store.ts` honest `not_ingested` state; test `test-policy-snapshot.mts` |

**Forbidden Inverses**:
- ❌ "Visible uncertainty in the Explorer means the substrate is broken" → **The Explorer surfaces uncertainty deliberately. Honest uncertainty is forensic transparency, not system failure.**
- ❌ "The Explorer can repair, normalize, or auto-resolve broken lineage" → **Disproven by the source-level grep guard in `test-policy-snapshot.mts` that fails if forbidden symbols (`compareSnapshots`, `recommendSnapshot`, `editSnapshot`, etc.) ever appear in the policy-snapshot module.**

---

## 🟡 PLANNED Claims (Specified, Not Yet Built)

These claims are **roadmapped** but not yet proven. You can say "we're building this" but **not** "this works today".

### Track B3: Per-Tenant Signing Keys

| **Claim** | **Status** | **ETA** | **Risk** |
|---|---|---|---|
| "Tenants can bring their own Ed25519 signing keys" | Specified | TBD | Low (crypto primitives ready) |
| "SSI Protocol cannot forge signatures on behalf of tenants" | Specified | TBD | Low (key isolation model defined) |
| "Tenants can rotate keys without breaking chain integrity" | Specified | TBD | Medium (backward compatibility) |

**Safe phrasing**:
- ✅ "We're building per-tenant signing keys in Track B3"
- ❌ "Tenants can bring their own keys today"

---

### Track C: Archival & Long-Term Storage

| **Claim** | **Status** | **ETA** | **Risk** |
|---|---|---|---|
| "Audit trails can be archived to IPFS for immutable storage" | Proposed | TBD | Medium (IPFS integration complexity) |
| "Archived chains can be verified independently of the Gateway" | Proposed | TBD | Low (verification logic exists) |

**Safe phrasing**:
- ✅ "We're exploring IPFS archival for regulatory retention"
- ❌ "We integrate with IPFS for cold storage"

---

### Track D: Real-Time Anomaly Detection

| **Claim** | **Status** | **ETA** | **Risk** |
|---|---|---|---|
| "SSI Protocol detects chain breaks in real-time" | Proposed | TBD | High (requires streaming architecture) |
| "Alerts fire automatically on integrity violations" | Proposed | TBD | Medium (alerting infrastructure needed) |

**Safe phrasing**:
- ✅ "We're considering real-time monitoring in future releases"
- ❌ "We provide real-time anomaly detection"

---

## 🔴 FORBIDDEN Claims (Disproven or Impossible)

These claims are **actively false**. Never say these, even if customers ask for them.

### Security Guarantees We Do NOT Provide

| **Forbidden Claim** | **Why It's False** | **What to Say Instead** |
|---|---|---|
| "We prevent AI models from making bad decisions" | SSI logs decisions, doesn't intervene | "We provide tamper-proof audit trails of AI decisions" |
| "We encrypt audit trails end-to-end" | Records are hashed, not encrypted | "We provide cryptographic integrity, not confidentiality" |
| "We're fully compliant with SOC 2/HIPAA/GDPR" | Compliance requires org-level controls | "We provide cryptographic building blocks for compliance" |
| "We store audit trails on a blockchain" | We use hash chains, not distributed consensus | "We use hash chains (like Git) for cryptographic integrity" |
| "Deleted records are unrecoverable" | Deletion leaves gaps, doesn't erase data | "Deletion attempts leave cryptographic evidence" |
| "Cross-runtime verification proves the underlying decision was correct" | Verification is about *integrity* of the recorded artifact, not the *correctness* of the original judgment | "Independent runtimes reproduced the same integrity conclusions about the same artifact" |
| "Cross-runtime verifier agreement = consensus on truth" | Two verifiers running the same canonical-byte rule will always agree about the bytes; that says nothing about whether the decision recorded in those bytes was good | "Cross-runtime verifier agreement is *deterministic replay agreement*, not truth certification" |
| "The Explorer or its verifiers establish governance validity" | The Explorer inspects evidence; it does not adjudicate validity | "The Explorer surfaces what the evidence does and does not show; governance authority remains with the operator and the policy framework" |
| "A verified receipt means the action was authorized" | Verification proves the receipt is internally consistent and was not tampered with after the fact; authorization is a separate property determined by the original decision pipeline | "A verified receipt means the chain of evidence is reproducible — the substantive authorization is documented within the receipt's signed bytes, not implied by verification" |

---

### Architectural Limits (By Design)

| **Forbidden Claim** | **Why It's False** | **What to Say Instead** |
|---|---|---|
| "We support unlimited throughput" | PostgreSQL has write limits | "We support 10k decisions/sec per tenant (scalable with sharding)" |
| "We never require trust in the operator" | Genesis keys are operator-controlled (until B3) | "We minimize trust requirements (cryptographic verification vs blind trust)" |
| "We're a drop-in replacement for CloudTrail/Splunk" | We're a cryptographic layer, not a full logging stack | "We augment existing logs with cryptographic verification" |
| "We support proof-of-work consensus" | We deliberately avoid blockchain overhead | "We use signed hash chains for efficiency" |

---

### Competitive Claims We Cannot Make

| **Forbidden Claim** | **Why It's False** | **What to Say Instead** |
|---|---|---|
| "We're the only audit trail solution" | Many logging tools exist | "We're the only multi-tenant cryptographic audit solution with 100% test coverage" |
| "We're cheaper than CloudTrail" | No pricing model yet | "We eliminate trust dependencies that CloudTrail requires" |
| "We're faster than X" | No benchmarks yet | "We're designed for <10ms write latency (verification TBD)" |

---

## 📋 Pre-Flight Checklist (Before Making Any Claim)

Before you say anything publicly (blog, pitch, contract, demo), check:

- [ ] **Is this claim in the PROVEN section?** → Safe to say
- [ ] **Is this claim in the PLANNED section?** → Say "we're building" (not "it works")
- [ ] **Is this claim in the FORBIDDEN section?** → Never say it
- [ ] **Is this claim not in the matrix?** → Add it first, get evidence, then decide

---

## 🧠 Claim Safety Examples

### ✅ Safe Claims (Can Use in Contracts)

- "SSI Protocol provides cryptographically verifiable audit trails for AI decisions"
- "Every decision is linked via SHA-256 hash chain and signed with Ed25519"
- "Tampering with records is detectable through chain verification"
- "Multi-tenant isolation is enforced at the database and API layer"
- "Role-based access control limits write permissions to admin users"

### ⚠️ Risky Claims (Technically True but Misleading)

- "We make AI systems compliant" → **Say instead**: "We provide cryptographic tools for compliance programs"
- "We prevent fraud" → **Say instead**: "We detect tampering with audit trails"
- "We're production-ready" → **Say instead**: "We have 26 passing tests; pilots can evaluate production-readiness"

### ❌ False Claims (Never Say)

- "We're SOC 2 certified" → **We're not** (individual orgs get certified, not tools)
- "We replace your existing logging" → **We don't** (we augment it)
- "We're on a blockchain" → **We're not** (we use hash chains without consensus)

---

## 🔄 Maintenance Rules

1. **Update this doc before any external claim** (marketing, sales, legal)
2. **When a test passes, move claim from PLANNED → PROVEN**
3. **When a test fails, move claim from PROVEN → PLANNED** (or fix the bug)
4. **Never delete FORBIDDEN claims** (they protect future decisions)

---

## 🚨 Emergency Override (Founder Discretion)

If a customer asks for a PLANNED feature and you want to build it *now*:

1. Create `[TRACK]_COPILOT_PROMPT.md` with specification
2. Create `[TRACK]_PREFLIGHT_CHECKLIST.md` with security guardrails
3. Write tests first, then implementation
4. Get all tests to EXIT 0
5. Move claim from PLANNED → PROVEN
6. Update this matrix with evidence

**Do NOT skip steps 3–5**, even if the customer is waiting.

---

**End of Document**

*This matrix is your long-term shield.*  
*Protect it like you protect the private keys.*
