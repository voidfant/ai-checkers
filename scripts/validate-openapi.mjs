import { readFile } from 'node:fs/promises';
import process from 'node:process';

const targetFile = process.argv[2] ?? 'docs/openapi.yaml';
const file = await readFile(targetFile, 'utf8');

const requiredTokens = ['openapi:', 'info:', 'paths:'];
const missingTokens = requiredTokens.filter((token) => !file.includes(token));

if (missingTokens.length > 0) {
  console.error(`OpenAPI validation failed for ${targetFile}.`);
  console.error(`Missing required sections: ${missingTokens.join(', ')}`);
  process.exit(1);
}

console.log(`OpenAPI basic validation passed: ${targetFile}`);
