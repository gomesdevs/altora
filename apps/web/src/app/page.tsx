import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "3rem",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7f4ef 0%, #efe8dc 100%)",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Altora</h1>
      <p style={{ opacity: 0.75, maxWidth: 28 * 16 }}>
        Sistema operacional do patrimônio alternativo brasileiro.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <Link
          href="/login"
          style={{
            color: "inherit",
            borderBottom: "1px solid currentColor",
            textDecoration: "none",
          }}
        >
          Entrar
        </Link>
        {" · "}
        <Link
          href="/dashboard"
          style={{
            color: "inherit",
            borderBottom: "1px solid currentColor",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>
        {" · "}
        <Link
          href="/what-if"
          style={{
            color: "inherit",
            borderBottom: "1px solid currentColor",
            textDecoration: "none",
          }}
        >
          What-If
        </Link>
        {" · "}
        <Link
          href="/assets/new"
          style={{
            color: "inherit",
            borderBottom: "1px solid currentColor",
            textDecoration: "none",
          }}
        >
          Novo ativo
        </Link>
      </p>
    </main>
  );
}
