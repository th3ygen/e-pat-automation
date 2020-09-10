const cliProgress = require('cli-progress');
const Snippet = require('../lib/snippet');
const { Builder, By, Key, until, Keys } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')

const { automateLogin, credential, rating, comment } = require('../config.json');

const start = async (input, output) => {
    const loading = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://community.ump.edu.my/ecommstaff/login_eccom/');

    Snippet.log('success', 'Status', 'logging in...');
    output({
        type: 'done',
        val: 'Waiting for user authentication...'
    });

    if (automateLogin) {
        const usernameForm = await driver.findElement(By.id('form-username'));
        usernameForm.sendKeys(credential.username);
    
        const passwordForm = await driver.findElement(By.id('form-password'));
        passwordForm.sendKeys(credential.password);
    
        const lvlForm = await driver.findElement(By.id('lvl'));
        lvlForm.click();
        lvlForm.sendKeys('s');
        lvlForm.click();
    
        const submitBtn = await driver.findElement(By.id('js-btn'));
        submitBtn.click();
    }

    await driver.wait(until.urlContains('https://std-comm.ump.edu.my/ecommstudent/home.jsp'));

    Snippet.log('success', 'Status', 'logged in');
    Snippet.log('success', 'Status', 'navigating to E-PAT form page...');
    output({
        type: 'done',
        val: 'Logged in!'
    });

    await driver.get('https://std-comm.ump.edu.my/ecommstudent/epat2.jsp');
    
    Snippet.log('success', 'Status', 'collecting...');
    output({
        type: 'loading',
        val: 'Collecting...'
    });

    const addBtns = await driver.findElements(By.xpath("//a[contains(@href, 'epat2.jsp?action=lecturer_add')]"));
    const btnCount = addBtns.length;

    Snippet.log('success', 'Status', 'total form: ' + btnCount);
    output({
        type: 'done',
        val: `Found ${btnCount} forms!`
    });

    await Snippet.sleep(1000);

    loading.start(btnCount, 0);
    output({
        type: 'progress',
        val: 'start.' + btnCount
    });
    for (let i = 0; i < btnCount; i++) {
        output({
            type: 'loading',
            val: 'Automating form #' + (i + 1) + '...'
        });
        const currBtns = await driver.findElements(By.xpath("//a[contains(@href, 'epat2.jsp?action=lecturer_add')]"));

        await currBtns[i].click();

        let rateBtns = [];
        let levels = [];
        let x = 1;
        do {
            rateBtns = await driver.findElements(By.xpath(`//img[contains(@id, 'tick_img_') and contains(@id, 'mark${x++}')]`));
            
            let res = [];
            for await (const btn of rateBtns) {
                const id = await btn.getAttribute('id');
                const no = parseInt(id.split('mark')[1]);

                if (no === x - 1) {
                    res.push(btn);
                }
            }

            if (res.length === 5) {
                levels.push(res);
            }
            
        } while (rateBtns.length > 0);

        // rate
        for (const level of levels) {
            const val = Math.round(Snippet.rnd(input.rating.min, input.rating.max));

            await level[val - 1].click();
        }

        // comment
        const textareas = await driver.findElements(By.xpath('//textarea[@name="answer4"]'));
        const commentOrder = ['suggestion', 'dislike', 'like'];

        x = 0;
        for (const textarea of textareas) {
            await textarea.clear();
            await textarea.sendKeys(comment[commentOrder[x]][Math.round(Snippet.rnd(0, comment[commentOrder[x]].length - 1))])
            x++;
        }

        // submit
        const submitBtn = await driver.findElement(By.xpath('//input[@onclick="return ValidateFields()"]'));

        await submitBtn.click();

        output({
            type: 'done',
            val: 'Automating form #' + (i + 1) + '... Done!'
        });

        await driver.get('https://std-comm.ump.edu.my/ecommstudent/epat2.jsp');
    
        loading.increment();
        output({
            type: 'progress',
            val: 'increment.'
        });
    }
    output({
        type: 'progress',
        val: 'stop.'
    });
    loading.stop();
   

    Snippet.log('success', 'Status', 'done!');
    output({
        type: 'final',
        val: 'Automation complete! Consider checking the form before submiting'
    });
    Snippet.log('', 'Message', 'consider checking the evaluation form before submiting, have a nice day!');
};

module.exports = {
    start
}


