/**
 * Sparrow - Globstar-compatible static analysis tool for Node.js
 *
 * A backward-compatible reimplementation of the MIT-licensed Globstar.dev SAST tool.
 * Original Globstar: https://github.com/DeepSourceCorp/globstar
 *
 * Main entry point and public API
 *
 * @license MIT
 */

// ============================================================================
// Type Exports
// ============================================================================

export {
  // Enums
  Severity,
  Category,
  Language,

  // Core types
  Issue,
  IssueJson,
  Analyzer,
  Pass,
  ParseResult,
  YamlAnalyzer,
  YamlCheckerDefinition,
  Config,
  FailureConfig,
  TestResult,
  SkipComment,

  // Validation functions
  isValidSeverity,
  isValidCategory,

  // Constants
  DEFAULT_IGNORE_DIRS,
} from './analysis/types.js';

// ============================================================================
// Language Utilities
// ============================================================================

export {
  decodeLanguage,
  getLanguageFromPath,
  getExtensionFromLanguage,
  getCommentIdentifier,
  getCommentPrefix,
  ensureGrammarLoaded,
  preloadGrammars,
} from './analysis/language.js';

// ============================================================================
// Parsing
// ============================================================================

export {
  parseFile,
  parseSource,
  tryParseFile,
  canParseFile,
  UnsupportedLanguageError,
  ParseError,

  // Tree utilities
  walkTree,
  walkTreeWithCallbacks,
  childrenWithFieldName,
  childWithFieldName,
  childrenOfType,
  firstChildOfType,
  findMatchingChild,
  findAllNodes,
  getNodeText,
} from './analysis/parser.js';

// ============================================================================
// YAML Checkers
// ============================================================================

export {
  loadYamlChecker,
  parseYamlChecker,
  compileYamlChecker,
  loadYamlCheckers,
  getAnalyzersFromYaml,
  YamlCheckerError,
} from './analysis/yaml-checker.js';

// ============================================================================
// Issue Handling
// ============================================================================

export {
  createIssue,
  createIssueFromPosition,
  issueToJson,
  issueAsJson,
  issueAsText,
  issueFromJson,
  reportIssues,
  reportIssuesAsJson,
  reportIssuesAsText,
  filterBySeverity,
  filterByCategory,
  filterByCheckerId,
  excludeByCheckerId,
  sortIssues,
  deduplicateIssues,
} from './analysis/issue.js';

// ============================================================================
// Skip Comments
// ============================================================================

export {
  gatherSkipInfo,
  shouldSkipIssue,
  filterSkippedIssues,
  hasSkipcqComment,
  parseSkipcqComment,
  createSkipcqComment,
} from './analysis/skip-comments.js';

// ============================================================================
// Analysis Engine
// ============================================================================

export { runAnalyzers, runAnalyzersOnFile, runAnalyzersOnSource, preorder } from './analysis/analyzer.js';

// ============================================================================
// Configuration
// ============================================================================

export {
  loadConfig,
  loadConfigFromDir,
  createDefaultConfig,
  validateConfig,
  shouldExcludePath,
  shouldRunChecker,
  addExcludePatterns,
  mergeConfigs,
  shouldFail,
  getExitCode,
} from './config/config.js';

// ============================================================================
// Checker Loading
// ============================================================================

export {
  loadBuiltinYamlCheckers,
  loadCustomYamlCheckers,
  loadAllCheckers,
  loadCheckersForLanguage,
  initializeRegistry,
  getRegistry,
  getAnalyzerByName,
  getAllAnalyzers,
  getAnalyzersByLanguage,
} from './checkers/loader.js';

// ============================================================================
// Test Runner
// ============================================================================

export {
  runYamlTests,
  runAnalyzerTests,
  findYamlTestFiles,
  findExpectedLines,
  findNoErrorLines,
  formatTestResults,
} from './test-runner/runner.js';

// ============================================================================
// High-Level API
// ============================================================================

