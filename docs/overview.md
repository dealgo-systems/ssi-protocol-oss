# SSI Protocol — Overview

## What is SSI?

**Sovereign Synthetic Intelligence (SSI)** is an open protocol for governing AI systems with constitutional safety, transparent audit trails, and multi-party oversight.

SSI provides infrastructure for:

- **Governance Envelopes** — Wrapping AI systems in policy-aware containers
- **SSI Gateway** — Routing high-impact decisions through policy evaluation
- **SSI Kernel** — Core decision engine with constitutional constraints
- **RPX (Request-Permission-Execution)** — Replayable audit trails for all AI actions

## Architecture

SSI is designed as a layered protocol:

```
┌─────────────────────────────────────┐
│   AI Systems (Models, Agents)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   SSI Gateway (Policy Router)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   SSI Kernel (Decision Engine)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   RPX Trail (Audit Log)              │
└──────────────────────────────────────┘
```

## Core Principles

1. **Constitutional Safety** — AI actions are evaluated against explicit governance rules
2. **Transparency** — All decisions are auditable with full context
3. **Multi-Party Oversight** — Governance involves founders, institutions, and regulators
4. **Open Standard** — Protocol is open, extensible, and implementation-agnostic

## Use Cases

- Autonomous trading systems with regulatory compliance
- AI agents managing critical infrastructure
- Multi-agent systems requiring coordination and oversight
- Any AI deployment requiring transparent governance

## Getting Started

- **Protocol Specs** → See `/docs/protocol/`
- **Governance Model** → See `/docs/governance/`
- **Developer Guide** → See `/docs/developers/`
- **Safety Architecture** → See `/docs/safety/`

## Protocol-level concepts (v1.1.x and beyond)

- [**RPX records**](protocol/rpx.md) — the constitutional decision artifact
- [**ReceiptBundle**](protocol/RECEIPT_BUNDLE.md) — the per-decision continuity artifact assembled from a decision row + approvals + webhook deliveries + outcome + operator actions
- [**Receipt evolution rules**](protocol/RECEIPT_EVOLUTION.md) — additive-only, canonical-byte preservation, deprecation never deletion, intermediary preservation
- [**Cross-runtime verification**](protocol/CROSS_RUNTIME_VERIFICATION.md) — independent verifier implementations reproducing the same integrity conclusions about the same artifact (deterministic replay agreement, not truth certification)

## Glossary (terminology freeze)

These terms have specific meanings in this protocol; substituting near-synonyms can change what is being claimed.

| Term | Means | Does NOT mean |
|---|---|---|
| **integrity** | the artifact's bytes are internally consistent and have not been altered after the fact | the underlying decision was correct |
| **reproducibility** | independent runtimes deriving the same hash from the same bytes | consensus on truth |
| **deterministic replay agreement** | two verifiers running the same canonical-byte rule reach the same conclusion | governance validity |
| **continuity** | the chain of evidence is unbroken and reproducible | absence of policy gaps |
| **observability** | inspecting what the substrate has recorded | adjudicating what should have been recorded |
| **observatory** | a read-only forensic surface | a control plane |
