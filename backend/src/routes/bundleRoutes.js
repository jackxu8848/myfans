const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bundleController = require('../controllers/bundleController');
const { authenticate, requireCreator } = require('../middleware/auth');

const createBundleValidation = [
  body('name').optional().trim().notEmpty(),
  body('videoCount').isInt({ min: 2 }),
  body('price').isFloat({ min: 0.01 })
];

const updateBundleValidation = [
  body('name').optional().trim().notEmpty(),
  body('videoCount').optional().isInt({ min: 2 }),
  body('price').optional().isFloat({ min: 0.01 }),
  body('isActive').optional().isBoolean()
];

const purchaseBundleValidation = [
  body('selectedVideoIds').isArray({ min: 1 })
];

router.get('/creator/:creatorId', bundleController.getCreatorBundles);
router.post('/', authenticate, requireCreator, createBundleValidation, bundleController.createBundle);
router.put('/:id', authenticate, requireCreator, updateBundleValidation, bundleController.updateBundle);
router.delete('/:id', authenticate, requireCreator, bundleController.deleteBundle);
router.post('/:id/purchase', authenticate, purchaseBundleValidation, bundleController.purchaseBundle);

module.exports = router;

