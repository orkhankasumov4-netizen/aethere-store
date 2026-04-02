import supabase from '../lib/supabase-server.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action } = req.query;

  try {
    // Newsletter endpoints
    if (action === 'newsletter') {
      if (req.method === 'POST') {
        return await handleNewsletterSubscribe(req, res);
      }
      if (req.method === 'GET') {
        return await handleNewsletterGetAll(req, res);
      }
    }

    // Promo code validation
    if (action === 'promo') {
      if (req.method === 'POST') {
        return await handlePromoValidate(req, res);
      }
      if (req.method === 'GET') {
        return await handlePromoGetAll(req, res);
      }
    }

    // Stock notifications
    if (action === 'stock-notification') {
      if (req.method === 'POST') {
        return await handleStockNotification(req, res);
      }
      if (req.method === 'GET') {
        return await handleStockNotificationGet(req, res);
      }
    }

    res.status(400).json({ error: 'Invalid action. Use: newsletter, promo, or stock-notification' });
  } catch (err) {
    console.error('Engagement API error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Newsletter handlers
async function handleNewsletterSubscribe(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

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
    if (error.code === '23505') {
      return res.status(200).json({ message: 'Already subscribed', already_subscribed: true });
    }
    throw error;
  }

  return res.status(201).json({ message: 'Successfully subscribed to newsletter', data });
}

async function handleNewsletterGetAll(req, res) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) throw error;
  return res.status(200).json(data);
}

// Promo code handlers
async function handlePromoValidate(req, res) {
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

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return res.status(200).json({ valid: false, error: 'Promo code has expired' });
  }

  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return res.status(200).json({ valid: false, error: 'Promo code has reached its usage limit' });
  }

  if (promo.min_order_amount && orderTotal < promo.min_order_amount) {
    return res.status(200).json({
      valid: false,
      error: `Minimum order of $${promo.min_order_amount} required`
    });
  }

  let discount = 0;
  if (promo.discount_type === 'percent') {
    discount = (orderTotal * promo.discount_value) / 100;
  } else if (promo.discount_type === 'fixed') {
    discount = promo.discount_value;
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

async function handlePromoGetAll(req, res) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .or('expires_at.is.null');

  if (error) throw error;
  return res.status(200).json(data);
}

// Stock notification handlers
async function handleStockNotification(req, res) {
  const { product_id, email } = req.body;

  if (!product_id || !email) {
    return res.status(400).json({ error: 'Product ID and email are required' });
  }

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

async function handleStockNotificationGet(req, res) {
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
