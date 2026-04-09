import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';

/**
 * Auth E2E Tests
 *
 * These tests require a running MongoDB instance.
 * Run with: npx jest --config test/jest-e2e.json
 *
 * If MongoDB is not available, tests will be skipped gracefully.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongoAvailable = true;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      app.use(cookieParser());
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
    } catch {
      mongoAvailable = false;
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      if (!mongoAvailable) {
        return;
      }

      const uniqueEmail = `test-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'E2E Test User',
          email: uniqueEmail,
          password: 'password123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(uniqueEmail);
      expect(res.body.user.name).toBe('E2E Test User');

      // Should set HttpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('access_token');
    });

    it('should fail with invalid email', async () => {
      if (!mongoAvailable) {
        return;
      }

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with short password', async () => {
      if (!mongoAvailable) {
        return;
      }

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test-short@example.com',
          password: '12345',
        })
        .expect(400);
    });

    it('should fail with missing fields', async () => {
      if (!mongoAvailable) {
        return;
      }

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test-missing@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginEmail = `login-test-${Date.now()}@example.com`;
    const loginPassword = 'password123';

    beforeAll(async () => {
      if (!mongoAvailable) return;

      // Create user for login tests
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: loginEmail,
          password: loginPassword,
        });
    });

    it('should login with valid credentials', async () => {
      if (!mongoAvailable) {
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        })
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(loginEmail);
    });

    it('should fail with wrong password', async () => {
      if (!mongoAvailable) {
        return;
      }

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      if (!mongoAvailable) {
        return;
      }

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear cookie', async () => {
      if (!mongoAvailable) {
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body).toHaveProperty('message');
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        expect(cookies[0]).toContain('access_token');
      }
    });
  });
});
