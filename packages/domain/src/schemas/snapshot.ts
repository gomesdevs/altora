import { z } from "zod";

import { AssetSchema } from "./asset.js";
import { MoneySchema } from "./money.js";

export const EntityTypeSchema = z.enum(["holding", "spe", "pessoa"]);

export const SnapshotEntitySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: EntityTypeSchema,
  })
  .strict();

export const SnapshotSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int().min(1),
    capturedAt: z.string().datetime(),
    tenantId: z.string().min(1),
    entities: z.array(SnapshotEntitySchema),
    assets: z.array(AssetSchema),
    cash: MoneySchema,
  })
  .strict();

export type Snapshot = z.infer<typeof SnapshotSchema>;
export type SnapshotEntity = z.infer<typeof SnapshotEntitySchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
