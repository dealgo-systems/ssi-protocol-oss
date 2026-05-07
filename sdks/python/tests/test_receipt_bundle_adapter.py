# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Path (ii) — ReceiptBundle adapter tests.

Validates the Python adapter against synthetic ReceiptBundle fixtures
generated in-memory. The adapter must:

  1. classify a clean synthetic bundle as VALID (zero findings)
  2. detect tampered chain bytes as INVALID + appropriate _hash_mismatch
  3. detect tampered bundle hash as INVALID + bundle_hash_mismatch
  4. detect missing canonical_bytes as INCOMPLETE + missing_canonical_bytes
  5. detect operator chain link breaks as INCOMPLETE + operator_link_break
  6. preserve forward-compatible unknown top-level fields without flagging
  7. dominate INCOMPLETE with INVALID when both are present
  8. compute byte-identical canonical bytes to the rule shared with the
     TS reference verifier (`json.dumps(sort_keys=True, separators=(",",":"),
     ensure_ascii=False)` over `deeplySortKeys`-sorted input)

Acceptance bar item 1 (synthetic fixture parity): asserted by this file.
Acceptance bar item 2 (real portal export parity): asserted by the
adjacent ``test_real_export.py`` integration test, which is env-driven
(BUNDLE_PATH) and never commits real customer data into the OSS repo.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest

HERE = Path(__file__).resolve().parent
SDK_ROOT = HERE.parent
sys.path.insert(0, str(SDK_ROOT))

from ssi_protocol.verify import (  # noqa: E402
    BundleVerificationError,
    IntegrityStatus,
    canonical_bundle_bytes,
    compute_bundle_hash,
    compute_row_chain_hash,
    deeply_sort_keys,
    verify_receipt_bundle,
)


# ---------------------------------------------------------------------
# Synthetic bundle factory — produces structurally real bundles with
# zero customer data.  Hashes are computed using the load-bearing
# formulas the adapter itself uses, so a clean bundle from this factory
# MUST verify cleanly.
# ---------------------------------------------------------------------


def _row(
    *,
    row_id: str,
    canonical: str,
    previous_hash: str,
    extras: Dict[str, Any] | None = None,
    action: str | None = None,
) -> Dict[str, Any]:
    chain_hash = compute_row_chain_hash(previous_hash, canonical)
    out: Dict[str, Any] = {
        "id": row_id,
        "canonical_bytes": canonical,
        "previous_hash": previous_hash,
        "chain_hash": chain_hash,
    }
    if action is not None:
        out["action"] = action
    if extras:
        for k, v in extras.items():
            if k not in out:
                out[k] = v
    return out


def _seal_bundle(bundle_without_hash: Dict[str, Any]) -> Dict[str, Any]:
    bh = compute_bundle_hash({**bundle_without_hash, "bundle_hash": ""}) \
        if "bundle_hash" not in bundle_without_hash \
        else compute_bundle_hash(bundle_without_hash)
    # Re-derive cleanly: drop any stub bundle_hash, then compute on the
    # rest, then attach.
    base = {k: v for k, v in bundle_without_hash.items() if k != "bundle_hash"}
    bh = compute_bundle_hash(base)
    return {**base, "bundle_hash": bh}


