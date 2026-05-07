# SSI Protocol Conformance Guide

**Version:** 0.3.1  
**Status:** Reference Implementation Available  
**Purpose:** Self-validation for implementers

> ⚠️ **NOTE**: No certification authority exists. This guide is for self-assessment only.  
> Future certification programs described herein are non-operational design concepts.

---

## Overview

This guide enables organizations to validate SSI Protocol conformance independently. No certification authority exists yet.

**Use this if:**
- You're implementing SSI in production
- You need to verify protocol compliance
- You want to prepare for future certification

---

## Core Conformance Requirements

### 1. RPX Protocol Implementation

**MUST implement:**
- ✅ Request packet structure (JSON envelope)
- ✅ Permission request to Kernel
- ✅ Execution confirmation to Kernel
- ✅ Cryptographic signatures (Ed25519 minimum)

**Test:** Can you send a trade request through Gateway → Kernel → approval → execution?

---

### 2. Governance Envelope Processing

**MUST support:**
- ✅ Multi-layer policy evaluation (Global → Domain → Local)
- ✅ Most-restrictive-wins conflict resolution
- ✅ Deny-by-default for undefined actions
- ✅ Policy version tracking

**Test:** Does your system correctly deny actions when no explicit permission exists?

---

### 3. Audit Trail Generation

**MUST produce:**
- ✅ Cryptographically signed decision records
- ✅ Immutable audit logs
- ✅ Complete decision provenance
- ✅ Retention per governance requirements

**Test:** Can an auditor reconstruct why every action was approved/denied?

---

### 4. Safety Boundaries

**MUST enforce:**
- ✅ Pre-execution validation (no action before approval)
- ✅ Resource limits from governance policies
- ✅ Emergency intervention mechanisms
- ✅ Graceful degradation on policy conflicts

**Test:** Can your system prevent an agent from exceeding approved limits?

---

### 5. Receipt Schema Evolution Discipline (v2.1+)

**MUST follow** the rules formalized in [`docs/protocol/RECEIPT_EVOLUTION.md`](protocol/RECEIPT_EVOLUTION.md):

- ✅ Additive-only: new fields are optional; verifiers ignore unknowns
- ✅ Canonical-byte preservation: alphabetical key ordering at every depth, no whitespace, UTF-8, exclude `record_hash` and `metadata`
- ✅ Deprecation never deletion: deprecated fields remain hash-included
- ✅ Verifier backward compatibility: latest verifier accepts all prior versions still in chain
- ✅ Producer key rotation as a chained event: prior keys remain advertised so historical receipts stay verifiable
- ✅ Intermediary preservation: portals, transport layers, and storage adapters MUST NOT mutate unknown fields, MUST NOT reorder arrays, MUST NOT collapse `null` to absent

**Test:** Does your verifier accept a v2.1 record that includes an unknown forward-compatible top-level field, without rejecting the record and without silently stripping the field?

---

### 6. Cross-Runtime Verification Reproducibility

**MUST hold:**
- ✅ A receipt produced by a conformant emitter can be verified by an independent runtime that consumes only the receipt bytes (no network call to the producer required).
- ✅ Independent verifier implementations reproduce **byte-identical** canonical-byte output and **byte-identical** SHA-256 chain-hash and bundle-hash values.
- ✅ Verifier disagreement, when it occurs, is reported as disagreement — never silently resolved or smoothed over.

**Distinction (load-bearing):** "cross-runtime verification" proves that independent runtimes reproduce the same *integrity conclusions* about the same artifact. It does **not** prove the underlying decision was correct, just, or compliant with any external standard. See [`docs/protocol/CROSS_RUNTIME_VERIFICATION.md`](protocol/CROSS_RUNTIME_VERIFICATION.md) for the full framing.

**Test:** Run the TS reference verifier (`tools/ssi-verify`) and the Python sibling (`sdks/python/ssi_protocol/verify`) against the same set of golden vectors. Do they classify every vector identically (`VALID` / `INVALID` / `INCOMPLETE`) and recompute every hash byte-identically?

---

## Conformance Levels

### **Level 1: Core Protocol**
Implements RPX + basic governance envelope processing.  
**Suitable for:** Development, testing, research

### **Level 2: Production Ready**
Adds audit trails + safety boundaries + multi-layer policies.  
**Suitable for:** Production deployments, regulated industries

### **Level 3: Mission Critical** (Future)
Adds formal verification + redundancy + certified components.  
**Suitable for:** Financial, healthcare, critical infrastructure

