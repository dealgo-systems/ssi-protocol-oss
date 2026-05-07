# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Path (ii) — real-export integration test.

Acceptance bar item 2 — verifies the Python adapter against a real
ReceiptBundle exported from the portal at /api/audit/receipt/<id>.

The bundle file itself is **NOT committed** to this repo. It contains
real workspace IDs, decision IDs, and per-row canonical bytes (which
include real customer payloads, signed). Per the
PUBLIC_PROTOCOL_CHECKLIST.md rule "Customer data, audit logs, real
receipts → reject", such artifacts are forbidden in this OSS repo.

Instead, this test reads the bundle path from the BUNDLE_PATH
environment variable. If unset, the test is skipped — the synthetic
fixture suite in test_receipt_bundle_adapter.py covers acceptance bar
item 1 standalone. Pass-or-skip is the design; the test never silently
fails to satisfy the bar.

Usage:
    BUNDLE_PATH=/path/to/your/receipt.json python -m pytest \\
        tests/test_real_export.py -v

The runner is committed because it is logic, not data.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
SDK_ROOT = HERE.parent
sys.path.insert(0, str(SDK_ROOT))

from ssi_protocol.verify import (  # noqa: E402
    IntegrityStatus,
    canonical_bundle_bytes,
    compute_bundle_hash,
    compute_row_chain_hash,
    verify_receipt_bundle,
)


BUNDLE_PATH = os.environ.get("BUNDLE_PATH", "").strip()
RUN_REAL_EXPORT = bool(BUNDLE_PATH)

real_export = pytest.mark.skipif(
    not RUN_REAL_EXPORT,
    reason=(
        "set BUNDLE_PATH to a real receipt JSON exported from "
        "/api/audit/receipt/<id> to enable. The bundle is intentionally "
        "not committed to this repo (PUBLIC_PROTOCOL_CHECKLIST.md)."
    ),
)


def _load_bundle(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


@real_export
class TestRealExport:
    """All assertions hold for any well-formed, untampered ReceiptBundle
    the portal emits today. If any of these fail against a fresh export,
    the failure is meaningful: either the portal's emission contract
    drifted, or the adapter's canonicalization no longer matches it.
    """

    def test_real_bundle_loads_as_object(self):
        bundle = _load_bundle(BUNDLE_PATH)
        assert isinstance(bundle, dict), (
            f"bundle file at {BUNDLE_PATH} did not parse to a JSON object"
        )

    def test_real_bundle_carries_required_top_level_fields(self):
        bundle = _load_bundle(BUNDLE_PATH)
        for required in (
            "schema_version",
            "generated_at",
            "decision",
            "approval",
            "webhook_deliveries",
            "outcome",
            "operator_actions",
            "bundle_hash",
        ):
            assert required in bundle, f"real bundle missing required field: {required}"

    def test_real_bundle_decision_row_chain_hash_recomputes(self):
        """The most load-bearing per-row check: the portal's stored
        chain_hash for the decision row is exactly sha256_hex( (prev ?? "")
        + "\\n" + canonical_bytes ). If this drifts, every existing
        receipt becomes unverifiable."""
        bundle = _load_bundle(BUNDLE_PATH)
        decision = bundle["decision"]
        recomputed = compute_row_chain_hash(
            decision.get("previous_hash"),
            decision["canonical_bytes"],
        )
        assert recomputed == decision["chain_hash"], (
            f"decision chain_hash mismatch — Python recompute disagrees "
            f"with portal-stored value. Stored={decision['chain_hash']}, "
            f"recomputed={recomputed}"
        )

    def test_real_bundle_every_operator_action_chain_hash_recomputes(self):
        bundle = _load_bundle(BUNDLE_PATH)
        ops = bundle.get("operator_actions") or []
        for index, op in enumerate(ops):
            recomputed = compute_row_chain_hash(
                op.get("previous_hash"),
                op["canonical_bytes"],
            )
            assert recomputed == op["chain_hash"], (
                f"operator_actions[{index}] chain_hash mismatch — "
                f"id={op.get('id')!r} stored={op['chain_hash']} "
                f"recomputed={recomputed}"
            )

    def test_real_bundle_top_level_bundle_hash_recomputes(self):
        """The byte-identity invariant: Python's canonical_bundle_bytes
        + sha256 produces the same bundle_hash the portal's TS
        canonicalJsonStringify + sha256 produced when assembling.
        This is the load-bearing cross-runtime byte-identity proof."""
        bundle = _load_bundle(BUNDLE_PATH)
        recomputed = compute_bundle_hash(bundle)
        assert recomputed == bundle["bundle_hash"], (
            "bundle_hash mismatch — the Python adapter's "
            "canonical_bundle_bytes does NOT produce a JSON byte-string "
            "identical to the portal TS canonicalJsonStringify. "
            f"Stored={bundle['bundle_hash']}, recomputed={recomputed}. "
            "This is the cross-runtime artifact-convergence failure mode."
        )

    def test_real_bundle_verifies_VALID(self):
        """End-to-end: a fresh untampered export should verify cleanly
        through the public adapter API."""
        bundle = _load_bundle(BUNDLE_PATH)
        report = verify_receipt_bundle(bundle)
        assert report.integrity_status is IntegrityStatus.VALID, (
            f"real export did not verify cleanly. Status={report.integrity_status}, "
            f"findings={[f.kind for f in report.tamper_evidence]}"
        )
        assert report.tamper_evidence == ()

    def test_real_bundle_unknown_top_level_fields_do_not_break_adapter(self):
        """Forward-compat smoke check: any future top-level fields the
        portal adds should not regress the adapter — they get
        hash-included via the canonical-byte rule, but otherwise pass
        through structurally."""
        bundle = _load_bundle(BUNDLE_PATH)
        # We don't know what unknown fields a future portal might add,
        # but the bundle hash recomputes regardless of which fields are
        # present (because both sides use the same canonicalization
        # rule). This test re-asserts that property end-to-end on the
        # real data.
        assert hashlib.sha256(canonical_bundle_bytes(
            {k: v for k, v in bundle.items() if k != "bundle_hash"}
        )).hexdigest() == bundle["bundle_hash"]
