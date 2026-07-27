const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Authentication Flow', function () {
    // Increase timeout so the test doesn't crash while we are waiting
    this.timeout(30000);
    
    let driver;

    // Before the tests start, open a new Chrome browser
    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    // After the tests finish, close the browser
    after(async function () {
        // Wait 3 full seconds at the very end so you can see the result
        await driver.sleep(3000);
        await driver.quit();
    });

    it('should successfully log in as admin', async function () {
        const testUsername = 'antor';
        const testPassword = 'dev';

        console.log('\n      [Testing Admin Login with:]');
        console.log(`      Username : ${testUsername}`);
        console.log(`      Password : ${testPassword}\n`);

        // 1. Go to the Next.js login page
        await driver.get('http://localhost:3000/login');
        
        // SLOW DOWN: Wait 2 seconds to see the blank login page
        await driver.sleep(2000);

        // 2. Find the username and password fields and type the credentials
        await driver.findElement(By.name('username')).sendKeys(testUsername);
        
        // SLOW DOWN: Wait 1 second to see the username typed
        await driver.sleep(1000);
        
        await driver.findElement(By.name('password')).sendKeys(testPassword);
        
        // SLOW DOWN: Wait 1 second to see the password typed
        await driver.sleep(1000);

        // 3. Click the Submit button
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 4. Wait for the browser to redirect to the Explore page
        await driver.wait(until.urlContains('/explore'), 5000);

        // SLOW DOWN: Wait 2 seconds to admire the successful login!
        await driver.sleep(2000);

        // 5. Verify the title of the Explore page is present
        const title = await driver.findElement(By.css('h1')).getText();
        if (!title.includes('Explore')) {
            throw new Error("Login failed or redirect did not happen!");
        }
    });

    it('should fail to log in with incorrect password', async function () {
        const testUsername = 'antor';
        const testPassword = 'wrong_password_123';

        console.log('\n      [Testing Admin Failed Login with:]');
        console.log(`      Username : ${testUsername}`);
        console.log(`      Password : ${testPassword}\n`);

        // 1. Go to the login page again
        await driver.get('http://localhost:3000/login');
        await driver.sleep(1000);

        // 2. Type correct username but WRONG password
        await driver.findElement(By.name('username')).sendKeys(testUsername);
        await driver.findElement(By.name('password')).sendKeys(testPassword);
        await driver.sleep(1000);

        // 3. Click Submit
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 4. Wait for the error message div to appear
        // Our login page renders a div with the text "Invalid username or password" when it fails
        await driver.wait(until.elementLocated(By.xpath('//div[contains(text(), "Invalid username or password")]')), 5000);
        await driver.sleep(2000); // Wait 2 seconds so you can physically see the red error box!

        // 5. Verify we are still on the login page (not redirected to explore)
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/explore')) {
            throw new Error("Test failed: It accidentally let the user in with a wrong password!");
        }
    });
});
