'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #dff0ff 0%, #f0f0ff 45%, #ffe8f8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    },
    blob: {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(circle at 15% 15%, rgba(0,113,227,0.1) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(175,82,222,0.08) 0%, transparent 45%)`,
    },
    card: {
      width: '100%', maxWidth: '360px',
      background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.78)', borderRadius: '24px',
      padding: '32px 24px', position: 'relative', zIndex: 1,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: 700, color: '#1d1d1f', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#86868b', textAlign: 'center', marginBottom: 28 },
    label: { fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' },
    input: {
      width: '100%', padding: '12px 16px', borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
      fontSize: 15, fontFamily: 'inherit', color: '#1d1d1f', outline: 'none',
      marginBottom: 16, boxSizing: 'border-box',
    },
    btn: {
      width: '100%', padding: '14px', background: '#0071e3', color: 'white',
      border: 'none', borderRadius: '12px', fontSize: 16, fontWeight: 600,
      fontFamily: 'inherit', cursor: 'pointer', marginBottom: 16,
    },
    link: { textAlign: 'center', fontSize: 14, color: '#86868b' },
    linkBtn: { color: '#0071e3', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, fontFamily: 'inherit' },
    error: { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff3b30', marginBottom: 16 },
  };

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError('Неверный email или пароль'); setLoading(false); return; }

      // Проверяем статус
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status, role')
        .eq('id', data.user.id)
        .single();

      if (profile?.status === 'pending') {
        window.location.href = '/pending';
      } else if (profile?.status === 'active') {
        window.location.href = '/';
      } else {
        setError('Доступ заблокирован');
      }
    } catch {
      setError('Ошибка соединения');
    }
    setLoading(false);
  }

  return (
    <div style={styles.app}>
      <div style={styles.blob} />
      <div style={styles.card}>
        <div style={styles.logo}>🚗</div>
        <div style={styles.title}>CarBase Academy</div>
        <div style={styles.subtitle}>Войдите в свой аккаунт</div>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <label style={styles.label}>Пароль</label>
        <input style={styles.input} type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <div style={styles.link}>
          Нет аккаунта?{' '}
          <button style={styles.linkBtn} onClick={() => window.location.href = '/register'}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}
