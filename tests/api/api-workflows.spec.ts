import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);

const PRODUCT_PAYLOAD = {
    title: 'Playwright CRUD Workflow Product',
    price: 29.99,
    description: 'Deterministic product payload for the CRUD workflow',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
    category: 'electronics',
};

const USER_PAYLOAD = {
    email: 'workflow.user@example.com',
    username: 'playwright-workflow-user',
    password: 'DeterministicWorkflowPassword1',
    name: { firstname: 'Workflow', lastname: 'User' },
    address: {
        city: 'Workflow City',
        street: 'Workflow Street',
        number: 20,
        zipcode: '20000',
        geolocation: { lat: '1', long: '1' },
    },
    phone: '555-0200',
};

const CART_PAYLOAD = {
    userId: USER_ID,
    date: '2020-02-15',
    products: [{ productId: 1, quantity: 2 }],
};

test.describe('FakeStore CRUD Workflows', () => {
    test('POST → PUT → DELETE product workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_PAYLOAD });
        expect(createResponse.status(), 'Product creation should return HTTP 201').toBe(201);
        const createdProduct = await createResponse.json();
        expect(createdProduct.id, 'The created product ID is required for subsequent operations').toBeTruthy();

        const updatePayload = { ...PRODUCT_PAYLOAD, title: 'Updated CRUD Workflow Product' };
        const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
        expect(updateResponse.status(), 'Product update should return HTTP 200').toBe(200);
        const updatedProduct = await updateResponse.json();
        expect(updatedProduct.id).toBe(createdProduct.id);
        expect(updatedProduct).toMatchObject(updatePayload);

        const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Product deletion should return HTTP 200').toBe(200);
    });

    test('POST → PUT → DELETE user workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_PAYLOAD });
        expect(createResponse.status(), 'User creation should return HTTP 201').toBe(201);
        const createdUser = await createResponse.json();
        expect(createdUser.id, 'The created user ID is required for subsequent operations').toBeTruthy();

        const updatePayload = { username: 'updated-playwright-workflow-user', email: 'updated-workflow.user@example.com' };
        const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
        expect(updateResponse.status(), 'User update should return HTTP 200').toBe(200);
        expect(await updateResponse.json()).toMatchObject(updatePayload);

        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'User deletion should return HTTP 200').toBe(200);
    });

    test('POST → PUT → DELETE cart workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_PAYLOAD });
        expect(createResponse.status(), 'Cart creation should return HTTP 201').toBe(201);
        const createdCart = await createResponse.json();
        expect(createdCart.id, 'The created cart ID is required for subsequent operations').toBeTruthy();
        expect(createdCart.userId).toBe(CART_PAYLOAD.userId);
        expect(createdCart.products).toEqual(CART_PAYLOAD.products);

        const updatePayload = { ...CART_PAYLOAD, products: [{ productId: 1, quantity: 7 }] };
        const updateRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
        expect(updateResponse.status(), 'Cart update should return HTTP 200').toBe(200);
        const updatedCart = await updateResponse.json();
        expect(updatedCart.id).toBe(createdCart.id);
        expect(updatedCart.products).toEqual(updatePayload.products);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Cart deletion should return HTTP 200').toBe(200);
    });
});