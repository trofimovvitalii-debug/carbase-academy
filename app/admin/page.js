'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #dff0ff 0%, #f0f0ff 45%, #ffe8f8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    },
    blob: {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(circle at 15% 15%, rgba(0,113,227,0.1) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(175,82,222,0.08) 0%, transparent 45%)`,
    },
    statusBar: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px 0', fontSize: '15px', fontWeight: 700, color: '#1d1d1f',
      position: 'relative', zIndex: 1,
    },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '8px 16px 8px 10px',
      background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.7)', borderRadius: '20px',
      cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: '#0071e3',
      margin: '12px 20px 0', position: 'relative', zIndex: 1,
    },
    glass: {
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.78)',
      borderRadius: '18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
  };

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    loadUsers();
  }

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { setError('Ошибка загрузки'); }
    else { setUsers(data); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ status })
      .eq('id', id);
    if (!error) loadUsers();
  }

  function getStatusBadge(status) {
    if (status === 'active') return { label: 'Активен', bg: 'rgba(52,199,89,0.12)', color: '#34c759' };
    if (status === 'pending') return { label: 'Ожидает', bg: 'rgba(255,149,0,0.12)', color: '#ff9500' };
    return { label: 'Заблокирован', bg: 'rgba(255,59,48,0.1)', color: '#ff3b30' };
  }

  return (
    <div style={styles.app}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}>
          <span>CarBase</span>
          <span style={{fontSize:13}}>⚙️ Админ</span>
        </div>
        <div style={styles.backBtn} onClick={() => window.location.href = '/'}>‹ Главная</div>
        <div style={{padding:'12px 0 20px'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Панель админа</div>
          <div style={{fontSize:13, color:'#86868b'}}>Управление пользователями</div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20}}>
          <div style={{...styles.glass, padding:'16px'}}>
            <div style={{fontSize:12, color:'#86868b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:4}}>Всего</div>
            <div style={{fontSize:32, fontWeight:700, color:'#1d1d1f'}}>{users.length}</div>
          </div>
          <div style={{...styles.glass, padding:'16px'}}>
            <div style={{fontSize:12, color:'#86868b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:4}}>Ожидают</div>
            <div style={{fontSize:32, fontWeight:700, color:'#ff9500'}}>{users.filter(u => u.status === 'pending').length}</div>
          </div>
        </div>

        {loading ? (
          <div style={{...styles.glass, padding:24, textAlign:'center', color:'#86868b'}}>Загрузка...</div>
        ) : error ? (
          <div style={{...styles.glass, padding:24, textAlign:'center', color:'#ff3b30'}}>{error}</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {users.map(u => {
              const badge = getStatusBadge(u.status);
              return (
                <div key={u.id} style={{...styles.glass, padding:'16px 18px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12, marginBottom: u.role !== 'admin' ? 10 : 0}}>
                    <div style={{width:42, height:42, borderRadius:12, background:'rgba(0,113,227,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>
                      {u.role === 'admin' ? '👑' : '👤'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, fontWeight:600, color:'#1d1d1f'}}>{u.name}</div>
                      <div style={{fontSize:12, color:'#86868b'}}>{u.position} · {u.location}</div>
                    </div>
                    <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:badge.bg, color:badge.color}}>{badge.label}</span>
                  </div>
                  {u.role !== 'admin' && (
                    <div style={{display:'flex', gap:8}}>
                      {u.status !== 'active' && (
                        <button onClick={() => updateStatus(u.id, 'active')}
                          style={{flex:1, padding:'9px', background:'rgba(52,199,89,0.12)', color:'#34c759', border:'none', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer'}}>
                          ✓ Одобрить
                        </button>
                      )}
                      {u.status === 'active' && (
                        <button onClick={() => updateStatus(u.id, 'pending')}
                          style={{flex:1, padding:'9px', background:'rgba(255,149,0,0.12)', color:'#ff9500', border:'none', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer'}}>
                          ⏸ Приостановить
                        </button>
                      )}
                      {u.status !== 'blocked' && (
                        <button onClick={() => updateStatus(u.id, 'blocked')}
                          style={{flex:1, padding:'9px', background:'rgba(255,59,48,0.1)', color:'#ff3b30', border:'none', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer'}}>
                          ✕ Блокировать
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
          style={{width:'100%', padding:'14px', background:'rgba(255,59,48,0.1)', color:'#ff3b30', border:'none', borderRadius:14, fontSize:15, fontWeight:600, fontFamily:'inherit', cursor:'pointer', marginTop:20}}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
