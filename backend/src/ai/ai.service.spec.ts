import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AiService } from './ai.service';

// Mock OpenAI - the module uses `import OpenAI from 'openai'` which compiles to
// `openai_1.default`, so we need to provide a `default` export.
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

describe('AiService', () => {
  let service: AiService;
  let i18nService: Partial<Record<keyof I18nService, jest.Mock>>;

  beforeEach(async () => {
    i18nService = {
      t: jest.fn().mockImplementation((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePost', () => {
    const mockInput = {
      postDescription: 'Launch of new eco-friendly product',
      goal: 'Increase awareness',
      audience: 'Millennials',
      tone: 'Professional',
      mediaType: 'image',
      mandatoryKeywords: ['sustainable', 'eco'],
      brandName: 'GreenCo',
    };

    const mockAiResponse = {
      caption: 'Discover our sustainable future! 🌿',
      hashtags: ['sustainable', 'eco', 'green'],
      imagePrompt: 'A green product on nature background',
      title: 'Eco Launch',
      category: 'Product Launch',
      emojis: ['🌿', '🌍'],
      variations: [
        { caption: 'Go green with us!', hashtags: ['green', 'eco'] },
      ],
    };

    it('should generate a post successfully', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAiResponse),
            },
          },
        ],
      });

      const result = await service.generatePost(mockInput);

      expect(result).toEqual(mockAiResponse);
      expect(openaiMock.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.8,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      );
    });

    it('should throw BadRequestException when AI returns empty response', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      await expect(service.generatePost(mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.ai.generateFailed');
    });

    it('should throw BadRequestException when AI returns invalid JSON', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'not json' } }],
      });

      await expect(service.generatePost(mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.ai.invalidInput');
    });

    it('should throw BadRequestException when AI output missing caption', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ title: 'No caption' }) } }],
      });

      await expect(service.generatePost(mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.ai.invalidInput');
    });

    it('should handle OpenAI API errors', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockRejectedValue(
        new Error('API rate limited'),
      );

      await expect(service.generatePost(mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.ai.apiError');
    });

    it('should handle response with missing optional fields', async () => {
      const openaiMock = (service as any).openai;
      openaiMock.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                caption: 'Just a caption',
              }),
            },
          },
        ],
      });

      const result = await service.generatePost(mockInput);

      expect(result.caption).toBe('Just a caption');
      expect(result.hashtags).toEqual([]);
      expect(result.imagePrompt).toBe('');
      expect(result.title).toBe('Untitled Post');
      expect(result.category).toBe('General');
      expect(result.emojis).toEqual([]);
      expect(result.variations).toEqual([]);
    });
  });
});
