const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');

router.get('/has-access/:videoId', authenticate, purchaseController.checkAccess);
router.post('/video/:videoId', authenticate, purchaseController.purchaseVideo);
router.get('/my-purchases', authenticate, purchaseController.getMyPurchases);

module.exports = router;

