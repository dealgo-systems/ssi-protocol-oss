# Authorized DeAlgo Repos — Phase X Working Set

**Status:** locked governance file. Do not edit without confirming with the user.
**Last updated:** 2026-05-06

This file exists in every authorized repo. It defines the **only** legitimate working set for DeAlgo Phase X work, the per-gate branch map, and the explicit invalidation list.

If you (human or agent) are about to edit a file: confirm the repo is in the **Authorized repos** table below, and the branch matches the **Phase X branch map**. If neither matches, **stop** and confirm with the user before continuing.

---

## Authorized repos

| Repo | Role |
|---|---|
| `dealgo-portal` | receipts, UI, approvals, operator chain |
| `dealgo-csc` | CSC decision/outcome core (Phase X implementation substrate) |
| `dealgo-csc-sdk` | client integration |
| `ssi-protocol-oss` | protocol spec / verifier / canonical bytes — canonical doctrine home |
| `dealgo-mcp-server` | agent/tool governance (X-C surface) |

Anything not in this table is **not authorized** for Phase X work without an explicit update to this file.

---

## Phase X branch map

| Work | Repo | Branch | Base |
|---|---|---|---|
| Canonical doctrine | `ssi-protocol-oss` | `docs/phase-x-doctrine` | `main` |
| Portal pointer doc | `dealgo-portal` | `docs/phase-x-pointer` | `main` |
| Authorized-repos governance file (this) | each authorized repo | `docs/authorized-repos` | `main` |
| Gate 1 — producer-key rotation registry | `dealgo-csc` | `feat/v2.1-key-rotation-registry` | `v2-prototype` |
| Gate 2 — frozen policy snapshots | `dealgo-csc` | `feat/v2.1-policy-snapshots` | `v2-prototype` |
| Gate 3 — receipt schema stabilization | `ssi-protocol-oss` + `dealgo-portal` | per-repo `feat/v2.1-receipt-schema-*` | `main` |
| Gate 4 — cross-language verifier sibling | `ssi-protocol-oss` | `feat/v2.1-verifier-sibling` | `main` |

---

## Substrate authority

`dealgo-csc/docs/v2-spec.md` on branch `v2-prototype` is **FROZEN at v2.0** and is the authoritative substrate Phase X depends on. Phase X work is **v2.1-draft** under v2-spec's own versioning rule.

Hard invariants Phase X MUST preserve:

1. **"v2 can influence. v1 decides."** — v2 has zero standalone decision authority.
2. **Byte-identical compatibility.** Callers without `v2_aware` MUST receive byte-identical decisions to the v2.0-frozen substrate.

Any Phase X change that risks either invariant requires substrate-author sign-off before merge.

---

## Invalidation list — DO NOT TOUCH for Phase X

- **`csc-kernel`** — invalidated. Earlier Phase X work landed there in error (a Phase X doctrine doc + Gate 1 + Gate 2 implementation). All of it was reverted on 2026-05-06 and is null. The repo's Phase C / capsule semantics are not part of Phase X.
- **`csc-brain`** (serving / training) — not a Phase X target.
- **`dealgo-brain`** — not a Phase X target.
- **`dealgo-csc-lab`** — historical experimental lineage only. Source for the v2-spec lab-phase findings (009 → 011.8). **Never a production dependency.** Read-only for scientific provenance.
- All other `dealgo-*`, `ssi-*`, `csc-*` directories — not authorized unless explicitly added to the **Authorized repos** table above.

---

## Branch discipline (load-bearing)

1. **Never implement directly on `main`.**
2. Phase X substrate work MUST branch from `v2-prototype` in `dealgo-csc`.
3. Protocol docs branch independently from implementation branches.
4. Experimental / lab repos are never production dependencies.
5. Cross-repo changes require explicit repo-target confirmation before edits.
6. **Doctrine reference style:** abstract for private repos in any OSS-public document; concrete only in private-repo internal docs.

---

## Doctrine pointers

- Canonical doctrine (public): `ssi-protocol-oss/docs/PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md` on `docs/phase-x-doctrine`.
- Portal pointer (private, concrete impl mapping): `dealgo-portal/docs/spec/PHASE_X_CROSS_PLATFORM_OPERATIONAL_TRUST.md` on `docs/phase-x-pointer`.

---

## Why this file exists

On 2026-05-06 the assistant wrote a Phase X doctrine + Gate 1 + Gate 2 implementation against `csc-kernel` — an unauthorized repo whose own Phase C / capsule semantics bled into the design. All of it was invalidated and reverted.

This file makes the authorized set, branch map, and invalidation list **machine-readable, repo-native, and unambiguous** so the same mistake cannot recur. Any agent or contributor that reads this file before editing has no excuse for working in the wrong repo.
