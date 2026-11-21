import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell card">
      <h1>Página não encontrada</h1>
      <p>Confira se o endereço está completo.</p>
      <Link href="/" className="button primary">Voltar ao início</Link>
    </section>
  );
}
