/**
 * Core analyzer execution engine
 * Runs analyzers on source files and collects issues
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { SyntaxNode } from 'tree-sitter';
import {
  Analyzer,
  Pass,
  ParseResult,
  Issue,
  Language,
  SkipComment,
  DEFAULT_IGNORE_DIRS,
  AnalysisOptions,
} from './types.js';
import { tryParseFile } from './parser.js';
import { createIssue } from './issue.js';
import { gatherSkipInfo, shouldSkipIssue } from './skip-comments.js';

// ============================================================================
// Analyzer Dependency Resolution
// ============================================================================

/**
 * Find all analyzers including dependencies (flattened)
 */
function findAnalyzers(analyzer: Analyzer): Analyzer[] {
  const analyzers: Analyzer[] = [];

  if (analyzer.requires) {
    for (const req of analyzer.requires) {
      analyzers.push(...findAnalyzers(req));
    }
  }

  analyzers.push(analyzer);
  return analyzers;
}

/**
 * Get all analyzers with their dependencies resolved
 */
function resolveAnalyzerDependencies(analyzers: Analyzer[]): Map<Language, Analyzer[]> {
  const langAnalyzerMap = new Map<Language, Analyzer[]>();

  for (const analyzer of analyzers) {
    const resolved = findAnalyzers(analyzer);
    const existing = langAnalyzerMap.get(analyzer.language) ?? [];
    langAnalyzerMap.set(analyzer.language, [...existing, ...resolved]);
  }

  return langAnalyzerMap;
}

// ============================================================================
// File Walking
// ============================================================================

/**
 * Check if a directory should be ignored
 */
function shouldIgnoreDir(dirName: string, ignoreDirs: string[] = DEFAULT_IGNORE_DIRS): boolean {
  return ignoreDirs.includes(dirName);
}

/**
 * Walk a directory and collect parseable files
 */
async function walkDirectory(
  rootPath: string,
  fileFilter?: (path: string) => boolean,
  ignoreDirs: string[] = DEFAULT_IGNORE_DIRS
): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!shouldIgnoreDir(entry.name, ignoreDirs)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (!fileFilter || fileFilter(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  }

  const stat = await fs.stat(rootPath);
  if (stat.isFile()) {
    if (!fileFilter || fileFilter(rootPath)) {
      files.push(rootPath);
    }
  } else {
    await walk(rootPath);
  }

  return files;
}

// ============================================================================
// Analysis Execution
// ============================================================================

/**
 * Run analyzers on a path (file or directory)
 */
