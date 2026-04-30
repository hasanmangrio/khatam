import { useState, useEffect } from 'react';
import { differenceInDays, format, parseISO, isToday, isYesterday } from 'date-fns';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { Store, Khatam, DayReading } from './types';
import { getStore, addKhatam, deleteKhatam, updateCurrentPage, setGoal, getDailyReadings, TOTAL_PAGES } from './store';

const SERIF = "'Lora', Georgia, serif";
const GREEN = '#2a5c3f';
const GREEN_LIGHT = '#3d7a56';
const BG = '#f8f7f4';
const SURFACE = '#ffffff';
const BORDER = '#e8e4dc';
const MUTED = '#9e9689';
const LABEL = '#6b6560';
const DARK = '#1c1917';

const GOAL_PRESETS = [
  { label: '1 week',    sublabel: 'Ramadan',   days: 7   },
  { label: '2 weeks',  sublabel: 'Intensive',  days: 14  },
  { label: '1 month',  sublabel: 'Monthly',    days: 30  },
  { label: '2 months', sublabel: 'Steady',     days: 60  },
  { label: '3 months', sublabel: 'Relaxed',    days: 90  },
  { label: '6 months', sublabel: 'Gentle',     days: 180 },
];

function daysAgo(dateStr: string) { return differenceInDays(new Date(), parseISO(dateStr)); }
function fmtDate(dateStr: string) { return format(parseISO(dateStr), 'MMMM d, yyyy'); }

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 960);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const handle = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);
  return desktop;
}

export default function App() {
  const [store, setStore] = useState<Store>(getStore);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNotes, setNewNotes] = useState('');
  const [pageInput, setPageInput] = useState('');
  const [pageSaved, setPageSaved] = useState(false);
  const isDesktop = useIsDesktop();

  const latest = store.khatams[0] ?? null;
  const days = latest ? daysAgo(latest.completedAt) : null;
  const progress = Math.min(100, ((store.currentPage - 1) / (TOTAL_PAGES - 1)) * 100);
  const pagesLeft = TOTAL_PAGES - store.currentPage;
  const readings = getDailyReadings(store.pageHistory, 7);

  useEffect(() => { setPageInput(String(store.currentPage)); }, [store.currentPage]);

  function submitKhatam(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setStore(addKhatam(newDate, newNotes.trim() || undefined));
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setNewNotes('');
    setShowForm(false);
  }

  function submitPage(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!p || p < 1 || p > TOTAL_PAGES) return;
    setStore(updateCurrentPage(p));
    setPageSaved(true);
    setTimeout(() => setPageSaved(false), 2000);
  }

  const shared = {
    store, setStore, latest, days, progress, pagesLeft, readings,
    showForm, setShowForm, newDate, setNewDate, newNotes, setNewNotes,
    pageInput, setPageInput, pageSaved, submitKhatam, submitPage,
  };

  return isDesktop
    ? <DesktopLayout {...shared} />
    : <MobileLayout {...shared} />;
}

// ─── shared props type ────────────────────────────────────────────────────────
type SharedProps = {
  store: Store;
  setStore: (s: Store) => void;
  latest: Khatam | null;
  days: number | null;
  progress: number;
  pagesLeft: number;
  readings: DayReading[];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  newDate: string;
  setNewDate: (v: string) => void;
  newNotes: string;
  setNewNotes: (v: string) => void;
  pageInput: string;
  setPageInput: (v: string) => void;
  pageSaved: boolean;
  submitKhatam: (e: React.FormEvent) => void;
  submitPage: (e: React.FormEvent) => void;
};

