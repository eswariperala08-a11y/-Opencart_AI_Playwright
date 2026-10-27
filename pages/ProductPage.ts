import { Locator, Page } from '@playwright/test';

export class ProductPage {
    private readonly page: Page;

    // Locators
    private readonly productHeading: Locator;
    private readonly quantityField: Locator;
    private readonly productPrice: Locator;
    private readonly addToCartButton: Locator;
    private readonly cartSuccessMessage: Locator;
    private readonly shoppingCartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.productHeading = page.getByRole('heading', { level: 1 });
        this.quantityField = page.locator('#input-quantity');
        this.productPrice = page.getByRole('main').getByRole('heading', { level: 2 });
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
        this.cartSuccessMessage = page.getByText('Success: You have added', { exact: false });
        this.shoppingCartLink = page.getByRole('link', { name: 'shopping cart', exact: true });
    }

    /**
     * Verifies that the expected product details are displayed.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when the product heading matches
     */
    async isProductDetailsVisible(productName: string): Promise<boolean> {
        return this.productHeading.getByText(productName, { exact: true }).isVisible();
    }

    /**
     * Reads the displayed product price.
     * @returns Promise<string> - Product price text
     */
    async getProductPrice(): Promise<string> {
        return (await this.productPrice.innerText()).trim();
    }

    /**
     * Sets the product quantity and adds it to the cart.
     * @param quantity - Quantity to add
     */
    async addToCart(quantity: string): Promise<void> {
        await this.quantityField.fill(quantity);
        await this.addToCartButton.click();
        await this.cartSuccessMessage.waitFor({ state: 'visible' });
    }

    /**
     * Verifies OpenCart's add-to-cart success notification.
     * @returns Promise<boolean> - true when the notification is visible
     */
    async isCartSuccessMessageVisible(): Promise<boolean> {
        return this.cartSuccessMessage.isVisible();
    }

    /**
     * Opens the cart from the add-to-cart notification.
     */
    async openShoppingCart(): Promise<void> {
        await this.shoppingCartLink.click();
    }
}