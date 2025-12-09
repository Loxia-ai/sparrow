/**
 * Configuration handling
 * Compatible with globstar .globstar/.config.yml format
 */

import * as yaml from 'js-yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import { minimatch } from 'minimatch';
import { Config, Severity, Category, isValidSeverity, isValidCategory } from '../analysis/types.js';

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_CHECKER_DIR = '.globstar';
const DEFAULT_EXIT_CODE = 1;
const DEFAULT_SEVERITY_IN: Severity[] = [Severity.Critical];
const DEFAULT_CATEGORY_IN: Category[] = [Category.BugRisk];

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Create a config with default values
 */
export function createDefaultConfig(): Config {
  return {
    checkerDir: DEFAULT_CHECKER_DIR,
    enabledCheckers: [],
    disabledCheckers: [],
    targetDirs: [],
    excludePatterns: [],
    failWhen: {
      exitCode: DEFAULT_EXIT_CODE,
      severityIn: [...DEFAULT_SEVERITY_IN],
      categoryIn: [...DEFAULT_CATEGORY_IN],
    },
  };
}

/**
 * Load configuration from a file
 */
export async function loadConfig(configPath: string): Promise<Config> {
  const config = createDefaultConfig();

  try {
    await fs.access(configPath);
  } catch {
    // File doesn't exist, return defaults
    return config;
  }

  const content = await fs.readFile(configPath, 'utf-8');
  const parsed = yaml.load(content) as Partial<RawConfig>;

  // Merge with defaults
  if (parsed) {
    if (parsed.checkerDir) {
      config.checkerDir = parsed.checkerDir;
    }
    if (parsed.enabledCheckers) {
      config.enabledCheckers = parsed.enabledCheckers;
    }
    if (parsed.disabledCheckers) {
      config.disabledCheckers = parsed.disabledCheckers;
    }
    if (parsed.targetDirs) {
      config.targetDirs = parsed.targetDirs;
    }
    if (parsed.excludePatterns) {
      config.excludePatterns = parsed.excludePatterns;
    }
    if (parsed.failWhen) {
      if (parsed.failWhen.exitCode !== undefined) {
        config.failWhen.exitCode = parsed.failWhen.exitCode;
      }
      if (parsed.failWhen.severityIn) {
        config.failWhen.severityIn = parsed.failWhen.severityIn as Severity[];
      }
      if (parsed.failWhen.categoryIn) {
        config.failWhen.categoryIn = parsed.failWhen.categoryIn as Category[];
      }
    }
  }

  // Validate the configuration
  validateConfig(config);

  return config;
}

/**
 * Load configuration from a directory (looks for .globstar/.config.yml or .sparrow/.config.yml)
 */
export async function loadConfigFromDir(dir: string): Promise<Config> {
  // Try .sparrow/.config.yml first
  const sparrowConfigPath = path.join(dir, '.sparrow', '.config.yml');
  try {
    await fs.access(sparrowConfigPath);
    return loadConfig(sparrowConfigPath);
  } catch {
    // Continue to try globstar config
  }

  // Try .globstar/.config.yml
  const globstarConfigPath = path.join(dir, '.globstar', '.config.yml');
  return loadConfig(globstarConfigPath);
}

// ============================================================================
// Configuration Validation
// ============================================================================

interface RawConfig {
  checkerDir?: string;
  enabledCheckers?: string[];
  disabledCheckers?: string[];
  targetDirs?: string[];
  excludePatterns?: string[];
  failWhen?: {
    exitCode?: number;
    severityIn?: string[];
    categoryIn?: string[];
  };
}

/**
 * Validate a configuration object
 */
export function validateConfig(config: Config): void {
  // Validate exclude patterns
  for (const pattern of config.excludePatterns) {
    try {
      minimatch('test', pattern);
    } catch {
      throw new Error(`Invalid exclude pattern: ${pattern}`);
    }
  }

  // Validate failure config
  if (config.failWhen.exitCode < 0) {
    throw new Error('exitCode must be a non-negative integer');
  }

  for (const severity of config.failWhen.severityIn) {
    if (!isValidSeverity(severity)) {
      throw new Error(`Invalid severity: ${severity}`);
    }
  }

  for (const category of config.failWhen.categoryIn) {
    if (!isValidCategory(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
  }
}

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Check if a path should be excluded based on config patterns
 */
export function shouldExcludePath(filePath: string, config: Config): boolean {
  for (const pattern of config.excludePatterns) {
    if (minimatch(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a checker should run based on config
 */
export function shouldRunChecker(checkerName: string, config: Config): boolean {
  // If enabled list is specified, checker must be in it
  if (config.enabledCheckers.length > 0) {
    return config.enabledCheckers.includes(checkerName);
  }

  // If disabled list is specified, checker must not be in it
  if (config.disabledCheckers.length > 0) {
    return !config.disabledCheckers.includes(checkerName);
  }

  return true;
}

/**
 * Add exclude patterns to config
 */
export function addExcludePatterns(config: Config, patterns: string[]): Config {
  return {
    ...config,
    excludePatterns: [...config.excludePatterns, ...patterns],
  };
}

/**
 * Merge two configurations (second overrides first)
 */
export function mergeConfigs(base: Config, override: Partial<Config>): Config {
  return {
    checkerDir: override.checkerDir ?? base.checkerDir,
    enabledCheckers: override.enabledCheckers ?? base.enabledCheckers,
    disabledCheckers: override.disabledCheckers ?? base.disabledCheckers,
    targetDirs: override.targetDirs ?? base.targetDirs,
    excludePatterns: [
      ...base.excludePatterns,
      ...(override.excludePatterns ?? []),
    ],
    failWhen: {
      exitCode: override.failWhen?.exitCode ?? base.failWhen.exitCode,
      severityIn: override.failWhen?.severityIn ?? base.failWhen.severityIn,
      categoryIn: override.failWhen?.categoryIn ?? base.failWhen.categoryIn,
    },
  };
}

// ============================================================================
// Failure Checking
// ============================================================================

/**
 * Check if issues warrant a failure based on config
 */
export function shouldFail(
  issues: Array<{ severity: Severity; category: Category }>,
  config: Config
): boolean {
  for (const issue of issues) {
    // Check if severity matches
    if (config.failWhen.severityIn.includes(issue.severity)) {
      return true;
    }

    // Check if category matches
    if (config.failWhen.categoryIn.includes(issue.category)) {
      return true;
    }
  }

  return false;
}

/**
 * Get the exit code based on issues and config
 */
export function getExitCode(
  issues: Array<{ severity: Severity; category: Category }>,
  config: Config
): number {
  if (shouldFail(issues, config)) {
    return config.failWhen.exitCode;
  }
  return 0;
}
