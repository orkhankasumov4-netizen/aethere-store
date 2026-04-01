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
      if (!user) {
        return res.status(200).json([]);
      }
      
      const { data, error } = await supabase
        .from('loyalty_points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(200).json([]);
      }
      
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { points, reason, order_id } = req.body;
      
      const { data, error } = await supabase
        .from('loyalty_points_history')
        .insert({
          user_id: user.id,
          points,
          reason,
          order_id: order_id || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also update user profile
      await supabase.rpc('add_loyalty_points', { user_uuid: user.id, points });
      
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Loyalty points API error:', err);
    res.status(500).json({ error: err.message });
  }
}
