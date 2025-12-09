/**
 * Skip comment handling (skipcq)
 * Compatible with globstar skipcq comment format
 */

import type { SyntaxNode } from 'tree-sitter';
import { ParseResult, SkipComment, Issue } from './types.js';
import { getCommentIdentifier } from './language.js';

// ============================================================================
// Skip Comment Detection
// ============================================================================

/**
 * Gather all skipcq comments from a parsed file
 */
export async function gatherSkipInfo(fileContext: ParseResult): Promise<SkipComment[]> {
  const skipComments: SkipComment[] = [];
  const { ast, source, language, tsLanguage } = fileContext;

  // Get the comment identifier for this language (escaped for regex)
  const commentIdentifier = getCommentIdentifier(language);
  if (!commentIdentifier) {
    return skipComments;
  }

  // Build regex pattern for skipcq comments
  // Pattern: {comment_identifier}.*?skipcq(:issue_id1, issue_id2, ...)?
  const pattern = new RegExp(
    `${commentIdentifier}(?:.*?)\\bskipcq\\b(?::(?:\\s*(?<issue_ids>([A-Za-z\\-_0-9]*(?:,\\s*)?)+))?)?`,
    'i'
  );

  // Query for all comments in the file
  try {
    const Parser = await import('tree-sitter');
    const query = new Parser.default.Query(tsLanguage, '(comment) @skipcq');
    const matches = query.matches(ast);

    for (const match of matches) {
      for (const capture of match.captures) {
        const commentNode = capture.node;
        const commentLine = commentNode.startPosition.row;
        const commentText = source.slice(commentNode.startIndex, commentNode.endIndex).toString();

        // Check if this comment contains skipcq
        const matches = pattern.exec(commentText);
        if (matches) {
          const issueIdsMatch = matches.groups?.issue_ids;
          const checkerIds: string[] = [];

          if (issueIdsMatch) {
            const ids = issueIdsMatch.split(',');
            for (const id of ids) {
              const trimmed = id.trim();
              if (trimmed) {
                checkerIds.push(trimmed);
              }
            }
          }

          skipComments.push({
            commentLine,
            commentText,
            checkerIds,
          });
        }
      }
    }
  } catch {
    // Query failed, return empty array
  }

  return skipComments;
}

/**
 * Check if an issue should be skipped based on skipcq comments
 */
export function shouldSkipIssue(issue: Issue, skipComments: SkipComment[]): boolean {
  if (skipComments.length === 0) {
    return false;
  }

  // Get the line number of the issue node (0-indexed)
  const nodeLine = issue.node ? issue.node.startPosition.row : issue.range.start.row - 1;
  const prevLine = nodeLine - 1;
  const checkerId = issue.id;

  for (const comment of skipComments) {
    // skipcq comment can be on the same line or the line before
    if (comment.commentLine !== nodeLine && comment.commentLine !== prevLine) {
      continue;
    }

    // If no specific checker IDs, skip all issues
    if (comment.checkerIds.length === 0) {
      return true;
    }

    // Check if this specific checker ID should be skipped
    if (comment.checkerIds.includes(checkerId)) {
      return true;
    }
  }

  return false;
}

/**
 * Filter out issues that should be skipped
 */
export function filterSkippedIssues(issues: Issue[], skipInfo: Map<string, SkipComment[]>): Issue[] {
  return issues.filter((issue) => {
    const skipComments = skipInfo.get(issue.filepath);
    if (!skipComments) {
      return true; // Keep issue if no skip info for file
    }
    return !shouldSkipIssue(issue, skipComments);
  });
}

/**
 * Check if a node has a skipcq comment on the same or previous line
 */
export function hasSkipcqComment(
  node: SyntaxNode,
  skipComments: SkipComment[],
  checkerId?: string
): boolean {
  const nodeLine = node.startPosition.row;
  const prevLine = nodeLine - 1;

  for (const comment of skipComments) {
    if (comment.commentLine !== nodeLine && comment.commentLine !== prevLine) {
      continue;
    }

    // If no specific checker IDs or no checkerId provided, skip all
    if (comment.checkerIds.length === 0 || !checkerId) {
      return true;
    }

    // Check if this specific checker ID should be skipped
    if (comment.checkerIds.includes(checkerId)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract checker IDs from a skipcq comment
 */
export function parseSkipcqComment(commentText: string): string[] {
  const match = /skipcq\s*:\s*(.+)/i.exec(commentText);
  if (!match) {
    return []; // Generic skipcq (skip all)
  }

  const ids = match[1].split(',');
  return ids.map((id) => id.trim()).filter((id) => id.length > 0);
}

/**
 * Create a skipcq comment string
 */
export function createSkipcqComment(checkerIds: string[] = [], commentPrefix: string = '#'): string {
  if (checkerIds.length === 0) {
    return `${commentPrefix} skipcq`;
  }
  return `${commentPrefix} skipcq: ${checkerIds.join(', ')}`;
}
