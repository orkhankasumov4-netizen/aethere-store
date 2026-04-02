import supabase from '../lib/supabase-server.js';

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
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { items, total, shipping_address, payment_method } = req.body;
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items,
          total,
          status: 'pending',
          shipping_address,
          payment_method,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      // Clear cart after order
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
