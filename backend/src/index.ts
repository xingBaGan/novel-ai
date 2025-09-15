import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// /api/generate
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generate(req: Request, res: Response) {
  const { prompt, option, command } = await req.json();

  const result = await streamText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"), // 示例，可换成任意 OpenRouter 模型
    prompt: prompt ?? command ?? "",
  });

  return result.toTextStreamResponse();
}

// --- Multer Setup for File Uploads ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- API Routes ---

// Placeholder for AI text generation
app.post('/api/generate', async (req, res) => {
  console.log('Received request for /api/generate', res);
  console.log('Body:', req.body.prompt);

  let extractedText = '';
  if (
    req.body &&
    req.body.prompt &&
    typeof req.body.prompt === 'string'
  ) {
    extractedText = req.body.prompt;
    extractedText = extractedText.replace(/<mark[^>]*>|<\/mark>/g, '');
  }
  // await generate(req, res);
  res.json({
    message: 'Text content extracted and cleaned from mark tags.',
    extracted_text: extractedText,
    received_body: req.body
  });
});

// Handler for image uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('Received request for /api/upload');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  console.log('File uploaded:', req.file);

  // Respond with the path to the uploaded file
  // In a real application, you would return a URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));


// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
