import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Get all active promo codes (admin use)
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .or(`expires_at.is.null`);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { code, orderTotal } = req.body;
      
      if (!code) {
        return res.status(400).json({ valid: false, error: 'Code required' });
      }

      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        return res.status(200).json({ valid: false, error: 'Invalid promo code' });
      }

      // Check expiration
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return res.status(200).json({ valid: false, error: 'Promo code has expired' });
      }

      // Check usage limit
      if (promo.max_uses && promo.used_count >= promo.max_uses) {
        return res.status(200).json({ valid: false, error: 'Promo code has reached its usage limit' });
      }

      // Check minimum order amount
      if (promo.min_order_amount && orderTotal < promo.min_order_amount) {
        return res.status(200).json({ 
          valid: false, 
          error: `Minimum order of $${promo.min_order_amount} required` 
        });
      }

      // Calculate discount
      let discount = 0;
      if (promo.discount_type === 'percent') {
        discount = (orderTotal * promo.discount_value) / 100;
      } else if (promo.discount_type === 'fixed') {
        discount = promo.discount_value;
      } else if (promo.discount_type === 'shipping') {
        discount = 0; // Free shipping handled separately
      }

      return res.status(200).json({
        valid: true,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discount,
        description: getPromoDescription(promo)
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Promo codes API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function getPromoDescription(promo) {
  if (promo.discount_type === 'percent') {
    return `${promo.discount_value}% off`;
  } else if (promo.discount_type === 'fixed') {
    return `$${promo.discount_value} off`;
  } else if (promo.discount_type === 'shipping') {
    return 'Free shipping';
  }
  return '';
}
