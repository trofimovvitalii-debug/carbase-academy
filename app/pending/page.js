'use client';
import { supabase } from '@/lib/supabase';

export default function Pending() {
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
      padding: '40px 24px', position: 'relative', zIndex: 1,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textAlign: 'center',
    },
    icon: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 },
    text: { fontSize: 14, color: '#86868b', lineHeight: 1.6, marginBottom: 32 },
    btn: {
      width: '100%', padding: '14px', background: 'rgba(0,0,0,0.06)', color: '#86868b',
      border: 'none', borderRadius: '12px', fontSize: 15, fontWeight: 600,
      fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div style={styles.app}>
      <div style={styles.blob} />
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>
        <div style={styles.title}>Заявка на рассмотрении</div>
        <div style={styles.text}>
          Ваша заявка отправлена администратору. Как только он одобрит доступ — вы сможете войти в систему.
          <br /><br />
          Обычно это занимает несколько минут.
        </div>
        <button style={styles.btn} onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}
