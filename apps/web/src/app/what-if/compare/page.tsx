import type { Metadata } from "next";
import Link from "next/link";

import { CompareView } from "./compare-view";

export const metadata: Metadata = {
  title: "Comparar cenários · Altora",
  description: "Comparação lado a lado de cenários what-if",
};

export default function WhatIfComparePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Altora
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <Link href="/what-if" className="hover:text-foreground">
          What-If
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-foreground">Comparar</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Comparar cenários
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Escolha 2 ou 3 simulações persistidas e compare caixa, yield e
          concentração. Resultados da API — sem motor no browser.
        </p>
      </header>

      <CompareView />
    </main>
  );
}
