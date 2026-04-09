import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let i18nService: Partial<Record<keyof I18nService, jest.Mock>>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    i18nService = {
      t: jest.fn().mockImplementation((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user with token', async () => {
      usersService.create!.mockResolvedValue(mockUser);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
        access_token: 'mock-jwt-token',
      });
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
      });
    });
  });

  describe('login', () => {
    it('should login with valid credentials and return token', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      usersService.validatePassword!.mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
        access_token: 'mock-jwt-token',
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('common.auth.invalidCredentials');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      usersService.validatePassword!.mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('common.auth.invalidCredentials');
    });
  });
});
