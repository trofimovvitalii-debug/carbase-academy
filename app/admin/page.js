'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [attestations, setAttestations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [tab, setTab] = useState('users'); // users | results

  const blockNames = {
    ppf: '🛡️ PPF',
    antidust: '💧 Антидождь',
    polish: '✨ Полировка',
    cleaning: '🧹 Химчистка',
    price: '💰 Прайс',
    sales: '🗣️ Продажи',
  };

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

  useEffect(() => { checkAdminAndLoad(); }, []);

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }
    const { data: profile } = await supabase
      .from('user_profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') { window.location.href = '/'; return; }
    loadData();
  }

  async function loadData() {
    setLoading(true);

    // Загружаем пользователей
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles').select('*').order('created_at', { ascending: false });
    if (usersError) { setError('Ошибка загрузки'); setLoading(false); return; }
    setUsers(usersData || []);

    // Загружаем результаты аттестаций
    const { data: attData } = await supabase
      .from('attestation_results')
      .select('user_id, block, score, details, created_at')
      .order('created_at', { ascending: false });

    if (attData) {
      const attMap = {};
      attData.forEach(r => {
        if (!attMap[r.user_id]) attMap[r.user_id] = {};
        if (!attMap[r.user_id][r.block]) attMap[r.user_id][r.block] = r;
      });
      setAttestations(attMap);
    }

    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from('user_profiles').update({ status }).eq('id', id);
    loadData();
  }

  function getStatusBadge(status) {
    if (status === 'active') return { label: 'Активен', bg: 'rgba(52,199,89,0.12)', color: '#34c759' };
    if (status === 'pending') return { label: 'Ожидает', bg: 'rgba(255,149,0,0.12)', color: '#ff9500' };
    return { label: 'Заблокирован', bg: 'rgba(255,59,48,0.1)', color: '#ff3b30' };
  }

  function getScoreColor(score) {
    if (!score) return '#86868b';
    const num = parseInt(score);
    if (num >= 8) return '#34c759';
    if (num >= 6) return '#ff9500';
    return '#ff3b30';
  }

  // Детальный просмотр менеджера
  if (selectedUser) {
    const userAtt = attestations[selectedUser.id] || {};
    const blocks = ['ppf', 'antidust', 'polish', 'cleaning', 'price'];
    return (
      <div style={styles.app}>
        <div style={styles.blob} />
        <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
          <div style={styles.statusBar}><span>CarBase</span><span style={{fontSize:13}}>⚙️ Админ</span></div>
          <div style={styles.backBtn} onClick={() => setSelectedUser(null)}>‹ Назад</div>
          <div style={{padding:'12px 0 20px'}}>
            <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>{selectedUser.name}</div>
            <div style={{fontSize:13, color:'#86868b'}}>{selectedUser.position} · {selectedUser.location}</div>
          </div>

          <div style={{fontSize:16, fontWeight:700, color:'#1d1d1f', marginBottom:12}}>Результаты аттестации</div>
          <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:20}}>
            {blocks.map(blockId => {
              const result = userAtt[blockId];
              return (
                <div key={blockId} style={{...styles.glass, padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight:600, color:'#1d1d1f'}}>{blockNames[blockId]}</div>
                    {result && <div style={{fontSize:12, color:'#86868b', marginTop:2}}>
                      {new Date(result.created_at).toLocaleDateString('ru-RU')}
                    </div>}
                  </div>
                  {result ? (
                    <span style={{fontSize:16, fontWeight:700, color: getScoreColor(result.score)}}>{result.score}</span>
                  ) : (
                    <span style={{fontSize:12, color:'#c7c7cc'}}>Не пройден</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Детальные ответы */}
          {Object.keys(userAtt).length > 0 && (
            <>
              <div style={{fontSize:16, fontWeight:700, color:'#1d1d1f', marginBottom:12}}>Детальные разборы</div>
              {Object.entries(userAtt).map(([blockId, result]) => (
                <div key={blockId} style={{...styles.glass, padding:'16px 18px', marginBottom:10}}>
                  <div style={{fontSize:14, fontWeight:700, color:'#1d1d1f', marginBottom:8}}>{blockNames[blockId]}</div>
                  <div style={{fontSize:13, color:'#86868b', whiteSpace:'pre-wrap', lineHeight:1.6}}>{result.details}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
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
        <div style={{padding:'12px 0 16px'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Панель админа</div>
        </div>

        {/* Табы */}
        <div style={{display:'flex', gap:8, marginBottom:20}}>
          <button onClick={() => setTab('users')} style={{flex:1, padding:'10px', borderRadius:12, border:'none', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer', background: tab==='users' ? '#0071e3' : 'rgba(255,255,255,0.62)', color: tab==='users' ? 'white' : '#86868b'}}>
            👥 Менеджеры
          </button>
          <button onClick={() => setTab('results')} style={{flex:1, padding:'10px', borderRadius:12, border:'none', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer', background: tab==='results' ? '#0071e3' : 'rgba(255,255,255,0.62)', color: tab==='results' ? 'white' : '#86868b'}}>
            📊 Аттестации
          </button>
        </div>

        {/* Статистика */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20}}>
          <div style={{...styles.glass, padding:'12px'}}>
            <div style={{fontSize:11, color:'#86868b', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Всего</div>
            <div style={{fontSize:28, fontWeight:700, color:'#1d1d1f'}}>{users.filter(u => u.role !== 'admin').length}</div>
          </div>
          <div style={{...styles.glass, padding:'12px'}}>
            <div style={{fontSize:11, color:'#86868b', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Ожидают</div>
            <div style={{fontSize:28, fontWeight:700, color:'#ff9500'}}>{users.filter(u => u.status === 'pending').length}</div>
          </div>
          <div style={{...styles.glass, padding:'12px'}}>
            <div style={{fontSize:11, color:'#86868b', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Активны</div>
            <div style={{fontSize:28, fontWeight:700, color:'#34c759'}}>{users.filter(u => u.status === 'active' && u.role !== 'admin').length}</div>
          </div>
        </div>

        {loading ? (
          <div style={{...styles.glass, padding:24, textAlign:'center', color:'#86868b'}}>Загрузка...</div>
        ) : error ? (
          <div style={{...styles.glass, padding:24, textAlign:'center', color:'#ff3b30'}}>{error}</div>
        ) : tab === 'users' ? (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {users.map(u => {
              const badge = getStatusBadge(u.status);
              const userAtt = attestations[u.id] || {};
              const completedCount = Object.keys(userAtt).length;
              return (
                <div key={u.id} style={{...styles.glass, padding:'16px 18px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12, marginBottom: u.role !== 'admin' ? 10 : 0}}
                    onClick={() => u.role !== 'admin' && setSelectedUser(u)}
                    style={{...styles.glass, padding:'16px 18px', cursor: u.role !== 'admin' ? 'pointer' : 'default'}}>
                    <div style={{width:42, height:42, borderRadius:12, background:'rgba(0,113,227,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>
                      {u.role === 'admin' ? '👑' : '👤'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, fontWeight:600, color:'#1d1d1f'}}>{u.name}</div>
                      <div style={{fontSize:12, color:'#86868b'}}>{u.position} · {u.location}</div>
                      {u.role !== 'admin' && (
                        <div style={{fontSize:12, color:'#0071e3', marginTop:2}}>
                          Аттестация: {completedCount}/5 блоков
                        </div>
                      )}
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
        ) : (
          // Таб результатов
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {users.filter(u => u.role !== 'admin').map(u => {
              const userAtt = attestations[u.id] || {};
              const blocks = ['ppf', 'antidust', 'polish', 'cleaning', 'price'];
              return (
                <div key={u.id} style={{...styles.glass, padding:'16px 18px', cursor:'pointer'}}
                  onClick={() => setSelectedUser(u)}>
                  <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                    <div style={{width:38, height:38, borderRadius:10, background:'rgba(0,113,227,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16}}>👤</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, fontWeight:600, color:'#1d1d1f'}}>{u.name}</div>
                      <div style={{fontSize:12, color:'#86868b'}}>{u.position}</div>
                    </div>
                    <span style={{fontSize:12, color:'#86868b'}}>{Object.keys(userAtt).length}/5 ›</span>
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    {blocks.map(blockId => {
                      const result = userAtt[blockId];
                      return (
                        <div key={blockId} style={{flex:1, padding:'6px 4px', borderRadius:8, background: result ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.05)', textAlign:'center'}}>
                          <div style={{fontSize:10, color: result ? getScoreColor(result.score) : '#c7c7cc', fontWeight:600}}>
                            {result ? result.score : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:'flex', gap:6, marginTop:4}}>
                    {blocks.map(blockId => (
                      <div key={blockId} style={{flex:1, textAlign:'center', fontSize:9, color:'#c7c7cc'}}>
                        {blockNames[blockId]?.split(' ')[0]}
                      </div>
                    ))}
                  </div>
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