export async function runAnalyzers(options: AnalysisOptions): Promise<Issue[]> {
  const { path: targetPath, analyzers, fileFilter, excludePatterns } = options;
  const raisedIssues: Issue[] = [];

  // Build ignore list
  const ignoreDirs = [...DEFAULT_IGNORE_DIRS];
  if (excludePatterns) {
    // Add simple directory patterns to ignore list
    for (const pattern of excludePatterns) {
      if (!pattern.includes('*') && !pattern.includes('/')) {
        ignoreDirs.push(pattern);
      }
    }
  }

  // Group analyzers by language
  const langAnalyzerMap = resolveAnalyzerDependencies(analyzers);

  // Collect parsed files by language
  const trees = new Map<Language, ParseResult[]>();
  const fileSkipInfo = new Map<string, SkipComment[]>();

  // Walk directory and parse files
  const filePaths = await walkDirectory(targetPath, fileFilter, ignoreDirs);

  for (const filePath of filePaths) {
    const parsed = await tryParseFile(filePath);
    if (!parsed) continue;

    // Gather skip comments for this file
    fileSkipInfo.set(parsed.filePath, await gatherSkipInfo(parsed));

    // Add to language-specific collection
    const existing = trees.get(parsed.language) ?? [];
    trees.set(parsed.language, [...existing, parsed]);
  }

  // Report function for collecting issues
  const createReportFunc = (pass: Pass) => {
    return (node: SyntaxNode, message: string) => {
      const issue = createIssue(
        node,
        message,
        pass.fileContext.filePath,
        pass.analyzer.name,
        pass.analyzer.category,
        pass.analyzer.severity
      );

      // Check if this issue should be skipped
      const skipLines = fileSkipInfo.get(pass.fileContext.filePath) ?? [];
      if (!shouldSkipIssue(issue, skipLines)) {
        raisedIssues.push(issue);
      }
    };
  };

  // Run analyzers for each language
  for (const [lang, languageAnalyzers] of langAnalyzerMap) {
    const files = trees.get(lang) ?? [];
    if (files.length === 0) continue;

    // Create pass context
    const pass: Pass = {
      analyzer: languageAnalyzers[0], // Will be updated per analyzer
      fileContext: files[0], // Will be updated per file
      files,
      resultOf: new Map(),
      report: () => {}, // Will be updated per pass
      resultCache: new Map(),
    };

    // Run each analyzer on each file
    for (const file of files) {
      pass.fileContext = file;

      for (const analyzer of languageAnalyzers) {
        pass.analyzer = analyzer;
        pass.report = createReportFunc(pass);

        try {
          const result = await analyzer.run(pass);

          // Cache the result
          pass.resultOf.set(analyzer, result);
          if (!pass.resultCache.has(analyzer)) {
            pass.resultCache.set(analyzer, new Map());
          }
          pass.resultCache.get(analyzer)!.set(file, result);
        } catch (error) {
          console.error(`Error running analyzer ${analyzer.name}:`, error);
        }
      }
    }
  }

  return raisedIssues;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Run analyzers on a single file
 */
export async function runAnalyzersOnFile(
  filePath: string,
  analyzers: Analyzer[]
): Promise<Issue[]> {
  return runAnalyzers({
    path: filePath,
    analyzers,
  });
}

/**
 * Run analyzers on source code directly
 */
export async function runAnalyzersOnSource(
  source: string,
  language: Language,
  analyzers: Analyzer[],
  filePath: string = '<anonymous>'
): Promise<Issue[]> {
  const { parseSource } = await import('./parser.js');
  const parsed = await parseSource(Buffer.from(source), language, filePath);

  const raisedIssues: Issue[] = [];
  const skipInfo = await gatherSkipInfo(parsed);

  // Filter analyzers for this language
  const relevantAnalyzers = analyzers.filter((a) => a.language === language);

  const pass: Pass = {
    analyzer: relevantAnalyzers[0],
    fileContext: parsed,
    files: [parsed],
    resultOf: new Map(),
    report: () => {},
    resultCache: new Map(),
  };

  const createReportFunc = (currentPass: Pass) => {
    return (node: SyntaxNode, message: string) => {
      const issue = createIssue(
        node,
        message,
        currentPass.fileContext.filePath,
        currentPass.analyzer.name,
        currentPass.analyzer.category,
        currentPass.analyzer.severity
      );

      if (!shouldSkipIssue(issue, skipInfo)) {
        raisedIssues.push(issue);
      }
    };
  };

  for (const analyzer of relevantAnalyzers) {
    pass.analyzer = analyzer;
    pass.report = createReportFunc(pass);

    try {
      const result = await analyzer.run(pass);
      pass.resultOf.set(analyzer, result);
    } catch (error) {
      console.error(`Error running analyzer ${analyzer.name}:`, error);
    }
  }

  return raisedIssues;
}

// ============================================================================
// Pre-order Traversal Helper
// ============================================================================

/**
 * Pre-order traversal of the AST (for use in custom analyzers)
 */
export function preorder(pass: Pass, fn: (node: SyntaxNode) => void): void {
  function walkTree(node: SyntaxNode): void {
    fn(node);
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        walkTree(child);
      }
    }
  }

  walkTree(pass.fileContext.ast);
}
