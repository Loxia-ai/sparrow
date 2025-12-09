/**
 * Issue representation and serialization
 * Compatible with globstar issue format
 */

import type { SyntaxNode } from 'tree-sitter';
import { Issue, IssueJson, Category, Severity, Location } from './types.js';

// ============================================================================
// Issue Creation
// ============================================================================

/**
 * Create an issue from an AST node
 */
export function createIssue(
  node: SyntaxNode,
  message: string,
  filepath: string,
  id: string,
  category: Category = Category.BugRisk,
  severity: Severity = Severity.Warning
): Issue {
  return {
    category,
    severity,
    message,
    filepath,
    node,
    id,
    range: {
      filename: filepath,
      start: {
        row: node.startPosition.row + 1, // Convert to 1-indexed
        column: node.startPosition.column,
      },
      end: {
        row: node.endPosition.row + 1, // Convert to 1-indexed
        column: node.endPosition.column,
      },
    },
  };
}

/**
 * Create an issue without an AST node (for deserialized issues)
 */
export function createIssueFromPosition(
  message: string,
  filepath: string,
  id: string,
  start: Location,
  end: Location,
  category: Category = Category.BugRisk,
  severity: Severity = Severity.Warning
): Issue {
  return {
    category,
    severity,
    message,
    filepath,
    id,
    range: {
      filename: filepath,
      start,
      end,
    },
  };
}

// ============================================================================
// Issue Serialization
// ============================================================================

/**
 * Convert an issue to JSON format
 */
export function issueToJson(issue: Issue): IssueJson {
  return {
    category: issue.category,
    severity: issue.severity,
    message: issue.message,
    range: issue.range,
    id: issue.id,
  };
}

/**
 * Serialize an issue to JSON string
 */
export function issueAsJson(issue: Issue): string {
  return JSON.stringify(issueToJson(issue));
}

/**
 * Convert an issue to text format (filepath:row:col:message)
 */
export function issueAsText(issue: Issue): string {
  const { filepath, range, message } = issue;
  return `${filepath}:${range.start.row}:${range.start.column}:${message}`;
}

/**
 * Deserialize an issue from JSON
 */
export function issueFromJson(json: string | IssueJson): Issue {
  const data = typeof json === 'string' ? (JSON.parse(json) as IssueJson) : json;

  return {
    category: data.category,
    severity: data.severity,
    message: data.message,
    filepath: data.range.filename,
    id: data.id,
    range: data.range,
  };
}

// ============================================================================
// Issue Reporting
// ============================================================================

/**
 * Format multiple issues as JSON (newline-delimited)
 */
export function reportIssuesAsJson(issues: Issue[]): string {
  return issues.map(issueAsJson).join('\n');
}

/**
 * Format multiple issues as text (newline-delimited)
 */
export function reportIssuesAsText(issues: Issue[]): string {
  return issues.map(issueAsText).join('\n');
}

/**
 * Report issues in specified format
 */
export function reportIssues(issues: Issue[], format: 'json' | 'text' = 'text'): string {
  switch (format) {
    case 'json':
      return reportIssuesAsJson(issues);
    case 'text':
    default:
      return reportIssuesAsText(issues);
  }
}

// ============================================================================
// Issue Filtering
// ============================================================================

/**
 * Filter issues by severity
 */
export function filterBySeverity(issues: Issue[], severities: Severity[]): Issue[] {
  return issues.filter((issue) => severities.includes(issue.severity));
}

/**
 * Filter issues by category
 */
export function filterByCategory(issues: Issue[], categories: Category[]): Issue[] {
  return issues.filter((issue) => categories.includes(issue.category));
}

/**
 * Filter issues by checker ID
 */
export function filterByCheckerId(issues: Issue[], checkerIds: string[]): Issue[] {
  return issues.filter((issue) => checkerIds.includes(issue.id));
}

/**
 * Exclude issues by checker ID
 */
export function excludeByCheckerId(issues: Issue[], checkerIds: string[]): Issue[] {
  return issues.filter((issue) => !checkerIds.includes(issue.id));
}

// ============================================================================
// Issue Comparison
// ============================================================================

/**
 * Check if two issues are at the same location
 */
export function isSameLocation(a: Issue, b: Issue): boolean {
  return (
    a.filepath === b.filepath &&
    a.range.start.row === b.range.start.row &&
    a.range.start.column === b.range.start.column
  );
}

/**
 * Sort issues by file and line number
 */
export function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const fileCompare = a.filepath.localeCompare(b.filepath);
    if (fileCompare !== 0) return fileCompare;

    const rowCompare = a.range.start.row - b.range.start.row;
    if (rowCompare !== 0) return rowCompare;

    return a.range.start.column - b.range.start.column;
  });
}

/**
 * Deduplicate issues at the same location
 */
export function deduplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  const result: Issue[] = [];

  for (const issue of issues) {
    const key = `${issue.filepath}:${issue.range.start.row}:${issue.range.start.column}:${issue.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(issue);
    }
  }

  return result;
}