def make_clean_bundle(
    *,
    with_operator_actions: int = 1,
    extra_top_level: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    """Synthesize a clean, deterministic ReceiptBundle.

    All hashes recompute correctly. Suitable as the VALID baseline.
    """
    decision_canonical = json.dumps(
        {
            "id": "dec_synthetic_a",
            "decision": "APPROVE",
            "action": "EXECUTE",
            "source": "test",
            "createdAt": "2026-05-07T00:00:00.000Z",
        },
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    decision_prev = "0" * 64
    decision = _row(
        row_id="dec_synthetic_a",
        canonical=decision_canonical,
        previous_hash=decision_prev,
        extras={
            "decision": "APPROVE",
            "action": "EXECUTE",
            "source": "test",
            "created_at": "2026-05-07T00:00:00.000Z",
            "chain_scope": "workspace:ws_synthetic",
        },
    )

    operator_actions: List[Dict[str, Any]] = []
    prior_hash = "1" * 64  # arbitrary upstream chain head
    for i in range(with_operator_actions):
        canonical = json.dumps(
            {
                "id": f"op_synthetic_{i}",
                "action": "approval.resolve",
                "actorLabel": "ops@synthetic.test",
                "createdAt": f"2026-05-07T00:01:{i:02d}.000Z",
            },
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        )
        op = _row(
            row_id=f"op_synthetic_{i}",
            canonical=canonical,
            previous_hash=prior_hash,
            extras={
                "actor_label": "ops@synthetic.test",
                "resource_type": "Approval",
                "resource_id": "app_synthetic",
                "created_at": f"2026-05-07T00:01:{i:02d}.000Z",
                "chain_scope": "operator:ws_synthetic",
            },
            action="approval.resolve",
        )
        operator_actions.append(op)
        prior_hash = op["chain_hash"]

    bundle_without_hash: Dict[str, Any] = {
        "schema_version": "1",
        "generated_at": "2026-05-07T00:02:00.000Z",
        "decision": decision,
        "approval": None,
        "webhook_deliveries": [],
        "outcome": None,
        "operator_actions": operator_actions,
    }
    if extra_top_level:
        bundle_without_hash.update(extra_top_level)

    return _seal_bundle(bundle_without_hash)


# ---------------------------------------------------------------------
# Acceptance Bar #1 — synthetic fixture parity
# ---------------------------------------------------------------------


class TestCleanBundle:
    def test_clean_bundle_with_no_operator_actions_is_VALID(self):
        bundle = make_clean_bundle(with_operator_actions=0)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID
        assert len(report.tamper_evidence) == 0
        # decision counted; zero operator actions
        assert report.record_count == 1

    def test_clean_bundle_with_operator_actions_is_VALID(self):
        bundle = make_clean_bundle(with_operator_actions=3)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID
        assert len(report.tamper_evidence) == 0
        assert report.record_count == 4  # decision + 3 ops


class TestTamperedHash:
    def test_tampered_decision_canonical_bytes_yields_INVALID_decision_hash_mismatch(self):
        bundle = make_clean_bundle()
        # Mutate canonical_bytes after sealing — chain_hash no longer matches.
        bundle["decision"]["canonical_bytes"] = (
            bundle["decision"]["canonical_bytes"][:-1] + "X"
        )
        # We MUST also recompute the bundle_hash here so the test isolates
        # the per-row failure (otherwise both row and bundle would fail).
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INVALID
        kinds = {f.kind for f in report.tamper_evidence}
        assert "decision_hash_mismatch" in kinds

    def test_tampered_operator_canonical_bytes_yields_INVALID_operator_hash_mismatch(self):
        bundle = make_clean_bundle(with_operator_actions=2)
        bundle["operator_actions"][0]["canonical_bytes"] = (
            bundle["operator_actions"][0]["canonical_bytes"][:-1] + "Z"
        )
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INVALID
        kinds = {f.kind for f in report.tamper_evidence}
        assert "operator_hash_mismatch" in kinds

    def test_tampered_bundle_hash_yields_INVALID_bundle_hash_mismatch(self):
        bundle = make_clean_bundle()
        bundle["bundle_hash"] = "deadbeef" * 8
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INVALID
        kinds = {f.kind for f in report.tamper_evidence}
        assert "bundle_hash_mismatch" in kinds


class TestStructuralBreaks:
    def test_missing_canonical_bytes_yields_INCOMPLETE_missing_canonical_bytes(self):
        bundle = make_clean_bundle()
        # Drop the field on the decision row.
        del bundle["decision"]["canonical_bytes"]
        # Bundle hash still matches its bytes after the deletion (we
        # have to re-seal because the bundle changed).
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INCOMPLETE
        kinds = {f.kind for f in report.tamper_evidence}
        assert "missing_canonical_bytes" in kinds

    def test_missing_chain_hash_yields_INCOMPLETE_missing_chain_hash(self):
        bundle = make_clean_bundle(with_operator_actions=1)
        del bundle["operator_actions"][0]["chain_hash"]
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INCOMPLETE
        kinds = {f.kind for f in report.tamper_evidence}
        assert "missing_chain_hash" in kinds

    def test_operator_link_break_yields_INCOMPLETE_operator_link_break(self):
        bundle = make_clean_bundle(with_operator_actions=2)
        # Break the link from op[1] back to op[0]: change op[1].previous_hash.
        bundle["operator_actions"][1]["previous_hash"] = "f" * 64
        # Re-seal op[1] (its chain_hash also changes, so its row hash
        # must be recomputed to keep that row "clean" — we want only the
        # link_break finding, not also a hash mismatch).
        op1 = bundle["operator_actions"][1]
        op1["chain_hash"] = compute_row_chain_hash(
            op1["previous_hash"], op1["canonical_bytes"]
        )
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INCOMPLETE
        kinds = {f.kind for f in report.tamper_evidence}
        assert "operator_link_break" in kinds

    def test_missing_decision_row_yields_INCOMPLETE_schema_shape(self):
        bundle = make_clean_bundle()
        del bundle["decision"]
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.INCOMPLETE
        kinds = {f.kind for f in report.tamper_evidence}
        assert "schema_shape" in kinds


class TestForwardCompatibility:
    def test_unknown_top_level_fields_do_not_flag_or_break(self):
        # Add an unknown top-level field. The bundle_hash must include
        # it (our seal recomputes), and verification should pass cleanly.
        bundle = make_clean_bundle(
            extra_top_level={"future_field": "future-value", "another": [1, 2, 3]}
        )
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID
        assert len(report.tamper_evidence) == 0
        # Confirm the unknown fields are still on the bundle (not stripped).
        assert bundle["future_field"] == "future-value"
        assert bundle["another"] == [1, 2, 3]

    def test_unknown_per_row_fields_do_not_flag_or_break(self):
        bundle = make_clean_bundle()
        bundle["decision"]["future_v3_field"] = {"nested": "ok"}
        # Recompute bundle_hash since row content changed.
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        # NOTE: the row's chain_hash is computed from canonical_bytes
        # only, NOT from extras. Unknown extras don't change chain_hash.
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID


class TestSeverityDominance:
    def test_INVALID_dominates_INCOMPLETE_when_both_present(self):
        bundle = make_clean_bundle(with_operator_actions=2)
        # Cause an INVALID: tamper a hash.
        bundle["decision"]["canonical_bytes"] = (
            bundle["decision"]["canonical_bytes"][:-1] + "X"
        )
        # Cause an INCOMPLETE: drop chain_hash on operator action.
        del bundle["operator_actions"][0]["chain_hash"]
        bundle["bundle_hash"] = compute_bundle_hash(bundle)
        report = verify_receipt_bundle(bundle)
        # Both findings present.
        kinds = {f.kind for f in report.tamper_evidence}
        assert "decision_hash_mismatch" in kinds
        assert "missing_chain_hash" in kinds
        # But the top-level status is INVALID (dominates).
        assert report.integrity_status is IntegrityStatus.INVALID


# ---------------------------------------------------------------------
# Canonicalization byte-identity self-check
# ---------------------------------------------------------------------


class TestCanonicalization:
    def test_deeply_sort_keys_sorts_at_every_depth_preserves_arrays(self):
        nested = {
            "z": 1,
            "a": {"y": 2, "b": [3, 1, 2]},
        }
        sorted_form = deeply_sort_keys(nested)
        assert list(sorted_form.keys()) == ["a", "z"]
        assert list(sorted_form["a"].keys()) == ["b", "y"]
        # arrays preserved in original order
        assert sorted_form["a"]["b"] == [3, 1, 2]

    def test_canonical_bundle_bytes_no_separator_whitespace(self):
        # Critical: the asymmetry vs Python json.dumps default.
        # Our output MUST have no spaces in structural separators —
        # only inside string values can spaces appear.
        b = canonical_bundle_bytes({"b": 2, "a": 1})
        assert b == b'{"a":1,"b":2}'

    def test_canonical_bundle_bytes_preserves_non_ascii_as_utf8(self):
        b = canonical_bundle_bytes({"label": "café"})
        # Raw UTF-8 of "café" is 63 61 66 c3 a9 — must NOT be \\u escaped.
        assert "café" in b.decode("utf-8")

    def test_compute_bundle_hash_is_deterministic(self):
        bundle = make_clean_bundle()
        # Hashing the bundle again (without bundle_hash) yields the same
        # value the seal computed.
        recomputed = compute_bundle_hash(bundle)
        assert recomputed == bundle["bundle_hash"]

    def test_external_sha256_matches_compute_bundle_hash(self):
        # Independent SHA-256 sanity: the adapter's bundle hash is
        # exactly sha256 of canonical_bundle_bytes(bundle - bundle_hash).
        bundle = make_clean_bundle()
        bundle_no_hash = {k: v for k, v in bundle.items() if k != "bundle_hash"}
        external = hashlib.sha256(canonical_bundle_bytes(bundle_no_hash)).hexdigest()
        assert external == bundle["bundle_hash"]


# ---------------------------------------------------------------------
# Cross-runtime parity demonstration (synthetic side)
#
# This proves Python and TypeScript would produce the same bundle_hash
# for the same canonical-bundle input.  The asserted equality is on the
# canonical-byte rule, which is the load-bearing invariant.
# ---------------------------------------------------------------------


class TestCrossRuntimeCanonicalIdentity:
    """For values containing only the JSON types used by ReceiptBundle
    (objects, arrays, strings, ints, booleans, null), the rule
    `JSON.stringify(deeplySortKeys(value))` (TS) and
    `json.dumps(deeply_sort_keys(value), sort_keys=True,
               separators=(",",":"), ensure_ascii=False)` (Python)
    produce byte-identical UTF-8 output.

    These tests are the synthetic-side proof of byte-identity. The
    real-export integration test in test_real_export.py asserts the
    same property against a bundle the portal actually produced."""

    def test_identical_payload_produces_identical_canonical_bytes(self):
        # Hand-rolled "TS-equivalent" output for a known input.
        payload = {"b": 2, "a": [3, {"y": 1, "x": 2}]}
        # JS JSON.stringify(deeplySortKeys(payload)) would produce:
        expected = b'{"a":[3,{"x":2,"y":1}],"b":2}'
        actual = canonical_bundle_bytes(payload)
        assert actual == expected

    def test_null_preserved_not_stripped(self):
        # Asymmetry guard: ensure_ascii=False doesn't drop null fields.
        payload = {"a": None, "b": 1}
        expected = b'{"a":null,"b":1}'
        assert canonical_bundle_bytes(payload) == expected

    def test_nested_object_keys_sort_at_every_level(self):
        payload = {"outer": {"z": 1, "a": {"q": 2, "b": 3}}}
        expected = b'{"outer":{"a":{"b":3,"q":2},"z":1}}'
        assert canonical_bundle_bytes(payload) == expected


# ---------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------


class TestEdgeCases:
    def test_non_dict_input_raises_BundleVerificationError(self):
        with pytest.raises(BundleVerificationError):
            verify_receipt_bundle("not a bundle")  # type: ignore[arg-type]
        with pytest.raises(BundleVerificationError):
            verify_receipt_bundle(None)  # type: ignore[arg-type]
        with pytest.raises(BundleVerificationError):
            verify_receipt_bundle([])  # type: ignore[arg-type]

    def test_empty_operator_actions_array_is_VALID(self):
        bundle = make_clean_bundle(with_operator_actions=0)
        assert bundle["operator_actions"] == []
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID

    def test_input_is_never_mutated(self):
        bundle = make_clean_bundle()
        snapshot = json.dumps(bundle, sort_keys=True)
        verify_receipt_bundle(bundle)
        assert json.dumps(bundle, sort_keys=True) == snapshot
