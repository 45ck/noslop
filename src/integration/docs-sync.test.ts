/**
 * docs-sync: Gate tiers tables in docs/languages/*.md must match pack source.
 * Breaks CI when a gate is added, removed, or has its command changed without
 * updating the corresponding doc file.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PACKS } from '../presentation/packs.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..', '..');
const docsLanguagesDir = path.join(projectRoot, 'docs', 'languages');

interface DocRow {
  tier: string;
  command: string;
}

/**
 * Parse the "## Gate tiers" markdown table from a doc file.
 * Handles markdown-escaped pipes (\|) in command cells.
 */
function parseGateTiersTable(markdown: string): DocRow[] {
  const PIPE_PLACEHOLDER = '\x00';
  const lines = markdown.split('\n');
  let inSection = false;
  const rows: DocRow[] = [];

  for (const line of lines) {
    if (line.startsWith('## Gate tiers')) {
      inSection = true;
      continue;
    }
    if (inSection && line.startsWith('## ')) break;
    if (!inSection) continue;

    // Replace escaped pipes before splitting so they don't become column delimiters
    const safeLine = line.replace(/\\\|/g, PIPE_PLACEHOLDER);
    const cols = safeLine.split('|').map((s) => s.trim());
    // Expect: ['', tier, trigger, commandCell, '']
    if (cols.length < 4) continue;

    const tierCol = cols[1];
    const commandCol = cols[3];
    if (tierCol === undefined || commandCol === undefined) continue;

    const tier = tierCol.toLowerCase();
    if (!['fast', 'slow', 'ci'].includes(tier)) continue;

    // Restore escaped pipes in the command cell, then extract the backtick-wrapped command
    const commandCell = commandCol.replace(new RegExp(PIPE_PLACEHOLDER, 'g'), '|');
    const backtickMatch = /^`([^`]+)`/.exec(commandCell);
    if (!backtickMatch) continue;

    const command = backtickMatch[1];
    if (command === undefined) continue;
    rows.push({ tier, command });
  }

  return rows;
}

describe('docs-sync: gate tier tables match pack source', () => {
  for (const pack of ALL_PACKS) {
    describe(`${pack.name} pack (${pack.id})`, () => {
      const docPath = path.join(docsLanguagesDir, `${pack.id}.md`);

      let docRows: DocRow[];
      try {
        docRows = parseGateTiersTable(readFileSync(docPath, 'utf8'));
      } catch {
        it(`docs/languages/${pack.id}.md exists`, () => {
          expect.fail(`Missing doc file: ${docPath}`);
        });
        return;
      }

      for (const gate of pack.gates) {
        it(`gate '${gate.label}' (tier: ${gate.tier}) appears in table`, () => {
          const match = docRows.find(
            (row) => row.tier === gate.tier && row.command === gate.command,
          );
          expect(
            match,
            [
              `Gate '${gate.label}' not found in docs/languages/${pack.id}.md`,
              `  Expected: tier='${gate.tier}'  command='${gate.command}'`,
              `  Parsed rows from doc:`,
              ...docRows.map((r) => `    [${r.tier}] ${r.command}`),
            ].join('\n'),
          ).toBeDefined();
        });
      }
    });
  }
});
