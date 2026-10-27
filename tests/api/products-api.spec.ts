import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const PRODUCT_LIMIT = Number(process.env.LIMIT ?? 3);
const PRODUCT_CATEGORY = 'electronics';

const PRODUCT_PAYLOAD = {
    title: 'Playwright API Product',
    price: 19.99,
    description: 'Deterministic product payload for API testing',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
    category: PRODUCT_CATEGORY,
};

test.describe('FakeStore Products API Tests', () => {
    test('GET - All products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
        expect(response.status(), 'The products endpoint should return HTTP 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products), 'Products response should be an array').toBeTruthy();
        expect(products.length, 'At least one product should be returned').toBeGreaterThan(0);
        for (const product of products) {
            expect(typeof product.id, 'Each product should have a numeric id').toBe('number');
            expect(typeof product.title, 'Each product should have a title').toBe('string');
            expect(typeof product.price, 'Each product should have a numeric price').toBe('number');
            expect(typeof product.category, 'Each product should have a category').toBe('string');
            expect(typeof product.image, 'Each product should have an image URL').toBe('string');
        }
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'A valid product ID should return HTTP 200').toBe(200);

        const product = await response.json();
        expect(product.id, 'The returned product ID should match the requested ID').toBe(PRODUCT_ID);
        expect(typeof product.title).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.category).toBe('string');
        expect(typeof product.image).toBe('string');
    });

    test('GET - Products with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(PRODUCT_LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'The limited products request should return HTTP 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length, 'The result count should match the requested limit').toBe(PRODUCT_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Products sorted ${order} @master @regression @api`, async ({ request }) => {
            const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', order);
            const response = await request.get(`${BASE_URL}${route}`);
            expect(response.status(), `Sorting ${order} should return HTTP 200`).toBe(200);

            const products = await response.json();
            const ids = products.map((product: { id: number }) => product.id);
            const sortedIds = [...ids].sort((left, right) => order === 'asc' ? left - right : right - left);
            expect(ids, `Product IDs should be sorted ${order}`).toEqual(sortedIds);
        });
    }

    test('GET - All product categories @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
        expect(response.status(), 'The categories endpoint should return HTTP 200').toBe(200);

        const categories = await response.json();
        expect(Array.isArray(categories)).toBeTruthy();
        expect(categories.length, 'At least one product category should be returned').toBeGreaterThan(0);
        expect(categories.every((category: unknown) => typeof category === 'string')).toBeTruthy();
    });

    test('GET - Products by category @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(PRODUCT_CATEGORY));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'A valid category should return HTTP 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length).toBeGreaterThan(0);
        expect(products.every((product: { category: string }) => product.category === PRODUCT_CATEGORY),
            'Every result should belong to the requested category').toBeTruthy();
    });

    test('POST - Create product @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_PAYLOAD });
        expect(response.status(), 'Creating a product should return HTTP 201').toBe(201);

        const createdProduct = await response.json();
        expect(createdProduct.id, 'The API should return the created product ID').toBeTruthy();
        expect(createdProduct).toMatchObject(PRODUCT_PAYLOAD);
    });

    test('PUT - Update product @master @regression @api', async ({ request }) => {
        const updatePayload = { ...PRODUCT_PAYLOAD, title: 'Updated Playwright API Product' };
        const route = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatePayload });
        expect(response.status(), 'Updating a product should return HTTP 200').toBe(200);

        const updatedProduct = await response.json();
        expect(updatedProduct.id).toBe(PRODUCT_ID);
        expect(updatedProduct).toMatchObject(updatePayload);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a product should return HTTP 200').toBe(200);

        const deletedProduct = await response.json();
        expect(deletedProduct.id, 'The response should identify the requested product').toBe(PRODUCT_ID);
    });
});