import type { Metadata } from "next";
import { CreateForm } from "@/components/create-form";

export const metadata: Metadata = { title: "Criar sala" };

export default function CreatePage() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Crie sua sala</h1>
        <p>Reúna os nomes da turma para começar o Amigo Secreto.</p>
      </header>
      <CreateForm />
    </div>
  );
}
