const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Get creator's bundles
const getCreatorBundles = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const result = await pool.query(
      `SELECT id, name, video_count, price, is_active, created_at
       FROM bundles
       WHERE creator_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [creatorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get creator bundles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create bundle (creator only)
const createBundle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, videoCount, price } = req.body;
    const creatorId = req.user.id;

    const result = await pool.query(
      `INSERT INTO bundles (creator_id, name, video_count, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, creator_id, name, video_count, price, is_active, created_at`,
      [creatorId, name, videoCount, price]
    );

    res.status(201).json({
      message: 'Bundle created successfully',
      bundle: result.rows[0]
    });
  } catch (error) {
    console.error('Create bundle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update bundle (creator only)
const updateBundle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, videoCount, price, isActive } = req.body;
    const creatorId = req.user.id;

    // Verify ownership
    const bundleCheck = await pool.query(
      'SELECT creator_id FROM bundles WHERE id = $1',
      [id]
    );

    if (bundleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    if (bundleCheck.rows[0].creator_id !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to update this bundle' });
    }

    const result = await pool.query(
      `UPDATE bundles
       SET name = COALESCE($1, name),
           video_count = COALESCE($2, video_count),
           price = COALESCE($3, price),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, creator_id, name, video_count, price, is_active, updated_at`,
      [name, videoCount, price, isActive, id]
    );

    res.json({
      message: 'Bundle updated successfully',
      bundle: result.rows[0]
    });
  } catch (error) {
    console.error('Update bundle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete bundle (creator only)
const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.id;

    // Verify ownership
    const bundleCheck = await pool.query(
      'SELECT creator_id FROM bundles WHERE id = $1',
      [id]
    );

    if (bundleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    if (bundleCheck.rows[0].creator_id !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to delete this bundle' });
    }

    await pool.query('DELETE FROM bundles WHERE id = $1', [id]);

    res.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    console.error('Delete bundle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Purchase bundle
const purchaseBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedVideoIds } = req.body;
    const userId = req.user.id;

    // Get bundle info
    const bundleResult = await pool.query(
      'SELECT id, creator_id, video_count, price FROM bundles WHERE id = $1 AND is_active = TRUE',
      [id]
    );

    if (bundleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bundle not found or inactive' });
    }

    const bundle = bundleResult.rows[0];

    // Validate video count
    if (!selectedVideoIds || selectedVideoIds.length !== bundle.video_count) {
      return res.status(400).json({ 
        error: `Please select exactly ${bundle.video_count} videos` 
      });
    }

    // Verify all videos belong to the bundle creator
    const videosResult = await pool.query(
      `SELECT id FROM videos 
       WHERE id = ANY($1::uuid[]) AND creator_id = $2`,
      [selectedVideoIds, bundle.creator_id]
    );

    if (videosResult.rows.length !== bundle.video_count) {
      return res.status(400).json({ error: 'Invalid video selection' });
    }

    // TODO: Process payment (Stripe integration)
    // For now, create bundle purchase record
    // In production, this should happen after successful payment

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create bundle purchase
      const bundlePurchaseResult = await client.query(
        `INSERT INTO bundle_purchases (user_id, bundle_id, selected_video_ids, amount_paid, transaction_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, id, selectedVideoIds, bundle.price, `temp_${Date.now()}`]
      );

      const bundlePurchaseId = bundlePurchaseResult.rows[0].id;

      // Create junction records for each video
      for (const videoId of selectedVideoIds) {
        await client.query(
          'INSERT INTO bundle_purchase_videos (bundle_purchase_id, video_id) VALUES ($1, $2)',
          [bundlePurchaseId, videoId]
        );

        // Also create individual purchase records for easier access checking
        await client.query(
          `INSERT INTO purchases (user_id, video_id, purchase_type, amount_paid, transaction_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, video_id, purchase_type) DO NOTHING`,
          [userId, videoId, 'bundle', 0, `bundle_${bundlePurchaseId}`]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Bundle purchased successfully',
        bundlePurchaseId,
        videosUnlocked: selectedVideoIds.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Purchase bundle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCreatorBundles,
  createBundle,
  updateBundle,
  deleteBundle,
  purchaseBundle
};

