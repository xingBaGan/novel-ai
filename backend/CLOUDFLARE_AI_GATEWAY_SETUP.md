# Cloudflare AI Gateway with Gemini Integration

This service integrates Cloudflare AI Gateway with Google's Gemini API using the Vercel AI SDK.

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Google AI API Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Cloudflare AI Gateway Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_GATEWAY_NAME=your_gateway_name
CLOUDFLARE_API_KEY=your_cloudflare_api_key
```

## Setup Instructions

1. **Get Google API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your environment variables

2. **Setup Cloudflare AI Gateway:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to AI Gateway
   - Create a new gateway
   - Get your Account ID, Gateway Name, and API Key

3. **Install Dependencies:**
   ```bash
   cd backend
   pnpm install
   ```

4. **Build and Run:**
   ```bash
   pnpm run build
   pnpm start
   ```

## Features

- **Automatic Fallback:** Uses Gemini 1.5 Pro as primary model and Gemini 1.5 Flash as fallback
- **Caching:** 1-hour cache TTL for improved performance
- **Retry Logic:** Exponential backoff with up to 3 retry attempts
- **Error Handling:** Comprehensive error handling with detailed logging

## API Endpoints

- `POST /api/generate` - Generate AI text (non-streaming)
- `POST /api/generate-stream` - Generate AI text (streaming)

## Usage Example

```typescript
const aiService = new AIService();

// Non-streaming generation
const result = await aiService.generateText({
  prompt: "Write a short story about a robot"
});

// Streaming generation
const stream = await aiService.generateStreamingText({
  prompt: "Write a poem about nature"
});
```
