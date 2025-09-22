import { Request, RequestHandler, Response } from 'express';
import { FileUploadService, UploadResponse } from '../services/FileUploadService';

interface FileUplodController {
  uploadFile(req: Request, res: Response): Promise<void>;
  getUploadMiddleware(): RequestHandler;
}

export class FileUploadController implements FileUploadController {
  private fileUploadService: FileUploadService;

  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Handle file upload request
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      console.log('Received request for /api/upload');
      
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      console.log('File uploaded:', req.file);

      const result: UploadResponse = this.fileUploadService.processUploadedFile(req.file);
      res.json(result);
    } catch (error) {
      console.error('Error in upload controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to upload file'
      });
    }
  }

  /**
   * Get multer middleware for file uploads
   */
  getUploadMiddleware(): RequestHandler {
    return this.fileUploadService.getUploadMiddleware().single('file');
  }
}
