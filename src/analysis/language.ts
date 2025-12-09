/**
 * Language detection and tree-sitter grammar bindings
 * Compatible with globstar language support
 */

import { Language } from './types.js';

// ============================================================================
// Language Grammar Imports
// Note: These will be dynamically imported to avoid loading all grammars upfront
// ============================================================================

// Cache for loaded grammars - use any to avoid type conflicts
const grammarCache = new Map<Language, unknown>();

/**
 * Dynamically load a tree-sitter grammar
 */
async function loadGrammar(lang: Language): Promise<unknown> {
  if (grammarCache.has(lang)) {
    return grammarCache.get(lang)!;
  }

  let grammar: unknown = null;

  try {
    switch (lang) {
      case Language.Python: {
        const mod = await import('tree-sitter-python');
        grammar = mod.default;
        break;
      }
      case Language.JavaScript: {
        const mod = await import('tree-sitter-javascript');
        grammar = mod.default;
        break;
      }
      case Language.TSX: {
        // Use TypeScript TSX grammar for JSX/TSX
        const mod = await import('tree-sitter-typescript');
        grammar = (mod as unknown as { tsx: unknown }).tsx;
        break;
      }
      case Language.TypeScript: {
        const mod = await import('tree-sitter-typescript');
        grammar = (mod as unknown as { typescript: unknown }).typescript;
        break;
      }
      case Language.Java: {
        const mod = await import('tree-sitter-java');
        grammar = mod.default;
        break;
      }
      case Language.Ruby: {
        const mod = await import('tree-sitter-ruby');
        grammar = mod.default;
        break;
      }
      case Language.Rust: {
        const mod = await import('tree-sitter-rust');
        grammar = mod.default;
        break;
      }
      case Language.Go: {
        const mod = await import('tree-sitter-go');
        grammar = mod.default;
        break;
      }
      case Language.PHP: {
        const mod = await import('tree-sitter-php');
        grammar = (mod.default as { php: unknown }).php;
        break;
      }
      case Language.Bash: {
        const mod = await import('tree-sitter-bash');
        grammar = mod.default;
        break;
      }
      case Language.CSharp: {
        const mod = await import('tree-sitter-c-sharp');
        grammar = mod.default;
        break;
      }
      case Language.HTML: {
        const mod = await import('tree-sitter-html');
        grammar = mod.default;
        break;
      }
      case Language.CSS: {
        const mod = await import('tree-sitter-css');
        grammar = mod.default;
        break;
      }
      default:
        return null;
    }

    if (grammar) {
      grammarCache.set(lang, grammar);
    }
    return grammar;
  } catch (error) {
    // Grammar not available
    console.error(`Failed to load grammar for ${lang}:`, error);
    return null;
  }
}

/**
 * Get the tree-sitter grammar for a language (sync version using cache)
 */
export function getLanguageGrammar(lang: Language): unknown {
  return grammarCache.get(lang) ?? null;
}

/**
 * Ensure a grammar is loaded (async)
 */
export async function ensureGrammarLoaded(lang: Language): Promise<unknown> {
  return loadGrammar(lang);
}

/**
 * Preload all commonly used grammars
 */
export async function preloadGrammars(languages?: Language[]): Promise<void> {
  const toLoad = languages ?? [
    Language.Python,
    Language.JavaScript,
    Language.TypeScript,
    Language.TSX,
    Language.Java,
    Language.Ruby,
    Language.Go,
  ];

  await Promise.all(toLoad.map(loadGrammar));
}

// ============================================================================
// Language Detection
// ============================================================================

/**
 * Decode a language string to Language enum
 * Compatible with globstar language codes
 */
export function decodeLanguage(language: string): Language {
  const normalized = language.toLowerCase();

  switch (normalized) {
    case 'javascript':
    case 'js':
      return Language.JavaScript;
    case 'typescript':
    case 'ts':
      return Language.TypeScript;
    case 'jsx':
    case 'tsx':
      return Language.TSX;
    case 'python':
    case 'py':
      return Language.Python;
    case 'java':
      return Language.Java;
    case 'kotlin':
    case 'kt':
      return Language.Kotlin;
    case 'ruby':
    case 'rb':
      return Language.Ruby;
    case 'rust':
    case 'rs':
      return Language.Rust;
    case 'go':
      return Language.Go;
    case 'php':
      return Language.PHP;
    case 'csharp':
    case 'cs':
    case 'c#':
      return Language.CSharp;
    case 'scala':
      return Language.Scala;
    case 'lua':
      return Language.Lua;
    case 'bash':
    case 'sh':
      return Language.Bash;
    case 'sql':
      return Language.SQL;
    case 'css':
    case 'css3':
      return Language.CSS;
    case 'html':
      return Language.HTML;
    case 'dockerfile':
    case 'docker':
      return Language.Dockerfile;
    case 'yaml':
    case 'yml':
      return Language.YAML;
    case 'markdown':
    case 'md':
      return Language.Markdown;
    case 'hcl':
    case 'tf':
      return Language.HCL;
    case 'elixir':
    case 'ex':
      return Language.Elixir;
    case 'elm':
      return Language.Elm;
    case 'groovy':
      return Language.Groovy;
    case 'ocaml':
    case 'ml':
      return Language.OCaml;
    case 'swift':
      return Language.Swift;
    default:
      return Language.Unknown;
  }
}

