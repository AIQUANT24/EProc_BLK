import { Request, Response } from 'express';
import { FabricService } from '../services/fabricService.js';

interface ProductCompliance {
  supplierId: string;      
  productId: string;
  bomHash: string;
  dva: number;
  verificationLogs: string; // Now just a string: "pending" or "approved"
  timestamp: string;
}

interface CreateProductRecordRequest {
  supplierId: string;
  productId: string;
  bomHash: string;
  dva: number;
}

interface ApproveVerificationRequest {
  productId: string;
}

export class ComplianceController {
  private fabricService: FabricService;

  constructor() {
    this.fabricService = new FabricService();
  }


  createProductRecord = async (req: Request, res: Response): Promise<void> => {
    const { supplierId, productId, bomHash, dva } = req.body as CreateProductRecordRequest;
    
    const userId = 'appUser'; // Default user if no auth

    // Validate required fields
    if (!supplierId || !productId || !bomHash || dva === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: supplierId, productId, bomHash, dva'
      });
      return;
    }

    // Validate DVA is a number
    if (typeof dva !== 'number' || isNaN(dva)) {
      res.status(400).json({
        success: false,
        error: 'DVA must be a valid number'
      });
      return;
    }

    let contract: any = null;

    try {
      // Get contract and submit transaction
      contract = await this.fabricService.getContract(userId);
      
      // Submit transaction to blockchain
      const result = await contract.submitTransaction(
        'CreateProductRecord',
        supplierId,
        productId,
        bomHash,
        dva.toString()
      );

      console.log(`✅ Product record created successfully: ${productId}`);
      console.log('Transaction result:', result.toString());

      res.status(201).json({
        success: true,
        message: 'Product compliance record created successfully with pending verification',
        data: {
          productId,
          supplierId,
          verificationStatus: 'pending',
          transaction: result.toString() || 'Transaction submitted',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Failed to create product record:', error);

      const errorMessage = (error as Error).message;
      if (errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: 'Product record already exists',
          details: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create product record',
          details: errorMessage
        });
      }
    } finally {
      if (contract) {
        await this.fabricService.disconnectContract(contract);
      }
    }
  };


  approveVerification = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const userId = 'appUser';

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
      return;
    }

    let contract: any = null;

    try {
      contract = await this.fabricService.getContract(userId);
      
      const result = await contract.submitTransaction(
        'ApproveVerification',
        productId
      );

      console.log(`✅ Verification approved for product: ${productId}`);

      res.status(200).json({
        success: true,
        message: 'Product verification approved successfully',
        data: {
          productId,
          verificationStatus: 'approved',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Failed to approve verification:', error);

      const errorMessage = (error as Error).message;
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Product record not found',
          details: errorMessage
        });
      } else if (errorMessage.includes('already approved')) {
        res.status(409).json({
          success: false,
          error: 'Product is already approved',
          details: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to approve verification',
          details: errorMessage
        });
      }
    } finally {
      if (contract) {
        await this.fabricService.disconnectContract(contract);
      }
    }
  };


  getProductRecord = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const userId = 'appUser';

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
      return;
    }

    let contract: any = null;

    try {
      contract = await this.fabricService.getContract(userId);
      
      const result = await contract.evaluateTransaction(
        'GetProductRecord',
        productId
      );

      const productRecord: ProductCompliance = JSON.parse(result.toString());

      console.log(`📊 Product record retrieved: ${productId}`);

      res.status(200).json({
        success: true,
        data: productRecord
      });

    } catch (error) {
      console.error('❌ Failed to get product record:', error);

      const errorMessage = (error as Error).message;
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Product record not found',
          details: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve product record',
          details: errorMessage
        });
      }
    } finally {
      if (contract) {
        await this.fabricService.disconnectContract(contract);
      }
    }
  };


  getVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const userId = 'appUser';

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
      return;
    }

    let contract: any = null;

    try {
      contract = await this.fabricService.getContract(userId);
      
      const result = await contract.evaluateTransaction(
        'GetVerificationStatus',
        productId
      );

      const status = result.toString();

      res.status(200).json({
        success: true,
        data: {
          productId,
          verificationStatus: status
        }
      });

    } catch (error) {
      console.error('❌ Failed to get verification status:', error);

      const errorMessage = (error as Error).message;
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Product record not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve verification status',
          details: errorMessage
        });
      }
    } finally {
      if (contract) {
        await this.fabricService.disconnectContract(contract);
      }
    }
  };


  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    const userId = 'appUser';
    let contract: any = null;

    try {
      contract = await this.fabricService.getContract(userId);
      
      const result = await contract.evaluateTransaction('GetAllProducts');
      const products = JSON.parse(result.toString());

      res.status(200).json({
        success: true,
        data: products,
        totalCount: products.length
      });

    } catch (error) {
      console.error('❌ Failed to get all products:', error);
      
      res.status(501).json({
        success: false,
        error: 'Get all products functionality not implemented in chaincode',
        details: (error as Error).message
      });
    } finally {
      if (contract) {
        await this.fabricService.disconnectContract(contract);
      }
    }
  };
}

export default new ComplianceController();