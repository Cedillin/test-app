import React, { createContext, useContext, useEffect, useReducer } from 'react';
import membersData from '../data/members.json';
import classesData from '../data/classes.json';
import type { Member, ClassSession, CheckIn } from '../lib/types';
import { reducer, initialState, type State } from './reducer';
import { todayIso, normalizeToToday } from '../lib/dates';
import { loadCheckIns, saveCheckIns, purgeBefore, clearDay } from '../lib/storage';
import { isCheckedIn } from '../lib/attendees';

type CheckInResult = { ok: boolean; reason?: 'duplicate' };

const Ctx = createContext<{
  state: State;
  checkIn: (classId: string, memberId: string) => CheckInResult;
  resetToday: () => void;
} | null>(null);

function useCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error('CheckInProvider missing');
  return v;
}

let counter = 0;
const newId = () => `ci_${Date.now()}_${counter++}`;

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const date = todayIso();
      await purgeBefore(date);
      const checkins = await loadCheckIns(date);
      const members = membersData as Member[];
      const classes = (classesData as Omit<ClassSession, 'date'>[]).map((c) =>
        normalizeToToday({ ...c, date: '' } as ClassSession, date),
      );
      dispatch({ type: 'HYDRATE', date, members, classes, checkins });
    })();
  }, []);

  const checkIn = (classId: string, memberId: string): CheckInResult => {
    const forClass = state.checkins.filter((c) => c.classId === classId);
    if (isCheckedIn(memberId, forClass)) return { ok: false, reason: 'duplicate' };
    const checkin: CheckIn = {
      id: newId(), classId, memberId, status: 'confirmed', checkedInAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CHECKIN', checkin });
    saveCheckIns(state.date, [...state.checkins, checkin]);
    return { ok: true };
  };

  const resetToday = () => {
    dispatch({ type: 'RESET_DAY' });
    clearDay(state.date);
  };

  return <Ctx.Provider value={{ state, checkIn, resetToday }}>{children}</Ctx.Provider>;
}

export const useHydrated = () => useCtx().state.hydrated;
export const useClasses = (): ClassSession[] => useCtx().state.classes;
export const useMembers = (): Member[] => useCtx().state.members;
export const useClass = (id: string) => useCtx().state.classes.find((c) => c.id === id);
export const useMember = (id: string) => useCtx().state.membersById[id];
export const useCheckIns = (classId: string): CheckIn[] =>
  useCtx().state.checkins.filter((c) => c.classId === classId);
export const useCheckInActions = () => {
  const { checkIn, resetToday } = useCtx();
  return { checkIn, resetToday };
};
