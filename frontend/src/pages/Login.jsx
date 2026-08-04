import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const to = location.state?.from?.pathname || '/';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-[14px] border border-border bg-surface p-8 shadow-modal">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-gradient-to-br from-brand-orange to-brand-yellow">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold tracking-wide">HSE COMMAND</div>
            <div className="text-[10.5px] text-muted">Health &middot; Safety &middot; Environment</div>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-bold">Masuk ke Dashboard</h1>
        <p className="mb-5 text-[13px] text-muted">Masukkan email dan password akun kamu.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
              placeholder="nama@perusahaan.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-[8px] border border-bad/30 bg-bad/10 px-3 py-2 text-xs font-semibold text-bad">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full !text-white">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
