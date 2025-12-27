const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, requireCreator } = require('../middleware/auth');

const createSubscriptionValidation = [
  body('monthlyPrice').isFloat({ min: 0.01 })
];

const updateSubscriptionValidation = [
  body('monthlyPrice').optional().isFloat({ min: 0.01 }),
  body('isActive').optional().isBoolean()
];

router.get('/creator/:creatorId', subscriptionController.getCreatorSubscription);
router.post('/', authenticate, requireCreator, createSubscriptionValidation, subscriptionController.createSubscription);
router.put('/:id', authenticate, requireCreator, updateSubscriptionValidation, subscriptionController.updateSubscription);
router.post('/:id/subscribe', authenticate, subscriptionController.subscribe);
router.delete('/:id/unsubscribe', authenticate, subscriptionController.unsubscribe);
router.get('/my-subscriptions', authenticate, subscriptionController.getMySubscriptions);

module.exports = router;

