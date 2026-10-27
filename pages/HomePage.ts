import { Locator, Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly myAccountButton: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;
    private readonly logoutLink: Locator;
    private readonly searchField: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.myAccountButton = page.getByRole('button', { name: 'My Account' });
        this.registerLink = page.getByRole('link', { name: 'Register' });
        this.loginLink = page.locator('#top').getByRole('link', { name: 'Login' });
        this.logoutLink = page.locator('#top').getByRole('link', { name: 'Logout' });
        this.searchField = page.getByRole('textbox', { name: 'Search' });
    }

    /**
     * Opens the My Account menu and navigates to registration.
     */
    async navigateToRegistration(): Promise<void> {
        try {
            await this.myAccountButton.click();
            await this.registerLink.click();
        } catch (error) {
            console.log(`Unable to open the registration page: ${error}`);
            throw error;
        }
    }

    /**
     * Opens the My Account menu and navigates to login.
     */
    async navigateToLogin(): Promise<void> {
        if (!(await this.loginLink.isVisible())) {
            await this.myAccountButton.click();
        }
        await this.loginLink.click();
    }

    /**
     * Searches the store for a product by name.
     * @param productName - Product name to search for
     */
    async searchForProduct(productName: string): Promise<void> {
        await this.searchField.fill(productName);
        await this.searchField.press('Enter');
    }

    /**
     * Opens the header account menu and follows its Logout option.
     */
    async logout(): Promise<void> {
        await this.myAccountButton.click();
        await this.logoutLink.click();
    }

    /**
     * Opens the account menu and checks whether authenticated navigation is available.
     * @returns Promise<boolean> - true when the Logout option is visible
     */
    async isAuthenticatedAccountNavigationVisible(): Promise<boolean> {
        await this.myAccountButton.click();
        return this.logoutLink.isVisible();
    }

    /**
     * Verifies that the header account menu no longer offers Logout.
     * @returns Promise<boolean> - true when Login is available and Logout is not
     */
    async isLoggedOutAccountNavigationVisible(): Promise<boolean> {
        await this.myAccountButton.click();
        return (await this.loginLink.isVisible()) && !(await this.logoutLink.isVisible());
    }
}