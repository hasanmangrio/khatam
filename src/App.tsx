import { useState, useEffect } from 'react';
import { differenceInDays, format, parseISO, isToday, isYesterday } from 'date-fns';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { Store, Khatam, DayReading } from './types';
import { getStore, addKhatam, deleteKhatam, updateCurrentPage, setGoal, getDailyReadings, TOTAL_PAGES } from './store';

// Lora only for display moments — numbers, dates, the hero stat.
// Everything else is Inter.
const SERIF = "'Lora', Georgia, serif";
const GREEN = '#2a5c3f';
const GREEN_LIGHT = '#3d7a56';
const BG = '#f8f7f4';
const SURFACE = '#ffffff';
const BORDER = '#e8e4dc';
const MUTED = '#9e9689';
const LABEL = '#6b6560';
const DARK = '#1c1917';

function daysAgo(dateStr: string) {
  return differenceInDays(new Date(), parseISO(dateStr));
}

function fmtDate(dateStr: string) {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export default function App() {
  const [store, setStore] = useState<Store>(getStore);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNotes, setNewNotes] = useState('');
  const [pageInput, setPageInput] = useState('');
  const [pageSaved, setPageSaved] = useState(false);

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

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Nav */}
      <nav style={{ padding: '32px 24px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: GREEN,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        {/* Lora only for the wordmark — one serif touch in the nav */}
        <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
          Khatam
        </span>
      </nav>

      {/* Hero headline — Inter, large, tight */}
      <header style={{ textAlign: 'center', padding: '28px 24px 36px' }}>
        <h1 style={{
          fontSize: 'clamp(36px, 7vw, 58px)',
          fontWeight: 500,
          color: DARK,
          lineHeight: 1.08,
          letterSpacing: '-0.025em',
          marginBottom: 10,
        }}>
          Your Sacred Journey
        </h1>
        <p style={{ fontSize: 15, color: MUTED, letterSpacing: '-0.01em' }}>
          Track your Quran completions with gratitude
        </p>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Days since card */}
        <div style={{
          borderRadius: 24,
          background: `linear-gradient(150deg, ${GREEN} 0%, #1d3d2a 100%)`,
          boxShadow: `0 20px 60px rgba(42,92,63,0.28), 0 2px 8px rgba(0,0,0,0.08)`,
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          {latest ? (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 18 }}>
                Last khatam
              </p>
              {/* The one big serif moment */}
              <div style={{ fontFamily: SERIF, fontSize: 'clamp(72px, 16vw, 108px)', fontWeight: 400, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
                {days}
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.55)' }}>
                {days === 0 ? 'completed today' : days === 1 ? 'day ago' : 'days ago'}
              </p>
              <div style={{ margin: '22px auto 0', height: 1, maxWidth: 120, background: 'rgba(255,255,255,0.1)' }} />
              <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
                {fmtDate(latest.completedAt)}
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 24, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Begin your record
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', letterSpacing: '-0.01em' }}>
                Log your first khatam to start tracking
              </p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Current page', value: store.currentPage },
            { label: 'Pages left', value: pagesLeft },
            { label: 'Total khatams', value: store.khatams.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              borderRadius: 18,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              padding: '20px 14px',
              textAlign: 'center',
            }}>
              {/* Lora for the number */}
              <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 400, color: DARK, lineHeight: 1, marginBottom: 6 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: '0.02em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Reading schedule */}
        <ReadingSchedule readings={readings} />

        {/* Goal card */}
        <GoalCard
          goalDays={store.goalDays}
          currentPage={store.currentPage}
          readings={readings}
          onSelect={(days) => setStore(setGoal(days))}
        />

        {/* Progress card */}
        <div style={{
          borderRadius: 20,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          padding: '24px 24px 22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
              Reading progress
            </span>
            {/* Lora for the percentage */}
            <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: GREEN, lineHeight: 1 }}>
              {Math.round(progress)}%
            </span>
          </div>

          <div style={{ height: 5, borderRadius: 999, background: BORDER, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`,
              width: `${progress}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          <form onSubmit={submitPage} style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              min={1}
              max={TOTAL_PAGES}
              placeholder={`Page 1 – ${TOTAL_PAGES}`}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: `1.5px solid ${BORDER}`,
                background: BG,
                fontSize: 14,
                color: DARK,
                outline: 'none',
                transition: 'border-color 0.15s',
                letterSpacing: '-0.01em',
              }}
              onFocus={(e) => { e.target.style.borderColor = GREEN; }}
              onBlur={(e) => { e.target.style.borderColor = BORDER; }}
            />
            <button
              type="submit"
              style={{
                padding: '11px 20px',
                borderRadius: 12,
                background: pageSaved ? GREEN : DARK,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {pageSaved ? <Check size={14} /> : 'Update page'}
            </button>
          </form>
        </div>

        {/* Log khatam */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '17px 22px',
              borderRadius: 20,
              background: SURFACE,
              border: `1.5px dashed ${BORDER}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GREEN; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: BG, border: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={13} color={LABEL} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
              Log a khatam
            </span>
          </button>
        ) : (
          <div style={{
            borderRadius: 20,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: DARK, letterSpacing: '-0.02em' }}>
                Record a completion
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: 'none',
                  background: BG, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13} color={LABEL} />
              </button>
            </div>

            <form onSubmit={submitKhatam} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: LABEL, marginBottom: 7, letterSpacing: '-0.005em' }}>
                  Completion date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 12, border: `1.5px solid ${BORDER}`,
                    background: BG, fontSize: 14, color: DARK, outline: 'none',
                    letterSpacing: '-0.01em',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = GREEN; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: LABEL, marginBottom: 7, letterSpacing: '-0.005em' }}>
                  Reflection{' '}
                  <span style={{ fontWeight: 400, color: MUTED }}>— optional</span>
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="A thought, du'a, or memory from this khatam…"
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 12, border: `1.5px solid ${BORDER}`,
                    background: BG, fontSize: 14, color: DARK, outline: 'none',
                    resize: 'none', lineHeight: 1.6, letterSpacing: '-0.01em',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = GREEN; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '13px',
                  borderRadius: 12,
                  background: GREEN,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                Record khatam
              </button>
            </form>
          </div>
        )}

        {/* History */}
        {store.khatams.length > 0 && (
          <section style={{ marginTop: 6 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 2px 12px' }}>
              History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {store.khatams.map((k: Khatam, i: number) => (
                <HistoryCard
                  key={k.id}
                  khatam={k}
                  number={store.khatams.length - i}
                  onDelete={() => setStore(deleteKhatam(k.id))}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {store.khatams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 20, color: MUTED, marginBottom: 6 }}>
              اَلْحَمْدُ لِلّٰهِ
            </p>
            <p style={{ fontSize: 13, color: MUTED }}>
              Your completions will appear here
            </p>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: 40 }}>
        <p style={{ fontSize: 12, color: MUTED, letterSpacing: '-0.005em' }}>
          May Allah accept your recitation
        </p>
      </footer>
    </div>
  );
}

const GOAL_PRESETS: { label: string; sublabel: string; days: number }[] = [
  { label: '1 week',    sublabel: 'Ramadan pace', days: 7   },
  { label: '2 weeks',  sublabel: 'Intensive',     days: 14  },
  { label: '1 month',  sublabel: 'Monthly',       days: 30  },
  { label: '2 months', sublabel: 'Steady',        days: 60  },
  { label: '3 months', sublabel: 'Relaxed',       days: 90  },
  { label: '6 months', sublabel: 'Gentle',        days: 180 },
];

function GoalCard({
  goalDays,
  currentPage,
  readings,
  onSelect,
}: {
  goalDays?: number;
  currentPage: number;
  readings: DayReading[];
  onSelect: (days: number) => void;
}) {
  const required = goalDays ? Math.ceil(TOTAL_PAGES / goalDays) : null;

  // Average pages/day over the last 7 logged days
  const loggedDays = readings.filter((r) => r.pagesRead !== null && r.pagesRead > 0);
  const avgActual = loggedDays.length
    ? Math.round(loggedDays.reduce((s, r) => s + r.pagesRead!, 0) / loggedDays.length)
    : null;

  // How far ahead/behind vs goal, given current page
  const pagesLeft = TOTAL_PAGES - currentPage;
  let daysToFinishAtGoal: number | null = null;
  let daysToFinishAtActual: number | null = null;
  if (required) daysToFinishAtGoal = Math.ceil(pagesLeft / required);
  if (avgActual) daysToFinishAtActual = Math.ceil(pagesLeft / avgActual);

  const delta = (daysToFinishAtActual !== null && daysToFinishAtGoal !== null)
    ? daysToFinishAtGoal - daysToFinishAtActual
    : null;

  return (
    <div style={{ borderRadius: 20, background: SURFACE, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
            Khatam goal
          </span>
          {goalDays && (
            <span style={{ fontSize: 12, color: MUTED }}>
              Every {GOAL_PRESETS.find((p) => p.days === goalDays)?.label ?? `${goalDays} days`}
            </span>
          )}
        </div>

        {/* Preset chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {GOAL_PRESETS.map((preset) => {
            const active = goalDays === preset.days;
            return (
              <button
                key={preset.days}
                onClick={() => onSelect(preset.days)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 12,
                  border: `1.5px solid ${active ? GREEN : BORDER}`,
                  background: active ? `${GREEN}0f` : BG,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? GREEN : DARK, letterSpacing: '-0.01em' }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: 10, color: active ? GREEN : MUTED, marginTop: 2, opacity: active ? 0.8 : 1 }}>
                  {preset.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Required pace — shown once a goal is set */}
      {required && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 4, letterSpacing: '-0.005em' }}>
                Pages needed per day
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: DARK, lineHeight: 1 }}>
                  {required}
                </span>
                <span style={{ fontSize: 13, color: MUTED }}>pages / day</span>
              </div>
            </div>

            {/* On-track indicator */}
            {avgActual !== null && delta !== null && (
              <div style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: delta >= 0 ? '#f0faf4' : '#fdf3f0',
                border: `1px solid ${delta >= 0 ? '#bbddc9' : '#f4c5b4'}`,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 18, fontFamily: SERIF, fontWeight: 400, color: delta >= 0 ? '#2a6645' : '#b94f2a', lineHeight: 1 }}>
                  {delta >= 0 ? `${delta}d` : `${Math.abs(delta)}d`}
                </p>
                <p style={{ fontSize: 10, fontWeight: 500, color: delta >= 0 ? '#3d8a5e' : '#c86040', marginTop: 3, letterSpacing: '0.02em' }}>
                  {delta >= 0 ? 'ahead' : 'behind'}
                </p>
              </div>
            )}
          </div>

          {/* Actual vs required */}
          {avgActual !== null && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: BORDER, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 999,
                  background: avgActual >= required
                    ? `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`
                    : '#e8956d',
                  width: `${Math.min(100, Math.round((avgActual / required) * 100))}%`,
                  transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
                avg {avgActual} / day
              </span>
            </div>
          )}

          {avgActual === null && (
            <p style={{ fontSize: 12, color: MUTED, marginTop: 10, letterSpacing: '-0.005em' }}>
              Update your page daily to see how you're tracking
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE MMM d');
}

function ReadingSchedule({ readings }: { readings: DayReading[] }) {
  const hasAny = readings.some((r) => r.pagesRead !== null);
  const maxPages = Math.max(1, ...readings.map((r) => r.pagesRead ?? 0));

  return (
    <div style={{
      borderRadius: 20,
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      padding: '22px 22px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
          Recent reading
        </span>
        {!hasAny && (
          <span style={{ fontSize: 12, color: MUTED }}>Update your page to start tracking</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {/* Reversed so today is rightmost */}
        {[...readings].reverse().map((r) => {
          const active = r.pagesRead !== null && r.pagesRead > 0;
          const logged = r.pagesRead !== null;
          const barHeight = active ? Math.max(8, Math.round((r.pagesRead! / maxPages) * 48)) : 4;

          return (
            <div key={r.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {/* Bar */}
              <div style={{ width: '100%', height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: '60%',
                  height: barHeight,
                  borderRadius: 99,
                  background: active
                    ? `linear-gradient(180deg, ${GREEN_LIGHT} 0%, ${GREEN} 100%)`
                    : logged
                      ? BORDER   // logged but 0 pages (same page as yesterday)
                      : BORDER,
                  opacity: active ? 1 : 0.5,
                  transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>

              {/* Pages read number */}
              <span style={{
                fontFamily: active ? SERIF : undefined,
                fontSize: active ? 15 : 13,
                fontWeight: active ? 400 : 400,
                color: active ? DARK : MUTED,
                lineHeight: 1,
              }}>
                {active ? r.pagesRead : logged ? '0' : '—'}
              </span>

              {/* Day label */}
              <span style={{
                fontSize: 10,
                fontWeight: 500,
                color: active ? LABEL : MUTED,
                letterSpacing: '0.01em',
                textAlign: 'center',
                lineHeight: 1.3,
                whiteSpace: 'pre-wrap',
              }}>
                {dayLabel(r.date).replace(' ', '\n')}
              </span>
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirm(false); }}
      style={{
        borderRadius: 16,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        transition: 'border-color 0.15s',
        ...(hovered ? { borderColor: '#d0ccc4' } : {}),
      }}
    >
      {/* Number badge */}
      <div style={{
        minWidth: 32, height: 32, borderRadius: 8,
        background: BG, border: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1, flexShrink: 0,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 400, color: LABEL }}>
          {number}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Lora for the date — the serif touch in history */}
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: DARK, letterSpacing: '-0.01em' }}>
          {fmtDate(khatam.completedAt)}
        </p>
        {khatam.notes && (
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: LABEL, marginTop: 3, lineHeight: 1.5 }}>
            "{khatam.notes}"
          </p>
        )}
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4, letterSpacing: '-0.005em' }}>
          {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}
        </p>
      </div>

      {/* Delete */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
        {confirm ? (
          <>
            <button
              onClick={onDelete}
              style={{
                padding: '5px 11px', borderRadius: 7, border: 'none',
                background: '#fee2e2', color: '#dc2626',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirm(false)}
              style={{
                padding: '5px 11px', borderRadius: 7, border: 'none',
                background: BG, color: LABEL,
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: BG, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={12} color={MUTED} />
          </button>
        )}
      </div>
    </div>
  );
}
