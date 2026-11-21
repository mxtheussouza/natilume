import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminParticipants } from "@/components/admin-participants";
import { CopyLink } from "@/components/copy-link";
import { getAdminRoom } from "@/server/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel da sala", robots: { index: false, follow: false } };

export default async function AdminPage({ params }: { params: Promise<{ adminToken: string }> }) {
  const room = await getAdminRoom((await params).adminToken).catch(() => {
    console.error("[natilume] Falha ao carregar painel.");
    throw new Error("Falha ao carregar painel.");
  });
  if (!room) notFound();

  return (
    <div className="page-shell admin-page">
      <header className="page-heading">
        <p className="eyebrow"><LockKeyhole size={17} aria-hidden="true" /> Painel da sala</p>
        <h1>{room.name}</h1>
        <p>Guarde o endereço deste painel só para você. Compartilhe com a turma apenas o link público abaixo.</p>
      </header>
      <section className="card stack" aria-labelledby="room-summary">
        <h2 id="room-summary">Andamento do sorteio</h2>
        <dl className="stats">
          <div><dt>Total</dt><dd>{room.totalParticipants}</dd></div>
          <div><dt>Revelaram</dt><dd>{room.revealedCount}</dd></div>
          <div><dt>Pendentes</dt><dd>{room.pendingCount}</dd></div>
        </dl>
        {room.pendingCount === 0 && <p className="notice">Sala encerrada. Todos já revelaram.</p>}
        <CopyLink title="Link público" url={room.publicUrl} action="Copiar link público" />
      </section>
      <section className="card stack" aria-labelledby="room-participants">
        <h2 id="room-participants">Participantes</h2>
        <AdminParticipants participants={room.participants} />
        <p className="hint">Recarregue a página para ver o andamento atualizado.</p>
        <p className="hint">Se precisar corrigir a lista, crie uma nova sala para o grupo.</p>
      </section>
    </div>
  );
}
