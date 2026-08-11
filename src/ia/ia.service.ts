import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.ollamaUrl = this.config.get('OLLAMA_URL') ?? 'http://localhost:11434';
    this.model = this.config.get('OLLAMA_MODEL') ?? 'llama3.2:1b';
  }

  async chat(prompt: string, system?: string): Promise<string> {
    try {
      const res = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        stream: false,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
      }, { timeout: 120000 });

      return res.data.message.content;
    } catch (error) {
      this.logger.error(`Error llamando a Ollama: ${error.message}`);
      throw error;
    }
  }

  async chatJson<T>(prompt: string, system?: string): Promise<T> {
    const respuesta = await this.chat(prompt, system);
    const limpio = respuesta
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(limpio) as T;
  }
}