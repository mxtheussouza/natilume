import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Natilume · Amigo Secreto de Natal", template: "%s · Natilume" },
  description: "Crie seu Amigo Secreto de Natal e compartilhe um link com toda a turma.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>
        <header className="site-header">
          <div className="site-width header-inner">
            <Link href="/" className="brand">Natilume<span aria-hidden="true">✦</span></Link>
            <Link href="/criar" className="header-link">Criar sala</Link>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="site-width footer-inner"><Link href="/" className="brand">Natilume<span aria-hidden="true">✦</span></Link><span>Amigo Secreto de Natal</span></div>
        </footer>
      </body>
    </html>
  );
}
