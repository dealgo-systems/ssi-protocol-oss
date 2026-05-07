# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Canonical-byte computation for SSI RPX records.

Spec authority:
  schemas/rpx-record.schema.json $comment field
  docs/protocol/RECEIPT_EVOLUTION.md rule 3

Rules (locked at v1, unchanged in v2.1):
  - alphabetical key ordering at every nesting level
  - no whitespace in structural separators
  - UTF-8 encoding (non-ASCII characters emitted as raw UTF-8 bytes)
  - exclude `record_hash` (self-reference) and `metadata` (free-form)
  - include all other present fields, including v2.1+ optional fields
    AND any forward-compatible unknown top-level fields the producer
    added (additive-only per RECEIPT_EVOLUTION.md rule 1)
  - list ordering preserved (significant per RFC 8785)

Cross-language byte-identity: this implementation must produce the SAME
canonical bytes as the TypeScript reference verifier (which uses the
`canonicalize` npm package, RFC 8785 / JCS). For the field types this
protocol uses (strings, hex, integers, simple ASCII keys), Python's
``json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=False)``
is byte-equivalent to canonicalize's output. The full-vector
acceptance test in tests/test_verifier_vectors.py asserts this — every
record's stored ``record_hash`` (computed by the OSS TS pipeline) is
recomputed by this Python module and MUST match.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, FrozenSet


# Genesis hash: SHA-256("") — used as previous_hash for the first record.
# Matches reference: tools/ssi-verify/src/hash.ts GENESIS_HASH.
GENESIS_HASH: str = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"


# Fields excluded from the canonical hash form.
HASH_EXCLUDED_FIELDS: FrozenSet[str] = frozenset({"record_hash", "metadata"})


def canonical_bytes(record: Dict[str, Any]) -> bytes:
    """Produce canonical JSON bytes for an RPX record.

    Excludes ``record_hash`` (self-reference) and ``metadata`` (free-form
    per spec). All other fields — known v1, v2.1 optional, AND any
    forward-compatible unknown top-level fields a producer added — are
    hash-included in alphabetical key order.
    """
    hashable = {k: v for k, v in record.items() if k not in HASH_EXCLUDED_FIELDS}
    return json.dumps(
        hashable,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def compute_record_hash(record: Dict[str, Any]) -> str:
    """SHA-256 hex of canonical_bytes(record). 64 lowercase hex chars."""
    return hashlib.sha256(canonical_bytes(record)).hexdigest()


def is_genesis_hash(value: str) -> bool:
    """True iff value equals the SHA-256-of-empty-string genesis hash."""
    return value == GENESIS_HASH
