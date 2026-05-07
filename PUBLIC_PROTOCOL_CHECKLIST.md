# Public Protocol Checklist

**Status:** load-bearing governance file. Do not edit without confirming with the user.
**Last updated:** 2026-05-06

This repo is the **public protocol surface**. Any change merged here becomes public the moment it ships. This checklist exists to keep the public/private boundary clean: governance and verification semantics ship publicly; trading logic, threshold tuning, and operational mechanics never do.

Run this checklist before opening or merging any PR.

---

## Allow — protocol-level material that belongs in this repo

| Check | Allow |
|---|---|
| Verifier semantics | ✅ |
| Canonical-byte rules (RFC 8785, JCS) | ✅ |
| Receipt schema (RPX records, evolution rules) | ✅ |
| Hash-chain spec | ✅ |
| Trust invariants | ✅ |
| Interoperability doctrine | ✅ |
| Test vectors / golden fixtures | ✅ |
| Conformance claims | ✅ |
| Compliance mapping at the protocol level | ✅ |
| Cross-language verifier siblings | ✅ |

If a change is in the above set, it ships here.

---

## Reject — material that must NEVER land here

| Check | Reject |
|---|---|
| Trading logic, signal models, alpha | ❌ |
| Threshold tuning constants from production | ❌ |
| Execution heuristics or live enforcement internals | ❌ |
| Proprietary scoring formulas | ❌ |
| Deployment heuristics or runtime orchestration internals | ❌ |
| Operational secrets, keys, tokens, dashboard URLs | ❌ |
| Customer data, audit logs, real receipts | ❌ |
| Internal incident reports | ❌ |
| Stripe / GitHub / Vercel API keys, webhook secrets | ❌ |

If a change touches any of the above, **stop**. Move it to the appropriate private repo.

---

## Abstract — material that belongs here only in abstract form

| Check | Abstract only |
|---|---|
| Private repo names (e.g. portal, substrate) | reference abstractly ("the substrate," "the portal") |
| Private repo file paths | omit; concrete mapping lives in the private pointer doc |
| Internal team names, customer names | omit |
| Internal URLs, internal hostnames | omit |
| Specific platform integrations under active development | mention as "irreversible financial," "deployment platform," etc., not by vendor unless already public |

The doctrine intentionally references private repos abstractly — see `docs/PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md` Appendix A for the discipline rule.

---

## Pre-merge questions

For every PR to this repo, the merger asks:

1. Does this change introduce any **trading logic, threshold tuning, or execution heuristics**? → reject.
2. Does this change reference **private repo names or paths concretely**? → abstract them.
3. Does this change include **operational secrets, keys, or live data**? → reject and rotate.
4. Does this change **expose internal architecture** that an outside reader could exploit or compete with? → abstract.
5. Does this change advance **protocol-level interoperability or verification correctness**? → allow.

If any of (1)–(4) fires, the PR does not merge until the offending content is removed or moved to the right private repo.

---

## Why this exists

`ssi-protocol-oss` is the public protocol layer. Its job is to make verification, canonical bytes, receipt schema, hash-chain continuity, and interoperability doctrine **independently auditable by third parties**. That value collapses if the repo also leaks proprietary execution logic.

This checklist is the lightweight gate that keeps the public surface clean and the private surface private.

---

## Companion files

- [`AUTHORIZED_REPOS.md`](AUTHORIZED_REPOS.md) — the five-repo authorized set + Phase X branch map + invalidation list.
- [`docs/PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md`](docs/PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md) — canonical Phase X doctrine (abstract private references throughout).
