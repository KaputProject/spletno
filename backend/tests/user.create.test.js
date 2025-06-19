/*const request = require('supertest');
const app = require('../server');

describe('User Registration', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app).post('/users/create').send({
            username: 'testuser',
            password: 'Test1234!',
            name: 'Test',
            surname: 'User',
            email: 'testuser@example.com',
            birthdate: '2000-01-01',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toMatch(/User created/i);
    });

    it('should not register user with missing data', async () => {
        const res = await request(app).post('/users/create').send({
            username: 'incompleteuser',
            // Missing password
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should not register duplicate usernames', async () => {
        const user = {
            username: 'dupeuser',
            password: 'Pass1234!',
            name: 'Dupe',
            surname: 'User',
            email: 'dupe@example.com',
            birthdate: '1990-01-01',
        };

        await request(app).post('/users/create').send(user);
        const res = await request(app).post('/users/create').send(user);

        expect(res.statusCode).toBe(409); // Conflict
        expect(res.body.error).toMatch(/exists/i);
    });
});*/
