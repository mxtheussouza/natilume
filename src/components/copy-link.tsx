"use client";

import { useId, useRef, useState } from "react";

export function CopyLink({ title, url, description, action }: {
  title: string;
  url: string;
  description?: string;
  action: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Link copiado.");
    } catch {
      input.current?.focus();
      input.current?.select();
      setFeedback("Link selecionado. Use o comando de copiar do seu dispositivo.");
    }
  }

  return (
    <div className="copy-link">
      <label htmlFor={id}>{title}</label>
      {description && <p id={`${id}-hint`}>{description}</p>}
      <div className="copy-controls">
        <input ref={input} id={id} value={url} readOnly aria-describedby={description ? `${id}-hint` : undefined} />
        <button type="button" className="button secondary" onClick={copy}>{action}</button>
      </div>
      <span role="status">{feedback}</span>
    </div>
  );
}
