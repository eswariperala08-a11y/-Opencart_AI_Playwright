import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;

    // Locators
    private readonly cartHeading: Locator;
    private readonly cartTable: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.cartHeading = page.getByRole('heading', { name: /^Shopping Cart/ });
        this.cartTable = page.getByRole('table');
    }

    /**
     * Verifies that the shopping cart page is displayed.
     * @returns Promise<boolean> - true when the cart heading is visible
     */
    async isCartPageExists(): Promise<boolean> {
        return this.cartHeading.isVisible();
    }

    /**
     * Reads the requested product row's quantity, unit price, and line total.
     * @param productName - Exact product name in the cart
     * @returns Promise with the displayed quantity and prices
     */
    async getProductDetails(productName: string): Promise<{ quantity: string; unitPrice: string; lineTotal: string }> {
        const productRow = this.cartTable.getByRole('row').filter({
            has: this.page.getByRole('link', { name: productName, exact: true }),
        });
        const cells = productRow.getByRole('cell');

        return {
            quantity: await productRow.getByRole('textbox').inputValue(),
            unitPrice: (await cells.nth(3).innerText()).trim(),
            lineTotal: (await cells.nth(4).innerText()).trim(),
        };
    }

    /**
     * Reads the cart's grand total row.
     * @returns Promise<string> - Displayed cart total
     */
    async getCartTotal(): Promise<string> {
        const totalRow = this.cartTable.getByRole('row').filter({
            has: this.page.getByText('Total', { exact: true }),
        });
        return (await totalRow.getByRole('cell').nth(1).innerText()).trim();
    }
}