"use client";

import { useState } from "react";
import type { AdminRoom } from "@/lib/contracts";
import { nameKey } from "@/lib/validation";

const PAGE_SIZE = 50;

export function AdminParticipants({ participants }: { participants: AdminRoom["participants"] }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const key = nameKey(query);
  const filtered = participants.filter(({ name }) => nameKey(name).includes(key));
  const start = index * PAGE_SIZE;
  const hasPrevious = index > 0;
  const hasNext = start + PAGE_SIZE < filtered.length;

  return (
    <>
      {participants.length > PAGE_SIZE && (
        <div className="field">
          <label htmlFor="admin-name-search">Buscar participante</label>
          <input id="admin-name-search" type="search" value={query} onChange={(event) => {
            setIndex(0);
            setQuery(event.target.value);
          }} />
        </div>
      )}
      {filtered.length > 0 ? (
        <table className="participant-table">
          <thead><tr><th scope="col">Nome</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {filtered.slice(start, start + PAGE_SIZE).map(({ name, revealed }) => (
              <tr key={name}>
                <td>{name}</td>
                <td><span className={revealed ? "status-revealed" : "status-pending"}>{revealed ? "Revelou" : "Pendente"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p role="status">Nenhum nome encontrado.</p>}
      {(hasPrevious || hasNext) && (
        <div className="actions">
          <button type="button" className="button secondary" disabled={!hasPrevious} onClick={() => setIndex(index - 1)}>Anterior</button>
          <span role="status">Página {index + 1} de {Math.ceil(filtered.length / PAGE_SIZE)}</span>
          <button type="button" className="button secondary" disabled={!hasNext} onClick={() => setIndex(index + 1)}>Próxima</button>
        </div>
      )}
    </>
  );
}
