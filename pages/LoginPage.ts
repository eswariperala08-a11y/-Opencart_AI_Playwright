import { Locator, Page } from '@playwright/test';

export type LoginCredentials = {
    email: string;
    password: string;
};

export class LoginPage {
    private readonly page: Page;

    // Locators
    private readonly loginHeading: Locator;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly loginButton: Locator;
    private readonly loginWarning: Locator;
    private readonly accountHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.loginHeading = page.getByRole('heading', { name: 'Returning Customer' });
        this.emailField = page.getByPlaceholder('E-Mail Address');
        this.passwordField = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.loginWarning = page.locator('#alert .alert');
        this.accountHeading = page.getByRole('main').getByRole('heading', { name: 'My Account', exact: true });
    }

    /**
     * Verifies that the returning-customer login form is displayed.
     * @returns Promise<boolean> - true when its heading is visible
     */
    async isLoginPageExists(): Promise<boolean> {
        return this.loginHeading.isVisible();
    }

    /**
     * Submits login credentials, leaving blank or whitespace-only values empty.
     * @param credentials - Customer email and password
     */
    async login(credentials: LoginCredentials): Promise<void> {
        if (credentials.email.trim()) {
            await this.emailField.fill(credentials.email);
        }
        if (credentials.password.trim()) {
            await this.passwordField.fill(credentials.password);
        }
        await this.loginButton.click();
    }

    /**
     * Waits for the account dashboard after successful authentication.
     */
    async waitForAccountDashboard(): Promise<void> {
        await this.accountHeading.waitFor({ state: 'visible' });
    }

    /**
     * Waits for either the authenticated dashboard or the invalid-login warning.
     * @returns Promise<'success' | 'failure'> - Observed login result
     */
    async waitForLoginResult(): Promise<'success' | 'failure'> {
        await this.accountHeading.or(this.loginWarning).waitFor({ state: 'visible' });
        return (await this.accountHeading.isVisible()) ? 'success' : 'failure';
    }

    /**
     * Verifies the account dashboard is displayed after login.
     * @returns Promise<boolean> - true when the account heading is visible
     */
    async isAccountDashboardVisible(): Promise<boolean> {
        return this.accountHeading.isVisible();
    }

    /**
     * Waits for the OpenCart invalid-login warning.
     */
    async waitForInvalidLoginWarning(): Promise<void> {
        await this.loginWarning.waitFor({ state: 'visible' });
    }

    /**
     * Verifies that OpenCart rejected the login attempt.
     * @returns Promise<boolean> - true when the warning is visible
     */
    async isInvalidLoginWarningVisible(): Promise<boolean> {
        return this.loginWarning.isVisible();
    }

    /**
     * Reads the current OpenCart login failure message.
     * @returns Promise<string> - Visible login alert text
     */
    async getLoginWarningText(): Promise<string> {
        return (await this.loginWarning.innerText()).trim();
    }

    /**
     * Reads the current login form values for blank-input validation checks.
     * @returns Promise with the displayed email and password values
     */
    async getLoginFormValues(): Promise<{ email: string; password: string }> {
        return {
            email: await this.emailField.inputValue(),
            password: await this.passwordField.inputValue(),
        };
    }
}