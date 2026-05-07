#!/usr/bin/env node

/**
 * Test runner for ssi-verify golden test vectors
 * 
 * Compares actual verification outputs against expected outputs
 * Strict comparison on: integrity_status, tamper_evidence count, compliance_level
 * Loose comparison on: timestamps, report_ids
 */

import { spawn } from 'child_process';
import { readFileSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const VECTORS_DIR = join(PROJECT_ROOT, 'tests', 'vectors');
const EXPECTED_DIR = join(VECTORS_DIR, 'expected');
const RPX_DIR = join(VECTORS_DIR, 'rpx');
const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

const testVectors = [
  {
    name: 'valid-chain-10',
    input: join(RPX_DIR, 'valid-chain-10.jsonl'),
    expected: join(EXPECTED_DIR, 'valid-chain-10.verification-report.json'),
    expectedStatus: 'VALID',
    expectedExitCode: 0
  },
  {
    name: 'tampered-record',
    input: join(RPX_DIR, 'tampered-record.jsonl'),
    expected: join(EXPECTED_DIR, 'tampered-record.verification-report.json'),
    expectedStatus: 'INVALID',
    expectedExitCode: 1
  },
  {
    name: 'missing-link',
    input: join(RPX_DIR, 'missing-link.jsonl'),
    expected: join(EXPECTED_DIR, 'missing-link.verification-report.json'),
    expectedStatus: 'INCOMPLETE',
    expectedExitCode: 2
  },
  {
    name: 'reordered',
    input: join(RPX_DIR, 'reordered.jsonl'),
    expected: join(EXPECTED_DIR, 'reordered.verification-report.json'),
    expectedStatus: 'INCOMPLETE',
    expectedExitCode: 2
  },
  {
    name: 'bad-timestamp',
    input: join(RPX_DIR, 'bad-timestamp.jsonl'),
    expected: join(EXPECTED_DIR, 'bad-timestamp.verification-report.json'),
    expectedStatus: 'INCOMPLETE',
    expectedExitCode: 2
  },
  // Phase X Gate 3 / v2.1 receipt-schema vectors.
  // valid-chain-3-v2.1 mixes a v1 record (no receipt_version) with v2.1 records
  // carrying receipt_version + signing_key_id + policy_snapshot_fingerprint —
  // proves §14 rule 5 (latest verifier accepts records of older versions).
  {
    name: 'valid-chain-3-v2.1',
    input: join(RPX_DIR, 'valid-chain-3-v2.1.jsonl'),
    expected: join(EXPECTED_DIR, 'valid-chain-3-v2.1.verification-report.json'),
    expectedStatus: 'VALID',
    expectedExitCode: 0
  },
  // unknown-field-passthrough carries a forward-compatible top-level field
  // the verifier does not recognize. Proves §14 rule 1 (verifiers MUST accept
  // unknown fields and MUST hash-include them so record_hash is reproducible).
  {
    name: 'unknown-field-passthrough',
    input: join(RPX_DIR, 'unknown-field-passthrough.jsonl'),
    expected: join(EXPECTED_DIR, 'unknown-field-passthrough.verification-report.json'),
    expectedStatus: 'VALID',
    expectedExitCode: 0
  }
];

function runTest(vector) {
  console.log(`\n🧪 Testing ${vector.name}...`);
  
  const tmpDir = mkdtempSync(join(tmpdir(), 'ssi-verify-test-'));
  const tmpOutput = join(tmpDir, 'output.json');
  
  return new Promise((resolve) => {
    try {
      // Run ssi-verify using spawn for better Windows compatibility
      const proc = spawn('node', [
        CLI_PATH,
        'report',
        '--in', vector.input,
        '--out', tmpOutput
      ], {
        stdio: 'pipe',
        windowsHide: true
      });
      
      let stderr = '';
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        try {
          // Only log stderr if there's an unexpected error
          if (stderr && code !== vector.expectedExitCode) {
            console.error(`  ✗ CLI error: ${stderr.substring(0, 200)}`);
          }
          // Check exit code
          if (code !== vector.expectedExitCode) {
            console.error(`  ✗ Expected exit code ${vector.expectedExitCode}, got ${code}`);
            resolve(false);
            return;
          }
          
          // Load actual and expected reports
          const actual = JSON.parse(readFileSync(tmpOutput, 'utf-8'));
          const expected = JSON.parse(readFileSync(vector.expected, 'utf-8'));
          
          // Strict checks
          if (actual.integrity_status !== expected.integrity_status) {
            console.error(`  ✗ integrity_status: expected "${expected.integrity_status}", got "${actual.integrity_status}"`);
            resolve(false);
            return;
          }
          
          if (actual.compliance_details.compliance_level !== expected.compliance_details.compliance_level) {
            console.error(`  ✗ compliance_level: expected "${expected.compliance_details.compliance_level}", got "${actual.compliance_details.compliance_level}"`);
            resolve(false);
            return;
          }
          
          if (actual.tamper_evidence.length !== expected.tamper_evidence.length) {
            console.error(`  ✗ tamper_evidence count: expected ${expected.tamper_evidence.length}, got ${actual.tamper_evidence.length}`);
            resolve(false);
            return;
          }
          
          // Check constitutional guarantees match
          const actualGuarantees = actual.compliance_details.constitutional_guarantees;
          const expectedGuarantees = expected.compliance_details.constitutional_guarantees;
          
          for (const key of Object.keys(expectedGuarantees)) {
            if (actualGuarantees[key] !== expectedGuarantees[key]) {
              console.error(`  ✗ guarantee "${key}": expected ${expectedGuarantees[key]}, got ${actualGuarantees[key]}`);
              resolve(false);
              return;
            }
          }
          
          console.log(`  ✓ Passed - integrity_status: ${actual.integrity_status}, tamper_evidence: ${actual.tamper_evidence.length}`);
          resolve(true);
        } catch (err) {
          console.error(`  ✗ Error reading output: ${err.message}`);
          resolve(false);
        } finally {
          // Cleanup
          try {
            rmSync(tmpDir, { recursive: true, force: true });
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      });
    } catch (err) {
      console.error(`  ✗ Error running test: ${err.message}`);
      resolve(false);
    }
  });
}

async function main() {
  console.log('🔐 Running ssi-verify Golden Test Vectors\n');
  console.log('═'.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const vector of testVectors) {
    const result = await runTest(vector);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed > 0) {
    console.error('❌ Test suite FAILED');
    process.exit(1);
  } else {
    console.log('✅ All tests PASSED');
    process.exit(0);
  }
}

main();
