import { Locator, Page } from '@playwright/test';

export class LogoutPage {
    private readonly page: Page;

    // Locators
    private readonly logoutHeading: Locator;
    private readonly logoutMessage: Locator;
    private readonly continueLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.logoutHeading = page.getByRole('heading', { name: 'Account Logout' });
        this.logoutMessage = page.getByText('You have been logged off your account.', { exact: false });
        this.continueLink = page.getByRole('link', { name: 'Continue' });
    }

    /**
     * Verifies the logout confirmation page.
     * @returns Promise<boolean> - true when the logout message is visible
     */
    async isLogoutConfirmationVisible(): Promise<boolean> {
        return (await this.logoutHeading.isVisible()) && (await this.logoutMessage.isVisible());
    }

    /**
     * Returns to the home page after logout.
     */
    async continueToHome(): Promise<void> {
        await Promise.all([
            this.page.waitForURL((url) => url.searchParams.get('route') === 'common/home'),
            this.continueLink.click(),
        ]);
    }
}