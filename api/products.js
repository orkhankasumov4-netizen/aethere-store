import supabase from '../lib/supabase-server.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, slug, category, search, limit = 50, offset = 0, sort = 'rating' } = req.query;
      
      if (id) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (slug) {
        const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      let query = supabase.from('products').select('*');
      
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('name', `%${search}%`);
      
      const sortMap = {
        'price-low': { column: 'price', ascending: true },
        'price-high': { column: 'price', ascending: false },
        'newest': { column: 'created_at', ascending: false },
        'bestselling': { column: 'review_count', ascending: false },
        'rated': { column: 'rating', ascending: false },
        'rating': { column: 'rating', ascending: false }
      };
      const sortConfig = sortMap[sort] || { column: 'rating', ascending: false };
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending });
      
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      const { data, error, count } = await query;
      if (error) throw error;
      return res.status(200).json({ data, count });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
