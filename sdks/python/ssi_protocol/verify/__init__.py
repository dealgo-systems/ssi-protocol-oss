# Copyright 2025 Jtjr86
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
"""Phase X Gate 4 — independent Python verifier sibling for SSI RPX records.

This module is **spec-derived**, not a port of the TypeScript verifier in
`tools/ssi-verify/`. Both implementations consume the **same public golden
vectors** and **same public schema**; both MUST produce byte-identical
canonical bytes, byte-identical SHA-256 record hashes, identical
chain-link traversal, and identical pass/fail classification for every
vector.

That is the cross-language acceptance bar: protocol truth survives
implementation boundaries.

Public surface:
  * canonical_bytes(record)                  — RFC 8785-style canonical JSON
  * compute_record_hash(record)              — SHA-256 hex
  * verify_record(record)                    — single-record validation
  * verify_chain(records, *, genesis_hash)   — full-chain walk
  * IntegrityStatus / TamperEvidence types

Consumes (read-only):
  * schemas/rpx-record.schema.json           — required-field set
  * docs/protocol/RECEIPT_EVOLUTION.md       — additive-only / unknown-field rules

Does NOT:
  * Import any TypeScript output, dist artifacts, or Node tooling.
  * Re-canonicalize per-record canonical bytes (records are validated
    by recomputing the hash from the record's own current fields).
  * Mutate or write any vector or expected-report file.
"""

from .canonical import (
    GENESIS_HASH,
    HASH_EXCLUDED_FIELDS,
    canonical_bytes,
    compute_record_hash,
    is_genesis_hash,
)
from .chain import (
    ChainResult,
    verify_chain,
)
from .verifier import (
    IntegrityStatus,
    RecordVerification,
    TamperEvidence,
    VerificationReport,
    verify_record,
)
# Path (ii) — ReceiptBundle adapter.  Lets the Python sibling consume
# the portal's ReceiptBundle JSON shape (as emitted by the portal's
# /api/audit/receipt/<id> endpoint) and produce byte-identical
# verification results to the existing TS reference verifier.
from .bundle import (
    BundleVerificationError,
    canonical_bundle_bytes,
    compute_bundle_hash,
    compute_row_chain_hash,
    deeply_sort_keys,
    verify_receipt_bundle,
)

__all__ = [
    "GENESIS_HASH",
    "HASH_EXCLUDED_FIELDS",
    "canonical_bytes",
    "compute_record_hash",
    "is_genesis_hash",
    "verify_record",
    "verify_chain",
    "ChainResult",
    "IntegrityStatus",
    "RecordVerification",
    "TamperEvidence",
    "VerificationReport",
    # Path (ii) — ReceiptBundle adapter.
    "BundleVerificationError",
    "canonical_bundle_bytes",
    "compute_bundle_hash",
    "compute_row_chain_hash",
    "deeply_sort_keys",
    "verify_receipt_bundle",
]
