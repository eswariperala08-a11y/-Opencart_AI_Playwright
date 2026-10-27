import { Locator, Page } from '@playwright/test';

export type AdminCustomerDetails = {
    firstName: string;
    lastName: string;
    email: string;
    statusEnabled: boolean;
};

export class AdminCustomersPage {
    private readonly page: Page;

    // Locators
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;
    private readonly loginButton: Locator;
    private readonly dashboardHeading: Locator;
    private readonly securityModal: Locator;
    private readonly customersMenu: Locator;
    private readonly customersListLink: Locator;
    private readonly customerEmailFilter: Locator;
    private readonly filterButton: Locator;
    private readonly customerRows: Locator;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly statusCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with controls verified in the live Admin Portal
        this.usernameField = page.getByRole('textbox', { name: 'Username' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
        this.securityModal = page.locator('#modal-security');
        this.customersMenu = page.locator('a[href="#collapse-6"]');
        this.customersListLink = page.locator('#collapse-6 a[href*="route=customer/customer&"]');
        this.customerEmailFilter = page.getByPlaceholder('E-Mail');
        this.filterButton = page.getByRole('button', { name: 'Filter' });
        this.customerRows = page.locator('#form-customer tbody tr');
        this.firstNameField = page.locator('#input-firstname');
        this.lastNameField = page.locator('#input-lastname');
        this.emailField = page.locator('#input-email');
        this.statusCheckbox = page.locator('#input-status');
    }

    /**
     * Opens the Admin Portal and signs in with environment-configured credentials.
     * @param adminUrl - Admin Portal URL
     * @param username - Configured administrator username
     * @param password - Configured administrator password
     */
    async login(adminUrl: string, username: string, password: string): Promise<void> {
        await this.page.goto(adminUrl);
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
        await this.dashboardHeading.waitFor({ state: 'visible' });

        if (await this.securityModal.isVisible()) {
            await this.securityModal.getByRole('button').first().click();
        }
    }

    /**
     * Opens the customer listing from the Admin Portal sidebar.
     */
    async openCustomers(): Promise<void> {
        if (await this.securityModal.isVisible()) {
            await this.securityModal.getByRole('button').first().click();
        }
        if (!(await this.customersListLink.isVisible())) {
            await this.customersMenu.click();
        }
        await this.customersListLink.click();
        await this.page.getByRole('heading', { name: 'Customers', exact: true }).waitFor({ state: 'visible' });
    }

    /**
     * Filters the customer listing by unique email and returns the exact match count.
     * @param email - Registered customer email
     * @returns Promise<number> - Number of rows matching the email
     */
    async searchByEmail(email: string): Promise<number> {
        await this.customerEmailFilter.fill(email);
        await this.filterButton.click();
        const matchingRows = this.customerRows.filter({ hasText: email });
        await matchingRows.first().waitFor({ state: 'visible' });
        return matchingRows.count();
    }

    /**
     * Opens the edit form for the customer identified by email.
     * @param email - Registered customer email
     */
    async openCustomerDetails(email: string): Promise<void> {
        const customerRow = this.customerRows.filter({ hasText: email });
        await customerRow.locator('a[title="Edit"]').click();
        await this.firstNameField.waitFor({ state: 'visible' });
    }

    /**
     * Reads customer identity and enabled status from the admin edit form.
     * @returns Promise<AdminCustomerDetails> - Customer values displayed by Admin
     */
    async getCustomerDetails(): Promise<AdminCustomerDetails> {
        return {
            firstName: await this.firstNameField.inputValue(),
            lastName: await this.lastNameField.inputValue(),
            email: await this.emailField.inputValue(),
            statusEnabled: await this.statusCheckbox.isChecked(),
        };
    }
}