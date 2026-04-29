import type { Store, Khatam } from './types';

const KEY = 'khatam-tracker';
export const TOTAL_PAGES = 604;

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { khatams: [], currentPage: 1 };
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
  store.currentPage = Math.max(1, Math.min(TOTAL_PAGES, page));
  save(store);
  return store;
}
