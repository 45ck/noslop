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
  const rows: DocRow[] = [];
  for (const line of extractGateTierSection(markdown)) {
    const row = parseGateTierRow(line);
    if (row) rows.push(row);
  }
  return rows;
}

function extractGateTierSection(markdown: string): string[] {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex((line) => line.startsWith('## Gate tiers'));
  if (startIndex === -1) return [];

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.startsWith('## ')) break;
    sectionLines.push(line);
  }
  return sectionLines;
}

function parseGateTierRow(line: string): DocRow | null {
  const pipePlaceholder = '\x00';
  const cols = line
    .replace(/\\\|/g, pipePlaceholder)
    .split('|')
    .map((segment) => segment.trim());
  if (cols.length < 4) return null;

  const tier = cols[1]?.toLowerCase();
  const commandCell = cols[3]?.replaceAll(pipePlaceholder, '|');
  if (!tier || !commandCell || !isGateTier(tier)) return null;

  const backtickMatch = /^`([^`]+)`/.exec(commandCell);
  const command = backtickMatch?.[1];
  return command ? { tier, command } : null;
}

function isGateTier(tier: string): tier is DocRow['tier'] {
  return ['fast', 'slow', 'ci'].includes(tier);
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
