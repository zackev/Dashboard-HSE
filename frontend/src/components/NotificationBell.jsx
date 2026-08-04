import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';

const POLL_MS = 20000;

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const { data, unread_count } = await api.get('/notifications');
      setItems(data);
      setUnread(unread_count);
    } catch {
      // diam saja kalau gagal (mis. belum login) supaya tidak spam toast
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleItemClick(item) {
    try {
      await api.postJson(`/notifications/${item.id}/read`, {});
      load();
    } catch {
      /* noop */
    }
    setOpen(false);
    if (item.data?.url) navigate(item.data.url);
  }

  async function markAllRead() {
    try {
      await api.postJson('/notifications/read-all', {});
      load();
    } catch {
      /* noop */
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        className="btn-icon relative"
        title="Notifikasi"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-[12px] border border-border bg-surface shadow-modal">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-bold">Notifikasi</span>
            {unread > 0 && (
              <button
                className="flex items-center gap-1 text-[11px] font-semibold text-info hover:underline"
                onClick={markAllRead}
              >
                <CheckCheck size={12} /> Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted">Belum ada notifikasi.</p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`block w-full border-b border-border px-4 py-2.5 text-left text-[12.5px] last:border-b-0 hover:bg-surface2 ${
                  item.read_at ? 'opacity-60' : ''
                }`}
              >
                <div className="font-semibold">{item.data?.title || 'Notifikasi'}</div>
                <div className="mt-0.5 text-muted">{item.data?.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
