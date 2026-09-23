import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabriel AI Hub",
  description: "Seu espaço pessoal para faculdade, concursos, IPE Trading e carreira.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head><link rel="stylesheet" href="/katex/katex.min.css" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

