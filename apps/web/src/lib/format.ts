export function formatBrl(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPct(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}
