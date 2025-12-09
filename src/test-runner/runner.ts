/**
 * Test runner for YAML checkers
 * Compatible with globstar test format (<expect-error>, <no-error>)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { YamlTestCase, TestResult, Analyzer } from '../analysis/types.js';
import { loadYamlChecker } from '../analysis/yaml-checker.js';
import { runAnalyzers } from '../analysis/analyzer.js';
import { getExtensionFromLanguage } from '../analysis/language.js';

// ============================================================================
// Test Case Discovery
// ============================================================================

/**
 * Find YAML test cases in a directory
 */
export async function findYamlTestFiles(testDir: string): Promise<YamlTestCase[]> {
  const testCases: YamlTestCase[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const isYamlFile = ext === '.yml' || ext === '.yaml';

        if (!isYamlFile) continue;

        // Skip if it's a test file or config file
        if (entry.name.includes('.test.') || entry.name.startsWith('.')) continue;

        try {
          const checker = await loadYamlChecker(fullPath);
          const language = checker.analyzer.language;
          const langExt = getExtensionFromLanguage(language);

          // Look for corresponding test file
          const baseName = entry.name.replace(/\.(yml|yaml)$/, '');
          const testFileName = `${baseName}.test${langExt}`;
          const testFilePath = path.join(dir, testFileName);

          let testFile = '';
          try {
            await fs.access(testFilePath);
            testFile = testFilePath;
          } catch {
            // Test file doesn't exist
          }

          testCases.push({
            yamlCheckerPath: fullPath,
            testFile,
          });
        } catch {
          // Invalid checker, skip
        }
      }
    }
  }

  await walk(testDir);
  return testCases;
}

// ============================================================================
// Expected Issue Parsing
// ============================================================================

/**
 * Find expected issue lines from a test file
 * Looks for <expect-error> and <expect error> comments
 */
export async function findExpectedLines(filePath: string): Promise<number[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const expectedLines: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('<expect-error>') || line.includes('<expect error>')) {
      // The expected issue is on the next line (1-indexed)
      expectedLines.push(i + 2);
    }
  }

  return expectedLines;
}

/**
 * Find no-error markers (lines where issues should NOT appear)
 */
export async function findNoErrorLines(filePath: string): Promise<number[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const noErrorLines: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('<no-error>') || line.includes('<no error>')) {
      // The no-error marker indicates the next line should NOT have issues
      noErrorLines.push(i + 2);
    }
  }

  return noErrorLines;
}

// ============================================================================
// Test Execution
// ============================================================================

/**
 * Run tests for YAML checkers in a directory
 */
export async function runYamlTests(testDir: string): Promise<TestResult> {
  const result: TestResult = {
    passed: true,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [],
  };

  const tests = await findYamlTestFiles(testDir);

  if (tests.length === 0) {
    result.errors.push('No test files found');
    result.passed = false;
    return result;
  }

  for (const test of tests) {
    result.totalTests++;

    if (!test.testFile) {
      console.error(`No test file found for checker '${path.basename(test.yamlCheckerPath)}'`);
      continue;
    }

    console.error(`Running test case: ${path.basename(test.yamlCheckerPath)}`);

    try {
      const testResult = await runSingleYamlTest(test);

      if (testResult.passed) {
        result.passedTests++;
      } else {
        result.failedTests++;
        result.passed = false;
        result.errors.push(...testResult.errors);
      }
    } catch (error) {
      result.failedTests++;
      result.passed = false;
      result.errors.push(`Error running test ${test.yamlCheckerPath}: ${error}`);
    }
  }

  return result;
}

/**
 * Run a single YAML test case
 */
