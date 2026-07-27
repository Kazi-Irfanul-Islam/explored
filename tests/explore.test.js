const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Explore Page Search & Sort Test', function () {
    this.timeout(40000); // 40 seconds
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
    });

    it('should search for logs and apply sorting filters', async function () {
        // 1. Go to explore page directly (No login needed!)
        console.log('      [Testing] Navigating to /explore');
        await driver.get('http://localhost:3000/explore');
        await driver.sleep(3000);

        // 2. Test the Search functionality
        console.log('      [Testing] Typing in the search bar...');
        const searchInput = await driver.findElement(By.name('search'));
        await searchInput.sendKeys('Cox');
        await driver.sleep(2000);

        console.log('      [Testing] Clicking Search button...');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Wait for the URL to update with the search query
        await driver.wait(until.urlContains('search=Cox'), 5000);
        await driver.sleep(3000);

        let currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('search=Cox')) {
            throw new Error("Test Failed: Search query was not applied to the URL!");
        }

        // 3. Test the Sorting functionality
        console.log('      [Testing] Changing sort dropdown to Oldest...');
        const sortSelect = await driver.findElement(By.name('sort'));
        await sortSelect.sendKeys('oldest');
        await driver.sleep(2000);

        console.log('      [Testing] Clicking Search button again...');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Wait for the URL to update with the sort parameter
        await driver.wait(until.urlContains('sort=oldest'), 5000);
        await driver.sleep(3000);

        currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('sort=oldest')) {
            throw new Error("Test Failed: Sort filter was not applied to the URL!");
        }

        console.log('      [Success] Search and Sort forms are working perfectly!');
    });
});
