const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Role-Based Access Control (RBAC) Test', function () {
    this.timeout(60000); // 60 seconds
    let driver;

    beforeEach(async function () {
        // Open a fresh browser before each test so cookies are cleared
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterEach(async function () {
        await driver.sleep(2000);
        await driver.quit();
    });

    it('should BLOCK a normal user from accessing the Admin Dashboard', async function () {
        console.log('\n      [Testing] Logging in as Normal User (payel)...');
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys('payel');
        await driver.findElement(By.name('password')).sendKeys('dev');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        console.log('      [Testing] Forcefully trying to visit /admin...');
        // Force the browser to go to the admin page
        await driver.get('http://localhost:3000/admin');
        await driver.sleep(3000);

        const currentUrl = await driver.getCurrentUrl();
        console.log(`      [Result] Browser ended up at: ${currentUrl}`);

        if (currentUrl.includes('/admin')) {
            throw new Error("SECURITY BREACH: A normal user was able to access the admin dashboard!");
        }
        console.log('      [Success] Normal user was safely blocked and redirected!');
    });

    it('should ALLOW an admin to access the Admin Dashboard', async function () {
        console.log('\n      [Testing] Logging in as Admin (antor)...');
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys('antor');
        await driver.findElement(By.name('password')).sendKeys('dev');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        console.log('      [Testing] Visiting /admin...');
        await driver.get('http://localhost:3000/admin');
        await driver.sleep(3000);

        const currentUrl = await driver.getCurrentUrl();
        console.log(`      [Result] Browser ended up at: ${currentUrl}`);

        if (!currentUrl.includes('/admin')) {
            throw new Error("Test Failed: Admin was incorrectly blocked from the admin dashboard!");
        }
        console.log('      [Success] Admin successfully accessed the dashboard!');
    });
});
