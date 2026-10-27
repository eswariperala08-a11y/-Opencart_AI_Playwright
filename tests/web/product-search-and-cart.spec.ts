import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Search for a known product @master @sanity @regression @web', async ({ homePage, searchResultsPage }) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Search for the configured product', async () => {
        await homePage.searchForProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
    });

    console.log('Product search returned the expected product.');
});

test('Add a product to the cart @master @sanity @regression @web', async ({ homePage, searchResultsPage, productPage, cartPage }) => {
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step('1) Search for the product and open its details', async () => {
        await homePage.searchForProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsVisible(productName)).toBeTruthy();
        expect(await productPage.getProductPrice()).toBe(totalPrice);
    });

    await test.step('2) Add the requested quantity to the cart', async () => {
        await productPage.addToCart(productQuantity);
        expect(await productPage.isCartSuccessMessageVisible()).toBeTruthy();
        await productPage.openShoppingCart();
        expect(await cartPage.isCartPageExists()).toBeTruthy();
    });

    await test.step('3) Verify product, quantity, price, and cart total', async () => {
        const cartProduct = await cartPage.getProductDetails(productName);
        expect(cartProduct.quantity).toBe(productQuantity);
        expect(cartProduct.unitPrice).toBe(totalPrice);
        expect(cartProduct.lineTotal).toBe(totalPrice);
        expect(await cartPage.getCartTotal()).toBe(totalPrice);
    });

    console.log('Product was added to the cart with the expected quantity and total.');
});