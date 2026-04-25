'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет! Я AI-ассистент CarBase Academy.\n\nЗнаю технологии, скрипты продаж и умею помочь в любой ситуации с клиентом. Опиши ситуацию или задай вопрос — отвечу конкретно и по делу.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const chips = [
    'Клиент говорит дорого — Солярис, 25к',
    'Машина новая, зачем керамика?',
    'Хочет уйти к конкурентам',
    'Как выявить потребность клиента?',
    'Клиент хочет за 2 дня, мы делаем 3',
    'Чем отличается 1 слой от 2?',
    'Этапы технологии для клиента',
    'Б/у авто — как продать керамику'
  ];

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: q }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'assistant', content: data.reply || 'Нет ответа' }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Ошибка соединения.' }]);
    }
    setLoading(false);
  }

  function fmt(t) {
    return (t||'')
      .replace(/\*\*(.*?)\*\*/g,'<strong style="color:#93c5fd">$1</strong>')
      .replace(/\n/g,'<br/>');
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#04080f;font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.25);border-radius:2px}
        @keyframes blink{0%,80%,100%{opacity:.15}40%{opacity:1}}
        @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .chip:hover{background:rgba(59,130,246,0.15)!important;border-color:rgba(59,130,246,0.4)!important;color:#93c5fd!important}
        .inp:focus{border-color:rgba(59,130,246,0.5)!important;outline:none}
      `}</style>
      <div style={{background:'#04080f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'12px'}}>
        <div style={{width:'100%',maxWidth:'480px',borderRadius:'24px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,50,160,0.3)',border:'1px solid rgba(59,130,246,0.1)'}}>
          <div style={{background:'linear-gradient(150deg,#06101f 0%,#0a1c3f 100%)',padding:'18px 20px',borderBottom:'1px solid rgba(59,130,246,0.1)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',boxShadow:'0 6px 20px rgba(59,130,246,0.4)',flexShrink:0}}>🚗</div>
              <div style={{flex:1}}>
                <div style={{color:'#e8f0fe',fontSize:'16px',fontWeight:700,letterSpacing:'-0.3px'}}>CarBase Academy</div>
                <div style={{color:'#3d6496',fontSize:'11px',marginTop:'2px',fontWeight:500}}>AI-ассистент по продажам и технологиям</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'#4ade80',fontWeight:600}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px rgba(74,222,128,0.7)'}}></div>
                Онлайн
              </div>
            </div>
          </div>
          <div ref={msgsRef} style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px',minHeight:'380px',maxHeight:'450px',overflowY:'auto',background:'#04080f'}}>
            {messages.map((m,i)=>(
              <div key={i} style={{animation:'fadein 0.25s ease',display:'flex',flexDirection:'column',alignItems:m.role==='assistant'?'flex-start':'flex-end',gap:'4px'}}>
                {m.role==='assistant' && <div style={{fontSize:'10px',color:'#1e4080',fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 4px'}}>Ассистент</div>}
                <div style={{padding:'12px 15px',borderRadius:m.role==='assistant'?'14px 14px 14px 3px':'14px 14px 3px 14px',fontSize:'13.5px',lineHeight:1.65,maxWidth:'92%',background:m.role==='assistant'?'#0a1628':'linear-gradient(135deg,#1e3a8a,#2563eb)',color:m.role==='assistant'?'#c8dcf8':'#fff',border:m.role==='assistant'?'1px solid rgba(59,130,246,0.12)':'none',boxShadow:m.role==='user'?'0 4px 12px rgba(37,99,235,0.3)':'none'}} dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'4px'}}>
                <div style={{fontSize:'10px',color:'#1e4080',fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 4px'}}>Ассистент</div>
                <div style={{padding:'12px 15px',background:'#0a1628',border:'1px solid rgba(59,130,246,0.12)',borderRadius:'14px 14px 14px 3px',display:'flex',gap:'5px',alignItems:'center'}}>
                  {[0,1,2].map(i=><div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',background:'#3b82f6',animation:`blink 1.2s infinite ${i*0.2}s`}}/>)}
                </div>
