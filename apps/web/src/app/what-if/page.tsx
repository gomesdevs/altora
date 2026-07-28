import type { Metadata } from "next";
import Link from "next/link";

import { WhatIfView } from "./what-if-view";

export const metadata: Metadata = {
  title: "What-If · Altora",
  description: "Modelagem hipotética de cenários patrimoniais",
};

export default function WhatIfPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-12 sm:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Altora</Link>
        <span className="mx-2 opacity-40">/</span>
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-foreground">What-If</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Modelagem what-if
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cenários hipotéticos sobre o portfólio Silva Family Office. Premissas
          enviadas à API; resultados exibidos sem recálculo no browser.{" "}
          <Link href="/what-if/compare" className="underline underline-offset-4">
            Comparar cenários
          </Link>
        </p>
      </header>

      <WhatIfView />
    </main>
  );
}
