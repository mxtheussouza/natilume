CREATE TABLE "Room" (
    "id" UUID PRIMARY KEY,
    "name" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL UNIQUE,
    "adminTokenHash" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Participant" (
    "id" UUID PRIMARY KEY,
    "roomId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "drawnToParticipantId" UUID NOT NULL UNIQUE,
    "revealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participant_drawnToParticipantId_fkey" FOREIGN KEY ("drawnToParticipantId") REFERENCES "Participant"("id")
        ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT "Participant_no_self_draw" CHECK ("id" <> "drawnToParticipantId")
);

CREATE UNIQUE INDEX "Participant_roomId_normalizedName_key" ON "Participant"("roomId", "normalizedName");
CREATE INDEX "Participant_roomId_revealedAt_idx" ON "Participant"("roomId", "revealedAt");
