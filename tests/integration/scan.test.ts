import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  scan,
  loadYamlChecker,
  runAnalyzersOnSource,
  Language,
  Severity,
  Category,
} from '../../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get path to test checkers
const checkersPath = path.resolve(__dirname, '../../checkers');

describe('Sparrow Integration Tests', () => {
  describe('YAML Checker Loading', () => {
    it('should load a Python YAML checker', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'avoid_assert.yml');
      const checker = await loadYamlChecker(checkerPath);

      expect(checker).toBeDefined();
      expect(checker.analyzer.name).toBe('avoid-assert');
      expect(checker.analyzer.language).toBe(Language.Python);
      expect(checker.analyzer.category).toBe(Category.BugRisk);
      expect(checker.analyzer.severity).toBe(Severity.Info);
    });

    it('should load a Python security checker', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'flask-debug-enabled.yml');
      const checker = await loadYamlChecker(checkerPath);

      expect(checker).toBeDefined();
      expect(checker.analyzer.name).toBe('flask-debug-enabled');
      expect(checker.analyzer.language).toBe(Language.Python);
      expect(checker.analyzer.category).toBe(Category.Security);
      expect(checker.analyzer.severity).toBe(Severity.Warning);
    });
  });

  describe('Source Code Analysis', () => {
    it('should detect assert statements in Python', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'avoid_assert.yml');
      const checker = await loadYamlChecker(checkerPath);

      const source = `
def test():
    assert x == 1
    assert y != 0
`;

      const issues = await runAnalyzersOnSource(source, Language.Python, [checker.analyzer]);

      expect(issues.length).toBe(2);
      expect(issues[0].id).toBe('avoid-assert');
      expect(issues[0].category).toBe(Category.BugRisk);
    });

    it('should detect Flask debug mode enabled', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'flask-debug-enabled.yml');
      const checker = await loadYamlChecker(checkerPath);

      const source = `
from flask import Flask
app = Flask(__name__)

if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
`;

      const issues = await runAnalyzersOnSource(source, Language.Python, [checker.analyzer]);

      expect(issues.length).toBe(1);
      expect(issues[0].id).toBe('flask-debug-enabled');
      expect(issues[0].category).toBe(Category.Security);
    });

    it('should not report when no issues found', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'avoid_assert.yml');
      const checker = await loadYamlChecker(checkerPath);

      const source = `
def safe_function():
    if x != 1:
        raise ValueError("x must be 1")
`;

      const issues = await runAnalyzersOnSource(source, Language.Python, [checker.analyzer]);

      expect(issues.length).toBe(0);
    });
  });

  describe('Path Filtering', () => {
    it('should exclude test files based on pattern', async () => {
      const checkerPath = path.join(checkersPath, 'python', 'avoid_assert.yml');
      const checker = await loadYamlChecker(checkerPath);

      // The avoid_assert checker has exclude patterns for test files
      expect(checker.pathFilter).toBeDefined();
      expect(checker.pathFilter?.excludeGlobs).toContain('test/**');
      expect(checker.pathFilter?.excludeGlobs).toContain('*_test.py');
    });
  });
});
