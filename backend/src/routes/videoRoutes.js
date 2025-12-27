const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const videoController = require('../controllers/videoController');
const { authenticate, requireCreator } = require('../middleware/auth');

// Validation rules
const createVideoValidation = [
  body('youtubeVideoId').trim().notEmpty(),
  body('youtubeUrl').isURL(),
  body('title').trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 })
];

const updateVideoValidation = [
  body('title').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 })
];

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.get('/creator/:creatorId', videoController.getVideosByCreator);

// Protected routes (creator only)
router.post('/', authenticate, requireCreator, createVideoValidation, videoController.createVideo);
router.put('/:id', authenticate, requireCreator, updateVideoValidation, videoController.updateVideo);
router.delete('/:id', authenticate, requireCreator, videoController.deleteVideo);

module.exports = router;

