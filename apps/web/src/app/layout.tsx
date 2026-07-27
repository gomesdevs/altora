import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Altora",
  description: "Sistema operacional do patrimônio alternativo brasileiro",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