---

## Self-Assessment Checklist

```
[ ] Gateway accepts RPX packets
[ ] Kernel evaluates governance policies
[ ] Most-restrictive policy wins on conflicts
[ ] All decisions are cryptographically signed
[ ] Audit logs are immutable and complete
[ ] Emergency stop mechanisms exist
[ ] Agents cannot bypass governance
[ ] Policy updates propagate correctly
[ ] Human approval workflow functions
[ ] Documentation matches implementation
```

---

## Validation Process

### Step 1: Review Specification
Read `/spec/` directory for authoritative protocol definition.

### Step 2: Run Reference Runtime
Compare your implementation against reference behavior.

```bash
# Start reference system
./start-all-services.ps1

# Run conformance tests
npm test
```

### Step 3: Document Deviations
Any intentional deviations from spec must be documented with rationale.

### Step 4: Prepare Evidence
Collect:
- Architecture diagrams
- Test results
- Audit log samples
- Policy evaluation traces

---

## Reference Implementation

The SSI Protocol includes a complete reference implementation in `/reference/`:

- **Gateway** (Port 4040): RPX packet reception and validation
- **Kernel** (Port 5050): Policy evaluation and decision engine
- **Client SDKs**: Trading, healthcare, content moderation examples

**Use reference implementation to:**
- Validate your understanding of the protocol
- Compare behavior against authoritative implementation
- Test interoperability
- Verify edge cases

---

## Common Conformance Issues

### ❌ **Bypassing Kernel Approval**
Agent executes actions without waiting for Kernel permission.

**Fix:** All actions MUST request permission before execution.

### ❌ **Incomplete Audit Trails**
Missing decision records or unsigned logs.

**Fix:** Every decision MUST be cryptographically signed and logged.

### ❌ **Incorrect Policy Layering**
Local policies override more restrictive global policies.

**Fix:** Most-restrictive policy MUST always win.

### ❌ **Missing Deny-by-Default**
Actions allowed when no explicit policy exists.

**Fix:** Undefined actions MUST be denied.

---

## Testing Strategy

### Unit Tests
- Policy evaluation logic
- Signature verification
- Envelope parsing
- Conflict resolution

### Integration Tests
- Gateway ↔ Kernel communication
- Multi-layer policy enforcement
- Audit log generation
- Human approval workflow

### Security Tests
- Policy bypass attempts
- Signature tampering detection
- Replay attack prevention
- Emergency intervention

### Performance Tests
- Request throughput
- Policy evaluation latency
- Audit log write performance
- Scale to multiple agents

---

## Future Certification

When formal governance exists, this self-assessment becomes input for certification:

**Planned levels:**
- **SSI-1:** Basic (Development use)
- **SSI-2:** Standard (Production use)
- **SSI-3:** Mission-Critical (Regulated industries)

**Timeline:** Unknown. Depends on governance formation.

**Current status:** Self-validation only. No third-party certification available.

---

## Certification Framework Preview

See [CERTIFICATION_FRAMEWORK.md](../CERTIFICATION_FRAMEWORK.md) for planned certification structure, including:

- Audit procedures
- Testing requirements
- Documentation standards
- Renewal processes

**Note:** Framework exists but no certification authority is operational yet.

---

## Interoperability

SSI Protocol is designed for interoperability:

### **Must Interoperate With:**
- Other SSI-compliant implementations
- Standard cryptographic libraries (Ed25519, SHA-256)
- JSON processing tools
- Standard HTTP/WebSocket transports

### **Should Integrate With:**
- Existing agent frameworks (LangChain, AutoGPT, etc.)
- Enterprise logging systems
- Security monitoring tools
- Regulatory reporting systems

---

## Documentation Requirements

Conformant implementations SHOULD provide:

1. **Architecture Overview:** How components interact
2. **Policy Format Guide:** How to write governance policies
3. **Integration Guide:** How to connect agents
4. **Security Model:** Threat model and mitigations
5. **Operational Guide:** Deployment and monitoring

---

## Questions?

For technical questions about conformance:

- **GitHub Discussions:** General implementation questions
- **GitHub Issues:** Suspected spec ambiguities or errors (tag: `conformance`)
- **Reference Code:** `/reference/` directory contains working examples

**No formal support exists yet.**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.3.1 | Dec 2024 | Initial conformance guide |

---

**Last Updated:** December 12, 2025
