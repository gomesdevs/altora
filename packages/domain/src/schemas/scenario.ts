import { z } from "zod";

import { PremisesSchema, type Premises } from "./premises.js";

export const ScenarioSchema = z
  .object({
    premises: PremisesSchema.default({}),
    variants: z.array(PremisesSchema).optional(),
  })
  .strict();

export type Scenario = {
  premises: Premises;
  variants?: Premises[];
};
