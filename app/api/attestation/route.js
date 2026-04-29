import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const { action, block, answers, question_number } = await request.json();

  let knowledge = '';

  if (block === 'price') {
    // Для прайса тянем из price_list
    const { data: priceData, error: priceError } = await supabase
      .from('price_list')
      .select('service_group, service, cat01, cat02, cat03, cat04, cat05');

    if (priceError || !priceData || priceData.length === 0) {
      return Response.json({ error: 'Нет данных в прайсе' });
    }

    knowledge = 'АКТУАЛЬНЫЙ ПРАЙС CarBase:\nКат.01 (малый класс), Кат.02 (средний), Кат.03 (большой), Кат.04 (премиум), Кат.05 (люкс/внедорожник)\n\n' +
      priceData.map(item =>
        `${item.service_group} / ${item.service}: Кат.01=${item.cat01}₽, Кат.02=${item.cat02}₽, Кат.03=${item.cat03}₽, Кат.04=${item.cat04}₽, Кат.05=${item.cat05}₽`
      ).join('\n');
  } else {
    // Для остальных блоков тянем из knowledge_base
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content')
      .eq('category', 'tech_card');

    if (error || !data || data.length === 0) {
      return Response.json({ error: 'Нет данных в базе знаний' });
    }

    let blockData = data;
    if (block === 'ppf') {
      blockData = data.filter(d => d.title.toLowerCase().includes('пленк') || d.title.toLowerCase().includes('ppf'));
    } else if (block === 'antidust') {
      blockData = data.filter(d => d.title.toLowerCase().includes('антидождь'));
    } else if (block === 'polish') {
      blockData = data.filter(d => d.title.toLowerCase().includes('полировк') || d.title.toLowerCase().includes('керамик'));
    } else if (block === 'cleaning') {
      blockData = data.filter(d => d.title.toLowerCase().includes('химчистк'));
    }

    knowledge = blockData.map(item => `## ${item.title}\n${item.content}`).join('\n\n');
  }

  if (action === 'get_question') {
    const prevQuestions = answers?.map(a => a.question) || [];

    const systemPrompt = block === 'price'
      ? `Ты экзаменатор в детейлинг центре CarBase. Проверяй знание цен на услуги. Используй только данные из прайса ниже.\n\n${knowledge}\n\nПравила:\n- Задавай ТОЛЬКО ОДИН конкретный вопрос про цены\n- Вопросы должны быть практическими: "Сколько стоит...", "Какая цена на... для авто категории...", "Чем отличается цена для кат.01 и кат.05 на..."\n- Не повторяй вопросы которые уже были заданы\n- Отвечай только вопросом без лишних слов`
      : `Ты экзаменатор в детейлинг центре CarBase. Задавай вопросы менеджерам для проверки знаний. Используй только информацию из базы знаний ниже.\n\n${knowledge}\n\nПравила:\n- Задавай ТОЛЬКО ОДИН конкретный вопрос\n- Вопрос должен быть практическим — про технологии, отличия услуг, работу с возражениями, допродажи\n- Не повторяй вопросы которые уже были заданы\n- Отвечай только вопросом без лишних слов`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Задай вопрос номер ${question_number} из 10. Уже заданные вопросы: ${JSON.stringify(prevQuestions)}` }
        ]
      })
    });
    const result = await response.json();
    return Response.json({ question: result.content[0].text });
  }

  if (action === 'evaluate') {
    const answersText = answers.map((a, i) =>
      `Вопрос ${i + 1}: ${a.question}\nОтвет менеджера: ${a.answer}`
    ).join('\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: `Ты строгий но справедливый экзаменатор в детейлинг центре CarBase. Оценивай ответы менеджеров на основе базы знаний.\n\n${knowledge}\n\nФормат ответа:\nОБЩИЙ БАЛЛ: X/10\n\nРАЗБОР ОТВЕТОВ:\n1. [Вопрос] — Правильно/Частично/Неправильно\n[Что было правильно и что упущено]\n\nТЕМЫ ДЛЯ ПОВТОРЕНИЯ:\n[Список тем]\n\nВЫВОД:\n[Готов ли менеджер к работе с клиентами по данной теме]`,
        messages: [
          { role: 'user', content: `Оцени ответы менеджера:\n\n${answersText}` }
        ]
      })
    });
    const result = await response.json();
    return Response.json({ evaluation: result.content[0].text });
  }
}
