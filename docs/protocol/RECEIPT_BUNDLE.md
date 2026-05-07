# Receipt Bundle — Protocol Surface

**Status:** v1.1.x — additive-only on top of RPX records.
**Companion documents:** [`RECEIPT_EVOLUTION.md`](RECEIPT_EVOLUTION.md), [`CROSS_RUNTIME_VERIFICATION.md`](CROSS_RUNTIME_VERIFICATION.md), [`rpx.md`](rpx.md).

---

## What a ReceiptBundle is

A **`ReceiptBundle`** is the per-decision continuity artifact a conformant emitter produces. It composes everything an independent verifier needs to re-walk the integrity of a single decision without contacting the emitter:

- the decision row (its canonical bytes, previous_hash, chain_hash, chain_scope)
- the approval row, if the decision escalated, plus every webhook delivery attempt
- the outcome attached to the decision, if any
- every operator action linked to the decision or its approval, each with its own canonical bytes and chain link
- a top-level `bundle_hash` over the deterministic JSON form of everything above

The bundle is **deterministic**. Given the same inputs, two emitters compliant with the canonical-byte rule produce the same bytes; given the same bundle, two verifiers compliant with the same rule produce the same chain-hash and bundle-hash values.

A `ReceiptBundle` is not a substitute for an RPX record. RPX records are the constitutional decision artifacts; the bundle is the *envelope* that carries an RPX-shaped decision plus its surrounding continuity into a single portable verifiable object.

## Top-level shape

```jsonc
{
  "schema_version": "1",
  "generated_at": "<ISO 8601>",
  "decision":           <ChainRow + decision-specific fields>,
  "approval":           <ApprovalEntry | null>,
  "webhook_deliveries": [<WebhookEntry>, ...],
  "outcome":            <OutcomeEntry | null>,
  "operator_actions":   [<ChainRow + operator-specific fields>, ...],
  "bundle_hash":        "<sha256 hex>"
}
```

Each `ChainRow` carries:

```jsonc
{
  "id":              "<row id>",
  "canonical_bytes": "<the JSON-stringified subset of SIGNED_FIELDS for this row, opaque to the bundle>",
  "previous_hash":   "<sha256 hex of prior row in this chain_scope, or null at chain root>",
  "chain_hash":      "<sha256 hex of (previous_hash ?? '') + '\n' + canonical_bytes>",
  "chain_scope":     "<scope string, e.g. workspace:<id> or operator:<workspace>>"
}
```

Plus row-kind-specific fields (verdict / action / actor / etc.) that are *not* hash-included at the row level (they're already covered by `canonical_bytes` if the producer signed them) but *are* hash-included at the bundle level.

## Hash formulas (frozen)

Two formulas, locked at the canonical-byte rule:

**Per-row chain hash:**
```
chain_hash = sha256_hex( (previous_hash ?? "") + "\n" + canonical_bytes )
```

**Bundle hash:**
```
bundle_without_hash = bundle - {bundle_hash}
canonical_bundle    = JSON.stringify(deeply_sort_keys(bundle_without_hash))
                      // separators "," and ":" with NO whitespace
                      // UTF-8 with non-ASCII as raw bytes (no \uXXXX escapes)
                      // arrays preserve order; nulls preserved
bundle_hash         = sha256_hex(canonical_bundle)
```

The canonical-byte rule is the same one specified in [`AUDIT.md`](../../AUDIT.md) and used by RPX records — see [`RECEIPT_EVOLUTION.md`](RECEIPT_EVOLUTION.md) for the full evolution discipline.

## Forensic discipline (load-bearing)

These properties must hold in every conformant implementation. Both reference verifiers (`tools/ssi-verify` TS, `sdks/python/ssi_protocol/verify/bundle.py` Python) honor them.

1. **`canonical_bytes` is opaque.** The verifier never parses it, never reformats it, never re-canonicalizes it. The producer's bytes flow through verbatim, character-for-character.
2. **Unknown top-level fields are preserved and hash-included.** A bundle MAY carry forward-compatible top-level fields a verifier doesn't recognize. The verifier MUST NOT strip them, MUST NOT reject the bundle, and MUST hash-include them via the canonical-byte rule.
3. **Unknown nested fields are preserved.** Recursive preservation. Same rule applies inside `metadata` blocks, inside row-level extras, anywhere unknown content appears.
4. **Array order is preserved.** Array order is signed by the producer; reordering would invalidate signatures. The canonical-byte rule sorts object keys at every depth but never reorders arrays.
5. **`null` is distinguishable from absent.** A `null` value MUST appear in the canonical output exactly where it appeared in the input. Absent fields MUST stay absent. The two MUST produce different hashes.
6. **No type coercion.** Numbers stay numbers, strings stay strings, booleans stay booleans. A string `"42"` is not the same as a number `42`; the verifier must not normalize one to the other.
7. **No mutation.** The verifier never mutates the input bundle.

Items 1–6 are mirrored in the reference operator portal's [`docs/spec/RECEIPT_BUNDLE.md`](https://github.com/dealgo-systems/dealgo-portal/blob/main/docs/spec/RECEIPT_BUNDLE.md) "Intermediary Preservation Rule" section, and item 7 is asserted by the Python adapter's `test_input_is_never_mutated` test.

## Verifying a ReceiptBundle

Pseudocode shared between runtimes:

```
1. Parse the bundle JSON.
2. For the decision row:
     recomputed = sha256_hex( (decision.previous_hash ?? "") + "\n" + decision.canonical_bytes )
     If recomputed != decision.chain_hash → INVALID with decision_hash_mismatch.
3. For each operator_actions[i]:
     recomputed = sha256_hex( (op.previous_hash ?? "") + "\n" + op.canonical_bytes )
     If recomputed != op.chain_hash → INVALID with operator_hash_mismatch.
     If i > 0 and op.previous_hash != operator_actions[i-1].chain_hash → INCOMPLETE with operator_link_break.
4. Compute bundle_hash:
     bundle_without_hash = bundle - {bundle_hash}
     canonical = JSON.stringify(deeply_sort_keys(bundle_without_hash))
     recomputed = sha256_hex(canonical)
     If recomputed != bundle.bundle_hash → INVALID with bundle_hash_mismatch.
5. Classify:
     INVALID dominates INCOMPLETE dominates VALID.
```

A reference TypeScript implementation is at `tools/ssi-verify/src/`. A reference Python implementation is at `sdks/python/ssi_protocol/verify/bundle.py`. Both reach byte-identical conclusions on the same artifact — see [`CROSS_RUNTIME_VERIFICATION.md`](CROSS_RUNTIME_VERIFICATION.md).

## What a ReceiptBundle does NOT establish

- It does not establish that the underlying decision was correct, fair, just, or compliant with any external standard.
- It does not establish governance authority over the decision.
- It does not certify the producer.
- It does not establish that the decision *should* have been made; only that the recorded artifact is internally consistent and reproducible.

Verification proves *integrity* (the bytes are unaltered) and *reproducibility* (independent runtimes derive the same hash). It does not prove *truth*.

## Schema-shape contract

A conformant `ReceiptBundle` has — at minimum — the top-level fields:

- `schema_version` (string)
- `generated_at` (ISO 8601 UTC)
- `decision` (ChainRow, MUST be present)
- `approval` (ApprovalEntry or `null`)
- `webhook_deliveries` (array, MAY be empty)
- `outcome` (OutcomeEntry or `null`)
- `operator_actions` (array, MAY be empty)
- `bundle_hash` (sha256 hex)

Forward-compatible additions are permitted; verifiers MUST handle unknown fields per the discipline above.
