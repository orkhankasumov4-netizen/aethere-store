import supabase from '../lib/supabase-server.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action } = req.query;

  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;
  if (token) {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (!authError && authUser) user = authUser;
  }

  try {
    // User profile endpoints
    if (action === 'profile') {
      if (req.method === 'GET') {
        return await handleGetUserProfile(req, res, user);
      }
      if (req.method === 'PUT') {
        return await handleUpdateUserProfile(req, res, user);
      }
    }

    // Loyalty points endpoints
    if (action === 'loyalty') {
      if (req.method === 'GET') {
        return await handleGetLoyaltyHistory(req, res, user);
      }
      if (req.method === 'POST') {
        return await handleAddLoyaltyPoints(req, res, user);
      }
    }

    res.status(400).json({ error: 'Invalid action. Use: profile or loyalty' });
  } catch (err) {
    console.error('User API error:', err);
    res.status(500).json({ error: err.message });
  }
}

// User profile handlers
async function handleGetUserProfile(req, res, user) {
  if (!user) {
    return res.status(200).json({ loyalty_points: 0 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return res.status(200).json({ id: user.id, loyalty_points: 0 });
  }

  return res.status(200).json(data);
}

async function handleUpdateUserProfile(req, res, user) {
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { full_name } = req.body;

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      full_name,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return res.status(200).json(data);
}

// Loyalty points handlers
async function handleGetLoyaltyHistory(req, res, user) {
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

async function handleAddLoyaltyPoints(req, res, user) {
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
