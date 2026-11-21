import Link from "next/link";

export default function Home() {
  return (
    <div className="site-width">
      <section className="hero">
        <div className="hero-copy">
          <h1>O Natal fica mais mágico com um segredo.</h1>
          <p>Crie seu Amigo Secreto, compartilhe um link com toda a turma e deixe a surpresa acontecer.</p>
          <Link href="/criar" className="button primary">Criar minha sala</Link>
        </div>
      </section>
      <section aria-labelledby="passos" className="steps">
        <h2 id="passos">Como funciona</h2>
        <ol>
          <li><h3>Crie sua sala</h3><p>Dê um nome à sala e escreva quem vai participar.</p></li>
          <li><h3>Compartilhe o link</h3><p>Envie o mesmo link para toda a turma.</p></li>
          <li><h3>Revele a surpresa</h3><p>Cada pessoa escolhe o próprio nome e abre seu presente.</p></li>
        </ol>
      </section>
    </div>
  );
}
