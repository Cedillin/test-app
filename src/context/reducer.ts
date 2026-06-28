import type { ClassSession, Member, CheckIn } from '../lib/types';

export type State = {
  hydrated: boolean;
  date: string;
  membersById: Record<string, Member>;
  members: Member[];
  classes: ClassSession[];
  checkins: CheckIn[];
};

export const initialState: State = {
  hydrated: false,
  date: '',
  membersById: {},
  members: [],
  classes: [],
  checkins: [],
};

export type Action =
  | { type: 'HYDRATE'; date: string; members: Member[]; classes: ClassSession[]; checkins: CheckIn[] }
  | { type: 'ADD_CHECKIN'; checkin: CheckIn }
  | { type: 'RESET_DAY' };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return {
        hydrated: true,
        date: action.date,
        members: action.members,
        membersById: Object.fromEntries(action.members.map((m) => [m.id, m])),
        classes: action.classes,
        checkins: action.checkins,
      };
    case 'ADD_CHECKIN': {
      const exists = state.checkins.some(
        (c) => c.classId === action.checkin.classId && c.memberId === action.checkin.memberId,
      );
      if (exists) return state;
      return { ...state, checkins: [...state.checkins, action.checkin] };
    }
    case 'RESET_DAY':
      return { ...state, checkins: [] };
    default:
      return state;
  }
}
