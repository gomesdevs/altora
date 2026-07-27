import { confidenceForAssetType } from "@altora/domain";

export default function HomePage() {
  const peConfidence = confidenceForAssetType("pe");

  return (
    <main style={{ fontFamily: "Georgia, serif", padding: "3rem" }}>
      <h1>Altora</h1>
      <p>Sistema operacional do patrimônio alternativo brasileiro.</p>
      <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
        Bootstrap OK — confiança PE tipada: {peConfidence}
      </p>
    </main>
  );
}
