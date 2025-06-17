const request = require('supertest');
const app = require('../server');

jest.setTimeout(15000); // 15 sekund

let token;

beforeAll(async () => {
    await request(app).post('/users/create').send({
        username: 'secureuser',
        password: 'Secure123!',
        name: 'Secure',
        surname: 'User',
        email: 'secure@example.com',
        birthdate: '1998-10-10',
    });

    const res = await request(app).post('/users/login').send({
        username: 'secureuser',
        password: 'Secure123!',
    });

    token = res.body.token;
});

describe('Token Validation', () => {
    it('should validate token and return user info', async () => {
        const res = await request(app)
            .get('/users/validate')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe('secureuser');
        expect(res.body.password).toBeUndefined();
    });

    it('should fail without token', async () => {
        const res = await request(app).get('/users/validate');
        expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid token', async () => {
        const res = await request(app)
            .get('/users/validate')
            .set('Authorization', 'Bearer faketoken');

        expect(res.statusCode).toBe(403);
    });
});
