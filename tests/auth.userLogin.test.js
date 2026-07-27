const { Builder, By, until } = require('selenium-webdriver');
const { PrismaClient } = require('@prisma/client');
require('chromedriver');

const prisma = new PrismaClient();

describe('Smart Database-Driven Login Test', function () {
    this.timeout(40000); // 40 seconds
    let driver;

    // 1. Duto test case er data (Ekta DB te ache, arekta nai)
    const testCases = [
        {
            username: 'payel', // Eta real database a ache (Normal User)
            password: 'dev'
        },
        {
            username: 'kaziirfan_fake', // Eta database a nai
            password: 'wrong_password'
        }
    ];

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
        await prisma.$disconnect();
    });

    // Loop through each test case dynamically
    testCases.forEach((testData) => {

        it(`should smartly test login for username: ${testData.username}`, async function () {
            console.log(`\n      [Checking DB for user:] ${testData.username}`);

            // Step 1: Script direct DB theke check korbe user ache kina!
            const userInDb = await prisma.users.findFirst({
                where: { username: testData.username }
            });

            // Step 2: Verdict toiri korbe je login pass hobe naki fail (checking both username AND password)
            let expectedVerdict = 'FAIL';
            let failureReason = '';

            if (!userInDb) {
                failureReason = 'Username not found in DB';
            } else {
                // If username exists, we MUST check the password hash too!
                const bcrypt = require('bcrypt');
                const isPasswordCorrect = await bcrypt.compare(testData.password, userInDb.password);

                if (isPasswordCorrect) {
                    expectedVerdict = 'PASS';
                } else {
                    failureReason = 'Incorrect password for this username';
                }
            }

            if (expectedVerdict === 'PASS') {
                console.log(`      [DB Verdict] Both Username & Password matched! Expecting login to PASS.`);
            } else {
                console.log(`      [DB Verdict] ${failureReason}! Expecting login to FAIL.`);
            }

            // Step 3: Ebar Selenium diye test shuru
            await driver.get('http://localhost:3000/login');
            await driver.sleep(1000);

            await driver.findElement(By.name('username')).sendKeys(testData.username);
            await driver.findElement(By.name('password')).sendKeys(testData.password);
            await driver.sleep(1000);

            await driver.findElement(By.css('button[type="submit"]')).click();

            // Step 4: Validate based on our DB Verdict
            if (expectedVerdict === 'PASS') {
                // Jodi DB te theke thake, tahole obbosoi redirect hobe
                await driver.wait(until.urlContains('/explore'), 5000);
                await driver.sleep(1500);

                const currentUrl = await driver.getCurrentUrl();
                if (!currentUrl.includes('/explore')) {
                    throw new Error("Test Failed: User was in DB, but login failed!");
                }
            }
            else if (expectedVerdict === 'FAIL') {
                // Jodi DB te na theke thake, tahole obbosoi red error ashte hobe
                await driver.wait(until.elementLocated(By.xpath('//div[contains(text(), "Invalid username or password")]')), 5000);
                await driver.sleep(1500);

                const currentUrl = await driver.getCurrentUrl();
                if (currentUrl.includes('/explore')) {
                    throw new Error("Security Alert: User was NOT in DB, but login somehow passed!");
                }
            }
        });
    });
});
