import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore Authentication API Tests', () => {
    test('POST - Successful login returns a token @master @sanity @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: process.env.USERNAME,
                password: process.env.PASSWORD,
            },
        });

        expect(response.status(), 'Valid credentials should return HTTP 201').toBe(201);
        const responseBody = await response.json();
        expect(typeof responseBody.token, 'The response should contain a token string').toBe('string');
        expect(responseBody.token.length, 'The authentication token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Invalid login returns the expected error @master @regression @api', async ({ request }) => {
        const invalidCredentials = RandomDataUtil.generateInvalidLoginPayload();
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, { data: invalidCredentials });

        expect(response.status(), 'Invalid credentials should return HTTP 401').toBe(401);
        expect((await response.text()).trim(), 'The API should explain why authentication failed').toBe(
            'username or password is incorrect',
        );
    });
});