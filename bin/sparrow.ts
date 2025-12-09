#!/usr/bin/env node
/**
 * Sparrow CLI - Globstar-compatible static analysis tool
 *
 * A backward-compatible reimplementation of the MIT-licensed Globstar.dev SAST tool.
 * Original Globstar: https://github.com/DeepSourceCorp/globstar
 *
 * Usage:
 *   sparrow scan <path>     - Scan a file or directory for issues
 *   sparrow test <dir>      - Run checker tests
 *
 * @license MIT
 */

import { scan, runTests, formatResults, formatTestResults } from '../src/index.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Sparrow - Globstar-compatible static analysis tool\n');
    console.log('Usage:');
    console.log('  sparrow scan <path>     - Scan a file or directory');
    console.log('  sparrow test <dir>      - Run checker tests');
    console.log('');
    process.exit(1);
  }

  switch (command) {
    case 'scan': {
      const targetPath = args[1] || '.';
      console.log(`Scanning: ${targetPath}\n`);

      try {
        const issues = await scan(targetPath);

        if (issues.length === 0) {
          console.log('No issues found!');
        } else {
          console.log(formatResults(issues, 'text'));
          console.log(`\nTotal issues: ${issues.length}`);
        }

        process.exit(issues.length > 0 ? 1 : 0);
      } catch (error) {
        console.error('Error during scan:', error);
        process.exit(2);
      }
      break;
    }

    case 'test': {
      const testDir = args[1] || './checkers';
      console.log(`Running tests in: ${testDir}\n`);

      try {
        const result = await runTests(testDir);
        console.log(formatTestResults(result));
        process.exit(result.passed ? 0 : 1);
      } catch (error) {
        console.error('Error running tests:', error);
        process.exit(2);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch(console.error);
