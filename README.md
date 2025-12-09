# Sparrow

**A backward-compatible reimplementation of the MIT-licensed [Globstar.dev](https://github.com/DeepSourceCorp/globstar) SAST tool, built for Node.js.**

Sparrow is a static analysis security testing (SAST) tool that uses tree-sitter for fast, accurate code parsing. It's fully compatible with Globstar's YAML checker format, allowing you to use existing Globstar checkers or create your own.

## Features

- **Multi-language support**: Python, JavaScript, TypeScript, Go, Java, Ruby, Rust, PHP, C#, and more
- **Globstar-compatible**: Uses the same YAML checker format as Globstar
- **Tree-sitter powered**: Fast and accurate parsing using tree-sitter grammars
- **Pattern matching**: Powerful tree-sitter query patterns for precise issue detection
- **Path filtering**: Include/exclude files using glob patterns
- **Skip comments**: Suppress specific issues with `skipcq` comments
- **Extensible**: Create custom checkers in YAML format
- **CLI and API**: Use as a command-line tool or integrate into your Node.js projects

## Installation

```bash
npm install sparrow-sast
```

Or clone and build from source:

```bash
git clone https://github.com/your-org/sparrow.git
cd sparrow
npm install
npm run build
```

## Quick Start

### Command Line

Scan a file or directory:

```bash
npx sparrow scan ./src
```

Run checker tests:

```bash
npx sparrow test ./checkers
```

### Programmatic API

```typescript
import { scan, Language } from 'sparrow-sast';

// Scan a directory
const issues = await scan('./src', {
  useBuiltinCheckers: true,
  languages: [Language.Python, Language.JavaScript],
});

console.log(`Found ${issues.length} issues`);

for (const issue of issues) {
  console.log(`${issue.filepath}:${issue.range.start.row}: ${issue.message}`);
}
```

## Supported Languages

| Language | Extension | Status |
|----------|-----------|--------|
| Python | `.py` | ✅ Full support |
| JavaScript | `.js`, `.jsx` | ✅ Full support |
| TypeScript | `.ts`, `.tsx` | ✅ Full support |
| Go | `.go` | ✅ Full support |
| Java | `.java` | ✅ Full support |
| Ruby | `.rb` | ✅ Full support |
| Rust | `.rs` | ✅ Full support |
| PHP | `.php` | ✅ Full support |
| C# | `.cs` | ✅ Full support |
| Bash | `.sh`, `.bash` | ✅ Full support |
| HTML | `.html` | ✅ Full support |
| CSS | `.css` | ✅ Full support |

## Writing Checkers

Sparrow uses YAML-based checker definitions compatible with Globstar. Here's an example:

```yaml
language: python
name: flask-debug-enabled
message: "Deploying Flask with debug=True is a security risk"
category: security
severity: warning

pattern: >
  (call
    function: (attribute
      object: (identifier) @app
      attribute: (identifier) @run)
    arguments: (argument_list
      (keyword_argument
        name: (identifier) @debug_key
        value: (true) @debug_value)))
  (#eq? @run "run")
  (#eq? @debug_key "debug")
  @flask-debug-enabled

exclude:
  - "test/**"
  - "*_test.py"

description: |
  Running Flask with debug=True exposes the Werkzeug debugger,
  which can execute arbitrary code. Always disable debug mode
  in production.
```

### Checker Fields

| Field | Required | Description |
|-------|----------|-------------|
| `language` | Yes | Target language (python, javascript, go, etc.) |
| `name` | Yes | Unique identifier for the checker |
| `message` | Yes | Message shown when issue is detected |
| `category` | Yes | Category: security, bug-risk, performance, style, antipattern |
| `severity` | Yes | Severity: critical, error, warning, info |
| `pattern` | Yes | Tree-sitter query pattern |
| `patterns` | No | Array of patterns (alternative to single pattern) |
| `exclude` | No | Glob patterns for files to exclude |
| `include` | No | Glob patterns for files to include |
| `filters` | No | Additional pattern filters (pattern-inside, pattern-not-inside) |
| `description` | No | Detailed description of the issue |

### Pattern Syntax

Patterns use [tree-sitter query syntax](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax). The capture name matching your checker's `name` field will be reported as an issue.

```yaml
# Basic pattern - captures nodes matching the query
pattern: >
  (assert_statement) @avoid-assert

# Pattern with predicates
pattern: >
  (call
    function: (identifier) @func
    (#eq? @func "eval"))
  @dangerous-eval

# Multiple patterns
patterns:
  - (call function: (identifier) @f (#eq? @f "exec")) @command-injection
  - (call function: (identifier) @f (#eq? @f "system")) @command-injection
```

### Filters

Use filters to refine when issues are reported:

```yaml
filters:
  # Only report if inside a specific context
  - pattern-inside: (function_definition) @__filter__key__

  # Don't report if inside a specific context
  - pattern-not-inside: (try_statement) @__filter__key__
```

## Testing Checkers

Create test files alongside your checkers using the `<expect-error>` comment format:

```python
# avoid_assert.test.py

def validate(x):
    # <expect-error>
    assert x > 0
    return x

def safe_validate(x):
    # <no-error>
    if x <= 0:
        raise ValueError("x must be positive")
    return x
```

Run tests:

```bash
npx sparrow test ./checkers
```

## Configuration

Create a `.sparrow.yml` or `globstar.yaml` in your project root:

```yaml
# Checkers to enable (empty = all)
enabled_checkers: []

# Checkers to disable
disabled_checkers:
  - avoid-assert  # Allow asserts in this project

# Paths to exclude from scanning
exclude:
  - node_modules/**
  - vendor/**
  - "*.min.js"

# Custom checker directory
checker_dir: ./.sparrow/checkers

# Failure thresholds
fail_on:
  critical: true
  error: true
  warning: false
  info: false
```

## Suppressing Issues

Use `skipcq` comments to suppress specific issues:

```python
# Suppress a specific checker
assert x > 0  # skipcq: avoid-assert

# Suppress multiple checkers
eval(code)  # skipcq: dangerous-eval, code-injection

# Suppress all checkers on this line
exec(cmd)  # skipcq
```

## API Reference

### Core Functions

```typescript
// Scan a path for issues
async function scan(path: string, options?: ScanOptions): Promise<Issue[]>

// Load a YAML checker
async function loadYamlChecker(path: string): Promise<YamlAnalyzer>

// Run analyzers on source code
async function runAnalyzersOnSource(
  source: string,
  language: Language,
  analyzers: Analyzer[]
): Promise<Issue[]>

// Run checker tests
async function runTests(testDir: string): Promise<TestResult>
```

### Types

```typescript
interface Issue {
  id: string;           // Checker name
  message: string;      // Issue description
  filepath: string;     // File path
  category: Category;   // security, bug-risk, etc.
  severity: Severity;   // critical, error, warning, info
  range: Position;      // Line and column info
}

interface ScanOptions {
  checkerDir?: string;
  useBuiltinCheckers?: boolean;
  enabledCheckers?: string[];
  disabledCheckers?: string[];
  excludePatterns?: string[];
  languages?: Language[];
}
```

## Built-in Checkers

Sparrow includes checkers for common security issues:

### Python
- `flask-debug-enabled` - Flask debug mode in production
- `avoid-assert` - Assert statements removed in optimized bytecode
- `app-run-with-bad-host` - Flask binding to 0.0.0.0

### JavaScript
- `js-alert-in-prod` - Alert dialogs in production code
- `js-confirm-in-prod` - Confirm dialogs in production code
- `js-assigned-undefined` - Assigning undefined explicitly

### Go
- `fmt-print-in-prod` - fmt.Print statements in production
- `math-rand` - Using math/rand instead of crypto/rand
- `md5-weak-hash` - Using MD5 for hashing
- `unsafe-pkg` - Using the unsafe package

### Java
- `deprecated-des` - Using deprecated DES encryption
- `ecb-cipher` - Using ECB cipher mode
- `no-null-cipher` - Using NullCipher

### Ruby
- `eval-method` - Using eval()
- `md5-weak-hash` - Using MD5 for hashing
- `sha1-weak-hash` - Using SHA1 for hashing

## Contributing

Contributions are welcome! Please see our contributing guidelines.

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

This project is a reimplementation of [Globstar](https://github.com/DeepSourceCorp/globstar) by DeepSource, which is also MIT licensed.

## Acknowledgments

- [Globstar](https://github.com/DeepSourceCorp/globstar) - The original Go implementation this project is based on
- [tree-sitter](https://tree-sitter.github.io/) - The parsing library that powers Sparrow
- [DeepSource](https://deepsource.io/) - Original creators of Globstar
