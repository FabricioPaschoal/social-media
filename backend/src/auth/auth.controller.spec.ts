import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;
  let i18nService: Partial<Record<keyof I18nService, jest.Mock>>;

  const mockResult = {
    user: {
      id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
    },
    access_token: 'mock-jwt-token',
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockResult),
      login: jest.fn().mockResolvedValue(mockResult),
    };

    i18nService = {
      t: jest.fn().mockImplementation((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and set cookie', async () => {
      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };

      const result = await controller.register(dto, mockResponse);

      expect(result).toEqual(mockResult);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login a user and set cookie', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };

      const result = await controller.login(dto, mockResponse);

      expect(result).toEqual(mockResult);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success message', () => {
      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'common.auth.logoutSuccess' });
      expect(i18nService.t).toHaveBeenCalledWith('common.auth.logoutSuccess');
    });
  });
});
