import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { resolveTemplatesDir } from '../infrastructure/adapters/node-filesystem.js';

export const templatesDir = resolveTemplatesDir();

export function readTemplate(packId: string, relPath: string): string {
  return readFileSync(path.join(templatesDir, 'packs', packId, relPath), 'utf8');
}

export function templateExists(packId: string, relPath: string): boolean {
  try {
    statSync(path.join(templatesDir, 'packs', packId, relPath));
    return true;
  } catch {
    return false;
  }
}

export function allPackIds(): string[] {
  return readdirSync(path.join(templatesDir, 'packs'));
}

export const ALL_PACK_IDS = [
  'typescript',
  'javascript',
  'rust',
  'dotnet',
  'python',
  'java',
  'go',
  'ruby',
  'kotlin',
  'swift',
  'php',
  'scala',
  'elixir',
  'dart',
  'haskell',
  'lua',
  'cpp',
  'zig',
  'ocaml',
];

export const TYPOS_PACKS = ALL_PACK_IDS.filter((id) => id !== 'typescript' && id !== 'javascript');
