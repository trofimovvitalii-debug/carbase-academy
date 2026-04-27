import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const { messages } = await request.json();
  let knowledgeBlock = '';
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content')
      .order('category');
    console.log('Supabase result:', JSON.stringify(data), 'error:', JSON.stringify(error));
    if (!error && data && data.length > 0) {
      knowledgeBlock = '\n\n--- БАЗА ЗНАНИЙ ---\n' +
        data.map(item => `## ${item.title}\n${item.content}`).join('\n\n');
    }
  } catch (e) {
    console.error('Supabase error:', e);
  }
  const SYSTEM = `Ты опытный эксперт по продажам и технологиям детейлинга. Работаешь в сети детейлинг центров CarBase. Помогай менеджерам прямо во время разговора с клиентом. Отвечай как умный коллега — конкретно, с реальными фразами, логически обоснованно. Максимум 6-8 предложений.` + knowledgeBlock;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1000,
        system: SYSTEM,
        messages
      })
    });
    const data = await response.json();
    if (data.content && data.content[0]) {
      return Response.json({ reply: data.content[0].text });
    }
    return Response.json({ reply: JSON.stringify(data) });
  } catch (error) {
    return Response.json({ reply: 'Ошибка: ' + error.message });
  }
}
