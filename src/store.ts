import { format, subDays, startOfWeek, addDays } from 'date-fns';
import type { Store, Khatam, PageEntry, DayReading, ActivityDay } from './types';

const KEY = 'khatam-tracker';
export const TOTAL_PAGES = 604;

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.pageHistory) parsed.pageHistory = [];
      // backfill startPage on entries written before the field existed
      parsed.pageHistory = parsed.pageHistory.map((e: PageEntry) =>
        e.startPage !== undefined ? e : { ...e, startPage: e.page }
      );
      return parsed;
    }
  } catch {}
  return { khatams: [], currentPage: 1, pageHistory: [] };
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getStore(): Store {
  return load();
}

export function addKhatam(date: string, notes?: string): Store {
  const store = load();
  const khatam: Khatam = {
    id: crypto.randomUUID(),
    completedAt: date,
    notes,
  };
  store.khatams = [khatam, ...store.khatams].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  store.currentPage = 1;
  save(store);
  return store;
}

export function deleteKhatam(id: string): Store {
  const store = load();
  store.khatams = store.khatams.filter((k) => k.id !== id);
  save(store);
  return store;
}

export function updateCurrentPage(page: number): Store {
  const store = load();
  const clamped = Math.max(1, Math.min(TOTAL_PAGES, page));
  store.currentPage = clamped;

  // Record today's page snapshot — one entry per day, always latest wins
  const today = format(new Date(), 'yyyy-MM-dd');
  const existing = store.pageHistory.findIndex((e) => e.date === today);
  if (existing >= 0) {
    // Keep the original startPage so intra-day diff stays correct
    store.pageHistory[existing] = { ...store.pageHistory[existing], page: clamped };
  } else {
    store.pageHistory.push({ date: today, page: clamped, startPage: clamped });
  }

  save(store);
  return store;
}

// Returns the last recorded page on or before a given date
function pageOnOrBefore(history: PageEntry[], date: string): number | null {
  const candidates = history
    .filter((e) => e.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));
  return candidates.length ? candidates[candidates.length - 1].page : null;
}

export function setGoal(days: number): Store {
  const store = load();
  store.goalDays = days;
  save(store);
  return store;
}

// Returns numWeeks columns of 7 days each (Sun→Sat), oldest first.
// The last column ends on the Sunday on or after today so the grid
// aligns like GitHub's contribution graph.
export function getActivityData(
  history: PageEntry[],
  khatams: Khatam[],
  numWeeks = 52,
): ActivityDay[][] {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const khatamDates = new Set(khatams.map((k) => k.completedAt));

  // Align grid: start from the Sunday numWeeks ago
  const todayDate = new Date();
  const gridEnd = addDays(startOfWeek(todayDate, { weekStartsOn: 0 }), 6); // Saturday of this week
  const gridStart = addDays(gridEnd, -(numWeeks * 7 - 1));

  const weeks: ActivityDay[][] = [];
  let week: ActivityDay[] = [];

  for (let i = 0; i < numWeeks * 7; i++) {
    const d = addDays(gridStart, i);
    const date = format(d, 'yyyy-MM-dd');
    const prevDate = format(subDays(d, 1), 'yyyy-MM-dd');

    const entry = sorted.find((e) => e.date === date);
    let pagesRead = 0;
    if (entry) {
      const prevEntry = sorted.filter((e) => e.date <= prevDate).at(-1);
      const startPage = entry.startPage ?? entry.page;
      const baseline = prevEntry ? prevEntry.page : startPage - 1;
      pagesRead = Math.max(0, entry.page - baseline);
    }

    week.push({ date, pagesRead, khatam: khatamDates.has(date) });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);
  return weeks;
}

export function getDailyReadings(history: PageEntry[], numDays = 7): DayReading[] {
  return Array.from({ length: numDays }, (_, i) => {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const prevDate = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');

    const todayEntry = history.find((e) => e.date === date);
    if (!todayEntry) return { date, pagesRead: null, endPage: null };

    const prevPage = pageOnOrBefore(history, prevDate);
    // startPage may be absent on entries written before this field existed
    const startPage = todayEntry.startPage ?? todayEntry.page;
    const baseline = prevPage ?? (startPage - 1);
    const pagesRead = Math.max(0, todayEntry.page - baseline);

    return { date, pagesRead, endPage: todayEntry.page };
  });
}