import { Issue, Analyzer, Config, TestResult, Language } from './analysis/types.js';
import { runAnalyzers as runAnalyzersInternal } from './analysis/analyzer.js';
import { loadConfigFromDir, shouldRunChecker } from './config/config.js';
import { loadBuiltinYamlCheckers, loadCustomYamlCheckers, initializeRegistry } from './checkers/loader.js';
import { getAnalyzersFromYaml } from './analysis/yaml-checker.js';
import { runYamlTests as runYamlTestsInternal } from './test-runner/runner.js';
import { reportIssues as reportIssuesInternal } from './analysis/issue.js';

/**
 * Options for the scan function
 */
export interface ScanOptions {
  /** Directory containing custom checkers (default: .globstar or .sparrow) */
  checkerDir?: string;
  /** Path to configuration file */
  configPath?: string;
  /** Use built-in checkers (default: true) */
  useBuiltinCheckers?: boolean;
  /** Specific checkers to enable (overrides config) */
  enabledCheckers?: string[];
  /** Specific checkers to disable (overrides config) */
  disabledCheckers?: string[];
  /** Additional exclude patterns */
  excludePatterns?: string[];
  /** Specific languages to analyze */
  languages?: Language[];
  /** Output format */
  outputFormat?: 'json' | 'text';
}

/**
 * Scan a path for issues using configured checkers
 */
export async function scan(targetPath: string, options: ScanOptions = {}): Promise<Issue[]> {
  const {
    checkerDir,
    configPath,
    useBuiltinCheckers = true,
    enabledCheckers,
    disabledCheckers,
    excludePatterns,
    languages,
  } = options;

  // Load configuration
  let config: Config;
  if (configPath) {
    const { loadConfig } = await import('./config/config.js');
    config = await loadConfig(configPath);
  } else {
    config = await loadConfigFromDir(targetPath);
  }

  // Override config with options
  if (enabledCheckers) {
    config.enabledCheckers = enabledCheckers;
  }
  if (disabledCheckers) {
    config.disabledCheckers = disabledCheckers;
  }
  if (excludePatterns) {
    config.excludePatterns = [...config.excludePatterns, ...excludePatterns];
  }

  // Load checkers
  const analyzers: Analyzer[] = [];

  if (useBuiltinCheckers) {
    const builtinCheckers = await loadBuiltinYamlCheckers();
    analyzers.push(...getAnalyzersFromYaml(builtinCheckers));
  }

  // Load custom checkers
  const customDir = checkerDir ?? config.checkerDir;
  const customCheckers = await loadCustomYamlCheckers(customDir);
  analyzers.push(...getAnalyzersFromYaml(customCheckers));

  // Filter analyzers based on config
  const filteredAnalyzers = analyzers.filter((a) => {
    // Check language filter
    if (languages && !languages.includes(a.language)) {
      return false;
    }
    // Check enabled/disabled
    return shouldRunChecker(a.name, config);
  });

  // Run analysis
  const issues = await runAnalyzersInternal({
    path: targetPath,
    analyzers: filteredAnalyzers,
    excludePatterns: config.excludePatterns,
  });

  return issues;
}

/**
 * Format scan results for output
 */
export function formatResults(issues: Issue[], format: 'json' | 'text' = 'text'): string {
  return reportIssuesInternal(issues, format);
}

/**
 * Run checker tests in a directory
 */
export async function runTests(testDir: string): Promise<TestResult> {
  return runYamlTestsInternal(testDir);
}

/**
 * Initialize Sparrow with a checker directory
 */
export async function initialize(options: { checkerDir?: string } = {}): Promise<void> {
  await initializeRegistry(options.checkerDir);
}

/**
 * Quick scan with default settings
 */
export async function quickScan(targetPath: string): Promise<Issue[]> {
  return scan(targetPath, { useBuiltinCheckers: true });
}

// ============================================================================
// Version
// ============================================================================

export const VERSION = '1.0.0';
