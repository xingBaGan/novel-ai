import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface UploadResponse {
  url: string;
}

export class FileUploadService {
  private uploadDir: string;
  private storage: multer.StorageEngine;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDir();
    this.storage = this.createStorage();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Create multer storage configuration
   */
  private createStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware(): multer.Multer {
    return multer({ storage: this.storage });
  }

  /**
   * Process uploaded file and return URL
   */
  processUploadedFile(file: Express.Multer.File): UploadResponse {
    const fileUrl = `/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadDir;
  }
}
