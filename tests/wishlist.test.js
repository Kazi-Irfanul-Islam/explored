const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Wishlist Functionality Test', function () {
    this.timeout(50000); // 50 seconds
    let driver;
    
    const testUsername = 'payel';
    const testPassword = 'dev';

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
    });

    it('should add and remove a travel log from the wishlist', async function () {
        // 1. Log in
        console.log('      [Testing] Logging in...');
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('username')).sendKeys(testUsername);
        await driver.findElement(By.name('password')).sendKeys(testPassword);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/explore'), 5000);

        // 2. Go to explore and click the very first log
        console.log('      [Testing] Clicking the first log in explore...');
        await driver.sleep(2000);
        const firstLog = await driver.findElement(By.css('a.glass-card'));
        await firstLog.click();
        await driver.sleep(3000); // Wait for log page to load

        // 3. Find the Add to Wishlist button
        console.log('      [Testing] Toggling Wishlist...');
        const wishlistFormBtn = await driver.findElement(By.xpath('//button[contains(text(), "Wishlist")]'));
        const btnText = await wishlistFormBtn.getText();
        
        // If it's already on the wishlist, remove it first to reset state
        if (btnText.includes('Remove')) {
            await wishlistFormBtn.click();
            await driver.sleep(1500); // Wait for server action to finish
        }

        // Now it should definitely say "Add to Wishlist". Click it!
        const addBtn = await driver.findElement(By.xpath('//button[contains(text(), "Add to Wishlist")]'));
        await driver.sleep(1000);
        await addBtn.click();
        await driver.sleep(3000); // Wait for server action

        // 4. Verify in the Wishlist page
        console.log('      [Testing] Checking if it appears in /wishlist...');
        await driver.get('http://localhost:3000/wishlist');
        await driver.sleep(3000);
        
        // If there is at least one log card on the wishlist page, it worked!
        const wishlistCards = await driver.findElements(By.css('a.glass-card'));
        if (wishlistCards.length === 0) {
            throw new Error("Test Failed: The log was not added to the wishlist page!");
        }

        console.log('      [Success] Log was successfully verified on the wishlist!');
        
        // 5. Cleanup: Go back and remove it so the test can be run again tomorrow
        await wishlistCards[0].click();
        await driver.sleep(2000);
        
        const removeBtn = await driver.findElement(By.xpath('//button[contains(text(), "Remove from Wishlist")]'));
        await removeBtn.click();
        console.log('      [Cleanup] Removed from wishlist to keep database clean.');
    });
});
