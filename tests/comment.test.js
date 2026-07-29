const { Builder, By, until } = require('selenium-webdriver');
const { PrismaClient } = require('@prisma/client');
require('chromedriver');

const prisma = new PrismaClient();

describe('Commenting Functionality Test', function () {
    this.timeout(50000); // 50 seconds
    let driver;

    const testUsername = 'payel';
    const testPassword = 'dev';
    const uniqueCommentText = `new comment ${Date.now()}`;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();

        console.log('\n      [Database] Cleaning up... deleting the automated comment.');
        await prisma.comments.deleteMany({
            where: { comment: uniqueCommentText }
        });
        await prisma.$disconnect();
    });

    it('should successfully add a comment to a log', async function () {
        console.log('      [Testing] Logging in...');
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys(testUsername);
        await driver.findElement(By.name('password')).sendKeys(testPassword);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        console.log('      [Testing] Opening a travel log...');
        await driver.sleep(2000);
        const firstLog = await driver.findElement(By.css('a.glass-card'));
        await firstLog.click();
        await driver.sleep(4000);

        console.log('      [Testing] Typing comment...');
        const commentBox = await driver.findElement(By.name('comment'));
        await commentBox.sendKeys(uniqueCommentText);
        await driver.sleep(2000);

        console.log('      [Testing] Submitting comment...');
        await driver.findElement(By.xpath('//button[contains(text(), "Post Comment")]')).click();
        await driver.sleep(1500);

        console.log('      [Testing] Verifying comment is visible...');
        const pageText = await driver.findElement(By.css('body')).getText();

        if (!pageText.includes(uniqueCommentText)) {
            throw new Error("Test Failed: The submitted comment did not appear on the screen!");
        }

        console.log('      [Success] Comment was successfully posted and displayed!');
    });
});
