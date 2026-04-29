'use client';
import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      // Проверяем статус
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status, role, name')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.status === 'pending') {
        window.location.href = '/pending';
        return;
      }
      if (profile.status !== 'active') {
        window.location.href = '/login';
        return;
      }
      setUser({ ...session.user, ...profile });
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  if (authLoading) return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg, #dff0ff 0%, #f0f0ff 45%, #ffe8f8 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{fontSize:14, color:'#86868b'}}>Загрузка...</div>
    </div>
  );
  const [messages, setMessages] = useState([{role:'assistant',content:'Привет! Я твой помощник по услугам, технологиям, ценам и технике продаж в CarBase. Задай вопрос или опиши ситуацию с клиентом 💪'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);

  // Аттестация
  const [attStage, setAttStage] = useState('blocks');
  const [attBlock, setAttBlock] = useState(null);
  const [attQuestion, setAttQuestion] = useState('');
  const [attQuestionNum, setAttQuestionNum] = useState(1);
  const [attAnswers, setAttAnswers] = useState([]);
  const [attCurrentAnswer, setAttCurrentAnswer] = useState('');
  const [attLoading, setAttLoading] = useState(false);
  const [attResult, setAttResult] = useState('');

  // Обучение
  const [trainingTopic, setTrainingTopic] = useState(null);
  const [trainingContent, setTrainingContent] = useState('');
  const [trainingLoading, setTrainingLoading] = useState(false);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

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

  async function startAttestation(block) {
    setAttBlock(block);
    setAttAnswers([]);
    setAttQuestionNum(1);
    setAttCurrentAnswer('');
    setAttResult('');
    setAttStage('question');
    setAttLoading(true);
    const res = await fetch('/api/attestation', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:'get_question', block, question_number:1, answers:[]})
    });
    const data = await res.json();
    setAttQuestion(data.question);
    setAttLoading(false);
  }

  async function submitAnswer() {
    if (!attCurrentAnswer.trim()) return;
    const newAnswers = [...attAnswers, {question: attQuestion, answer: attCurrentAnswer}];
    setAttAnswers(newAnswers);
    setAttCurrentAnswer('');
    if (attQuestionNum < 10) {
      const next = attQuestionNum + 1;
      setAttQuestionNum(next);
      setAttLoading(true);
      const res = await fetch('/api/attestation', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({action:'get_question', block:attBlock, question_number:next, answers:newAnswers})
      });
      const data = await res.json();
      setAttQuestion(data.question);
      setAttLoading(false);
    } else {
      setAttStage('evaluating');
      setAttLoading(true);
      const res = await fetch('/api/attestation', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({action:'evaluate', block:attBlock, answers:newAnswers})
      });
      const data = await res.json();
      setAttResult(data.evaluation);
      setAttStage('result');
      setAttLoading(false);
    }
  }

  async function openTopic(topic) {
    setTrainingTopic(topic);
    setTrainingContent('');
    setTrainingLoading(true);
    setScreen('topic');
    const res = await fetch('/api/training', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({title: topic.name})
    });
    const data = await res.json();
    setTrainingContent(data.content || 'Материал не найден');
    setTrainingLoading(false);
  }

  function fmt(t) {
    return (t||'')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/### (.*?)(\n|$)/g,'<div style="font-weight:700;font-size:15px;margin:10px 0 6px;color:#1d1d1f">$1</div>')
      .replace(/## (.*?)(\n|$)/g,'<div style="font-weight:700;margin:8px 0 4px;color:#1d1d1f">$1</div>')
      .replace(/\| (.*?) \| (.*?) \|/g, (match, col1, col2) => {
        if (col1.includes('---')) return '';
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.06)"><span style="color:#1d1d1f">${col1}</span><span style="font-weight:600;color:#0071e3;white-space:nowrap;margin-left:12px">${col2}</span></div>`;
      })
      .replace(/\n/g,'<br/>');
  }

  function fmtContent(t) {
    return (t||'')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/^([А-ЯA-Z][А-ЯA-Z\s\-–—]+):$/gm, '<div style="font-size:13px;font-weight:700;color:#0071e3;text-transform:uppercase;letter-spacing:0.5px;margin:20px 0 8px;padding-top:16px;border-top:1px solid rgba(0,0,0,0.06)">$1</div>')
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

