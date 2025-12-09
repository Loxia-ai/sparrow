/**
 * YAML checker loading and parsing
 * Compatible with globstar YAML checker format
 */

import * as yaml from 'js-yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import { minimatch } from 'minimatch';
import Parser from 'tree-sitter';
import type { SyntaxNode } from 'tree-sitter';
import {
  Language,
  Category,
  Severity,
  Analyzer,
  YamlCheckerDefinition,
  YamlAnalyzer,
  NodeFilter,
  PathFilter,
  Pass,
  isValidSeverity,
  isValidCategory,
} from './types.js';
import { decodeLanguage, ensureGrammarLoaded } from './language.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Key used for filter pattern captures
 * This is appended to patterns in pattern-inside/pattern-not-inside filters
 */
const FILTER_PATTERN_KEY = '__filter__key__';

// ============================================================================
// Error Types
// ============================================================================

export class YamlCheckerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YamlCheckerError';
  }
}

// ============================================================================
// YAML Checker Loading
// ============================================================================

/**
 * Load a YAML checker from a file
 */
export async function loadYamlChecker(filePath: string): Promise<YamlAnalyzer> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseYamlChecker(content);
}

/**
 * Parse a YAML checker from string content
 */
export async function parseYamlChecker(content: string): Promise<YamlAnalyzer> {
  const definition = yaml.load(content) as YamlCheckerDefinition;
  return compileYamlChecker(definition);
}

/**
 * Compile a YAML checker definition into an executable analyzer
 */
export async function compileYamlChecker(definition: YamlCheckerDefinition): Promise<YamlAnalyzer> {
  // Validate required fields
  const { language: langStr, name, message, category: catStr, severity: sevStr } = definition;

  const language = decodeLanguage(langStr);
  if (language === Language.Unknown) {
    throw new YamlCheckerError(`Unknown language: ${langStr}`);
  }

  if (!name || !message) {
    throw new YamlCheckerError('Missing required field: name or message');
  }

  // Validate category and severity
  const category = catStr as Category;
  const severity = sevStr as Severity;

  if (!isValidCategory(catStr)) {
    throw new YamlCheckerError(`Invalid category: ${catStr}`);
  }

  if (!isValidSeverity(sevStr)) {
    throw new YamlCheckerError(`Invalid severity: ${sevStr}`);
  }

  // Load the grammar
  const grammar = await ensureGrammarLoaded(language);
  if (!grammar) {
    throw new YamlCheckerError(`Grammar not available for language: ${langStr}`);
  }

  // Store patterns as strings (we'll compile them at runtime)
  const patternStrings: string[] = [];

  if (definition.pattern) {
    patternStrings.push(definition.pattern);
  } else if (definition.patterns && definition.patterns.length > 0) {
    patternStrings.push(...definition.patterns);
  } else {
    throw new YamlCheckerError(`No pattern provided in checker '${name}'`);
  }

  if (definition.pattern && definition.patterns && definition.patterns.length > 0) {
    throw new YamlCheckerError("Only one of 'pattern' or 'patterns' can be provided");
  }

  // Store filter patterns as strings
  const filterPatterns: Array<{ pattern: string; shouldMatch: boolean }> = [];

  if (definition.filters) {
    for (const filter of definition.filters) {
      if (filter['pattern-inside']) {
        filterPatterns.push({
          pattern: `${filter['pattern-inside']} @${FILTER_PATTERN_KEY}`,
          shouldMatch: true,
        });
      }

      if (filter['pattern-not-inside']) {
        filterPatterns.push({
          pattern: `${filter['pattern-not-inside']} @${FILTER_PATTERN_KEY}`,
          shouldMatch: false,
        });
      }
    }
  }

  // Compile path filters
  let pathFilter: PathFilter | null = null;

  if (definition.exclude || definition.include) {
    pathFilter = {
      excludeGlobs: definition.exclude ?? [],
      includeGlobs: definition.include ?? [],
    };
  }

  if (definition.path_filter) {
    pathFilter = {
      excludeGlobs: definition.path_filter.exclude ?? [],
      includeGlobs: definition.path_filter.include ?? [],
    };
  }

  // Create the analyzer
  const analyzer: Analyzer = {
    name,
    description: definition.description ?? '',
    category,
    severity,
    language,
    run: createYamlAnalyzerRun({
      patternStrings,
      filterPatterns,
      pathFilter,
      message,
      name,
      language,
    }),
  };

  // Note: We don't actually compile the queries here since we need the grammar at runtime
  // The patterns are compiled lazily in the run function
  return {
    analyzer,
    patterns: [], // Compiled at runtime
    nodeFilters: [], // Compiled at runtime
    pathFilter,
    message,
  };
}

// ============================================================================
// YAML Analyzer Execution
// ============================================================================

interface YamlAnalyzerConfig {
  patternStrings: string[];
  filterPatterns: Array<{ pattern: string; shouldMatch: boolean }>;
  pathFilter: PathFilter | null;
  message: string;
  name: string;
  language: Language;
}

/**
 * Create the run function for a YAML analyzer
 */
