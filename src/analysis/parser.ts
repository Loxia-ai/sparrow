/**
 * File parsing using tree-sitter
 * Converts source code into ASTs for analysis
 */

import Parser from 'tree-sitter';
import type { Tree, SyntaxNode } from 'tree-sitter';
import * as fs from 'fs/promises';
import { Language, ParseResult } from './types.js';
import { getLanguageFromPath, ensureGrammarLoaded } from './language.js';

// ============================================================================
// Parser Instance
// ============================================================================

// Reusable parser instance
const parser = new Parser();

// ============================================================================
// Error Types
// ============================================================================

export class UnsupportedLanguageError extends Error {
  constructor(language: Language) {
    super(`Unsupported language: ${language}`);
    this.name = 'UnsupportedLanguageError';
  }
}

export class ParseError extends Error {
  constructor(filePath: string, message: string) {
    super(`Failed to parse ${filePath}: ${message}`);
    this.name = 'ParseError';
  }
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse source code with a given language
 */
export async function parseSource(
  source: Buffer | string,
  language: Language,
  filePath: string = '<anonymous>'
): Promise<ParseResult> {
  const grammar = await ensureGrammarLoaded(language);

  if (!grammar) {
    throw new UnsupportedLanguageError(language);
  }

  return parseWithGrammar(source, language, grammar, filePath);
}

/**
 * Parse a file from disk
 */
export async function parseFile(filePath: string): Promise<ParseResult> {
  const language = getLanguageFromPath(filePath);

  if (language === Language.Unknown) {
    throw new UnsupportedLanguageError(language);
  }

  const grammar = await ensureGrammarLoaded(language);

  if (!grammar) {
    throw new UnsupportedLanguageError(language);
  }

  const source = await fs.readFile(filePath);
  return parseWithGrammar(source, language, grammar, filePath);
}

/**
 * Parse source code with a specific grammar
 */
function parseWithGrammar(
  source: Buffer | string,
  language: Language,
  grammar: unknown,
  filePath: string
): ParseResult {
  const sourceBuffer = Buffer.isBuffer(source) ? source : Buffer.from(source);

  // Set the language for the parser
  parser.setLanguage(grammar as Parser.Language);

  // Parse the source
  const tree: Tree = parser.parse(sourceBuffer.toString());

  if (!tree || !tree.rootNode) {
    throw new ParseError(filePath, 'Failed to generate AST');
  }

  return {
    ast: tree.rootNode,
    tree,
    source: sourceBuffer,
    filePath,
    tsLanguage: grammar as Parser.Language,
    language,
  };
}

/**
 * Check if a file can be parsed (language is supported)
 */
export function canParseFile(filePath: string): boolean {
  const language = getLanguageFromPath(filePath);
  return language !== Language.Unknown;
}

/**
 * Try to parse a file, returning null instead of throwing on error
 */
export async function tryParseFile(filePath: string): Promise<ParseResult | null> {
  try {
    return await parseFile(filePath);
  } catch {
    return null;
  }
}

// ============================================================================
// AST Traversal Utilities
// ============================================================================

/**
 * Pre-order tree traversal callback type
 */
export type NodeVisitor = (node: SyntaxNode) => void;

/**
 * Walk the AST in pre-order (parent before children)
 */
export function walkTree(node: SyntaxNode, visitor: NodeVisitor): void {
  visitor(node);

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      walkTree(child, visitor);
    }
  }
}

/**
 * Walk the AST with enter/leave callbacks
 */
export interface TreeWalker {
  onEnterNode?: (node: SyntaxNode) => void;
  onLeaveNode?: (node: SyntaxNode) => void;
}

export function walkTreeWithCallbacks(node: SyntaxNode, walker: TreeWalker): void {
  walker.onEnterNode?.(node);

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      walkTreeWithCallbacks(child, walker);
    }
  }

  walker.onLeaveNode?.(node);
}

/**
 * Get all children with a specific field name
 */
export function childrenWithFieldName(node: SyntaxNode, fieldName: string): SyntaxNode[] {
  const children: SyntaxNode[] = [];

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    const name = node.fieldNameForChild(i);
    if (child && name === fieldName) {
      children.push(child);
    }
  }

  return children;
}

/**
 * Get child by field name (first match)
 */
export function childWithFieldName(node: SyntaxNode, fieldName: string): SyntaxNode | null {
  const children = childrenWithFieldName(node, fieldName);
  return children.length > 0 ? children[0] : null;
}

/**
 * Get all children of a specific type
 */
export function childrenOfType(node: SyntaxNode, type: string): SyntaxNode[] {
  const children: SyntaxNode[] = [];

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child && child.type === type) {
      children.push(child);
    }
  }

  return children;
}

/**
 * Get first child of a specific type
 */
export function firstChildOfType(node: SyntaxNode, type: string): SyntaxNode | null {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child && child.type === type) {
      return child;
    }
  }
  return null;
}

/**
 * Find first matching child using a predicate
 */
export function findMatchingChild(
  node: SyntaxNode,
  predicate: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child && predicate(child)) {
      return child;
    }
  }
  return null;
}

/**
 * Find all nodes matching a predicate (depth-first)
 */
export function findAllNodes(
  node: SyntaxNode,
  predicate: (node: SyntaxNode) => boolean
): SyntaxNode[] {
  const results: SyntaxNode[] = [];

  walkTree(node, (n) => {
    if (predicate(n)) {
      results.push(n);
    }
  });

  return results;
}

/**
 * Get node text content
 */
export function getNodeText(node: SyntaxNode, source: Buffer): string {
  return source.slice(node.startIndex, node.endIndex).toString();
}
