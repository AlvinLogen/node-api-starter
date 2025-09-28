const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoint', () => {
    test('GET /health should return 200 and status ok', async() => {
        const response = await request(app).get('/health').expect(200);

        expect(response.body.status).toBe('ok');
        expect(response.body.service).toBe('node-api-starter');
        expect(response.body.timestamp).toBeDefined();
    });
});