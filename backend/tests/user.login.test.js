const request = require('supertest');
const app = require('../server');

describe('User Login', () => {
    beforeAll(async () => {
        await request(app).post('/users/create').send({
            username: 'loginuser',
            password: 'Login123!',
            name: 'Login',
            surname: 'User',
            email: 'login@example.com',
            birthdate: '1995-05-15',
        });
    });

    it('should login with correct credentials', async () => {
        const res = await request(app).post('/users/login').send({
            username: 'loginuser',
            password: 'Login123!',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const res = await request(app).post('/users/login').send({
            username: 'loginuser',
            password: 'WrongPassword',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBeDefined();
    });
});
