import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const USER_LIMIT = Number(process.env.LIMIT ?? 3);
const USER_PAYLOAD = {
    email: 'api.user@example.com',
    username: 'playwright-api-user',
    password: 'DeterministicApiPassword1',
    name: { firstname: 'Api', lastname: 'User' },
    address: {
        city: 'Test City',
        street: 'Test Street',
        number: 10,
        zipcode: '10000',
        geolocation: { lat: '0', long: '0' },
    },
    phone: '555-0100',
};

test.describe('FakeStore Users API Tests', () => {
    test('GET - All users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
        expect(response.status(), 'The users endpoint should return HTTP 200').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users), 'Users response should be an array').toBeTruthy();
        expect(users.length, 'At least one user should be returned').toBeGreaterThan(0);
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'A valid user ID should return HTTP 200').toBe(200);

        const user = await response.json();
        expect(user.id, 'The returned user ID should match the requested ID').toBe(USER_ID);
        expect(typeof user.email).toBe('string');
        expect(typeof user.username).toBe('string');
        expect(typeof user.name.firstname).toBe('string');
        expect(typeof user.name.lastname).toBe('string');
    });

    test('GET - Users with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(USER_LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'The limited users request should return HTTP 200').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length, 'The result count should match the requested limit').toBe(USER_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
            const route = Routes.GET_USERS_SORTED.replace('{order}', order);
            const response = await request.get(`${BASE_URL}${route}`);
            expect(response.status(), `Sorting ${order} should return HTTP 200`).toBe(200);

            const users = await response.json();
            const ids = users.map((user: { id: number }) => user.id);
            const sortedIds = [...ids].sort((left, right) => order === 'asc' ? left - right : right - left);
            expect(ids, `User IDs should be sorted ${order}`).toEqual(sortedIds);
        });
    }

    test('POST - Create user @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_PAYLOAD });
        expect(response.status(), 'Creating a user should return HTTP 201').toBe(201);

        const createdUser = await response.json();
        expect(typeof createdUser.id, 'The API should return a numeric generated user ID').toBe('number');
    });

    test('PUT - Update user @master @regression @api', async ({ request }) => {
        const updatePayload = { username: 'updated-playwright-api-user', email: 'updated-api.user@example.com' };
        const route = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatePayload });
        expect(response.status(), 'Updating a user should return HTTP 200').toBe(200);

        const updatedUser = await response.json();
        expect(updatedUser).toMatchObject(updatePayload);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_USER.replace('{id}', String(USER_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a user should return HTTP 200').toBe(200);

        const deletedUser = await response.json();
        expect(deletedUser.id, 'The response should identify the requested user').toBe(USER_ID);
    });
});