// ─── Desktop layout ────────────────────────────────────────────────────────────
function DesktopLayout(p: SharedProps) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: BG, overflow: 'hidden' }}>
      {/* Slim top bar */}
      <header style={{
        padding: '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${BORDER}`,
        background: SURFACE,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: DARK }}>Khatam</span>
        </div>
        <span style={{ fontSize: 13, color: MUTED }}>{format(new Date(), 'EEEE, MMMM d')}</span>
      </header>

      {/* 3-column grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 16, padding: 16, overflow: 'hidden' }}>

        {/* LEFT: hero + log + history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <HeroCard latest={p.latest} days={p.days} />

          <LogKhatam
            showForm={p.showForm}
            setShowForm={p.setShowForm}
            newDate={p.newDate}
            setNewDate={p.setNewDate}
            newNotes={p.newNotes}
            setNewNotes={p.setNewNotes}
            onSubmit={p.submitKhatam}
          />

          {/* History — scrollable within column */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.store.khatams.length > 0 ? (
              <>
                <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 2px' }}>
                  History
                </p>
                {p.store.khatams.map((k: Khatam, i: number) => (
                  <HistoryCard
                    key={k.id}
                    khatam={k}
                    number={p.store.khatams.length - i}
                    onDelete={() => p.setStore(deleteKhatam(k.id))}
                  />
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: MUTED, marginBottom: 4 }}>اَلْحَمْدُ لِلّٰهِ</p>
                <p style={{ fontSize: 12, color: MUTED }}>Your completions will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: stats + progress + schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <StatsRow currentPage={p.store.currentPage} pagesLeft={p.pagesLeft} total={p.store.khatams.length} />
          <ProgressCard
            progress={p.progress}
            pageInput={p.pageInput}
            setPageInput={p.setPageInput}
            pageSaved={p.pageSaved}
            onSubmit={p.submitPage}
          />
          {/* Schedule fills remaining height */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ReadingSchedule readings={p.readings} />
          </div>
        </div>

        {/* RIGHT: goal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <GoalCard
            goalDays={p.store.goalDays}
            currentPage={p.store.currentPage}
            readings={p.readings}
            onSelect={(days) => p.setStore(setGoal(days))}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mobile layout ─────────────────────────────────────────────────────────────
function MobileLayout(p: SharedProps) {
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <nav style={{ padding: '32px 24px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>Khatam</span>
      </nav>

      <header style={{ textAlign: 'center', padding: '28px 24px 36px' }}>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 58px)', fontWeight: 500, color: DARK, lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 10 }}>
          Your Sacred Journey
        </h1>
        <p style={{ fontSize: 15, color: MUTED, letterSpacing: '-0.01em' }}>
          Track your Quran completions with gratitude
        </p>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <HeroCard latest={p.latest} days={p.days} />
        <StatsRow currentPage={p.store.currentPage} pagesLeft={p.pagesLeft} total={p.store.khatams.length} />
        <ReadingSchedule readings={p.readings} />
        <GoalCard
          goalDays={p.store.goalDays}
          currentPage={p.store.currentPage}
          readings={p.readings}
          onSelect={(days) => p.setStore(setGoal(days))}
        />
        <ProgressCard
          progress={p.progress}
          pageInput={p.pageInput}
          setPageInput={p.setPageInput}
          pageSaved={p.pageSaved}
          onSubmit={p.submitPage}
        />
        <LogKhatam
          showForm={p.showForm}
          setShowForm={p.setShowForm}
          newDate={p.newDate}
          setNewDate={p.setNewDate}
          newNotes={p.newNotes}
          setNewNotes={p.setNewNotes}
          onSubmit={p.submitKhatam}
        />
        {p.store.khatams.length > 0 && (
          <section style={{ marginTop: 6 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 2px 12px' }}>History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.store.khatams.map((k: Khatam, i: number) => (
                <HistoryCard key={k.id} khatam={k} number={p.store.khatams.length - i} onDelete={() => p.setStore(deleteKhatam(k.id))} />
              ))}
            </div>
          </section>
        )}
        {p.store.khatams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 20, color: MUTED, marginBottom: 6 }}>اَلْحَمْدُ لِلّٰهِ</p>
            <p style={{ fontSize: 13, color: MUTED }}>Your completions will appear here</p>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: 40 }}>
        <p style={{ fontSize: 12, color: MUTED }}>May Allah accept your recitation</p>
      </footer>
    </div>
  );
}

// ─── Shared section components ────────────────────────────────────────────────

function HeroCard({ latest, days }: { latest: Khatam | null; days: number | null }) {
  return (
    <div style={{
      borderRadius: 20,
      background: `linear-gradient(150deg, ${GREEN} 0%, #1d3d2a 100%)`,
      boxShadow: `0 16px 48px rgba(42,92,63,0.25)`,
      padding: '32px 28px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      {latest ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Last khatam</p>
          <div style={{ fontFamily: SERIF, fontSize: 'clamp(60px, 12vw, 88px)', fontWeight: 400, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
            {days}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 20, color: 'rgba(255,255,255,0.55)' }}>
            {days === 0 ? 'completed today' : days === 1 ? 'day ago' : 'days ago'}
          </p>
          <div style={{ margin: '18px auto 0', height: 1, maxWidth: 80, background: 'rgba(255,255,255,0.1)' }} />
          <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{fmtDate(latest.completedAt)}</p>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 6, letterSpacing: '-0.02em' }}>Begin your record</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Log your first khatam to start tracking</p>
        </div>
      )}
    </div>
  );
}

function StatsRow({ currentPage, pagesLeft, total }: { currentPage: number; pagesLeft: number; total: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flexShrink: 0 }}>
      {[
        { label: 'Current page', value: currentPage },
        { label: 'Pages left', value: pagesLeft },
        { label: 'Total khatams', value: total },
      ].map(({ label, value }) => (
        <div key={label} style={{ borderRadius: 16, background: SURFACE, border: `1px solid ${BORDER}`, padding: '18px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: DARK, lineHeight: 1, marginBottom: 5 }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function ProgressCard({ progress, pageInput, setPageInput, pageSaved, onSubmit }: {
  progress: number;
  pageInput: string;
  setPageInput: (v: string) => void;
  pageSaved: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div style={{ borderRadius: 20, background: SURFACE, border: `1px solid ${BORDER}`, padding: '22px 22px 20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>Reading progress</span>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: GREEN, lineHeight: 1 }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: BORDER, marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, width: `${progress}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="number" value={pageInput} onChange={(e) => setPageInput(e.target.value)}
          min={1} max={TOTAL_PAGES} placeholder={`Page 1 – ${TOTAL_PAGES}`}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${BORDER}`, background: BG, fontSize: 14, color: DARK, outline: 'none' }}
          onFocus={(e) => { e.target.style.borderColor = GREEN; }}
          onBlur={(e) => { e.target.style.borderColor = BORDER; }}
        />
        <button type="submit" style={{ padding: '10px 18px', borderRadius: 12, background: pageSaved ? GREEN : DARK, color: '#fff', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          {pageSaved ? <Check size={14} /> : 'Update page'}
        </button>
      </form>
    </div>
  );
}

function LogKhatam({ showForm, setShowForm, newDate, setNewDate, newNotes, setNewNotes, onSubmit }: {
  showForm: boolean; setShowForm: (v: boolean) => void;
  newDate: string; setNewDate: (v: string) => void;
  newNotes: string; setNewNotes: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return !showForm ? (
    <button
      onClick={() => setShowForm(true)}
      style={{ width: '100%', padding: '14px 20px', borderRadius: 16, background: SURFACE, border: `1.5px dashed ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexShrink: 0 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GREEN; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
    >
      <div style={{ width: 24, height: 24, borderRadius: 6, background: BG, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={12} color={LABEL} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>Log a khatam</span>
    </button>
  ) : (
    <div style={{ borderRadius: 18, background: SURFACE, border: `1px solid ${BORDER}`, padding: '20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: DARK, letterSpacing: '-0.02em' }}>Record a completion</h2>
        <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={13} color={LABEL} />
        </button>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: LABEL, marginBottom: 6 }}>Completion date</label>
          <input type="date" required value={newDate} max={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setNewDate(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: `1.5px solid ${BORDER}`, background: BG, fontSize: 14, color: DARK, outline: 'none' }}
            onFocus={(e) => { e.target.style.borderColor = GREEN; }} onBlur={(e) => { e.target.style.borderColor = BORDER; }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: LABEL, marginBottom: 6 }}>
            Reflection <span style={{ fontWeight: 400, color: MUTED }}>— optional</span>
          </label>
          <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="A thought, du'a, or memory…" rows={2}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: `1.5px solid ${BORDER}`, background: BG, fontSize: 14, color: DARK, outline: 'none', resize: 'none', lineHeight: 1.5 }}
            onFocus={(e) => { e.target.style.borderColor = GREEN; }} onBlur={(e) => { e.target.style.borderColor = BORDER; }} />
        </div>
        <button type="submit" style={{ padding: '12px', borderRadius: 11, background: GREEN, color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          Record khatam
        </button>
      </form>
    </div>
  );
}

function GoalCard({ goalDays, currentPage, readings, onSelect }: {
  goalDays?: number; currentPage: number; readings: DayReading[]; onSelect: (days: number) => void;
}) {
  const required = goalDays ? Math.ceil(TOTAL_PAGES / goalDays) : null;
  const todayPages = readings[0]?.pagesRead ?? 0;
  const pastDays = readings.slice(1).filter((r) => r.pagesRead !== null && r.pagesRead > 0);
  const avgActual = pastDays.length ? Math.round(pastDays.reduce((s, r) => s + r.pagesRead!, 0) / pastDays.length) : null;
  const pagesLeft = TOTAL_PAGES - currentPage;
  const daysToFinishAtGoal = required ? Math.ceil(pagesLeft / required) : null;
  const daysToFinishAtActual = avgActual ? Math.ceil(pagesLeft / avgActual) : null;
  const delta = daysToFinishAtActual !== null && daysToFinishAtGoal !== null ? daysToFinishAtGoal - daysToFinishAtActual : null;
  const todayPct = required ? Math.min(1, todayPages / required) : 0;
  const RING = 48; const STROKE = 5; const CIRC = 2 * Math.PI * RING;
  const met = required !== null && todayPages >= required;

  return (
    <div style={{ borderRadius: 20, background: SURFACE, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>Khatam goal</span>
          {goalDays && <span style={{ fontSize: 12, color: MUTED }}>Every {GOAL_PRESETS.find((p) => p.days === goalDays)?.label ?? `${goalDays} days`}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
          {GOAL_PRESETS.map((preset) => {
            const active = goalDays === preset.days;
            return (
              <button key={preset.days} onClick={() => onSelect(preset.days)}
                style={{ padding: '9px 6px', borderRadius: 11, cursor: 'pointer', border: `1.5px solid ${active ? GREEN : BORDER}`, background: active ? `${GREEN}12` : BG, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: active ? GREEN : DARK }}>{preset.label}</div>
                <div style={{ fontSize: 10, color: active ? GREEN : MUTED, marginTop: 1 }}>{preset.sublabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {required && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'center' }}>
          {/* Ring */}
          <div style={{ position: 'relative', flexShrink: 0, width: RING * 2 + STROKE, height: RING * 2 + STROKE }}>
            <svg width={RING * 2 + STROKE} height={RING * 2 + STROKE} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={RING + STROKE / 2} cy={RING + STROKE / 2} r={RING} fill="none" stroke={BORDER} strokeWidth={STROKE} />
              {todayPages > 0 && (
                <circle cx={RING + STROKE / 2} cy={RING + STROKE / 2} r={RING} fill="none"
                  stroke={met ? GREEN : GREEN_LIGHT} strokeWidth={STROKE} strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - todayPct)}
                  style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
              )}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: DARK, lineHeight: 1 }}>{todayPages}</span>
              <span style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>today</span>
            </div>
          </div>

          {/* Goal + bar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Daily goal</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: DARK, lineHeight: 1 }}>{required}</span>
              <span style={{ fontSize: 12, color: MUTED }}>pages / day</span>
              {delta !== null && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: delta >= 0 ? '#2a6645' : '#b94f2a', background: delta >= 0 ? '#eef7f2' : '#fdf0ec', padding: '3px 7px', borderRadius: 6 }}>
                  {delta >= 0 ? `${delta}d ahead` : `${Math.abs(delta)}d behind`}
                </span>
              )}
            </div>
            <div style={{ height: 4, borderRadius: 999, background: BORDER, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', borderRadius: 999, background: met ? `linear-gradient(90deg,${GREEN},${GREEN_LIGHT})` : `linear-gradient(90deg,${GREEN_LIGHT},#6baa85)`, width: `${Math.min(100, Math.round(todayPct * 100))}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <p style={{ fontSize: 11, color: MUTED }}>
              {met
                ? `Goal met — ${todayPages - required} extra page${todayPages - required === 1 ? '' : 's'}`
                : todayPages > 0
                  ? `${required - todayPages} more to reach today's goal`
                  : avgActual ? `7-day avg ${avgActual} / day` : 'Update page to track today'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadingSchedule({ readings }: { readings: DayReading[] }) {
  const hasAny = readings.some((r) => r.pagesRead !== null);
  const maxPages = Math.max(1, ...readings.map((r) => r.pagesRead ?? 0));
  return (
    <div style={{ borderRadius: 20, background: SURFACE, border: `1px solid ${BORDER}`, padding: '20px 20px 18px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>Recent reading</span>
        {!hasAny && <span style={{ fontSize: 12, color: MUTED }}>Update your page to start tracking</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {[...readings].reverse().map((r) => {
          const active = r.pagesRead !== null && r.pagesRead > 0;
          const logged = r.pagesRead !== null;
          const barHeight = active ? Math.max(8, Math.round((r.pagesRead! / maxPages) * 44)) : 4;
          const label = (() => {
            const d = parseISO(r.date);
            if (isToday(d)) return 'Today';
            if (isYesterday(d)) return 'Yest.';
            return format(d, 'EEE');
          })();
          return (
            <div key={r.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: '100%', height: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ width: '55%', height: barHeight, borderRadius: 99, background: active ? `linear-gradient(180deg,${GREEN_LIGHT},${GREEN})` : BORDER, opacity: active ? 1 : 0.5, transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <span style={{ fontFamily: active ? SERIF : undefined, fontSize: active ? 14 : 12, color: active ? DARK : MUTED, lineHeight: 1 }}>
                {active ? r.pagesRead : logged ? '0' : '—'}
              </span>
              <span style={{ fontSize: 9, fontWeight: 500, color: active ? LABEL : MUTED, letterSpacing: '0.01em' }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryCard({ khatam, number, onDelete }: { khatam: Khatam; number: number; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [hovered, setHovered] = useState(false);
  const days = daysAgo(khatam.completedAt);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setConfirm(false); }}
      style={{ borderRadius: 14, background: SURFACE, border: `1px solid ${hovered ? '#d0ccc4' : BORDER}`, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'border-color 0.15s', flexShrink: 0 }}>
      <div style={{ minWidth: 28, height: 28, borderRadius: 7, background: BG, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 13, color: LABEL }}>{number}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: DARK }}>{fmtDate(khatam.completedAt)}</p>
        {khatam.notes && <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: LABEL, marginTop: 2, lineHeight: 1.4 }}>"{khatam.notes}"</p>}
        <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}</p>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
        {confirm ? (
          <>
            <button onClick={onDelete} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
            <button onClick={() => setConfirm(false)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: BG, color: LABEL, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setConfirm(true)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={11} color={MUTED} />
          </button>
        )}
      </div>
    </div>
  );
}