/**
 * Get language from file path extension
 */
export function getLanguageFromPath(filePath: string): Language {
  const ext = filePath.substring(filePath.lastIndexOf('.'));

  switch (ext) {
    case '.py':
      return Language.Python;
    case '.js':
    case '.jsx':
      return Language.JavaScript;
    case '.ts':
      return Language.TypeScript;
    case '.tsx':
      return Language.TSX;
    case '.java':
      return Language.Java;
    case '.kt':
      return Language.Kotlin;
    case '.rb':
      return Language.Ruby;
    case '.rs':
      return Language.Rust;
    case '.go':
      return Language.Go;
    case '.php':
      return Language.PHP;
    case '.cs':
      return Language.CSharp;
    case '.scala':
      return Language.Scala;
    case '.lua':
      return Language.Lua;
    case '.sh':
      return Language.Bash;
    case '.sql':
      return Language.SQL;
    case '.css':
      return Language.CSS;
    case '.html':
    case '.htm':
      return Language.HTML;
    case '.dockerfile':
    case '.Dockerfile':
      return Language.Dockerfile;
    case '.yaml':
    case '.yml':
      return Language.YAML;
    case '.md':
      return Language.Markdown;
    case '.tf':
      return Language.HCL;
    case '.ex':
    case '.exs':
      return Language.Elixir;
    case '.elm':
      return Language.Elm;
    case '.groovy':
      return Language.Groovy;
    case '.ml':
      return Language.OCaml;
    case '.swift':
      return Language.Swift;
    default:
      // Check for Dockerfile without extension
      if (filePath.endsWith('Dockerfile') || filePath.includes('/Dockerfile')) {
        return Language.Dockerfile;
      }
      return Language.Unknown;
  }
}

/**
 * Get file extension for a language
 */
export function getExtensionFromLanguage(lang: Language): string {
  switch (lang) {
    case Language.Python:
      return '.py';
    case Language.JavaScript:
      return '.js';
    case Language.TypeScript:
      return '.ts';
    case Language.TSX:
      return '.tsx';
    case Language.Java:
      return '.java';
    case Language.Kotlin:
      return '.kt';
    case Language.Ruby:
      return '.rb';
    case Language.Rust:
      return '.rs';
    case Language.Go:
      return '.go';
    case Language.PHP:
      return '.php';
    case Language.CSharp:
      return '.cs';
    case Language.Scala:
      return '.scala';
    case Language.Lua:
      return '.lua';
    case Language.Bash:
      return '.sh';
    case Language.SQL:
      return '.sql';
    case Language.CSS:
      return '.css';
    case Language.HTML:
      return '.html';
    case Language.Dockerfile:
      return '.Dockerfile';
    case Language.YAML:
      return '.yaml';
    case Language.Markdown:
      return '.md';
    case Language.HCL:
      return '.tf';
    case Language.Elixir:
      return '.ex';
    case Language.Elm:
      return '.elm';
    case Language.Groovy:
      return '.groovy';
    case Language.OCaml:
      return '.ml';
    case Language.Swift:
      return '.swift';
    default:
      return '';
  }
}

// ============================================================================
// Comment Identifiers
// ============================================================================

/**
 * Get the comment identifier pattern for a language (escaped for regex)
 */
export function getCommentIdentifier(lang: Language): string {
  switch (lang) {
    case Language.JavaScript:
    case Language.TypeScript:
    case Language.TSX:
    case Language.Java:
    case Language.Rust:
    case Language.CSS:
    case Language.Markdown:
    case Language.Kotlin:
    case Language.CSharp:
    case Language.Go:
    case Language.Groovy:
    case Language.PHP:
    case Language.Scala:
    case Language.Swift:
      return '\\/\\/';
    case Language.Python:
    case Language.Lua:
    case Language.Bash:
    case Language.Ruby:
    case Language.YAML:
    case Language.Dockerfile:
    case Language.Elixir:
    case Language.HCL:
      return '#';
    case Language.SQL:
    case Language.Elm:
      return '--';
    case Language.HTML:
      return '<\\!--';
    case Language.OCaml:
      return '\\(\\*';
    default:
      return '';
  }
}

/**
 * Get the raw comment prefix for a language (not escaped)
 */
export function getCommentPrefix(lang: Language): string {
  switch (lang) {
    case Language.JavaScript:
    case Language.TypeScript:
    case Language.TSX:
    case Language.Java:
    case Language.Rust:
    case Language.CSS:
    case Language.Markdown:
    case Language.Kotlin:
    case Language.CSharp:
    case Language.Go:
    case Language.Groovy:
    case Language.PHP:
    case Language.Scala:
    case Language.Swift:
      return '//';
    case Language.Python:
    case Language.Lua:
    case Language.Bash:
    case Language.Ruby:
    case Language.YAML:
    case Language.Dockerfile:
    case Language.Elixir:
    case Language.HCL:
      return '#';
    case Language.SQL:
    case Language.Elm:
      return '--';
    case Language.HTML:
      return '<!--';
    case Language.OCaml:
      return '(*';
    default:
      return '';
  }
}
