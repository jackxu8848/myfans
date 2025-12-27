const pool = require('../config/database');

// Check if user has access to a video
const checkAccess = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    // Get video info
    const videoResult = await pool.query(
      'SELECT price, creator_id FROM videos WHERE id = $1',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResult.rows[0];

    // Free videos are accessible to everyone
    if (parseFloat(video.price) === 0) {
      return res.json({ hasAccess: true, reason: 'free' });
    }

    // Check if user owns the video
    if (video.creator_id === userId) {
      return res.json({ hasAccess: true, reason: 'creator' });
    }

    // Check if user has purchased the video individually
    const individualPurchase = await pool.query(
      'SELECT id FROM purchases WHERE user_id = $1 AND video_id = $2 AND purchase_type = $3',
      [userId, videoId, 'individual']
    );

    if (individualPurchase.rows.length > 0) {
      return res.json({ hasAccess: true, reason: 'purchased' });
    }

    // Check if user has active subscription to creator
    const subscription = await pool.query(
      `SELECT us.id FROM user_subscriptions us
       JOIN subscriptions s ON us.subscription_id = s.id
       WHERE us.user_id = $1 AND s.creator_id = $2 AND us.status = 'active'
       AND us.current_period_end > CURRENT_TIMESTAMP`,
      [userId, video.creator_id]
    );

    if (subscription.rows.length > 0) {
      return res.json({ hasAccess: true, reason: 'subscription' });
    }

    // Check if video is part of a bundle purchase
    const bundlePurchase = await pool.query(
      `SELECT bp.id FROM bundle_purchases bp
       JOIN bundle_purchase_videos bpv ON bp.id = bpv.bundle_purchase_id
       WHERE bp.user_id = $1 AND bpv.video_id = $2`,
      [userId, videoId]
    );

    if (bundlePurchase.rows.length > 0) {
      return res.json({ hasAccess: true, reason: 'bundle' });
    }

    return res.json({ hasAccess: false, reason: 'not_purchased' });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Purchase individual video
const purchaseVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    // Get video info
    const videoResult = await pool.query(
      'SELECT id, price, creator_id FROM videos WHERE id = $1',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResult.rows[0];

    // Check if video is free
    if (parseFloat(video.price) === 0) {
      return res.status(400).json({ error: 'Video is free, no purchase needed' });
    }

    // Check if user is trying to buy their own video
    if (video.creator_id === userId) {
      return res.status(400).json({ error: 'Cannot purchase your own video' });
    }

    // Check if already purchased
    const existingPurchase = await pool.query(
      'SELECT id FROM purchases WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ error: 'Video already purchased' });
    }

    // TODO: Process payment (Stripe integration)
    // For now, create purchase record
    // In production, this should happen after successful payment

    const result = await pool.query(
      `INSERT INTO purchases (user_id, video_id, purchase_type, amount_paid, transaction_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, video_id, purchase_type, amount_paid, created_at`,
      [userId, videoId, 'individual', video.price, `temp_${Date.now()}`]
    );

    res.status(201).json({
      message: 'Video purchased successfully',
      purchase: result.rows[0]
    });
  } catch (error) {
    console.error('Purchase video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's purchases
const getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.id, p.video_id, p.purchase_type, p.amount_paid, p.created_at,
              v.title, v.youtube_url, v.thumbnail_url
       FROM purchases p
       JOIN videos v ON p.video_id = v.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  checkAccess,
  purchaseVideo,
  getMyPurchases
};

