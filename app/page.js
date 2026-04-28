'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [screen, setScreen] = useState('home');
  const [messages, setMessages] = useState([{role:'assistant',content:'Привет! Вставь сообщение клиента или задай вопрос — отвечу с аргументами и ценами 💪'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const chips = ['Клиент говорит дорого','Машина новая зачем керамика','Хочет уйти к конкурентам','Как выявить потребность'];

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const newMsgs = [...messages, {role:'user', content:q}];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages: newMsgs})});
      const data = await res.json();
      setMessages(p => [...p, {role:'assistant', content:data.reply||'Нет ответа'}]);
    } catch {
      setMessages(p => [...p, {role:'assistant', content:'Ошибка соединения.'}]);
    }
    setLoading(false);
  }

  function fmt(t) {
    return (t||'')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/### (.*?)(\n|$)/g,'<div style="font-weight:700;margin:8px 0 4px">$1</div>')
      .replace(/\n/g,'<br/>');
  }

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #dff0ff 0%, #f0f0ff 45%, #ffe8f8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      position: 'relative',
    },
    blob: {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `
        radial-gradient(circle at 15% 15%, rgba(0,113,227,0.1) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(175,82,222,0.08) 0%, transparent 45%)
      `,
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

  // ── HOME ──
  if (screen === 'home') return (
    <div style={styles.app}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}>
          <span>CarBase</span>
          <span style={{fontSize:13}}>📶 🔋</span>
        </div>

        {/* Header */}
        <div style={{marginTop:20, marginBottom:20}}>
          <div style={{fontSize:13, color:'#86868b', fontWeight:500, marginBottom:4}}>Добрый день 👋</div>
          <div style={{fontSize:30, fontWeight:700, letterSpacing:'-0.5px', color:'#1d1d1f', marginBottom:2}}>Менеджер</div>
          <div style={{fontSize:13, color:'#86868b'}}>CarBase Academy</div>
        </div>

        {/* Progress */}
        <div style={{...styles.glass, padding:'16px 18px', marginBottom:24}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span style={{fontSize:13, fontWeight:600, color:'#86868b', textTransform:'uppercase', letterSpacing:'0.4px'}}>Аттестация</span>
            <span style={{fontSize:13, fontWeight:600, color:'#0071e3'}}>0 из 3</span>
          </div>
          <div style={{background:'rgba(0,0,0,0.08)', borderRadius:4, height:6, marginBottom:8}}>
            <div style={{background:'linear-gradient(90deg,#0071e3,#af52de)', height:6, borderRadius:4, width:'0%'}} />
          </div>
          <div style={{fontSize:12, color:'#86868b'}}>Пройди все блоки — откроется КП для клиентов</div>
        </div>

        {/* Cards */}
        <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.3px', color:'#1d1d1f', marginBottom:12}}>Инструменты</div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>

          {/* Chat */}
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer'}} onClick={() => setScreen('chat')}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(0,113,227,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>💬</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>Помощь в чате</div>
              <div style={{fontSize:13, color:'#86868b'}}>Готовые ответы клиентам</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(52,199,89,0.12)', color:'#34c759'}}>Активно</span>
              <span style={{color:'#c7c7cc', fontSize:18}}>›</span>
            </div>
          </div>

          {/* Attestation */}
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer'}} onClick={() => setScreen('attestation')}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(255,149,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>🎓</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>Аттестация</div>
              <div style={{fontSize:13, color:'#86868b'}}>PPF · Антидождь · Продажи</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(255,149,0,0.12)', color:'#ff9500'}}>0/3</span>
              <span style={{color:'#c7c7cc', fontSize:18}}>›</span>
            </div>
          </div>

          {/* Training */}
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer'}} onClick={() => setScreen('training')}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(52,199,89,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>📚</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>Обучение</div>
              <div style={{fontSize:13, color:'#86868b'}}>Тех. карты и скрипты</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(0,113,227,0.1)', color:'#0071e3'}}>2 темы</span>
              <span style={{color:'#c7c7cc', fontSize:18}}>›</span>
            </div>
          </div>

          {/* KP - locked */}
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, opacity:0.45}}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(175,82,222,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>📄</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>КП для клиента</div>
              <div style={{fontSize:13, color:'#86868b'}}>Пройди аттестацию</div>
            </div>
            <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(0,0,0,0.06)', color:'#c7c7cc'}}>🔒</span>
          </div>

        </div>
      </div>
    </div>
  );

  // ── CHAT ──
  if (screen === 'chat') return (
    <div style={{...styles.app, display:'flex', flexDirection:'column', height:'100vh'}}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, flexShrink:0}}>
        <div style={styles.statusBar}><span>CarBase</span><span style={{fontSize:13}}>📶 🔋</span></div>
        <div style={styles.backBtn} onClick={() => setScreen('home')}>‹ Главная</div>
        <div style={{padding:'12px 20px 16px'}}>
          <div style={{fontSize:22, fontWeight:700, letterSpacing:'-0.4px', color:'#1d1d1f', marginBottom:2}}>Помощь в чате</div>
          <div style={{fontSize:13, color:'#86868b'}}>Вставь вопрос клиента — получи ответ</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{flex:1, overflowY:'auto', padding:'0 16px', display:'flex', flexDirection:'column', gap:12, position:'relative', zIndex:1}}>
        {messages.map((m,i) => (
          <div key={i} style={{display:'flex', flexDirection:'column', alignItems: m.role==='assistant' ? 'flex-start' : 'flex-end', gap:4}}>
            <div style={{fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'#86868b', padding:'0 4px'}}>
              {m.role==='assistant' ? 'CarBase AI' : 'Вы'}
            </div>
            <div style={{
              padding:'12px 15px', borderRadius:18, fontSize:14, lineHeight:1.55, maxWidth:'82%',
              borderBottomLeftRadius: m.role==='assistant' ? 4 : 18,
              borderBottomRightRadius: m.role==='user' ? 4 : 18,
              background: m.role==='assistant' ? 'rgba(255,255,255,0.65)' : '#0071e3',
              backdropFilter: m.role==='assistant' ? 'blur(20px)' : 'none',
              border: m.role==='assistant' ? '1px solid rgba(255,255,255,0.75)' : 'none',
              color: m.role==='assistant' ? '#1d1d1f' : 'white',
            }} dangerouslySetInnerHTML={{__html: fmt(m.content)}} />
          </div>
        ))}
        {loading && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4}}>
            <div style={{fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'#86868b', padding:'0 4px'}}>CarBase AI</div>
            <div style={{padding:'12px 15px', background:'rgba(255,255,255,0.65)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:'18px 18px 18px 4px', display:'flex', gap:5}}>
              {[0,1,2].map(i => <div key={i} style={{width:7, height:7, borderRadius:'50%', background:'#86868b', animation:`blink 1.2s infinite ${i*0.2}s`}} />)}
            </div>
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{display:'flex', flexWrap:'wrap', gap:6, padding:'10px 16px', position:'relative', zIndex:1}}>
        {chips.map((c,i) => (
          <button key={i} onClick={() => send(c)} style={{fontSize:12, padding:'6px 12px', border:'1px solid rgba(255,255,255,0.7)', borderRadius:20, background:'rgba(255,255,255,0.5)', backdropFilter:'blur(10px)', cursor:'pointer', color:'#0071e3', fontWeight:500}}>
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:'8px 16px 32px', position:'relative', zIndex:1}}>
        <div style={{...styles.glass, display:'flex', alignItems:'flex-end', gap:8, padding:'10px 10px 10px 16px'}}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Вопрос клиента или свой..."
            rows={1}
            style={{flex:1, background:'none', border:'none', outline:'none', fontFamily:'inherit', fontSize:15, color:'#1d1d1f', resize:'none', maxHeight:100, lineHeight:1.4}}
          />
          <button onClick={() => send()} disabled={loading} style={{width:36, height:36, borderRadius:'50%', background:'#0071e3', border:'none', cursor:'pointer', color:'white', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>↑</button>
        </div>
      </div>
      <style>{`@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );

  // ── ATTESTATION ──
  if (screen === 'attestation') return (
    <div style={{...styles.app, minHeight:'100vh'}}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}><span>CarBase</span><span style={{fontSize:13}}>📶 🔋</span></div>
        <div style={styles.backBtn} onClick={() => setScreen('home')}>‹ Главная</div>
        <div style={{padding:'12px 0 20px'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Аттестация</div>
          <div style={{fontSize:13, color:'#86868b'}}>Выберите блок для прохождения</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {[
            {icon:'🛡️', name:'Антигравийная плёнка', meta:'10 вопросов · ~8 мин', color:'rgba(0,113,227,0.12)', status:'Начать', statusColor:'#ff9500', statusBg:'rgba(255,149,0,0.12)'},
            {icon:'💧', name:'Антидождь', meta:'10 вопросов · ~8 мин', color:'rgba(255,149,0,0.12)', status:'Начать', statusColor:'#ff9500', statusBg:'rgba(255,149,0,0.12)'},
            {icon:'🗣️', name:'Техника продаж', meta:'Скоро — загружаем материалы', color:'rgba(175,82,222,0.12)', status:'Скоро', statusColor:'#c7c7cc', statusBg:'rgba(0,0,0,0.06)'},
          ].map((b,i) => (
            <div key={i} style={{...styles.glass, padding:18}}>
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
                <div style={{width:44, height:44, borderRadius:12, background:b.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>{b.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f'}}>{b.name}</div>
                  <div style={{fontSize:13, color:'#86868b', marginTop:2}}>{b.meta}</div>
                </div>
                <span style={{fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, background:b.statusBg, color:b.statusColor}}>{b.status}</span>
              </div>
              <div style={{background:'rgba(0,0,0,0.07)', borderRadius:3, height:4}}>
                <div style={{height:4, borderRadius:3, background:'#34c759', width:'0%'}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TRAINING ──
  if (screen === 'training') return (
    <div style={{...styles.app, minHeight:'100vh'}}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}><span>CarBase</span><span style={{fontSize:13}}>📶 🔋</span></div>
        <div style={styles.backBtn} onClick={() => setScreen('home')}>‹ Главная</div>
        <div style={{padding:'12px 0 20px'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Обучение</div>
          <div style={{fontSize:13, color:'#86868b'}}>Выберите тему для изучения</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {[
            {icon:'🛡️', name:'Антигравийная плёнка', desc:'Виды, стоимость, этапы оклейки', color:'rgba(0,113,227,0.12)', active:true},
            {icon:'💧', name:'Антидождь', desc:'Составы, нанесение, цены', color:'rgba(255,149,0,0.12)', active:true},
            {icon:'🗣️', name:'Техника продаж', desc:'Скоро — загружаем видео', color:'rgba(175,82,222,0.12)', active:false},
            {icon:'✨', name:'Полировка', desc:'Скоро', color:'rgba(52,199,89,0.12)', active:false},
          ].map((t,i) => (
            <div key={i} style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, opacity: t.active ? 1 : 0.5, cursor: t.active ? 'pointer' : 'default'}}>
              <div style={{width:46, height:46, borderRadius:13, background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>{t.name}</div>
                <div style={{fontSize:13, color:'#86868b'}}>{t.desc}</div>
              </div>
              {t.active && <span style={{color:'#c7c7cc', fontSize:18}}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
