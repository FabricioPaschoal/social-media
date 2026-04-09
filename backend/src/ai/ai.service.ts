import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import OpenAI from 'openai';
import { GeneratePostDto } from './dto/generate-post.dto';

export interface AiGeneratedPost {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  title: string;
  category: string;
  emojis: string[];
  variations: Array<{ caption: string; hashtags: string[] }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generatePost(input: GeneratePostDto): Promise<AiGeneratedPost> {
    const prompt = this.buildPrompt(input);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional social media content strategist. You generate engaging, platform-optimized social media posts. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException(this.i18n.t('common.ai.generateFailed'));
      }

      const parsed = this.parseAndValidate(content);
      return parsed;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`AI generation failed: ${error.message}`);
      throw new BadRequestException(this.i18n.t('common.ai.apiError'));
    }
  }

  private buildPrompt(input: GeneratePostDto): string {
    return `Generate a complete social-media post based on the following data:
Description: ${input.postDescription}
Goal: ${input.goal || 'Engagement'}
Audience: ${input.audience || 'General audience'}
Tone: ${input.tone || 'Professional'}
Media type: ${input.mediaType || 'image'}
Mandatory keywords: ${input.mandatoryKeywords?.join(', ') || 'None'}
Brand: ${input.brandName || 'Not specified'}

Return JSON with the following structure:
{
  "caption": "The main post caption text",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "imagePrompt": "A detailed prompt to generate an image for this post",
  "title": "A short title for internal reference",
  "category": "The content category",
  "emojis": ["emoji1", "emoji2", ...],
  "variations": [
    { "caption": "Alternative caption 1", "hashtags": ["alt1", "alt2"] },
    { "caption": "Alternative caption 2", "hashtags": ["alt3", "alt4"] }
  ]
}

Follow Facebook/Instagram content policies. Avoid restricted or controversial content.
Include 2-3 variations.
Use relevant emojis naturally in captions.
Hashtags should be without the # symbol.`;
  }

  private parseAndValidate(content: string): AiGeneratedPost {
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new BadRequestException(this.i18n.t('common.ai.invalidInput'));
    }

    if (!parsed.caption || typeof parsed.caption !== 'string') {
      throw new BadRequestException(this.i18n.t('common.ai.invalidInput'));
    }

    return {
      caption: parsed.caption,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      imagePrompt: parsed.imagePrompt || '',
      title: parsed.title || 'Untitled Post',
      category: parsed.category || 'General',
      emojis: Array.isArray(parsed.emojis) ? parsed.emojis : [],
      variations: Array.isArray(parsed.variations) ? parsed.variations : [],
    };
  }
}
