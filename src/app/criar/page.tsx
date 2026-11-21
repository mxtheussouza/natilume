import type { Metadata } from "next";
import { FestiveMark } from "@/components/festive-mark";
import { CreateForm } from "@/components/create-form";

export const metadata: Metadata = { title: "Criar sala" };

export default function CreatePage() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <FestiveMark kind="gift" />
        <h1>Crie sua sala</h1>
        <p>Reúna os nomes da turma para começar o Amigo Secreto.</p>
      </header>
      <CreateForm />
    </div>
  );
}
