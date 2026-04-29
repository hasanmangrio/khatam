import { useState, useEffect } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { Store, Khatam } from './types';
import { getStore, addKhatam, deleteKhatam, updateCurrentPage, TOTAL_PAGES } from './store';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const GREEN = '#2a5c3f';
const GREEN_LIGHT = '#3a7a55';
const SAND = '#f5f0e8';
const SAND_DARK = '#e8dfd0';
const SAND_MID = '#d4c5a9';
const BROWN = '#7d6244';
const DARK = '#1a1410';

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
    <div style={{ minHeight: '100vh', background: `linear-gradient(175deg, #faf7f2 0%, ${SAND} 50%, #ede5d8 100%)` }}>

      {/* Nav */}
      <nav style={{ padding: '28px 24px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: GREEN,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: '0.01em' }}>
          Khatam
        </span>
      </nav>

      {/* Hero headline */}
      <header style={{ textAlign: 'center', padding: '32px 24px 40px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 300, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
          Your Sacred Journey
        </h1>
        <p style={{ marginTop: 10, fontSize: 14, color: BROWN, letterSpacing: '0.03em' }}>
          Track your Quran completions with gratitude
        </p>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Days since card */}
        <div style={{
          borderRadius: 28, overflow: 'hidden',
          background: `linear-gradient(145deg, ${GREEN} 0%, #1e4030 100%)`,
          boxShadow: `0 24px 64px rgba(42,92,63,0.3), 0 4px 16px rgba(0,0,0,0.1)`,
          padding: '44px 36px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Subtle texture circle */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }} />

          {latest ? (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
                Last Khatam
              </p>
              <div style={{ fontFamily: SERIF, fontSize: 'clamp(80px, 18vw, 120px)', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
                {days}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 300, color: 'rgba(255,255,255,0.65)' }}>
                {days === 0 ? 'completed today' : days === 1 ? 'day ago' : 'days ago'}
              </p>
              <div style={{ marginTop: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
                {fmtDate(latest.completedAt)}
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 300, color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>
                Begin Your Record
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                Log your first khatam to start tracking
              </p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Current Page', value: store.currentPage },
            { label: 'Pages Left', value: pagesLeft },
            { label: 'Total Khatams', value: store.khatams.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              borderRadius: 20, background: '#fff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              padding: '22px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 300, color: DARK, lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, color: SAND_MID, marginTop: 6, letterSpacing: '0.03em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress card */}
        <div style={{
          borderRadius: 24, background: '#fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          padding: '28px 28px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, color: DARK }}>Reading Progress</span>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 300, color: GREEN }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Track */}
          <div style={{ height: 6, borderRadius: 999, background: SAND_DARK, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`,
              width: `${progress}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          {/* Page input */}
          <form onSubmit={submitPage} style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                min={1}
                max={TOTAL_PAGES}
                placeholder={`Page 1 – ${TOTAL_PAGES}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: '1.5px solid #e8dfd0',
                  background: SAND,
                  fontSize: 15,
                  color: DARK,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = GREEN; }}
                onBlur={(e) => { e.target.style.borderColor = '#e8dfd0'; }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 22px',
                borderRadius: 14,
                background: pageSaved ? GREEN : DARK,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              {pageSaved ? <Check size={15} /> : 'Update Page'}
            </button>
          </form>
        </div>

        {/* Log khatam button / form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 24,
              background: '#fff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              border: '1.5px dashed #d4c5a9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = GREEN;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px rgba(42,92,63,0.12)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#d4c5a9';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: '#f0ebe0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={14} color={GREEN} />
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: DARK }}>Log a Khatam</span>
          </button>
        ) : (
          <div style={{
            borderRadius: 24, background: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: DARK }}>
                Record a Completion
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: SAND, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} color={BROWN} />
              </button>
            </div>

            <form onSubmit={submitKhatam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: BROWN, marginBottom: 8 }}>
                  Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 16px',
                    borderRadius: 14, border: '1.5px solid #e8dfd0',
                    background: SAND, fontSize: 15, color: DARK, outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = GREEN; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e8dfd0'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: BROWN, marginBottom: 8 }}>
                  Reflection <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="A thought, du'a, or memory from this khatam…"
                  rows={3}
                  style={{
                    width: '100%', padding: '13px 16px',
                    borderRadius: 14, border: '1.5px solid #e8dfd0',
                    background: SAND, fontSize: 15, color: DARK, outline: 'none',
                    resize: 'none', lineHeight: 1.6,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = GREEN; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e8dfd0'; }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '15px',
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${GREEN} 0%, #1e4030 100%)`,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Record Khatam
              </button>
            </form>
          </div>
        )}

        {/* History */}
        {store.khatams.length > 0 && (
          <section>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: BROWN, margin: '8px 4px 12px' }}>
              History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <p style={{ fontFamily: SERIF, fontSize: 28, color: SAND_MID, marginBottom: 8 }}>
              اَلْحَمْدُ لِلّٰهِ
            </p>
            <p style={{ fontSize: 13, color: SAND_MID }}>
              Your completions will appear here
            </p>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: 40 }}>
        <p style={{ fontSize: 12, color: SAND_MID, letterSpacing: '0.03em' }}>
          May Allah accept your recitation
        </p>
      </footer>
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
        borderRadius: 20,
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        transition: 'box-shadow 0.2s',
        ...(hovered ? { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } : {}),
      }}
    >
      {/* Number badge */}
      <div style={{
        minWidth: 36, height: 36, borderRadius: 10,
        background: '#f5f0e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: BROWN }}>
          {number}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: DARK }}>
          {fmtDate(khatam.completedAt)}
        </p>
        {khatam.notes && (
          <p style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: BROWN, marginTop: 3 }}>
            "{khatam.notes}"
          </p>
        )}
        <p style={{ fontSize: 12, color: SAND_MID, marginTop: 4 }}>
          {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}
        </p>
      </div>

      {/* Delete */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
        {confirm ? (
          <>
            <button
              onClick={onDelete}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: '#fee2e2', color: '#dc2626',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirm(false)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: '#f5f0e8', color: BROWN,
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
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: '#f5f0e8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={13} color={SAND_MID} />
          </button>
        )}
      </div>
    </div>
  );
}
