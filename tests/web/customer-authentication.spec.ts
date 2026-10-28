import path from 'node:path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

type LoginDataRow = {
    testName: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

type LoginDataSource = {
    format: 'json' | 'csv' | 'xlsx';
    rows: LoginDataRow[];
};

const dataDirectory = path.resolve(process.cwd(), 'testdata');
const excelRows = DataProvider.readExcel(path.join(dataDirectory, 'opencart_logindata.xlsx')) as unknown[][];
const excelHeaders = (excelRows[0] ?? []).map((header) => String(header).toLowerCase());
const excelData = excelRows.slice(1).map((row) => Object.fromEntries(
    excelHeaders.map((header, column) => [header === 'testname' ? 'testName' : header, String(row[column] ?? '')]),
)) as LoginDataRow[];

const loginDataSources: LoginDataSource[] = [
    {
        format: 'json',
        rows: DataProvider.readJson(path.join(dataDirectory, 'opencart_logindata.json')) as LoginDataRow[],
    },
    {
        format: 'csv',
        rows: DataProvider.readCsv(path.join(dataDirectory, 'opencart_logindata.csv')) as LoginDataRow[],
    },
    {
        format: 'xlsx',
        rows: excelData,
    },
];
const loginData = loginDataSources.flatMap((source) => source.rows);
//console.log("login data :", loginData);
const invalidLoginData = loginData.find((row) => row.expected === 'failure' && row.email.trim() && row.password.trim());

if (!invalidLoginData) {
    throw new Error('The login dataset must include a nonblank failure case.');
}

test('Valid customer login @master @sanity @regression @web', async ({ homePage, loginPage }) => {
    const credentials = Helper.getLoginDetails();
console.log("credentials :", credentials);
    await test.step('1) Navigate to My Account login', async () => {
        await homePage.navigateToLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit configured valid customer credentials', async () => {
        await loginPage.login(credentials);
        const result = await loginPage.waitForLoginResult();
        expect(result).toBe('success');
        expect(await loginPage.isAccountDashboardVisible()).toBeTruthy();
        expect(await homePage.isAuthenticatedAccountNavigationVisible()).toBeTruthy();
    });

    console.log('Valid customer login completed successfully.');
});

test('Invalid customer login is rejected @master @sanity @regression @web', async ({ homePage, loginPage }) => {
    await test.step('1) Navigate to My Account login', async () => {
        await homePage.navigateToLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit invalid customer credentials', async () => {
        await loginPage.login(invalidLoginData);
        const result = await loginPage.waitForLoginResult();
        expect(result).toBe('failure');
        expect(await loginPage.isInvalidLoginWarningVisible()).toBeTruthy();
        expect(await loginPage.getLoginWarningText()).toMatch(/Warning: No match for E-Mail Address and\/or Password\.|Warning: Your account has exceeded allowed number of login attempts\./);
        expect(await loginPage.isAccountDashboardVisible()).toBeFalsy();
        expect(await homePage.isLoggedOutAccountNavigationVisible()).toBeTruthy();
    });

    console.log('Invalid customer login was rejected as expected.');
});

test('Customer logout @master @sanity @regression @web', async ({ homePage, loginPage, logoutPage, registerPage }) => {
    const credentials = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail(),
        password: RandomDataUtil.getPassword(14),
    };

    await test.step('1) Create a customer and authenticate with its valid credentials', async () => {
        await homePage.navigateToRegistration();
        await registerPage.completeRegistration(credentials);
        await registerPage.waitForAccountCreatedConfirmation();
        await homePage.logout();
        await logoutPage.continueToHome();
        await homePage.navigateToLogin();
        await loginPage.login({ email: credentials.email, password: credentials.password });
        const result = await loginPage.waitForLoginResult();
        expect(result).toBe('success');
        expect(await loginPage.isAccountDashboardVisible()).toBeTruthy();
    });

    await test.step('2) Log out and verify the confirmation page', async () => {
        await homePage.logout();
        expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    });

    await test.step('3) Continue to the homepage and verify authenticated options are absent', async () => {
        await logoutPage.continueToHome();
        expect(await homePage.isLoggedOutAccountNavigationVisible()).toBeTruthy();
    });

    console.log('Customer logout completed successfully.');
});

for (const source of loginDataSources) {
    for (const [index, row] of source.rows.entries()) {
        test(`Data-driven login (${source.format}): ${row.testName} row ${index + 1} @master @regression @datadriven @web`, async ({ homePage, loginPage }) => {
            await test.step('1) Open the login page', async () => {
                await homePage.navigateToLogin();
                expect(await loginPage.isLoginPageExists()).toBeTruthy();
            });

            await test.step('2) Submit the row values and validate the expected result', async () => {
                await loginPage.login({ email: row.email, password: row.password });
                if (row.expected === 'failure' && !row.password.trim() && row.email.trim()) {
                    expect(await loginPage.isLoginPageExists()).toBeTruthy();
                    expect(await loginPage.isAccountDashboardVisible()).toBeFalsy();
                    expect((await loginPage.getLoginFormValues()).password).toBe('');
                } else {
                    const result = await loginPage.waitForLoginResult();
                    expect(result).toBe(row.expected);
                }

                if (row.expected === 'success') {
                    expect(await loginPage.isAccountDashboardVisible()).toBeTruthy();
                } else if (row.password.trim() || !row.email.trim()) {
                    expect(await loginPage.isInvalidLoginWarningVisible()).toBeTruthy();
                    expect(await loginPage.getLoginWarningText()).toMatch(/Warning: No match for E-Mail Address and\/or Password\.|Warning: Your account has exceeded allowed number of login attempts\./);
                    expect(await loginPage.isAccountDashboardVisible()).toBeFalsy();
                }
            });

            console.log(`Data-driven ${source.format} login row ${index + 1} matched its expected result.`);
        });
    }
}