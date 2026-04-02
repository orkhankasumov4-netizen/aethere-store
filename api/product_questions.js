import supabase from '../lib/supabase-server.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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
      
      let query = supabase
        .from('product_questions')
        .select(`
          *,
          user_id,
          answered_at
        `)
        .eq('product_id', product_id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Get user details for each question
      const questionsWithUsers = await Promise.all(
        data.map(async (q) => {
          if (q.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('email')
              .eq('id', q.user_id)
              .single();
            return { ...q, user_email: userData?.email };
          }
          return q;
        })
      );

      return res.status(200).json(questionsWithUsers);
    }

    if (req.method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { product_id, question } = req.body;

      if (!product_id || !question) {
        return res.status(400).json({ error: 'Product ID and question are required' });
      }

      const { data, error } = await supabase
        .from('product_questions')
        .insert({
          product_id,
          user_id: user.id,
          question,
          answer: null,
          answered_at: null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ message: 'Question submitted successfully', data });
    }

    if (req.method === 'PUT') {
      // Admin endpoint to answer questions
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id, answer } = req.body;

      if (!id || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }

      const { data, error } = await supabase
        .from('product_questions')
        .update({
          answer,
          answered_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ message: 'Answer submitted successfully', data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Product questions API error:', err);
    res.status(500).json({ error: err.message });
  }
}
