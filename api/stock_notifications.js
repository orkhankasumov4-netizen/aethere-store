import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { product_id, email } = req.body;

      if (!product_id || !email) {
        return res.status(400).json({ error: 'Product ID and email are required' });
      }

      // Check if already subscribed
      const { data: existing } = await supabase
        .from('stock_notifications')
        .select('id')
        .eq('product_id', product_id)
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(200).json({ message: 'Already subscribed', already_subscribed: true });
      }

      const { data, error } = await supabase
        .from('stock_notifications')
        .insert({
          product_id,
          email,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ message: 'Successfully subscribed to stock notifications', data });
    }

    if (req.method === 'GET') {
      const { product_id } = req.query;
      if (!product_id) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const { data, error } = await supabase
        .from('stock_notifications')
        .select('*')
        .eq('product_id', product_id);

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Stock notifications API error:', err);
    res.status(500).json({ error: err.message });
  }
}
