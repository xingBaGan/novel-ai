import express from 'express';
import cors from 'cors';
import path from 'path';
import { Routes } from './routes/Routes';
import { FileUploadService } from './services';

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const fileUploadService = new FileUploadService();

// Setup routes
const routes = new Routes();
app.use(routes.getRouter());

// Serve uploaded files statically
app.use('/uploads', express.static(fileUploadService.getUploadDir()));


// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
