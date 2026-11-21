import Image from "next/image";
import Link from "next/link";
import { Gift, Link2, ListPlus, Sparkles } from "lucide-react";

const steps = [
  { icon: ListPlus, title: "Crie sua sala", desc: "Dê um nome à sala e adicione todo mundo que vai participar." },
  { icon: Link2, title: "Compartilhe o link", desc: "Envie o mesmo link para toda a turma. É só abrir e escolher o próprio nome." },
  { icon: Gift, title: "Revele a surpresa", desc: "Cada pessoa descobre quem tirou uma única vez e guarda o segredo." },
];

export default function Home() {
  return (
    <div className="site-width">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={17} aria-hidden="true" /> Amigo Secreto de Natal</p>
          <h1>Um segredo.<br />Um Natal <em>mais mágico.</em></h1>
          <p className="hero-description">Crie seu Amigo Secreto, compartilhe um link com toda a turma e deixe a surpresa acontecer.</p>
          <Link href="/criar" className="button primary hero-action"><Gift size={19} aria-hidden="true" /> Criar minha sala</Link>
        </div>
        <div className="hero-art">
          <Image src="/natal.svg" alt="" width={540} height={470} preload unoptimized />
        </div>
      </section>
      <section aria-labelledby="passos" className="steps">
        <div className="steps-heading">
          <Sparkles size={21} aria-hidden="true" />
          <h2 id="passos">Como funciona</h2>
        </div>
        <ol>
          {steps.map(({ icon: Icon, title, desc }) => (
            <li key={title}>
              <span className="step-icon"><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
