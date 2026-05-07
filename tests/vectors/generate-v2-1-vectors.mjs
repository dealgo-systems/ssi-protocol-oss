#!/usr/bin/env node
/**
 * Generate v2.1 golden test vectors for the RPX schema.
 *
 * Produces:
 *   tests/vectors/rpx/valid-chain-3-v2.1.jsonl       (3-record chain mixing v1 + v2.1)
 *   tests/vectors/rpx/unknown-field-passthrough.jsonl (single v2.1 record with unknown top-level field)
 *
 * Both files are content-deterministic — re-running this script produces
 * byte-identical output. Hashes are computed using the same canonicalize
 * package that ssi-verify uses, so the vectors are self-consistent.
 *
 * Run: node tests/vectors/generate-v2-1-vectors.mjs
 */

import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import canonicalize from 'canonicalize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RPX_DIR = join(__dirname, 'rpx');

const GENESIS_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function computeRecordHash(record) {
  const { record_hash, metadata, ...hashableFields } = record;
  const canonical = canonicalize(hashableFields);
  if (!canonical) throw new Error('canonicalize returned empty');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function sealRecord(record) {
  const hash = computeRecordHash(record);
  return { ...record, record_hash: hash };
}

// ---------------------------------------------------------------------
// Vector 1: valid-chain-3-v2.1
// Mixes one v1 record (no receipt_version, no v2.1 fields) with two v2.1
// records (receipt_version, signing_key_id, policy_snapshot_fingerprint).
// Asserts §14 rule 5: latest verifier accepts older records on the same chain.
// ---------------------------------------------------------------------

const r0_v1 = sealRecord({
  record_id: 'rec_v2-1-test_000',
  timestamp: '2026-05-06T12:00:00.000000Z',
  previous_hash: GENESIS_HASH,
  decision_type: 'authorization.action',
  agent_id: 'agent-v2-1-test',
  outcome: 'ALLOW',
  context_hash: 'a'.repeat(64),
  policy_version: 'policy-v1.0.0',
  action_type: 'test.v1.legacy',
  reason: 'v1 record — no receipt_version, accepted as v1 by back-compat rule',
  metadata: { test_vector: 'valid-chain-3-v2.1', record_index: 0, kind: 'v1-legacy' },
});

const r1_v21 = sealRecord({
  record_id: 'rec_v2-1-test_001',
  timestamp: '2026-05-06T12:00:01.000000Z',
  previous_hash: r0_v1.record_hash,
  decision_type: 'authorization.action',
  agent_id: 'agent-v2-1-test',
  outcome: 'ALLOW',
  context_hash: 'b'.repeat(64),
  policy_version: 'policy-v2.1.0',
  action_type: 'test.v2.1.normal',
  reason: 'v2.1 record carrying receipt_version, signing_key_id, policy_snapshot_fingerprint',
  receipt_version: '2.1',
  signing_key_id: 'a1b2c3d4e5f60718',
  policy_snapshot_fingerprint:
    '3f5e1c2b1a098765' + '4321fedcba098765' + '4321fedcba098765' + '4321fedcba012345',
  metadata: { test_vector: 'valid-chain-3-v2.1', record_index: 1, kind: 'v2.1-fields' },
});

const r2_v21_extra = sealRecord({
  record_id: 'rec_v2-1-test_002',
  timestamp: '2026-05-06T12:00:02.000000Z',
  previous_hash: r1_v21.record_hash,
  decision_type: 'authorization.action',
  agent_id: 'agent-v2-1-test',
  outcome: 'ALLOW',
  context_hash: 'c'.repeat(64),
  policy_version: 'policy-v2.1.0',
  action_type: 'test.v2.1.with_payload',
  reason: 'v2.1 record carrying signed payload fields',
  receipt_version: '2.1',
  signing_key_id: 'a1b2c3d4e5f60718',
  policy_snapshot_fingerprint:
    '3f5e1c2b1a098765' + '4321fedcba098765' + '4321fedcba098765' + '4321fedcba012345',
  payload_hash: 'd'.repeat(64),
  signature:
    'MEUCIQDTGZ4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4ZAIgZ4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4=',
  metadata: { test_vector: 'valid-chain-3-v2.1', record_index: 2, kind: 'v2.1-with-payload' },
});

const validChain = [r0_v1, r1_v21, r2_v21_extra]
  .map((rec) => JSON.stringify(rec))
  .join('\n') + '\n';

writeFileSync(join(RPX_DIR, 'valid-chain-3-v2.1.jsonl'), validChain, 'utf8');
console.log(`wrote ${join(RPX_DIR, 'valid-chain-3-v2.1.jsonl')}`);

// ---------------------------------------------------------------------
// Vector 2: unknown-field-passthrough
// A single v2.1 record carrying an unknown top-level field a verifier
// of this version does not recognize. Asserts §14 rule 1: verifiers
// MUST accept unknown fields and MUST hash-include them so the
// record_hash remains reproducible.
// ---------------------------------------------------------------------

const unknownFieldRecord = sealRecord({
  record_id: 'rec_unknown-passthrough',
  timestamp: '2026-05-06T13:00:00.000000Z',
  previous_hash: GENESIS_HASH,
  decision_type: 'authorization.action',
  agent_id: 'agent-future',
  outcome: 'ALLOW',
  context_hash: 'e'.repeat(64),
  policy_version: 'policy-v3.0.0-future',
  receipt_version: '2.1',
  // An additive-only field a future v2.x or v3 producer added. Verifiers
  // built today MUST NOT reject this record, MUST hash-include this field,
  // and MUST recompute the same record_hash.
  future_optional_field: 'future-value-the-current-verifier-does-not-recognize',
  another_future_field: { nested: 'object', count: 42 },
  metadata: { test_vector: 'unknown-field-passthrough', kind: 'forward-compat' },
});

writeFileSync(
  join(RPX_DIR, 'unknown-field-passthrough.jsonl'),
  JSON.stringify(unknownFieldRecord) + '\n',
  'utf8',
);
console.log(`wrote ${join(RPX_DIR, 'unknown-field-passthrough.jsonl')}`);

console.log('\nv2.1 golden vectors generated.');
