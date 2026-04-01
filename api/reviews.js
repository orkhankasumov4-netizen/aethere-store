import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;
  if (token) {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (!authError && authUser) user = authUser;
  }

  try {
    if (req.method === 'GET') {
      const { product_id } = req.query;
      let query = supabase.from('reviews').select('*');
      if (product_id) query = query.eq('product_id', product_id);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { product_id, rating, text } = req.body;
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id,
          user_id: user.id,
          rating,
          text,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      // Update product rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product_id);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('products')
          .update({ rating: avg, review_count: reviews.length })
          .eq('id', product_id);
      }
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