async function runSingleYamlTest(test: YamlTestCase): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Load the checker
  const checker = await loadYamlChecker(test.yamlCheckerPath);

  // Get expected issue lines
  const expectedLines = await findExpectedLines(test.testFile);

  // Run the analyzer
  const issues = await runAnalyzers({
    path: test.testFile,
    analyzers: [checker.analyzer],
  });

  // Get actual issue lines
  const actualLines = issues.map((issue) => issue.range.start.row).sort((a, b) => a - b);

  // Sort expected lines
  const sortedExpected = [...expectedLines].sort((a, b) => a - b);

  // Compare
  if (sortedExpected.length !== actualLines.length) {
    const testName = path.basename(test.yamlCheckerPath);
    errors.push(
      `(${testName}): expected issues on lines: [${sortedExpected.join(', ')}], ` +
        `but issues were raised on lines: [${actualLines.join(', ')}]`
    );
  } else {
    for (let i = 0; i < sortedExpected.length; i++) {
      if (sortedExpected[i] !== actualLines[i]) {
        const testName = path.basename(test.yamlCheckerPath);
        errors.push(
          `(${testName}): expected issue on line ${sortedExpected[i]}, ` +
            `but next occurrence is on line ${actualLines[i]}`
        );
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Analyzer Tests
// ============================================================================

/**
 * Run tests for Go-style (custom JS) analyzers
 */
export async function runAnalyzerTests(
  testDir: string,
  analyzers: Analyzer[]
): Promise<{ diff: string; log: string; passed: boolean }> {
  let log = '';
  let diff = '';
  let passed = true;

  // Map to track issues per analyzer
  const analyzerIssueMap = new Map<string, number>();
  for (const analyzer of analyzers) {
    analyzerIssueMap.set(analyzer.name, 0);
  }

  // Get likely test files based on analyzer names and languages
  const likelyTestFiles: string[] = [];
  for (const analyzer of analyzers) {
    const ext = getExtensionFromLanguage(analyzer.language);
    likelyTestFiles.push(`${analyzer.name}.test${ext}`);
  }

  // File filter to only include relevant test files
  const fileFilter = (filePath: string): boolean => {
    const fileName = path.basename(filePath);
    return likelyTestFiles.some((testFile) => fileName.endsWith(testFile));
  };

  // Get expected issues from test files
  const expectedIssues = new Map<string, Map<number, string[]>>();

  async function collectExpectedIssues(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await collectExpectedIssues(fullPath);
      } else if (entry.isFile() && fileFilter(fullPath)) {
        const lines = await findExpectedLines(fullPath);
        const lineMap = new Map<number, string[]>();

        for (const line of lines) {
          lineMap.set(line, ['']); // Empty message means any message is acceptable
        }

        expectedIssues.set(fullPath, lineMap);
      }
    }
  }

  await collectExpectedIssues(testDir);

  // Run analyzers on test files
  const raisedIssues = await runAnalyzers({
    path: testDir,
    analyzers,
    fileFilter,
  });

  // Build raised issues map
  const raisedIssuesMap = new Map<string, Map<number, string[]>>();

  for (const issue of raisedIssues) {
    const count = analyzerIssueMap.get(issue.id) ?? 0;
    analyzerIssueMap.set(issue.id, count + 1);

    if (!raisedIssuesMap.has(issue.filepath)) {
      raisedIssuesMap.set(issue.filepath, new Map());
    }

    const line = issue.range.start.row;
    const fileMap = raisedIssuesMap.get(issue.filepath)!;

    if (!fileMap.has(line)) {
      fileMap.set(line, []);
    }

    fileMap.get(line)!.push(`${issue.id}: ${issue.message}`);
  }

  // Log analyzer status
  for (const [analyzerId, issueCount] of analyzerIssueMap) {
    if (issueCount === 0) {
      log += `  No tests found for analyzer ${analyzerId}\n`;
      passed = false;
    } else {
      log += `  Running tests for analyzer ${analyzerId}\n`;
    }
  }

  // Verify issues
  diff = verifyIssues(expectedIssues, raisedIssuesMap);
  if (diff) {
    passed = false;
  }

  return { diff, log, passed };
}

/**
 * Compare expected vs raised issues
 */
function verifyIssues(
  expected: Map<string, Map<number, string[]>>,
  raised: Map<string, Map<number, string[]>>
): string {
  const diffParts: string[] = [];

  // Compare files
  for (const [filePath, expectedFileIssues] of expected) {
    const raisedFileIssues = raised.get(filePath);

    if (!raisedFileIssues) {
      diffParts.push(`\nFile: ${filePath}`);
      diffParts.push('  Expected issues but found none');
      continue;
    }

    // Compare line numbers
    for (const [line, expectedMessages] of expectedFileIssues) {
      const raisedMessages = raisedFileIssues.get(line);

      if (!raisedMessages) {
        diffParts.push(`\nFile: ${filePath}, Line: ${line}`);
        diffParts.push('  Expected:');
        for (const msg of expectedMessages) {
          diffParts.push(`    - ${msg || '(any)'}`);
        }
        diffParts.push('  Got: no issues');
        continue;
      }

      // Check if message counts match
      if (expectedMessages.length !== raisedMessages.length) {
        diffParts.push(`\nFile: ${filePath}, Line: ${line}`);
        diffParts.push('  Expected:');
        for (const msg of expectedMessages) {
          diffParts.push(`    - ${msg || '(any)'}`);
        }
        diffParts.push('  Got:');
        for (const msg of raisedMessages) {
          diffParts.push(`    - ${msg}`);
        }
      }
    }

    // Check for unexpected issues
    for (const [line, raisedMessages] of raisedFileIssues) {
      if (!expectedFileIssues.has(line)) {
        diffParts.push(`\nFile: ${filePath}, Line: ${line}`);
        diffParts.push('  Expected: no issues');
        diffParts.push('  Got:');
        for (const msg of raisedMessages) {
          diffParts.push(`    - ${msg}`);
        }
      }
    }
  }

  // Check for issues in unexpected files
  for (const [filePath, raisedFileIssues] of raised) {
    if (!expected.has(filePath)) {
      diffParts.push(`\nUnexpected file with issues: ${filePath}`);
      for (const [line, messages] of raisedFileIssues) {
        diffParts.push(`  Line ${line}:`);
        for (const msg of messages) {
          diffParts.push(`    - ${msg}`);
        }
      }
    }
  }

  return diffParts.join('\n');
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Format test results for output
 */
export function formatTestResults(result: TestResult): string {
  const lines: string[] = [];

  lines.push(`\nTest Results:`);
  lines.push(`  Total: ${result.totalTests}`);
  lines.push(`  Passed: ${result.passedTests}`);
  lines.push(`  Failed: ${result.failedTests}`);

  if (result.errors.length > 0) {
    lines.push(`\nErrors:`);
    for (const error of result.errors) {
      lines.push(`  - ${error}`);
    }
  }

  lines.push(`\n${result.passed ? 'PASSED' : 'FAILED'}`);

  return lines.join('\n');
}
