export type AvailableParticipant = { id: string; name: string };

export type PublicRoom = {
  name: string;
  totalParticipants: number;
  pendingCount: number;
  availableParticipants: AvailableParticipant[];
  status: "active" | "closed";
};

export type CreatedRoom = {
  roomUrl: string;
  adminUrl: string;
  totalParticipants: number;
};
