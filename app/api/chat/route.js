import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const { messages } = await request.json();

  let knowledgeBlock = '';
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content');
    if (!error && data && data.length > 0) {
      knowledgeBlock = '\n\n--- БАЗА ЗНАНИЙ (ТЕХ. КАРТЫ) ---\n' +
        data.map(item => `## ${item.title}\n${item.content}`).join('\n\n');
    }
  } catch (e) {
    console.error('knowledge_base error:', e);
  }

  let priceBlock = '';
  try {
    const { data, error } = await supabase
      .from('price_list')
      .select('service_group, service, cat01, cat02, cat03, cat04, cat05');
    if (!error && data && data.length > 0) {
      priceBlock = '\n\n--- АКТУАЛЬНЫЙ ПРАЙС ---\n' +
        'Кат.01 (малый), Кат.02 (средний), Кат.03 (большой), Кат.04 (премиум), Кат.05 (люкс)\n\n' +
        data.map(item =>
          `${item.service_group} / ${item.service}: ${item.cat01}₽ / ${item.cat02}₽ / ${item.cat03}₽ / ${item.cat04}₽ / ${item.cat05}₽`
        ).join('\n');
    }
  } catch (e) {
    console.error('price_list error:', e);
  }

  const SYSTEM = `Ты опытный эксперт по продажам и технологиям детейлинга. Работаешь в сети детейлинг центров CarBase. Помогай менеджерам прямо во время разговора с клиентом. Отвечай как умный коллега — конкретно, с реальными фразами, логически обоснованно. Максимум 6-8 предложений. Когда называешь цены — всегда уточняй категорию автомобиля если она не указана, или давай диапазон цен от минимальной до максимальной категории.` + knowledgeBlock + priceBlock;

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
