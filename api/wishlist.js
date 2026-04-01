import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
      if (!user) return res.status(200).json([]);
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { product_id, alert_enabled = false } = req.body;
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id, alert_enabled })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { product_id } = req.body;
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'PUT') {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { product_id, alert_enabled } = req.body;
      const { data, error } = await supabase
        .from('wishlist')
        .update({ alert_enabled })
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
