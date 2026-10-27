import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('Customer registration through shopping cart journey @master @regression @end-to-end @web', async ({ homePage, registerPage, loginPage, logoutPage, searchResultsPage, productPage, cartPage }) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail(),
        password: RandomDataUtil.getPassword(14),
    };
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step('1) Register a new customer', async () => {
        await homePage.navigateToRegistration();
        expect(await registerPage.isRegisterPageExists()).toBeTruthy();
        await registerPage.completeRegistration(customer);
        await registerPage.waitForAccountCreatedConfirmation();
        expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
    });

    await test.step('2) Log out and log back in with the new customer credentials', async () => {
        await homePage.logout();
        expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
        await logoutPage.continueToHome();
        expect(await homePage.isLoggedOutAccountNavigationVisible()).toBeTruthy();

        await homePage.navigateToLogin();
        await loginPage.login({ email: customer.email, password: customer.password });
        const result = await loginPage.waitForLoginResult();
        expect(result).toBe('success');
        expect(await loginPage.isAccountDashboardVisible()).toBeTruthy();
    });

    await test.step('3) Search for the product and add it to the cart', async () => {
        await homePage.searchForProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsVisible(productName)).toBeTruthy();
        expect(await productPage.getProductPrice()).toBe(totalPrice);
        await productPage.addToCart(productQuantity);
        expect(await productPage.isCartSuccessMessageVisible()).toBeTruthy();
    });

    await test.step('4) Verify the cart product, quantity, price, and total', async () => {
        await productPage.openShoppingCart();
        expect(await cartPage.isCartPageExists()).toBeTruthy();
        const cartProduct = await cartPage.getProductDetails(productName);
        expect(cartProduct.quantity).toBe(productQuantity);
        expect(cartProduct.unitPrice).toBe(totalPrice);
        expect(cartProduct.lineTotal).toBe(totalPrice);
        expect(await cartPage.getCartTotal()).toBe(totalPrice);
    });

    console.log('End-to-end customer shopping journey completed successfully.');
});