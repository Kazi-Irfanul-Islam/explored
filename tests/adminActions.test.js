const { Builder, By, until } = require('selenium-webdriver');
const { PrismaClient } = require('@prisma/client');
require('chromedriver');

const prisma = new PrismaClient();

describe('Admin Dashboard Actions Test', function () {
    this.timeout(70000); // 70 seconds
    let driver;

    const dummyMessageSubject = `Dummy Subject ${Date.now()}`;
    const dummyUsername = `dummy_user_${Date.now()}`;
    
    let dummyMessageId = null;
    let dummyUserId = null;

    before(async function () {
        console.log('\n      [Database] Injecting dummy message and user into database for testing...');
        
        // Create dummy contact message
        const newMsg = await prisma.contact_messages.create({
            data: {
                name: 'Selenium Tester',
                email: 'selenium@example.com',
                subject: dummyMessageSubject,
                message: 'This is a fake message to test the admin delete functionality.'
            }
        });
        dummyMessageId = newMsg.id;

        // Create dummy user
        const newUser = await prisma.users.create({
            data: {
                username: dummyUsername,
                password: 'fake_password',
                role: 'user'
            }
        });
        dummyUserId = newUser.id;

        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
        
        console.log('\n      [Database] Cleaning up... (Just in case the test failed to delete them)');
        try {
            await prisma.contact_messages.delete({ where: { id: dummyMessageId } });
        } catch (e) { /* Ignore if already deleted by the test */ }
        
        try {
            await prisma.users.delete({ where: { id: dummyUserId } });
        } catch (e) { /* Ignore if already deleted by the test */ }
        
        await prisma.$disconnect();
    });

    it('should allow Admin to successfully DELETE a contact message and a user', async function () {
        // 1. Log in as Admin
        console.log('      [Testing] Logging in as Admin (antor)...');
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys('antor');
        await driver.findElement(By.name('password')).sendKeys('dev');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        // ==========================================
        // TEST 1: DELETE MESSAGE
        // ==========================================
        console.log('\n      [Testing] Navigating to /admin/messages...');
        await driver.get('http://localhost:3000/admin/messages');
        await driver.sleep(3000);

        // Find the block containing our dummy subject
        console.log('      [Testing] Searching for the dummy message and clicking Delete...');
        // We use XPath to find the h3 containing our subject, then go up to its container to find the delete button
        const messageContainer = await driver.findElement(By.xpath(`//h3[contains(text(), '${dummyMessageSubject}')]/ancestor::div[contains(@class, 'glass-card')]`));
        
        const deleteMsgBtn = await messageContainer.findElement(By.css('button[type="submit"]'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", deleteMsgBtn);
        await driver.sleep(1000);
        await deleteMsgBtn.click();
        
        // Wait for page to reload/update
        await driver.sleep(3000);

        // Verify it's gone
        console.log('      [Testing] Verifying the message was removed from the UI...');
        const pageTextMsg = await driver.findElement(By.css('body')).getText();
        if (pageTextMsg.includes(dummyMessageSubject)) {
            throw new Error("Test Failed: The dummy message was still visible after deleting!");
        }
        console.log('      [Success] Message deleted successfully!');

        // ==========================================
        // TEST 2: DELETE USER
        // ==========================================
        console.log('\n      [Testing] Navigating to /admin/users...');
        await driver.get('http://localhost:3000/admin/users');
        await driver.sleep(3000);

        console.log('      [Testing] Searching for the dummy user and clicking Delete...');
        // Find the tr containing our dummy username, then find the submit button inside that row
        const userRow = await driver.findElement(By.xpath(`//td[contains(text(), '${dummyUsername}')]/ancestor::tr`));
        
        const deleteUserBtn = await userRow.findElement(By.css('button[type="submit"]'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", deleteUserBtn);
        await driver.sleep(1000);
        await deleteUserBtn.click();

        // Wait for page to reload/update
        await driver.sleep(3000);

        // Verify it's gone
        console.log('      [Testing] Verifying the user was removed from the UI...');
        const pageTextUser = await driver.findElement(By.css('body')).getText();
        if (pageTextUser.includes(dummyUsername)) {
            throw new Error("Test Failed: The dummy user was still visible after deleting!");
        }
        console.log('      [Success] User deleted successfully!');
    });
});
