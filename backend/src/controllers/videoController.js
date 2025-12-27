const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Get all videos (public)
const getAllVideos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.id, v.youtube_video_id, v.youtube_url, v.title, v.thumbnail_url, 
              v.price, v.created_at, u.id as creator_id, u.name as creator_name
       FROM videos v
       JOIN users u ON v.creator_id = u.id
       ORDER BY v.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT v.id, v.youtube_video_id, v.youtube_url, v.title, v.thumbnail_url, 
              v.price, v.created_at, u.id as creator_id, u.name as creator_name
       FROM videos v
       JOIN users u ON v.creator_id = u.id
       WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get videos by creator
const getVideosByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const result = await pool.query(
      `SELECT id, youtube_video_id, youtube_url, title, thumbnail_url, price, created_at
       FROM videos
       WHERE creator_id = $1
       ORDER BY created_at DESC`,
      [creatorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get creator videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create video (creator only)
const createVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { youtubeVideoId, youtubeUrl, title, thumbnailUrl, price } = req.body;
    const creatorId = req.user.id;

    const result = await pool.query(
      `INSERT INTO videos (creator_id, youtube_video_id, youtube_url, title, thumbnail_url, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, youtube_video_id, youtube_url, title, thumbnail_url, price, created_at`,
      [creatorId, youtubeVideoId, youtubeUrl, title, thumbnailUrl, price || 0]
    );

    res.status(201).json({
      message: 'Video created successfully',
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update video (creator only)
const updateVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, price } = req.body;
    const creatorId = req.user.id;

    // Verify ownership
    const videoCheck = await pool.query(
      'SELECT creator_id FROM videos WHERE id = $1',
      [id]
    );

    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (videoCheck.rows[0].creator_id !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to update this video' });
    }

    const result = await pool.query(
      `UPDATE videos 
       SET title = COALESCE($1, title), price = COALESCE($2, price), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, youtube_video_id, youtube_url, title, thumbnail_url, price, updated_at`,
      [title, price, id]
    );

    res.json({
      message: 'Video updated successfully',
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete video (creator only)
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.id;

    // Verify ownership
    const videoCheck = await pool.query(
      'SELECT creator_id FROM videos WHERE id = $1',
      [id]
    );

    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (videoCheck.rows[0].creator_id !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }

    await pool.query('DELETE FROM videos WHERE id = $1', [id]);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  getVideosByCreator,
  createVideo,
  updateVideo,
  deleteVideo
};