function createYamlAnalyzerRun(config: YamlAnalyzerConfig): (pass: Pass) => Promise<void> {
  // Cache for compiled queries
  let compiledPatterns: Parser.Query[] | null = null;
  let compiledFilters: NodeFilter[] | null = null;

  return async (pass: Pass): Promise<void> => {
    const { patternStrings, filterPatterns, pathFilter, message, name, language } = config;
    const { fileContext } = pass;

    // Check path filters
    if (pathFilter && !shouldIncludePath(fileContext.filePath, pathFilter)) {
      return;
    }

    // Get the grammar
    const grammar = await ensureGrammarLoaded(language);
    if (!grammar) {
      return;
    }

    // Compile patterns lazily
    if (!compiledPatterns) {
      compiledPatterns = [];
      for (const patternStr of patternStrings) {
        try {
          const query = new Parser.Query(grammar as Parser.Language, patternStr);
          compiledPatterns.push(query);
        } catch (error) {
          console.error(`Failed to compile pattern: ${patternStr}`, error);
        }
      }
    }

    // Compile filters lazily
    if (!compiledFilters) {
      compiledFilters = [];
      for (const filterDef of filterPatterns) {
        try {
          const query = new Parser.Query(grammar as Parser.Language, filterDef.pattern);
          compiledFilters.push({ query, shouldMatch: filterDef.shouldMatch });
        } catch (error) {
          console.error(`Failed to compile filter: ${filterDef.pattern}`, error);
        }
      }
    }

    // Run each pattern
    for (const query of compiledPatterns) {
      const matches = query.matches(fileContext.ast);

      for (const match of matches) {
        for (const capture of match.captures) {
          // Only report if capture name matches the checker name
          if (capture.name === name) {
            // Check node filters (pattern-inside, pattern-not-inside)
            if (runParentFilters(fileContext.source, capture.node, compiledFilters)) {
              // Interpolate message with capture values
              const interpolatedMessage = interpolateMessage(message, match.captures, fileContext.source);
              pass.report(capture.node, interpolatedMessage);
            }
          }
        }
      }
    }
  };
}

/**
 * Check if a path should be included based on path filters
 */
function shouldIncludePath(filePath: string, filter: PathFilter): boolean {
  // If include patterns exist, file must match at least one
  if (filter.includeGlobs.length > 0) {
    const matches = filter.includeGlobs.some((pattern) => minimatch(filePath, pattern));
    if (!matches) {
      return false;
    }
  }

  // If exclude patterns exist, file must not match any
  if (filter.excludeGlobs.length > 0) {
    const excluded = filter.excludeGlobs.some((pattern) => minimatch(filePath, pattern));
    if (excluded) {
      return false;
    }
  }

  return true;
}

/**
 * Check parent node filters (pattern-inside, pattern-not-inside)
 */
function runParentFilters(
  _source: Buffer,
  node: SyntaxNode,
  filters: NodeFilter[]
): boolean {
  if (filters.length === 0) {
    return true;
  }

  for (const filter of filters) {
    const shouldMatch = filter.shouldMatch;
    let nodeMatched = false;

    // Walk up the parent chain
    let parent = node.parent;
    while (parent !== null) {
      if (filterMatchesParent(filter, parent)) {
        nodeMatched = true;
        if (!shouldMatch) {
          // pattern-not-inside matched, reject
          return false;
        } else {
          // pattern-inside matched, continue checking other filters
          break;
        }
      }
      parent = parent.parent;
    }

    // If pattern-inside didn't match any parent, reject
    if (!nodeMatched && shouldMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a filter matches a parent node
 */
function filterMatchesParent(filter: NodeFilter, parent: SyntaxNode): boolean {
  const matches = filter.query.matches(parent);

  for (const match of matches) {
    for (const capture of match.captures) {
      if (capture.name === FILTER_PATTERN_KEY && capture.node.id === parent.id) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Interpolate capture values into message template
 */
function interpolateMessage(
  message: string,
  captures: Array<{ name: string; node: SyntaxNode }>,
  source: Buffer
): string {
  let result = message;

  for (const capture of captures) {
    const nodeText = source.slice(capture.node.startIndex, capture.node.endIndex).toString();
    result = result.replace(new RegExp(`@${capture.name}`, 'g'), nodeText);
  }

  return result;
}

// ============================================================================
// Checker Discovery
// ============================================================================

/**
 * Load all YAML checkers from a directory
 */
export async function loadYamlCheckers(dir: string): Promise<YamlAnalyzer[]> {
  const checkers: YamlAnalyzer[] = [];

  async function walkDir(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (ext !== '.yml' && ext !== '.yaml') continue;

        // Skip test files
        if (entry.name.includes('.test.')) continue;

        try {
          const checker = await loadYamlChecker(fullPath);
          checkers.push(checker);
        } catch (error) {
          // Log and continue with other checkers
          console.error(`Failed to load checker ${fullPath}:`, error);
        }
      }
    }
  }

  await walkDir(dir);
  return checkers;
}

/**
 * Get analyzers from YAML checkers
 */
export function getAnalyzersFromYaml(yamlCheckers: YamlAnalyzer[]): Analyzer[] {
  return yamlCheckers.map((yc) => yc.analyzer);
}
