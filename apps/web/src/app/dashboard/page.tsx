import type { Metadata } from "next";
import Link from "next/link";

import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard · Altora",
  description: "Consolidação patrimonial do tenant",
};

export default function DashboardPage() {
  return (
    <main
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "3rem clamp(1.25rem, 4vw, 3rem)",
        maxWidth: 880,
        margin: "0 auto",
        color: "#1a1a1a",
        background:
          "linear-gradient(180deg, #f7f4ef 0%, #f3eee6 45%, #efe8dc 100%)",
        minHeight: "100vh",
      }}
    >
      <nav style={{ marginBottom: "2rem", fontSize: "0.9rem" }}>
        <Link href="/" style={{ color: "inherit", opacity: 0.7 }}>
          Altora
        </Link>
        <span style={{ opacity: 0.4 }}> / </span>
        <span>Dashboard</span>
        <span style={{ opacity: 0.4 }}> · </span>
        <Link href="/what-if" style={{ color: "inherit", opacity: 0.7 }}>
          What-If
        </Link>
        <span style={{ opacity: 0.4 }}> · </span>
        <Link href="/assets/new" style={{ color: "inherit", opacity: 0.7 }}>
          Novo ativo
        </Link>
      </nav>

      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem", fontWeight: 600 }}>
          Patrimônio consolidado
        </h1>
        <p style={{ margin: 0, opacity: 0.7, maxWidth: 36 * 16 }}>
          Visão do tenant Silva Family Office — PL, yield e alocação por classe.
        </p>
      </header>

      <DashboardView />
    </main>
  );
}
