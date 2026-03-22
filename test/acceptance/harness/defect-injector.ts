import { promises as fsp } from 'node:fs';
import path from 'node:path';
import type { DefectSpec } from './types.js';

export async function injectDefect(tmpDir: string, defect: DefectSpec): Promise<void> {
  const filePath = path.join(tmpDir, defect.relativePath);
  const content = await fsp.readFile(filePath, 'utf8');

  const occurrences = content.split(defect.find).length - 1;
  if (occurrences === 0) {
    throw new Error(
      `Defect injection failed: "${defect.find}" not found in ${defect.relativePath}`,
    );
  }
  if (occurrences > 1) {
    throw new Error(
      `Defect injection ambiguous: "${defect.find}" found ${occurrences} times in ${defect.relativePath}`,
    );
  }

  const corrupted = content.replace(defect.find, defect.replace);
  await fsp.writeFile(filePath, corrupted, 'utf8');
}
