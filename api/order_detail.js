import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Order ID required' });
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Order detail API error:', err);
    res.status(500).json({ error: err.message });
  }
}
