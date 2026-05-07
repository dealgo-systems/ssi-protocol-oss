# SSI Protocol - Python SDK

[![PyPI version](https://badge.fury.io/py/ssi-protocol.svg)](https://badge.fury.io/py/ssi-protocol)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Reference Python SDK for the [SSI Protocol](https://ssi-protocol.org) - Constitutional AI Governance.

## Installation

```bash
pip install ssi-protocol
```

## Quick Start

### 1. Start SSI Services

```bash
# Using Docker
docker run -d -p 5050:5050 ssiprotocol/kernel:v0.3.0
docker run -d -p 4040:4040 ssiprotocol/gateway:v0.3.0

# Or using local services
cd reference/kernel && npm start &
cd reference/gateway && npm start &
```

### 2. Wrap Your Application

```python
from ssi_protocol import SSIClient

# Initialize client
client = SSIClient(gateway_url="http://localhost:4040")

# Make governed decision
decision = client.evaluate(
    client_id="my-trading-bot",
    system_id="trading-prod",
    action_type="trade.order.place",
    payload={"notional": 5000, "open_positions_count": 1}
)

if decision.allowed:
    print(f"✅ ALLOW: {decision.reason}")
    # Execute the action
else:
    print(f"❌ DENY: {decision.reason}")
    # Block the action
```

### 3. Using the Decorator Pattern

```python
from ssi_protocol import ssi_governed

@ssi_governed(
    system_id="trading-prod",
    action_type="trade.order.place"
)
def place_order(symbol: str, notional: float, direction: str):
    """Place a trading order - automatically governed by SSI"""
    # Your trading logic here
    return execute_trade(symbol, notional, direction)

# SSI automatically checks governance before executing
result = place_order("BTCUSD", 5000, "LONG")
```

## Features

- ✅ **Simple API** - Integrate in minutes with minimal code changes
- ✅ **Decorator Pattern** - Wrap existing functions with `@ssi_governed`
- ✅ **Type Safety** - Full type hints for IDE autocomplete
- ✅ **Async Support** - `async/await` compatible client
- ✅ **Error Handling** - Graceful degradation when Gateway unavailable
- ✅ **Audit Trail** - Automatic RPX logging for compliance

## Examples

See [`examples/`](examples/) directory for:
- Trading system integration
- Healthcare AI governance
- Content moderation
- Multi-agent orchestration

## Documentation

Full documentation available at [ssi-protocol.org/developers](https://ssi-protocol.org/developers)

## Independent verifier sibling (`ssi_protocol.verify`)

Phase X Gate 4 introduced a **spec-derived** Python verifier in [`ssi_protocol/verify/`](ssi_protocol/verify/). It is not a port of the TypeScript verifier in [`tools/ssi-verify/`](../../tools/ssi-verify/) — both implementations consume the same public golden vectors and same public schema, and **both must produce identical truth judgments** for every vector.

That cross-language consensus is the protocol's sovereignty proof: protocol truth survives implementation boundaries.

### Public surface

```python
from ssi_protocol.verify import (
    canonical_bytes,          # RFC-8785-style canonical JSON bytes
    compute_record_hash,      # SHA-256 hex of canonical bytes
    verify_record,            # single-record schema + hash check
    verify_chain,             # full-chain walk
    IntegrityStatus,          # VALID / INVALID / INCOMPLETE
    TamperEvidence,           # one unit of tamper signal
    VerificationReport,       # full chain report
    GENESIS_HASH,             # SHA-256("") — first-record previous_hash
)
```

### Acceptance matrix

The verifier is tested against the **same** seven golden vectors the TypeScript verifier consumes (`tests/vectors/rpx/*.jsonl`). Both verifiers must agree on every classification:

| Vector | Expected |
|---|---|
| `valid-chain-10` | VALID |
| `valid-chain-3-v2.1` | VALID |
| `unknown-field-passthrough` | VALID |
| `tampered-record` | INVALID |
| `missing-link` | INCOMPLETE |
| `reordered` | INCOMPLETE |
| `bad-timestamp` | INCOMPLETE |

Plus byte-identity: every record's stored `record_hash` (computed by the OSS TypeScript pipeline using the `canonicalize` npm package) MUST equal the Python recomputed hash. This is asserted for every record in every VALID vector — proving canonicalization is byte-identical across implementations.

Run the acceptance suite:

```bash
cd sdks/python
python -m pytest tests/test_verifier_vectors.py -v
```

### What the verifier does NOT do

- Does not import any TypeScript output, dist artifacts, or Node tooling.
- Does not re-canonicalize per-record canonical bytes (records are validated by recomputing the hash from the record's own current fields).
- Does not mutate any vector or expected-report file.
- Does not couple to the SDK client surface (`SSIClient`, `ssi_governed`); the verifier subpackage is independent.

Spec authority: [`schemas/rpx-record.schema.json`](../../schemas/rpx-record.schema.json) + [`docs/protocol/RECEIPT_EVOLUTION.md`](../../docs/protocol/RECEIPT_EVOLUTION.md).

## ReceiptBundle adapter (`ssi_protocol.verify.bundle`)

Path (ii) added a Python adapter for the **portal's** `ReceiptBundle` JSON format — the artifact emitted by `/api/audit/receipt/<id>`. The same JSON file can now be verified by the existing TypeScript reference verifier (`dealgo-portal/scripts/verify-receipt.mts`) and by this Python adapter, with **byte-identical** chain-hash and bundle-hash recomputation.

This is the artifact-convergence layer: same continuity object, two sovereign verifiers, one truth.

### Public surface

```python
from ssi_protocol.verify import (
    verify_receipt_bundle,    # main entry — pass a bundle dict, get a VerificationReport
    compute_bundle_hash,      # SHA-256 of canonical bundle (excluding bundle_hash itself)
    compute_row_chain_hash,   # sha256( (previous_hash ?? "") + "\n" + canonical_bytes )
    canonical_bundle_bytes,   # canonical JSON encoder (matches TS deeplySortKeys + JSON.stringify byte-for-byte)
    deeply_sort_keys,         # deep recursive key-sort helper
    BundleVerificationError,
)

import json

with open("receipt.json", "r", encoding="utf-8") as fh:
    bundle = json.load(fh)

report = verify_receipt_bundle(bundle)
print(report.integrity_status)        # VALID / INCOMPLETE / INVALID
print(len(report.tamper_evidence))    # finding count
```

The adapter returns the same `VerificationReport` shape the RPX verifier produces, so consumers can handle both verifiers' output uniformly.

### Run the synthetic-fixture test suite

```bash
cd sdks/python
python -m pytest tests/test_receipt_bundle_adapter.py -v
```

### Run against a real portal export (acceptance bar item 2)

The real-bundle integration test in `tests/test_real_export.py` validates the adapter against an actual `ReceiptBundle` exported from the portal. The bundle file itself is **not committed** to this repo (it contains real workspace IDs, decision IDs, and signed canonical bytes — forbidden by [`PUBLIC_PROTOCOL_CHECKLIST.md`](../../PUBLIC_PROTOCOL_CHECKLIST.md)). Provide one at runtime via the `BUNDLE_PATH` environment variable:

```bash
# 1. Export a real receipt from the portal:
curl -L "https://your-portal-host/api/audit/receipt/<id>" -o receipt.json

# 2. Run the integration test against it:
cd sdks/python
BUNDLE_PATH=$(pwd)/../../receipt.json python -m pytest tests/test_real_export.py -v
```

The test is **skipped** when `BUNDLE_PATH` is unset (which is always true in CI for this repo, by design). When provided, it asserts:

1. The exported bundle parses as a JSON object.
2. All required top-level fields are present.
3. The decision row's stored `chain_hash` recomputes via the Python formula.
4. Every operator action's stored `chain_hash` recomputes.
5. The top-level `bundle_hash` recomputes — the **cross-runtime byte-identity** proof.
6. End-to-end `verify_receipt_bundle()` returns `VALID` with zero findings.
7. Unknown top-level fields don't break recomputation (forward-compat).

Acceptance bar #2 is satisfied when a real export passes all seven assertions.

### What this adapter does NOT do (Path (ii) scope, locked)

- ❌ No CLI (`python -m ssi_protocol.verify --in <file>` is **not** wired)
- ❌ No PyPI release / no `setup.py` change / no version bump
- ❌ No portal-side change
- ❌ No `verifier_attestations` injection into bundles
- ❌ No simulated cross-runtime consensus
- ❌ No portal-specific trust assumptions or DB knowledge
- ❌ No hidden field normalization (case-folding, whitespace stripping, type coercion)

Those are deliberately out of Path (ii) scope and would require separate authorized deliverables.

## License

Apache 2.0 - See [LICENSE](../../LICENSE)
