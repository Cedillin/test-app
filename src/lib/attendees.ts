import type { RosterEntry, CheckIn, Attendee } from './types';

export function mergeAttendees(roster: RosterEntry[], checkins: CheckIn[]): Attendee[] {
  const byId = new Map<string, Attendee>();
  for (const r of roster) {
    byId.set(r.memberId, { memberId: r.memberId, status: 'registered', at: r.registeredAt });
  }
  for (const c of checkins) {
    byId.set(c.memberId, { memberId: c.memberId, status: 'confirmed', at: c.checkedInAt }); // overrides
  }
  return [...byId.values()];
}

export function attendeeCount(roster: RosterEntry[], checkins: CheckIn[]): number {
  return mergeAttendees(roster, checkins).length;
}

export function isCheckedIn(memberId: string, checkins: CheckIn[]): boolean {
  return checkins.some((c) => c.memberId === memberId);
}
