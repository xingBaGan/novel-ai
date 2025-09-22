import { Router } from 'express';
import { AIController, FileUploadController } from '../controllers';

export class Routes {
  private aiController: AIController;
  private fileUploadController: FileUploadController;
  private router: Router;

  constructor() {
    this.aiController = new AIController();
    this.fileUploadController = new FileUploadController();
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Setup all API routes
   */
  private setupRoutes(): void {
    // AI generation routes
    this.router.post('/api/generate', (req, res) => this.aiController.generate(req, res));
    
    // File upload routes
    this.router.post('/api/upload', 
      this.fileUploadController.getUploadMiddleware(),
      (req, res) => this.fileUploadController.uploadFile(req, res)
    );
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }
}