const blocks = [
    {id:'ppf', icon:'🛡️', name:'Антигравийная плёнка', meta:'10 вопросов · ~8 мин', color:'rgba(0,113,227,0.12)', active:true},
    {id:'antidust', icon:'💧', name:'Антидождь', meta:'10 вопросов · ~8 мин', color:'rgba(255,149,0,0.12)', active:true},
    {id:'polish', icon:'✨', name:'Полировка кузова и керамика', meta:'10 вопросов · ~8 мин', color:'rgba(52,199,89,0.12)', active:true},
    {id:'cleaning', icon:'🧹', name:'Химчистка', meta:'10 вопросов · ~8 мин', color:'rgba(175,82,222,0.12)', active:true},
    {id:'price', icon:'💰', name:'Прайс и цены', meta:'10 вопросов · ~8 мин', color:'rgba(52,199,89,0.12)', active:true},
    {id:'sales', icon:'🗣️', name:'Техника продаж', meta:'Скоро — загружаем материалы', color:'rgba(255,59,48,0.12)', active:false},
  ];

  const topics = [
    {icon:'🛡️', name:'Антигравийная пленка', desc:'Виды, этапы оклейки, возражения', color:'rgba(0,113,227,0.12)', active:true},
    {icon:'💧', name:'Антидождь', desc:'Составы, нанесение, допродажи', color:'rgba(255,149,0,0.12)', active:true},
    {icon:'✨', name:'Полировка кузова и керамика', desc:'Технология, виды, аргументы', color:'rgba(52,199,89,0.12)', active:true},
    {icon:'🧹', name:'Химчистка салона', desc:'Технология, допродажи, ошибки', color:'rgba(175,82,222,0.12)', active:true},
    {icon:'🗣️', name:'Техника продаж — базовый минимум', desc:'Скрипты, возражения, допродажи', color:'rgba(255,59,48,0.12)', active:true},
    {icon:'🎬', name:'Видео-материалы', desc:'Скоро — загружаем видео', color:'rgba(255,149,0,0.12)', active:false},
  ];

  // ── HOME ──
  if (screen === 'home') return (
    <div style={styles.app}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}>
          <span>CarBase</span>
          <span style={{fontSize:13}}>📶 🔋</span>
        </div>
        <div style={{marginTop:20, marginBottom:20}}>
          <div style={{fontSize:13, color:'#86868b', fontWeight:500, marginBottom:4}}>Добрый день 👋</div>
          <div style={{fontSize:30, fontWeight:700, letterSpacing:'-0.5px', color:'#1d1d1f', marginBottom:2}}>Менеджер</div>
          <div style={{fontSize:13, color:'#86868b'}}>CarBase Academy</div>
        </div>
        <div style={{...styles.glass, padding:'16px 18px', marginBottom:24}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span style={{fontSize:13, fontWeight:600, color:'#86868b', textTransform:'uppercase', letterSpacing:'0.4px'}}>Аттестация</span>
            <span style={{fontSize:13, fontWeight:600, color:'#0071e3'}}>0 из 4</span>
          </div>
          <div style={{background:'rgba(0,0,0,0.08)', borderRadius:4, height:6, marginBottom:8}}>
            <div style={{background:'linear-gradient(90deg,#0071e3,#af52de)', height:6, borderRadius:4, width:'0%'}} />
          </div>
          <div style={{fontSize:12, color:'#86868b'}}>Пройди все блоки — откроется КП для клиентов</div>
        </div>
        <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.3px', color:'#1d1d1f', marginBottom:12}}>Инструменты</div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
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
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer'}} onClick={() => { setAttStage('blocks'); setScreen('attestation'); }}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(255,149,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>🎓</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>Аттестация</div>
              <div style={{fontSize:13, color:'#86868b'}}>PPF · Антидождь · Полировка · Химчистка</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(255,149,0,0.12)', color:'#ff9500'}}>0/4</span>
              <span style={{color:'#c7c7cc', fontSize:18}}>›</span>
            </div>
          </div>
          <div style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer'}} onClick={() => setScreen('training')}>
            <div style={{width:50, height:50, borderRadius:14, background:'rgba(52,199,89,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}}>📚</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f', marginBottom:3}}>Обучение</div>
              <div style={{fontSize:13, color:'#86868b'}}>Тех. карты и скрипты</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(0,113,227,0.1)', color:'#0071e3'}}>5 тем</span>
              <span style={{color:'#c7c7cc', fontSize:18}}>›</span>
            </div>
          </div>
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
        <div style={styles.backBtn} onClick={() => { attStage === 'blocks' ? setScreen('home') : setAttStage('blocks'); }}>
          ‹ {attStage === 'blocks' ? 'Главная' : 'Блоки'}
        </div>
        {attStage === 'blocks' && (
          <>
            <div style={{padding:'12px 0 20px'}}>
              <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Аттестация</div>
              <div style={{fontSize:13, color:'#86868b'}}>Выберите блок для прохождения</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {blocks.map((b) => (
                <div key={b.id} style={{...styles.glass, padding:18, opacity: b.active ? 1 : 0.5, cursor: b.active ? 'pointer' : 'default'}}
                  onClick={() => b.active && startAttestation(b.id)}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{width:44, height:44, borderRadius:12, background:b.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>{b.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f'}}>{b.name}</div>
                      <div style={{fontSize:13, color:'#86868b', marginTop:2}}>{b.meta}</div>
                    </div>
                    {b.active ? <span style={{fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, background:'rgba(255,149,0,0.12)', color:'#ff9500'}}>Начать</span>
                    : <span style={{fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, background:'rgba(0,0,0,0.06)', color:'#c7c7cc'}}>Скоро</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {attStage === 'question' && (
          <>
            <div style={{padding:'12px 0 16px'}}>
              <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>{blocks.find(b => b.id === attBlock)?.name}</div>
              <div style={{fontSize:13, color:'#86868b'}}>Вопрос {attQuestionNum} из 10</div>
            </div>
            <div style={{background:'rgba(0,0,0,0.08)', borderRadius:4, height:6, marginBottom:20}}>
              <div style={{background:'linear-gradient(90deg,#0071e3,#af52de)', height:6, borderRadius:4, width:`${(attQuestionNum-1)*10}%`, transition:'width 0.3s'}} />
            </div>
            {attLoading ? (
              <div style={{...styles.glass, padding:24, textAlign:'center', color:'#86868b', fontSize:14}}>Загружаем вопрос...</div>
            ) : (
              <>
                <div style={{...styles.glass, padding:20, marginBottom:16}}>
                  <div style={{fontSize:11, fontWeight:600, color:'#0071e3', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10}}>Вопрос {attQuestionNum}</div>
                  <div style={{fontSize:17, fontWeight:600, color:'#1d1d1f', lineHeight:1.5}}>{attQuestion}</div>
                </div>
                <textarea value={attCurrentAnswer} onChange={e => setAttCurrentAnswer(e.target.value)} placeholder="Ваш ответ..." rows={5}
                  style={{width:'100%', background:'rgba(255,255,255,0.62)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.78)', borderRadius:18, padding:16, fontSize:15, fontFamily:'inherit', color:'#1d1d1f', resize:'none', outline:'none', marginBottom:16, boxSizing:'border-box'}} />
                <button onClick={submitAnswer} disabled={!attCurrentAnswer.trim()}
                  style={{width:'100%', padding:'16px', background: attCurrentAnswer.trim() ? '#0071e3' : '#c7c7cc', color:'white', border:'none', borderRadius:14, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor: attCurrentAnswer.trim() ? 'pointer' : 'default'}}>
                  {attQuestionNum < 10 ? 'Следующий вопрос →' : 'Завершить и получить оценку'}
                </button>
              </>
            )}
          </>
        )}
        {attStage === 'evaluating' && (
          <div style={{padding:'40px 0', textAlign:'center'}}>
            <div style={{fontSize:40, marginBottom:16}}>⏳</div>
            <div style={{fontSize:18, fontWeight:600, color:'#1d1d1f', marginBottom:8}}>Анализируем ваши ответы</div>
            <div style={{fontSize:14, color:'#86868b'}}>AI оценивает знания — подождите немного...</div>
          </div>
        )}
        {attStage === 'result' && (
          <>
            <div style={{padding:'12px 0 20px'}}>
              <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>Результат</div>
              <div style={{fontSize:13, color:'#86868b'}}>{blocks.find(b => b.id === attBlock)?.name}</div>
            </div>
            <div style={{...styles.glass, padding:20, marginBottom:16, fontSize:14, lineHeight:1.7, color:'#1d1d1f', whiteSpace:'pre-wrap'}}>{attResult}</div>
            <button onClick={() => setAttStage('blocks')} style={{width:'100%', padding:'16px', background:'#0071e3', color:'white', border:'none', borderRadius:14, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor:'pointer', marginBottom:10}}>
              Пройти другой блок
            </button>
            <button onClick={() => startAttestation(attBlock)} style={{width:'100%', padding:'16px', background:'rgba(255,255,255,0.62)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.78)', borderRadius:14, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor:'pointer', color:'#0071e3'}}>
              Пройти этот блок заново
            </button>
          </>
        )}
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
          {topics.map((t,i) => (
            <div key={i} style={{...styles.glass, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, opacity: t.active ? 1 : 0.5, cursor: t.active ? 'pointer' : 'default'}}
              onClick={() => t.active && openTopic(t)}>
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

  // ── TOPIC (просмотр тех. карты) ──
  if (screen === 'topic') return (
    <div style={{...styles.app, minHeight:'100vh'}}>
      <div style={styles.blob} />
      <div style={{position:'relative', zIndex:1, padding:'0 20px 40px'}}>
        <div style={styles.statusBar}><span>CarBase</span><span style={{fontSize:13}}>📶 🔋</span></div>
        <div style={styles.backBtn} onClick={() => setScreen('training')}>‹ Обучение</div>
        <div style={{padding:'12px 0 20px'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#1d1d1f', marginBottom:4}}>{trainingTopic?.name}</div>
          <div style={{fontSize:13, color:'#86868b'}}>Тех. карта</div>
        </div>
        {trainingLoading ? (
          <div style={{...styles.glass, padding:32, textAlign:'center'}}>
            <div style={{fontSize:24, marginBottom:12}}>📖</div>
            <div style={{fontSize:14, color:'#86868b'}}>Загружаем материал...</div>
          </div>
        ) : (
          <div style={{...styles.glass, padding:20, fontSize:14, lineHeight:1.8, color:'#1d1d1f'}}
            dangerouslySetInnerHTML={{__html: fmtContent(trainingContent)}} />
        )}
      </div>
    </div>
  );
}
