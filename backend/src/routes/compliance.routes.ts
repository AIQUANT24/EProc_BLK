import { Router } from 'express';
import complianceController from '../controller/compliance.controller';

const router = Router();

// Create product record
router.post('/product', (req, res) => {
  complianceController.createProductRecord(req, res);
});

// Approve verification (update from pending to approved)
router.put('/approve/:productId', (req, res) => {
  complianceController.approveVerification(req, res);
});

// Get product record
router.get('/product/:productId', (req, res) => {
  complianceController.getProductRecord(req, res);
});

// Get verification status only
router.get('/product/:productId/status', (req, res) => {
  complianceController.getVerificationStatus(req, res);
});



export default router;