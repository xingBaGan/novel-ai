import { Request, Response } from 'express';
import { AIService, GenerateRequest } from '../services/AIService';
import { getPrompt } from '../utils';
export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Handle AI completion request compatible with vercel/ai useCompletion hook
   */
  async generate(req: Request, res: Response): Promise<void> {
    try {
    
      const { option, prompt } = req.body;
      // Clean the prompt by removing mark tags
      let extractedText = prompt;
      extractedText = extractedText.replace(/<mark[^>]*>|<\/mark>/g, '');
      
      const toolPrompt = getPrompt(option, extractedText);
      // Get the response from AI service
      await this.aiService.generateCompletion(toolPrompt, res);
    } catch (error) {
      console.error('Error in generate controller:', error);
      
      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: 'Failed to generate completion'
        });
      } else {
        // If streaming has started, just end the response
        res.end();
      }
    }
  }

  /**
   * Handle streaming AI text generation request (legacy)
   */
  async generateStreaming(req: Request, res: Response): Promise<void> {
    try {
      const request: GenerateRequest = {
        prompt: req.body.prompt,
        option: req.body.option,
        command: req.body.command
      };

      const result = await this.aiService.generateStreamingText(request);

      res.json(result);
    } catch (error) {
      console.error('Error in generateStreaming controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to generate streaming text'
      });
    }
  }
}
