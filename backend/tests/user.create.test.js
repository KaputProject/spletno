const request = require('supertest');
const app = require('../server');

describe('Tech for users/echo', () => {
    it('Should echo back the data sent', async () => {
        const testData = { message: 'User Luka K.', number: 42 };

        const res = await request(app)
            .post('/users/echo')
            .send(testData);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ received: testData });
    });
});
