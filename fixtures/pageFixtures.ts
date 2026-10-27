import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminCustomersPage } from '../pages/AdminCustomersPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

if (!APP_URL) {
    throw new Error('WEB_APP_URL must be configured in the environment.');
}

type PageFixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    logoutPage: LogoutPage;
    registerPage: RegisterPage;
    searchResultsPage: SearchResultsPage;
    productPage: ProductPage;
    cartPage: CartPage;
    adminCustomersPage: AdminCustomersPage;
};

export const test = base.extend<PageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    logoutPage: async ({ page }, use) => {
        await use(new LogoutPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
    searchResultsPage: async ({ page }, use) => {
        await use(new SearchResultsPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    adminCustomersPage: async ({ page }, use) => {
        await use(new AdminCustomersPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }
    await context.close();
});

export { expect };