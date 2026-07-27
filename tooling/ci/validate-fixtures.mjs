#!/usr/bin/env node
/**
 * Valida fixtures JSON do harness contra schemas Draft-07 (ajv).
 * Fonte canônica: docs/domain/harness/fixtures/ + schemas/
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);
const schemasDir = path.join(root, "docs/domain/harness/schemas");
const fixturesDir = path.join(root, "docs/domain/harness/fixtures");

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateSchema: false,
});
addFormats(ajv);

const schemaFiles = (await readdir(schemasDir)).filter((f) =>
  f.endsWith(".schema.json"),
);

for (const file of schemaFiles) {
  const schema = JSON.parse(await readFile(path.join(schemasDir, file), "utf8"));
  // Remover $id para que $ref relativos (asset.schema.json) resolvam pelo key do addSchema
  delete schema.$id;
  ajv.addSchema(schema, file);
}

const validateFixture = ajv.getSchema("fixture.schema.json");
if (!validateFixture) {
  console.error("fixture.schema.json não registrado no ajv");
  process.exit(1);
}

const entries = await readdir(fixturesDir);
const fixtures = entries
  .filter((f) => f.endsWith(".fixture.json"))
  .filter((f) => !f.startsWith("_"));

if (fixtures.length === 0) {
  console.error("no fixtures found");
  process.exit(1);
}

let failed = 0;
for (const file of fixtures.sort()) {
  const raw = await readFile(path.join(fixturesDir, file), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`${file}: invalid JSON`, err);
    failed += 1;
    continue;
  }

  const ok = validateFixture(data);
  if (!ok) {
    console.error(`${file}: schema validation failed`);
    for (const err of validateFixture.errors ?? []) {
      console.error(`  - ${err.instancePath || "/"} ${err.message}`);
    }
    failed += 1;
  } else {
    console.log(`ok ${file}`);
  }
}

if (failed > 0) {
  console.error(`validate:fixtures failed (${failed}/${fixtures.length})`);
  process.exit(1);
}

console.log(`validate:fixtures ok (${fixtures.length} files, ajv)`);
