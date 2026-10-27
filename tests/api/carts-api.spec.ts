import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const CART_ID = Number(process.env.CART_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const CART_LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE || '2019-12-10';
const END_DATE = process.env.END_DATE || '2020-10-10';
const CART_PAYLOAD = {
    userId: USER_ID,
    date: '2020-01-15',
    products: [{ productId: 1, quantity: 2 }],
};

test.describe('FakeStore Carts API Tests', () => {
    test('GET - All carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
        expect(response.status(), 'The carts endpoint should return HTTP 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts), 'Carts response should be an array').toBeTruthy();
        expect(carts.length, 'At least one cart should be returned').toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'A valid cart ID should return HTTP 200').toBe(200);

        const cart = await response.json();
        expect(cart.id, 'The returned cart ID should match the requested ID').toBe(CART_ID);
        expect(typeof cart.userId).toBe('number');
        expect(Array.isArray(cart.products)).toBeTruthy();
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', encodeURIComponent(START_DATE))
            .replace('{enddate}', encodeURIComponent(END_DATE));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'The date-filtered carts request should return HTTP 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBeTruthy();
        const startTime = Date.parse(START_DATE);
        const endTime = Date.parse(`${END_DATE}T23:59:59.999Z`);
        for (const cart of carts) {
            const cartTime = Date.parse(cart.date);
            expect(cartTime, 'Cart dates should be valid ISO dates').not.toBeNaN();
            expect(cartTime, 'Each cart should be on or after the requested start date').toBeGreaterThanOrEqual(startTime);
            expect(cartTime, 'Each cart should be on or before the requested end date').toBeLessThanOrEqual(endTime);
        }
    });

    test('GET - Carts by user @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'The user carts endpoint should return HTTP 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBeTruthy();
        for (const cart of carts) {
            expect(cart.userId, 'Each returned cart should belong to the requested user').toBe(USER_ID);
        }
    });

    test('GET - Carts with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(CART_LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'The limited carts request should return HTTP 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.length, 'The result count should match the requested limit').toBe(CART_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Carts sorted ${order} @master @regression @api`, async ({ request }) => {
            const route = Routes.GET_CARTS_SORTED.replace('{order}', order);
            const response = await request.get(`${BASE_URL}${route}`);
            expect(response.status(), `Sorting ${order} should return HTTP 200`).toBe(200);

            const carts = await response.json();
            const ids = carts.map((cart: { id: number }) => cart.id);
            const sortedIds = [...ids].sort((left, right) => order === 'asc' ? left - right : right - left);
            expect(ids, `Cart IDs should be sorted ${order}`).toEqual(sortedIds);
        });
    }

    test('POST - Create cart @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_PAYLOAD });
        expect(response.status(), 'Creating a cart should return HTTP 201').toBe(201);

        const createdCart = await response.json();
        expect(typeof createdCart.id, 'The API should return a numeric generated cart ID').toBe('number');
        expect(createdCart.userId).toBe(CART_PAYLOAD.userId);
        expect(createdCart.products).toEqual(CART_PAYLOAD.products);
    });

    test('PUT - Update cart @master @regression @api', async ({ request }) => {
        const updatePayload = { ...CART_PAYLOAD, products: [{ productId: 1, quantity: 5 }] };
        const route = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatePayload });
        expect(response.status(), 'Updating a cart should return HTTP 200').toBe(200);

        const updatedCart = await response.json();
        expect(updatedCart.id).toBe(CART_ID);
        expect(updatedCart.userId).toBe(USER_ID);
        expect(updatedCart.products).toEqual(updatePayload.products);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_CART.replace('{id}', String(CART_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a cart should return HTTP 200').toBe(200);

        const deletedCart = await response.json();
        expect(deletedCart.id, 'The response should identify the requested cart').toBe(CART_ID);
    });
});