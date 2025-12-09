import { describe, it, expect } from 'vitest';
import {
  decodeLanguage,
  getLanguageFromPath,
  getExtensionFromLanguage,
  getCommentIdentifier,
  getCommentPrefix,
} from '../../src/analysis/language.js';
import { Language, Severity, Category, isValidSeverity, isValidCategory } from '../../src/analysis/types.js';

describe('Language Detection', () => {
  describe('decodeLanguage', () => {
    it('should decode Python language codes', () => {
      expect(decodeLanguage('python')).toBe(Language.Python);
      expect(decodeLanguage('py')).toBe(Language.Python);
      expect(decodeLanguage('PYTHON')).toBe(Language.Python);
    });

    it('should decode JavaScript language codes', () => {
      expect(decodeLanguage('javascript')).toBe(Language.JavaScript);
      expect(decodeLanguage('js')).toBe(Language.JavaScript);
    });

    it('should decode TypeScript language codes', () => {
      expect(decodeLanguage('typescript')).toBe(Language.TypeScript);
      expect(decodeLanguage('ts')).toBe(Language.TypeScript);
      expect(decodeLanguage('tsx')).toBe(Language.TSX);
      expect(decodeLanguage('jsx')).toBe(Language.TSX);
    });

    it('should decode Go language code', () => {
      expect(decodeLanguage('go')).toBe(Language.Go);
    });

    it('should decode Ruby language codes', () => {
      expect(decodeLanguage('ruby')).toBe(Language.Ruby);
      expect(decodeLanguage('rb')).toBe(Language.Ruby);
    });

    it('should decode Rust language codes', () => {
      expect(decodeLanguage('rust')).toBe(Language.Rust);
      expect(decodeLanguage('rs')).toBe(Language.Rust);
    });

    it('should decode Docker language codes', () => {
      expect(decodeLanguage('dockerfile')).toBe(Language.Dockerfile);
      expect(decodeLanguage('docker')).toBe(Language.Dockerfile);
    });

    it('should return Unknown for unrecognized languages', () => {
      expect(decodeLanguage('unknown')).toBe(Language.Unknown);
      expect(decodeLanguage('xyz')).toBe(Language.Unknown);
    });
  });

  describe('getLanguageFromPath', () => {
    it('should detect Python files', () => {
      expect(getLanguageFromPath('test.py')).toBe(Language.Python);
      expect(getLanguageFromPath('/path/to/file.py')).toBe(Language.Python);
    });

    it('should detect JavaScript files', () => {
      expect(getLanguageFromPath('test.js')).toBe(Language.JavaScript);
      expect(getLanguageFromPath('component.jsx')).toBe(Language.JavaScript);
    });

    it('should detect TypeScript files', () => {
      expect(getLanguageFromPath('test.ts')).toBe(Language.TypeScript);
      expect(getLanguageFromPath('component.tsx')).toBe(Language.TSX);
    });

    it('should detect Java files', () => {
      expect(getLanguageFromPath('Main.java')).toBe(Language.Java);
    });

    it('should detect Ruby files', () => {
      expect(getLanguageFromPath('app.rb')).toBe(Language.Ruby);
    });

    it('should detect Dockerfile', () => {
      expect(getLanguageFromPath('Dockerfile')).toBe(Language.Dockerfile);
      expect(getLanguageFromPath('/path/to/Dockerfile')).toBe(Language.Dockerfile);
      expect(getLanguageFromPath('file.dockerfile')).toBe(Language.Dockerfile);
    });

    it('should return Unknown for unrecognized extensions', () => {
      expect(getLanguageFromPath('file.txt')).toBe(Language.Unknown);
      expect(getLanguageFromPath('file.xyz')).toBe(Language.Unknown);
    });
  });

  describe('getExtensionFromLanguage', () => {
    it('should return correct extension for Python', () => {
      expect(getExtensionFromLanguage(Language.Python)).toBe('.py');
    });

    it('should return correct extension for JavaScript', () => {
      expect(getExtensionFromLanguage(Language.JavaScript)).toBe('.js');
    });

    it('should return correct extension for TypeScript', () => {
      expect(getExtensionFromLanguage(Language.TypeScript)).toBe('.ts');
      expect(getExtensionFromLanguage(Language.TSX)).toBe('.tsx');
    });

    it('should return empty string for Unknown', () => {
      expect(getExtensionFromLanguage(Language.Unknown)).toBe('');
    });
  });

  describe('getCommentIdentifier', () => {
    it('should return hash for Python', () => {
      expect(getCommentIdentifier(Language.Python)).toBe('#');
    });

    it('should return double slash for JavaScript', () => {
      expect(getCommentIdentifier(Language.JavaScript)).toBe('\\/\\/');
    });

    it('should return hash for Ruby', () => {
      expect(getCommentIdentifier(Language.Ruby)).toBe('#');
    });

    it('should return double dash for SQL', () => {
      expect(getCommentIdentifier(Language.SQL)).toBe('--');
    });

    it('should return HTML comment for HTML', () => {
      expect(getCommentIdentifier(Language.HTML)).toBe('<\\!--');
    });
  });

  describe('getCommentPrefix', () => {
    it('should return raw hash for Python', () => {
      expect(getCommentPrefix(Language.Python)).toBe('#');
    });

    it('should return raw double slash for JavaScript', () => {
      expect(getCommentPrefix(Language.JavaScript)).toBe('//');
    });

    it('should return raw HTML comment for HTML', () => {
      expect(getCommentPrefix(Language.HTML)).toBe('<!--');
    });
  });
});

describe('Type Validation', () => {
  describe('isValidSeverity', () => {
    it('should return true for valid severities', () => {
      expect(isValidSeverity('critical')).toBe(true);
      expect(isValidSeverity('error')).toBe(true);
      expect(isValidSeverity('warning')).toBe(true);
      expect(isValidSeverity('info')).toBe(true);
    });

    it('should return false for invalid severities', () => {
      expect(isValidSeverity('invalid')).toBe(false);
      expect(isValidSeverity('CRITICAL')).toBe(false);
      expect(isValidSeverity('')).toBe(false);
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('style')).toBe(true);
      expect(isValidCategory('bug-risk')).toBe(true);
      expect(isValidCategory('antipattern')).toBe(true);
      expect(isValidCategory('performance')).toBe(true);
      expect(isValidCategory('security')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('STYLE')).toBe(false);
      expect(isValidCategory('')).toBe(false);
    });
  });

  describe('Severity enum values', () => {
    it('should have correct string values', () => {
      expect(Severity.Critical).toBe('critical');
      expect(Severity.Error).toBe('error');
      expect(Severity.Warning).toBe('warning');
      expect(Severity.Info).toBe('info');
    });
  });

  describe('Category enum values', () => {
    it('should have correct string values', () => {
      expect(Category.Style).toBe('style');
      expect(Category.BugRisk).toBe('bug-risk');
      expect(Category.Antipattern).toBe('antipattern');
      expect(Category.Performance).toBe('performance');
      expect(Category.Security).toBe('security');
    });
  });
});
