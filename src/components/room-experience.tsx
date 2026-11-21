"use client";

import { useEffect, useRef, useState } from "react";
import type { AvailableParticipant, PublicRoom } from "@/lib/contracts";
import { nameKey } from "@/lib/validation";
import { FestiveMark } from "./festive-mark";

const PAGE_SIZE = 75;

export function RoomExperience({ slug, initialRoom }: { slug: string; initialRoom: PublicRoom }) {
  const [room, setRoom] = useState(initialRoom);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const confirmation = useRef<HTMLDialogElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const roomHeading = useRef<HTMLHeadingElement>(null);
  const address = `/api/rooms/${slug}`;
  const match = room.availableParticipants.find(({ id }) => id === selected);
  const queryKey = nameKey(query);
  const matches = room.availableParticipants.filter(({ name }) => nameKey(name).includes(queryKey));

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload();
    }
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch(address, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const fresh: PublicRoom = await response.json();
      setRoom(fresh);
      setSelected((id) => fresh.availableParticipants.some((item) => item.id === id) ? id : "");
    } catch {
      setNotice((previous) => previous || "A lista não pôde ser atualizada. Tente novamente.");
    } finally {
      setRefreshing(false);
    }
  }

  function removeFromList(participant: AvailableParticipant) {
    setRoom((current) => {
      const availableParticipants = current.availableParticipants.filter(({ id }) => id !== participant.id);
      return { ...current, availableParticipants, pendingCount: availableParticipants.length, status: availableParticipants.length ? "active" : "closed" };
    });
    setSelected("");
  }

  async function reveal() {
    if (!match || busy) return;
    confirmation.current?.close();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`${address}/reveal`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: match.id }),
      });
      if (response.ok) {
        const data: { recipientName: string } = await response.json();
        removeFromList(match);
        setResult(data.recipientName);
      } else if (response.status === 409) {
        removeFromList(match);
        setNotice("Esse nome já fez a revelação. Escolha seu nome se ele ainda estiver na lista.");
      } else if (response.status === 404) {
        setNotice("O nome selecionado não está disponível nesta sala.");
      } else {
        throw new Error();
      }
    } catch {
      setNotice("Não foi possível confirmar a revelação. Se a revelação foi registrada, o resultado só podia aparecer naquela resposta. Atualize a lista para conferir seu nome.");
      return;
    } finally {
      setBusy(false);
    }
    await refresh();
  }

  return (
    <div className="page-shell">
      <header className="page-heading">
        <FestiveMark kind="gift" />
        <h1 ref={roomHeading} tabIndex={-1}>{room.name}</h1>
        <label className="progress-label" htmlFor="room-progress">{room.totalParticipants - room.pendingCount} de {room.totalParticipants} revelaram</label>
        <progress id="room-progress" max={room.totalParticipants} value={room.totalParticipants - room.pendingCount} />
      </header>

      {notice && <p className="notice" role="alert">{notice}</p>}
      {busy && <p className="notice" role="status">Revelando… Mantenha esta página aberta.</p>}

      {result ? (
        <section className="card result-card stack">
          <div className="result-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div>
          <FestiveMark kind="sparkles" warm />
          <h2 ref={resultHeading} tabIndex={-1}>Você tirou <strong>{result}</strong></h2>
          <p>Guarde este nome em segredo. Anote antes de ocultar ou sair. O resultado aparece uma única vez.</p>
          <button className="button secondary" type="button" onClick={() => {
            setResult(undefined);
            roomHeading.current?.focus();
          }}>Ocultar resultado</button>
        </section>
      ) : room.status === "closed" ? (
        <section className="card closed-card stack">
          <FestiveMark kind="celebration" />
          <h2>Sala encerrada</h2>
          <p>Todos já revelaram seu Amigo Secreto. Que venha a troca de presentes!</p>
        </section>
      ) : (
        <section className="card stack">
          <h2>Escolha seu nome</h2>
          <p>Cada nome dá direito a uma única revelação.</p>
          {(room.availableParticipants.length > 12 || query.length > 0) && (
            <div className="field">
              <label htmlFor="name-search">Buscar nome</label>
              <input id="name-search" type="search" value={query} disabled={busy} onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
                setSelected("");
              }} />
            </div>
          )}
          <div className="field">
            <label htmlFor="participant">Seu nome</label>
            <select id="participant" value={selected} onChange={(event) => setSelected(event.target.value)} disabled={busy || !matches.length}>
              <option value="">{matches.length ? "Selecione seu nome" : "Nenhum nome encontrado"}</option>
              {matches.slice(0, visible).map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          {matches.length > visible && <button type="button" className="button secondary" onClick={() => setVisible(visible + PAGE_SIZE)}>Mostrar mais nomes</button>}
          <div className="actions">
            <button className="button primary" type="button" disabled={!match || busy || refreshing} onClick={() => confirmation.current?.showModal()}>Revelar meu Amigo Secreto</button>
            <button className="button secondary" type="button" disabled={busy || refreshing} onClick={() => {
              setNotice("");
              void refresh();
            }}>{refreshing ? "Atualizando…" : "Atualizar lista"}</button>
          </div>
          <p className="hint">Qualquer pessoa com o link pode selecionar um nome disponível. Escolha apenas o seu.</p>
        </section>
      )}

      <dialog ref={confirmation} aria-labelledby="confirm-title" aria-describedby="confirm-hint">
        <div className="stack">
          <h2 id="confirm-title">Você é {match?.name}?</h2>
          <p id="confirm-hint">Confirme apenas se este é o seu nome. Mantenha a página aberta até ver o resultado, pois ele só aparece uma vez.</p>
          <div className="actions">
            <form method="dialog"><button className="button secondary" type="submit">Voltar</button></form>
            <button className="button primary" type="button" onClick={reveal}>Confirmar e revelar</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
