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
        return res.status(200).json({ loyalty_points: 0 });
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // Return default if profile doesn't exist
        return res.status(200).json({ id: user.id, loyalty_points: 0 });
      }
      
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('User profile API error:', err);
    res.status(500).json({ error: err.message });
  }
}
