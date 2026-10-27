import { Locator, Page } from '@playwright/test';

export type RegistrationData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export class RegisterPage {
    private readonly page: Page;

    // Locators
    private readonly registerHeading: Locator;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;
    private readonly accountCreatedHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with selectors verified in the live application
        this.registerHeading = page.getByRole('heading', { name: 'Register Account' });
        this.firstNameField = page.getByPlaceholder('First Name');
        this.lastNameField = page.getByPlaceholder('Last Name');
        this.emailField = page.getByPlaceholder('E-Mail');
        this.passwordField = page.getByPlaceholder('Password');
        this.privacyPolicyCheckbox = page.locator('[name="agree"]');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.accountCreatedHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!' });
    }

    /**
     * Verifies that the registration page is displayed.
     * @returns Promise<boolean> - true when the registration heading is visible
     */
    async isRegisterPageExists(): Promise<boolean> {
        return this.registerHeading.isVisible();
    }

    /**
     * Completes and submits the registration fields supported by the live application.
     * @param registrationData - Generated customer details
     */
    async completeRegistration(registrationData: RegistrationData): Promise<void> {
        try {
            await this.firstNameField.fill(registrationData.firstName);
            await this.lastNameField.fill(registrationData.lastName);
            await this.emailField.fill(registrationData.email);
            await this.passwordField.fill(registrationData.password);
            await this.privacyPolicyCheckbox.check();
            await this.continueButton.click();
        } catch (error) {
            console.log(`Unable to complete customer registration: ${error}`);
            throw error;
        }
    }

    /**
     * Verifies the account-created confirmation.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isAccountCreatedConfirmationVisible(): Promise<boolean> {
        return this.accountCreatedHeading.isVisible();
    }

    /**
     * Waits for OpenCart to finish the registration request and display its confirmation.
     */
    async waitForAccountCreatedConfirmation(): Promise<void> {
        await this.accountCreatedHeading.waitFor({ state: 'visible' });
    }

    /**
     * Verifies the account page route after following the success-page account link.
     * @returns Promise<boolean> - true when the account dashboard heading is visible
     */
    async isAccountDashboardVisible(): Promise<boolean> {
        return this.page.getByRole('main').getByRole('heading', { name: 'My Account', exact: true }).isVisible();
    }

    /**
     * Waits for the authenticated account dashboard to render.
     */
    async waitForAccountDashboard(): Promise<void> {
        await this.page.getByRole('main').getByRole('heading', { name: 'My Account', exact: true }).waitFor({ state: 'visible' });
    }

    /**
     * Follows the success-page link to the newly created customer's account dashboard.
     */
    async openAccountFromConfirmation(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue' }).click();
    }
}