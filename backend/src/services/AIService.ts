import { streamText } from "ai";
import { createAiGateway } from "ai-gateway-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import "dotenv/config";
export interface GenerateRequest {
  prompt?: string;
  option?: string;
  command?: string;
}

export interface GenerateResponse {
  message: string;
  extracted_text: string;
  received_body: any;
}

export class AIService {
  private aigateway;
  private google;

  constructor() {
    // Validate required environment variables
    if (!process.env.GOOGLE_AI_STUDIO_TOKEN) {
      throw new Error("GOOGLE_AI_STUDIO_TOKEN environment variable is required");
    }
    if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
      throw new Error("CLOUDFLARE_ACCOUNT_ID environment variable is required");
    }
    if (!process.env.CLOUDFLARE_GATEWAY_ID) {
      throw new Error("CLOUDFLARE_GATEWAY_ID environment variable is required");
    }

    // Initialize Google Generative AI provider
    this.google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_STUDIO_TOKEN,
    });

    // Initialize Cloudflare AI Gateway
    this.aigateway = createAiGateway({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      gateway: process.env.CLOUDFLARE_GATEWAY_ID,
      apiKey: process.env.CLOUDFLARE_API_KEY,
      options: {
        cacheTtl: 3600, // Cache for 1 hour
        retries: {
          maxAttempts: 3,
          retryDelayMs: 1000,
          backoff: "exponential",
        },
      },
    });
  }

  /**
   * Generate AI text based on the provided prompt using Cloudflare AI Gateway with Gemini
   */
  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    const { prompt, option, command } = request;
    
    // Clean the prompt by removing mark tags
    let extractedText = prompt ?? command ?? "";
    extractedText = extractedText.replace(/<mark[^>]*>|<\/mark>/g, '');

    try {
      // Use Cloudflare AI Gateway with Gemini model
      const result = await streamText({
        model: this.aigateway([
          this.google("gemini-1.5-pro"), // Primary model
          this.google("gemini-1.5-flash"), // Fallback model
        ]),
        prompt: extractedText,
      });

      // Convert stream to text
      let generatedText = "";
      for await (const chunk of result.textStream) {
        generatedText += chunk;
      }

      return {
        message: "AI text generated successfully using Cloudflare AI Gateway with Gemini.",
        extracted_text: generatedText,
        received_body: request
      };
    } catch (error) {
      console.error("Error generating text:", error);
      return {
        message: "Error generating text. Please check your configuration.",
        extracted_text: extractedText,
        received_body: request
      };
    }
  }

  /**
   * Generate streaming AI text response using Cloudflare AI Gateway with Gemini
   */
  async generateStreamingText(request: GenerateRequest) {
    const { prompt, option, command } = request;
    const extractedText = prompt ?? command ?? "";
    
    try {
      const result = await streamText({
        model: this.aigateway([
          this.google("gemini-1.5-pro"), // Primary model
          this.google("gemini-1.5-flash"), // Fallback model
        ]),
        prompt: extractedText,
      });

      return result.toTextStreamResponse();
    } catch (error) {
      console.error("Error generating streaming text:", error);
      throw error;
    }
  }
}
