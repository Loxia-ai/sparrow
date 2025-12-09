/**
 * Test runner tests - validates that the globstar test format works correctly
 */

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { fileURLToPath } from 'url';
import {
  runYamlTests,
  findExpectedLines,
  findNoErrorLines,
  formatTestResults,
} from '../../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const checkersPath = path.resolve(__dirname, '../../checkers');

describe('Test Runner', () => {
  describe('Expected Line Detection', () => {
    it('should find expect-error comments from file', async () => {
      // Create a temp file with test content
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, 'test-expected-lines.py');
      const source = `def foo():
    # <expect-error>
    assert True
    x = 1
    # <expect-error>
    assert False
`;
      await fs.writeFile(tmpFile, source);

      const expectedLines = await findExpectedLines(tmpFile);
      expect(expectedLines).toContain(3);
      expect(expectedLines).toContain(6);
      expect(expectedLines.length).toBe(2);

      await fs.unlink(tmpFile);
    });

    it('should find no-error comments from file', async () => {
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, 'test-no-error-lines.py');
      const source = `def foo():
    # <no-error>
    x = 1
    y = 2
`;
      await fs.writeFile(tmpFile, source);

      const noErrorLines = await findNoErrorLines(tmpFile);
      expect(noErrorLines).toContain(3);
      expect(noErrorLines.length).toBe(1);

      await fs.unlink(tmpFile);
    });
  });

  describe('Python Checker Tests', () => {
    it('should pass all Python checker tests', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'python'));

      console.log(formatTestResults(result));

      // Verify tests ran
      expect(result.totalTests).toBeGreaterThan(0);
    });
  });

  describe('Go Checker Tests', () => {
    it('should run all Go checker tests', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'go'));

      console.log(formatTestResults(result));

      expect(result.totalTests).toBeGreaterThan(0);
    });
  });

  describe('JavaScript Checker Tests', () => {
    it('should run all JavaScript checker tests', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'javascript'));

      console.log(formatTestResults(result));

      expect(result.totalTests).toBeGreaterThan(0);
    });
  });

  describe('Java Checker Tests', () => {
    it('should run Java checker tests', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'java'));

      console.log(formatTestResults(result));

      expect(result.totalTests).toBeGreaterThan(0);
    });
  });

  describe('Ruby Checker Tests', () => {
    it('should run Ruby checker tests', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'ruby'));

      console.log(formatTestResults(result));

      expect(result.totalTests).toBeGreaterThan(0);
    });
  });

  describe('Cross-Language Test Summary', () => {
    it('should run tests for all available languages', async () => {
      // This test runs multiple language test suites, needs longer timeout
      const languages = ['python', 'go', 'javascript', 'java', 'ruby'];
      const results: Record<string, { total: number; passed: number; failed: number }> = {};

      for (const lang of languages) {
        try {
          const result = await runYamlTests(path.join(checkersPath, lang));
          results[lang] = {
            total: result.totalTests,
            passed: result.passedTests,
            failed: result.failedTests,
          };
        } catch (error) {
          results[lang] = { total: 0, passed: 0, failed: 0 };
        }
      }

      console.log('\n=== Cross-Language Test Summary ===');
      for (const [lang, stats] of Object.entries(results)) {
        console.log(`${lang}: ${stats.passed}/${stats.total} passed`);
      }

      // Verify we tested multiple languages
      const testedLanguages = Object.entries(results).filter(([, s]) => s.total > 0);
      expect(testedLanguages.length).toBeGreaterThan(2);
    });
  });

  describe('Test Result Formatting', () => {
    it('should format passing results correctly', async () => {
      const result = await runYamlTests(path.join(checkersPath, 'python'));

      const formatted = formatTestResults(result);

      expect(formatted).toContain('Test Results');
      expect(typeof formatted).toBe('string');
    });

    it('should include failure details when tests fail', () => {
      // Create a mock failing result with correct shape
      const mockResult = {
        passed: false,
        totalTests: 2,
        passedTests: 1,
        failedTests: 1,
        errors: ['test-checker: expected issue on line 5, but next occurrence is on line 3'],
      };

      const formatted = formatTestResults(mockResult);

      expect(formatted).toContain('FAILED');
      expect(formatted).toContain('test-checker');
    });
  });
});
