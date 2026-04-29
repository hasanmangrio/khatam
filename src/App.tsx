import { useState, useEffect } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { BookOpen, Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import type { Store, Khatam } from './types';
import { getStore, addKhatam, deleteKhatam, updateCurrentPage, TOTAL_PAGES } from './store';

function daysBetween(dateStr: string): number {
  return differenceInDays(new Date(), parseISO(dateStr));
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export default function App() {
  const [store, setStore] = useState<Store>(getStore);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNotes, setNewNotes] = useState('');
  const [pageInput, setPageInput] = useState('');
  const [pageSaved, setPageSaved] = useState(false);

  const latestKhatam = store.khatams[0] ?? null;
  const daysSince = latestKhatam ? daysBetween(latestKhatam.completedAt) : null;
  const progress = Math.min(100, Math.round(((store.currentPage - 1) / TOTAL_PAGES) * 100));
  const pagesLeft = TOTAL_PAGES - store.currentPage + 1;

  useEffect(() => {
    setPageInput(String(store.currentPage));
  }, [store.currentPage]);

  function handleLogKhatam(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setStore(addKhatam(newDate, newNotes.trim() || undefined));
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setNewNotes('');
    setShowLogForm(false);
  }

  function handleDeleteKhatam(id: string) {
    setStore(deleteKhatam(id));
  }

  function handlePageSave(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (isNaN(p) || p < 1 || p > TOTAL_PAGES) return;
    setStore(updateCurrentPage(p));
    setPageSaved(true);
    setTimeout(() => setPageSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f0ebe0 100%)' }}>
      {/* Header */}
      <header className="pt-10 pb-6 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3a6b4a 0%, #2d5238 100%)' }}
          >
            <BookOpen size={18} color="white" strokeWidth={1.5} />
          </div>
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: '#7d6244', letterSpacing: '0.18em' }}
          >
            Khatam
          </span>
        </div>
        <h1
          className="text-5xl md:text-6xl font-light mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410', lineHeight: 1.1 }}
        >
          Your Sacred Journey
        </h1>
        <p className="text-sm" style={{ color: '#9c8059' }}>
          Track your Quran completions with gratitude
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20 space-y-6">
        {/* Hero stat — days since last khatam */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #2d5238 0%, #1e3a27 100%)', boxShadow: '0 20px 60px rgba(45,82,56,0.25)' }}
        >
          {latestKhatam ? (
            <>
              <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Last Khatam Completed
              </p>
              <div
                className="text-8xl md:text-9xl font-light mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#fff', lineHeight: 1 }}
              >
                {daysSince}
              </div>
              <p
                className="text-xl mb-1"
                style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {daysSince === 1 ? 'day ago' : 'days ago'}
              </p>
              <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {formatDate(latestKhatam.completedAt)}
              </p>
            </>
          ) : (
            <>
              <p
                className="text-4xl font-light mb-3"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#fff' }}
              >
                Begin Your Record
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Log your first khatam to start tracking
              </p>
            </>
          )}
        </div>

        {/* Current progress */}
        <div
          className="rounded-3xl p-7"
          style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-light mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
              >
                Current Progress
              </h2>
              <p className="text-xs" style={{ color: '#9c8059' }}>
                {TOTAL_PAGES} pages in the Quran
              </p>
            </div>
            <div className="text-right">
              <span
                className="text-4xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#2d5238' }}
              >
                {progress}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 rounded-full mb-6" style={{ background: '#f0ebe0' }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3a6b4a 0%, #5a9b6e 100%)',
              }}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <p
                className="text-3xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
              >
                {store.currentPage}
              </p>
              <p className="text-xs mt-1" style={{ color: '#b8a27e' }}>current page</p>
            </div>
            <div className="h-8 w-px" style={{ background: '#e8dfd0' }} />
            <div className="text-center">
              <p
                className="text-3xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
              >
                {pagesLeft}
              </p>
              <p className="text-xs mt-1" style={{ color: '#b8a27e' }}>pages remaining</p>
            </div>
            <div className="h-8 w-px" style={{ background: '#e8dfd0' }} />
            <div className="text-center">
              <p
                className="text-3xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
              >
                {store.khatams.length}
              </p>
              <p className="text-xs mt-1" style={{ color: '#b8a27e' }}>total khatams</p>
            </div>
          </div>

          {/* Page input */}
          <form onSubmit={handlePageSave} className="flex gap-2">
            <input
              type="number"
              min={1}
              max={TOTAL_PAGES}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="Enter page…"
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: '#faf8f5',
                border: '1.5px solid #e8dfd0',
                color: '#1a1410',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3a6b4a')}
              onBlur={(e) => (e.target.style.borderColor = '#e8dfd0')}
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5"
              style={{
                background: pageSaved ? '#3a6b4a' : '#1a1410',
                color: 'white',
                minWidth: '80px',
                justifyContent: 'center',
              }}
            >
              {pageSaved ? <Check size={16} /> : 'Update'}
            </button>
          </form>
        </div>

        {/* Log khatam */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="w-full flex items-center justify-between p-7 transition-colors"
            style={{ background: 'transparent', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#f0ebe0' }}
              >
                <Plus size={16} style={{ color: '#3a6b4a' }} />
              </div>
              <span
                className="text-lg font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
              >
                Log a Khatam
              </span>
            </div>
            <ChevronDown
              size={18}
              style={{
                color: '#b8a27e',
                transform: showLogForm ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {showLogForm && (
            <form onSubmit={handleLogKhatam} className="px-7 pb-7 space-y-4">
              <div style={{ height: '1px', background: '#f0ebe0', marginBottom: '1.5rem' }} />
              <div>
                <label
                  className="block text-xs font-medium mb-2 tracking-wide"
                  style={{ color: '#9c8059' }}
                >
                  Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: '#faf8f5',
                    border: '1.5px solid #e8dfd0',
                    color: '#1a1410',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3a6b4a')}
                  onBlur={(e) => (e.target.style.borderColor = '#e8dfd0')}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-2 tracking-wide"
                  style={{ color: '#9c8059' }}
                >
                  Notes{' '}
                  <span style={{ color: '#b8a27e', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="A reflection, intention, or memory…"
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{
                    background: '#faf8f5',
                    border: '1.5px solid #e8dfd0',
                    color: '#1a1410',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3a6b4a')}
                  onBlur={(e) => (e.target.style.borderColor = '#e8dfd0')}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3a6b4a 0%, #2d5238 100%)',
                  color: 'white',
                }}
              >
                Record Khatam
              </button>
            </form>
          )}
        </div>

        {/* Khatam history */}
        {store.khatams.length > 0 && (
          <div>
            <h2
              className="text-xl font-light mb-4 px-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#5e4832' }}
            >
              History
            </h2>
            <div className="space-y-3">
              {store.khatams.map((khatam: Khatam, idx: number) => (
                <KhatamCard
                  key={khatam.id}
                  khatam={khatam}
                  index={store.khatams.length - idx}
                  onDelete={() => handleDeleteKhatam(khatam.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {store.khatams.length === 0 && (
          <div className="text-center py-12">
            <p
              className="text-3xl font-light mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#d4c5a9' }}
            >
              اَلْحَمْدُ لِلّٰهِ
            </p>
            <p className="text-sm" style={{ color: '#b8a27e' }}>
              Your completions will appear here
            </p>
          </div>
        )}
      </main>

      <footer className="text-center pb-8">
        <p className="text-xs" style={{ color: '#d4c5a9' }}>
          May Allah accept your recitation
        </p>
      </footer>
    </div>
  );
}

function KhatamCard({
  khatam,
  index,
  onDelete,
}: {
  khatam: Khatam;
  index: number;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const days = daysBetween(khatam.completedAt);

  return (
    <div
      className="rounded-2xl p-5 flex items-start justify-between gap-4 group"
      style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: '#f0ebe0' }}
        >
          <span
            className="text-sm font-medium"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#7d6244' }}
          >
            {index}
          </span>
        </div>
        <div>
          <p
            className="text-base font-medium mb-0.5"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' }}
          >
            {formatDate(khatam.completedAt)}
          </p>
          {khatam.notes && (
            <p
              className="text-sm mt-1 italic"
              style={{ color: '#9c8059', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              "{khatam.notes}"
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: '#b8a27e' }}>
            {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: '#f0ebe0', color: '#7d6244' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
            style={{ color: '#d4c5a9' }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
