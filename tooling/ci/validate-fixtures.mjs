#!/usr/bin/env node
/**
 * Valida fixtures JSON do harness de domínio contra fixture.schema.json.
 * Requer ajv após bootstrap completo; por enquanto só checa presença e JSON válido.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);
const fixturesDir = path.join(root, "docs/domain/harness/fixtures");

const entries = await readdir(fixturesDir);
const fixtures = entries.filter((f) => f.endsWith(".fixture.json"));

if (fixtures.length === 0) {
  console.error("no fixtures found");
  process.exit(1);
}

let failed = 0;
for (const file of fixtures) {
  const raw = await readFile(path.join(fixturesDir, file), "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.id || !parsed.input || !parsed.expected) {
      console.error(`${file}: missing id/input/expected`);
      failed += 1;
    } else {
      console.log(`ok ${file}`);
    }
  } catch (err) {
    console.error(`${file}: invalid JSON`, err);
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log(`validate:fixtures ok (${fixtures.length} files)`);
