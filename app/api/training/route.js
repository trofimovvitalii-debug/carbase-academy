import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const { title } = await request.json();

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('title, content')
    .ilike('title', `%${title.split(' ')[0]}%`)
    .single();

  if (error || !data) {
    return Response.json({ content: 'Материал не найден' });
  }

  return Response.json({ content: data.content });
}
