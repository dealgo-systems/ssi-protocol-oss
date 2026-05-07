# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Single-record verification for SSI RPX records.

Spec authority:
  schemas/rpx-record.schema.json
  docs/protocol/RECEIPT_EVOLUTION.md rules 1, 3, 5

Verification rules:
  1. Required fields present (record_id, timestamp, previous_hash,
     decision_type, agent_id, outcome, context_hash, policy_version,
     record_hash). Missing any → INVALID.
  2. Outcome value is one of {ALLOW, DENY, ESCALATE}. Mismatch → INVALID.
  3. Recomputed record_hash equals stored record_hash. Mismatch → INVALID.
  4. Unknown top-level fields are PERMITTED and hash-included
     (RECEIPT_EVOLUTION.md rule 1).
  5. Absence of receipt_version is treated as v1 (rule 5).

This module never mutates the input.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from .canonical import compute_record_hash


# Required fields per ssi-protocol-oss/schemas/rpx-record.schema.json.
_REQUIRED_FIELDS: Tuple[str, ...] = (
    "record_id",
    "timestamp",
    "previous_hash",
    "decision_type",
    "agent_id",
    "outcome",
    "context_hash",
    "policy_version",
    "record_hash",
)

_VALID_OUTCOMES = frozenset({"ALLOW", "DENY", "ESCALATE"})


class IntegrityStatus(str, Enum):
    """Top-level chain classification.

    Mirrors the TypeScript verifier's report shape so cross-language
    comparison is mechanical.
    """

    VALID = "VALID"
    INVALID = "INVALID"        # tamper detected (hash mismatch, schema fail)
    INCOMPLETE = "INCOMPLETE"  # chain-link broken (missing/reordered/timestamp)


@dataclass(frozen=True)
class TamperEvidence:
    """One unit of tamper evidence found during verification.

    `record_id` may be None if the offending record was malformed enough
    that the id couldn't be parsed.
    """

    record_id: Optional[str]
    kind: str
    detail: str


@dataclass(frozen=True)
class RecordVerification:
    """Result of verifying a single record."""

    valid: bool
    errors: Tuple[str, ...] = ()
    warnings: Tuple[str, ...] = ()


@dataclass(frozen=True)
class VerificationReport:
    """Full chain verification report.

    Designed for byte-identical cross-language comparison: a TypeScript
    verifier producing the same `integrity_status` + `tamper_evidence`
    count + matching errors-per-record proves protocol-truth equivalence.
    """

    integrity_status: IntegrityStatus
    record_count: int
    tamper_evidence: Tuple[TamperEvidence, ...] = ()
    errors: Tuple[str, ...] = ()


def verify_record(record: Dict[str, Any]) -> RecordVerification:
    """Verify a single record against the v2.1 schema + hash integrity.

    Returns a RecordVerification with explicit errors / warnings.
    Does not raise.
    """
    errors: List[str] = []
    warnings: List[str] = []

    # 1. Required fields.
    missing = [f for f in _REQUIRED_FIELDS if f not in record]
    if missing:
        errors.append(f"missing required fields: {missing}")

    # 2. Outcome enum.
    outcome = record.get("outcome")
    if outcome is not None and outcome not in _VALID_OUTCOMES:
        errors.append(
            f"outcome must be one of {sorted(_VALID_OUTCOMES)}, got {outcome!r}"
        )

    # 3. Type / shape sanity for hash fields.
    for hex_field in ("previous_hash", "context_hash", "record_hash"):
        v = record.get(hex_field)
        if v is not None and not (isinstance(v, str) and len(v) == 64):
            errors.append(
                f"{hex_field} must be a 64-char hex string, got {type(v).__name__}={v!r}"
            )

    # If the record is missing required fields or outcome enum, we cannot
    # safely recompute the hash — abort with current errors.
    if errors:
        return RecordVerification(valid=False, errors=tuple(errors))

    # 4. Hash integrity (the load-bearing check).
    stored = record["record_hash"]
    computed = compute_record_hash(record)
    if stored != computed:
        errors.append(
            f"record_hash mismatch for {record.get('record_id')!r}: "
            f"stored={stored} computed={computed}"
        )

    # 5. Optional informational warnings (mirrors TS verifier behavior).
    if "action_type" not in record:
        warnings.append("No action_type specified (optional field)")
    if "reason" not in record:
        warnings.append("No reason specified (optional field)")

    return RecordVerification(
        valid=not errors,
        errors=tuple(errors),
        warnings=tuple(warnings),
    )
