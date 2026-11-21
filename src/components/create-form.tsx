"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type { CreatedRoom } from "@/lib/contracts";
import { ROOM_BODY_BYTES, tidyName, validateRoom } from "@/lib/validation";
import { CopyLink } from "./copy-link";
import { FestiveMark } from "./festive-mark";

export function CreateForm() {
  const [name, setName] = useState("");
  const [names, setNames] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<CreatedRoom>();
  const heading = useRef<HTMLHeadingElement>(null);
  const participants = names.trim() ? names.trim().split(/\r?\n/u) : [];
  const preview = participants.map(tidyName).filter(Boolean);

  useEffect(() => {
    if (created) heading.current?.focus();
  }, [created]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const input = { name, participants };
    const validation = validateRoom(input);
    if (validation.error) {
      setError(validation.error);
      return;
    }

    const body = JSON.stringify(input);
    if (new TextEncoder().encode(body).length > ROOM_BODY_BYTES) {
      setError("A lista excede o limite técnico de 256 KiB por solicitação.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!response.ok) {
        if (response.status === 400 || response.status === 413) {
          const failure = await response.json() as { error: string };
          setError(failure.error);
          return;
        }
        throw new Error();
      }
      setCreated(await response.json());
    } catch {
      setError("Não conseguimos confirmar a criação. Confira sua conexão e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <section className="card stack">
        <FestiveMark kind="celebration" />
        <h2 ref={heading} tabIndex={-1}>Sala criada!</h2>
        <p>O sorteio de {created.totalParticipants} participantes está pronto.</p>
        <CopyLink title="Link público" url={created.roomUrl} action="Copiar link público" description="Envie este mesmo link para toda a turma." />
        <CopyLink title="Link administrativo secreto" url={created.adminUrl} action="Copiar link secreto" description="Guarde este link só para você. Ele dá acesso ao andamento da sala e é a única forma de abrir o painel." />
      </section>
    );
  }

  return (
    <form className="card stack" onSubmit={submit} method="post" noValidate aria-busy={busy}>
      <div className="field">
        <label htmlFor="room-name">Nome da sala</label>
        <input id="room-name" name="name" autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ex. Natal da família" />
      </div>
      <div className="field">
        <label htmlFor="names">Participantes</label>
        <textarea id="names" name="participants" value={names} onChange={(event) => setNames(event.target.value)} required aria-describedby="names-hint" rows={7} placeholder={"Carol\nJúlia\nRafa"} />
        <p id="names-hint" className="hint">Escreva um nome ou apelido por linha. São necessários pelo menos dois nomes distintos.</p>
      </div>
      <div className="preview">
        <p>{preview.length === 1 ? "1 nome na lista" : `${preview.length} nomes na lista`}</p>
        {preview.length > 0 && <ul aria-label="Prévia de participantes">{preview.slice(0, 8).map((item, index) => <li key={index}>{item}</li>)}</ul>}
        {preview.length > 8 && <p>Mais {preview.length - 8} na lista.</p>}
      </div>
      <p className="hint">Quem tiver o link público pode escolher um nome disponível. Combinem de escolher apenas o próprio nome.</p>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="button primary" type="submit" disabled={busy}>{busy ? "Preparando a sala…" : "Criar sala e sortear"}</button>
    </form>
  );
}
