import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Customer registration succeeds @master @sanity @regression @web', async ({ homePage, registerPage }) => {
    const registrationData = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail(),
        password: RandomDataUtil.getPassword(14),
    };

    await test.step('1) Open My Account and navigate to Register', async () => {
        await homePage.navigateToRegistration();
        expect(await registerPage.isRegisterPageExists()).toBeTruthy();
    });

    await test.step('2) Submit valid customer details and accept the Privacy Policy', async () => {
        await registerPage.completeRegistration(registrationData);
    });

    await test.step('3) Verify account creation and authenticated account navigation', async () => {
        await registerPage.waitForAccountCreatedConfirmation();
        expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
        await registerPage.openAccountFromConfirmation();
        await registerPage.waitForAccountDashboard();
        expect(await registerPage.isAccountDashboardVisible()).toBeTruthy();
        expect(await homePage.isAuthenticatedAccountNavigationVisible()).toBeTruthy();
    });

    console.log('Customer registration completed successfully.');
});