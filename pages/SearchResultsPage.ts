import { Locator, Page } from '@playwright/test';

export class SearchResultsPage {
    private readonly page: Page;

    // Locators
    private readonly resultsHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.resultsHeading = page.getByRole('heading', { name: 'Products meeting the search criteria' });
    }

    /**
     * Verifies that product search results are displayed.
     * @returns Promise<boolean> - true when the results heading is visible
     */
    async isSearchResultsPageExists(): Promise<boolean> {
        return this.resultsHeading.isVisible();
    }

    /**
     * Opens the exact matching product from search results.
     * @param productName - Exact displayed product name
     */
    async openProduct(productName: string): Promise<void> {
        await this.page.getByRole('heading', { level: 4 }).getByRole('link', { name: productName, exact: true }).click();
    }

    /**
     * Verifies an exact product name is present in the search results.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when the product link is visible
     */
    async isProductVisible(productName: string): Promise<boolean> {
        return this.page.getByRole('heading', { level: 4 }).getByRole('link', { name: productName, exact: true }).isVisible();
    }
}