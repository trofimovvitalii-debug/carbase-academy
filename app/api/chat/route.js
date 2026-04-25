import { supabase } from '@/lib/supabase';

const SYSTEM_BASE = `Ты опытный эксперт по продажам и технологиям детейлинга. Работаешь в сети детейлинг центров CarBase. Помогай менеджерам прямо во время разговора с клиентом. Отвечай как умный коллега — конкретно, с реальными фразами, логически обоснованно. Максимум 6-8 предложений.

ВОЗРАЖЕНИЯ:
"Дорого" → Разложи по годам. Сравни с ремонтом одной детали. Керамика = страховка.
"Машина новая" → Сейчас лак идеальный — легче защитить чем восстанавливать. Первые царапины через месяц.
"Воск сам" → Воск держится 3-4 недели. Керамика 2-3 года. Посчитай время за 3 года.
"Конкуренты" → Уточни сколько слоёв и время выдержки. За 2 дня — нарушают технологию.
"Не важен вид" → Речь о защите лака от реагентов. Это про стоимость авто при продаже.

ТЕХНОЛОГИЯ: Осмотр → Подготовка (мойка+глина) → Полировка 2-3 этапа → Керамика → Контроль в УФ.
УХОД: Первая мойка через 7 дней. pH-нейтральные шампуни. Без жёстких щёток.
2 СЛОЯ: Для тёмных авто, срок 3-4 года, зеркальный блеск.`;

export async function POST(request) {
  const { messages } = await request.json();

  let knowledgeBlock = '';
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content')
      .order('category');

    if (!error && data && data.length > 0) {
      knowledgeBlock = '\n\n--- БАЗА ЗНАНИЙ ---\n' +
        data.map(item => `## ${item.title}\n${item.content}`).join('\n\n');
    }
  } catch (e) {
    console.error('Supabase error:', e);
  }

  const SYSTEM = SYSTEM_BASE + knowledgeBlock;

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
