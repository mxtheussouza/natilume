"use client";

import { FestiveMark } from "@/components/festive-mark";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="page-shell card stack">
      <FestiveMark kind="snowflake" />
      <h1>Algo saiu do previsto</h1>
      <p>Tente atualizar para continuar.</p>
      <button type="button" className="button primary" onClick={reset}>Tentar de novo</button>
    </section>
  );
}
