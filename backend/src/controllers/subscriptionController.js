const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Get creator's subscription plan
const getCreatorSubscription = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const result = await pool.query(
      `SELECT id, creator_id, monthly_price, is_active, created_at
       FROM subscriptions
       WHERE creator_id = $1 AND is_active = TRUE`,
      [creatorId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get creator subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create subscription plan (creator only)
const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { monthlyPrice } = req.body;
    const creatorId = req.user.id;

    // Check if subscription already exists
    const existing = await pool.query(
      'SELECT id FROM subscriptions WHERE creator_id = $1',
      [creatorId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Subscription plan already exists' });
    }

    const result = await pool.query(
      `INSERT INTO subscriptions (creator_id, monthly_price)
       VALUES ($1, $2)
       RETURNING id, creator_id, monthly_price, is_active, created_at`,
      [creatorId, monthlyPrice]
    );

    res.status(201).json({
      message: 'Subscription plan created successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update subscription plan (creator only)
const updateSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { monthlyPrice, isActive } = req.body;
    const creatorId = req.user.id;

    // Verify ownership
    const subCheck = await pool.query(
      'SELECT creator_id FROM subscriptions WHERE id = $1',
      [id]
    );

    if (subCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    if (subCheck.rows[0].creator_id !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to update this subscription' });
    }

    const result = await pool.query(
      `UPDATE subscriptions
       SET monthly_price = COALESCE($1, monthly_price),
           is_active = COALESCE($2, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, creator_id, monthly_price, is_active, updated_at`,
      [monthlyPrice, isActive, id]
    );

    res.json({
      message: 'Subscription plan updated successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Subscribe to creator
const subscribe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get subscription plan
    const subResult = await pool.query(
      'SELECT id, creator_id, monthly_price FROM subscriptions WHERE id = $1 AND is_active = TRUE',
      [id]
    );

    if (subResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const subscription = subResult.rows[0];

    // Check if already subscribed
    const existing = await pool.query(
      `SELECT id, status FROM user_subscriptions 
       WHERE user_id = $1 AND subscription_id = $2`,
      [userId, id]
    );

    if (existing.rows.length > 0) {
      const userSub = existing.rows[0];
      if (userSub.status === 'active') {
        return res.status(400).json({ error: 'Already subscribed' });
      }
    }

    // TODO: Process payment with Stripe (create recurring subscription)
    // For now, create subscription record
    // In production, this should happen after successful Stripe subscription creation

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const result = await pool.query(
      `INSERT INTO user_subscriptions 
       (user_id, subscription_id, status, current_period_start, current_period_end, stripe_subscription_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, subscription_id) 
       DO UPDATE SET 
         status = 'active',
         current_period_start = $4,
         current_period_end = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, subscription_id, status, current_period_start, current_period_end`,
      [userId, id, 'active', now, periodEnd, `temp_${Date.now()}`]
    );

    res.status(201).json({
      message: 'Subscribed successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel subscription
const unsubscribe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const userSubResult = await pool.query(
      'SELECT id, status FROM user_subscriptions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (userSubResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // TODO: Cancel Stripe subscription
    // For now, just update status
    // In production, cancel via Stripe API first

    const result = await pool.query(
      `UPDATE user_subscriptions
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's subscriptions
const getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT us.id, us.status, us.current_period_start, us.current_period_end,
              s.id as subscription_id, s.monthly_price,
              u.id as creator_id, u.name as creator_name
       FROM user_subscriptions us
       JOIN subscriptions s ON us.subscription_id = s.id
       JOIN users u ON s.creator_id = u.id
       WHERE us.user_id = $1 AND us.status = 'active'
       ORDER BY us.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCreatorSubscription,
  createSubscription,
  updateSubscription,
  subscribe,
  unsubscribe,
  getMySubscriptions
};

