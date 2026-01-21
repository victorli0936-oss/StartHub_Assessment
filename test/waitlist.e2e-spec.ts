import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import request from 'supertest';
import { WaitlistModule } from '../src/waitlist/waitlist.module';

describe('Waitlist E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
        }),
        WaitlistModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('addToWaitlist mutation', () => {
    it('should add a valid email to waitlist', () => {
      const mutation = `
        mutation {
          addToWaitlist(email: "e2e@example.com") {
            email
            isRegistered
            registeredAt
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.addToWaitlist).toBeDefined();
          expect(res.body.data.addToWaitlist.email).toBe('e2e@example.com');
          expect(res.body.data.addToWaitlist.isRegistered).toBe(true);
          expect(res.body.data.addToWaitlist.registeredAt).toBeDefined();
        });
    });

    it('should return error for invalid email format', () => {
      const mutation = `
        mutation {
          addToWaitlist(email: "invalid-email") {
            email
            isRegistered
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toContain('email');
          expect(res.body.errors[0].extensions.statusCode).toBe(400);
        });
    });

    it('should return error for duplicate email', async () => {
      const mutation = `
        mutation {
          addToWaitlist(email: "duplicate@example.com") {
            email
            isRegistered
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toContain('already registered');
          expect(res.body.errors[0].extensions.statusCode).toBe(409);
        });
    });

    it('should normalize email to lowercase', () => {
      const mutation = `
        mutation {
          addToWaitlist(email: "UPPERCASE@EXAMPLE.COM") {
            email
            isRegistered
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.addToWaitlist.email).toBe('uppercase@example.com');
        });
    });
  });

  describe('getWaitlistStatus query', () => {
    it('should return registered status for existing email', async () => {
      const addMutation = `
        mutation {
          addToWaitlist(email: "status@example.com") {
            email
            isRegistered
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: addMutation })
        .expect(200);

      const query = `
        query {
          getWaitlistStatus(email: "status@example.com") {
            email
            isRegistered
            registeredAt
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getWaitlistStatus).toBeDefined();
          expect(res.body.data.getWaitlistStatus.email).toBe('status@example.com');
          expect(res.body.data.getWaitlistStatus.isRegistered).toBe(true);
          expect(res.body.data.getWaitlistStatus.registeredAt).toBeDefined();
        });
    });

    it('should return unregistered status for non-existing email', () => {
      const query = `
        query {
          getWaitlistStatus(email: "notfound@example.com") {
            email
            isRegistered
            registeredAt
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getWaitlistStatus).toBeDefined();
          expect(res.body.data.getWaitlistStatus.email).toBe('notfound@example.com');
          expect(res.body.data.getWaitlistStatus.isRegistered).toBe(false);
          expect(res.body.data.getWaitlistStatus.registeredAt).toBeNull();
        });
    });

    it('should return error for invalid email format', () => {
      const query = `
        query {
          getWaitlistStatus(email: "not-an-email") {
            email
            isRegistered
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toContain('email');
          expect(res.body.errors[0].extensions.statusCode).toBe(400);
        });
    });

    it('should be case-insensitive when checking status', async () => {
      const addMutation = `
        mutation {
          addToWaitlist(email: "CaseTest@Example.com") {
            email
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: addMutation })
        .expect(200);

      const query = `
        query {
          getWaitlistStatus(email: "casetest@example.com") {
            email
            isRegistered
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getWaitlistStatus.isRegistered).toBe(true);
        });
    });
  });
});