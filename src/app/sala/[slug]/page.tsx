import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomExperience } from "@/components/room-experience";
import { getPublicRoom } from "@/server/rooms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sala de Amigo Secreto", robots: { index: false, follow: false } };

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getPublicRoom(slug).catch(() => {
    console.error("[natilume] Falha ao carregar sala.");
    throw new Error("Falha ao carregar sala.");
  });
  if (!room) notFound();
  return <RoomExperience key={slug} slug={slug} initialRoom={room} />;
}
