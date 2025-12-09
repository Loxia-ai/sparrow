/**
 * Core type definitions for Sparrow static analysis
 * Compatible with globstar checker format
 */

import type { SyntaxNode, Tree, Language as TSLanguage, Query } from 'tree-sitter';

// ============================================================================
// Severity and Category Enums
// ============================================================================

/**
 * Issue severity levels - matches globstar severity
 */
export enum Severity {
  Critical = 'critical',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

/**
 * Issue category types - matches globstar categories
 */
export enum Category {
  Style = 'style',
  BugRisk = 'bug-risk',
  Antipattern = 'antipattern',
  Performance = 'performance',
  Security = 'security',
  BestPractices = 'best-practices',
  BestPractice = 'best-practice',
  ErrorProne = 'error-prone',
  Correctness = 'correctness',
}

/**
 * Validate if a string is a valid severity
 */
export function isValidSeverity(value: string): value is Severity {
  return Object.values(Severity).includes(value as Severity);
}

/**
 * Validate if a string is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return Object.values(Category).includes(value as Category);
}

// ============================================================================
// Language Enum
// ============================================================================

/**
 * Supported programming languages - matches globstar language support
 */
export enum Language {
  Unknown = 'unknown',
  Python = 'python',
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  TSX = 'tsx',
  Java = 'java',
  Ruby = 'ruby',
  Rust = 'rust',
  Go = 'go',
  Kotlin = 'kotlin',
  Scala = 'scala',
  CSharp = 'csharp',
  PHP = 'php',
  Lua = 'lua',
  Bash = 'bash',
  SQL = 'sql',
  CSS = 'css',
  HTML = 'html',
  Dockerfile = 'dockerfile',
  YAML = 'yaml',
  Markdown = 'markdown',
  HCL = 'hcl',
  Elixir = 'elixir',
  Elm = 'elm',
  Groovy = 'groovy',
  OCaml = 'ocaml',
  Swift = 'swift',
}

// ============================================================================
// Parse Result
// ============================================================================

/**
 * Result of parsing a source file
 */
export interface ParseResult {
  /** The root AST node from tree-sitter */
  ast: SyntaxNode;
  /** The full tree-sitter tree */
  tree: Tree;
  /** The raw source code */
  source: Buffer;
  /** Path to the parsed file */
  filePath: string;
  /** Tree-sitter language used */
  tsLanguage: TSLanguage;
  /** Detected language */
  language: Language;
}

// ============================================================================
// Issue Types
// ============================================================================

/**
 * Location within a file
 */
export interface Location {
  row: number;    // 1-indexed line number
  column: number; // 0-indexed column
}

/**
 * Position range within a file
 */
export interface Position {
  filename: string;
  start: Location;
  end: Location;
}

/**
 * Represents a detected issue
 */
export interface Issue {
  /** Issue category */
  category: Category;
  /** Issue severity */
  severity: Severity;
  /** Human-readable message */
  message: string;
  /** File path where issue was found */
  filepath: string;
  /** AST node that triggered the issue (may be undefined for deserialized issues) */
  node?: SyntaxNode;
  /** Unique identifier for the checker that raised this issue */
  id: string;
  /** Position information */
  range: Position;
}

/**
 * JSON representation of an issue (for serialization)
 */
export interface IssueJson {
  category: Category;
  severity: Severity;
  message: string;
  range: Position;
  id: string;
}

// ============================================================================
// Analyzer Types
// ============================================================================

/**
 * An analyzer that can check code for issues
 */
export interface Analyzer {
  /** Unique name/identifier for the analyzer */
  name: string;
  /** Human-readable description */
  description: string;
  /** Issue category this analyzer produces */
  category: Category;
  /** Default severity of issues */
  severity: Severity;
  /** Target language */
  language: Language;
  /** Other analyzers this one depends on */
  requires?: Analyzer[];
  /** The analyzer function */
  run: (pass: Pass) => Promise<AnalyzerResult> | AnalyzerResult;
}

/**
 * Result from running an analyzer
 */
export type AnalyzerResult = unknown;

/**
 * Execution context passed to analyzers
 */
export interface Pass {
  /** The analyzer being run */
  analyzer: Analyzer;
  /** Currently analyzed file */
  fileContext: ParseResult;
  /** All parsed files of this language */
  files: ParseResult[];
  /** Results from required analyzers */
  resultOf: Map<Analyzer, AnalyzerResult>;
  /** Function to report an issue */
  report: (node: SyntaxNode, message: string) => void;
  /** Cache of results across files */
  resultCache: Map<Analyzer, Map<ParseResult, AnalyzerResult>>;
}

// ============================================================================
// YAML Checker Types
// ============================================================================

/**
 * Filter for restricting pattern matches
 */
export interface NodeFilter {
  query: Query;
  shouldMatch: boolean;
}

/**
 * Glob-based path filter
 */
export interface PathFilter {
  excludeGlobs: string[];
  includeGlobs: string[];
}

/**
 * Raw YAML checker definition (as read from file)
 */
export interface YamlCheckerDefinition {
  language: string;
  name: string;
  message: string;
  category: string;
  severity: string;
  pattern?: string;
  patterns?: string[];
  description?: string;
  exclude?: string[];
  include?: string[];
  filters?: Array<{
    'pattern-inside'?: string;
    'pattern-not-inside'?: string;
  }>;
  path_filter?: {
    exclude?: string[];
    include?: string[];
  };
}

/**
 * Compiled YAML analyzer
 */
export interface YamlAnalyzer {
  /** The base analyzer */
  analyzer: Analyzer;
  /** Compiled tree-sitter queries */
  patterns: Query[];
  /** Node filters for pattern-inside/pattern-not-inside */
  nodeFilters: NodeFilter[];
  /** Path filters */
  pathFilter: PathFilter | null;
  /** Message template */
  message: string;
}

// ============================================================================
// Skip Comment Types
// ============================================================================

/**
 * Represents a skipcq comment in the source
 */
export interface SkipComment {
  /** Line number of the skipcq comment (0-indexed) */
  commentLine: number;
  /** Full text of the comment */
  commentText: string;
  /** Specific checker IDs to skip, empty means skip all */
  checkerIds: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for when analysis should fail
 */
export interface FailureConfig {
  exitCode: number;
  severityIn: Severity[];
  categoryIn: Category[];
}

/**
 * Main configuration options
 */
export interface Config {
  /** Directory containing custom checkers */
  checkerDir: string;
  /** Whitelist of checkers to run */
  enabledCheckers: string[];
  /** Blacklist of checkers to skip */
  disabledCheckers: string[];
  /** Directories to analyze */
  targetDirs: string[];
  /** Glob patterns to exclude */
  excludePatterns: string[];
  /** When to fail the analysis */
  failWhen: FailureConfig;
}

// ============================================================================
// Test Runner Types
// ============================================================================

/**
 * A YAML test case
 */
export interface YamlTestCase {
  yamlCheckerPath: string;
  testFile: string;
}

/**
 * Result of running tests
 */
export interface TestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errors: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Options for running analysis
 */
export interface AnalysisOptions {
  /** Path to analyze */
  path: string;
  /** Analyzers to run */
  analyzers: Analyzer[];
  /** Optional file filter function */
  fileFilter?: (path: string) => boolean;
  /** Patterns to exclude */
  excludePatterns?: string[];
}

/**
 * Default directories to ignore during analysis
 */
export const DEFAULT_IGNORE_DIRS = [
  'checkers',
  'node_modules',
  'vendor',
  'dist',
  'build',
  'out',
  '.git',
  '.svn',
  'venv',
  '__pycache__',
  '.idea',
  '.vitepress',
];
