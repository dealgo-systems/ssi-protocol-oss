# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Phase X Gate 4 — cross-language acceptance matrix.

This test loads the **exact same** golden vectors the TypeScript verifier
in `tools/ssi-verify/` consumes (`tests/vectors/rpx/*.jsonl`), runs the
Python verifier sibling against them, and asserts:

  1. Every vector classifies identically (VALID / INVALID / INCOMPLETE)
     to the TypeScript-produced expected report
     (tests/vectors/expected/<name>.verification-report.json).
  2. Every record's STORED record_hash equals the recomputed record_hash
     from this Python implementation. This proves byte-identical
     canonical bytes across Python and TypeScript.
  3. The VALID-vector chain links walk cleanly (each record's
     previous_hash equals the prior record's record_hash).
  4. INVALID vectors surface a hash mismatch.
  5. INCOMPLETE vectors surface a structural break (link or timestamp).

This test is the strongest sovereignty proof in the protocol: same
artifacts, two independent implementations, identical truth judgments.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest


HERE = Path(__file__).resolve().parent
SDK_ROOT = HERE.parent
REPO_ROOT = SDK_ROOT.parent.parent
VECTORS_DIR = REPO_ROOT / "tests" / "vectors"
RPX_DIR = VECTORS_DIR / "rpx"
EXPECTED_DIR = VECTORS_DIR / "expected"

sys.path.insert(0, str(SDK_ROOT))

from ssi_protocol.verify import (  # noqa: E402
    IntegrityStatus,
    canonical_bytes,
    compute_record_hash,
    verify_chain,
    verify_record,
)


# ---------------------------------------------------------------------
# Acceptance matrix — driven by what the TS verifier produces.
# Mirrors tools/ssi-verify/src/test-vectors.mjs.
# ---------------------------------------------------------------------

ACCEPTANCE_MATRIX = [
    ("valid-chain-10",            "VALID",      0),
    ("tampered-record",           "INVALID",    1),
    ("missing-link",              "INCOMPLETE", 1),
    ("reordered",                 "INCOMPLETE", 4),
    ("bad-timestamp",             "INCOMPLETE", 2),
    ("valid-chain-3-v2.1",        "VALID",      0),
    ("unknown-field-passthrough", "VALID",      0),
]


def _load_jsonl(path: Path) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


def _load_expected_report(name: str) -> Dict[str, Any]:
    p = EXPECTED_DIR / f"{name}.verification-report.json"
    return json.loads(p.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------
# Per-vector cross-language acceptance — the load-bearing test
# ---------------------------------------------------------------------


@pytest.mark.parametrize(
    "name,expected_status,expected_tamper_count",
    ACCEPTANCE_MATRIX,
    ids=[m[0] for m in ACCEPTANCE_MATRIX],
)
def test_vector_classifies_identically_to_typescript(
    name: str, expected_status: str, expected_tamper_count: int
) -> None:
    """For every vector the TypeScript verifier handles, the Python
    sibling produces the same integrity_status and the same tamper
    evidence count. Cross-language consensus is mechanical."""
    records = _load_jsonl(RPX_DIR / f"{name}.jsonl")

    # The Python verifier classification:
    py_report = verify_chain(records)

    # The TypeScript verifier classification (golden expected report):
    ts_expected = _load_expected_report(name)

    # 1. Top-level integrity_status agreement.
    assert py_report.integrity_status.value == ts_expected["integrity_status"], (
        f"[{name}] Python={py_report.integrity_status.value} "
        f"TypeScript={ts_expected['integrity_status']}"
    )
    # And matches the parametrized expectation (sanity check on the matrix itself).
    assert py_report.integrity_status.value == expected_status

    # 2. Same tamper evidence count.
    py_count = len(py_report.tamper_evidence)
    ts_count = len(ts_expected.get("tamper_evidence", []))
    assert py_count == ts_count, (
        f"[{name}] tamper count Python={py_count} TypeScript={ts_count}"
    )
    assert py_count == expected_tamper_count


# ---------------------------------------------------------------------
# Byte-identity: stored record_hash matches recomputed record_hash
# (for every record in every VALID vector — this is the canonical-bytes
# cross-language equivalence proof)
# ---------------------------------------------------------------------


@pytest.mark.parametrize(
    "name",
    ["valid-chain-10", "valid-chain-3-v2.1", "unknown-field-passthrough"],
)
def test_valid_vectors_recomputed_record_hash_equals_stored(name: str) -> None:
    """For every record in a VALID vector, the Python implementation
    recomputes the SAME SHA-256 hex that the TypeScript producer (using
    the canonicalize npm package) stored on the record. Any divergence
    means canonicalization is NOT byte-identical between implementations.
    """
    records = _load_jsonl(RPX_DIR / f"{name}.jsonl")
    for index, rec in enumerate(records):
        stored = rec["record_hash"]
        computed = compute_record_hash(rec)
        assert stored == computed, (
            f"[{name}] record {index} ({rec.get('record_id')}): "
            f"stored={stored} computed={computed}"
        )


# ---------------------------------------------------------------------
# Independent SHA-256 sanity: compute_record_hash output equals an
# external hashlib computation over the same canonical bytes.
# ---------------------------------------------------------------------


def test_compute_record_hash_matches_external_sha256() -> None:
    records = _load_jsonl(RPX_DIR / "valid-chain-3-v2.1.jsonl")
    for rec in records:
        b = canonical_bytes(rec)
        assert compute_record_hash(rec) == hashlib.sha256(b).hexdigest()


# ---------------------------------------------------------------------
# Targeted invariants required by the doctrine
# ---------------------------------------------------------------------


def test_unknown_top_level_field_is_hash_included() -> None:
    """RECEIPT_EVOLUTION.md rule 1: a record with a forward-compatible
    unknown top-level field MUST verify (not get rejected) AND its
    record_hash MUST be reproducible. The unknown-field-passthrough
    vector is exactly this case."""
    records = _load_jsonl(RPX_DIR / "unknown-field-passthrough.jsonl")
    assert len(records) == 1
    rec = records[0]
    # The fixture carries forward-compatible unknown fields.
    assert "future_optional_field" in rec
    # And it verifies cleanly (no schema rejection, no hash mismatch).
    rv = verify_record(rec)
    assert rv.valid, f"unknown-field record should verify cleanly; errors={rv.errors}"


def test_v1_records_remain_verifiable_after_v2_1() -> None:
    """RECEIPT_EVOLUTION.md rule 5: latest verifier accepts v1 records
    (no receipt_version field) on the same chain as v2.1 records."""
    records = _load_jsonl(RPX_DIR / "valid-chain-3-v2.1.jsonl")
    # Record 0 is the v1-shape record (no receipt_version).
    assert "receipt_version" not in records[0]
    rv = verify_record(records[0])
    assert rv.valid, f"v1 record should verify; errors={rv.errors}"


def test_tampered_record_produces_hash_mismatch() -> None:
    records = _load_jsonl(RPX_DIR / "tampered-record.jsonl")
    report = verify_chain(records)
    assert report.integrity_status is IntegrityStatus.INVALID
    # At least one tamper event is a record_invalid with hash mismatch.
    assert any(
        ev.kind == "record_invalid" and "record_hash mismatch" in ev.detail
        for ev in report.tamper_evidence
    )


def test_reordered_chain_produces_link_breaks() -> None:
    records = _load_jsonl(RPX_DIR / "reordered.jsonl")
    report = verify_chain(records)
    assert report.integrity_status is IntegrityStatus.INCOMPLETE
    # At least one tamper event is a link_break.
    assert any(ev.kind == "link_break" for ev in report.tamper_evidence)


def test_bad_timestamp_chain_surfaces_timestamp_regression() -> None:
    records = _load_jsonl(RPX_DIR / "bad-timestamp.jsonl")
    report = verify_chain(records)
    assert report.integrity_status is IntegrityStatus.INCOMPLETE
    assert any(ev.kind == "timestamp_regression" for ev in report.tamper_evidence)
