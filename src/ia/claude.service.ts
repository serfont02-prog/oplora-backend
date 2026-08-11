import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ClaudeService {
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-opus-4-5';
  private readonly apiKey = process.env.ANTHROPIC_API_KEY;

  async chat(prompt: string, system?: string): Promise<string> {
    try {
      const res = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          max_tokens: 4000,
          system: system ?? 'Eres un asistente experto en oposiciones españolas.',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      );

      return res.data.content[0].text;
    } catch (e) {
      throw new HttpException(`Error Claude API: ${e.message}`, 500);
    }
  }

  async chatJson<T>(prompt: string, system?: string): Promise<T> {
    const respuesta = await this.chat(prompt, system);
    const jsonMatch = respuesta.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!jsonMatch) throw new HttpException('Claude no devolvió JSON válido', 500);
    return JSON.parse(jsonMatch[0]) as T;
  }
}