'use client';
import { useState, useRef, useEffect } from 'react';
export default function Home() {
  const [messages, setMessages] = useState([{role:'assistant',content:'Привет! Я AI-ассистент CarBase Academy. Опиши ситуацию с клиентом — отвечу конкретно и по делу.'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);
  useEffect(()=>{if(msgsRef.current)msgsRef.current.scrollTop=msgsRef.current.scrollHeight;},[messages,loading]);
  const chips=['Клиент говорит дорого','Машина новая зачем керамика','Хочет уйти к конкурентам','Как выявить потребность','1 vs 2 слоя керамики','Этапы технологии'];
  async function send(text){
    const q=text||input.trim();
    if(!q||loading)return;
    setInput('');
    const newMsgs=[...messages,{role:'user',content:q}];
    setMessages(newMsgs);
    setLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json();
      setMessages(p=>[...p,{role:'assistant',content:data.reply||'Нет ответа'}]);
    }catch{
      setMessages(p=>[...p,{role:'assistant',content:'Ошибка соединения.'}]);
    }
    setLoading(false);
  }
  return(
    <div style={{background:'#04080f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'12px',fontFamily:'system-ui,sans-serif'}}>
      <style>{`@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{width:'100%',maxWidth:'480px',borderRadius:'24px',overflow:'hidden',border:'1px solid rgba(59,130,246,0.15)',boxShadow:'0 32px 80px rgba(0,50,160,0.3)'}}>
        <div style={{background:'linear-gradient(150deg,#06101f,#0a1c3f)',padding:'18px 20px',borderBottom:'1px solid rgba(59,130,246,0.1)',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',boxShadow:'0 6px 20px rgba(59,130,246,0.4)'}}>🚗</div>
          <div style={{flex:1}}>
            <div style={{color:'#e8f0fe',fontSize:'16px',fontWeight:700}}>CarBase Academy</div>
            <div style={{color:'#3d6496',fontSize:'11px',marginTop:'2px'}}>AI-ассистент по продажам и технологиям</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'#4ade80',fontWeight:600}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px rgba(74,222,128,0.7)'}}></div>Онлайн
          </div>
        </div>
        <div ref={msgsRef} style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px',minHeight:'380px',maxHeight:'450px',overflowY:'auto',background:'#04080f'}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='assistant'?'flex-start':'flex-end',gap:'4px'}}>
              {m.role==='assistant'&&<div style={{fontSize:'10px',color:'#1e4080',fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 4px'}}>Ассистент</div>}
              <div style={{padding:'12px 15px',borderRadius:m.role==='assistant'?'14px 14px 14px 3px':'14px 14px 3px 14px',fontSize:'13.5px',lineHeight:1.65,maxWidth:'92%',background:m.role==='assistant'?'#0a1628':'linear-gradient(135deg,#1e3a8a,#2563eb)',color:m.role==='assistant'?'#c8dcf8':'#fff',border:m.role==='assistant'?'1px solid rgba(59,130,246,0.12)':'none'}}>{m.content}</div>
            </div>
          ))}
          {loading&&<div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'4px'}}><div style={{fontSize:'10px',color:'#1e4080',fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 4px'}}>Ассистент</div><div style={{padding:'12px 15px',background:'#0a1628',border:'1px solid rgba(59,130,246,0.12)',borderRadius:'14px 14px 14px 3px',display:'flex',gap:'5px'}}>{[0,1,2].map(i=><div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',background:'#3b82f6',animation:`blink 1.2s infinite ${i*0.2}s`}}/>)}</div></div>}
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px',padding:'10px 16px',borderTop:'1px solid rgba(59,130,246,0.08)',background:'#060d1a'}}>
          {chips.map((c,i)=><button key={i} onClick={()=>send(c)} style={{fontSize:'11px',padding:'5px 11px',border:'1px solid rgba(59,130,246,0.18)',borderRadius:'20px',background:'none',cursor:'pointer',color:'#4a7fd4'}}>{c}</button>)}
        </div>
        <div style={{display:'flex',gap:'8px',padding:'12px 16px',borderTop:'1px solid rgba(59,130,246,0.08)',background:'#060d1a'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Опиши ситуацию с клиентом..." style={{flex:1,padding:'11px 16px',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'24px',fontSize:'13px',background:'#0a1628',color:'#c8dcf8',outline:'none'}}/>
          <button onClick={()=>send()} disabled={loading} style={{width:'42px',height:'42px',borderRadius:'50%',background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',border:'none',cursor:'pointer',color:'#fff',fontSize:'19px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(59,130,246,0.4)'}}>↑</button>
        </div>
      </div>
    </div>
  );
}
