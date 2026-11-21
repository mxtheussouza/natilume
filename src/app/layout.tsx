import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Gift } from "lucide-react";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
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
            <Link href="/" className="brand"><span className="brand-icon"><Gift size={20} aria-hidden="true" /></span>Natilume</Link>
            <Link href="/criar" className="header-link">Criar sala</Link>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="site-width footer-inner"><Link href="/" className="brand"><span className="brand-icon"><Gift size={20} aria-hidden="true" /></span>Natilume</Link><span>Amigo Secreto de Natal</span></div>
        </footer>
      </body>
    </html>
  );
}
