import { z } from "zod";

import { MoneySchema } from "./money.js";

export const ValuationMethodSchema = z.enum([
  "market",
  "comparative",
  "income",
  "nav",
  "judgment",
  "laudo",
]);

export const ValuationSchema = z
  .object({
    amount: MoneySchema,
    method: ValuationMethodSchema,
    asOf: z.string().date(),
    source: z.string().min(1),
  })
  .strict();

export type Valuation = z.infer<typeof ValuationSchema>;
export type ValuationMethod = z.infer<typeof ValuationMethodSchema>;
