# AI Novel Backend API

A Node.js backend service for AI-powered novel writing with file upload capabilities, built with Express.js and TypeScript.

## Features

- 🤖 **AI Text Generation**: Powered by Google Gemini models through Cloudflare AI Gateway
- 📁 **File Upload**: Support for file uploads with automatic storage management
- 🔄 **Streaming Support**: Real-time text generation streaming
- 🛡️ **Error Handling**: Comprehensive error handling and validation
- 📝 **TypeScript**: Full TypeScript support with type safety

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Environment variables configured (see Environment Setup)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Build the project:
```bash
pnpm build
# or
npm run build
```

## Environment Setup

Create a `.env` file in the backend directory with the following variables:

```env
# Google AI Studio Configuration
GOOGLE_AI_STUDIO_TOKEN=your_google_ai_studio_token

# Cloudflare AI Gateway Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_GATEWAY_ID=your_cloudflare_gateway_id
CLOUDFLARE_API_KEY=your_cloudflare_api_key
```

### Getting API Keys

1. **Google AI Studio Token**: 
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

2. **Cloudflare AI Gateway**:
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to AI Gateway section
   - Create a new gateway and get the required credentials

## Running the Application

### Development Mode
```bash
pnpm dev
# or
npm run dev
```

### Production Mode
```bash
pnpm start
# or
npm start
```

The server will start on `http://localhost:3000` by default.

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Endpoints

#### 1. AI Text Generation

**POST** `/api/generate`

Generate AI text using Google Gemini models through Cloudflare AI Gateway.

**Request Body:**
```json
{
  "prompt": "Write a short story about a robot learning to paint",
  "option": "creative",
  "command": "generate story"
}
```

**Parameters:**
- `prompt` (string, optional): The text prompt for AI generation
- `option` (string, optional): Additional options for generation
- `command` (string, optional): Command type for generation

**Response:**
```json
{
  "message": "AI text generated successfully using Cloudflare AI Gateway with Gemini.",
  "extracted_text": "Generated AI text content...",
  "received_body": {
    "prompt": "Write a short story about a robot learning to paint",
    "option": "creative",
    "command": "generate story"
  }
}
```

**Error Response:**
```json
{
  "error": "Internal server error",
  "message": "Failed to generate text"
}
```

#### 2. File Upload

**POST** `/api/upload`

Upload files to the server with automatic storage management.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:**
```json
{
  "url": "/uploads/file-1234567890-123456789.jpg"
}
```

**Error Response:**
```json
{
  "error": "No file uploaded."
}
```

## Bruno API Collection

A Bruno API collection is included for easy testing and development:

**File:** `backend/bruno-collection.json`

### Importing into Bruno

1. Open Bruno API client
2. Click "Import Collection"
3. Select the `bruno-collection.json` file
4. The collection will be imported with all endpoints and test cases

### Collection Features

- **Pre-configured requests** for all API endpoints
- **Test cases** for response validation
- **Environment variables** for different deployment stages
- **Documentation** for each endpoint
- **Error handling examples**

### Available Environments

- **Development**: `http://localhost:3000`
- **Production**: `https://your-production-domain.com`

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── AIController.ts   # AI generation logic
│   │   └── FileUploadController.ts # File upload logic
│   ├── services/             # Business logic
│   │   ├── AIService.ts      # AI service implementation
│   │   └── FileUploadService.ts # File upload service
│   ├── routes/               # Route definitions
│   │   └── Routes.ts         # API route configuration
│   └── index.ts              # Application entry point
├── uploads/                  # File upload directory
├── dist/                     # Compiled JavaScript output
├── bruno-collection.json     # Bruno API collection
└── package.json              # Dependencies and scripts
```

## Development

### Available Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Watch mode for development
- `pnpm start` - Run the compiled application
- `pnpm test` - Run tests (not implemented yet)

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use double quotes for strings
- Write comments in English
- Follow minimal incremental changes principle

## Error Handling

The API includes comprehensive error handling:

- **Validation errors**: 400 Bad Request
- **Server errors**: 500 Internal Server Error
- **File upload errors**: Specific error messages for missing files
- **AI service errors**: Graceful fallback and error reporting

## Security Considerations

- File uploads are stored in a dedicated directory
- Unique filenames prevent conflicts
- Environment variables for sensitive configuration
- CORS support for cross-origin requests

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all environment variables are documented

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the error logs in the console
2. Verify environment variables are correctly set
3. Ensure all dependencies are installed
4. Check the Bruno collection for API testing
