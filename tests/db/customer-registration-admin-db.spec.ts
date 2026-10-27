import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';

type CustomerRow = {
    firstname: string;
    lastname: string;
    email: string;
    status: number;
    date_added: Date | string;
};

test('Register customer and verify Admin and MySQL records @master @regression @db @end-to-end', async ({
    homePage,
    registerPage,
    adminCustomersPage,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail().toLowerCase(),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(14),
        passwordConfirmation: '',
    };
    customer.passwordConfirmation = customer.password;

    await test.step('1) Register a unique customer through the frontend', async () => {
        await homePage.navigateToRegistration();
        expect(await registerPage.isRegisterPageExists(), 'The Register Account page should be displayed').toBeTruthy();
        await registerPage.completeRegistration(customer);
        await registerPage.waitForAccountCreatedConfirmation();
        expect(await registerPage.isAccountCreatedConfirmationVisible(), 'OpenCart should confirm account creation').toBeTruthy();
    });

    await test.step('2) Find and validate the customer in the Admin Portal', async () => {
        const adminUrl = process.env.ADMIN_APP_URL;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        expect(adminUrl, 'ADMIN_APP_URL must be configured').toBeTruthy();
        expect(adminUsername, 'ADMIN_USERNAME must be configured').toBeTruthy();
        expect(adminPassword, 'ADMIN_PASSWORD must be configured').toBeTruthy();

        await adminCustomersPage.login(adminUrl!, adminUsername!, adminPassword!);
        await adminCustomersPage.openCustomers();
        expect(await adminCustomersPage.searchByEmail(customer.email), 'Exactly one Admin customer should match the new email').toBe(1);
        await adminCustomersPage.openCustomerDetails(customer.email);

        const adminCustomer = await adminCustomersPage.getCustomerDetails();
        expect(adminCustomer.firstName, 'Admin first name should match the registered customer').toBe(customer.firstName);
        expect(adminCustomer.lastName, 'Admin last name should match the registered customer').toBe(customer.lastName);
        expect(adminCustomer.email, 'Admin email should match the registered customer').toBe(customer.email);
        expect(adminCustomer.statusEnabled, 'Newly registered customer should be enabled in Admin').toBeTruthy();
    });

    await test.step('3) Validate the customer record in MySQL', async () => {
        const customerRows = await executeQuery(
            'SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?',
            [customer.email],
        ) as CustomerRow[];

        expect(customerRows, 'Exactly one database record should match the registered email').toHaveLength(1);
        expect(customerRows[0].firstname, 'Database first name should match the registered customer').toBe(customer.firstName);
        expect(customerRows[0].lastname, 'Database last name should match the registered customer').toBe(customer.lastName);
        expect(customerRows[0].email, 'Database email should match the registered customer').toBe(customer.email);
        expect(customerRows[0].status, 'Database customer status should be enabled').toBe(1);
        expect(customerRows[0].date_added, 'Database date_added should be populated').toBeTruthy();
    });

    console.log('Customer registration was verified in the storefront, Admin Portal, and MySQL.');
});