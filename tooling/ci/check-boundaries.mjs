#!/usr/bin/env node
/**
 * Boundary tests — garante fronteiras de pacote do monorepo.
 *
 * - packages/domain: sem Nest, React, Prisma, Drizzle, Next, BullMQ
 * - apps/web: sem @altora/db, prisma, drizzle-orm, nestjs
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

const DOMAIN_FORBIDDEN = [
  /from\s+['"]@nestjs\//,
  /from\s+['"]@nestjs['"]/,
  /from\s+['"]nestjs/,
  /from\s+['"]react['"]/,
  /from\s+['"]react\//,
  /from\s+['"]react-dom/,
  /from\s+['"]next(\/|'|")/,
  /from\s+['"]@tanstack\//,
  /from\s+['"]@prisma\//,
  /from\s+['"]prisma['"]/,
  /from\s+['"]drizzle-orm/,
  /from\s+['"]@altora\/db['"]/,
  /from\s+['"]bullmq['"]/,
  /require\(\s*['"]@nestjs\//,
  /require\(\s*['"]react['"]/,
  /require\(\s*['"]drizzle-orm/,
];

const WEB_FORBIDDEN = [
  /from\s+['"]@altora\/db['"]/,
  /from\s+['"]@prisma\//,
  /from\s+['"]prisma['"]/,
  /from\s+['"]drizzle-orm/,
  /from\s+['"]@nestjs\//,
  /from\s+['"]bullmq['"]/,
  /require\(\s*['"]@altora\/db['"]/,
  /require\(\s*['"]drizzle-orm/,
];

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") {
        continue;
      }
      out.push(...(await walk(full)));
    } else if (SOURCE_EXT.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function scanFile(content, patterns) {
  const hits = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      continue;
    }
    for (const pattern of patterns) {
      if (pattern.test(line)) {
        hits.push({ line: i + 1, text: trimmed, pattern: String(pattern) });
      }
    }
  }
  return hits;
}

async function checkPackage(label, relDir, patterns) {
  const dir = path.join(root, relDir);
  const info = await stat(dir).catch(() => null);
  if (!info?.isDirectory()) {
    console.error(`${label}: directory missing (${relDir})`);
    return 1;
  }

  const files = await walk(dir);
  let failures = 0;
  for (const file of files) {
    const content = await readFile(file, "utf8");
    const hits = scanFile(content, patterns);
    for (const hit of hits) {
      const rel = path.relative(root, file);
      console.error(`${label} violation: ${rel}:${hit.line}`);
      console.error(`  ${hit.text}`);
      failures += 1;
    }
  }

  if (failures === 0) {
    console.log(`ok ${label} (${files.length} files)`);
  }
  return failures;
}

let failed = 0;
failed += await checkPackage(
  "domain-purity",
  "packages/domain/src",
  DOMAIN_FORBIDDEN,
);
failed += await checkPackage("web-no-db", "apps/web", WEB_FORBIDDEN);

if (failed > 0) {
  console.error(`test:boundaries failed (${failed} violation(s))`);
  process.exit(1);
}

console.log("test:boundaries ok");
