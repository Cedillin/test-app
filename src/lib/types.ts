export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string; // optional URL; Avatar falls back to colored initials
};

export type RosterEntry = {
  memberId: string;
  status: 'registered';
  registeredAt: string; // ISO
};

export type ClassSession = {
  id: string;
  name: string;       // "BJJ /Grappling"
  date: string;       // "YYYY-MM-DD" (normalized to today on load)
  startTime: string;  // "10:00"
  endTime: string;    // "11:00"
  instructor: string; // "Lautaro S."
  tags: string[];     // ["KIDS","YOGA","MMA","BJJ"]
  capacity: number;
  roster: RosterEntry[];
};

export type CheckIn = {
  id: string;
  classId: string;
  memberId: string;
  status: 'confirmed';
  checkedInAt: string; // ISO
};

export type Attendee = {
  memberId: string;
  status: 'registered' | 'confirmed';
  at: string; // ISO of registration or check-in
};
