import { Request, Response } from 'express';
import { AIService, GenerateRequest } from '../services/AIService';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Handle AI text generation request
   */
  async generate(req: Request, res: Response): Promise<void> {
    try {

      const request: GenerateRequest = {
        prompt: req.body.prompt,
        option: req.body.option,
        command: req.body.command
      };

      const result = await this.aiService.generateText(request);
      res.json(result);
    } catch (error) {
      console.error('Error in generate controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to generate text'
      });
    }
  }

  /**
   * Handle streaming AI text generation request
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
