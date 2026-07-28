import type { Metadata } from "next";
import Link from "next/link";

import { AssetWizardView } from "./asset-wizard-view";

export const metadata: Metadata = {
  title: "Novo ativo · Altora",
  description: "Cadastro de imóvel ou FII",
};

export default function NewAssetPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 sm:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Altora</Link>
        <span className="mx-2 opacity-40">/</span>
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-foreground">Novo ativo</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Cadastrar ativo
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Wizard mínimo para imóvel ou FII. Tenant resolvido pelo JWT na API.
        </p>
      </header>

      <AssetWizardView />
    </main>
  );
}
