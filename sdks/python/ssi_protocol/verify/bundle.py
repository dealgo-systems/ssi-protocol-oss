# Copyright 2025 Jtjr86
# Licensed under the Apache License, Version 2.0
"""Path (ii) — ReceiptBundle adapter for cross-runtime continuity verification.

This module lets the Python sibling verifier consume the **portal's**
`ReceiptBundle` JSON format (as emitted by ``/api/audit/receipt/<id>``)
and produce byte-identical verification results to the existing
TypeScript reference verifier at
``dealgo-portal/scripts/verify-receipt.mts``.

Same artifact, two sovereign verifiers, identical truth judgment.

What this module IS
-------------------
- a pure (no I/O, no network, no DB) verifier of ReceiptBundle JSON
- byte-identical with the TS reference: same chain-hash formula,
  same bundle-hash formula, same canonical-byte rule
- forensic-discipline-preserving: refuses to mutate the input,
  refuses to reformat ``canonical_bytes``, refuses to coerce types,
  refuses to drop unknown forward-compatible fields
- VALID / INCOMPLETE / INVALID classification matching the portal's
  ``lib/tamper-forensics.ts`` semantics

What this module is NOT (Path (ii) scope, locked)
-------------------------------------------------
- NOT a CLI (no ``__main__.py``, no argparse, no ``--in`` flag)
- NOT a PyPI release (no version bump, no setup.py change)
- NOT a packaging / SDK ergonomics module
- NOT a portal-side change
- NOT a verifier_attestations injector
- NOT a simulated-consensus producer

Verification rules (frozen, shared with TS reference)
-----------------------------------------------------

Per-row chain hash:
    chain_hash = sha256_hex( (previous_hash ?? "") + "\\n" + canonical_bytes )

Bundle hash:
    bundle_without_hash = bundle - {bundle_hash}
    canonical_bundle    = json.dumps(deeply_sort_keys(bundle_without_hash),
                                     sort_keys=True,
                                     separators=(",", ":"),
                                     ensure_ascii=False)
    bundle_hash         = sha256_hex(canonical_bundle)

The ``deeply_sort_keys`` recursion is byte-identical with the portal's
``deeplySortKeys`` in ``lib/receipt.ts`` for the field types this
artifact uses (strings, ints, booleans, arrays, nested objects, null).
The asymmetry between Python ``json.dumps`` defaults and JS
``JSON.stringify`` defaults is corrected by the explicit
``separators=(",", ":")`` and ``ensure_ascii=False`` arguments.

Classification (matches portal ``lib/tamper-forensics.ts``):
- INVALID: any chain_hash recompute mismatch OR bundle_hash mismatch
- INCOMPLETE: structural break that is NOT a hash mismatch
- VALID: none of the above
INVALID dominates INCOMPLETE.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from .verifier import IntegrityStatus, TamperEvidence, VerificationReport


__all__ = [
    "verify_receipt_bundle",
    "compute_bundle_hash",
    "compute_row_chain_hash",
    "deeply_sort_keys",
    "canonical_bundle_bytes",
    "BundleVerificationError",
]


class BundleVerificationError(Exception):
    """Raised on caller-side violations (e.g., input is not a dict)."""


# ---------------------------------------------------------------------
# Canonicalization (byte-identical with portal lib/receipt.ts)
# ---------------------------------------------------------------------


def deeply_sort_keys(value: Any) -> Any:
    """Recursively sort object keys at every nesting depth.

    Mirrors portal ``deeplySortKeys`` byte-for-byte:
      - object keys sorted lexicographically at every depth
      - array order preserved (chain order is meaningful)
      - null preserved (not stripped)
      - no value coercion across types
      - strings (including row ``canonical_bytes``) returned by value

    Returns a new structure; the input is never mutated.
    """
    if value is None or not isinstance(value, (dict, list)):
        return value
    if isinstance(value, list):
        return [deeply_sort_keys(v) for v in value]
    return {k: deeply_sort_keys(value[k]) for k in sorted(value.keys())}


def canonical_bundle_bytes(value: Any) -> bytes:
    """Produce canonical JSON bytes for any sub-tree of a ReceiptBundle.

    Matches ``JSON.stringify(deeplySortKeys(value))`` byte-for-byte
    for the artifact's value types. The asymmetry is corrected with
    ``separators=(",", ":")`` (no spaces) and ``ensure_ascii=False``
    (UTF-8 raw, no \\u escapes).
    """
    return json.dumps(
        deeply_sort_keys(value),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def _sha256_hex(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def compute_row_chain_hash(previous_hash: Optional[str], canonical_bytes: str) -> str:
    """Compute a chain row hash per the load-bearing portal formula.

    Formula (frozen since chain genesis, shared with TS reference):
        chain_hash = sha256_hex( (previous_hash ?? "") + "\\n" + canonical_bytes )

    `canonical_bytes` is treated as an opaque string — the adapter
    never parses or re-canonicalizes it. The producer's bytes flow
    through verbatim, character-for-character.
    """
    prev = previous_hash if isinstance(previous_hash, str) else ""
    return _sha256_hex((prev + "\n" + canonical_bytes).encode("utf-8"))


def compute_bundle_hash(bundle: Dict[str, Any]) -> str:
    """Compute the top-level bundle hash.

    Strips the existing ``bundle_hash`` field (if any) before hashing.
    Mirrors the portal's bundle-hash construction exactly.
    """
    bundle_without_hash = {k: v for k, v in bundle.items() if k != "bundle_hash"}
    return _sha256_hex(canonical_bundle_bytes(bundle_without_hash))


# ---------------------------------------------------------------------
# Per-row inspection
# ---------------------------------------------------------------------


@dataclass(frozen=True)
class _RowFinding:
    severity: str  # "INVALID" or "INCOMPLETE"
    kind: str
    record_id: Optional[str]
    record_label: str
    detail: str


def _label(prefix: str, row: Dict[str, Any]) -> str:
    rid = row.get("id")
    if isinstance(rid, str) and rid:
        short = rid[:16] + "…" if len(rid) > 16 else rid
        action = row.get("action")
        if isinstance(action, str) and action and prefix == "operator":
            return f"{action} · {short}"
        return f"{prefix} · {short}"
    return f"{prefix} (unknown id)"


def _inspect_chain_row(
    prefix: str,
    row: Any,
    out: List[_RowFinding],
) -> bool:
    """Inspect one chain row (decision or operator action). Returns True
    if the row's hash recomputes cleanly, False if anything went wrong.
    Findings are appended to ``out``; the function never raises on
    malformed rows."""
    if not isinstance(row, dict):
        out.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="schema_shape",
                record_id=None,
                record_label=f"{prefix} (not an object)",
                detail=f"{prefix} row is not a JSON object",
            )
        )
        return False

    label = _label(prefix, row)
    record_id = row.get("id") if isinstance(row.get("id"), str) else None
    canonical = row.get("canonical_bytes")
    chain_hash = row.get("chain_hash")
    previous_hash = row.get("previous_hash")

    if not isinstance(canonical, str):
        out.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="missing_canonical_bytes",
                record_id=record_id,
                record_label=label,
                detail=(
                    f"{prefix} row has no canonical_bytes; "
                    "chain_hash cannot be recomputed"
                ),
            )
        )
        return False
    if not isinstance(chain_hash, str) or not chain_hash:
        out.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="missing_chain_hash",
                record_id=record_id,
                record_label=label,
                detail=(
                    f"{prefix} row has no stored chain_hash to compare against"
                ),
            )
        )
        return False

    recomputed = compute_row_chain_hash(
        previous_hash if isinstance(previous_hash, str) or previous_hash is None else None,
        canonical,
    )
    if recomputed != chain_hash:
        kind = "decision_hash_mismatch" if prefix == "decision" else "operator_hash_mismatch"
        out.append(
            _RowFinding(
                severity="INVALID",
                kind=kind,
                record_id=record_id,
                record_label=label,
                detail=(
                    f"{prefix} chain_hash mismatch — "
                    f"expected {chain_hash}, recomputed {recomputed}"
                ),
            )
        )
        return False

    return True


def _inspect_operator_link(
    row: Dict[str, Any],
    prior_hash: Optional[str],
    out: List[_RowFinding],
) -> None:
    """Detect a chain-link break on a single operator action.

    `prior_hash` is the chain_hash of the previous operator action in
    the bundle's ``operator_actions`` array (or None if this is the
    first one). For the first row we don't know the upstream chain
    head from inside the bundle, so we only check contiguity from the
    second one onward."""
    if prior_hash is None:
        return
    record_id = row.get("id") if isinstance(row.get("id"), str) else None
    label = _label("operator", row)
    prev = row.get("previous_hash")
    if prev != prior_hash:
        out.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="operator_link_break",
                record_id=record_id,
                record_label=label,
                detail=(
                    f"operator previous_hash {prev if isinstance(prev, str) else '(null)'} "
                    f"does not match prior operator chain_hash {prior_hash}"
                ),
            )
        )


# ---------------------------------------------------------------------
# Public verifier
# ---------------------------------------------------------------------


def verify_receipt_bundle(bundle: Any) -> VerificationReport:
    """Verify a portal ReceiptBundle JSON value.

    Returns a ``VerificationReport`` with ``integrity_status`` and the
    list of ``tamper_evidence`` findings. Same shape the RPX verifier
    in ``ssi_protocol.verify`` produces — intentional, so callers can
    handle both verifiers' output uniformly.

    This function is pure: no I/O, no input mutation, deterministic.
    Forward-compatible unknown fields on the bundle or its rows are
    preserved (not rejected, not flagged).

    Raises ``BundleVerificationError`` only if ``bundle`` is not a dict
    at all. All structural / cryptographic findings are returned as
    findings, not exceptions.
    """
    if not isinstance(bundle, dict):
        raise BundleVerificationError(
            f"bundle must be a JSON object, got {type(bundle).__name__}"
        )

    findings: List[_RowFinding] = []
    records_checked = 0

    # ---- decision row ----
    decision = bundle.get("decision")
    if decision is None:
        findings.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="schema_shape",
                record_id=None,
                record_label="decision",
                detail="bundle is missing the decision row",
            )
        )
    else:
        records_checked += 1
        _inspect_chain_row("decision", decision, findings)

    # ---- operator actions ----
    ops = bundle.get("operator_actions")
    if ops is None:
        ops = []
    if not isinstance(ops, list):
        findings.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="schema_shape",
                record_id=None,
                record_label="operator_actions",
                detail="operator_actions is not an array",
            )
        )
        ops = []

    prior_op_hash: Optional[str] = None
    for index, op in enumerate(ops):
        records_checked += 1
        ok = _inspect_chain_row("operator", op, findings)
        # Link-break check (sequential within bundle.operator_actions).
        if isinstance(op, dict):
            _inspect_operator_link(op, prior_op_hash, findings)
            ch = op.get("chain_hash")
            if isinstance(ch, str) and ch and ok:
                prior_op_hash = ch

    # ---- bundle hash ----
    bundle_hash = bundle.get("bundle_hash")
    if not isinstance(bundle_hash, str) or not bundle_hash:
        findings.append(
            _RowFinding(
                severity="INCOMPLETE",
                kind="schema_shape",
                record_id=None,
                record_label="bundle",
                detail="bundle has no bundle_hash",
            )
        )
    else:
        recomputed = compute_bundle_hash(bundle)
        if recomputed != bundle_hash:
            findings.append(
                _RowFinding(
                    severity="INVALID",
                    kind="bundle_hash_mismatch",
                    record_id=None,
                    record_label="bundle",
                    detail=(
                        f"bundle_hash mismatch — "
                        f"expected {bundle_hash}, recomputed {recomputed}"
                    ),
                )
            )

    # ---- classification: INVALID dominates INCOMPLETE dominates VALID ----
    status = IntegrityStatus.VALID
    for f in findings:
        if f.severity == "INVALID":
            status = IntegrityStatus.INVALID
            break
        if f.severity == "INCOMPLETE":
            status = IntegrityStatus.INCOMPLETE
            # keep walking — INVALID can still upgrade us

    # ---- adapt to the shared VerificationReport shape ----
    tamper_tuple: Tuple[TamperEvidence, ...] = tuple(
        TamperEvidence(record_id=f.record_id, kind=f.kind, detail=f.detail)
        for f in findings
    )

    return VerificationReport(
        integrity_status=status,
        record_count=records_checked,
        tamper_evidence=tamper_tuple,
    )
