/**
 * Checker loading and discovery
 * Loads both built-in and custom YAML checkers
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { Analyzer, YamlAnalyzer } from '../analysis/types.js';
import { loadYamlCheckers, getAnalyzersFromYaml } from '../analysis/yaml-checker.js';

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Get the path to the built-in checkers directory
 */
export function getBuiltinCheckersPath(): string {
  // When running from compiled JS, we need to navigate relative to the dist folder
  // Structure: dist/src/checkers/loader.js -> need to go up to project root
  const currentFile = fileURLToPath(import.meta.url);
  const srcCheckersDir = path.dirname(currentFile);
  const srcDir = path.dirname(srcCheckersDir);
  const distDir = path.dirname(srcDir);
  const projectRoot = path.dirname(distDir);

  // Built-in checkers are in the project's checkers/ directory
  const checkersPath = path.join(projectRoot, 'checkers');

  return checkersPath;
}

/**
 * Get the path to the globstar checkers directory (symlinked or copied)
 */
export function getGlobstarCheckersPath(): string {
  // Structure: dist/src/checkers/loader.js -> project root -> parent -> globstar-master
  const currentFile = fileURLToPath(import.meta.url);
  const srcCheckersDir = path.dirname(currentFile);
  const srcDir = path.dirname(srcCheckersDir);
  const distDir = path.dirname(srcDir);
  const projectRoot = path.dirname(distDir);

  // Look in the globstar-master directory (sibling to sparrow)
  return path.join(projectRoot, '..', 'globstar-master', 'checkers');
}

// ============================================================================
// Checker Loading
// ============================================================================

/**
 * Load built-in YAML checkers
 */
export async function loadBuiltinYamlCheckers(): Promise<YamlAnalyzer[]> {
  const builtinPath = getBuiltinCheckersPath();

  try {
    await fs.access(builtinPath);
    return await loadYamlCheckers(builtinPath);
  } catch {
    // No built-in checkers directory, try globstar path
    const globstarPath = getGlobstarCheckersPath();

    try {
      await fs.access(globstarPath);
      return await loadYamlCheckers(globstarPath);
    } catch {
      // No checkers available
      return [];
    }
  }
}

/**
 * Load custom YAML checkers from a directory
 */
export async function loadCustomYamlCheckers(checkerDir: string): Promise<YamlAnalyzer[]> {
  try {
    await fs.access(checkerDir);
    return await loadYamlCheckers(checkerDir);
  } catch {
    return [];
  }
}

/**
 * Load all checkers (built-in + custom)
 */
export async function loadAllCheckers(customDir?: string): Promise<Analyzer[]> {
  const analyzers: Analyzer[] = [];

  // Load built-in checkers
  const builtinCheckers = await loadBuiltinYamlCheckers();
  analyzers.push(...getAnalyzersFromYaml(builtinCheckers));

  // Load custom checkers if directory specified
  if (customDir) {
    const customCheckers = await loadCustomYamlCheckers(customDir);
    analyzers.push(...getAnalyzersFromYaml(customCheckers));
  }

  return analyzers;
}

/**
 * Load checkers for a specific language
 */
export async function loadCheckersForLanguage(
  language: string,
  customDir?: string
): Promise<Analyzer[]> {
  const allCheckers = await loadAllCheckers(customDir);
  return allCheckers.filter((a) => a.language.toLowerCase() === language.toLowerCase());
}

// ============================================================================
// Checker Registry
// ============================================================================

interface CheckerRegistry {
  analyzers: Map<string, Analyzer>;
  yamlAnalyzers: Map<string, YamlAnalyzer>;
}

let globalRegistry: CheckerRegistry | null = null;

/**
 * Initialize the global checker registry
 */
export async function initializeRegistry(customDir?: string): Promise<CheckerRegistry> {
  const registry: CheckerRegistry = {
    analyzers: new Map(),
    yamlAnalyzers: new Map(),
  };

  // Load built-in YAML checkers
  const builtinCheckers = await loadBuiltinYamlCheckers();
  for (const checker of builtinCheckers) {
    registry.yamlAnalyzers.set(checker.analyzer.name, checker);
    registry.analyzers.set(checker.analyzer.name, checker.analyzer);
  }

  // Load custom checkers if directory specified
  if (customDir) {
    const customCheckers = await loadCustomYamlCheckers(customDir);
    for (const checker of customCheckers) {
      registry.yamlAnalyzers.set(checker.analyzer.name, checker);
      registry.analyzers.set(checker.analyzer.name, checker.analyzer);
    }
  }

  globalRegistry = registry;
  return registry;
}

/**
 * Get the global checker registry
 */
export function getRegistry(): CheckerRegistry | null {
  return globalRegistry;
}

/**
 * Get an analyzer by name from the registry
 */
export function getAnalyzerByName(name: string): Analyzer | undefined {
  return globalRegistry?.analyzers.get(name);
}

/**
 * Get all registered analyzers
 */
export function getAllAnalyzers(): Analyzer[] {
  if (!globalRegistry) return [];
  return Array.from(globalRegistry.analyzers.values());
}

/**
 * Get analyzer names grouped by language
 */
export function getAnalyzersByLanguage(): Map<string, string[]> {
  const byLanguage = new Map<string, string[]>();

  if (!globalRegistry) return byLanguage;

  for (const [name, analyzer] of globalRegistry.analyzers) {
    const lang = analyzer.language;
    if (!byLanguage.has(lang)) {
      byLanguage.set(lang, []);
    }
    byLanguage.get(lang)!.push(name);
  }

  return byLanguage;
}
