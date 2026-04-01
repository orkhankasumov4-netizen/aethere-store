import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return res.status(200).json({ message: 'Already subscribed', already_subscribed: true });
      }

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          subscribed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(200).json({ message: 'Already subscribed', already_subscribed: true });
        }
        throw error;
      }

      return res.status(201).json({ message: 'Successfully subscribed to newsletter', data });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Newsletter API error:', err);
    res.status(500).json({ error: err.message });
  }
}
