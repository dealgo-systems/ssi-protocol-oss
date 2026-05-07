# Receipt Schema Evolution Rules

**Status:** v2.1 normative.
**Last updated:** 2026-05-06.
**Companion:** [`PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md`](../PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md) §14.

This document formalizes the evolution rules for the RPX record schema (`schemas/rpx-record.schema.json`). It is the public, normative version of the Phase X doctrine §14 invariants: it defines exactly how the receipt format may change over time without breaking offline verifiability of records produced under prior versions.

---

## Why this document exists

A receipt is a long-lived artifact. A record produced today may be verified by an auditor years from now using a verifier built tomorrow. For that to work, the receipt schema must evolve under explicit, machine-checkable rules so that:

- a verifier built for schema version *N* can verify any record produced under schema version *M* where *M ≤ N*;
- new fields can be introduced without invalidating prior records;
- the canonical-byte rule that produces `record_hash` is stable across schema versions.

These guarantees are what make the receipt a portable trust artifact instead of a snapshot tied to a single deployment.

---

## The six rules

### 1. Additive-only fields

New fields are **optional**. A producer may emit them; a verifier of any older version MUST accept their absence and MUST NOT reject records that carry unknown top-level fields.

The schema sets `additionalProperties: true` at the root from v2.1 onward. Verifiers MUST configure their schema validator to permit unknown top-level fields.

> **Intermediary preservation rule.** Unknown fields MUST be preserved byte-for-byte by intermediary systems (portals, transport layers, storage adapters) when reserializing records. Intermediaries MUST NOT reorder, strip, normalize, coerce, or otherwise mutate unknown fields, because doing so would break canonical-byte stability and invalidate `record_hash` for downstream verifiers.

> No field is ever **removed** or **repurposed**. A field, once introduced, retains its name and semantics forever.

### 2. Schema version increment requires verifier release

The schema version is tracked separately from individual records:

- the schema file's `$id` is invariant: `https://ssi-protocol.org/schemas/rpx-record.json`;
- the optional `receipt_version` field on each record carries the receipt's own schema version (semver-like string);
- a **major** increment of the schema (e.g., `1` → `2`) requires a new verifier release that explicitly accepts both the prior major version and the new one in the same chain.

A breaking change is forbidden inside a major version. If a change cannot satisfy the additive-only rule, it is a major-version event.

### 3. Canonical-byte preservation

The rule that produces `record_hash` is **locked at v1** and is unchanged in v2.1:

- alphabetical key ordering (lexicographic);
- no whitespace (compact JSON);
- UTF-8 encoding;
- exclude `record_hash` (self-reference) and `metadata` (free-form, not bound to integrity);
- include all other present fields — including v2.1+ optional fields and any forward-compatible unknown fields a producer added.

Because the canonical form sorts keys at every level, the addition of new optional fields produces a deterministic effect on the hash: a v1 record with no v2.1 fields and a v2.1 record with v2.1 fields populate different keysets, and their hashes differ accordingly. Both remain individually verifiable.

> Any change to the canonical-byte rule is a **major-version event** and triggers rule 2.

### 4. Deprecation, never deletion

A field that ceases to be useful is **deprecated**, not deleted. The schema file marks it with a `"deprecated": true` JSON-Schema annotation; the spec retains its description; the canonical-byte rule continues to include it whenever a record carries it.

Deprecated fields:

- are not required of new producers;
- MUST be parsed and hashed by all verifiers exactly as before;
- are documented in this file with the version of deprecation and the rationale.

There are currently no deprecated fields.

### 5. Verifier backward compatibility

The latest verifier MUST verify all prior receipt versions still in chain. Concretely:

- a verifier that accepts v2.1 records MUST also accept v1 records (no `receipt_version` field) as valid v1;
- absence of `receipt_version` is treated as `"1"` for back-compat;
- new fields introduced in v2.1 are **optional** for verification — a v1 record that lacks them is still valid;
- new fields, when present, MUST be hash-included per rule 3.

Test vector `valid-chain-3-v2.1` exercises this: the chain mixes a v1 record (no `receipt_version`) with v2.1 records (carrying `receipt_version: "2.1"` plus optional fields), and the verifier accepts both.

### 6. Producer key rotation is itself a chained event

Per Phase X doctrine §3 invariant 3 and §7 gate 1, the producer-key registry that resolves `signing_key_id` to a public key is required to:

- track key history non-destructively (active / retired / revoked), so signatures produced under retired or revoked keys remain offline-verifiable;
- emit rotation events as records on the chain (when persistence wiring lands — Gate 1.b);
- never recycle a `signing_key_id` (the fingerprint is a stable identifier).

The producer-key rotation registry semantic primitives are implemented in the substrate repository's v2.1 hardening track. This rule is the protocol-side guarantee that downstream verifiers can rely on.

---

## What a verifier MUST do

For each record:

1. Parse JSON (verifier's JSON parser MUST permit unknown top-level fields).
2. Validate against the v2.1 schema with `additionalProperties: true`.
3. Recompute `record_hash` per the canonical-byte rule (rule 3) and compare. Mismatch → fail.
4. Validate `previous_hash` chain link.
5. If `receipt_version` is present, ensure it is `≤` the verifier's supported version. If absent, treat as `"1"`.
6. If `signing_key_id` is present, resolve it via the producer-key registry; if unresolved, fail (or downgrade to warning under a relaxed policy).
7. If `policy_snapshot_fingerprint` is present, the verifier MAY rehydrate the snapshot bytes and rehash to confirm they match the recorded fingerprint (offline replay determinism).

A verifier that hits a record carrying an unknown top-level field MUST NOT treat that as an error. It SHOULD log the field for human review but continue verification.

---

## What a producer MUST do

When emitting a v2.1 record:

1. Set `receipt_version: "2.1"` (or higher, when later versions ship).
2. If a producer-key registry is in use, set `signing_key_id` to the active key's fingerprint.
3. If a frozen policy snapshot was captured, set `policy_snapshot_fingerprint` to its SHA-256 hex.
4. Compute `record_hash` per the canonical-byte rule (rule 3).
5. Optionally sign the canonical decision payload and emit `signature` + `payload_hash`.

A producer SHOULD NOT emit fields that are not in the schema unless it has a stable rationale and a follow-on PR is in flight to add the field formally; even then, additive-only and hash-inclusion must hold.

---

## Compatibility ladder

| Verifier supports | Records it MUST verify |
|---|---|
| v1 only | v1 |
| v2.1 | v1 + v2.1 (rule 5) |
| v2.x (future minor) | v1 + v2.1 + v2.x |
| v3 (future major, after rule-2 release) | v1 + v2.1 + v2.x + v3 |

Records produced by a newer-than-the-verifier major version are out of scope: a v1 verifier facing a v2.1 record is not required to accept it, but a v2.1 verifier MUST accept v1 records.

---

## Implementation notes

- The reference schema lives at [`schemas/rpx-record.schema.json`](../../schemas/rpx-record.schema.json).
- The reference verifier lives in [`tools/ssi-verify/`](../../tools/ssi-verify/).
- Canonicalization is performed by the `canonicalize` npm package (RFC 8785 JCS).
- Additional language verifiers (Phase X Gate 4) MUST be tested against the same golden vectors and produce identical hashes — that is the cross-language acceptance bar.
