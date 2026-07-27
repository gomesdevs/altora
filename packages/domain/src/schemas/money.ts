import { z } from "zod";

export const MoneySchema = z
  .object({
    amount: z.number(),
    currency: z.literal("BRL"),
  })
  .strict();

export type Money = z.infer<typeof MoneySchema>;

export function brl(amount: number): Money {
  return { amount, currency: "BRL" };
}
