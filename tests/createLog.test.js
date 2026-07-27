const { Builder, By, until } = require('selenium-webdriver');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('chromedriver');

const prisma = new PrismaClient();

describe('Travel Log Creation Test', function () {
    this.timeout(50000); // 50 seconds
    let driver;
    
    // Use a REAL user from the database!
    const testUsername = 'payel';
    const testPassword = 'dev';
    const logTitle = `Automated Selenium Trip ${Date.now()}`; // Unique title

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize(); // Maximize window so elements aren't hidden off-screen!
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
        
        console.log('\n      [Database] Cleaning up... deleting the automated travel log.');
        
        // Find the log we created and delete it so the DB stays clean
        const log = await prisma.travel_logs.findFirst({
            where: { title: logTitle }
        });

        if (log) {
            await prisma.travel_logs.delete({ where: { id: log.id } });
        }
        await prisma.$disconnect();
    });

    it('should successfully create a new travel log', async function () {
        // 1. Log in first
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys(testUsername);
        await driver.findElement(By.name('password')).sendKeys(testPassword);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        console.log('      [Testing] Navigating to /create-log');
        // 2. Go to create log page
        await driver.get('http://localhost:3000/create-log');
        await driver.sleep(4000); // 4 seconds for Next.js to fully render

        // 3. Fill the form
        console.log('      [Testing] Filling out the travel log form...');
        const titleField = await driver.findElement(By.name('title'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", titleField);
        await driver.sleep(500);
        await titleField.sendKeys(logTitle);
        await driver.sleep(2000);

        const descField = await driver.findElement(By.css('textarea[name="description"]'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", descField);
        await driver.sleep(500);
        await descField.sendKeys('This is a highly automated test description written entirely by a Selenium Robot! It is testing if the Next.js form submits correctly.');
        await driver.sleep(2000);

        // Select journey type (Using sendKeys is more reliable for native selects in Selenium)
        const select = await driver.findElement(By.name('journey_type'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", select);
        await driver.sleep(500);
        await select.sendKeys('solo');
        await driver.sleep(2000);

        // 4. Submit
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
        await driver.sleep(500);
        await submitBtn.click();
        await driver.sleep(2000);

        // 5. Verify it redirects to the log list or the new log
        await driver.wait(until.urlContains('/logs'), 5000);
        await driver.sleep(1500);
        
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/logs')) {
            throw new Error("Failed to redirect after creating a log!");
        }
        console.log('      [Success] Log created and redirected successfully!');
    });
});
