# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Chain-walk verification for SSI RPX records.

Spec authority:
  SPEC.md §2 (chain invariants)
  AUDIT.md §3 (canonical form + chain semantics)
  docs/protocol/RECEIPT_EVOLUTION.md rule 5 (back-compat for v1 records)

Classification semantics (matches the TypeScript reference verifier so
cross-language consensus is mechanical):

  VALID
    - every record is schema-compliant
    - every record's stored record_hash equals the recomputed hash
    - every record's previous_hash equals the prior record's record_hash
    - timestamps are monotonically non-decreasing through the chain

  INVALID
    - at least one record's recomputed record_hash does NOT match the
      stored record_hash (a tamper signal: someone changed a field
      after the hash was sealed)

  INCOMPLETE
    - the chain has a structural break that is NOT a hash mismatch:
      a missing link, a reordering, or a timestamp moving backwards.
      The records themselves are individually well-formed.

If both kinds of failure are present, INVALID dominates INCOMPLETE
(matches the TS reference behavior).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Sequence, Tuple

from .canonical import GENESIS_HASH
from .verifier import (
    IntegrityStatus,
    TamperEvidence,
    VerificationReport,
    verify_record,
)


@dataclass(frozen=True)
class ChainResult:
    """Convenience wrapper around VerificationReport plus per-record results."""

    report: VerificationReport
    per_record_valid: Tuple[bool, ...]


def _ts_lex_before(a: str, b: str) -> bool:
    """RFC 3339 timestamps compare correctly as lexicographic strings
    when they share the same fixed-width format. The schema pin
    enforces ``YYYY-MM-DDTHH:MM:SS(.ffffff)?Z``, so this is safe."""
    return a < b


def verify_chain(
    records: Sequence[Dict[str, Any]],
    *,
    require_genesis: bool = True,
) -> VerificationReport:
    """Walk the chain and produce a verification report.

    `records` is iterated in the order supplied (chain order is
    significant). The first record's ``previous_hash`` is checked
    against ``GENESIS_HASH`` when ``require_genesis`` is true.
    """
    if not records:
        return VerificationReport(
            integrity_status=IntegrityStatus.INCOMPLETE,
            record_count=0,
            errors=("chain is empty",),
        )

    tamper: List[TamperEvidence] = []
    per_record: List[bool] = []
    seen_hash_mismatch = False

    prev_record_hash: str = GENESIS_HASH if require_genesis else ""
    prev_timestamp: str = ""
    prev_record_id: str = ""

    for index, record in enumerate(records):
        # ------ per-record schema + hash integrity ------
        rv = verify_record(record)
        per_record.append(rv.valid)

        if not rv.valid:
            # If hash is the failing check, the chain is INVALID-class.
            if any("record_hash mismatch" in e for e in rv.errors):
                seen_hash_mismatch = True
            tamper.append(
                TamperEvidence(
                    record_id=record.get("record_id"),
                    kind="record_invalid",
                    detail=f"Record {index} failed validation: {'; '.join(rv.errors)}",
                )
            )
            # Even for invalid records, we still try to walk the chain
            # so we surface every structural issue. But we use the
            # record's STORED previous_hash for the next-link check.

        # ------ chain link ------
        if require_genesis or index > 0:
            stored_prev = record.get("previous_hash")
            if not isinstance(stored_prev, str):
                tamper.append(
                    TamperEvidence(
                        record_id=record.get("record_id"),
                        kind="link_break",
                        detail=f"Record {index} previous_hash is not a string",
                    )
                )
            elif stored_prev != prev_record_hash:
                tamper.append(
                    TamperEvidence(
                        record_id=record.get("record_id"),
                        kind="link_break",
                        detail=(
                            f"Record {index} previous_hash ({stored_prev}) "
                            f"does not match prior record_hash ({prev_record_hash})"
                        ),
                    )
                )

        # ------ monotonic timestamp ------
        ts = record.get("timestamp")
        if isinstance(ts, str) and prev_timestamp and _ts_lex_before(ts, prev_timestamp):
            tamper.append(
                TamperEvidence(
                    record_id=record.get("record_id"),
                    kind="timestamp_regression",
                    detail=(
                        f"Record {index} timestamp ({ts}) is before record "
                        f"{index - 1} timestamp ({prev_timestamp})"
                    ),
                )
            )

        # ------ advance ------
        # The next link is checked against THIS record's stored
        # record_hash even if hash didn't match — matches TS verifier
        # which surfaces both the hash-mismatch AND any subsequent
        # link breaks rather than short-circuiting.
        prev_record_hash = record.get("record_hash") or prev_record_hash
        if isinstance(ts, str):
            prev_timestamp = ts
        prev_record_id = record.get("record_id") or prev_record_id

    # ------ final classification ------
    if seen_hash_mismatch:
        status = IntegrityStatus.INVALID
    elif tamper:
        status = IntegrityStatus.INCOMPLETE
    else:
        status = IntegrityStatus.VALID

    return VerificationReport(
        integrity_status=status,
        record_count=len(records),
        tamper_evidence=tuple(tamper),
    )
